#!/usr/bin/env node
/**
 * Foleybot — local Claude proxy for AX-L Mania.
 *
 * Run alongside `npm run dev` or `npm run dev:electron`:
 *   ANTHROPIC_API_KEY=sk-ant-... npm run foleybot
 *
 * Vite proxies /api/foleybot → http://localhost:8787 (see vite.config.js).
 *
 * The cockpit reads the brain vault + state.json on every request, so Claude
 * answers from your real state, not generic training data.
 */
import http from "node:http"
import { readFile, readdir } from "node:fs/promises"
import { existsSync } from "node:fs"
import { join } from "node:path"
import { fileURLToPath } from "node:url"
import { homedir } from "node:os"
import Anthropic from "@anthropic-ai/sdk"

try { process.loadEnvFile(fileURLToPath(new URL("../.env", import.meta.url))) } catch {}

const PORT = Number(process.env.FOLEYBOT_PORT || 8787)
const VAULT = join(homedir(), "Documents", "brain 2")
const STATE_JSON = join(homedir(), "ax-l-mania-dashboard", "src", "data", "state.json")
const MODEL = process.env.FOLEYBOT_MODEL || "claude-sonnet-4-6"
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY || ""
const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY || ""
const HAS_REAL_ANTHROPIC_KEY = ANTHROPIC_KEY && !/your|placeholder|todo|xxx/i.test(ANTHROPIC_KEY)
const PROVIDER = HAS_REAL_ANTHROPIC_KEY ? "anthropic" : OPENROUTER_KEY ? "openrouter" : null

if (!PROVIDER) {
  console.error("FATAL: no valid model API key found. Set ANTHROPIC_API_KEY or OPENROUTER_API_KEY.")
  process.exit(1)
}

const client = PROVIDER === "anthropic" ? new Anthropic({ apiKey: ANTHROPIC_KEY }) : null

async function buildContext() {
  const parts = []
  // 1. Cockpit state snapshot — single consolidated JSON
  if (existsSync(STATE_JSON)) {
    parts.push(`### state.json (cockpit snapshot)\n\`\`\`json\n${await readFile(STATE_JSON, "utf8")}\n\`\`\``)
  }
  // 2. Latest daily brief
  const dailyDir = join(VAULT, "daily")
  const briefs = (await readdir(dailyDir)).filter(f => /^brief-\d{4}-\d{2}-\d{2}\.md$/.test(f)).sort().reverse()
  if (briefs[0]) {
    parts.push(`### Latest brief — ${briefs[0]}\n${await readFile(join(dailyDir, briefs[0]), "utf8")}`)
  }
  // 3. The two governing project files
  for (const rel of ["projects/first-paid-offer.md", "projects/IP-Defense.md"]) {
    const p = join(VAULT, rel)
    if (existsSync(p)) parts.push(`### ${rel}\n${await readFile(p, "utf8")}`)
  }
  return parts.join("\n\n---\n\n")
}

const SYSTEM = `You are Foleybot, the in-cockpit assistant for Axel Morgan's AXIS Command Center. You answer from his real vault state (which is appended below as cached context).

Operating rules:
- Be direct. No fluff. No motivational filler. No hedging.
- Optimize for leverage and income. Tell him what's missing, not just what he asked.
- The carrying rule from his own 2026-05-07 distillation: no new tool, app, book, course, or data ingestion until one priced offer is live in market. If the question violates the rule, name it.
- The pattern named in his daily brief: "circling architectural sovereignty over imagined assets while existing assets sit ungoverned." If the question feeds the pattern, call it.
- Use file paths in answers when relevant (e.g. \`projects/first-paid-offer.md\`).
- Keep answers under ~200 words unless asked for depth.
- Match the cockpit aesthetic: calm, technical, high-control. No emojis.`

async function handleChat(prompt) {
  const context = await buildContext()
  if (PROVIDER === "anthropic") {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 1024,
      system: [
        { type: "text", text: SYSTEM },
        { type: "text", text: `# Cockpit context (cached for 5 minutes)\n\n${context}`, cache_control: { type: "ephemeral" } },
      ],
      messages: [{ role: "user", content: prompt }],
    })
    const text = response.content
      .filter(b => b.type === "text")
      .map(b => b.text)
      .join("\n")
    const usage = response.usage
    return { text, usage }
  }

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${OPENROUTER_KEY}`,
      "HTTP-Referer": "http://localhost:5173",
      "X-Title": "AX-L Mania Command Center"
    },
    body: JSON.stringify({
      model: process.env.FOLEYBOT_OPENROUTER_MODEL || "anthropic/claude-sonnet-4.5",
      max_tokens: 1024,
      messages: [
        { role: "system", content: SYSTEM },
        { role: "system", content: `# Cockpit context\n\n${context}` },
        { role: "user", content: prompt }
      ]
    })
  })
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(payload?.error?.message || `OpenRouter request failed (${response.status})`)
  return { text: payload?.choices?.[0]?.message?.content || "", usage: payload?.usage }
}

const server = http.createServer(async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Headers", "Content-Type")
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS")
  if (req.method === "OPTIONS") { res.writeHead(204); res.end(); return }
  if (req.url !== "/chat" && req.url !== "/api/foleybot") { res.writeHead(404); res.end("not found"); return }
  if (req.method !== "POST") { res.writeHead(405); res.end("POST only"); return }
  let body = ""
  req.on("data", c => body += c)
  req.on("end", async () => {
    try {
      const { prompt } = JSON.parse(body || "{}")
      if (!prompt || typeof prompt !== "string") { res.writeHead(400); res.end(JSON.stringify({ error: "missing prompt" })); return }
      const { text, usage } = await handleChat(prompt)
      res.writeHead(200, { "Content-Type": "application/json" })
      res.end(JSON.stringify({ text, model: MODEL, usage }))
    } catch (e) {
      console.error(e)
      res.writeHead(500, { "Content-Type": "application/json" })
      res.end(JSON.stringify({ error: e.message ?? String(e) }))
    }
  })
})

server.listen(PORT, () => {
  console.log(`Foleybot ready on http://localhost:${PORT}`)
  console.log(`  provider: ${PROVIDER}`)
  console.log(`  vault: ${VAULT}`)
  console.log(`  data:  ${STATE_JSON}`)
})
