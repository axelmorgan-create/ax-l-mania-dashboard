#!/usr/bin/env node
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const OUT_DIR = join(process.cwd(), "data-sources/world");
const OUT = join(OUT_DIR, "news.json");
const FEEDS = [
  { source: "BBC World", url: "https://feeds.bbci.co.uk/news/world/rss.xml" },
  { source: "The Verge", url: "https://www.theverge.com/rss/index.xml" }
];

const JSON_FEEDS = [
  { source: "Spaceflight News", url: "https://api.spaceflightnewsapi.net/v4/articles/?limit=6" }
];

function decodeXml(s = "") {
  return s
    .replace(/<!\[CDATA\[(.*?)\]\]>/gs, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim();
}

function tag(item, name) {
  const m = item.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)<\\/${name}>`, "i"));
  return decodeXml(m?.[1] || "");
}

async function fetchFeed(feed) {
  const res = await fetch(feed.url, { headers: { "user-agent": "AX-L-Mania-Dashboard/1.0" } });
  if (!res.ok) throw new Error(`${feed.source} ${res.status}`);
  const xml = await res.text();
  const rssItems = [...xml.matchAll(/<item[\s\S]*?<\/item>/gi)].map((m) => ({
    source: feed.source,
    title: tag(m[0], "title").replace(/\s+/g, " ").slice(0, 140),
    url: tag(m[0], "link"),
    publishedAt: tag(m[0], "pubDate") || tag(m[0], "updated") || null
  }));
  const atomEntries = [...xml.matchAll(/<entry[\s\S]*?<\/entry>/gi)].map((m) => {
    const href = m[0].match(/<link[^>]+href=["']([^"']+)["'][^>]*>/i)?.[1] || tag(m[0], "link");
    return {
      source: feed.source,
      title: tag(m[0], "title").replace(/\s+/g, " ").slice(0, 140),
      url: decodeXml(href),
      publishedAt: tag(m[0], "published") || tag(m[0], "updated") || null
    };
  });
  return [...rssItems, ...atomEntries].slice(0, 6).filter((x) => x.title);
}

async function fetchJsonFeed(feed) {
  const res = await fetch(feed.url, { headers: { "user-agent": "AX-L-Mania-Dashboard/1.0" } });
  if (!res.ok) throw new Error(`${feed.source} ${res.status}`);
  const payload = await res.json();
  const rows = Array.isArray(payload?.results) ? payload.results : Array.isArray(payload) ? payload : [];
  return rows.slice(0, 6).map((item) => ({
    source: feed.source,
    title: String(item.title || item.name || "").replace(/\s+/g, " ").slice(0, 140),
    url: item.url || item.news_site || "",
    publishedAt: item.published_at || item.updated_at || item.publishedAt || null
  })).filter((x) => x.title);
}

async function main() {
  const results = [];
  const errors = [];
  for (const feed of FEEDS) {
    try { results.push(...await fetchFeed(feed)); }
    catch (e) { errors.push({ source: feed.source, status: "warn", detail: e.message }); }
  }
  for (const feed of JSON_FEEDS) {
    try { results.push(...await fetchJsonFeed(feed)); }
    catch (e) { errors.push({ source: feed.source, status: "warn", detail: e.message }); }
  }
  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(OUT, JSON.stringify({
    fetchedAt: new Date().toISOString(),
    status: results.length ? "live" : "warn",
    feeds: [
      ...FEEDS.map(({ source, url }) => ({ source, url })),
      ...JSON_FEEDS.map(({ source, url }) => ({ source, url }))
    ],
    items: results.slice(0, 12),
    errors
  }, null, 2));
  console.log(`[world-news] wrote ${OUT} (${results.length} items)`);
}

main().catch((err) => { console.error(`[world-news] ${err.message}`); process.exit(0); });
