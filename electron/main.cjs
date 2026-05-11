const { app, BrowserWindow, Tray, Menu, ipcMain, nativeImage, shell } = require("electron");
const { spawn, execFile } = require("node:child_process");
const path = require("node:path");
const fs = require("node:fs");
const os = require("node:os");
const crypto = require("node:crypto");
const https = require("node:https");
const http = require("node:http");
const { URLSearchParams } = require("node:url");

const REPO = path.resolve(__dirname, "..");
const STATE_PATH = path.join(REPO, "src/data/state.json");
const TRAY_ICON = path.join(REPO, "build/icon.iconset/icon_32x32.png");
const APP_ICON = path.join(REPO, "build/icon.icns");
const SPOTIFY_APP_CONFIG = path.join(REPO, "data-sources/spotify/app-config.json");
const SPOTIFY_AUTH_STATUS = path.join(REPO, "data-sources/spotify/auth-status.json");
const SPOTIFY_KEYCHAIN_SERVICE = "AX-L Mania Spotify";
const SPOTIFY_KEYCHAIN_ACCOUNT = "spotify-oauth";

const isDev = !app.isPackaged;
const DEV_URL = process.env.VITE_DEV_URL || "http://localhost:5173";

// In production we serve dist/ from a real http://127.0.0.1 server so embedded
// players (YouTube etc) see an http: origin instead of file:// or app:// — their
// player JS hard-checks location.protocol and rejects anything else (Error 153).
const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js":   "application/javascript; charset=utf-8",
  ".mjs":  "application/javascript; charset=utf-8",
  ".css":  "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".map":  "application/json; charset=utf-8",
  ".svg":  "image/svg+xml",
  ".png":  "image/png",
  ".jpg":  "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif":  "image/gif",
  ".webp": "image/webp",
  ".ico":  "image/x-icon",
  ".woff": "font/woff",
  ".woff2":"font/woff2",
  ".ttf":  "font/ttf",
  ".otf":  "font/otf",
  ".mp3":  "audio/mpeg",
  ".mp4":  "video/mp4"
};

function startProductionServer() {
  return new Promise((resolve, reject) => {
    const distDir = path.join(REPO, "dist");
    const server = http.createServer((req, res) => {
      try {
        const reqUrl = new URL(req.url, "http://127.0.0.1");
        let pathname = decodeURIComponent(reqUrl.pathname);
        if (!pathname || pathname === "/") pathname = "/index.html";
        const filePath = path.normalize(path.join(distDir, pathname));
        if (!filePath.startsWith(distDir)) { res.writeHead(403); res.end(); return; }
        fs.readFile(filePath, (err, data) => {
          if (err) { res.writeHead(404); res.end(); return; }
          const ext = path.extname(filePath).toLowerCase();
          res.writeHead(200, { "content-type": MIME[ext] || "application/octet-stream" });
          res.end(data);
        });
      } catch {
        res.writeHead(500); res.end();
      }
    });
    server.on("error", reject);
    server.listen(0, "127.0.0.1", () => resolve(server.address().port));
  });
}

let prodServerPort = null;

let pendingSpotifyAuth = null;

function logSpotify(message, extra = "") {
  const line = `[spotify] ${message}${extra ? ` ${extra}` : ""}`;
  console.log(line);
  mainWindow?.webContents.send("spotify:auth-log", line);
}

// Register the custom callback scheme. This uses PKCE and never needs a client secret.
if (process.defaultApp && process.argv.length >= 2) {
  app.setAsDefaultProtocolClient("axlmania", process.execPath, [path.resolve(process.argv[1])]);
} else {
  app.setAsDefaultProtocolClient("axlmania");
}

// Dev mode: dock shows generic Electron icon by default. Override.
if (isDev && process.platform === "darwin" && fs.existsSync(APP_ICON)) {
  app.whenReady().then(() => {
    try {
      const dockImg = nativeImage.createFromPath(APP_ICON);
      if (!dockImg.isEmpty()) app.dock?.setIcon(dockImg);
    } catch {}
  });
}

let mainWindow = null;
let tray = null;
let isQuitting = false;

const gotSingleInstanceLock = app.requestSingleInstanceLock();
if (!gotSingleInstanceLock) {
  app.quit();
} else {
  app.on("second-instance", (_event, argv) => {
    const callbackUrl = argv.find((arg) => String(arg).startsWith("axlmania://"));
    if (callbackUrl) handleSpotifyCallback(callbackUrl).catch((err) => mainWindow?.webContents.send("spotify:auth-error", err.message));
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.show();
      mainWindow.focus();
    }
  });
}

function readJSONSafe(file) {
  try { return JSON.parse(fs.readFileSync(file, "utf8")); } catch { return null; }
}

function writeJSONSafe(file, data) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

function base64url(buf) {
  return Buffer.from(buf).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function spotifyConfig() {
  const config = readJSONSafe(SPOTIFY_APP_CONFIG) || {};
  return {
    appName: config.appName || "AX-L Mania Player",
    clientId: config.clientId,
    redirectUri: config.redirectUri || "axlmania://auth-callback",
    scopes: config.scopes || [
      "user-read-playback-state",
      "user-modify-playback-state",
      "user-read-currently-playing",
      "user-read-recently-played",
      "playlist-read-private",
      "playlist-read-collaborative",
      "streaming"
    ]
  };
}

function keychainSetJSON(service, account, payload) {
  return new Promise((resolve, reject) => {
    execFile("/usr/bin/security", ["add-generic-password", "-U", "-s", service, "-a", account, "-w", JSON.stringify(payload)], (err) => {
      if (err) reject(err); else resolve();
    });
  });
}

function keychainGetJSON(service, account) {
  return new Promise((resolve) => {
    execFile("/usr/bin/security", ["find-generic-password", "-s", service, "-a", account, "-w"], { maxBuffer: 1024 * 1024 }, (err, stdout) => {
      if (err || !stdout) return resolve(null);
      try { resolve(JSON.parse(stdout.trim())); } catch { resolve(null); }
    });
  });
}

function tokenSummary(tokens) {
  if (!tokens) return { connected: false, status: "not_connected" };
  const expiresAt = tokens.expires_at || 0;
  const expired = expiresAt && Date.now() > expiresAt;
  return {
    connected: Boolean(tokens.refresh_token || tokens.access_token),
    status: expired ? "expired_or_refresh_needed" : "connected",
    scope: tokens.scope || "",
    expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
    updatedAt: tokens.updated_at || null,
    storage: "macOS Keychain"
  };
}

async function getSpotifyAuthStatus() {
  const tokens = await keychainGetJSON(SPOTIFY_KEYCHAIN_SERVICE, SPOTIFY_KEYCHAIN_ACCOUNT);
  const summary = tokenSummary(tokens);
  const cfg = spotifyConfig();
  return {
    ...summary,
    appName: cfg.appName,
    redirectUri: cfg.redirectUri,
    authFlow: "authorization_code_pkce",
    clientSecretPolicy: "not_stored"
  };
}

function postForm(url, body) {
  const payload = new URLSearchParams(body).toString();
  return new Promise((resolve, reject) => {
    const req = https.request(url, {
      method: "POST",
      headers: {
        "content-type": "application/x-www-form-urlencoded",
        "content-length": Buffer.byteLength(payload)
      }
    }, (res) => {
      let raw = "";
      res.on("data", (d) => { raw += d; });
      res.on("end", () => {
        let parsed = null;
        try { parsed = JSON.parse(raw); } catch {}
        if (res.statusCode >= 200 && res.statusCode < 300) resolve(parsed || {});
        else reject(new Error(parsed?.error_description || parsed?.error || `Spotify token exchange failed: ${res.statusCode}`));
      });
    });
    req.on("error", reject);
    req.write(payload);
    req.end();
  });
}

function spotifyJSONRequest(method, urlString, accessToken, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlString);
    const payload = body ? JSON.stringify(body) : null;
    const req = https.request(url, {
      method,
      headers: {
        "authorization": `Bearer ${accessToken}`,
        ...(payload ? { "content-type": "application/json", "content-length": Buffer.byteLength(payload) } : {})
      }
    }, (res) => {
      let raw = "";
      res.on("data", (d) => { raw += d; });
      res.on("end", () => {
        let parsed = null;
        try { parsed = raw ? JSON.parse(raw) : null; } catch {}
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(parsed || { ok: true, statusCode: res.statusCode });
        } else {
          const msg = parsed?.error?.message || parsed?.error_description || parsed?.error || `Spotify API ${res.statusCode}`;
          const err = new Error(msg);
          err.statusCode = res.statusCode;
          err.body = parsed;
          reject(err);
        }
      });
    });
    req.on("error", reject);
    if (payload) req.write(payload);
    req.end();
  });
}

async function getFreshSpotifyTokens() {
  const tokens = await keychainGetJSON(SPOTIFY_KEYCHAIN_SERVICE, SPOTIFY_KEYCHAIN_ACCOUNT);
  if (!tokens?.access_token && !tokens?.refresh_token) throw new Error("Spotify is not connected yet. Press Connect first.");
  const expiresAt = Number(tokens.expires_at || 0);
  if (tokens.access_token && expiresAt && Date.now() < expiresAt - 60000) return tokens;

  if (!tokens.refresh_token) throw new Error("Spotify token expired. Reconnect Spotify.");
  const cfg = spotifyConfig();
  logSpotify("refreshing access token with PKCE public-client flow");
  const refreshed = await postForm("https://accounts.spotify.com/api/token", {
    client_id: cfg.clientId,
    grant_type: "refresh_token",
    refresh_token: tokens.refresh_token
  });
  const next = {
    ...tokens,
    access_token: refreshed.access_token || tokens.access_token,
    refresh_token: refreshed.refresh_token || tokens.refresh_token,
    token_type: refreshed.token_type || tokens.token_type,
    scope: refreshed.scope || tokens.scope,
    expires_at: Date.now() + Number(refreshed.expires_in || 3600) * 1000,
    updated_at: new Date().toISOString()
  };
  await keychainSetJSON(SPOTIFY_KEYCHAIN_SERVICE, SPOTIFY_KEYCHAIN_ACCOUNT, next);
  writeJSONSafe(SPOTIFY_AUTH_STATUS, await getSpotifyAuthStatus());
  return next;
}

async function spotifyAppInstalled() {
  if (process.platform !== "darwin") return true;
  return new Promise((resolve) => {
    execFile("/usr/bin/open", ["-Ra", "Spotify"], (err) => resolve(!err));
  });
}

function runAppleScript(lines) {
  return new Promise((resolve, reject) => {
    const args = lines.flatMap((line) => ["-e", line]);
    execFile("/usr/bin/osascript", args, (err, stdout, stderr) => {
      if (err) reject(new Error((stderr || err.message || "AppleScript failed").trim()));
      else resolve((stdout || "").trim());
    });
  });
}

async function localSpotifyControl(action, target = null) {
  if (process.platform !== "darwin" || !(await spotifyAppInstalled())) return null;
  if (action === "open") return openSpotifyAppOrWeb(target);
  const snapshot = readJSONSafe(path.join(REPO, "data-sources/spotify/snapshot.json")) || {};
  const playlist = snapshot.curatedPlaylists?.[0];
  const targetUri = target?.uri || playlist?.uri || snapshot.artist?.uri;
  if (action === "play" && targetUri) {
    await runAppleScript([
      "tell application \"Spotify\" to activate",
      `open location ${JSON.stringify(targetUri)}`,
      "delay 1",
      "tell application \"Spotify\" to play"
    ]);
    return { ok: true, action: "play", method: "spotify-desktop", contextUri: targetUri };
  }
  const command = action === "next" ? "next track" : action === "previous" ? "previous track" : action === "pause" ? "pause" : "playpause";
  await runAppleScript(["tell application \"Spotify\" to activate", `tell application \"Spotify\" to ${command}`]);
  return { ok: true, action: action === "toggle" ? "playpause" : action, method: "spotify-desktop" };
}

async function openSpotifyAppOrWeb(target = null) {
  const snapshot = readJSONSafe(path.join(REPO, "data-sources/spotify/snapshot.json")) || {};
  const playlist = snapshot.curatedPlaylists?.[0];
  const targetUri = target?.uri || playlist?.uri || snapshot.artist?.uri || "spotify:";
  const targetUrl = target?.url || playlist?.url || snapshot.artist?.url || "https://open.spotify.com/";
  const installed = await spotifyAppInstalled();
  if (installed) {
    try {
      await shell.openExternal(targetUri);
      return { ok: true, opened: "spotify-app", uri: targetUri };
    } catch {}
  }
  await shell.openExternal(targetUrl);
  return { ok: true, opened: "spotify-web", url: targetUrl, reason: installed ? "app-open-failed" : "desktop-app-not-found" };
}

async function spotifyPlayback(action) {
  if (action === "open") return openSpotifyAppOrWeb();

  const localFirst = await localSpotifyControl(action).catch((err) => ({ localError: err.message }));
  if (localFirst && !localFirst.localError) return localFirst;

  const tokens = await getFreshSpotifyTokens();
  const access = tokens.access_token;
  const snapshot = readJSONSafe(path.join(REPO, "data-sources/spotify/snapshot.json")) || {};
  try {
    if (action === "state") {
      const state = await spotifyJSONRequest("GET", "https://api.spotify.com/v1/me/player", access);
      return { ok: true, state };
    }
    if (action === "previous") {
      await spotifyJSONRequest("POST", "https://api.spotify.com/v1/me/player/previous", access);
      return { ok: true, action };
    }
    if (action === "next") {
      await spotifyJSONRequest("POST", "https://api.spotify.com/v1/me/player/next", access);
      return { ok: true, action };
    }
    if (action === "pause") {
      await spotifyJSONRequest("PUT", "https://api.spotify.com/v1/me/player/pause", access);
      return { ok: true, action };
    }
    if (action === "play" || action === "toggle") {
      let currentlyPlaying = false;
      if (action === "toggle") {
        try {
          const state = await spotifyJSONRequest("GET", "https://api.spotify.com/v1/me/player", access);
          currentlyPlaying = Boolean(state?.is_playing);
        } catch {}
      }
      if (currentlyPlaying) {
        await spotifyJSONRequest("PUT", "https://api.spotify.com/v1/me/player/pause", access);
        return { ok: true, action: "pause" };
      }
      const contextUri = snapshot.curatedPlaylists?.[0]?.uri || snapshot.artist?.uri;
      await spotifyJSONRequest("PUT", "https://api.spotify.com/v1/me/player/play", access, contextUri ? { context_uri: contextUri } : {});
      return { ok: true, action: "play", contextUri };
    }
    throw new Error(`Unknown Spotify playback action: ${action}`);
  } catch (err) {
    if (err.statusCode === 403) {
      const localFallback = await localSpotifyControl(action).catch(() => null);
      if (localFallback) return localFallback;
      await openSpotifyAppOrWeb();
      throw new Error("Spotify Web API is blocking remote control, so I opened Spotify instead. Make sure Spotify Desktop is installed, logged into Premium, and playing once.");
    }
    throw err;
  }
}

async function startSpotifyAuth() {
  const cfg = spotifyConfig();
  if (!cfg.clientId) throw new Error("Spotify client ID missing from app config");
  const verifier = base64url(crypto.randomBytes(64));
  const challenge = base64url(crypto.createHash("sha256").update(verifier).digest());
  const state = base64url(crypto.randomBytes(24));
  pendingSpotifyAuth = { state, verifier, startedAt: Date.now() };

  const params = new URLSearchParams({
    client_id: cfg.clientId,
    response_type: "code",
    redirect_uri: cfg.redirectUri,
    code_challenge_method: "S256",
    code_challenge: challenge,
    state,
    scope: cfg.scopes.join(" ")
  });
  const authorizeUrl = `https://accounts.spotify.com/authorize?${params.toString()}`;
  logSpotify("opening Spotify authorization URL");
  try {
    await shell.openExternal(authorizeUrl);
  } catch (err) {
    logSpotify("shell.openExternal failed; trying macOS open fallback", err.message);
    await new Promise((resolve, reject) => {
      execFile("/usr/bin/open", [authorizeUrl], (openErr) => openErr ? reject(openErr) : resolve());
    });
  }
  return { ok: true, status: "browser_opened", redirectUri: cfg.redirectUri, authFlow: "PKCE", authorizeUrl };
}

async function handleSpotifyCallback(callbackUrl) {
  let url;
  try { url = new URL(callbackUrl); } catch { return; }
  if (url.protocol !== "axlmania:" || url.hostname !== "auth-callback") return;

  const error = url.searchParams.get("error");
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  if (error) throw new Error(`Spotify authorization denied: ${error}`);
  if (!pendingSpotifyAuth || state !== pendingSpotifyAuth.state) throw new Error("Spotify callback state mismatch");
  if (!code) throw new Error("Spotify callback did not include an authorization code");

  const cfg = spotifyConfig();
  const token = await postForm("https://accounts.spotify.com/api/token", {
    client_id: cfg.clientId,
    grant_type: "authorization_code",
    code,
    redirect_uri: cfg.redirectUri,
    code_verifier: pendingSpotifyAuth.verifier
  });

  const stored = {
    access_token: token.access_token,
    refresh_token: token.refresh_token,
    token_type: token.token_type,
    scope: token.scope,
    expires_at: Date.now() + Number(token.expires_in || 3600) * 1000,
    updated_at: new Date().toISOString()
  };
  await keychainSetJSON(SPOTIFY_KEYCHAIN_SERVICE, SPOTIFY_KEYCHAIN_ACCOUNT, stored);
  pendingSpotifyAuth = null;
  logSpotify("authorization complete; tokens stored in macOS Keychain");

  const status = await getSpotifyAuthStatus();
  writeJSONSafe(SPOTIFY_AUTH_STATUS, status);
  mainWindow?.webContents.send("spotify:auth-status", status);
  try {
    await runRefresh();
    mainWindow?.webContents.send("dashboard:refreshed", readState());
  } catch {}
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1600,
    height: 1000,
    minWidth: 1200,
    minHeight: 720,
    backgroundColor: "#020101",
    titleBarStyle: "hiddenInset",
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });

  if (isDev) {
    mainWindow.loadURL(DEV_URL);
  } else {
    mainWindow.loadURL(`http://127.0.0.1:${prodServerPort}/`);
  }

  mainWindow.once("ready-to-show", () => mainWindow.show());

  // Hide on close → behaves as always-on tray app
  mainWindow.on("close", (e) => {
    if (!isQuitting) {
      e.preventDefault();
      mainWindow.hide();
      if (process.platform === "darwin") app.dock?.hide();
    }
  });

  // External links open in default browser, not inside the dashboard window
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });
}

function createTray() {
  let icon;
  try {
    icon = nativeImage.createFromPath(TRAY_ICON).resize({ width: 18, height: 18 });
    if (process.platform === "darwin") icon.setTemplateImage(false);
  } catch {
    icon = nativeImage.createEmpty();
  }
  tray = new Tray(icon);
  tray.setToolTip("AX-L Mania");

  const menu = Menu.buildFromTemplate([
    {
      label: "Show dashboard",
      click: () => {
        if (!mainWindow) createWindow();
        mainWindow.show();
        if (process.platform === "darwin") app.dock?.show();
        mainWindow.focus();
      }
    },
    {
      label: "Connect Spotify",
      click: () => startSpotifyAuth().catch((err) => mainWindow?.webContents.send("spotify:auth-error", err.message))
    },
    {
      label: "Refresh from vault",
      click: () => runRefresh().then(() => mainWindow?.webContents.send("dashboard:refreshed", readState()))
    },
    { type: "separator" },
    {
      label: "Quit",
      click: () => {
        isQuitting = true;
        app.quit();
      }
    }
  ]);
  tray.setContextMenu(menu);
  tray.on("click", () => {
    if (!mainWindow) return;
    if (mainWindow.isVisible()) mainWindow.hide();
    else {
      mainWindow.show();
      if (process.platform === "darwin") app.dock?.show();
    }
  });
}

function userStatePath() {
  return path.join(app.getPath("userData"), "state.json");
}

// In production REPO points at app.asar; spawned plain-Node processes can't read asar,
// so script + data-sources must live at app.asar.unpacked (configured via asarUnpack).
function unpackedRepo() {
  if (isDev) return REPO;
  return REPO.replace(/\bapp\.asar\b/, "app.asar.unpacked");
}

function readState() {
  const userPath = userStatePath();
  if (fs.existsSync(userPath)) {
    try { return JSON.parse(fs.readFileSync(userPath, "utf8")); } catch {}
  }
  try {
    return JSON.parse(fs.readFileSync(STATE_PATH, "utf8"));
  } catch {
    return null;
  }
}

function runRefresh() {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(unpackedRepo(), "scripts/build-data.mjs");
    const proc = spawn(process.execPath, [scriptPath], {
      cwd: unpackedRepo(),
      env: {
        ...process.env,
        ELECTRON_RUN_AS_NODE: "1",
        STATE_OUT: userStatePath(),
        FORCE_COLOR: "0"
      }
    });
    let stderr = "";
    proc.stdout.on("data", (d) => mainWindow?.webContents.send("dashboard:refresh-log", d.toString()));
    proc.stderr.on("data", (d) => { stderr += d.toString(); mainWindow?.webContents.send("dashboard:refresh-log", d.toString()); });
    proc.on("error", (err) => reject(err));
    proc.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`build-data.mjs exited ${code}: ${stderr}`));
    });
  });
}

function execFileSafe(cmd, args = [], options = {}) {
  return new Promise((resolve) => {
    execFile(cmd, args, { timeout: 2500, maxBuffer: 512 * 1024, ...options }, (err, stdout, stderr) => {
      resolve({ ok: !err, output: String(stdout || stderr || "").trim(), error: err ? String(err.message || err) : null });
    });
  });
}

function checkHttp(urlString, timeoutMs = 900) {
  return new Promise((resolve) => {
    const started = Date.now();
    const req = http.get(urlString, (res) => {
      res.resume();
      resolve({ ok: res.statusCode >= 200 && res.statusCode < 500, statusCode: res.statusCode, ms: Date.now() - started });
    });
    req.setTimeout(timeoutMs, () => {
      req.destroy();
      resolve({ ok: false, statusCode: null, ms: Date.now() - started });
    });
    req.on("error", () => resolve({ ok: false, statusCode: null, ms: Date.now() - started }));
  });
}

function parseDf(raw) {
  const lines = String(raw || "").trim().split(/\n+/);
  const row = lines[1]?.trim().split(/\s+/);
  if (!row || row.length < 5) return null;
  return { size: row[1], used: row[2], available: row[3], capacity: row[4], mount: row[5] || "/" };
}

async function readCommandSensor() {
  const [df, uptime, foleybot] = await Promise.all([
    execFileSafe("/bin/df", ["-H", REPO]),
    execFileSafe("/usr/bin/uptime", []),
    checkHttp("http://127.0.0.1:8787/health")
  ]);
  const state = readState();
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedPct = totalMem ? Math.round(((totalMem - freeMem) / totalMem) * 100) : null;
  return {
    status: "live",
    sampledAt: new Date().toISOString(),
    app: {
      name: app.getName(),
      version: app.getVersion(),
      mode: isDev ? "dev" : "packaged",
      electron: process.versions.electron,
      node: process.versions.node
    },
    machine: {
      host: os.hostname(),
      platform: `${os.type()} ${os.release()}`,
      arch: os.arch(),
      uptimeSeconds: Math.round(os.uptime()),
      uptime: uptime.output.replace(/\s+/g, " ").slice(0, 160),
      load: os.loadavg().map((n) => n.toFixed(2)).join(" / "),
      memory: usedPct == null ? "unknown" : `${usedPct}% used`,
      cpus: os.cpus()?.length || null
    },
    disk: parseDf(df.output),
    services: {
      foleybot: foleybot.ok ? `online · ${foleybot.ms}ms` : "offline",
      dashboard: mainWindow ? (mainWindow.isVisible() ? "visible" : "hidden") : "not open"
    },
    data: {
      generatedAt: state?.meta?.generatedAt || null,
      google: state?.meta?.sources?.google || "unknown",
      spotify: state?.meta?.sources?.spotify || "unknown",
      finance: state?.meta?.sources?.finance || "unknown"
    },
    commands: {
      uptime: uptime.ok ? uptime.output.replace(/\s+/g, " ").slice(0, 160) : "unavailable",
      disk: df.ok ? "df -H project root" : "unavailable"
    }
  };
}

ipcMain.handle("dashboard:get-state", () => readState());
ipcMain.handle("dashboard:get-command-sensor", async () => readCommandSensor());
ipcMain.handle("dashboard:refresh", async () => {
  await runRefresh();
  return readState();
});
ipcMain.handle("spotify:get-auth-status", async () => getSpotifyAuthStatus());
ipcMain.handle("spotify:connect", async () => startSpotifyAuth());
ipcMain.handle("spotify:playback", async (_event, action) => spotifyPlayback(action));

app.on("open-url", (event, url) => {
  event.preventDefault();
  handleSpotifyCallback(url).catch((err) => mainWindow?.webContents.send("spotify:auth-error", err.message));
});

if (gotSingleInstanceLock) {
  app.whenReady().then(async () => {
    if (!isDev) {
      try {
        prodServerPort = await startProductionServer();
        console.log(`[prod-server] listening on 127.0.0.1:${prodServerPort}`);
      } catch (err) {
        console.error("[prod-server] failed to start:", err);
      }
    }
    createWindow();
    createTray();
    writeJSONSafe(SPOTIFY_AUTH_STATUS, await getSpotifyAuthStatus());
    const launchCallbackUrl = process.argv.find((arg) => String(arg).startsWith("axlmania://"));
    if (launchCallbackUrl) {
      handleSpotifyCallback(launchCallbackUrl).catch((err) => mainWindow?.webContents.send("spotify:auth-error", err.message));
    }
    if (process.env.AXL_SPOTIFY_CONNECT === "1" || process.argv.includes("--spotify-connect")) {
      setTimeout(() => {
        startSpotifyAuth().catch((err) => mainWindow?.webContents.send("spotify:auth-error", err.message));
      }, 1200);
    }

    app.on("activate", () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
      else mainWindow?.show();
    });
  });
}

app.on("window-all-closed", () => {
  // Don't quit on close — we live in the tray
  if (process.platform !== "darwin") {
    // Linux/Win: also keep in tray
  }
});

app.on("before-quit", () => { isQuitting = true; });
