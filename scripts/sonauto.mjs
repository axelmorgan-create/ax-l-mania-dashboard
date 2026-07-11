#!/usr/bin/env node
// sonauto.mjs — generate music via sonauto.ai from the CLI
//
// Key lives in macOS keychain. Set it once:
//   security add-generic-password -a "$USER" -s sonauto -w 'YOUR_KEY'
//
// Usage:
//   ./sonauto.mjs --prompt "trap beat, dark piano, 808s, 140bpm"
//   ./sonauto.mjs --prompt "..." --instrumental --format wav
//   ./sonauto.mjs --tags "soul,gospel" --lyrics "$(cat lyrics.txt)"

import { writeFile, mkdir, appendFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { execSync } from 'node:child_process'
import { homedir } from 'node:os'
import { join } from 'node:path'

const HOME = homedir()
const DOWNLOAD_DIR = join(HOME, 'Downloads')
const LOG_DIR = join(HOME, 'ax-l-mania-dashboard', 'data-sources', 'sonauto')
const LOG_FILE = join(LOG_DIR, 'generations.jsonl')
const BASE = 'https://api.sonauto.ai/v1'

function getKey() {
  try {
    return execSync('security find-generic-password -a "$USER" -s sonauto -w', {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
    }).trim()
  } catch {
    console.error('No sonauto key in keychain. Set it once with:')
    console.error('  security add-generic-password -a "$USER" -s sonauto -w \'YOUR_KEY\'')
    process.exit(1)
  }
}

function usage() {
  console.error(`
sonauto.mjs — generate music via sonauto.ai

  --prompt "..."          free-text style description
  --lyrics "..."          lyrics (use \\n for line breaks)
  --tags a,b,c            comma-separated style tags
  --instrumental          no vocals
  --format mp3|flac|wav|ogg|m4a   default: mp3
  --bitrate 128|192|256|320       mp3/m4a only; default: 320
  --length min,max                seconds, multiples of 30 (e.g. 120,180)
  --seed N                        reproducibility
  --prompt-strength F             1.0-4.0; if > 1.0, style-scale auto-clamps to 1.0
  --style-scale F                 1.0-3.5 (default 3.0); set <= 1.0 if using prompt-strength
`)
}

function parseArgs() {
  const args = process.argv.slice(2)
  const opts = { format: 'mp3', bitrate: 320 }
  for (let i = 0; i < args.length; i++) {
    const a = args[i]
    const next = args[i + 1]
    if (a === '--prompt') { opts.prompt = next; i++ }
    else if (a === '--lyrics') { opts.lyrics = next; i++ }
    else if (a === '--tags') { opts.tags = next.split(',').map(s => s.trim()).filter(Boolean); i++ }
    else if (a === '--instrumental') { opts.instrumental = true }
    else if (a === '--format') { opts.format = next; i++ }
    else if (a === '--bitrate') { opts.bitrate = parseInt(next, 10); i++ }
    else if (a === '--length') { opts.length = next; i++ }
    else if (a === '--seed') { opts.seed = parseInt(next, 10); i++ }
    else if (a === '--prompt-strength') { opts.prompt_strength = parseFloat(next); i++ }
    else if (a === '--style-scale') { opts.style_scale = parseFloat(next); i++ }
    else if (a === '-h' || a === '--help') { usage(); process.exit(0) }
    else { console.error(`unknown flag: ${a}`); usage(); process.exit(1) }
  }
  if (!opts.prompt && !opts.tags && !opts.lyrics) {
    console.error('need at least one of --prompt, --tags, --lyrics')
    usage(); process.exit(1)
  }
  return opts
}

function buildBody(opts) {
  const body = { output_format: opts.format }
  if (opts.prompt) body.prompt = opts.prompt
  if (opts.lyrics) body.lyrics = opts.lyrics
  if (opts.tags?.length) body.tags = opts.tags
  if (opts.instrumental) body.instrumental = true
  if (opts.seed !== undefined) body.seed = opts.seed
  if ((opts.format === 'mp3' || opts.format === 'm4a') && opts.bitrate) {
    body.output_bit_rate = opts.bitrate
  }
  if (opts.length) {
    const [a, b] = opts.length.split(',').map(Number)
    body.length_range = [a, b]
  }
  // API constraint: exactly one of prompt_strength / style_scale must be > 1.0
  if (opts.prompt_strength !== undefined) {
    body.prompt_strength = opts.prompt_strength
    body.style_scale = opts.style_scale !== undefined ? opts.style_scale : 1.0
  } else if (opts.style_scale !== undefined) {
    body.style_scale = opts.style_scale
  }
  return body
}

// Wrap fetch with retries on transient network failures so a single blip
// doesn't abandon an in-flight generation (the task survives on the server,
// but losing the poller forces manual recovery).
async function fetchWithRetry(url, init = {}, { retries = 5, baseDelay = 1500 } = {}) {
  let lastErr
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fetch(url, init)
    } catch (err) {
      lastErr = err
      if (attempt === retries) break
      const delay = baseDelay * Math.pow(1.6, attempt)
      process.stderr.write(`\n  network blip (${err.message}), retry ${attempt + 1}/${retries} in ${Math.round(delay)}ms\n`)
      await new Promise(r => setTimeout(r, delay))
    }
  }
  throw lastErr
}

async function postGenerate(key, body) {
  const res = await fetchWithRetry(`${BASE}/generations/v3`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`POST /generations/v3 → ${res.status}: ${await res.text()}`)
  return res.json()
}

async function pollStatus(key, taskId) {
  const url = `${BASE}/generations/status/${taskId}`
  let last = ''
  while (true) {
    const res = await fetchWithRetry(url, { headers: { Authorization: `Bearer ${key}` } })
    if (!res.ok) throw new Error(`GET status → ${res.status}: ${await res.text()}`)
    const status = (await res.text()).replace(/^"|"$/g, '')
    if (status !== last) {
      process.stderr.write(`\r  ${status.padEnd(40)}`)
      last = status
    }
    if (status === 'SUCCESS') { process.stderr.write('\n'); return }
    if (status === 'FAILURE') { process.stderr.write('\n'); throw new Error('generation FAILED') }
    await new Promise(r => setTimeout(r, 2000))
  }
}

async function fetchGeneration(key, taskId) {
  const res = await fetchWithRetry(`${BASE}/generations/${taskId}`, {
    headers: { Authorization: `Bearer ${key}` },
  })
  if (!res.ok) throw new Error(`GET /generations/${taskId} → ${res.status}: ${await res.text()}`)
  return res.json()
}

async function fetchCredits(key) {
  try {
    const res = await fetch(`${BASE}/credits/balance`, {
      headers: { Authorization: `Bearer ${key}` },
    })
    if (!res.ok) return null
    return await res.json()
  } catch { return null }
}

function slugify(s, max = 40) {
  return (s || 'song').toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, max) || 'song'
}

function ts() {
  const d = new Date(), p = n => String(n).padStart(2, '0')
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`
}

async function download(url, dest) {
  const res = await fetchWithRetry(url)
  if (!res.ok) throw new Error(`download ${url} → ${res.status}`)
  await writeFile(dest, Buffer.from(await res.arrayBuffer()))
}

async function logRecord(record) {
  if (!existsSync(LOG_DIR)) await mkdir(LOG_DIR, { recursive: true })
  await appendFile(LOG_FILE, JSON.stringify(record) + '\n')
}

async function main() {
  const key = getKey()
  const opts = parseArgs()
  const body = buildBody(opts)

  console.error(`→ POST /generations/v3  format=${opts.format}${opts.bitrate && (opts.format === 'mp3' || opts.format === 'm4a') ? `@${opts.bitrate}kbps` : ''}${opts.instrumental ? ' instrumental' : ''}`)
  const { task_id } = await postGenerate(key, body)
  console.error(`  task_id=${task_id}`)

  await pollStatus(key, task_id)

  const gen = await fetchGeneration(key, task_id)
  if (!gen.song_paths?.length) throw new Error(`no song_paths in response: ${JSON.stringify(gen)}`)

  const slug = slugify(opts.prompt || opts.tags?.join('-'))
  const stamp = ts()
  const files = []
  for (let i = 0; i < gen.song_paths.length; i++) {
    const suffix = gen.song_paths.length > 1 ? `-${i + 1}` : ''
    const dest = join(DOWNLOAD_DIR, `sonauto-${stamp}-${slug}${suffix}.${opts.format}`)
    console.error(`→ download → ${dest}`)
    await download(gen.song_paths[i], dest)
    files.push(dest)
  }

  await logRecord({
    timestamp: new Date().toISOString(),
    task_id,
    prompt: opts.prompt || null,
    lyrics: opts.lyrics || null,
    tags: opts.tags || null,
    instrumental: !!opts.instrumental,
    format: opts.format,
    model_version: gen.model_version,
    files,
  })

  const credits = await fetchCredits(key)
  if (credits) console.error(`  credits remaining: ${JSON.stringify(credits)}`)
  console.error(`✓ ${files.length} file${files.length > 1 ? 's' : ''} saved`)
  try { execSync(`open -R "${files[0]}"`) } catch {}
}

main().catch(err => {
  console.error(`\n✗ ${err.message}`)
  process.exit(1)
})
