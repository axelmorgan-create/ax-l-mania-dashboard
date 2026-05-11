import React, { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import * as THREE from "three";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import {
  AlertTriangle,
  Box,
  Brain,
  CheckCircle2,
  Cpu,
  Database,
  FileQuestion,
  Globe,
  LineChart,
  Lock,
  Map as MapIcon,
  Music,
  Radio,
  RefreshCw,
  Settings,
  Shield,
  Target,
  Terminal,
  TrendingUp
} from "lucide-react";
import state from "./data/state.json";

if (import.meta.env.VITE_MAPBOX_TOKEN) {
  mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;
}

const VIEWS = {
  HOME: "home",
  BRAIN: "brain",
  FINANCE: "finance",
  NETWORK: "network",
  WORLD: "world",
  MUSIC: "music"
};

const LOGO_MAIN = "./assets/logos/ax-l-logo.png";
const LOGO_HORIZONTAL = "./assets/logos/ax-l-logo-horizontal.png";
const LOGO_HORIZONTAL_FOOTER = "./assets/logos/ax-l-logo-horizontal-footer.png";
const OPERATOR_AVATAR = "./assets/operator/operator-avatar.svg";

const TABS = [
  { id: VIEWS.HOME, label: "Hub", icon: Box, color: "#00E5FF" },
  { id: VIEWS.WORLD, label: "World", icon: Globe, color: "#D2A86B" },
  { id: VIEWS.BRAIN, label: "Brain", icon: Brain, color: "#FFB300" },
  { id: VIEWS.MUSIC, label: "Music", icon: Music, color: "#FF7700" },
  { id: VIEWS.FINANCE, label: "Finance", icon: LineChart, color: "#33FF00" },
  { id: VIEWS.NETWORK, label: "Network", icon: Settings, color: "#FF2200" }
];

const MASCOTS = {
  home: [
    "./assets/mascots/action/home-7.png",
    "./assets/mascots/action/home-8.png",
    "./assets/mascots/action/home-9.png",
    "./assets/mascots/action/home-10.png",
    "./assets/mascots/action/home-11.png"
  ],
  network: [
    "./assets/mascots/action/network-12.png",
    "./assets/mascots/action/network-13.png",
    "./assets/mascots/action/network-14.png",
    "./assets/mascots/action/network-15.png",
    "./assets/mascots/action/network-16.png"
  ],
  finance: [
    "./assets/mascots/action/finance-17.png",
    "./assets/mascots/action/finance-18.png",
    "./assets/mascots/action/finance-19.png",
    "./assets/mascots/action/finance-20.png",
    "./assets/mascots/action/finance-21.png"
  ],
  brain: [
    "./assets/mascots/action/brain-31.png",
    "./assets/mascots/action/brain-32.png",
    "./assets/mascots/action/brain-33.png",
    "./assets/mascots/action/brain-34.png",
    "./assets/mascots/action/brain-35.png"
  ],
  world: [
    "./assets/mascots/action/world-27.png",
    "./assets/mascots/action/world-28.png",
    "./assets/mascots/action/world-29.png",
    "./assets/mascots/action/world-30.png",
    "./assets/mascots/action/world-27b.png"
  ],
  music: [
    "./assets/mascots/action/music-22.png",
    "./assets/mascots/action/music-23.png",
    "./assets/mascots/action/music-24.png",
    "./assets/mascots/action/music-25.png",
    "./assets/mascots/action/music-26.png"
  ]
};

const LAYERED_HEROES = {
  home: {
    base: "./assets/parallax/blue-hero.png",
    mid: "./assets/parallax/blue-midground.png",
    foreground: "./assets/parallax/blue-float.png",
    overlay: "./assets/parallax/blue-overlay.png"
  },
  brain: {
    base: "./assets/parallax/yellow-hero.png",
    mid: "./assets/parallax/yellow-midground.png",
    foreground: null,
    overlay: "./assets/parallax/yellow-overlay.png",
    border: "./assets/parallax/yellow-border.png"
  },
  finance: {
    base: "./assets/parallax/green-hero.png",
    mid: "./assets/parallax/green-midground.png",
    foreground: "./assets/parallax/green-foreground.png",
    overlay: "./assets/parallax/green-overlay.png"
  },
  network: {
    base: "./assets/parallax/red-hero.png",
    mid: "./assets/parallax/red-midground.png",
    foreground: "./assets/parallax/red-float.png",
    overlay: "./assets/parallax/red-overlay.png",
    border: "./assets/parallax/red-border.png"
  },
  world: {
    base: "./assets/parallax/world-hero.png",
    mid: "./assets/parallax/world-midground.png",
    foreground: "./assets/parallax/world-foreground.png",
    overlay: "./assets/parallax/world-overlay.png"
  },
  music: {
    base: "./assets/parallax/music-hero.png",
    mid: null,
    foreground: "./assets/parallax/music-foreground.png",
    overlay: null,
    border: null
  }
};

const SURVEILLANCE_CAMS = [
  "./assets/surveillance/cam-01.png",
  "./assets/surveillance/cam-02.png",
  "./assets/surveillance/cam-03.png"
];

const THEMES = {
  home: {
    id: "home",
    hex: "#00E5FF",
    text: "text-[#00E5FF]",
    bg: "bg-[#00E5FF]",
    glow: "drop-shadow-[0_0_15px_rgba(0,229,255,1)]",
    textGlow: "[text-shadow:0_0_5px_rgba(0,229,255,0.8)]",
    panelBg: "bg-[#000405]/85"
  },
  brain: {
    id: "brain",
    hex: "#FFB300",
    text: "text-[#FFB300]",
    bg: "bg-[#FFB300]",
    glow: "drop-shadow-[0_0_15px_rgba(255,179,0,1)]",
    textGlow: "[text-shadow:0_0_5px_rgba(255,179,0,0.8)]",
    panelBg: "bg-[#050400]/85"
  },
  finance: {
    id: "finance",
    hex: "#33FF00",
    text: "text-[#33FF00]",
    bg: "bg-[#33FF00]",
    glow: "drop-shadow-[0_0_15px_rgba(51,255,0,1)]",
    textGlow: "[text-shadow:0_0_5px_rgba(51,255,0,0.8)]",
    panelBg: "bg-[#000501]/85"
  },
  network: {
    id: "network",
    hex: "#FF2200",
    text: "text-[#FF2200]",
    bg: "bg-[#FF2200]",
    glow: "drop-shadow-[0_0_15px_rgba(255,34,0,1)]",
    textGlow: "[text-shadow:0_0_5px_rgba(255,34,0,0.8)]",
    panelBg: "bg-[#050100]/85"
  },
  world: {
    id: "world",
    hex: "#D2A86B",
    text: "text-[#D2A86B]",
    bg: "bg-[#D2A86B]",
    glow: "drop-shadow-[0_0_10px_rgba(210,168,107,0.8)]",
    textGlow: "[text-shadow:0_0_5px_rgba(210,168,107,0.8)]",
    panelBg: "bg-[#0A0805]/85"
  },
  music: {
    id: "music",
    hex: "#FF7700",
    text: "text-[#FF7700]",
    bg: "bg-[#FF7700]",
    glow: "drop-shadow-[0_0_15px_rgba(255,119,0,1)]",
    textGlow: "[text-shadow:0_0_5px_rgba(255,119,0,0.8)]",
    panelBg: "bg-black/30"
  }
};

const THEME_DEFAULT = THEMES.home;

// State is built by `npm run refresh` (scripts/build-data.mjs) from:
//   - the brain vault at ~/Documents/brain 2/
//   - cached MCP snapshots in data-sources/{spotify,google,quickbooks}/
// Every field is real or explicitly marked AWAITING with a vault pointer.
const META = state.meta;
const DATA = {
  northStars: state.hub.northStars,
  triggers: state.hub.triggers,
  killList: state.hub.killList,
  music: {
    ...state.music,
    kpis: state.music.kpis,
    spotify: state.music.spotify,
    epkTracks: state.music.epkTracks || [],
    credits: state.music.credits || [],
    pipeline: state.music.pipeline || [],
    catalogAwaiting: state.music.catalogAwaiting
  },
  finance: {
    kpis: state.finance.kpis,
    sources: state.finance.sources,
    awaiting: state.finance.awaiting,
    doctrine: state.finance.doctrine,
    status: state.finance.status
  },
  network: {
    kpis: state.network.kpis,
    agents: state.network.agents,
    risks: state.network.risks,
    alerts: state.network.alerts,
    people: state.network.people || { circles: [], keyRelationships: [] },
    infrastructure: state.network.infrastructure || { signals: [] },
    system: state.network.system || {},
    healthChecks: state.network.healthChecks || { counts: {}, groups: [] },
    audienceAwaiting: state.network.audienceAwaiting,
    conversionFunnel: state.network.conversionFunnel
  },
  brain: {
    stats: state.brain.stats,
    focus: state.brain.focus,
    operator: state.brain.operator,
    memoryAllocation: state.brain.memoryAllocation,
    synthesisGaps: state.brain.synthesisGaps,
    agents: state.brain.agents
  },
  world: {
    cultural: state.world.cultural,
    anomalies: state.world.anomalies,
    news: state.world.news,
    sentimentIndex: state.world.sentimentIndex
  },
  content: state.hub.content,
  inventory: state.inventory
};

// Globe layers map directly to real public-API event categories.
const WORLD_LAYERS = [
  { id: "quake", label: "Quakes", hex: "#FFB300", source: "USGS" },
  { id: "volcano", label: "Volcanoes", hex: "#FF2200", source: "EONET" },
  { id: "wildfire", label: "Wildfires", hex: "#FF7700", source: "EONET" },
  { id: "storm", label: "Storms", hex: "#00E5FF", source: "EONET" },
  { id: "ice", label: "Sea Ice", hex: "#b9e6ff", source: "EONET" },
  { id: "flood", label: "Floods", hex: "#33aaff", source: "EONET" }
];

// Live video feeds — YouTube channel-based live_stream embeds. No API key required.
// Channel IDs occasionally change; if a feed shows "video unavailable", swap the channel ID below.
const WORLD_VIDEO_FEEDS = [
  { id: "dw", label: "DW News", region: "DE/EN", channel: "UCknLrEdhRCp1aegoMqRaCZg" },
  { id: "aje", label: "Al Jazeera", region: "QAT/EN", channel: "UCNye-wNBqNL5ZzHSJj3l8Bg" },
  { id: "sky", label: "Sky News", region: "UK", channel: "UCoMdktPbSTixAyNGwb-UYkQ" },
  { id: "f24", label: "France 24", region: "FR/EN", channel: "UCQfwfsi5VrQ8yKZ-UWmAEFg" },
  { id: "nhk", label: "NHK World", region: "JP/EN", channel: "UCSPEjw8F2nQDtmUKPFNF7_A" },
  { id: "cgtn", label: "CGTN", region: "CN/EN", channel: "UCnQc7ypRR7m3X5L8LZqHtdg" },
  { id: "bbg", label: "Bloomberg", region: "MKT", channel: "UCIALMKvObZNtJ6AmdCLP7Lg" },
  { id: "nasa", label: "NASA Live", region: "ORBIT", channel: "UCLA_DiR1FfKNvjuUpBHmylQ" }
];

// --- Real-data fetch helpers (no API keys, all CORS-friendly) ----------------------------

const EONET_CATEGORY_TO_LAYER = {
  // EONET v3 category IDs
  wildfires: "wildfire",
  severeStorms: "storm",
  volcanoes: "volcano",
  seaLakeIce: "ice",
  floods: "flood"
};

const fetchUSGSQuakes = async () => {
  // Magnitude ≥ 4.5 in the last 24 hours
  const res = await fetch("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_day.geojson");
  if (!res.ok) throw new Error(`USGS ${res.status}`);
  const json = await res.json();
  return (json.features || []).map((f) => ({
    id: `usgs-${f.id}`,
    layer: "quake",
    lat: f.geometry.coordinates[1],
    lon: f.geometry.coordinates[0],
    label: `M${f.properties.mag?.toFixed?.(1) ?? "?"} · ${f.properties.place || "unknown"}`,
    intensity: Math.min(100, Math.round(((f.properties.mag || 0) / 9) * 100)),
    magnitude: f.properties.mag,
    when: f.properties.time,
    url: f.properties.url
  }));
};

const fetchEONETEvents = async () => {
  const res = await fetch("https://eonet.gsfc.nasa.gov/api/v3/events?status=open&limit=80&days=20");
  if (!res.ok) throw new Error(`EONET ${res.status}`);
  const json = await res.json();
  const out = [];
  (json.events || []).forEach((e) => {
    const cat = e.categories?.[0];
    const layer = EONET_CATEGORY_TO_LAYER[cat?.id];
    if (!layer) return;
    const last = e.geometry?.[e.geometry.length - 1];
    if (!last) return;
    let lat;
    let lon;
    if (last.type === "Point") {
      [lon, lat] = last.coordinates;
    } else {
      const first = last.coordinates?.[0]?.[0];
      if (!first || first.length < 2) return;
      [lon, lat] = first;
    }
    if (typeof lat !== "number" || typeof lon !== "number") return;
    out.push({
      id: `eonet-${e.id}`,
      layer,
      lat,
      lon,
      label: e.title,
      intensity: 60,
      when: last.date ? Date.parse(last.date) : null,
      url: e.sources?.[0]?.url || e.link
    });
  });
  return out;
};

const fetchRedditWorldNews = async () => {
  const res = await fetch("https://www.reddit.com/r/worldnews/top.json?limit=15&t=day", {
    headers: { Accept: "application/json" }
  });
  if (!res.ok) throw new Error(`Reddit ${res.status}`);
  const json = await res.json();
  return (json.data?.children || []).map((c, i) => {
    const d = c.data;
    const t = new Date((d.created_utc || 0) * 1000);
    const hh = String(t.getHours()).padStart(2, "0");
    const mm = String(t.getMinutes()).padStart(2, "0");
    return {
      id: d.id || `r${i}`,
      tag: (d.link_flair_text || "NEWS").slice(0, 4).toUpperCase(),
      region: (d.domain || "").replace(/^www\./, "").split(".")[0].slice(0, 8).toUpperCase(),
      message: d.title,
      time: `${hh}:${mm}`,
      url: `https://reddit.com${d.permalink}`
    };
  });
};

// Twelve Data — single batched /quote covering equities + indices + crypto + FX + commodities.
const TWELVE_DATA_SYMBOLS = [
  { symbol: "SPY", name: "S&P 500" },
  { symbol: "QQQ", name: "Nasdaq 100" },
  { symbol: "VIX", name: "Volatility" },
  { symbol: "DXY", name: "Dollar Idx" },
  { symbol: "BTC/USD", name: "Bitcoin" },
  { symbol: "ETH/USD", name: "Ethereum" },
  { symbol: "USD/JPY", name: "Yen" },
  { symbol: "XAU/USD", name: "Gold" }
];

const fetchTwelveDataMarkets = async () => {
  const apiKey = import.meta.env.VITE_TWELVE_DATA_KEY;
  if (!apiKey) throw new Error("VITE_TWELVE_DATA_KEY missing");
  const symbols = TWELVE_DATA_SYMBOLS.map((s) => s.symbol).join(",");
  const url = `https://api.twelvedata.com/quote?symbol=${encodeURIComponent(symbols)}&apikey=${apiKey}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`TwelveData ${res.status}`);
  const json = await res.json();
  return TWELVE_DATA_SYMBOLS.map(({ symbol, name }) => {
    const row = json[symbol] || {};
    if (row.code && row.code >= 400) {
      return { symbol, name, value: "—", delta: "" };
    }
    const price = parseFloat(row.close);
    const pctChange = parseFloat(row.percent_change);
    let formatted;
    if (Number.isNaN(price)) {
      formatted = "—";
    } else if (price >= 1000) {
      formatted = price.toLocaleString(undefined, { maximumFractionDigits: 0 });
    } else if (price >= 100) {
      formatted = price.toFixed(2);
    } else {
      formatted = price.toFixed(price >= 10 ? 2 : 4);
    }
    const isMonetary = symbol === "SPY" || symbol === "QQQ" || symbol.startsWith("BTC") || symbol.startsWith("ETH") || symbol.startsWith("XAU");
    const value = formatted === "—" ? "—" : isMonetary ? `$${formatted}` : formatted;
    const delta = Number.isNaN(pctChange) ? "" : `${pctChange >= 0 ? "+" : ""}${pctChange.toFixed(2)}%`;
    return { symbol, name, value, delta };
  });
};

// Tiny helper for panels: fetches once, then every intervalMs. Cancels on unmount.
const useLiveData = (fetcher, intervalMs, deps = []) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [updatedAt, setUpdatedAt] = useState(null);
  useEffect(() => {
    let cancelled = false;
    const tick = async () => {
      try {
        const result = await fetcher();
        if (cancelled) return;
        setData(result);
        setError(null);
        setUpdatedAt(Date.now());
      } catch (e) {
        if (cancelled) return;
        setError(e.message || String(e));
      }
    };
    tick();
    const id = setInterval(tick, intervalMs);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return { data, error, updatedAt };
};

let lastMascotSwap = 0;
const triggerMascotSwap = () => {
  const now = Date.now();
  if (now - lastMascotSwap > 600) {
    window.dispatchEvent(new CustomEvent("swap-mascot"));
    lastMascotSwap = now;
  }
};

const SPLASH_BOOT_LINES = [
  "AX-L MANIA.OS // cold start",
  "neural bus handshake: 1254 nodes",
  "brain mascot uplink: verified",
  "parallax hero terrain: mapped",
  "operator SVG loader: vector lock",
  "framer motion timeline: armed",
  "dashboard command shell: online"
];

const SPLASH_PHASES = [
  {
    id: "phase-01",
    label: "PHASE 01",
    title: "CALIBRATE NEURAL GRID",
    detail: "Mapping parallax terrain, panel geometry, and operator signal."
  },
  {
    id: "phase-02",
    label: "PHASE 02",
    title: "DIGITIZE MASCOT CORE",
    detail: "Reconstructing avatar matter through scanline teleport lanes."
  },
  {
    id: "phase-03",
    label: "PHASE 03",
    title: "HANDOFF TO COMMAND SHELL",
    detail: "Injecting Framer timelines and dashboard section staggers."
  }
];

const pageRevealVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.075,
      delayChildren: 0.08
    }
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.18 }
  }
};

const sectionRevealVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.96, filter: "blur(10px)" },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: { duration: 0.56, ease: [0.16, 1, 0.3, 1] }
  }
};

const rowRevealVariants = {
  hidden: { opacity: 0, x: -12 },
  show: { opacity: 1, x: 0, transition: { duration: 0.32, ease: "easeOut" } }
};

const AnimatedSvgLoader = ({ reducedMotion = false }) => (
  <div className="relative flex h-32 w-32 shrink-0 items-center justify-center md:h-40 md:w-40">
    <motion.div
      className="absolute inset-0 rounded-full border border-[#FFB300]/35"
      animate={reducedMotion ? { opacity: 0.7 } : { rotate: 360 }}
      transition={reducedMotion ? { duration: 0.2 } : { duration: 6, repeat: Infinity, ease: "linear" }}
      style={{
        background:
          "conic-gradient(from 90deg, rgba(255,179,0,0), rgba(255,179,0,0.55), rgba(255,255,255,0.9), rgba(255,179,0,0))",
        boxShadow: "0 0 38px rgba(255,179,0,0.28)"
      }}
    />
    <motion.div
      className="absolute inset-3"
      animate={reducedMotion ? { opacity: 0.85 } : { rotate: -360, scale: [0.94, 1.05, 0.94] }}
      transition={reducedMotion ? { duration: 0.2 } : { rotate: { duration: 9, repeat: Infinity, ease: "linear" }, scale: { duration: 2.2, repeat: Infinity, ease: "easeInOut" } }}
      style={{
        background:
          "linear-gradient(135deg, rgba(255,255,255,0.98), rgba(255,179,0,0.95) 46%, rgba(0,229,255,0.88))",
        WebkitMaskImage: `url(${OPERATOR_AVATAR})`,
        WebkitMaskPosition: "center",
        WebkitMaskRepeat: "no-repeat",
        WebkitMaskSize: "contain",
        maskImage: `url(${OPERATOR_AVATAR})`,
        maskPosition: "center",
        maskRepeat: "no-repeat",
        maskSize: "contain",
        filter: "drop-shadow(0 0 18px rgba(255,179,0,0.9))"
      }}
    />
    <motion.svg
      aria-hidden="true"
      className="absolute inset-0 h-full w-full"
      viewBox="0 0 160 160"
      initial={false}
      animate={reducedMotion ? { opacity: 0.9 } : { rotate: 360 }}
      transition={reducedMotion ? { duration: 0.2 } : { duration: 12, repeat: Infinity, ease: "linear" }}
    >
      <circle cx="80" cy="80" r="70" fill="none" stroke="#FFB300" strokeWidth="1" strokeDasharray="4 12" opacity="0.8" />
      <circle cx="80" cy="80" r="52" fill="none" stroke="#00E5FF" strokeWidth="1" strokeDasharray="18 18" opacity="0.45" />
      <path d="M80 10 L91 48 L132 38 L102 72 L146 80 L102 88 L132 122 L91 112 L80 150 L69 112 L28 122 L58 88 L14 80 L58 72 L28 38 L69 48 Z" fill="none" stroke="#ffffff" strokeWidth="0.7" opacity="0.45" />
    </motion.svg>
    <span className="sr-only">Operator SVG boot loader</span>
  </div>
);

const BootLine = ({ children, index, reducedMotion }) => (
  <motion.li
    className="grid grid-cols-[3rem_1fr_auto] items-center gap-3 border-b border-[#FFB300]/15 py-1.5 font-tech text-[10px] uppercase text-[#f8d692] md:text-[11px]"
    initial={{ opacity: 0, x: reducedMotion ? 0 : -18 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: reducedMotion ? 0 : 0.55 + index * 0.28, duration: reducedMotion ? 0.1 : 0.38, ease: "easeOut" }}
  >
    <span className="text-[#00E5FF]/80">0{index + 1}</span>
    <span className="truncate">{children}</span>
    <motion.span
      className="h-1.5 w-1.5 bg-[#33FF00]"
      animate={reducedMotion ? { opacity: 1 } : { opacity: [0.25, 1, 0.25] }}
      transition={reducedMotion ? { duration: 0.1 } : { duration: 1.2, repeat: Infinity, delay: index * 0.12 }}
    />
  </motion.li>
);

const SplashScreen = ({ onComplete }) => {
  const reducedMotion = useReducedMotion();
  const totalDuration = reducedMotion ? 1400 : 7200;
  const [phaseIndex, setPhaseIndex] = useState(0);
  const activePhase = SPLASH_PHASES[phaseIndex];

  useEffect(() => {
    const timer = window.setTimeout(onComplete, totalDuration);
    return () => window.clearTimeout(timer);
  }, [onComplete, totalDuration]);

  useEffect(() => {
    if (reducedMotion) return undefined;
    const phaseDuration = totalDuration / SPLASH_PHASES.length;
    const timers = SPLASH_PHASES.slice(1).map((_, index) =>
      window.setTimeout(() => setPhaseIndex(index + 1), phaseDuration * (index + 1))
    );
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [reducedMotion, totalDuration]);

  return (
    <motion.section
      className="fixed inset-0 z-[999] overflow-hidden bg-[#11100d] font-display text-white"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: reducedMotion ? 1 : 1.02, filter: reducedMotion ? "none" : "blur(8px)" }}
      transition={{ duration: reducedMotion ? 0.18 : 0.75, ease: "easeInOut" }}
      aria-label="AX-L Mania OS boot sequence"
    >
      <img
        src={LAYERED_HEROES.brain.base}
        className="absolute inset-0 h-full w-full object-cover opacity-70"
        alt=""
      />
      <motion.img
        src={LAYERED_HEROES.brain.mid}
        className="absolute inset-[-5%] h-[110%] w-[110%] object-cover opacity-65 mix-blend-screen"
        alt=""
        animate={reducedMotion ? { opacity: 0.65 } : { x: ["-1%", "1%"], scale: [1.03, 1.07, 1.03] }}
        transition={reducedMotion ? { duration: 0.2 } : { duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <img
        src={LAYERED_HEROES.brain.overlay}
        className="absolute inset-0 h-full w-full object-cover opacity-65 mix-blend-screen"
        alt=""
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_68%_32%,rgba(255,179,0,0.26),transparent_30%),linear-gradient(90deg,rgba(17,16,13,0.96),rgba(17,16,13,0.72)_44%,rgba(17,16,13,0.36))]" />
      <div className="absolute inset-0 opacity-[0.16] mix-blend-screen" style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,179,0,0.75) 2px, rgba(255,179,0,0.75) 3px)" }} />
      <motion.div
        className="absolute inset-x-0 top-0 z-20 h-32 mix-blend-screen"
        style={{ background: "linear-gradient(180deg, rgba(0,229,255,0.24), transparent)" }}
        animate={reducedMotion ? { opacity: 0.45 } : { opacity: [0.2, 0.7, 0.25], y: [-12, 0, -12] }}
        transition={reducedMotion ? { duration: 0.1 } : { duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute inset-x-0 z-20 h-20 opacity-70 mix-blend-screen"
        style={{
          background: "linear-gradient(180deg, transparent, rgba(255,255,255,0.62), transparent)",
          top: "-20%"
        }}
        animate={reducedMotion ? { y: 0 } : { y: ["0vh", "140vh"] }}
        transition={reducedMotion ? { duration: 0.1 } : { duration: 2.4, repeat: Infinity, ease: "linear" }}
      />

      <motion.div
        className="absolute bottom-[-8%] right-[-12%] h-[76vh] w-[70vw] max-w-[780px] md:bottom-[-9%] md:right-[4%] md:h-[92vh] md:w-[42vw]"
        initial={{ opacity: 0, x: reducedMotion ? 0 : 120, scale: reducedMotion ? 1 : 0.72, filter: reducedMotion ? "none" : "blur(18px) brightness(2.4)" }}
        animate={{
          opacity: 1,
          x: 0,
          scale: phaseIndex === 1 ? 1.06 : 1,
          filter: reducedMotion ? "none" : "blur(0px) brightness(1)"
        }}
        transition={{ delay: reducedMotion ? 0 : 0.35, duration: reducedMotion ? 0.2 : 1.1, ease: [0.16, 1, 0.3, 1] }}
      >
        <motion.div
          className="absolute inset-0 z-10 opacity-70 mix-blend-screen"
          style={{
            backgroundImage: "repeating-linear-gradient(0deg, transparent 0 13px, rgba(0,229,255,0.7) 13px 15px), repeating-linear-gradient(90deg, transparent 0 34px, rgba(255,179,0,0.45) 34px 36px)"
          }}
          animate={reducedMotion ? { opacity: 0 } : { opacity: phaseIndex === 1 ? [0.12, 0.72, 0.16] : [0.05, 0.24, 0.06], x: [18, -10, 0] }}
          transition={reducedMotion ? { duration: 0.1 } : { duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.img
          src="./assets/mascots/action/brain-33.png"
          className="h-full w-full object-contain object-bottom drop-shadow-[0_0_34px_rgba(255,179,0,0.65)]"
          alt="Brain mascot"
          animate={reducedMotion ? { y: 0 } : { y: [0, -12, 0], filter: phaseIndex === 1 ? ["hue-rotate(0deg)", "hue-rotate(26deg)", "hue-rotate(0deg)"] : "hue-rotate(0deg)" }}
          transition={reducedMotion ? { duration: 0.2 } : { y: { duration: 4.4, repeat: Infinity, ease: "easeInOut" }, filter: { duration: 0.8, repeat: phaseIndex === 1 ? Infinity : 0 } }}
        />
      </motion.div>

      <div className="relative z-10 flex min-h-full w-full items-center px-5 py-8 md:px-12 lg:px-20">
        <div className="grid w-full max-w-[1280px] grid-cols-1 items-center gap-8 md:grid-cols-[minmax(0,0.8fr)_minmax(320px,480px)]">
          <motion.div
            className="max-w-3xl"
            initial={{ opacity: 0, y: reducedMotion ? 0 : 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reducedMotion ? 0.2 : 0.8, ease: "easeOut" }}
          >
            <motion.img
              src={LOGO_MAIN}
              alt="AX-L Mania OS"
              className="mb-5 w-[min(520px,92vw)] max-w-full drop-shadow-[0_0_24px_rgba(255,179,0,0.55)]"
              initial={{ opacity: 0, scale: reducedMotion ? 1 : 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: reducedMotion ? 0 : 0.2, duration: reducedMotion ? 0.2 : 0.9, ease: "easeOut" }}
            />
            <motion.p
              className="mb-3 font-tech text-[11px] font-bold uppercase tracking-[0.38em] text-[#00E5FF]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: reducedMotion ? 0 : 0.8, duration: reducedMotion ? 0.1 : 0.5 }}
            >
              Technical Futuristic Boot Sequence
            </motion.p>
            <AnimatePresence mode="wait">
              <motion.div
                key={activePhase.id}
                className="mb-5 max-w-[680px] border-l-4 bg-black/35 px-4 py-3 backdrop-blur-sm"
                style={{ borderColor: phaseIndex === 1 ? "#00E5FF" : phaseIndex === 2 ? "#33FF00" : "#FFB300" }}
                initial={reducedMotion ? { opacity: 1 } : { opacity: 0, x: -26, filter: "blur(8px)" }}
                animate={reducedMotion ? { opacity: 1 } : { opacity: 1, x: 0, filter: "blur(0px)" }}
                exit={reducedMotion ? { opacity: 0 } : { opacity: 0, x: 18, filter: "blur(8px)" }}
                transition={{ duration: reducedMotion ? 0.1 : 0.42, ease: "easeOut" }}
              >
                <div className="font-tech text-[10px] font-bold uppercase tracking-[0.32em] text-[#00E5FF]">{activePhase.label}</div>
                <div className="mt-1 font-display text-xl font-black uppercase text-white md:text-2xl">{activePhase.title}</div>
                <div className="mt-1 font-tech text-[10px] uppercase leading-relaxed text-white/70 md:text-[11px]">{activePhase.detail}</div>
              </motion.div>
            </AnimatePresence>
            <motion.h1
              className="max-w-[720px] text-3xl font-black uppercase leading-[0.95] text-white md:text-5xl lg:text-6xl"
              initial={{ opacity: 0, y: reducedMotion ? 0 : 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: reducedMotion ? 0 : 1.0, duration: reducedMotion ? 0.2 : 0.65, ease: "easeOut" }}
            >
              Neural command layer initializing
            </motion.h1>
            <motion.div
              className="mt-7 h-2 w-full max-w-[620px] overflow-hidden border border-[#FFB300]/50 bg-[#2a2418]/80"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: reducedMotion ? 0 : 1.15, duration: reducedMotion ? 0.1 : 0.4 }}
            >
              <motion.div
                className="h-full origin-left bg-[linear-gradient(90deg,#00E5FF,#FFB300,#ffffff)] shadow-[0_0_22px_rgba(255,179,0,0.8)]"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: reducedMotion ? 0 : 1.25, duration: reducedMotion ? 0.4 : 5.1, ease: "easeInOut" }}
              />
            </motion.div>
            <div className="mt-4 grid max-w-[620px] grid-cols-3 gap-2">
              {SPLASH_PHASES.map((phase, index) => (
                <motion.div
                  key={phase.id}
                  className="h-1.5 overflow-hidden bg-white/10"
                  initial={{ opacity: 0.35 }}
                  animate={{ opacity: index <= phaseIndex ? 1 : 0.3 }}
                >
                  <motion.div
                    className="h-full origin-left"
                    style={{ backgroundColor: index === 1 ? "#00E5FF" : index === 2 ? "#33FF00" : "#FFB300" }}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: index < phaseIndex ? 1 : index === phaseIndex ? 0.72 : 0 }}
                    transition={{ duration: reducedMotion ? 0.1 : 0.45, ease: "easeOut" }}
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            className="w-full border border-[#FFB300]/45 bg-[#17130d]/78 p-4 shadow-[0_0_60px_rgba(255,179,0,0.14)] backdrop-blur-md cyber-panel-wrap md:p-5"
            initial={{ opacity: 0, x: reducedMotion ? 0 : 36 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: reducedMotion ? 0 : 0.75, duration: reducedMotion ? 0.2 : 0.7, ease: "easeOut" }}
          >
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <div className="font-tech text-[10px] uppercase tracking-[0.24em] text-[#FFB300]/80">vector loader</div>
                <div className="font-display text-xl font-black uppercase text-white md:text-2xl">Operator SVG Core</div>
              </div>
              <AnimatedSvgLoader reducedMotion={reducedMotion} />
            </div>

            <ol className="space-y-0.5">
              {SPLASH_BOOT_LINES.map((line, index) => (
                <BootLine key={line} index={index} reducedMotion={reducedMotion}>
                  {line}
                </BootLine>
              ))}
            </ol>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
};

const GlobalStyles = () => (
  <style>{`
    .font-display { font-family: 'Chakra Petch', sans-serif; }
    .font-tech { font-family: 'Share Tech Mono', monospace; }
    .scrollbar-hide::-webkit-scrollbar { display: none; }
    .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
    .cyber-panel-wrap { clip-path: polygon(15px 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%, 0 15px); }
    .cyber-nav-tab { clip-path: polygon(10px 0, 100% 0, calc(100% - 10px) 100%, 0 100%); }
    .glass-nav-tab { clip-path: polygon(12px 0, 100% 0, calc(100% - 12px) 100%, 0 100%); }
    @keyframes spin-slow { 100% { transform: rotate(360deg); } }
    @keyframes spin-reverse { 100% { transform: rotate(-360deg); } }
    @keyframes pulse-opacity { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
    @keyframes dash-scroll { to { stroke-dashoffset: -100; } }
    @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-2%); } }
    @keyframes digitize-scan { 0% { transform: translateY(-100%); opacity: 0; } 20%, 80% { opacity: 0.9; } 100% { transform: translateY(100%); opacity: 0; } }
    @keyframes signal-jitter { 0%, 100% { transform: translate3d(0,0,0); } 20% { transform: translate3d(6px,-2px,0); } 40% { transform: translate3d(-4px,3px,0); } 60% { transform: translate3d(3px,1px,0); } 80% { transform: translate3d(-2px,-1px,0); } }
    @keyframes menu-glow-pulse { 0%, 100% { opacity: 0.4; filter: blur(20px); } 50% { opacity: 0.8; filter: blur(35px); } }
    @keyframes neon-flicker { 0%, 100% { opacity: 0.18; filter: brightness(1.1) drop-shadow(0 0 26px currentColor); } 6% { opacity: 0.05; } 8% { opacity: 0.32; } 10% { opacity: 0.11; } 14% { opacity: 0.38; } 46% { opacity: 0.2; } 52% { opacity: 0.42; } 54% { opacity: 0.16; } 76% { opacity: 0.3; } }
    @keyframes scale-breath { 0%, 100% { transform: scale(1.04); } 50% { transform: scale(1.1); } }
    @keyframes pan-left { 0% { transform: translateX(0) scale(1.1); } 100% { transform: translateX(-2.5%) scale(1.12); } }
    @keyframes pan-right { 0% { transform: translateX(-2%) scale(1.08); } 100% { transform: translateX(2%) scale(1.1); } }
  `}</style>
);

const FoxLeftHalf = ({ eyeColor }) => (
  <svg viewBox="0 0 50 100" className="w-8 lg:w-10 h-16 lg:h-20 drop-shadow-2xl relative block">
    <g stroke="#ffffff66" strokeWidth="2" strokeLinejoin="round">
      <polygon points="15,15 40,45 25,55" fill="#cfd4d8" />
      <polygon points="15,15 40,45 32,30" fill="#f4f6f7" />
      <polygon points="40,45 50,45 50,65" fill="#9aa3aa" />
      <polygon points="25,55 40,45 50,65 50,95 10,70" fill="#b7bec4" />
      <polygon points="10,70 50,95 30,95" fill="#e5e8ea" />
      <line
        x1="30"
        y1="58"
        x2="38"
        y2="55"
        stroke={eyeColor}
        strokeWidth="4"
        strokeLinecap="round"
        style={{ filter: `drop-shadow(0 0 8px ${eyeColor})`, transition: "stroke 0.4s ease" }}
      />
    </g>
  </svg>
);

const FoxRightHalf = ({ eyeColor }) => (
  <svg viewBox="50 0 50 100" className="w-8 lg:w-10 h-16 lg:h-20 drop-shadow-2xl relative block">
    <g stroke="#ffffff66" strokeWidth="2" strokeLinejoin="round">
      <polygon points="85,15 60,45 75,55" fill="#cfd4d8" />
      <polygon points="85,15 60,45 68,30" fill="#f4f6f7" />
      <polygon points="60,45 50,45 50,65" fill="#9aa3aa" />
      <polygon points="75,55 60,45 50,65 50,95 90,70" fill="#b7bec4" />
      <polygon points="90,70 50,95 70,95" fill="#e5e8ea" />
      <line
        x1="70"
        y1="58"
        x2="62"
        y2="55"
        stroke={eyeColor}
        strokeWidth="4"
        strokeLinecap="round"
        style={{ filter: `drop-shadow(0 0 8px ${eyeColor})`, transition: "stroke 0.4s ease" }}
      />
    </g>
  </svg>
);

const GlobalLayeredHeroBackground = ({ layers }) => (
  <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
    {layers?.base && (
      <img src={layers.base} className="absolute inset-[-5%] w-[110%] h-[110%] object-cover animate-[scale-breath_20s_ease-in-out_infinite]" alt="" />
    )}
    {layers?.mid && (
      <img src={layers.mid} className="absolute inset-[-5%] w-[110%] h-[110%] object-cover animate-[pan-left_30s_linear_infinite_alternate]" alt="" />
    )}
    {layers?.overlay && (
      <img src={layers.overlay} className="absolute inset-0 w-full h-full object-cover mix-blend-screen animate-[pulse-opacity_4s_infinite]" alt="" />
    )}
    <div className="absolute inset-0 bg-black/50" />
  </div>
);

const HexBg = ({ color }) => (
  <div
    className="absolute inset-0 opacity-[0.1] pointer-events-none z-0"
    style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='69.282' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M40 17.32l-20 11.547L0 17.32V-5.774l20-11.547L40-5.774V17.32zm0 46.188l-20 11.548-20-11.548V40.414L20 28.867l20 11.547v23.094z' fill='none' stroke='${encodeURIComponent(color)}' stroke-width='1'/%3E%3C/svg%3E")`
    }}
  />
);

const OperatorBadge = ({ theme, className = "w-12 h-12" }) => (
  <div
    onMouseEnter={triggerMascotSwap}
    onClick={triggerMascotSwap}
    className={`relative ${className} cyber-panel-wrap border-[1px] p-[1px] cursor-crosshair group hover:brightness-150 transition-all z-50 overflow-hidden bg-transparent flex items-center justify-center pointer-events-auto`}
    style={{ borderColor: theme.hex, boxShadow: `0 0 20px ${theme.hex}60` }}
  >
    <img
      src={OPERATOR_AVATAR}
      alt="Operator"
      className="w-full h-full object-contain mix-blend-screen transition-all duration-500 group-hover:scale-110"
      style={{ filter: `drop-shadow(0 0 8px ${theme.hex})` }}
    />
    <div className="absolute inset-0 z-[-1] opacity-30" style={{ backgroundColor: theme.hex }} />
  </div>
);

const Panel = ({ title, jpTitle, children, className = "", noBg = false, isAlert = false, theme = THEME_DEFAULT }) => {
  const panelColor = isAlert ? "#FF0000" : theme.hex;
  if (noBg) {
    return (
      <motion.div variants={sectionRevealVariants} className={`relative flex flex-col pointer-events-auto ${className}`}>
        {children}
      </motion.div>
    );
  }
  return (
    <motion.div
      variants={sectionRevealVariants}
      onMouseEnter={triggerMascotSwap}
      onClick={triggerMascotSwap}
      className={`cyber-panel-wrap p-[1px] relative flex flex-col pointer-events-auto ${className}`}
      style={{ backgroundColor: `${panelColor}50`, filter: isAlert ? "drop-shadow(0 0 10px rgba(255,0,0,0.5))" : "none" }}
      whileHover={{ y: -3, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 220, damping: 24 }}
    >
      <div className={`cyber-panel-wrap flex-grow flex flex-col p-3 relative ${isAlert ? "bg-[#220000]/90" : theme.panelBg} backdrop-blur-md`}>
        {(title || jpTitle) && (
          <div className="flex justify-between items-baseline gap-3 mb-3 pb-1 border-b relative z-10" style={{ borderColor: `${panelColor}50` }}>
            <h2
              className="font-display font-bold text-[13px] tracking-[0.15em] uppercase"
              style={{ color: panelColor, textShadow: `0 0 5px ${panelColor}80` }}
            >
              {title}
            </h2>
            {jpTitle && (
              <span className="text-[9px] font-display tracking-widest opacity-70 text-right" style={{ color: panelColor }}>
                {jpTitle}
              </span>
            )}
          </div>
        )}
        <div className="flex-grow flex flex-col h-full relative z-10">{children}</div>
        <HexBg color={panelColor} />
      </div>
    </motion.div>
  );
};

const Bar = ({ label, val, max = 100, green = false, theme = THEME_DEFAULT, amount }) => (
  <div onMouseEnter={triggerMascotSwap} className="flex items-center gap-2 mb-2 relative z-10 font-tech cursor-crosshair hover:brightness-125 transition-all">
    <span className="text-[10px] font-bold uppercase truncate w-24 opacity-80" style={{ color: theme.hex }}>
      {label}
    </span>
    <div className="flex-grow h-[4px] border-[1px] bg-black/80 flex" style={{ borderColor: `${theme.hex}50` }}>
      <div
        className="h-full shadow-[0_0_5px_currentColor] transition-all duration-1000"
        style={{ width: `${(val / max) * 100}%`, backgroundColor: green ? "#33FF00" : theme.hex }}
      />
    </div>
    <span className="text-[10px] font-bold min-w-8 text-right" style={{ color: green ? "#33FF00" : theme.hex }}>
      {amount || `${val}${max === 100 ? "%" : ""}`}
    </span>
  </div>
);

const KV = ({ k, v, green = false, alert = false, theme = THEME_DEFAULT }) => (
  <div onMouseEnter={triggerMascotSwap} className="flex justify-between gap-3 text-[10px] font-tech font-bold mb-1.5 relative z-10 border-b border-black/30 pb-0.5 hover:bg-white/5 transition-colors cursor-crosshair">
    <span className="opacity-70 truncate" style={{ color: theme.hex }}>
      {k}
    </span>
    <span className={`text-right ${alert ? "animate-pulse" : ""}`} style={{ color: green ? "#33FF00" : alert ? "#FF0000" : theme.hex }}>
      {v}
    </span>
  </div>
);

const sizeToRem = (size) => `${Number(size) * 0.25}rem`;

const EvaSyncDial = ({ val, size = "24", title = "SYNC", theme = THEME_DEFAULT }) => {
  const r = 40;
  const c = 2 * Math.PI * r;
  const off = c - (val / 100) * c;
  const dimension = { width: sizeToRem(size), height: sizeToRem(size) };
  return (
    <div className="relative flex flex-col items-center justify-center shrink-0" style={dimension}>
      <svg className="absolute inset-0 w-full h-full animate-[spin-slow_15s_linear_infinite]" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="45" fill="none" stroke={theme.hex} strokeWidth="1" strokeDasharray="4 8" opacity="0.5" />
        <polygon points="50,5 95,50 50,95 5,50" fill="none" stroke={theme.hex} strokeWidth="0.5" opacity="0.3" />
      </svg>
      <svg className="absolute inset-0 w-full h-full animate-[spin-reverse_10s_linear_infinite]" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="35" fill="none" stroke={theme.hex} strokeWidth="2" strokeDasharray="10 15" opacity="0.8" />
      </svg>
      <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={r} fill="transparent" stroke={theme.hex} strokeWidth="6" opacity="0.2" />
        <circle cx="50" cy="50" r={r} fill="transparent" stroke={theme.hex} strokeWidth="6" strokeDasharray={c} strokeDashoffset={off} style={{ transition: "stroke-dashoffset 1s" }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center font-display">
        <div className={`font-bold text-lg leading-none ${theme.textGlow}`} style={{ color: theme.hex }}>
          {val}%
        </div>
        <div className="text-[6px] font-bold tracking-[0.2em] opacity-80" style={{ color: theme.hex }}>
          {title}
        </div>
      </div>
    </div>
  );
};

const Magi3DCore = ({ theme = THEME_DEFAULT }) => (
  <div className="w-full h-full flex items-center justify-center overflow-hidden [perspective:800px]">
    <div className="eva-3d-grid relative w-48 h-48 flex items-center justify-center">
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
        <polygon points="50,15 80,35 80,65 50,85 20,65 20,35" fill="transparent" stroke={theme.hex} strokeWidth="1" opacity="0.3" />
        <circle cx="50" cy="50" r="10" fill={theme.hex} className="animate-[pulse-opacity_2s_infinite]" />
        <line x1="50" y1="50" x2="50" y2="15" stroke={theme.hex} strokeWidth="1" />
        <line x1="50" y1="50" x2="80" y2="65" stroke={theme.hex} strokeWidth="1" />
        <line x1="50" y1="50" x2="20" y2="65" stroke={theme.hex} strokeWidth="1" />
      </svg>
      <svg className="absolute inset-[-20%] w-[140%] h-[140%] animate-[spin-reverse_20s_linear_infinite]" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="48" fill="none" stroke={theme.hex} strokeWidth="0.5" strokeDasharray="2 10" />
        <circle cx="50" cy="10" r="3" fill="#FFF" />
        <circle cx="90" cy="70" r="3" fill={theme.hex} />
        <circle cx="10" cy="70" r="3" fill={theme.hex} />
      </svg>
    </div>
  </div>
);

const EvaDataStream = ({ height = "12", theme = THEME_DEFAULT }) => (
  <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full my-1" style={{ height: sizeToRem(height) }}>
    <path d="M0,50 Q25,10 50,50 T100,50" fill="none" stroke={theme.hex} strokeWidth="1" className="animate-[dash-scroll_2s_linear_infinite]" strokeDasharray="100" />
    <path d="M0,50 Q25,90 50,50 T100,50" fill="none" stroke={theme.hex} strokeWidth="0.5" className="animate-[dash-scroll_3s_linear_infinite]" strokeDasharray="50" opacity="0.5" />
    <line x1="0" y1="50" x2="100" y2="50" stroke={theme.hex} strokeWidth="0.5" strokeDasharray="2 2" opacity="0.3" />
  </svg>
);

const TacticalCam = ({ img, title, status, theme = THEME_DEFAULT }) => (
  <div onMouseEnter={triggerMascotSwap} className="cyber-panel-wrap p-[1px] relative w-full h-full bg-black overflow-hidden group z-30 pointer-events-auto cursor-crosshair" style={{ backgroundColor: `${theme.hex}50` }}>
    <div className="absolute inset-[1px] bg-black cyber-panel-wrap overflow-hidden">
      <img src={img} className="absolute inset-0 w-full h-full object-cover object-top opacity-60 mix-blend-luminosity filter contrast-150 group-hover:scale-105 transition-transform duration-1000" alt="cam" />
      <div className="absolute inset-0 opacity-30 mix-blend-color pointer-events-none" style={{ backgroundColor: theme.hex }} />
      <div className="absolute inset-0 pointer-events-none opacity-40" style={{ backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 2px, ${theme.hex} 2px, ${theme.hex} 4px)` }} />
      <div className="absolute top-1 left-1 text-[8px] font-tech font-bold bg-black/90 px-1.5 border-l-2" style={{ color: theme.hex, borderColor: theme.hex }}>
        {title}
      </div>
      <div className={`absolute bottom-1 right-2 text-[8px] font-tech font-bold px-1.5 ${["ACTIVE", "NOMINAL", "OK", "RECORDING", "REC"].includes(status) ? "bg-[#33FF00] text-black" : "bg-red-600 text-white animate-pulse"}`}>
        {status}
      </div>
    </div>
  </div>
);

const SilverFoxBadge = ({ theme = THEME_DEFAULT, className = "w-16 h-16 md:w-20 md:h-20", modelScale = 0.62 }) => {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return undefined;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(0, 0, 8);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true,
      powerPreference: "high-performance"
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.style.display = "block";
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    mount.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xdbeafe, 0.3);
    const mainLight = new THREE.DirectionalLight(0xffffff, 3);
    mainLight.position.set(5, 5, 5);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 1024;
    mainLight.shadow.mapSize.height = 1024;
    const fillLight = new THREE.PointLight(0x38bdf8, 12);
    fillLight.position.set(-5, 2, 2);
    const rimLight = new THREE.DirectionalLight(0xffffff, 4);
    rimLight.position.set(0, 2, -5);
    scene.add(ambientLight, mainLight, fillLight, rimLight);

    const createMat = (color, flat = true, metal = 0.4, rough = 0.4) =>
      new THREE.MeshStandardMaterial({
        color,
        flatShading: flat,
        roughness: rough,
        metalness: metal
      });

    const mats = {
      silver: createMat(0xcbd5e1, true, 0.6, 0.3),
      darkSilver: createMat(0x475569, true, 0.5, 0.4),
      white: createMat(0xf8fafc, true, 0.2, 0.5),
      dark: createMat(0x0f172a, true, 0.1, 0.6),
      nose: createMat(0x020617, true, 0.1, 0.2),
      eye: createMat(0x020617, true, 0.8, 0.1),
      innerEar: createMat(0x1e293b, true, 0.3, 0.7)
    };

    const fox = new THREE.Group();
    fox.scale.setScalar(modelScale);
    fox.position.set(0, 0.35, 0);
    const headGroup = new THREE.Group();
    fox.add(headGroup);
    scene.add(fox);

    const headGeom = new THREE.IcosahedronGeometry(1.2, 1);
    const head = new THREE.Mesh(headGeom, mats.silver);
    head.scale.set(1.1, 0.9, 1);
    head.castShadow = true;
    headGroup.add(head);

    const maskGeom = new THREE.IcosahedronGeometry(0.9, 1);
    const mask = new THREE.Mesh(maskGeom, mats.white);
    mask.position.set(0, -0.3, 0.4);
    mask.scale.set(1, 0.8, 1);
    headGroup.add(mask);

    const snoutGeom = new THREE.BoxGeometry(0.6, 0.5, 1.2);
    const snoutPos = snoutGeom.attributes.position;
    for (let i = 0; i < snoutPos.count; i += 1) {
      if (snoutPos.getZ(i) > 0.5) {
        snoutPos.setX(i, snoutPos.getX(i) * 0.4);
        snoutPos.setY(i, snoutPos.getY(i) * 0.5);
      }
    }
    snoutPos.needsUpdate = true;
    const snout = new THREE.Mesh(snoutGeom, mats.white);
    snout.position.set(0, -0.2, 1.2);
    headGroup.add(snout);

    const nose = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.15, 0.2), mats.nose);
    nose.position.set(0, -0.15, 1.85);
    headGroup.add(nose);

    const createEar = (side) => {
      const group = new THREE.Group();
      const outer = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.45, 1.4, 4), mats.silver);
      outer.scale.set(1, 1, 0.3);
      group.add(outer);

      const tip = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.15, 0.4, 4), mats.dark);
      tip.position.y = 0.55;
      tip.scale.set(1, 1, 0.3);
      group.add(tip);

      const inner = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.35, 1.1, 4), mats.innerEar);
      inner.position.z = 0.05;
      inner.position.y = -0.1;
      inner.scale.set(1, 1, 0.1);
      group.add(inner);

      group.position.set(side * 0.7, 1.1, 0);
      group.rotation.z = side * -0.3;
      group.rotation.x = -0.2;
      group.userData.isEar = true;
      return group;
    };
    headGroup.add(createEar(1));
    headGroup.add(createEar(-1));

    const createEye = (side) => {
      const group = new THREE.Group();
      group.add(new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.15, 0.1), mats.eye));
      const lash = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.05, 0.05), mats.dark);
      lash.position.y = 0.08;
      group.add(lash);
      group.position.set(side * 0.55, 0.1, 0.95);
      group.rotation.y = side * 0.4;
      group.rotation.z = side * -0.1;
      return group;
    };
    const leftEye = createEye(1);
    const rightEye = createEye(-1);
    headGroup.add(leftEye, rightEye);

    const createTuft = (side) => {
      const tuft = new THREE.Mesh(new THREE.IcosahedronGeometry(0.4, 0), mats.white);
      tuft.position.set(side * 1.1, -0.4, 0.3);
      tuft.scale.set(1.2, 0.7, 0.5);
      tuft.rotation.z = side * -0.4;
      return tuft;
    };
    headGroup.add(createTuft(1));
    headGroup.add(createTuft(-1));

    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 1.2, 2, 6), mats.silver);
    body.position.y = -2;
    fox.add(body);

    const chest = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 1.1, 1.5, 6), mats.white);
    chest.position.set(0, -1.8, 0.2);
    chest.scale.set(0.8, 1, 0.8);
    fox.add(chest);

    const mouse = new THREE.Vector2();
    const lookAtTarget = new THREE.Vector3(0, 0, 2);
    let frameId = 0;

    const handlePointerMove = (event) => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    const resize = () => {
      const width = Math.max(1, mount.clientWidth);
      const height = Math.max(1, mount.clientHeight);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(mount);
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    resize();

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const time = performance.now() * 0.001;
      lookAtTarget.x = THREE.MathUtils.lerp(lookAtTarget.x, mouse.x * 2.5, 0.05);
      lookAtTarget.y = THREE.MathUtils.lerp(lookAtTarget.y, mouse.y * 1.5, 0.05);
      lookAtTarget.z = 2;
      headGroup.lookAt(lookAtTarget);
      fox.position.y = 0.35 + Math.sin(time * 0.5) * 0.1;

      const blink = Math.sin(time * 0.5) > 0.98;
      leftEye.scale.y = blink ? 0.1 : 1;
      rightEye.scale.y = blink ? 0.1 : 1;

      if (Math.sin(time * 2) > 0.99) {
        headGroup.children.forEach((child) => {
          if (child.userData.isEar) child.rotation.x += Math.sin(time * 50) * 0.02;
        });
      }

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      window.removeEventListener("pointermove", handlePointerMove);
      renderer.dispose();
      scene.traverse((object) => {
        if (object.geometry) object.geometry.dispose();
      });
      Object.values(mats).forEach((mat) => mat.dispose());
      renderer.domElement.remove();
    };
  }, [modelScale]);

  return (
    <div
      className={`relative ${className} cyber-panel-wrap border-[1px] bg-transparent overflow-hidden shrink-0 cursor-crosshair`}
      style={{ borderColor: "#94a3b8", boxShadow: `0 0 20px ${theme.hex}55` }}
      onMouseEnter={triggerMascotSwap}
      title="Interactive silver fox"
    >
      <div ref={mountRef} className="absolute inset-0" />
      <div className="absolute inset-0 pointer-events-none border border-white/10 cyber-panel-wrap" />
    </div>
  );
};

const NeonOperatorGhost = ({ theme = THEME_DEFAULT }) => (
  <div className="absolute inset-0 z-[35] overflow-visible pointer-events-none">
    <img
      src={OPERATOR_AVATAR}
      alt=""
      className="absolute left-[-36%] top-[-10%] h-[128%] max-w-none object-contain mix-blend-screen animate-[neon-flicker_4.6s_steps(1,end)_infinite]"
      style={{ color: theme.hex, filter: `brightness(1.15) drop-shadow(0 0 34px ${theme.hex})` }}
    />
  </div>
);

const StatusChip = ({ theme = THEME_DEFAULT, time }) => (
  <div className="flex items-center gap-4 font-tech text-[12px] font-bold uppercase pointer-events-auto cursor-crosshair hover:brightness-125 transition-all" onMouseEnter={triggerMascotSwap}>
    <span className="flex items-center gap-2 text-[#33FF00]">
      <span className="w-2.5 h-2.5 bg-[#33FF00] animate-pulse" />
      ONLINE
    </span>
    <span style={{ color: theme.hex }}>{time}</span>
  </div>
);

const MiniKpi = ({ label, value, delta, theme }) => (
  <motion.div variants={sectionRevealVariants} whileHover={{ y: -2, scale: 1.02 }} className="border border-white/10 bg-black/40 p-2 cyber-panel-wrap min-h-[72px]">
    <div className="text-[9px] font-tech uppercase opacity-70 truncate" style={{ color: theme.hex }}>
      {label}
    </div>
    <div className="text-lg lg:text-xl font-tech font-bold text-white leading-tight">{value}</div>
    <div className="text-[9px] font-tech font-bold truncate" style={{ color: delta?.includes("below") || delta?.includes("watch") ? "#FF3300" : "#33FF00" }}>
      {delta}
    </div>
  </motion.div>
);

const DataTable = ({ rows, theme }) => (
  <motion.div variants={pageRevealVariants} className="space-y-1.5 font-tech text-[10px]">
    {rows.map((row) => (
      <motion.div variants={rowRevealVariants} key={row.join("-")} className="grid grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr] gap-2 border-b border-white/10 pb-1 hover:bg-white/5">
        {row.map((cell, index) => (
          <span key={`${row.join("-")}-${index}`} className={index === 0 ? "font-bold text-white truncate" : "text-right truncate"} style={{ color: index === 0 ? undefined : theme.hex }}>
            {cell}
          </span>
        ))}
      </motion.div>
    ))}
  </motion.div>
);

// Surfaces a vault file (or external source) that needs to be authored / re-authed
// before this panel can show real data. The dashboard's whole point: make the gap visible.
const AwaitingCapture = ({ pointer, note, theme = THEME_DEFAULT, compact = false }) => (
  <div
    className={`flex items-start gap-2 border-l-2 ${compact ? "py-1 px-2" : "p-3"} bg-black/40 backdrop-blur-sm`}
    style={{ borderColor: theme.hex }}
  >
    <FileQuestion size={compact ? 12 : 16} style={{ color: theme.hex }} className="shrink-0 mt-0.5 opacity-80" />
    <div className="font-tech text-[10px] leading-snug">
      <div className="font-bold tracking-wider opacity-80" style={{ color: theme.hex }}>
        AWAITING CAPTURE
      </div>
      {pointer && (
        <div className="text-white/85 break-all">
          <span className="opacity-60">→ </span>
          {pointer}
        </div>
      )}
      {note && <div className="text-white/55 mt-0.5 italic">{note}</div>}
    </div>
  </div>
);

const SOURCE_BADGE = {
  ok: { label: "live", color: "#33FF00" },
  snapshot: { label: "snapshot", color: "#00E5FF" },
  blocked: { label: "blocked", color: "#FF7700" },
  needs_auth: { label: "login", color: "#FFB300" },
  configured: { label: "ready", color: "#D2A86B" },
  extracted: { label: "extracted", color: "#33FF00" },
  missing: { label: "missing", color: "#FF2200" }
};

const SourceChip = ({ name, status }) => {
  const meta = SOURCE_BADGE[status] || SOURCE_BADGE.missing;
  return (
    <span
      className="flex items-center gap-1 font-tech text-[9px] tracking-widest px-1.5 py-0.5 border"
      style={{ borderColor: `${meta.color}80`, color: meta.color }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: meta.color }} />
      {name.toUpperCase()}·{meta.label}
    </span>
  );
};

const MetaBar = ({ theme }) => {
  const generated = META?.generatedAt ? new Date(META.generatedAt) : null;
  const stamp = generated ? generated.toLocaleString() : "unknown";
  const [refreshing, setRefreshing] = React.useState(false);
  const [error, setError] = React.useState(null);
  const hasIpc = typeof window !== "undefined" && !!window.dashboardAPI;

  const onRefresh = async () => {
    setError(null);
    if (!hasIpc) {
      setError("run `npm run refresh` in terminal — only available in Electron");
      return;
    }
    setRefreshing(true);
    try {
      await window.dashboardAPI.refresh();
      // Dev: Vite HMR picks up state.json. Prod: reload to re-evaluate the bundle.
      if (!import.meta.hot) window.location.reload();
    } catch (e) {
      setError(String(e.message || e));
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="absolute top-1 right-2 z-[60] flex items-center gap-2" style={{ WebkitAppRegion: "no-drag" }}>
      <div className="hidden md:flex items-center gap-1.5 pointer-events-none">
        <SourceChip name="vault" status={META?.sources?.vault || "missing"} />
        <SourceChip name="spotify" status={META?.sources?.spotify || "missing"} />
        <SourceChip name="google" status={META?.sources?.google || "missing"} />
        <SourceChip name="finance" status={DATA?.finance?.status || META?.sources?.quickbooks || "missing"} />
      </div>
      <button
        onClick={onRefresh}
        disabled={refreshing}
        title={hasIpc ? "Refresh from vault" : "Refresh available in Electron app"}
        className="flex items-center gap-1 font-tech text-[9px] px-1.5 py-0.5 border hover:bg-white/10 transition-all disabled:opacity-50 cursor-pointer pointer-events-auto"
        style={{ borderColor: `${theme.hex}80`, color: theme.hex, WebkitAppRegion: "no-drag" }}
      >
        <RefreshCw size={10} className={refreshing ? "animate-spin" : ""} />
        <span>{refreshing ? "REFRESHING…" : stamp}</span>
      </button>
      {error && (
        <div className="font-tech text-[9px] px-1.5 py-0.5 border bg-black/60 max-w-xs truncate" style={{ borderColor: "#FF2200", color: "#FF7777" }} title={error}>
          {error}
        </div>
      )}
    </div>
  );
};


const MiniSignalList = ({ items = [], theme, empty = "No signals" }) => (
  <div className="space-y-1.5 font-tech text-[10px]">
    {items.length === 0 ? (
      <KV k={empty} v="—" theme={theme} />
    ) : (
      items.map((item, idx) => (
        <div key={`${item}-${idx}`} className="border-l-2 bg-black/25 px-2 py-1 leading-snug text-white/75" style={{ borderColor: theme.hex }}>
          <span className="mr-2 opacity-45" style={{ color: theme.hex }}>{String(idx + 1).padStart(2, "0")}</span>
          {item}
        </div>
      ))
    )}
  </div>
);

const SystemMatrix = ({ system = {}, theme }) => {
  const rows = [
    ["Host", system.host],
    ["Model", system.model],
    ["OS", system.os],
    ["CPU", system.cpu],
    ["Memory", system.memory],
    ["Disk", system.disk],
    ["Uptime", system.uptime],
    ["Load", system.load]
  ].filter(([, v]) => v);
  return (
    <div className="space-y-1">
      {rows.map(([k, v]) => <KV key={k} k={k} v={v} theme={theme} green={k === "Host" || k === "Uptime"} />)}
    </div>
  );
};

const CommandSensor = ({ theme }) => {
  const hasBridge = typeof window !== "undefined" && Boolean(window.dashboardAPI?.getCommandSensor);
  const [sensor, setSensor] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const pullSensor = useCallback(async () => {
    if (!hasBridge) return;
    setBusy(true);
    setError(null);
    try {
      const next = await window.dashboardAPI.getCommandSensor();
      setSensor(next);
    } catch (e) {
      setError(String(e.message || e));
    } finally {
      setBusy(false);
    }
  }, [hasBridge]);

  useEffect(() => {
    if (!hasBridge) return undefined;
    pullSensor();
    const timer = window.setInterval(pullSensor, 15000);
    return () => window.clearInterval(timer);
  }, [hasBridge, pullSensor]);

  if (!hasBridge) {
    return <AwaitingCapture pointer="Electron desktop bridge" note="Open the AX-L Mania desktop app to activate the OS command sensor." theme={theme} compact />;
  }

  const rows = sensor ? [
    ["Sensor", `${sensor.status || "live"}${busy ? " · scanning" : ""}`],
    ["App", `${sensor.app?.mode || "electron"} · v${sensor.app?.version || "?"}`],
    ["Electron", sensor.app?.electron ? `Electron ${sensor.app.electron}` : null],
    ["Machine", `${sensor.machine?.host || "host"} · ${sensor.machine?.arch || "arch"}`],
    ["Memory", sensor.machine?.memory],
    ["Load", sensor.machine?.load],
    ["Disk", sensor.disk ? `${sensor.disk.capacity} used · ${sensor.disk.available} free` : null],
    ["Foleybot", sensor.services?.foleybot],
    ["Dashboard", sensor.services?.dashboard],
    ["Google", sensor.data?.google],
    ["State", sensor.data?.generatedAt ? new Date(sensor.data.generatedAt).toLocaleTimeString() : null]
  ].filter(([, v]) => v) : [];

  return (
    <div className="space-y-1">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="font-tech text-[8px] uppercase tracking-[0.18em] text-white/45">
          Whitelisted local checks only · no arbitrary shell
        </div>
        <button
          type="button"
          onClick={pullSensor}
          disabled={busy}
          className="border px-2 py-0.5 font-tech text-[8px] uppercase tracking-[0.16em] hover:bg-white/10 disabled:opacity-50"
          style={{ borderColor: `${theme.hex}70`, color: theme.hex }}
        >
          {busy ? "SCANNING" : "PING"}
        </button>
      </div>
      {error && <KV k="Sensor error" v={error.slice(0, 60)} alert theme={theme} />}
      {rows.length === 0 ? (
        <AwaitingCapture pointer="dashboard:get-command-sensor" note="Waiting for first Electron sample." theme={theme} compact />
      ) : (
        rows.map(([k, v]) => <KV key={k} k={k} v={v} theme={theme} green={["Sensor", "Foleybot", "Dashboard"].includes(k) && !String(v).includes("offline")} alert={String(v).includes("offline") || String(v).includes("blocked")} />)
      )}
    </div>
  );
};

const HEALTH_STYLE = {
  ok: { label: "OK", color: "#33FF00" },
  warn: { label: "WARN", color: "#FFB300" },
  fail: { label: "FAIL", color: "#FF2200" },
  missing: { label: "MISS", color: "#FF7700" }
};

const HealthBadge = ({ status }) => {
  const style = HEALTH_STYLE[status] || HEALTH_STYLE.warn;
  return (
    <span className="inline-flex items-center gap-1 border px-1.5 py-0.5 font-tech text-[8px] font-bold tracking-[0.18em]" style={{ borderColor: `${style.color}80`, color: style.color, backgroundColor: `${style.color}12` }}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: style.color, boxShadow: `0 0 8px ${style.color}` }} />
      {style.label}
    </span>
  );
};

const HealthCheckGrid = ({ health = {}, theme }) => {
  const groups = health.groups || [];
  const counts = health.counts || {};
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2 border border-[#D2A86B]/25 bg-[#070503]/80 px-2 py-1.5 shadow-[inset_0_0_22px_rgba(210,168,107,0.08)]">
        <div className="flex items-center gap-2 font-display text-[10px] font-black uppercase tracking-[0.22em] text-[#D2A86B]">
          <Shield size={14} /> HEALTH MATRIX
        </div>
        <div className="flex flex-wrap gap-1.5">
          {Object.entries({ ok: counts.ok || 0, warn: counts.warn || 0, missing: counts.missing || 0, fail: counts.fail || 0 }).map(([status, count]) => (
            <span key={status} className="font-tech text-[8px] uppercase tracking-[0.16em] text-white/60">
              <HealthBadge status={status} /> <b className="text-white">{count}</b>
            </span>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 gap-2 lg:grid-cols-2">
        {groups.map((group) => (
          <div key={group.id} className="border bg-black/45 p-2" style={{ borderColor: `${theme.hex}30` }}>
            <div className="mb-1.5 flex items-center justify-between gap-2">
              <div className="font-display text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: theme.hex }}>{group.title}</div>
              <div className="font-tech text-[8px] text-white/40">{group.checks?.length || 0} checks</div>
            </div>
            <div className="space-y-1">
              {(group.checks || []).map((check) => (
                <div key={check.id} className="grid grid-cols-[auto_1fr] gap-2 border-l-2 bg-[#0b0806]/70 px-2 py-1" style={{ borderColor: (HEALTH_STYLE[check.status] || HEALTH_STYLE.warn).color }} title={check.evidence || ""}>
                  <HealthBadge status={check.status} />
                  <div className="min-w-0">
                    <div className="truncate font-tech text-[9px] font-bold uppercase tracking-[0.12em] text-white/90">{check.name}</div>
                    <div className="truncate font-tech text-[8px] text-white/45">{check.detail}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="font-tech text-[8px] uppercase tracking-[0.18em] text-[#D2A86B]/65">
        Generated by npm run refresh · {health.safeMode || "secret values redacted"}
      </div>
    </div>
  );
};

const RelationshipGrid = ({ people = {}, theme }) => {
  const relationships = people.keyRelationships || [];
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-3 gap-1.5">
        <MiniKpi label="Contacts" value={`${people.contacts ?? relationships.length ?? 0}`} delta="governed" theme={theme} />
        <MiniKpi label="Emails" value={`${people.emails ?? 0}`} delta="captured" theme={theme} />
        <MiniKpi label="Phones" value={`${people.phones ?? 0}`} delta="captured" theme={theme} />
      </div>
      <div className="grid grid-cols-2 gap-1.5 font-tech text-[9px]">
        {(people.circles || []).filter((c) => c.count > 0).slice(0, 6).map((c) => (
          <div key={c.name} className="flex justify-between border border-white/10 bg-black/30 px-2 py-1" style={{ color: theme.hex }}>
            <span className="truncate">{c.name}</span><span className="text-white">{c.count}</span>
          </div>
        ))}
      </div>
      <div className="max-h-[180px] overflow-y-auto pr-1 scrollbar-hide">
        {relationships.slice(0, 8).map((r) => (
          <div key={`${r.name}-${r.role}`} className="mb-1.5 border-l-2 bg-black/30 px-2 py-1" style={{ borderColor: theme.hex }}>
            <div className="font-display text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: theme.hex }}>{r.name}</div>
            <div className="font-tech text-[9px] leading-snug text-white/60">{r.org ? `${r.org} · ` : ""}{r.role}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

const HomeHubView = ({ theme }) => (
  <motion.div variants={pageRevealVariants} initial="hidden" animate="show" exit="exit" className="flex w-full h-full relative p-2 md:p-4 gap-6">
    <div className="w-full md:w-[38%] flex flex-col gap-4 z-30 h-full">
      <Panel title="NORTH STARS" jpTitle="ドメイン" theme={theme}>
        <div className="space-y-2">
          {DATA.northStars.map((item) => (
            <div key={item.domain}>
              <KV
                k={`${item.domain} / ${item.metric}`}
                v={`${item.value} · ${item.type}`}
                green={item.type === "leading" && item.value !== "MISSING"}
                alert={item.value === "MISSING" || item.type === "control"}
                theme={theme}
              />
              {item.awaiting && <AwaitingCapture pointer={item.awaiting} theme={theme} compact />}
            </div>
          ))}
        </div>
      </Panel>

      <Panel title="SILVER FOX CORE" jpTitle="interactive" theme={theme} className="flex-grow min-h-[360px]">
        <SilverFoxBadge theme={theme} className="w-full h-full min-h-[330px]" modelScale={1.28} />
      </Panel>
    </div>

    <div className="hidden md:grid w-[62%] grid-cols-2 gap-4 z-30 content-end pointer-events-auto">
      <Panel title="URGENT TRIGGERS" jpTitle="from URGENT.md" theme={theme} className="self-end">
        {DATA.triggers.length === 0 ? (
          <AwaitingCapture pointer="outputs/chatgpt-deep-dive/URGENT.md" theme={theme} />
        ) : (
          DATA.triggers.map((item) => (
            <KV
              key={item.label}
              k={`#${item.n} ${item.label}`}
              v={item.rule}
              alert={item.level === "CRITICAL"}
              green={item.level === "ACTIVE"}
              theme={theme}
            />
          ))
        )}
      </Panel>
      <Panel title="KILL LIST" jpTitle="capture filter" theme={theme} className="self-end">
        <div className="space-y-2 font-tech text-[10px]">
          {DATA.killList.map((item) => (
            <div key={item} className="border-l-2 pl-2" style={{ borderColor: theme.hex, color: theme.hex }}>
              {item}
            </div>
          ))}
        </div>
        <div className="mt-2 text-[9px] opacity-50 font-tech">
          source: areas/AI Capture and Information Defaults.md
        </div>
      </Panel>
      <Panel title="VAULT OUTPUT" jpTitle="capture > synthesis" theme={theme} className="col-span-2">
        <div className="grid grid-cols-4 gap-2 mb-3">
          {DATA.content.kpis.map(([label, value, delta]) => (
            <MiniKpi key={label} label={label} value={value} delta={delta} theme={theme} />
          ))}
        </div>
        <DataTable rows={DATA.content.economics} theme={theme} />
      </Panel>
    </div>
  </motion.div>
);

const SecondBrainView = ({ theme }) => {
  const gaps = DATA.brain.synthesisGaps || [];
  const totalGaps = gaps.length;
  const filled = gaps.filter((g) => g.exists).length;
  const syncRatio = totalGaps ? Math.round((filled / totalGaps) * 100) : 0;
  // Capture vs synthesis ratio (raw size vs synth size, log-scaled into 0..100)
  const memo = DATA.brain.memoryAllocation || {};
  const research = memo.research || [];
  return (
    <motion.div variants={pageRevealVariants} initial="hidden" animate="show" exit="exit" className="grid grid-cols-1 md:grid-cols-12 gap-4 h-full relative p-2 md:p-4">
      <div className="md:col-span-3 flex flex-col gap-4 z-30">
        <Panel title="SYNTHESIS RATIO" jpTitle="filled / total" theme={theme} className="items-center justify-center py-6">
          <EvaSyncDial val={syncRatio} size="32" title={`${filled}/${totalGaps}`} theme={theme} />
        </Panel>
        <Panel title="VAULT STATE" jpTitle="from filesystem walk" theme={theme}>
          {DATA.brain.stats.map(([k, v]) => (
            <KV key={k} k={k} v={v} theme={theme} />
          ))}
        </Panel>
        <Panel title="ACTIVE AGENTS · TRL" jpTitle="agents/INDEX.md" theme={theme} className="flex-grow">
          {DATA.brain.focus.length === 0 ? (
            <AwaitingCapture pointer="agents/INDEX.md" theme={theme} />
          ) : (
            DATA.brain.focus.map((item) => (
              <Bar key={item.label} label={item.label} val={item.val} theme={theme} green={item.val >= 80} />
            ))
          )}
        </Panel>
      </div>

      <div className="md:col-span-5 flex flex-col gap-4 z-30">
        <Panel title="MELCHIOR CORE" jpTitle="マギシステム" theme={theme} className="h-64 overflow-hidden">
          <div className="absolute top-2 left-2 text-[9px] font-tech font-bold opacity-60 z-20">
            VAULT FILES: {DATA.inventory?.totalFiles ?? "—"}
            <br />
            7-DAY DELTA: +{DATA.inventory?.newWeek ?? "—"}
          </div>
          <Magi3DCore theme={theme} />
        </Panel>
        <Panel title="SYNTHESIS GAPS" jpTitle="must be authored" theme={theme} className="flex-grow">
          <div className="space-y-2 font-tech text-[10px] max-h-[260px] overflow-y-auto scrollbar-hide pr-1">
            {(DATA.brain.synthesisGaps || []).map((gap) => (
              <div key={gap.file} className="border-l-2 pl-2" style={{ borderColor: theme.hex }}>
                <div className="font-bold" style={{ color: theme.hex }}>{gap.title}</div>
                <div className="text-white/55 break-all">→ {gap.file}</div>
                <div className="text-white/40 italic">{gap.reason}</div>
              </div>
            ))}
            {(!DATA.brain.synthesisGaps || DATA.brain.synthesisGaps.length === 0) && (
              <AwaitingCapture pointer="outputs/Vault Status.md" theme={theme} />
            )}
          </div>
        </Panel>
      </div>

      <div className="md:col-span-4 flex flex-col gap-4 z-30">
        <Panel title="OPERATOR STATE" jpTitle="vault inventory" theme={theme}>
          {DATA.brain.operator.map(([k, v]) => (
            <KV
              key={k}
              k={k}
              v={v}
              alert={(k.toLowerCase().includes("gap") && Number(v) > 0)}
              green={k.toLowerCase().includes("active") && Number(v) > 0}
              theme={theme}
            />
          ))}
        </Panel>
        <Panel title="STORAGE PRESSURE" jpTitle="capture vs synthesis" theme={theme}>
          <KV k="Raw" v={memo.rawSize || "—"} theme={theme} alert />
          <KV k="Synthesized (wiki+outputs)" v={memo.synthesizedSize || "—"} theme={theme} green />
          <div className="text-[9px] font-tech opacity-60 mt-2 leading-snug" style={{ color: theme.hex }}>
            asymmetric by design — but the synthesis side has to keep pace
          </div>
        </Panel>
        <div className="grid grid-cols-2 gap-2 h-28">
          <Panel title="CAPTURE" theme={theme}>
            <KV k="Inbox notes" v={`${memo.capture?.quickNotes ?? "—"}`} theme={theme} />
            <KV k="Voice memos" v={`${memo.capture?.voiceMemos ?? "—"}`} theme={theme} />
          </Panel>
          <Panel title="PROCESSING QUEUE" theme={theme}>
            {research.length === 0 ? (
              <KV k="empty" v="—" theme={theme} />
            ) : (
              research.slice(0, 3).map((r) => (
                <KV key={r.n} k={`#${r.n}`} v={r.title.slice(0, 18)} theme={theme} />
              ))
            )}
          </Panel>
        </div>
      </div>
    </motion.div>
  );
};

const MusicFinanceView = ({ theme }) => {
  const aw = DATA.finance.awaiting || {};
  return (
    <motion.div variants={pageRevealVariants} initial="hidden" animate="show" exit="exit" className="grid grid-cols-1 md:grid-cols-12 gap-4 h-full relative z-30 p-2 md:p-4">
      <div className="md:col-span-8 flex flex-col gap-4 h-full">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {DATA.finance.kpis.map((item) => (
            <Panel key={item.label} title={item.label} theme={theme}>
              <div className="text-xl font-tech font-bold" style={{ color: item.value === "AWAITING" || item.value === "MISSING" ? "#FF7700" : undefined }}>
                {item.value}
              </div>
              <div className="text-[10px] font-tech font-bold" style={{ color: item.delta?.includes("below") || item.delta?.includes("must") || item.delta?.includes("re-auth") ? "#FF2200" : "#33FF00" }}>
                {item.delta}
              </div>
              <EvaDataStream height="6" theme={theme} />
              {item.awaiting && <AwaitingCapture pointer={item.awaiting} theme={theme} compact />}
            </Panel>
          ))}
        </div>

        <Panel title="INCOME BY SOURCE" jpTitle="vault has no financial reality yet" theme={theme}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              {DATA.finance.sources.map((item) => (
                <Bar key={item.label} label={item.label} val={item.val} amount={item.amount} theme={theme} />
              ))}
            </div>
            <AwaitingCapture
              pointer={aw.wikiBusinessState || "wiki/business/state.md"}
              note='Per Vault Status: "No income, runway, or allocation data anywhere." Author this wiki note OR re-auth QuickBooks to populate.'
              theme={theme}
            />
          </div>
        </Panel>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-grow">
          <Panel title="QUICKBOOKS" jpTitle="P&L · cash flow" theme={theme}>
            <AwaitingCapture
              pointer={aw.quickbooks || "data-sources/quickbooks/STATUS.md"}
              note="Token expired. Re-auth via Claude.ai connector, then run npm run refresh."
              theme={theme}
            />
          </Panel>
          <Panel title="ROYALTY REVIEW" jpTitle="URGENT #3" theme={theme}>
            <AwaitingCapture
              pointer={aw.royaltyReview || "areas/money/royalty-review.md"}
              note="BMI / Warner / Kimie Aryai. Statements unreviewed = splits paid wrong indefinitely."
              theme={theme}
            />
          </Panel>
          <Panel title="DOMAIN AUDIT" jpTitle="URGENT #5" theme={theme}>
            <AwaitingCapture
              pointer={aw.domainAudit || "areas/infrastructure/domains.md"}
              note="Wix + GoDaddy parked / failing. axlfolie.com must work — it's in the IG bio."
              theme={theme}
            />
          </Panel>
        </div>
      </div>

      <div className="md:col-span-4 relative pointer-events-none flex flex-col justify-end">
        <div className="text-[14px] font-display font-bold opacity-90 text-right bg-black/60 backdrop-blur-md p-4 cyber-panel-wrap border-r-4 pointer-events-auto" style={{ borderColor: theme.hex, color: theme.hex }}>
          {(DATA.finance.doctrine || []).map((line) => (
            <div key={line}>{line}</div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

const NetworkOpsView = ({ theme }) => {
  const aw = DATA.network.audienceAwaiting || {};
  const alerts = DATA.network.alerts || [];
  const people = DATA.network.people || {};
  const infra = DATA.network.infrastructure || {};
  return (
    <motion.div variants={pageRevealVariants} initial="hidden" animate="show" exit="exit" className="grid grid-cols-1 md:grid-cols-12 gap-4 h-full relative p-2 md:p-4">
      <div className="md:col-span-4 flex flex-col gap-4 z-30">
        <Panel title="LOCAL SYSTEM CORE" jpTitle="live machine" theme={theme}>
          <SystemMatrix system={DATA.network.system} theme={theme} />
        </Panel>
        <Panel title="OS COMMAND SENSOR" jpTitle="electron bridge" theme={theme}>
          <CommandSensor theme={theme} />
        </Panel>
        <Panel title="NETWORK STATE" jpTitle="vault + runtime" theme={theme}>
          {DATA.network.kpis.map(([k, v, delta]) => (
            <KV key={k} k={k} v={`${v} / ${delta}`} alert={String(v).includes("MISSING") || String(v).includes("AWAITING")} green={!String(v).includes("MISSING") && !String(v).includes("AWAITING")} theme={theme} />
          ))}
        </Panel>
        <Panel title="AGENT STACK · TRL" jpTitle="agents/INDEX.md" theme={theme} className="flex-grow">
          {DATA.network.agents.length === 0 ? (
            <AwaitingCapture pointer="agents/INDEX.md" theme={theme} />
          ) : (
            DATA.network.agents.map((item) => (
              <Bar key={item.label} label={item.label} val={item.val} amount={item.amount} theme={theme} green={item.val >= 80} />
            ))
          )}
        </Panel>
      </div>

      <div className="md:col-span-4 flex flex-col gap-4 z-30">
        <Panel title="RELATIONSHIP REGISTER" jpTitle="wiki/network/people.md" theme={theme} className="flex-grow">
          <RelationshipGrid people={people} theme={theme} />
        </Panel>
        <Panel title="INFRASTRUCTURE SIGNALS" jpTitle={infra.source || "areas/"} theme={theme}>
          <MiniSignalList items={infra.signals || []} theme={theme} empty="No infrastructure file" />
        </Panel>
      </div>

      <div className="md:col-span-4 relative pointer-events-auto flex flex-col gap-4 z-30">
        <Panel title="ACTIVE ALERTS" isAlert theme={theme}>
          <div className="flex items-start gap-3 w-full">
            <AlertTriangle size={34} className="text-red-500 animate-pulse shrink-0" />
            <div className="text-[10px] font-tech font-bold leading-relaxed">
              {alerts.map((a) => (
                <div key={a.text} className={a.level === "red" ? "text-red-500" : "text-yellow-500"}>{a.text}</div>
              ))}
            </div>
          </div>
        </Panel>
        <Panel title="HEALTH CHECKS" jpTitle="refresh-generated" theme={theme} className="max-h-[430px] overflow-y-auto scrollbar-hide">
          <HealthCheckGrid health={DATA.network.healthChecks} theme={theme} />
        </Panel>
        <Panel title="URGENT RISKS" jpTitle="from URGENT.md" theme={theme}>
          {(DATA.network.risks || []).map(([k, v, level]) => (
            <KV key={k} k={k} v={`${v} · ${level}`} alert={level === "RED" || level === "HIGH" || level === "CRITICAL"} green={level === "OK"} theme={theme} />
          ))}
          {(!DATA.network.risks || DATA.network.risks.length === 0) && <AwaitingCapture pointer="outputs/chatgpt-deep-dive/URGENT.md" theme={theme} />}
        </Panel>
        <Panel title="PROCESSING QUEUE" jpTitle="raw/imports" theme={theme}>
          {(DATA.inventory?.processingQueue || []).slice(0, 4).map((q) => <KV key={q.n} k={`#${q.n}`} v={q.title.slice(0, 36)} theme={theme} />)}
          {(DATA.inventory?.processingQueue || []).length === 0 && <AwaitingCapture pointer="raw/imports/PROCESSING_QUEUE.md" theme={theme} />}
        </Panel>
        <Panel title="CONVERSION FUNNEL" theme={theme}>
          {DATA.network.conversionFunnel?.awaiting ? (
            <AwaitingCapture pointer={DATA.network.conversionFunnel.pointer} note="People wiki missing; relationship layer cannot score outreach yet." theme={theme} compact />
          ) : (
            <>
              <KV k="Relationship base" v={`${DATA.network.conversionFunnel?.contacts ?? people.contacts ?? 0} governed contacts`} green theme={theme} />
              <KV k="Gmail / calendar" v={aw.gmail ? "login needed" : "available"} alert={!!aw.gmail} green={!aw.gmail} theme={theme} />
              <KV k="Next build" v="CRM scoring + last-touch dates" theme={theme} />
            </>
          )}
        </Panel>
      </div>
    </motion.div>
  );
};

// --- World intelligence components --------------------------------------------------------

const WorldGlobeStage = ({ theme, events, activeLayers, onHover }) => {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const layersRef = useRef(activeLayers);
  const hoverRef = useRef(onHover);
  const interactingRef = useRef(false);
  layersRef.current = activeLayers;
  hoverRef.current = onHover;

  // Init map once per theme change.
  useEffect(() => {
    if (!mapboxgl.accessToken) return undefined;
    const container = containerRef.current;
    if (!container) return undefined;

    const map = new mapboxgl.Map({
      container,
      style: "mapbox://styles/mapbox/dark-v11",
      projection: "globe",
      zoom: 1.4,
      center: [0, 18],
      attributionControl: false,
      logoPosition: "bottom-right",
      cooperativeGestures: false
    });
    mapRef.current = map;

    const onStyleLoad = () => {
      try {
        map.setFog({
          color: "rgba(20, 18, 14, 0.55)",
          "high-color": theme.hex,
          "horizon-blend": 0.06,
          "space-color": "rgb(2, 1, 1)",
          "star-intensity": 0.4
        });
      } catch (e) {
        // ignore: setFog may not be supported on every style version
      }
      if (!map.getSource("events")) {
        map.addSource("events", {
          type: "geojson",
          data: { type: "FeatureCollection", features: [] }
        });
        map.addLayer({
          id: "events-glow",
          type: "circle",
          source: "events",
          paint: {
            "circle-radius": ["+", 8, ["*", 0.06, ["get", "intensity"]]],
            "circle-color": ["get", "color"],
            "circle-blur": 0.85,
            "circle-opacity": 0.45
          }
        });
        map.addLayer({
          id: "events-core",
          type: "circle",
          source: "events",
          paint: {
            "circle-radius": ["+", 2.5, ["*", 0.035, ["get", "intensity"]]],
            "circle-color": ["get", "color"],
            "circle-stroke-width": 0.6,
            "circle-stroke-color": "rgba(255,255,255,0.55)"
          }
        });
      }
    };
    map.on("style.load", onStyleLoad);

    const onEventEnter = (e) => {
      const f = e.features?.[0];
      if (!f) return;
      hoverRef.current?.({
        id: f.properties.id,
        layer: f.properties.layer,
        label: f.properties.label,
        intensity: Number(f.properties.intensity),
        magnitude: f.properties.magnitude ? Number(f.properties.magnitude) : undefined,
        lat: f.geometry.coordinates[1],
        lon: f.geometry.coordinates[0]
      });
      map.getCanvas().style.cursor = "pointer";
    };
    const onEventLeave = () => {
      hoverRef.current?.(null);
      map.getCanvas().style.cursor = "";
    };
    map.on("mousemove", "events-core", onEventEnter);
    map.on("mouseleave", "events-core", onEventLeave);

    const markInteract = () => { interactingRef.current = true; };
    const clearInteract = () => { setTimeout(() => { interactingRef.current = false; }, 1500); };
    map.on("mousedown", markInteract);
    map.on("mouseup", clearInteract);
    map.on("touchstart", markInteract);
    map.on("touchend", clearInteract);
    map.on("wheel", () => {
      interactingRef.current = true;
      clearInteract();
    });

    let rafId = 0;
    let lastT = 0;
    const rotate = (t) => {
      const dt = lastT ? (t - lastT) / 1000 : 0;
      lastT = t;
      if (mapRef.current && !interactingRef.current) {
        const c = mapRef.current.getCenter();
        const next = [(c.lng + dt * 4 + 540) % 360 - 180, c.lat];
        mapRef.current.setCenter(next);
      }
      rafId = requestAnimationFrame(rotate);
    };
    rafId = requestAnimationFrame(rotate);

    return () => {
      cancelAnimationFrame(rafId);
      map.off("style.load", onStyleLoad);
      map.off("mousemove", "events-core", onEventEnter);
      map.off("mouseleave", "events-core", onEventLeave);
      map.remove();
      mapRef.current = null;
    };
  }, [theme.hex]);

  // Push events into the GeoJSON source whenever events or active layers change.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return undefined;

    const updateSource = () => {
      const layerColor = WORLD_LAYERS.reduce((acc, l) => ({ ...acc, [l.id]: l.hex }), {});
      const layers = layersRef.current;
      const features = (events || [])
        .filter((e) => layers[e.layer] && typeof e.lat === "number" && typeof e.lon === "number")
        .map((e) => ({
          type: "Feature",
          geometry: { type: "Point", coordinates: [e.lon, e.lat] },
          properties: {
            id: e.id,
            layer: e.layer,
            label: e.label,
            intensity: e.intensity ?? 50,
            magnitude: e.magnitude ?? null,
            color: layerColor[e.layer] || "#ffffff"
          }
        }));
      const src = map.getSource("events");
      if (src) src.setData({ type: "FeatureCollection", features });
    };

    if (map.isStyleLoaded()) {
      updateSource();
    } else {
      map.once("style.load", updateSource);
    }
    return undefined;
  }, [events, activeLayers]);

  if (!mapboxgl.accessToken) {
    return (
      <div className="absolute inset-0 flex items-center justify-center font-tech text-[10px] tracking-[0.18em] uppercase opacity-60" style={{ color: theme.hex }}>
        VITE_MAPBOX_TOKEN missing
      </div>
    );
  }

  return <div ref={containerRef} className="absolute inset-0" />;
};

const WorldLayerToggles = ({ active, onToggle, theme }) => (
  <div className="flex flex-wrap items-center gap-1.5 mt-2">
    <span className="font-tech text-[8px] tracking-[0.28em] uppercase opacity-60 mr-1" style={{ color: theme.hex }}>
      LAYERS
    </span>
    {WORLD_LAYERS.map((l) => {
      const on = !!active[l.id];
      return (
        <button
          key={l.id}
          type="button"
          onClick={() => onToggle(l.id)}
          className="font-tech text-[9px] tracking-[0.18em] uppercase px-1.5 py-0.5 border transition-all flex items-center gap-1.5"
          style={{
            color: on ? l.hex : `${l.hex}80`,
            borderColor: on ? `${l.hex}cc` : `${l.hex}30`,
            backgroundColor: on ? `${l.hex}18` : "transparent",
            textShadow: on ? `0 0 6px ${l.hex}80` : "none"
          }}
        >
          <span className="inline-block w-1.5 h-1.5" style={{ backgroundColor: on ? l.hex : `${l.hex}50`, boxShadow: on ? `0 0 6px ${l.hex}` : "none" }} />
          {l.label}
        </button>
      );
    })}
  </div>
);

const BreakingTicker = ({ theme }) => {
  const { data, error } = useLiveData(fetchRedditWorldNews, 5 * 60 * 1000);
  const items = data && data.length > 0 ? data : [];
  const stream = items.length > 0 ? [...items, ...items] : [];
  return (
    <div className="cyber-panel-wrap p-[1px] relative overflow-hidden pointer-events-auto" style={{ backgroundColor: `${theme.hex}50` }}>
      <div className="flex items-stretch bg-black/70 backdrop-blur-md">
        <div className="flex items-center gap-2 px-3 border-r" style={{ borderColor: `${theme.hex}40`, color: theme.hex }}>
          <span className="w-1.5 h-1.5 bg-[#FF2200] animate-pulse" />
          <span className="font-display font-bold text-[10px] tracking-[0.32em]">
            {error ? "OFFLINE" : data ? "LIVE · r/worldnews" : "TUNING…"}
          </span>
        </div>
        <div className="relative flex-grow overflow-hidden h-8">
          {stream.length > 0 && (
            <motion.div
              className="absolute inset-y-0 left-0 flex items-center gap-10 whitespace-nowrap"
              animate={{ x: ["0%", "-50%"] }}
              transition={{ repeat: Infinity, duration: 140, ease: "linear" }}
            >
              {stream.map((s, i) => (
                <span key={`${s.id}-${i}`} className="flex items-center gap-2 font-tech text-[10px]" style={{ color: theme.hex }}>
                  <em className="not-italic px-1.5 py-0.5 border text-[8px] font-bold tracking-[0.18em]" style={{ borderColor: `${theme.hex}80`, color: theme.hex }}>
                    {s.tag}
                  </em>
                  <small className="opacity-60 text-[8px] tracking-[0.18em]">{s.region}</small>
                  <span className="text-white/85">{s.message}</span>
                  <i className="not-italic opacity-50 text-[9px] tabular-nums">{s.time}</i>
                </span>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

const LiveVideoPanel = ({ theme }) => {
  const [activeId, setActiveId] = useState(WORLD_VIDEO_FEEDS[0].id);
  const active = WORLD_VIDEO_FEEDS.find((f) => f.id === activeId) || WORLD_VIDEO_FEEDS[0];
  const src = `https://www.youtube.com/embed/live_stream?channel=${active.channel}&autoplay=1&mute=1&modestbranding=1&rel=0`;
  return (
    <Panel title="LIVE VIDEO INTEL" jpTitle="open-source feeds" theme={theme}>
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-[#FF2200] animate-pulse" />
          <span className="font-display font-bold text-[10px] tracking-[0.32em]" style={{ color: theme.hex }}>
            ON AIR · {active.label}
          </span>
        </div>
        <span className="font-tech text-[8px] tracking-[0.24em] opacity-60" style={{ color: theme.hex }}>
          {active.region}
        </span>
      </div>
      <div
        className="relative w-full overflow-hidden border bg-black/80"
        style={{ borderColor: `${theme.hex}40`, aspectRatio: "16 / 9" }}
      >
        <iframe
          key={active.id}
          src={src}
          title={`${active.label} live stream`}
          className="absolute inset-0 w-full h-full"
          frameBorder="0"
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
        <div
          className="absolute top-1.5 right-1.5 px-1.5 py-0.5 font-tech text-[8px] tracking-[0.24em] backdrop-blur-md bg-black/60 border pointer-events-none"
          style={{ borderColor: `${theme.hex}60`, color: theme.hex }}
        >
          CH-{active.id.toUpperCase()}
        </div>
      </div>
      <div className="grid grid-cols-4 gap-1.5 mt-2">
        {WORLD_VIDEO_FEEDS.map((f) => {
          const on = f.id === activeId;
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => setActiveId(f.id)}
              className="font-tech text-[9px] tracking-[0.14em] uppercase px-1.5 py-1 border transition-all flex flex-col items-start gap-0.5"
              style={{
                color: on ? theme.hex : `${theme.hex}80`,
                borderColor: on ? `${theme.hex}cc` : `${theme.hex}30`,
                backgroundColor: on ? `${theme.hex}18` : "transparent",
                textShadow: on ? `0 0 5px ${theme.hex}80` : "none"
              }}
            >
              <span className="font-bold">{f.label}</span>
              <span className="text-[7px] tracking-[0.2em] opacity-50">{f.region}</span>
            </button>
          );
        })}
      </div>
    </Panel>
  );
};

const RecentEventsPanel = ({ theme, events }) => {
  const layerLabel = WORLD_LAYERS.reduce((acc, l) => ({ ...acc, [l.id]: l.label.toUpperCase() }), {});
  const layerColor = WORLD_LAYERS.reduce((acc, l) => ({ ...acc, [l.id]: l.hex }), {});
  const sorted = [...(events || [])]
    .sort((a, b) => (b.intensity ?? 0) - (a.intensity ?? 0))
    .slice(0, 7);
  return (
    <Panel title="RECENT MAJOR EVENTS" jpTitle="USGS · NASA EONET" theme={theme}>
      <div className="flex flex-col gap-1 mt-1">
        {sorted.length === 0 ? (
          <div className="font-tech text-[10px] opacity-60 py-2" style={{ color: theme.hex }}>
            Waiting on first fetch…
          </div>
        ) : (
          sorted.map((e, i) => (
            <div
              key={e.id}
              className="grid grid-cols-[18px_1fr_auto] items-center gap-2 border-b border-black/30 pb-1 hover:bg-white/5 transition-colors cursor-crosshair"
              onMouseEnter={triggerMascotSwap}
            >
              <span className="font-tech text-[9px] opacity-50 tabular-nums" style={{ color: theme.hex }}>
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="min-w-0">
                <div className="font-display font-bold text-[10px] tracking-[0.04em] truncate" style={{ color: theme.hex }}>
                  {e.label}
                </div>
                <div className="font-tech text-[8px] opacity-60 tracking-[0.12em]" style={{ color: theme.hex }}>
                  {layerLabel[e.layer] || e.layer.toUpperCase()} · {e.lat?.toFixed(1)}°, {e.lon?.toFixed(1)}°
                </div>
              </div>
              <div
                className="flex items-center gap-1 px-1.5 py-0.5 border"
                style={{ borderColor: `${layerColor[e.layer] || theme.hex}80` }}
              >
                <span className="font-display font-bold text-[11px] tabular-nums" style={{ color: layerColor[e.layer] || theme.hex }}>
                  {e.magnitude != null ? `M${e.magnitude.toFixed(1)}` : e.intensity ?? "—"}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </Panel>
  );
};

const FinanceRadarPanel = ({ theme }) => {
  const { data: ticks } = useLiveData(fetchTwelveDataMarkets, 5 * 60 * 1000);
  const rows = ticks || [];
  return (
    <Panel title="FINANCE RADAR" jpTitle="Twelve Data" theme={theme}>
      <div className="grid grid-cols-4 gap-1.5 mt-1">
        {rows.length === 0 ? (
          <div className="col-span-4 font-tech text-[10px] opacity-60 py-2" style={{ color: theme.hex }}>
            Tuning markets…
          </div>
        ) : (
          rows.map((f) => {
            const positive = String(f.delta).startsWith("+");
            const deltaColor = !f.delta ? `${theme.hex}80` : positive ? "#33FF00" : "#FF2200";
            return (
              <div
                key={f.symbol}
                className="border p-1.5 hover:bg-white/5 transition-colors cursor-crosshair"
                style={{ borderColor: `${theme.hex}30` }}
                onMouseEnter={triggerMascotSwap}
              >
                <div className="flex items-baseline justify-between gap-1 mb-0.5">
                  <strong className="font-display font-bold text-[10px] tracking-[0.12em]" style={{ color: theme.hex }}>
                    {f.symbol}
                  </strong>
                  <small className="font-tech text-[7px] opacity-50 truncate" style={{ color: theme.hex }}>
                    {f.name}
                  </small>
                </div>
                <div className="flex items-baseline justify-between gap-1">
                  <span className="font-display text-[12px] tabular-nums text-white/90">{f.value}</span>
                  <em className="not-italic font-tech text-[9px] font-bold tabular-nums" style={{ color: deltaColor }}>
                    {f.delta || "—"}
                  </em>
                </div>
              </div>
            );
          })
        )}
      </div>
    </Panel>
  );
};

// --- WorldView ----------------------------------------------------------------------------

const WorldView = ({ theme }) => {
  const newsAwaiting = DATA.world.news?.awaiting;
  const sentiment = DATA.world.sentimentIndex ?? 0;
  const [activeLayers, setActiveLayers] = useState({
    quake: true,
    volcano: true,
    wildfire: true,
    storm: true,
    ice: true,
    flood: true
  });
  const [hoveredEvent, setHoveredEvent] = useState(null);

  const { data: quakes, error: usgsError, updatedAt: usgsAt } = useLiveData(fetchUSGSQuakes, 5 * 60 * 1000);
  const { data: eonet, error: eonetError, updatedAt: eonetAt } = useLiveData(fetchEONETEvents, 15 * 60 * 1000);

  const events = [...(quakes || []), ...(eonet || [])];
  const lastUpdate = Math.max(usgsAt || 0, eonetAt || 0);

  const toggleLayer = (id) => setActiveLayers((prev) => ({ ...prev, [id]: !prev[id] }));
  const liveCount = events.filter((e) => activeLayers[e.layer]).length;

  return (
    <motion.div variants={pageRevealVariants} initial="hidden" animate="show" exit="exit" className="flex flex-col gap-3 h-full relative p-2 md:p-4">
      <BreakingTicker theme={theme} />

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 flex-grow">
        <div className="md:col-span-3 flex flex-col gap-4 z-30">
          <Panel title="GLOBE OF SIGNALS" jpTitle="live pin field" theme={theme} className="h-72">
            <div className="relative flex-grow">
              <WorldGlobeStage theme={theme} events={events} activeLayers={activeLayers} onHover={setHoveredEvent} />
              <div className="absolute top-0 left-0 font-tech text-[8px] tracking-[0.28em] opacity-70 pointer-events-none" style={{ color: theme.hex }}>
                {usgsError && eonetError ? "FEED OFFLINE" : `LIVE · ${liveCount} SIGNALS`}
              </div>
              <div className="absolute top-0 right-0 font-tech text-[8px] tracking-[0.28em] opacity-70 text-right pointer-events-none" style={{ color: theme.hex }}>
                IDX {sentiment}
              </div>
              <div className="absolute bottom-0 left-0 font-tech text-[8px] tracking-[0.28em] opacity-50 pointer-events-none" style={{ color: theme.hex }}>
                {lastUpdate ? `SYNC ${new Date(lastUpdate).toTimeString().slice(0, 5)}` : "SYNC —"}
              </div>
              {hoveredEvent && (
                <div
                  className="absolute left-1/2 -translate-x-1/2 top-2 px-2 py-1 border-l-2 backdrop-blur-md bg-black/70 pointer-events-none min-w-[180px] z-10"
                  style={{ borderColor: WORLD_LAYERS.find((l) => l.id === hoveredEvent.layer)?.hex || theme.hex }}
                >
                  <div className="font-tech text-[8px] tracking-[0.28em] opacity-60" style={{ color: theme.hex }}>
                    {hoveredEvent.layer.toUpperCase()}
                  </div>
                  <div className="font-display text-[10px] text-white">{hoveredEvent.label}</div>
                  <div className="font-tech text-[8px] tabular-nums opacity-70" style={{ color: theme.hex }}>
                    INTENSITY {hoveredEvent.intensity}
                  </div>
                </div>
              )}
            </div>
            <WorldLayerToggles active={activeLayers} onToggle={toggleLayer} theme={theme} />
          </Panel>

          <Panel title="CULTURAL RADAR" theme={theme}>
            {DATA.world.cultural.map((item) => (
              <div key={item.label}>
                <Bar label={item.label} val={item.val} green={item.val >= 75} alert={item.val < 25} theme={theme} />
                {item.note && (
                  <div className="text-[9px] font-tech opacity-60 -mt-1 mb-1 ml-24" style={{ color: theme.hex }}>
                    {item.note}
                  </div>
                )}
              </div>
            ))}
          </Panel>

          <RecentEventsPanel theme={theme} events={events} />

          <Panel title="DOCTRINE LAYER" jpTitle="from CLAUDE.md" theme={theme}>
            <div className="text-[10px] font-tech leading-relaxed" style={{ color: theme.hex }}>
              <div className="font-bold opacity-90">Stability before scale.</div>
              <div className="opacity-60 mt-1">Decide like a leader. Optimize for 5–10 year outcomes, not short-term comfort.</div>
            </div>
          </Panel>
        </div>

        <div className="md:col-span-5 flex flex-col gap-4 z-30">
          <Panel title="NEWS DATALINK" jpTitle="outside-in" theme={theme}>
            {newsAwaiting ? (
              <AwaitingCapture
                pointer={DATA.world.news?.pointer || "resources/news-sources.md"}
                note={newsAwaiting}
                theme={theme}
              />
            ) : (
              <div className="space-y-3 font-tech text-[10px] mt-2 max-h-[260px] overflow-y-auto scrollbar-hide pr-1">
                {(DATA.world.news?.items || []).map((item, index) => (
                  <div key={`${item.source}-${item.title}`} className="border-l-2 pl-2" style={{ borderColor: theme.hex }}>
                    <div className="opacity-60" style={{ color: theme.hex }}>{item.source || "RADAR"} · {String(index + 1).padStart(2, "0")}</div>
                    <div style={{ color: theme.hex }}>{item.title}</div>
                    <div className="text-white/65 leading-snug">{item.publishedAt ? new Date(item.publishedAt).toLocaleString() : "live feed"}</div>
                  </div>
                ))}
              </div>
            )}
          </Panel>

          <LiveVideoPanel theme={theme} />

          <Panel title="ANOMALY FLAGS" jpTitle="from URGENT.md" theme={theme}>
            {(DATA.world.anomalies || []).slice(0, 4).map((a) => (
              <KV
                key={a.label}
                k={a.label.slice(0, 24)}
                v={a.value}
                alert={a.level === "CRITICAL"}
                green={a.level === "OK"}
                theme={theme}
              />
            ))}
            {(!DATA.world.anomalies || DATA.world.anomalies.length === 0) && (
              <AwaitingCapture pointer="outputs/chatgpt-deep-dive/URGENT.md" theme={theme} compact />
            )}
          </Panel>

          <FinanceRadarPanel theme={theme} />
        </div>

        <div className="hidden md:block md:col-span-4 pointer-events-none" />
      </div>
    </motion.div>
  );
};

const MusicView = ({ theme }) => {
  const music = DATA.music || {};
  const sp = music.spotifyControl || {};
  const modules = music.modules || [];
  const channels = music.channels || [];
  const royalty = music.royalty || { sources: [] };
  const catalog = music.catalog || {};
  const actions = music.actions || [];
  const [spotifyStatus, setSpotifyStatus] = useState(null);
  const [spotifyError, setSpotifyError] = useState(null);
  const [spotifyConnecting, setSpotifyConnecting] = useState(false);
  const [spotifyBusyAction, setSpotifyBusyAction] = useState(null);
  const [spotifyNotice, setSpotifyNotice] = useState(null);
  const hasSpotifyBridge = typeof window !== "undefined" && Boolean(window.dashboardAPI?.spotifyConnect);
  const hasSpotifyPlayback = typeof window !== "undefined" && Boolean(window.dashboardAPI?.spotifyPlayback);
  const liveSpotifyStatus = spotifyStatus?.status || sp.tokenStatus || "not connected";
  const spotifyConnected = Boolean(spotifyStatus?.connected || sp.connected);

  useEffect(() => {
    if (!hasSpotifyBridge) return undefined;
    let alive = true;
    window.dashboardAPI.spotifyStatus?.().then((status) => {
      if (alive && status) setSpotifyStatus(status);
    }).catch(() => {});
    const offStatus = window.dashboardAPI.onSpotifyStatus?.((status) => {
      setSpotifyStatus(status);
      setSpotifyConnecting(false);
      setSpotifyError(null);
    });
    const offError = window.dashboardAPI.onSpotifyError?.((message) => {
      setSpotifyConnecting(false);
      setSpotifyError(message || "Spotify auth failed");
    });
    const offLog = window.dashboardAPI.onSpotifyLog?.((line) => {
      setSpotifyNotice(line);
    });
    return () => {
      alive = false;
      offStatus?.();
      offError?.();
      offLog?.();
    };
  }, [hasSpotifyBridge]);

  const connectSpotify = async () => {
    setSpotifyError(null);
    setSpotifyNotice(null);
    if (!hasSpotifyBridge) {
      setSpotifyError("Open the Electron app to connect Spotify.");
      return;
    }
    setSpotifyConnecting(true);
    try {
      const result = await window.dashboardAPI.spotifyConnect();
      setSpotifyNotice(result?.status === "browser_opened" ? "Spotify login opened in your browser. Approve AX-L Mania Player, then return here." : "Spotify login requested.");
    } catch (e) {
      setSpotifyConnecting(false);
      setSpotifyError(String(e.message || e));
    }
  };

  const sendSpotifyPlayback = async (action) => {
    setSpotifyError(null);
    setSpotifyNotice(null);
    if (!hasSpotifyPlayback) {
      setSpotifyError("Open the Electron app to control Spotify playback.");
      return;
    }
    setSpotifyBusyAction(action);
    try {
      const result = await window.dashboardAPI.spotifyPlayback(action);
      if (action === "open") setSpotifyNotice(result?.opened === "spotify-app" ? "Spotify app opened." : "Spotify web player opened. Install/open the Spotify desktop app for tighter remote control.");
      else setSpotifyNotice(`Spotify ${result?.action || action} sent.`);
      window.dashboardAPI.spotifyStatus?.().then((status) => status && setSpotifyStatus(status)).catch(() => {});
    } catch (e) {
      setSpotifyError(String(e.message || e));
    } finally {
      setSpotifyBusyAction(null);
    }
  };

  const toneStyle = (tone) => {
    if (tone === "ok") return { color: "#9BF0E1", borderColor: "rgba(155,240,225,.55)", background: "rgba(155,240,225,.055)" };
    if (tone === "warn") return { color: "#FFB86B", borderColor: "rgba(255,184,107,.5)", background: "rgba(255,184,107,.06)" };
    return { color: theme.hex, borderColor: `${theme.hex}55`, background: `${theme.hex}0d` };
  };

  const MetricTile = ({ item }) => (
    <div className="relative overflow-hidden rounded-[18px] border px-3 py-3 backdrop-blur-md" style={{ borderColor: `${theme.hex}42`, background: "linear-gradient(135deg, rgba(255,255,255,.07), rgba(255,255,255,.018))" }}>
      <div className="absolute inset-x-0 top-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${theme.hex}, transparent)` }} />
      <div className="font-tech text-[9px] uppercase tracking-[0.22em] opacity-55" style={{ color: theme.hex }}>{item.label}</div>
      <div className="font-display text-2xl leading-none mt-1" style={{ color: "#f7f8f8", textShadow: `0 0 18px ${theme.hex}33` }}>{item.value}</div>
      <div className="font-tech text-[10px] mt-1 opacity-70" style={{ color: theme.hex }}>{item.delta}</div>
    </div>
  );

  const ModuleCard = ({ mod }) => {
    const st = toneStyle(mod.tone);
    return (
      <div className="rounded-[20px] border p-3 min-h-[150px] relative overflow-hidden group" style={{ borderColor: st.borderColor, background: `radial-gradient(circle at 15% 0%, ${theme.hex}24, transparent 35%), ${st.background}` }}>
        <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full blur-2xl opacity-25" style={{ background: st.color }} />
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="font-tech text-[9px] uppercase tracking-[0.22em] opacity-60" style={{ color: theme.hex }}>{mod.status}</div>
            <div className="font-display text-lg leading-tight mt-1 text-white">{mod.title}</div>
          </div>
          <div className="rounded-full border px-2 py-1 font-tech text-[9px] uppercase" style={{ color: st.color, borderColor: st.borderColor }}>{mod.tone || "live"}</div>
        </div>
        <div className="font-display text-3xl mt-4 leading-none" style={{ color: st.color }}>{mod.number}</div>
        <div className="font-tech text-[10px] leading-relaxed mt-2 opacity-75" style={{ color: "#d0d6e0" }}>{mod.detail}</div>
        <div className="font-tech text-[9px] mt-3 opacity-45 truncate" style={{ color: theme.hex }}>{mod.path}</div>
      </div>
    );
  };

  const ProgressRow = ({ row }) => (
    <div className="mb-2">
      <div className="flex justify-between gap-3 font-tech text-[10px] mb-1" style={{ color: theme.hex }}>
        <span>{row.label}</span><span>{row.value}</span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden bg-white/10">
        <div className="h-full rounded-full" style={{ width: `${Math.max(2, Math.min(100, row.progress || 0))}%`, background: `linear-gradient(90deg, ${theme.hex}, #9BF0E1)` }} />
      </div>
    </div>
  );

  return (
    <motion.div variants={pageRevealVariants} initial="hidden" animate="show" exit="exit" className="flex flex-col h-full relative p-2 md:p-4 z-30 pointer-events-auto overflow-y-auto">
      <div className="mb-4 max-w-6xl">
        <div className="font-tech text-[10px] uppercase tracking-[0.35em] opacity-70" style={{ color: theme.hex }}>producer command center</div>
        <div className="font-display text-4xl md:text-6xl leading-none mt-1 text-white">MUSIC OS</div>
        <div className="font-tech text-[11px] max-w-2xl mt-2 leading-relaxed opacity-75" style={{ color: "#d0d6e0" }}>{music.goal}</div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 max-w-6xl mb-4">
        {(music.kpis || []).map((item) => <MetricTile key={item.label} item={item} />)}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 max-w-7xl pb-20">
        <Panel title="NEW MODULES" jpTitle="live operating layer" theme={theme} className="xl:col-span-8">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {modules.map((mod) => <ModuleCard key={mod.id} mod={mod} />)}
          </div>
        </Panel>

        <Panel title="SPOTIFY CONTROL" jpTitle="PKCE remote" theme={theme} className="xl:col-span-4">
          <div className="rounded-[18px] border p-3 mb-3" style={{ borderColor: `${spotifyConnected ? "#9BF0E1" : theme.hex}55`, background: "linear-gradient(135deg, rgba(255,119,0,.10), rgba(255,255,255,.025))" }}>
            <div className="flex items-center gap-3">
              {sp.artist?.image && <img src={sp.artist.image} alt={sp.artist.name} className="h-14 w-14 rounded-2xl border object-cover" style={{ borderColor: theme.hex }} />}
              <div className="min-w-0 flex-1">
                <div className="font-display text-xl text-white">{sp.appName || "AX-L Mania Player"}</div>
                <div className="font-tech text-[10px] uppercase" style={{ color: spotifyConnected ? "#9BF0E1" : theme.hex }}>{sp.authFlow || "PKCE"} · {liveSpotifyStatus}</div>
                <div className="font-tech text-[9px] uppercase opacity-55" style={{ color: "#d0d6e0" }}>{spotifyConnected ? "tokens in macOS Keychain" : "no secret needed · click connect"}</div>
              </div>
              <button
                type="button"
                onClick={connectSpotify}
                disabled={spotifyConnecting}
                className="rounded-full border px-3 py-2 font-tech text-[9px] uppercase tracking-[0.18em] transition-all hover:bg-white/10 disabled:opacity-50"
                style={{ borderColor: spotifyConnected ? "#9BF0E1" : theme.hex, color: spotifyConnected ? "#9BF0E1" : theme.hex }}
              >
                {spotifyConnecting ? "opening…" : spotifyConnected ? "reconnect" : "connect"}
              </button>
            </div>
            <div className="grid grid-cols-4 gap-2 mt-4 font-display text-center text-xl" style={{ color: spotifyConnected ? "#9BF0E1" : theme.hex }}>
              <button type="button" onClick={() => sendSpotifyPlayback("open")} disabled={spotifyBusyAction === "open"} className="rounded-xl border py-2 border-white/10 bg-white/[.03] transition hover:bg-white/10 disabled:opacity-40" title="Open Spotify">◎</button>
              <button type="button" onClick={() => sendSpotifyPlayback("previous")} disabled={!spotifyConnected || spotifyBusyAction === "previous"} className="rounded-xl border py-2 border-white/10 bg-white/[.03] transition hover:bg-white/10 disabled:opacity-40" title="Previous">⏮</button>
              <button type="button" onClick={() => sendSpotifyPlayback("toggle")} disabled={!spotifyConnected || spotifyBusyAction === "toggle"} className="rounded-xl border py-2 border-white/10 bg-white/[.06] transition hover:bg-white/10 disabled:opacity-40" title="Play / pause">⏯</button>
              <button type="button" onClick={() => sendSpotifyPlayback("next")} disabled={!spotifyConnected || spotifyBusyAction === "next"} className="rounded-xl border py-2 border-white/10 bg-white/[.03] transition hover:bg-white/10 disabled:opacity-40" title="Next">⏭</button>
            </div>
          </div>
          {spotifyNotice && <div className="mb-2 rounded-xl border px-2 py-1 font-tech text-[10px]" style={{ borderColor: "#9BF0E1", color: "#9BF0E1", background: "rgba(155,240,225,.06)" }}>{spotifyNotice}</div>}
          {spotifyError && <div className="mb-2 rounded-xl border px-2 py-1 font-tech text-[10px]" style={{ borderColor: "#FF2200", color: "#FF7777", background: "rgba(255,34,0,.08)" }}>{spotifyError}</div>}
          <KV k="artist" v={sp.artist?.name || "awaiting Spotify auth"} green={Boolean(sp.artist)} theme={theme} />
          <KV k="auth" v={spotifyConnected ? "connected · Keychain" : "ready for PKCE login"} green={spotifyConnected} theme={theme} />
          <KV k="redirect" v={sp.redirectUri || "axlmania://auth-callback"} theme={theme} />
          {(sp.playlists || []).map((pl) => <KV key={pl.uri} k="editorial" v={pl.name} green theme={theme} />)}
        </Panel>

        <Panel title="ROYALTY RADAR" jpTitle={royalty.total || "money"} theme={theme} className="xl:col-span-4">
          {(royalty.sources || []).map((row) => <ProgressRow key={row.label} row={row} />)}
        </Panel>

        <Panel title="CATALOG INTEL" jpTitle="rights map" theme={theme} className="xl:col-span-4">
          <div className="grid grid-cols-2 gap-2 mb-3">
            <MiniKpi label="works" value={catalog.works || catalog.uniqueWorks || "—"} delta={`${catalog.titles || catalog.uniqueTitles || 0} titles`} theme={theme} />
            <MiniKpi label="conflicts" value={catalog.conflicts ?? catalog.songviewConflicts ?? 0} delta={catalog.conflictRate || "rights risk"} theme={theme} />
          </div>
          {(catalog.topConflicts || catalog.conflicts || []).slice(0, 4).map((c) => (
            <div key={`${c.title}-${c.iswc}`} className="border-l-2 pl-2 mb-2 font-tech text-[10px] leading-relaxed" style={{ borderColor: "#FFB86B", color: "#d0d6e0" }}>
              <span className="text-white">{c.title}</span><br />{c.issue || c.conflict}
            </div>
          ))}
        </Panel>

        <Panel title="CHANNEL BOARD" jpTitle="analytics sources" theme={theme} className="xl:col-span-4">
          {channels.map((ch) => <KV key={ch.label} k={ch.label} v={`${ch.status} · ${ch.value}`} green={ch.status === "snapshot" || ch.status === "note ready"} theme={theme} />)}
        </Panel>

        <Panel title="ACTION LOOPS" jpTitle="monthly ritual" theme={theme} className="xl:col-span-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {actions.length ? actions.map((a) => (
              <div key={a.text} className="flex items-start gap-2 rounded-xl border p-2 font-tech text-[10px]" style={{ borderColor: `${theme.hex}33`, background: "rgba(255,255,255,.025)", color: "#d0d6e0" }}>
                <span style={{ color: a.done ? "#9BF0E1" : "#FFB86B" }}>{a.done ? "●" : "○"}</span>
                <span>{a.text}</span>
              </div>
            )) : <AwaitingCapture pointer="Music.md" theme={theme} compact />}
          </div>
        </Panel>
      </div>
    </motion.div>
  );
};

export default function App() {
  const [activeView, setActiveView] = useState(VIEWS.HOME);
  const [mascotIndex, setMascotVariant] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hoveredTab, setHoveredTab] = useState(null);
  const [showSplash, setShowSplash] = useState(true);
  const [time, setTime] = useState(new Date());
  const reducedMotion = useReducedMotion();

  const currentTheme = THEMES[activeView];
  const currentLayers = LAYERED_HEROES[activeView];
  const activeMascotImg = MASCOTS[activeView][mascotIndex];
  const activeTabData = TABS.find((tab) => tab.id === activeView);

  const getMascotLeft = () => {
    if (activeView === VIEWS.BRAIN) {
      const brainOffsets = ["2.3vh", "9.5vh", "7.4vh", "5.2vh", "4.6vh"];
      return `calc(50% + ${brainOffsets[mascotIndex] || "4.6vh"})`;
    }
    if (activeView === VIEWS.MUSIC) return "50%";
    if (activeView === VIEWS.WORLD) return "72%";
    if (activeView === VIEWS.FINANCE) return "76%";
    if (activeView === VIEWS.NETWORK) return "78%";
    return "65%";
  };

  const getMascotTransform = () => {
    if (activeView === VIEWS.WORLD) return "";
    return "-translate-x-1/2";
  };

  useEffect(() => {
    setMascotVariant(0);
  }, [activeView]);

  useEffect(() => {
    const handleSwap = () => {
      setMascotVariant((prev) => {
        let next = Math.floor(Math.random() * 5);
        if (next === prev) next = (next + 1) % 5;
        return next;
      });
    };
    window.addEventListener("swap-mascot", handleSwap);
    return () => window.removeEventListener("swap-mascot", handleSwap);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleTabClick = (id) => {
    setActiveView(id);
    setIsMenuOpen(false);
    triggerMascotSwap();
  };

  const handleSplashComplete = useCallback(() => {
    setShowSplash(false);
  }, []);

  const formatTime = (date) => `${date.toTimeString().split(" ")[0]} JST`;

  return (
    <div className="h-screen min-h-screen w-screen overflow-hidden bg-[#020101] font-display selection:bg-white selection:text-black transition-colors duration-700 [height:100dvh] [min-height:100dvh]">
      <GlobalStyles />
      <AnimatePresence>{showSplash && <SplashScreen onComplete={handleSplashComplete} />}</AnimatePresence>

      <div className="relative flex h-full min-h-0 w-full flex-col overflow-hidden bg-[#020101] transition-all duration-700" style={{ boxShadow: `inset 0 0 120px ${currentTheme.hex}24` }}>
        {/* Draggable strip across the top — hiddenInset removes the native titlebar so we add our own. */}
        <div
          className="absolute top-0 left-0 right-0 h-7 z-[55]"
          style={{ WebkitAppRegion: "drag" }}
        />
        <MetaBar theme={currentTheme} />
        <div className="relative flex h-full min-h-0 w-full flex-col overflow-hidden bg-[#020101] p-2 sm:p-4 md:p-6">
          <GlobalLayeredHeroBackground layers={currentLayers} />

          <div className="absolute inset-0 pointer-events-none opacity-[0.1] z-10 mix-blend-screen" style={{ backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 1px, ${currentTheme.hex} 1px, ${currentTheme.hex} 2px)` }} />

          <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden">
            {currentLayers?.foreground && <img src={currentLayers.foreground} className="absolute inset-[-5%] w-[110%] h-[110%] object-cover animate-[pan-right_25s_linear_infinite_alternate]" alt="" />}
          </div>

          <div className="absolute inset-0 z-30 pointer-events-none overflow-hidden">
            {currentLayers?.border && <img src={currentLayers.border} className="absolute inset-0 w-full h-full object-fill opacity-90" alt="" />}
          </div>

          {activeView === VIEWS.HOME && <NeonOperatorGhost theme={currentTheme} />}

          <div className="absolute inset-0 pointer-events-none z-40 overflow-hidden">
            {activeMascotImg && (
              <div
                className={`absolute bottom-[-5%] ${getMascotTransform()} h-[95%] transition-all duration-700`}
                style={{ left: getMascotLeft() }}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${activeView}-${activeMascotImg}`}
                    className="relative h-full"
                    initial={reducedMotion ? { opacity: 1 } : { opacity: 0, scale: 0.78, x: 34, filter: "blur(18px) brightness(2.2)", clipPath: "inset(0 48% 0 48%)" }}
                    animate={reducedMotion ? { opacity: 1 } : { opacity: 1, scale: 1, x: 0, filter: "blur(0px) brightness(1)", clipPath: "inset(0 0% 0 0%)" }}
                    exit={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 1.08, x: -28, filter: "blur(16px) brightness(2.5)", clipPath: "inset(0 46% 0 46%)" }}
                    transition={reducedMotion ? { duration: 0.08 } : { duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <motion.div
                      className="absolute inset-y-[4%] left-1/2 w-[2px] -translate-x-1/2 mix-blend-screen"
                      style={{ backgroundColor: currentTheme.hex, boxShadow: `0 0 24px ${currentTheme.hex}, 0 0 72px ${currentTheme.hex}` }}
                      initial={reducedMotion ? { opacity: 0 } : { opacity: 0, scaleY: 0.2 }}
                      animate={reducedMotion ? { opacity: 0 } : { opacity: [0, 1, 0], scaleY: [0.2, 1, 0.55], x: [-36, 16, 48] }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.42, ease: "easeOut" }}
                    />
                    <motion.div
                      className="absolute inset-0 mix-blend-screen"
                      style={{
                        backgroundImage: `repeating-linear-gradient(0deg, transparent 0 10px, ${currentTheme.hex}99 10px 12px), repeating-linear-gradient(90deg, transparent 0 22px, ${currentTheme.hex}55 22px 24px)`
                      }}
                      initial={reducedMotion ? { opacity: 0 } : { opacity: 0 }}
                      animate={reducedMotion ? { opacity: 0 } : { opacity: [0, 0.34, 0], x: [18, -10, 0] }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.42, ease: "easeOut" }}
                    />
                    <img
                      src={activeMascotImg}
                      className={`relative h-full object-contain ${currentTheme.glow} animate-[float_8s_ease-in-out_infinite]`}
                      style={{ filter: `drop-shadow(0 0 20px ${currentTheme.hex})` }}
                      alt="Mascot"
                    />
                  </motion.div>
                </AnimatePresence>
              </div>
            )}
          </div>

          <div className="relative z-50 flex h-full min-h-0 flex-col pointer-events-none">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 pb-2 relative z-50 pointer-events-auto">
              <div className="flex items-center gap-2 group relative">
                <div
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-24 rounded-full pointer-events-none transition-all duration-1000 animate-[menu-glow-pulse_4s_infinite]"
                  style={{ background: `radial-gradient(circle, ${currentTheme.hex}88 0%, transparent 70%)`, zIndex: -1 }}
                />

                <div className="flex items-center">
                  <div className={`cursor-pointer z-50 transition-transform duration-300 relative origin-right ${!isMenuOpen ? "hover:scale-105" : ""}`} onClick={() => setIsMenuOpen(!isMenuOpen)}>
                    <FoxLeftHalf eyeColor={hoveredTab ? THEMES[hoveredTab].hex : currentTheme.hex} />
                  </div>

                  <div className={`relative overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.68,-0.55,0.26,1.55)] z-40 ${isMenuOpen ? "w-[480px] lg:w-[600px] -mx-4 lg:-mx-6 opacity-100" : "w-0 mx-0 opacity-0"}`}>
                    <div className="h-16 lg:h-20 w-full flex bg-black/60 border-y border-white/15 backdrop-blur-md cyber-panel-wrap shadow-[0_0_30px_rgba(255,255,255,0.08)]">
                      <div className="flex w-full h-full gap-1 px-4 py-2">
                        {TABS.map((tab) => {
                          const isActive = activeView === tab.id;
                          return (
                            <div
                              key={tab.id}
                              onClick={() => handleTabClick(tab.id)}
                              onMouseEnter={() => setHoveredTab(tab.id)}
                              onMouseLeave={() => setHoveredTab(null)}
                              className={`glass-nav-tab flex-1 group/tab relative h-full flex items-center justify-center cursor-pointer overflow-hidden border border-white/15 bg-white/[0.06] backdrop-blur-md transition-all duration-300 ${isActive ? "shadow-[inset_0_0_18px_rgba(255,255,255,0.13),0_0_18px_rgba(255,255,255,0.08)]" : "hover:bg-white/[0.11] hover:border-white/25"}`}
                              style={isActive ? { borderColor: `${tab.color}99`, backgroundColor: `${tab.color}18` } : undefined}
                            >
                              <div className="flex flex-col items-center gap-1">
                                <tab.icon className={`w-4 h-4 lg:w-5 lg:h-5 transition-all duration-300 ${isActive ? "scale-110" : "opacity-50 group-hover/tab:opacity-100"}`} style={{ color: tab.color, filter: `drop-shadow(0 0 8px ${tab.color})` }} />
                                <span className={`text-[8px] lg:text-[10px] font-tech tracking-widest uppercase ${isActive ? "font-bold" : "opacity-40 group-hover/tab:opacity-100"}`} style={{ color: tab.color }}>
                                  {tab.label}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className={`cursor-pointer z-50 transition-transform duration-300 relative origin-left ${!isMenuOpen ? "hover:scale-105" : ""}`} onClick={() => setIsMenuOpen(!isMenuOpen)}>
                    <FoxRightHalf eyeColor={hoveredTab ? THEMES[hoveredTab].hex : currentTheme.hex} />
                  </div>
                </div>

                <div className={`transition-all duration-700 ease-in-out overflow-hidden flex items-center ${!isMenuOpen ? "w-auto max-w-[200px] opacity-100 ml-4" : "w-0 opacity-0 ml-0"}`}>
                  <div className={`text-sm lg:text-xl font-display font-black tracking-widest uppercase ${currentTheme.textGlow}`} style={{ color: currentTheme.hex }}>
                    {activeTabData?.label}
                  </div>
                </div>
              </div>

            </header>

            <div className="relative z-50 min-h-0 flex-grow pointer-events-auto overflow-y-auto overflow-x-hidden scrollbar-hide">
              <AnimatePresence mode="wait">
                {activeView === VIEWS.HOME && <HomeHubView key={VIEWS.HOME} theme={currentTheme} />}
                {activeView === VIEWS.BRAIN && <SecondBrainView key={VIEWS.BRAIN} theme={currentTheme} />}
                {activeView === VIEWS.FINANCE && <MusicFinanceView key={VIEWS.FINANCE} theme={currentTheme} />}
                {activeView === VIEWS.NETWORK && <NetworkOpsView key={VIEWS.NETWORK} theme={currentTheme} />}
                {activeView === VIEWS.WORLD && <WorldView key={VIEWS.WORLD} theme={currentTheme} />}
                {activeView === VIEWS.MUSIC && <MusicView key={VIEWS.MUSIC} theme={currentTheme} />}
              </AnimatePresence>
            </div>

            <footer className="mt-4 pt-4 border-t border-dashed flex justify-between items-center font-tech text-[11px] uppercase font-bold opacity-80 relative z-50 pointer-events-auto px-4 py-2" style={{ borderColor: currentTheme.hex, color: currentTheme.hex }}>
              <img
                src={LOGO_HORIZONTAL_FOOTER}
                alt="AX-L Mania OS"
                onMouseEnter={triggerMascotSwap}
                className="pointer-events-auto absolute left-1/2 top-1/2 hidden h-[84px] w-[260px] -translate-x-1/2 -translate-y-1/2 object-contain opacity-36 mix-blend-screen md:block lg:w-[340px]"
                style={{
                  filter: `blur(1px) saturate(0.48) contrast(0.62) brightness(0.82) drop-shadow(0 0 18px ${currentTheme.hex}55)`,
                  WebkitMaskImage: "radial-gradient(ellipse at center, black 0%, rgba(0,0,0,0.72) 45%, rgba(0,0,0,0.3) 68%, transparent 91%), linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.7) 22%, black 48%, rgba(0,0,0,0.55) 76%, transparent 100%)",
                  maskImage: "radial-gradient(ellipse at center, black 0%, rgba(0,0,0,0.72) 45%, rgba(0,0,0,0.3) 68%, transparent 91%), linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.7) 22%, black 48%, rgba(0,0,0,0.55) 76%, transparent 100%)",
                  WebkitMaskComposite: "source-in",
                  maskComposite: "intersect"
                }}
              />
              <div className="relative z-10 flex gap-4 items-center" onMouseEnter={triggerMascotSwap}>
                <StatusChip theme={currentTheme} time={formatTime(time)} />
              </div>
              <div className="relative z-10 flex items-center gap-2">
                <span className="opacity-50 mr-2 text-[8px]">POSE SELECT:</span>
                {[0, 1, 2, 3, 4].map((idx) => (
                  <button key={idx} onClick={() => setMascotVariant(idx)} className="w-6 h-3 cyber-nav-tab transition-all duration-300 hover:scale-110" style={{ backgroundColor: mascotIndex === idx ? currentTheme.hex : "rgba(255,255,255,0.2)" }} />
                ))}
              </div>
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
}
