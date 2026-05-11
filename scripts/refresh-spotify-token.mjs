#!/usr/bin/env node
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const execFileAsync = promisify(execFile);
const REPO = process.cwd();
const CONFIG = join(REPO, "data-sources/spotify/app-config.json");
const STATUS = join(REPO, "data-sources/spotify/auth-status.json");
const SERVICE = "AX-L Mania Spotify";
const ACCOUNT = "spotify-oauth";

function safeStatus(extra = {}) {
  return {
    connected: Boolean(extra.connected),
    status: extra.status || "unknown",
    scope: extra.scope || null,
    expiresAt: extra.expiresAt || null,
    updatedAt: new Date().toISOString(),
    storage: "macOS Keychain",
    appName: extra.appName || "AX-L Mania Player",
    redirectUri: extra.redirectUri || "axlmania://auth-callback",
    authFlow: "authorization_code_pkce",
    clientSecretPolicy: "not_stored"
  };
}

async function getSecret() {
  const { stdout } = await execFileAsync("/usr/bin/security", ["find-generic-password", "-s", SERVICE, "-a", ACCOUNT, "-w"], { maxBuffer: 1024 * 1024 });
  return JSON.parse(stdout.trim());
}

async function setSecret(payload) {
  const secret = JSON.stringify(payload);
  await execFileAsync("/usr/bin/security", ["add-generic-password", "-U", "-s", SERVICE, "-a", ACCOUNT, "-w", secret]);
}

async function main() {
  const cfg = JSON.parse(await readFile(CONFIG, "utf8"));
  const tokens = await getSecret();
  if (!tokens.refresh_token) throw new Error("Spotify refresh token missing; reconnect in Electron app.");

  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: tokens.refresh_token,
    client_id: cfg.clientId
  });

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body
  });
  const refreshed = await response.json();
  if (!response.ok) throw new Error(refreshed.error_description || refreshed.error || `Spotify refresh failed: ${response.status}`);

  const next = {
    ...tokens,
    ...refreshed,
    refresh_token: refreshed.refresh_token || tokens.refresh_token,
    expires_at: Date.now() + Number(refreshed.expires_in || 3600) * 1000
  };
  await setSecret(next);
  await writeFile(STATUS, JSON.stringify(safeStatus({
    connected: true,
    status: "connected",
    scope: next.scope || cfg.scopes?.join(" ") || null,
    expiresAt: new Date(next.expires_at).toISOString(),
    appName: cfg.appName,
    redirectUri: cfg.redirectUri
  }), null, 2));
  console.log("spotify-token-refreshed");
}

main().catch(async (err) => {
  try {
    const cfg = JSON.parse(await readFile(CONFIG, "utf8"));
    await writeFile(STATUS, JSON.stringify(safeStatus({ connected: false, status: "refresh_failed", appName: cfg.appName, redirectUri: cfg.redirectUri }), null, 2));
  } catch {}
  console.error(err.message);
  process.exit(1);
});
