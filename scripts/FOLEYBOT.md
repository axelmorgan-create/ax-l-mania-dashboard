# Foleybot — wiring guide

## What it is

A local Node server (`scripts/foleybot-server.mjs`) that takes natural-language prompts from the cockpit, attaches the live `state.json` + latest daily brief + governing project files as context, and calls Claude. Answers come back as JSON.

## How to run

1. Copy the example env: `cp .env.example .env` (or `cp ../axis-command-center/.env.example .env`)
2. Fill in `ANTHROPIC_API_KEY` in `.env`.
3. From the dashboard root:
   ```
   ANTHROPIC_API_KEY=$(grep ANTHROPIC_API_KEY .env | cut -d= -f2) npm run foleybot
   ```
   Or set it in your shell rc and run `npm run foleybot` directly.
4. To run cockpit + Foleybot + Electron together: `npm run dev:full`

## Endpoint

`POST http://localhost:8787/chat` — body `{"prompt": "..."}`, returns `{"text": "...", "usage": {...}}`.

Vite dev server proxies `/api/foleybot` → the server, so the cockpit can call `fetch("/api/foleybot", ...)` from within the browser/Electron context.

## Wiring it into App.jsx

The live cockpit doesn't have a chat input yet. Minimal example to drop into the footer or any view:

```jsx
const [prompt, setPrompt] = useState("");
const [reply, setReply] = useState("");
const ask = async () => {
  if (!prompt.trim()) return;
  const r = await fetch("/api/foleybot", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt })
  });
  const j = await r.json();
  setReply(j.text);
};
```

In Electron production builds (no Vite dev server), point the fetch at `http://localhost:8787/chat` directly, or run Foleybot as a child process from `electron/main.cjs`.

## Model + caching

Default model is `claude-sonnet-4-6`. Override with `FOLEYBOT_MODEL=...`. The cockpit context is sent with `cache_control: { type: "ephemeral" }`, so within 5 minutes you pay only for the user's prompt + response — not the full state every time.

## Cost

Per-prompt cost ≈ a few cents. The cached state context (~5–15K tokens) bills once per cache window.
