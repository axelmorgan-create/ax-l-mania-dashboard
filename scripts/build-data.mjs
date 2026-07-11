#!/usr/bin/env node
// Build src/data/state.json from the brain vault + cached MCP snapshots.
// Run: npm run refresh

import { readdir, readFile, stat, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, relative } from "node:path";
import os from "node:os";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import http from "node:http";

const VAULT = "/Users/axlfoliem/Documents/brain 2";
const REPO = new URL("..", import.meta.url).pathname;
const OUT = process.env.STATE_OUT || join(REPO, "src/data/state.json");
const SOURCES = join(REPO, "data-sources");

const NOW = new Date();
const TODAY = NOW.toISOString().slice(0, 10);

const log = (...a) => console.log("[build-data]", ...a);
const execFileAsync = promisify(execFile);

// ---------- helpers ----------

async function walk(dir, opts = {}) {
  const { skipDirs = new Set([".git", ".obsidian", "node_modules"]) } = opts;
  const out = [];
  async function rec(p) {
    let entries;
    try { entries = await readdir(p, { withFileTypes: true }); }
    catch { return; }
    for (const e of entries) {
      if (e.name === ".DS_Store") continue;
      const full = join(p, e.name);
      if (e.isDirectory()) {
        if (skipDirs.has(e.name)) continue;
        await rec(full);
      } else {
        out.push(full);
      }
    }
  }
  await rec(dir);
  return out;
}

async function statSafe(p) {
  try { return await stat(p); } catch { return null; }
}

async function readSafe(p) {
  try { return await readFile(p, "utf8"); } catch { return null; }
}

async function readJSONSafe(p) {
  const t = await readSafe(p);
  if (!t) return null;
  try { return JSON.parse(t); } catch { return null; }
}

function parseMarkdownChecklist(md = "") {
  const items = [...md.matchAll(/^\s*- \[( |x|X)\]\s+(.+)$/gm)].map((m) => ({
    done: m[1].toLowerCase() === "x",
    text: m[2].trim()
  }));
  return { total: items.length, open: items.filter((i) => !i.done).length, done: items.filter((i) => i.done).length, items };
}

function fmtMoney(n) {
  if (n == null || Number.isNaN(Number(n))) return "—";
  const v = Number(n);
  if (Math.abs(v) >= 1000000) return `$${(v / 1000000).toFixed(1)}M`;
  if (Math.abs(v) >= 1000) return `$${(v / 1000).toFixed(1)}K`;
  return `$${v.toFixed(2)}`;
}

function pct(part, total) {
  if (!total) return "0%";
  return `${Math.round((Number(part || 0) / Number(total)) * 100)}%`;
}

async function buildMusicOsData({ spotify, spotifyAppConfig, spotifyAuthStatus, moneyExtract, moneyCatalog, bmiAccounts, songviewConflicts, annualRoyalty, soundExchange, warnerDeal, warnerPayments, negotiations }) {
  const rel = (file) => join(VAULT, file);
  const notePaths = {
    command: "Music.md",
    spotifyWidget: "music/widgets/spotify-player-widget.md",
    menuBarSpec: "music/widgets/spotify-menu-bar-app-spec.md",
    catalogDashboard: "music/dashboards/catalog-performance.md",
    royaltyTracker: "music/dashboards/royalty-tracker.md",
    opportunities: "music/dashboards/opportunities.md",
    monthlyReview: "music/dashboards/monthly-review.md",
    songs: "music/catalog/songs.md",
    credits: "music/catalog/credits.md",
    splits: "music/catalog/splits.md",
    releases: "music/catalog/releases.md",
    spotifyAnalytics: "music/analytics/spotify.md",
    appleAnalytics: "music/analytics/apple-music.md",
    youtubeAnalytics: "music/analytics/youtube.md",
    tiktokAnalytics: "music/analytics/tiktok.md",
    shazamAnalytics: "music/analytics/shazam.md",
    chartmetricAnalytics: "music/analytics/chartmetric.md",
    warner: "music/publishing/warner-chappell.md",
    pro: "music/publishing/bmi-ascap-pro.md",
    soundexchange: "music/publishing/soundexchange.md",
    songtrust: "music/publishing/songtrust.md"
  };

  const commandMd = await readSafe(rel(notePaths.command)) || "";
  const checklist = parseMarkdownChecklist(commandMd);
  const existsCount = Object.values(notePaths).filter((file) => existsSync(rel(file))).length;
  const noteCount = Object.keys(notePaths).length;

  const bmiYtd = moneyExtract?.income?.bmi_ytd_2025_as_of_aug_21;
  const bmiPeriod = moneyExtract?.income?.bmi_period_1q_2025;
  const wcmTotal = moneyExtract?.income?.bmi_warner_xlsx_total;
  const wsn = moneyExtract?.income?.wsn_buried_estimate;
  const royaltyTotal = Number(bmiYtd || 0) + Number(wcmTotal || 0) + Number(wsn || 0);
  const works = moneyCatalog?.unique_works ?? moneyExtract?.catalog?.unique_works ?? 0;
  const titles = moneyCatalog?.unique_titles ?? moneyExtract?.catalog?.unique_titles ?? 0;
  const axelTitles = (moneyCatalog?.axel_titles ?? []).length || moneyExtract?.catalog?.axel_credited_titles || 0;
  const conflicts = moneyCatalog?.with_conflicts ?? moneyExtract?.catalog?.songview_conflicts ?? 0;
  const topConflicts = (moneyCatalog?.works ?? []).filter((w) => w.has_conflict).slice(0, 5).map((w) => ({
    title: w.title,
    issue: (w.conflicts ?? [])[0] || "Share / participant conflict",
    iswc: w.iswc || "—"
  }));

  const editorialCount = spotify?.curatedPlaylists?.length ?? 0;
  const epkCount = spotify?.topTracksFromVaultEPK?.length ?? 0;
  const creditCount = spotify?.credits?.length ?? 0;
  const spotifyBlocked = spotify?.tracksDeepFetch?.status === "blocked";
  const spotifyConnected = Boolean(spotifyAuthStatus?.connected);
  const spotifyTokenStatus = spotifyAuthStatus?.status || (spotifyBlocked ? "refresh needed" : "not connected");

  const modules = [
    { id: "spotify-remote", title: "Spotify Remote", status: spotifyConnected ? "connected" : (spotifyAppConfig?.clientId ? "connect ready" : "needs config"), number: spotifyConnected ? "online" : "login needed", detail: spotifyConnected ? "Tokens stored in macOS Keychain" : "PKCE app metadata present; click Connect Spotify in the app", path: notePaths.spotifyWidget, tone: spotifyConnected ? "ok" : "warn" },
    { id: "catalog-intel", title: "Catalog Intel", status: works ? "indexed" : "awaiting", number: `${works || "—"} works`, detail: `${titles || 0} titles · ${axelTitles || 0} Axel-credited`, path: notePaths.catalogDashboard, tone: works ? "ok" : "warn" },
    { id: "rights-risk", title: "Rights Risk", status: conflicts ? "cleanup" : "clear", number: `${conflicts} conflicts`, detail: `${pct(conflicts, works)} of indexed works flagged`, path: notePaths.splits, tone: conflicts ? "warn" : "ok" },
    { id: "royalty-radar", title: "Royalty Radar", status: royaltyTotal ? "extracted" : "awaiting", number: fmtMoney(royaltyTotal), detail: `BMI ${fmtMoney(bmiYtd)} · WCM ${fmtMoney(wcmTotal)} · WSN ${fmtMoney(wsn)}`, path: notePaths.royaltyTracker, tone: royaltyTotal ? "ok" : "warn" },
    { id: "opportunity-pipeline", title: "Opportunity Pipeline", status: "ready", number: "6 lanes", detail: "sync, label, co-write, beat placement, brand, playlisting", path: notePaths.opportunities, tone: "neutral" },
    { id: "monthly-review", title: "Monthly Review", status: checklist.open ? "open loops" : "ready", number: `${checklist.open} actions`, detail: "first-week operating ritual", path: notePaths.monthlyReview, tone: checklist.open ? "warn" : "ok" }
  ];

  return {
    goal: "turn listens into owned metadata, clean rights, paid placements, and monthly decisions",
    sourceNotes: { present: existsCount, total: noteCount, status: existsCount === noteCount ? "complete" : "partial" },
    kpis: [
      { label: "Catalog works", value: works ? String(works) : "—", delta: `${titles || 0} titles`, tone: works ? "ok" : "warn" },
      { label: "Rights conflicts", value: String(conflicts), delta: `${pct(conflicts, works)} conflict rate`, tone: conflicts ? "warn" : "ok" },
      { label: "Royalty surfaced", value: fmtMoney(royaltyTotal), delta: "BMI + WCM + WSN", tone: royaltyTotal ? "ok" : "warn" },
      { label: "Spotify signals", value: `${editorialCount} editorial`, delta: `${epkCount} EPK · ${creditCount} credits`, tone: spotify ? "ok" : "warn" },
      { label: "Module coverage", value: `${existsCount}/${noteCount}`, delta: "music source notes", tone: existsCount === noteCount ? "ok" : "warn" },
      { label: "Action loops", value: String(checklist.open), delta: `${checklist.done} closed`, tone: checklist.open ? "warn" : "ok" }
    ],
    modules,
    royalty: {
      total: fmtMoney(royaltyTotal),
      sources: [
        { label: "BMI YTD", value: fmtMoney(bmiYtd), progress: Math.min(100, Math.round(Number(bmiYtd || 0) / 25)) },
        { label: "BMI 1Q", value: fmtMoney(bmiPeriod), progress: Math.min(100, Math.round(Number(bmiPeriod || 0) / 10)) },
        { label: "Warner Chappell", value: fmtMoney(wcmTotal), progress: Math.min(100, Math.round(Number(wcmTotal || 0) / 250)) },
        { label: "WSN buried", value: fmtMoney(wsn), progress: Math.min(100, Math.round(Number(wsn || 0) / 5)) }
      ]
    },
    catalog: { works, titles, axelTitles, conflicts, conflictRate: pct(conflicts, works), topConflicts },
    spotifyControl: {
      appName: spotifyAppConfig?.appName || "AX-L Mania Player",
      redirectUri: spotifyAppConfig?.redirectUri || "axlmania://auth-callback",
      authFlow: "PKCE",
      tokenStatus: spotifyTokenStatus,
      connected: spotifyConnected,
      storage: spotifyAuthStatus?.storage || "macOS Keychain",
      expiresAt: spotifyAuthStatus?.expiresAt || null,
      artist: spotify?.artist || null,
      playlists: spotify?.curatedPlaylists || [],
      priorityTracks: spotify?.topTracksFromVaultEPK || [],
      creditAnchors: spotify?.credits || []
    },
    channels: [
      { label: "Spotify", status: spotify ? "snapshot" : "awaiting", value: `${editorialCount} editorial` },
      { label: "Apple / iTunes", status: existsSync(rel(notePaths.appleAnalytics)) ? "note ready" : "missing", value: "awaiting export" },
      { label: "YouTube", status: existsSync(rel(notePaths.youtubeAnalytics)) ? "note ready" : "missing", value: "awaiting export" },
      { label: "TikTok / Social", status: existsSync(rel(notePaths.tiktokAnalytics)) ? "note ready" : "missing", value: "awaiting export" },
      { label: "Shazam", status: existsSync(rel(notePaths.shazamAnalytics)) ? "note ready" : "missing", value: "awaiting export" },
      { label: "Chartmetric", status: existsSync(rel(notePaths.chartmetricAnalytics)) ? "note ready" : "missing", value: "awaiting export" }
    ],
    actions: checklist.items.slice(0, 8),
    // Tile data sources added 2026-05-11 — each is null when source file is missing
    bmiAccounts: bmiAccounts || null,
    songviewConflicts: songviewConflicts || null,
    annualRoyalty: annualRoyalty || null,
    soundExchange: soundExchange || null,
    warnerDeal: warnerDeal || null,
    warnerPayments: warnerPayments || null,
    negotiations: negotiations || null
  };
}


function fmtBytes(n) {
  if (n >= 1024 ** 3) return `${(n / 1024 ** 3).toFixed(1)} GB`;
  if (n >= 1024 ** 2) return `${(n / 1024 ** 2).toFixed(1)} MB`;
  if (n >= 1024) return `${(n / 1024).toFixed(0)} K`;
  return `${n}`;
}

function daysAgo(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() - n);
  return d;
}


async function commandLines(cmd, args = []) {
  try {
    const { stdout } = await execFileAsync(cmd, args, { timeout: 2500 });
    return stdout.trim().split("\n").filter(Boolean);
  } catch {
    return [];
  }
}

async function commandHealth(name, candidatePaths = [], args = ["--version"]) {
  const paths = [...new Set(candidatePaths.filter(Boolean))];
  const found = paths.find((p) => existsSync(p));
  if (!found) {
    return {
      id: name.toLowerCase().replace(/\s+/g, "-"),
      name,
      status: "missing",
      detail: "command not found in checked absolute paths",
      evidence: paths.join(" · ") || "no paths supplied"
    };
  }
  const lines = await commandLines(found, args);
  return {
    id: name.toLowerCase().replace(/\s+/g, "-"),
    name,
    status: lines.length ? "ok" : "warn",
    detail: lines[0]?.slice(0, 120) || "installed; version command did not return output",
    evidence: found
  };
}

function fileHealth(name, path, okDetail = "present", missingDetail = "missing") {
  const ok = existsSync(path);
  return {
    id: name.toLowerCase().replace(/\s+/g, "-"),
    name,
    status: ok ? "ok" : "fail",
    detail: ok ? okDetail : missingDetail,
    evidence: path
  };
}

function envHealth(name, keys = []) {
  const present = keys.filter((key) => Boolean(process.env[key]));
  return {
    id: name.toLowerCase().replace(/\s+/g, "-"),
    name,
    status: present.length ? "ok" : "warn",
    detail: present.length ? `${present.length}/${keys.length} env signals present (values redacted)` : "no env signals present in refresh shell",
    evidence: keys.map((key) => `${key}:${process.env[key] ? "present" : "absent"}`).join(" · ")
  };
}

async function localUrlHealth(name, url, okStatuses = [200, 204, 301, 302, 304, 400, 401, 404, 405]) {
  return new Promise((resolve) => {
    const id = name.toLowerCase().replace(/\s+/g, "-");
    const req = http.get(url, { timeout: 900 }, (res) => {
      res.resume();
      const reachable = okStatuses.includes(res.statusCode);
      resolve({ id, name, status: reachable ? "ok" : "warn", detail: `HTTP ${res.statusCode}`, evidence: url });
    });
    req.on("timeout", () => {
      req.destroy();
      resolve({ id, name, status: "warn", detail: "not responding during refresh", evidence: url });
    });
    req.on("error", () => {
      resolve({ id, name, status: "warn", detail: "offline or not started", evidence: url });
    });
  });
}

function sourceHealth(name, status, evidence) {
  const normalized = status || "missing";
  return {
    id: name.toLowerCase().replace(/\s+/g, "-"),
    name,
    status: normalized === "ok" || normalized === "snapshot" ? "ok" : ["blocked", "needs_auth", "configured"].includes(normalized) ? "warn" : "missing",
    detail: normalized,
    evidence
  };
}

async function buildGoogleSourceState() {
  const googleDir = join(SOURCES, "google");
  const snapshots = ["gmail.json", "calendar.json", "contacts.json"].filter((file) => existsSync(join(googleDir, file)));
  const statusExists = existsSync(join(googleDir, "STATUS.md"));
  const oauthClientExists = existsSync(join(os.homedir(), ".google_workspace_mcp/client_secret.json"));
  let credentialCount = 0;
  try {
    credentialCount = (await readdir(join(os.homedir(), ".google_workspace_mcp/credentials"))).filter((file) => !file.startsWith(".")).length;
  } catch {}

  let status = "missing";
  let detail = "no Google snapshot yet";
  if (snapshots.length >= 3) {
    status = "snapshot";
    detail = "Gmail, Calendar, and Contacts snapshots present";
  } else if (statusExists) {
    // Do not show Google as "ready" just because OAuth succeeded.
    // The command center needs usable snapshots; STATUS.md documents the current blocker.
    status = "blocked";
    detail = snapshots.length > 0 ? `${snapshots.length}/3 snapshots present; see STATUS.md` : "API enablement pending; see STATUS.md";
  } else if (credentialCount > 0) {
    status = "configured";
    detail = "OAuth credentials present; refresh snapshots next";
  } else if (oauthClientExists) {
    status = "needs_auth";
    detail = "OAuth app is present; Google login still needed";
  }

  return {
    status,
    detail,
    snapshots,
    oauthClientExists,
    credentialCount,
    statusPath: "data-sources/google/STATUS.md"
  };
}

async function buildHealthChecks({ inv, newWeek, spotify, spotifyAppConfig, spotifyAuthStatus, googleSource, qbStatus, peopleMd, packageJson }) {
  const sources = {
    vault: existsSync(VAULT) ? "ok" : "missing",
    spotify: spotify ? "snapshot" : "missing",
    google: googleSource?.status,
    quickbooks: qbStatus
  };

  const groups = [
    {
      id: "agents",
      title: "Agent runtimes",
      checks: [
        await commandHealth("Hermes Agent", ["/opt/homebrew/bin/hermes", "/usr/local/bin/hermes", "/usr/bin/hermes", join(os.homedir(), ".local/bin/hermes")]),
        await commandHealth("Claude Code", ["/opt/homebrew/bin/claude", "/usr/local/bin/claude", "/usr/bin/claude", join(os.homedir(), ".local/bin/claude")]),
        envHealth("Anthropic API env", ["ANTHROPIC_API_KEY"]),
        {
          id: "anthropic-sdk",
          name: "Anthropic SDK package",
          status: packageJson?.dependencies?.["@anthropic-ai/sdk"] ? "ok" : "missing",
          detail: packageJson?.dependencies?.["@anthropic-ai/sdk"] || "not listed",
          evidence: "package.json dependencies"
        }
      ]
    },
    {
      id: "dashboard",
      title: "Dashboard app",
      checks: [
        fileHealth("Project root", REPO, "root exists"),
        fileHealth("Data generator", join(REPO, "scripts/build-data.mjs"), "npm run refresh target present"),
        fileHealth("React app", join(REPO, "src/App.jsx"), "Network tab source present"),
        fileHealth("Generated state", OUT, "state.json present"),
        fileHealth("Node modules", join(REPO, "node_modules"), "dependencies installed", "run npm install"),
        {
          id: "scripts",
          name: "Package scripts",
          status: ["refresh", "dev", "build", "foleybot"].every((key) => packageJson?.scripts?.[key]) ? "ok" : "warn",
          detail: ["refresh", "dev", "build", "foleybot"].filter((key) => packageJson?.scripts?.[key]).join(" · ") || "none found",
          evidence: "package.json scripts"
        }
      ]
    },
    {
      id: "local-services",
      title: "Local services",
      checks: [
        await localUrlHealth("Vite dev server", "http://127.0.0.1:5173/"),
        await localUrlHealth("Vite preview", "http://127.0.0.1:4173/"),
        await localUrlHealth("Foleybot server", "http://127.0.0.1:8787/chat"),
        fileHealth("Foleybot script", join(REPO, "scripts/foleybot-server.mjs"), "local Claude proxy script present"),
        envHealth("Foleybot auth env", ["ANTHROPIC_API_KEY", "FOLEYBOT_MODEL", "FOLEYBOT_PORT"])
      ]
    },
    {
      id: "vault",
      title: "Obsidian vault",
      checks: [
        sourceHealth("Vault source", sources.vault, VAULT),
        {
          id: "people-wiki",
          name: "People wiki",
          status: existsSync(join(VAULT, "wiki/network/people.md")) && peopleMd && !/ai-drafted-needs-rewrite/.test(peopleMd) ? "ok" : existsSync(join(VAULT, "wiki/network/people.md")) ? "warn" : "fail",
          detail: existsSync(join(VAULT, "wiki/network/people.md")) ? (peopleMd && !/ai-drafted-needs-rewrite/.test(peopleMd) ? "governed" : "needs rewrite") : "missing",
          evidence: join(VAULT, "wiki/network/people.md")
        },
        fileHealth("Agents index", join(VAULT, "agents/INDEX.md"), "agent registry present"),
        {
          id: "vault-inventory",
          name: "Vault inventory",
          status: inv && Object.keys(inv).length ? "ok" : "warn",
          detail: `${Object.values(inv || {}).reduce((a, b) => a + (b.files || 0), 0)} files · ${newWeek} new in 7d`,
          evidence: "filesystem walk; .obsidian and node_modules skipped"
        }
      ]
    },
    {
      id: "attached-apis",
      title: "Attached APIs",
      checks: [
        sourceHealth("Spotify", sources.spotify, "data-sources/spotify/snapshot.json"),
        {
          id: "spotify-app-config",
          name: "Spotify app config",
          status: spotifyAppConfig?.clientId && spotifyAppConfig?.redirectUri ? "ok" : "warn",
          detail: spotifyAppConfig?.appName ? `${spotifyAppConfig.appName} · PKCE · secret not stored` : "missing client ID / redirect URI",
          evidence: spotifyAppConfig?.redirectUri || "data-sources/spotify/app-config.json"
        },
        {
          id: "spotify-keychain-auth",
          name: "Spotify OAuth login",
          status: spotifyAuthStatus?.connected ? "ok" : "warn",
          detail: spotifyAuthStatus?.connected ? `connected · ${spotifyAuthStatus.storage || "macOS Keychain"}` : "not connected yet; use Connect Spotify",
          evidence: spotifyAuthStatus?.connected ? "data-sources/spotify/auth-status.json + macOS Keychain" : "no token material in repo"
        },
        envHealth("Spotify env", ["SPOTIFY_CLIENT_ID", "SPOTIFY_CLIENT_SECRET", "SPOTIFY_REFRESH_TOKEN"]),
        { ...sourceHealth("Google", sources.google, googleSource?.snapshots?.length ? "data-sources/google/{gmail,calendar,contacts}.json" : googleSource?.statusPath), detail: googleSource?.detail || sources.google },
        {
          id: "google-oauth-client",
          name: "Google OAuth client",
          status: googleSource?.oauthClientExists ? "ok" : "warn",
          detail: googleSource?.oauthClientExists ? "desktop OAuth app present; secret not copied into dashboard state" : "client app file missing",
          evidence: "~/.google_workspace_mcp/client_secret.json presence only"
        },
        {
          id: "google-workspace-login",
          name: "Google Workspace login",
          status: googleSource?.credentialCount > 0 || googleSource?.snapshots?.length ? "ok" : "warn",
          detail: googleSource?.credentialCount > 0 ? "local credential cache present" : "needs browser approval before Gmail/Calendar snapshots can refresh",
          evidence: "~/.google_workspace_mcp/credentials presence only"
        },
        sourceHealth("QuickBooks", sources.quickbooks, "data-sources/quickbooks/STATUS.md"),
        envHealth("QuickBooks env", ["QUICKBOOKS_CLIENT_ID", "QUICKBOOKS_CLIENT_SECRET", "QUICKBOOKS_REFRESH_TOKEN", "QB_CLIENT_ID", "QB_CLIENT_SECRET"]),
        sourceHealth("Anthropic", packageJson?.dependencies?.["@anthropic-ai/sdk"] ? "ok" : "missing", "@anthropic-ai/sdk + ANTHROPIC_API_KEY boolean only")
      ]
    }
  ];

  const all = groups.flatMap((group) => group.checks);
  const counts = all.reduce((acc, check) => {
    acc[check.status] = (acc[check.status] || 0) + 1;
    return acc;
  }, { ok: 0, warn: 0, fail: 0, missing: 0 });

  return {
    generatedAt: NOW.toISOString(),
    safeMode: "no secret values captured; env checks are boolean/redacted",
    counts,
    overall: counts.fail > 0 ? "fail" : counts.missing > 0 || counts.warn > 0 ? "warn" : "ok",
    groups
  };
}

async function systemSnapshot() {
  const sw = await commandLines("/usr/bin/sw_vers");
  const swMap = Object.fromEntries(sw.map((line) => {
    const [k, ...rest] = line.split(":");
    return [k.trim(), rest.join(":").trim()];
  }));
  const disk = (await commandLines("/bin/df", ["-k", "/"])).at(-1)?.split(/\s+/) || [];
  const cpus = os.cpus() || [];
  const model = (await commandLines("/usr/sbin/sysctl", ["-n", "hw.model"])).at(0) || os.machine?.() || os.arch();
  const memGb = os.totalmem() / (1024 ** 3);
  const freeMemGb = os.freemem() / (1024 ** 3);
  const diskTotalGb = Number(disk[1] || 0) / (1024 ** 2);
  const diskFreeGb = Number(disk[3] || 0) / (1024 ** 2);
  return {
    host: os.hostname(),
    model,
    os: `${swMap.ProductName || os.type()} ${swMap.ProductVersion || os.release()}`,
    build: swMap.BuildVersion || os.release(),
    kernel: `${os.type()} ${os.release()}`,
    arch: os.arch(),
    cpu: `${cpus.length || os.availableParallelism?.() || "—"} cores${cpus[0]?.model ? ` · ${cpus[0].model.replace(/\s+/g, " ")}` : ""}`,
    memory: `${memGb.toFixed(0)} GB total · ${freeMemGb.toFixed(1)} GB free`,
    disk: diskTotalGb ? `${diskFreeGb.toFixed(1)} GB free / ${diskTotalGb.toFixed(0)} GB` : "—",
    uptime: `${Math.floor(os.uptime() / 86400)}d ${Math.floor((os.uptime() % 86400) / 3600)}h`,
    load: os.loadavg().map((n) => n.toFixed(2)).join(" / "),
    refreshedAt: NOW.toISOString()
  };
}

function redactContactText(text = "") {
  return text
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[email redacted]")
    .replace(/\b(?:\+?1[-.\s]?)?(?:\(?\d{3}\)?[-.\s]?)\d{3}[-.\s]?\d{4}\b/g, "[phone redacted]")
    .replace(/\s+/g, " ")
    .trim();
}

function parsePeopleNetwork(md) {
  if (!md) return { contacts: 0, emails: 0, phones: 0, circles: [], keyRelationships: [] };
  const operatingCircles = (md.match(/## Operating circles\n([\s\S]*?)(?=\n##\s+Rules|\n##\s+What this is not|$)/) || [])[1] || "";
  const emails = [...operatingCircles.matchAll(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi)].map((m) => m[0]);
  const phones = [...operatingCircles.matchAll(/\b(?:\d{3}[-.\s])\d{3}[-.\s]\d{4}\b/g)].map((m) => m[0]);
  const circles = [];
  let current = null;
  for (const line of operatingCircles.split("\n")) {
    const h = line.match(/^###\s+(.+)/);
    if (h) {
      current = { name: h[1].trim(), count: 0 };
      circles.push(current);
      continue;
    }
    if (current && /^- \*\*.+?\*\*\s*(?:\(.*?\))?\s*—/.test(line)) current.count += 1;
  }
  const keyRelationships = [];
  for (const line of operatingCircles.split("\n")) {
    const m = line.match(/^- \*\*(.+?)\*\*\s*(?:\((.*?)\))?\s*—\s*(.+)$/);
    if (!m) continue;
    keyRelationships.push({
      name: m[1].trim(),
      org: (m[2] || "").trim(),
      role: redactContactText(m[3].replace(/`[^`]+`/g, "")).slice(0, 150)
    });
  }
  return {
    contacts: keyRelationships.length,
    emails: new Set(emails).size,
    phones: new Set(phones).size,
    circles,
    keyRelationships: keyRelationships.slice(0, 12)
  };
}

function parseInfraSignals(md) {
  if (!md) return [];
  const section = (md.match(/## Signals from source\n([\s\S]*?)(?=\n##|$)/) || [])[1] || "";
  return section.split("\n")
    .map((l) => l.replace(/^-\s*/, "").trim())
    .filter((l) => l && !l.endsWith(":"))
    .slice(0, 8);
}

// ---------- vault inventory ----------

async function inventoryFolder(rel) {
  const full = join(VAULT, rel);
  if (!existsSync(full)) return { rel, files: 0, bytes: 0 };
  const files = await walk(full);
  let bytes = 0;
  let mtimeMax = 0;
  for (const f of files) {
    const s = await statSafe(f);
    if (!s) continue;
    bytes += s.size;
    if (s.mtimeMs > mtimeMax) mtimeMax = s.mtimeMs;
  }
  return { rel, files: files.length, bytes, mtimeMax };
}

async function vaultInventory() {
  const folders = ["inbox", "raw", "wiki", "outputs", "projects", "areas", "resources", "daily", "archive", "assets", "agents"];
  const results = await Promise.all(folders.map(inventoryFolder));
  return Object.fromEntries(results.map((r) => [r.rel, r]));
}

async function rawByMedium() {
  const buckets = ["screenshots", "ai-chats", "imports", "transcripts", "videos", "audio", "articles", "references"];
  const results = await Promise.all(buckets.map((b) => inventoryFolder(`raw/${b}`)));
  return Object.fromEntries(results.map((r) => [r.rel.replace("raw/", ""), r]));
}

async function newEntriesLast7d() {
  const sevenDaysAgo = daysAgo(NOW, 7).getTime();
  const all = await walk(VAULT);
  let count = 0;
  for (const f of all) {
    const s = await statSafe(f);
    if (s && s.mtimeMs >= sevenDaysAgo && f.endsWith(".md")) count++;
  }
  return count;
}

// ---------- markdown parsers ----------

function parseFrontmatter(md) {
  const m = md.match(/^---\n([\s\S]*?)\n---\n/);
  if (!m) return {};
  const out = {};
  for (const line of m[1].split("\n")) {
    const kv = line.match(/^(\w+):\s*(.+)$/);
    if (kv) out[kv[1]] = kv[2].replace(/^["']|["']$/g, "");
  }
  return out;
}

function parseUrgentItems(md) {
  // URGENT.md uses "## N. Title" with action sections. Pull title + a real deadline if explicit.
  // Only treat dates in actionable contexts ("By <date>", "deadline <date>", "before <date>") as deadlines —
  // not historical source dates in the body.
  const items = [];
  const sections = md.split(/\n## /).slice(1);
  for (const s of sections) {
    const head = s.split("\n")[0];
    const m = head.match(/^(\d+)\.\s+(.+)$/);
    if (!m) continue;
    const body = s;
    const dated = body.match(/\b(?:by|before|deadline|by:)\s+(\d{4}-\d{2}-\d{2})\b/i);
    const thisWeek = /\bthis week\b/i.test(body);
    let deadline = null;
    let level = "WATCH";
    if (dated) {
      deadline = dated[1];
      const dl = new Date(deadline);
      const days = (dl - NOW) / 86400000;
      level = days <= 3 ? "CRITICAL" : days <= 14 ? "ACTIVE" : "WATCH";
    } else if (thisWeek) {
      deadline = "this week";
      level = "WATCH";
    }
    items.push({ n: Number(m[1]), title: m[2].trim(), deadline, level });
  }
  return items;
}

function parseAgentsTable(md) {
  // Pull rows from the active agents markdown table.
  const lines = md.split("\n");
  const tableStart = lines.findIndex((l) => l.startsWith("| Name |"));
  if (tableStart < 0) return { active: [], parking: [] };
  const active = [];
  for (let i = tableStart + 2; i < lines.length; i++) {
    const l = lines[i].trim();
    if (!l.startsWith("|")) break;
    const cols = l.split("|").map((c) => c.trim()).filter(Boolean);
    if (cols.length < 11) continue;
    active.push({
      name: cols[0],
      purpose: cols[1],
      tool: cols[2],
      focus: cols[3],
      status: cols[4],
      trl: Number(cols[5]) || 0,
      lastUsed: cols[6],
      output30d: cols[7],
      contextFolder: cols[8],
      rule: cols[9],
      disposition: cols[10]
    });
  }
  // Parking lot
  const parkStart = lines.findIndex((l) => l.startsWith("| Name |") && lines.indexOf(l) > tableStart);
  const parking = [];
  if (parkStart > 0) {
    for (let i = parkStart + 2; i < lines.length; i++) {
      const l = lines[i].trim();
      if (!l.startsWith("|")) break;
      const cols = l.split("|").map((c) => c.trim()).filter(Boolean);
      if (cols.length < 4) continue;
      parking.push({
        name: cols[0],
        whyMatters: cols[1],
        reasonDemoted: cols[2],
        decisionDate: cols[3]
      });
    }
  }
  return { active, parking };
}

function parseDecisionLogCount(md) {
  // Count rows in markdown tables, minus the header rows.
  const lines = md.split("\n");
  let rows = 0;
  let inTable = false;
  for (const l of lines) {
    if (/^\|\s*-+/.test(l)) { inTable = true; continue; }
    if (inTable && l.startsWith("|") && !/^\|\s*-+/.test(l)) {
      // Skip the header row above the divider — handled by `inTable` flag flipping on divider
      rows++;
    } else if (!l.startsWith("|")) {
      inTable = false;
    }
  }
  return rows;
}

function parseDeepDiveBriefs(filenames) {
  // From outputs/chatgpt-deep-dive/INDEX.md — count HIGH/MEDIUM/LOW briefs.
  const briefs = filenames.filter((f) => /^\d{4}-\d{2}-\d{2}-/.test(f) && f.endsWith(".md"));
  return briefs;
}

function parseProcessingQueue(md) {
  const items = [];
  const sections = md.split(/\n### /).slice(1);
  for (const s of sections) {
    const head = s.split("\n")[0];
    const m = head.match(/^(\d+)\.\s+(.+)$/);
    if (!m) continue;
    items.push({ n: Number(m[1]), title: m[2].trim() });
  }
  return items;
}

function parseProjects(files) {
  // Each project file has YAML frontmatter or a leading H1. Pull title + status if visible.
  return files.map((f) => {
    const fm = parseFrontmatter(f.content);
    const h1 = (f.content.match(/^# (.+)$/m) || [])[1];
    const statusMatch = f.content.match(/^##\s*Status\s*\n([\s\S]*?)(?=\n##|$)/m);
    const status = (statusMatch ? statusMatch[1].trim().split("\n")[0] : fm.status || "Active").trim();
    return {
      file: f.rel,
      title: fm.title || h1 || f.rel,
      status,
      priority: fm.priority || null,
      updated: fm.updated || null
    };
  });
}

// ---------- assemble state ----------

async function build() {
  log("walking vault…");
  const inv = await vaultInventory();
  const raw = await rawByMedium();
  const newWeek = await newEntriesLast7d();

  // Read key vault files
  const urgentMd = await readSafe(join(VAULT, "outputs/chatgpt-deep-dive/URGENT.md"));
  const agentsMd = await readSafe(join(VAULT, "agents/INDEX.md"));
  const decisionMd = await readSafe(join(VAULT, "outputs/chatgpt-deep-dive/DECISION-LOG.md"));
  const queueMd = await readSafe(join(VAULT, "raw/imports/PROCESSING_QUEUE.md"));
  const vaultStatusMd = await readSafe(join(VAULT, "outputs/Vault Status.md"));
  const peopleMd = await readSafe(join(VAULT, "wiki/network/people.md"));
  const infraMd = await readSafe(join(VAULT, "areas/infrastructure/email-and-storage.md"));
  const system = await systemSnapshot();
  const packageJson = await readJSONSafe(join(REPO, "package.json"));

  // Project files
  const projectFiles = (await readdir(join(VAULT, "projects"))).filter((n) => n.endsWith(".md"));
  const projectsContent = await Promise.all(projectFiles.map(async (n) => ({
    rel: `projects/${n}`,
    content: await readSafe(join(VAULT, "projects", n))
  })));
  const projects = parseProjects(projectsContent);

  // Area files
  const areaFiles = (await readdir(join(VAULT, "areas"))).filter((n) => n.endsWith(".md"));
  const areas = areaFiles.map((n) => ({ file: `areas/${n}`, title: n.replace(/\.md$/, "") }));

  // Deep dive briefs
  let deepDiveCount = 0;
  if (existsSync(join(VAULT, "outputs/chatgpt-deep-dive"))) {
    const ddFiles = await readdir(join(VAULT, "outputs/chatgpt-deep-dive"));
    deepDiveCount = parseDeepDiveBriefs(ddFiles).length;
  }

  // Wiki notes
  const wikiNotes = (await walk(join(VAULT, "wiki"))).filter((f) => f.endsWith(".md")).map((f) => relative(VAULT, f));

  // MCP snapshots
  const spotify = await readJSONSafe(join(SOURCES, "spotify/snapshot.json"));
  const spotifyAppConfig = await readJSONSafe(join(SOURCES, "spotify/app-config.json"));
  const spotifyAuthStatus = await readJSONSafe(join(SOURCES, "spotify/auth-status.json"));
  const worldNews = await readJSONSafe(join(SOURCES, "world/news.json"));
  const googleSource = await buildGoogleSourceState();
  const googleStatus = googleSource.status;
  const qbStatus = existsSync(join(SOURCES, "quickbooks/STATUS.md")) ? "blocked" : "ok";

  // Tier 2 money extraction — outputs/money/SUMMARY.json (catalog CSVs, BMI/WCM xlsx,
  // WSN xls, Pershing 1099 via pdfplumber, Capital One statements, splice invoices).
  const moneyExtract = await readJSONSafe(join(VAULT, "outputs/money/SUMMARY.json"));
  const moneyCatalog = await readJSONSafe(join(VAULT, "outputs/money/catalog.json"));

  // Music tab tile data sources (added 2026-05-11 from BMI catalog audit)
  const bmiAccounts = await readJSONSafe(join(SOURCES, "bmi/accounts.json"));
  const songviewConflicts = await readJSONSafe(join(SOURCES, "bmi/songview-conflicts.json"));
  const annualRoyalty = await readJSONSafe(join(SOURCES, "bmi/annual-royalty.json"));
  const soundExchange = await readJSONSafe(join(SOURCES, "bmi/soundexchange.json"));
  const warnerDeal = await readJSONSafe(join(SOURCES, "warner-chappell/deal.json"));
  const warnerPayments = await readJSONSafe(join(SOURCES, "warner-chappell/payments.json"));
  const negotiations = await readJSONSafe(join(SOURCES, "negotiations/active.json"));

  // Live recompute: daysSinceLastResponse counters tick forward without any data file edit.
  // Each negotiation has lastResponseFromThemISO (ISO 8601); we compute days here so the
  // dashboard always shows current values rather than the stale hardcoded number.
  if (negotiations?.negotiations?.length) {
    const now = NOW.getTime();
    for (const n of negotiations.negotiations) {
      const iso = n.lastResponseFromThemISO || (n.lastResponseFromThem ? `${n.lastResponseFromThem}T00:00:00Z` : null);
      if (iso) {
        const t = new Date(iso).getTime();
        if (!Number.isNaN(t)) n.daysSinceLastResponse = Math.max(0, Math.floor((now - t) / 86400000));
      }
      n.lastCheckedAt = NOW.toISOString();
    }
  }

  const musicOsData = await buildMusicOsData({
    spotify, spotifyAppConfig, spotifyAuthStatus, moneyExtract, moneyCatalog,
    bmiAccounts, songviewConflicts, annualRoyalty, soundExchange,
    warnerDeal, warnerPayments, negotiations
  });

  // Parse domain data
  const urgent = urgentMd ? parseUrgentItems(urgentMd) : [];
  const agents = agentsMd ? parseAgentsTable(agentsMd) : { active: [], parking: [] };
  const decisionRows = decisionMd ? parseDecisionLogCount(decisionMd) : 0;
  const queue = queueMd ? parseProcessingQueue(queueMd) : [];
  const peopleNetwork = parsePeopleNetwork(peopleMd);
  const infraSignals = parseInfraSignals(infraMd);
  const healthChecks = await buildHealthChecks({ inv, newWeek, spotify, spotifyAppConfig, spotifyAuthStatus, googleSource, qbStatus, peopleMd, packageJson });

  // Synthesis gaps from Vault Status. After 2026-05-08 doctrine override, the seven
  // candidates were promoted to wiki/ with frontmatter `status: ai-drafted-needs-rewrite`.
  // A gap is now considered "filled" once the user has rewritten — i.e. status no longer
  // contains "ai-drafted-needs-rewrite".
  const aiDraftedFiles = new Set();
  for (const f of (await walk(join(VAULT, "wiki"))).filter(p => p.endsWith(".md"))) {
    const content = await readSafe(f);
    if (content && /status:\s*ai-drafted-needs-rewrite/.test(content)) {
      aiDraftedFiles.add(relative(VAULT, f));
    }
  }
  const synthesisGapDefs = [
    { title: "What this vault is for, and what it is not for", file: "wiki/What this vault is for, and what it is not for.md", reason: "constitution — highest-leverage missing wiki note" },
    { title: "Music catalog", file: "wiki/music/catalog.md", reason: "every track, status, ownership, splits, masters, registrations" },
    { title: "Network / people", file: "wiki/network/people.md", reason: "top 30 relationships, last contact, what they're for" },
    { title: "Business state", file: "wiki/business/state.md", reason: "income sources, monthly burn, runway — required for allocator-grade decisions" },
    { title: "Agent governance", file: "wiki/Agent Governance.md", reason: "synthesis from chairman governance transcript" },
    { title: "Claude Code + Obsidian workflow", file: "wiki/Claude Code + Obsidian Workflow.md", reason: "blocked behind transcription of May-5 screen recording" },
    { title: "ASHLAND visual world", file: "wiki/ASHLAND visual world.md", reason: "promote-if-canon — currently a resource" }
  ];
  const synthesisGaps = synthesisGapDefs.map((g) => ({
    ...g,
    exists: existsSync(join(VAULT, g.file)),
    state: !existsSync(join(VAULT, g.file)) ? "missing"
         : aiDraftedFiles.has(g.file) ? "ai-drafted-needs-rewrite"
         : "claimed"
  }));

  const totalFiles = Object.values(inv).reduce((a, b) => a + b.files, 0);
  const totalBytes = Object.values(inv).reduce((a, b) => a + b.bytes, 0);

  // ---------- shape per-tab state ----------

  const state = {
    meta: {
      generatedAt: NOW.toISOString(),
      today: TODAY,
      vaultRoot: VAULT,
      sources: {
        vault: "ok",
        spotify: spotify ? "snapshot" : "missing",
        google: googleStatus,
        finance: moneyExtract ? "extracted" : qbStatus,
        quickbooks: qbStatus
      }
    },

    hub: {
      northStars: [
        { domain: "Music", metric: "Catalog wiki", value: existsSync(join(VAULT, "wiki/music/catalog.md")) ? "exists" : "MISSING", type: "stock", awaiting: !existsSync(join(VAULT, "wiki/music/catalog.md")) ? "wiki/music/catalog.md" : null },
        { domain: "Finance", metric: "Vault financial reality", value: existsSync(join(VAULT, "wiki/business/state.md")) ? "captured" : "MISSING", type: "control", awaiting: !existsSync(join(VAULT, "wiki/business/state.md")) ? "wiki/business/state.md" : null },
        { domain: "Network", metric: "People wiki", value: existsSync(join(VAULT, "wiki/network/people.md")) ? "captured" : "MISSING", type: "pipeline", awaiting: !existsSync(join(VAULT, "wiki/network/people.md")) ? "wiki/network/people.md" : null },
        { domain: "Agents", metric: "Active TRL≥4", value: `${agents.active.filter((a) => a.trl >= 4).length} / ${agents.active.length}`, type: "input" },
        { domain: "Vault", metric: "Total entries", value: `${totalFiles}`, type: "leading" }
      ],
      triggers: urgent.map((u) => ({
        label: u.title.slice(0, 36),
        rule: u.deadline ? `deadline ${u.deadline}` : "this week",
        level: u.level,
        n: u.n
      })),
      killList: [
        // Pulled directly from areas/AI Capture and Information Defaults.md
        "Screenshotting framework grids — write in own words or scroll past",
        "TikTok aphorisms / 'i hope you' content",
        "Influencer prompt grids / 'secret codes'",
        "Tool catalogs (stale in 60 days)",
        "Beginner-level reference content in domains past beginner"
      ],
      content: {
        kpis: [
          ["Outputs", `${inv.outputs.files}`, "files generated"],
          ["Deep-dive briefs", `${deepDiveCount}`, "from ChatGPT export"],
          ["Wiki notes", `${inv.wiki.files}`, "synthesis"],
          ["Active projects", `${projects.length}`, projects.length < 3 ? "below floor" : "ok"]
        ],
        economics: [
          ["AI-chats raw", `${raw["ai-chats"].files}`, "largest single corpus"],
          ["Screenshots", `${raw.screenshots.files}`, "May 5–6 session-heavy"],
          ["Imports", `${raw.imports.files}`, "queue: " + queue.length + " to process"],
          ["Total raw size", fmtBytes(raw["ai-chats"].bytes + raw.screenshots.bytes + raw.imports.bytes + raw.videos.bytes + raw.audio.bytes), "all media"]
        ]
      }
    },

    brain: {
      stats: [
        ["Vault entries", `${totalFiles}`],
        ["New entries (7d)", `${newWeek}`],
        ["Decision-log rows", `${decisionRows}`],
        ["Processing queue", `${queue.length}`]
      ],
      focus: agents.active.slice(0, 4).map((a) => ({
        label: a.name,
        val: Math.min(100, a.trl * 20)
      })),
      operator: [
        ["Active projects", `${projects.length}`],
        ["Active areas", `${areas.length}`],
        ["Wiki synthesis", `${inv.wiki.files} notes`],
        ["Synthesis gaps", `${synthesisGaps.filter((g) => !existsSync(join(VAULT, g.file))).length}`]
      ],
      memoryAllocation: {
        rawSize: fmtBytes(inv.raw.bytes),
        synthesizedSize: fmtBytes(inv.wiki.bytes + inv.outputs.bytes),
        capture: { quickNotes: inv.inbox.files, voiceMemos: raw.audio.files },
        research: queue
      },
      synthesisGaps,
      agents
    },

    music: {
      ...musicOsData,
      spotify: spotify || { awaiting: "data-sources/spotify/snapshot.json" },
      epkTracks: spotify?.topTracksFromVaultEPK || [],
      credits: spotify?.credits || [],
      pipeline: [
        ["m.A.A.d city legal", "active", "Lewis Brisbois / Jay-Jay Lord chain"],
        ["Royalty review", existsSync(join(VAULT, "areas/money/royalty-review.md")) ? "active" : "missing", "BMI / Warner / Kimie Aryai"],
        ["EPK shoot", "designed", "5-act structure locked 2025-03-17"],
        ["Sync deals", "no project file", "AWAITING projects/sync-deals.md"]
      ],
      catalogAwaiting: !existsSync(join(VAULT, "wiki/music/catalog.md"))
        ? { file: "wiki/music/catalog.md", note: "TRL-1 → TRL-5 most asymmetric upgrade per chairman self-assessment" }
        : null,
      catalog: moneyCatalog ? {
        ...musicOsData.catalog,
        uniqueWorks: moneyCatalog.unique_works,
        uniqueTitles: moneyCatalog.unique_titles,
        axelCreditedTitles: (moneyCatalog.axel_titles ?? []).length,
        songviewConflicts: moneyCatalog.with_conflicts,
        axelIdentities: (moneyCatalog.axel_participants_seen ?? []).map((p) => p.participant),
        conflictsDetailed: (moneyCatalog.works ?? []).filter((w) => w.has_conflict).map((w) => ({
          title: w.title,
          iswc: w.iswc || null,
          coWriters: (w.writers ?? []).filter((p) => !/MORGAN|AXEL|AXLFOLIE/i.test(p.participant)).map((p) => p.participant).slice(0, 4),
          conflict: (w.conflicts ?? [])[0] || "Share and/or Participant Conflict"
        }))
      } : musicOsData.catalog
    },

    finance: (() => {
      const m = moneyExtract;
      const fmt = (n) => n == null ? "—" : n >= 1000 ? `$${(n / 1000).toFixed(1)}K` : `$${n.toFixed(2)}`;
      const bmiYtd = m?.income?.bmi_ytd_2025_as_of_aug_21;
      const bmiPeriod = m?.income?.bmi_period_1q_2025;
      const wcmTotal = m?.income?.bmi_warner_xlsx_total;
      const wsn = m?.income?.wsn_buried_estimate;
      const tax = (m?.tax_exposure?.federal_2024_balance_due ?? 0) + (m?.tax_exposure?.ca_llc_2024_balance_due ?? 0);
      const pershingInterest = m?.income?._1099_2024?.extractions?.box_1_interest_income
        ?? m?.income?.["1099_2024"]?.extractions?.box_1_interest_income;
      const pershingActivity = (m?.assets?.pershing_brokerage_via_ohearn?.["2024_largest_amounts_seen"] ?? [])[0];
      const splice = m?.expenses?.splice_recent_invoices;
      const cardSpend = m?.expenses?.card_spend_feb_apr_2025_combined;
      const royaltyTotal = (bmiYtd ?? 0) + (wcmTotal ?? 0) + (wsn ?? 0);
      return {
        status: m ? "extracted" : qbStatus,
        kpis: m ? [
          { label: "Royalty income (extracted)", value: fmt(royaltyTotal), delta: "BMI+WCM+WSN", awaiting: null },
          { label: "Tax exposure (2024)", value: fmt(tax), delta: "fed + CA", awaiting: null },
          { label: "Pershing tax activity (not cash)", value: pershingActivity ? `${fmt(pershingActivity)} activity` : "—", delta: `2024 interest ${fmt(pershingInterest)}`, awaiting: null },
          { label: "Card spend (Feb–Apr 25)", value: fmt(cardSpend), delta: `Splice ${fmt(splice)}/mo`, awaiting: null }
        ] : [
          { label: "Cash on hand", value: "AWAITING", delta: "QuickBooks re-auth", awaiting: "data-sources/quickbooks/STATUS.md" },
          { label: "Monthly burn", value: "AWAITING", delta: "QuickBooks re-auth", awaiting: "data-sources/quickbooks/STATUS.md" },
          { label: "Runway", value: "AWAITING", delta: "no source", awaiting: "wiki/business/state.md" },
          { label: "Vault financial doc", value: existsSync(join(VAULT, "wiki/business/state.md")) ? "exists" : "MISSING", delta: existsSync(join(VAULT, "wiki/business/state.md")) ? "ok" : "must author", awaiting: !existsSync(join(VAULT, "wiki/business/state.md")) ? "wiki/business/state.md" : null }
        ],
        sources: m ? [
          { label: "BMI (YTD 2025)", val: Math.min(100, Math.round((bmiYtd ?? 0) / 50)), amount: fmt(bmiYtd) },
          { label: "Warner Chappell (xlsx)", val: Math.min(100, Math.round((wcmTotal ?? 0) / 200)), amount: fmt(wcmTotal) },
          { label: "WSN BURIED (est.)", val: Math.min(100, Math.round((wsn ?? 0) * 4)), amount: fmt(wsn) },
          { label: "Pershing tax doc", val: pershingActivity ? 80 : 0, amount: pershingActivity ? `~${fmt(pershingActivity)} 2024 activity, not cash` : "AWAITING" }
        ] : [
          { label: "Music (royalties)", val: 0, amount: "AWAITING capture" },
          { label: "AI content", val: 0, amount: "AWAITING capture" },
          { label: "Sync / film", val: 0, amount: "AWAITING capture" },
          { label: "Other", val: 0, amount: "AWAITING capture" }
        ],
        watchlist: [
          `${moneyCatalog?.with_conflicts ?? 0} Songview catalog conflicts`,
          `$${tax >= 1000 ? Math.round(tax / 1000) + "K" : tax} tax owed`,
          "Pershing tax doc is historical activity, not survival cash",
          "Portal creds unrotated",
          "First paid offer not live"
        ],
        pershingAdvisor: m?.assets?.pershing_brokerage_via_ohearn ?? null,
        draftReturnLocked: m?.draft_return_2024_status?.extracted === false,
        awaiting: {
          quickbooks: "data-sources/quickbooks/STATUS.md",
          draftReturn: m?.draft_return_2024_status?.next_step ?? null,
          wikiBusinessState: existsSync(join(VAULT, "wiki/business/state.md")) ? null : "wiki/business/state.md",
          royaltyReview: existsSync(join(VAULT, "areas/money/royalty-review.md")) ? null : "areas/money/royalty-review.md",
          domainAudit: existsSync(join(VAULT, "areas/infrastructure/domains.md")) ? null : "areas/infrastructure/domains.md"
        },
        doctrine: [
          "MONEY IS A SENSOR.",
          "RUNWAY IS FREEDOM.",
          "FLOW PAYS TODAY.",
          "STOCK BUILDS POWER."
        ]
      };
    })(),

    network: {
      kpis: [
        ["Active agents", `${agents.active.length}`, `${agents.active.filter((a) => a.trl >= 4).length} TRL≥4`],
        ["Governed contacts", `${peopleNetwork.contacts}`, `${peopleNetwork.circles.filter((c) => c.count > 0).length} circles`],
        ["Local system", system.host, system.uptime],
        ["People wiki", existsSync(join(VAULT, "wiki/network/people.md")) ? "exists" : "MISSING", peopleMd && !/ai-drafted-needs-rewrite/.test(peopleMd) ? "governed" : "needs rewrite"]
      ],
      agents: agents.active.map((a) => ({
        label: a.name,
        val: a.trl * 20,
        amount: `TRL ${a.trl} · ${a.lastUsed}`
      })),
      risks: urgent.map((u) => [
        u.title.slice(0, 28),
        u.deadline || "this week",
        u.level === "CRITICAL" ? "RED" : u.level === "WATCH" ? "WATCH" : u.level
      ]),
      alerts: [
        { level: "red", text: "m.A.A.d city legal active — IP-Defense.md is the live doc" },
        { level: "yellow", text: `${urgent.length} urgent items, ${urgent.filter((u) => u.deadline && u.deadline !== "this week").length} dated` },
        { level: "yellow", text: `${synthesisGaps.filter((g) => !existsSync(join(VAULT, g.file))).length} synthesis gaps unfilled` }
      ],
      people: peopleNetwork,
      infrastructure: {
        signals: infraSignals,
        source: "areas/infrastructure/email-and-storage.md",
        googleStatus,
        googleDetail: googleSource.detail,
        quickbooksStatus: qbStatus
      },
      system,
      healthChecks,
      audienceAwaiting: {
        gmail: googleStatus === "snapshot" ? null : googleStatus === "configured" ? "Google Workspace snapshot refresh" : "Google Workspace login / snapshot refresh",
        peopleWiki: existsSync(join(VAULT, "wiki/network/people.md")) ? null : "wiki/network/people.md"
      },
      conversionFunnel: {
        awaiting: !existsSync(join(VAULT, "wiki/network/people.md")),
        pointer: "wiki/network/people.md",
        contacts: peopleNetwork.contacts
      }
    },

    world: {
      news: worldNews?.items?.length ? {
        status: worldNews.status || "live",
        fetchedAt: worldNews.fetchedAt,
        sourceCount: worldNews.feeds?.length || 0,
        itemCount: worldNews.items.length,
        items: worldNews.items,
        errors: worldNews.errors || []
      } : {
        awaiting: "no news source wired (consider RSS feed list in resources/)",
        pointer: "resources/news-sources.md"
      },
      cultural: [
        { label: "Spotify presence", val: spotify ? 60 : 0, note: spotify ? "editorial playlist exists" : "AWAITING" },
        { label: "Brand search", val: 0, note: "AWAITING — Google Trends not wired" },
        { label: "Catalog visibility", val: existsSync(join(VAULT, "wiki/music/catalog.md")) ? 50 : 5, note: "depends on catalog wiki" },
        { label: "Domains health", val: existsSync(join(VAULT, "areas/infrastructure/domains.md")) ? 80 : 20, note: existsSync(join(VAULT, "areas/infrastructure/domains.md")) ? "audited" : "URGENT #5" }
      ],
      anomalies: urgent.map((u) => ({
        label: u.title.slice(0, 32),
        value: u.deadline || "this week",
        level: u.level
      })),
      sentimentIndex: spotify ? 60 : 30
    },

    // raw inventory for any panel that wants it
    inventory: {
      folders: inv,
      raw,
      totalFiles,
      totalBytes,
      newWeek,
      synthesisGaps,
      projects,
      areas,
      wikiNotes,
      processingQueue: queue,
      urgentItems: urgent
    }
  };

  await writeFile(OUT, JSON.stringify(state, null, 2));
  log(`wrote ${OUT}`);
  log(`vault: ${totalFiles} files, ${fmtBytes(totalBytes)}, ${newWeek} new this week`);
  log(`urgent: ${urgent.length} items, ${urgent.filter((u) => u.level === "CRITICAL").length} critical`);
  log(`agents: ${agents.active.length} active, ${agents.parking.length} parking`);
  log(`synthesis gaps: ${synthesisGaps.filter((g) => !existsSync(join(VAULT, g.file))).length} of ${synthesisGaps.length} unfilled`);
}

build().catch((err) => {
  console.error("[build-data] FAILED", err);
  process.exit(1);
});
