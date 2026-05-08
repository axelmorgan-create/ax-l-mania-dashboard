import React, { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import * as THREE from "three";
import {
  AlertTriangle,
  Box,
  Brain,
  CheckCircle2,
  Cpu,
  Globe,
  LineChart,
  Lock,
  Map as MapIcon,
  Music,
  Radio,
  Settings,
  Shield,
  Target,
  Terminal,
  TrendingUp
} from "lucide-react";

const VIEWS = {
  HOME: "home",
  BRAIN: "brain",
  FINANCE: "finance",
  NETWORK: "network",
  WORLD: "world",
  MUSIC: "music"
};

const LOGO_MAIN = "/assets/logos/ax-l-logo.png";
const LOGO_HORIZONTAL = "/assets/logos/ax-l-logo-horizontal.png";
const LOGO_HORIZONTAL_FOOTER = "/assets/logos/ax-l-logo-horizontal-footer.png";
const OPERATOR_AVATAR = "/assets/operator/operator-avatar.svg";

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
    "/assets/mascots/action/home-7.png",
    "/assets/mascots/action/home-8.png",
    "/assets/mascots/action/home-9.png",
    "/assets/mascots/action/home-10.png",
    "/assets/mascots/action/home-11.png"
  ],
  network: [
    "/assets/mascots/action/network-12.png",
    "/assets/mascots/action/network-13.png",
    "/assets/mascots/action/network-14.png",
    "/assets/mascots/action/network-15.png",
    "/assets/mascots/action/network-16.png"
  ],
  finance: [
    "/assets/mascots/action/finance-17.png",
    "/assets/mascots/action/finance-18.png",
    "/assets/mascots/action/finance-19.png",
    "/assets/mascots/action/finance-20.png",
    "/assets/mascots/action/finance-21.png"
  ],
  brain: [
    "/assets/mascots/action/brain-31.png",
    "/assets/mascots/action/brain-32.png",
    "/assets/mascots/action/brain-33.png",
    "/assets/mascots/action/brain-34.png",
    "/assets/mascots/action/brain-35.png"
  ],
  world: [
    "/assets/mascots/action/world-27.png",
    "/assets/mascots/action/world-28.png",
    "/assets/mascots/action/world-29.png",
    "/assets/mascots/action/world-30.png",
    "/assets/mascots/action/world-27b.png"
  ],
  music: [
    "/assets/mascots/action/music-22.png",
    "/assets/mascots/action/music-23.png",
    "/assets/mascots/action/music-24.png",
    "/assets/mascots/action/music-25.png",
    "/assets/mascots/action/music-26.png"
  ]
};

const LAYERED_HEROES = {
  home: {
    base: "/assets/parallax/blue-hero.png",
    mid: "/assets/parallax/blue-midground.png",
    foreground: "/assets/parallax/blue-float.png",
    overlay: "/assets/parallax/blue-overlay.png"
  },
  brain: {
    base: "/assets/parallax/yellow-hero.png",
    mid: "/assets/parallax/yellow-midground.png",
    foreground: null,
    overlay: "/assets/parallax/yellow-overlay.png",
    border: "/assets/parallax/yellow-border.png"
  },
  finance: {
    base: "/assets/parallax/green-hero.png",
    mid: "/assets/parallax/green-midground.png",
    foreground: "/assets/parallax/green-foreground.png",
    overlay: "/assets/parallax/green-overlay.png"
  },
  network: {
    base: "/assets/parallax/red-hero.png",
    mid: "/assets/parallax/red-midground.png",
    foreground: "/assets/parallax/red-float.png",
    overlay: "/assets/parallax/red-overlay.png",
    border: "/assets/parallax/red-border.png"
  },
  world: {
    base: "/assets/parallax/world-hero.png",
    mid: "/assets/parallax/world-midground.png",
    foreground: "/assets/parallax/world-foreground.png",
    overlay: "/assets/parallax/world-overlay.png"
  },
  music: {
    base: "/assets/parallax/music-hero.png",
    mid: null,
    foreground: "/assets/parallax/music-foreground.png",
    overlay: null,
    border: null
  }
};

const SURVEILLANCE_CAMS = [
  "/assets/surveillance/cam-01.png",
  "/assets/surveillance/cam-02.png",
  "/assets/surveillance/cam-03.png"
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

const DATA = {
  northStars: [
    { domain: "Music", metric: "Monthly listeners", value: "142.8K", type: "leading" },
    { domain: "Finance", metric: "Runway", value: "8.4 mo", type: "control" },
    { domain: "Content", metric: "Retention", value: "61%", type: "quality" },
    { domain: "Network", metric: "Qualified inbound", value: "23", type: "pipeline" },
    { domain: "Agent Stack", metric: "Automated tasks", value: "74", type: "input" }
  ],
  triggers: [
    { label: "Runway", rule: "< 9 months -> freeze non-revenue spend", level: "CRITICAL" },
    { label: "Save rate", rule: "< 4% -> release strategy review", level: "WATCH" },
    { label: "AI spend", rule: "> $250/day -> audit automations", level: "WATCH" },
    { label: "Inbound", rule: "> 12 qualified -> book calls before builds", level: "ACTIVE" },
    { label: "Platform concentration", rule: "> 40% revenue from one source -> diversify", level: "RISK" }
  ],
  killList: [
    "Manual invoice chasing after 7 days",
    "Content formats below 35% completion",
    "Agent jobs without revenue or time-saved tag",
    "Music spend without release owner",
    "Dashboards tiles without a decision rule"
  ],
  music: {
    kpis: [
      { label: "Streams MTD", value: "78.4M", delta: "+18.3%" },
      { label: "Monthly listeners", value: "142.8K", delta: "+12.4%" },
      { label: "Save / stream", value: "6.8%", delta: "+1.1 pts" },
      { label: "Avg royalty", value: "$0.0047", delta: "+4.2%" }
    ],
    platforms: [
      { label: "Spotify", val: 54, amount: "$68.5K" },
      { label: "Apple Music", val: 31, amount: "$24.3K" },
      { label: "YouTube", val: 18, amount: "$14.6K" },
      { label: "SoundCloud", val: 11, amount: "$3.9K" }
    ],
    tracks: [
      ["Neon Prayer", "1.84M", "$18.4K", "8.2%"],
      ["Tokyo Nights", "1.21M", "$12.1K", "6.9%"],
      ["Moonlit Drive", "870K", "$8.7K", "7.5%"],
      ["Echoes", "721K", "$7.2K", "5.8%"],
      ["Smoke Signals", "612K", "$6.1K", "4.9%"]
    ],
    releaseCurve: [
      { label: "Day 1", val: 22 },
      { label: "Day 7", val: 48 },
      { label: "Day 30", val: 74 },
      { label: "Day 90", val: 91 }
    ],
    pipeline: [
      ["Sync leads", "8", "3 qualified"],
      ["Closed deals", "$12.8K", "2 this month"],
      ["Split sheets", "91%", "4 pending"],
      ["Payout lag", "41d", "watch"]
    ],
    conversion: [
      ["Playlist adds", "1,284", "62% algorithmic"],
      ["Editorial adds", "14", "2 active pitches"],
      ["Social -> profile", "4.8%", "from 1.9M views"],
      ["Profile -> streams", "18.2%", "strong"]
    ]
  },
  finance: {
    kpis: [
      { label: "Cash on hand", value: "$785.4K", delta: "liquid" },
      { label: "Monthly burn", value: "$92.8K", delta: "90d avg" },
      { label: "Runway", value: "8.4 mo", delta: "below guardrail" },
      { label: "Tax reserve", value: "$97.6K", delta: "22.1%" }
    ],
    sources: [
      { label: "Music", val: 54, amount: "$126.7K" },
      { label: "AI content", val: 24, amount: "$56.2K" },
      { label: "Film / sync", val: 14, amount: "$32.7K" },
      { label: "Consulting", val: 8, amount: "$18.4K" }
    ],
    units: [
      ["Music", "$68.4K", "46%", "stock"],
      ["AI content", "$28.1K", "21%", "flow"],
      ["Foleybot", "$12.8K", "18%", "stock"],
      ["Consulting", "$18.4K", "39%", "flow"]
    ],
    expenses: [
      { label: "Studio / production", val: 62 },
      { label: "Marketing", val: 52 },
      { label: "Compute/API", val: 47 },
      { label: "Equipment", val: 17 }
    ]
  },
  network: {
    kpis: [
      ["Audience", "1.24M", "+7.8%"],
      ["Qualified inbound", "23", "42% qualified"],
      ["Calls booked", "11", "48% conversion"],
      ["Deals opened", "$84K", "pipeline"]
    ],
    agents: [
      { label: "OpenAI spend", val: 82, amount: "$4.8K/mo" },
      { label: "Claude spend", val: 61, amount: "$3.2K/mo" },
      { label: "Automations", val: 78, amount: "24 / 32" },
      { label: "Failed jobs", val: 18, amount: "6 active" }
    ],
    risks: [
      ["Platform concentration", "44%", "RED"],
      ["Key person risk", "72%", "HIGH"],
      ["Payout lag risk", "41d", "WATCH"],
      ["Counterparty risk", "38%", "OK"]
    ],
    list: [
      ["Newsletter", "38.2K", "42% open"],
      ["Engagement", "5.9%", "+0.8 pts"],
      ["New HV contacts", "17", "this month"],
      ["Inbound -> deal", "9.1%", "improving"]
    ]
  },
  brain: {
    stats: [
      ["Vault entries", "12,847"],
      ["New entries/week", "46"],
      ["Decision capture", "31"],
      ["Research queue", "17"]
    ],
    focus: [
      { label: "AI systems", val: 92 },
      { label: "Music business", val: 78 },
      { label: "Finance ops", val: 66 },
      { label: "Brand gravity", val: 61 }
    ],
    operator: [
      ["Deep work", "5.8h / 7.5h"],
      ["Intent delta", "-1.7h"],
      ["Sleep", "6h 42m"],
      ["Stop-doing compliance", "72%"]
    ]
  },
  world: {
    news: [
      ["AI music regulation", "Copyright hearings create new licensing pressure for generated vocals."],
      ["Sync market", "Short-form trailers are bidding up 15-second sonic logos."],
      ["Platform shift", "Private fan communities outperform public reach for high-value launches."],
      ["Competitor radar", "Three adjacent artists released deluxe catalog editions this week."],
      ["Search trend", "Brand searches up 18% after the late-night jazz campaign."]
    ],
    cultural: [
      { label: "Brand search", val: 74 },
      { label: "Share of voice", val: 36 },
      { label: "Mention sentiment", val: 82 },
      { label: "Category trend", val: 68 }
    ]
  },
  content: {
    kpis: [
      ["Views 30d", "4.2M", "+22%"],
      ["Watch time", "189K h", "+15%"],
      ["Retention", "61%", "north star"],
      ["Pieces/week", "14", "target 12"]
    ],
    spend: [
      { label: "Runway", val: 42 },
      { label: "Sora/Veo", val: 38 },
      { label: "ElevenLabs", val: 24 },
      { label: "Render hours", val: 57 }
    ],
    economics: [
      ["Cost / piece", "$84", "compute + license"],
      ["Revenue / piece", "$412", "ads + affiliate"],
      ["Best hook", "Cold open", "71% hold"],
      ["Repurpose rate", "1 -> 7", "clips"]
    ]
  }
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
          src="/assets/mascots/action/brain-33.png"
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
          <span key={cell} className={index === 0 ? "font-bold text-white truncate" : "text-right truncate"} style={{ color: index === 0 ? undefined : theme.hex }}>
            {cell}
          </span>
        ))}
      </motion.div>
    ))}
  </motion.div>
);

const HomeHubView = ({ theme }) => (
  <motion.div variants={pageRevealVariants} initial="hidden" animate="show" exit="exit" className="flex w-full h-full relative p-2 md:p-4 gap-6">
    <div className="w-full md:w-[38%] flex flex-col gap-4 z-30 h-full">
      <Panel title="NORTH STARS" jpTitle="ドメイン" theme={theme}>
        <div className="space-y-2">
          {DATA.northStars.map((item) => (
            <KV key={item.domain} k={`${item.domain} / ${item.metric}`} v={`${item.value} ${item.type}`} green={item.type === "leading"} alert={item.type === "control"} theme={theme} />
          ))}
        </div>
      </Panel>

      <Panel title="SILVER FOX CORE" jpTitle="interactive" theme={theme} className="flex-grow min-h-[360px]">
        <SilverFoxBadge theme={theme} className="w-full h-full min-h-[330px]" modelScale={1.28} />
      </Panel>
    </div>

    <div className="hidden md:grid w-[62%] grid-cols-2 gap-4 z-30 content-end pointer-events-auto">
      <Panel title="DECISION TRIGGERS" jpTitle="if x then y" theme={theme} className="self-end">
        {DATA.triggers.map((item) => (
          <KV key={item.label} k={item.label} v={item.rule} alert={item.level === "CRITICAL"} green={item.level === "ACTIVE"} theme={theme} />
        ))}
      </Panel>
      <Panel title="KILL LIST" jpTitle="subtract" theme={theme} className="self-end">
        <div className="space-y-2 font-tech text-[10px]">
          {DATA.killList.map((item) => (
            <div key={item} className="border-l-2 pl-2" style={{ borderColor: theme.hex, color: theme.hex }}>
              {item}
            </div>
          ))}
        </div>
      </Panel>
      <Panel title="CONTENT OUTPUT" jpTitle="AI/FILM" theme={theme} className="col-span-2">
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

const SecondBrainView = ({ theme }) => (
  <motion.div variants={pageRevealVariants} initial="hidden" animate="show" exit="exit" className="grid grid-cols-1 md:grid-cols-12 gap-4 h-full relative p-2 md:p-4">
    <div className="md:col-span-3 flex flex-col gap-4 z-30">
      <Panel title="NEURAL SYNC" theme={theme} className="items-center justify-center py-6">
        <EvaSyncDial val={88} size="32" title="SYNC RATIO" theme={theme} />
      </Panel>
      <Panel title="SECOND BRAIN STATUS" jpTitle="vault health" theme={theme}>
        {DATA.brain.stats.map(([k, v]) => (
          <KV key={k} k={k} v={v} theme={theme} />
        ))}
      </Panel>
      <Panel title="FOCUS TOPICS" theme={theme} className="flex-grow">
        {DATA.brain.focus.map((item) => (
          <Bar key={item.label} label={item.label} val={item.val} theme={theme} green={item.val > 80} />
        ))}
      </Panel>
    </div>

    <div className="md:col-span-5 flex flex-col justify-end z-30 pointer-events-none">
      <div className="pointer-events-auto">
        <Panel title="MELCHIOR CORE" jpTitle="マギシステム" theme={theme} className="h-64 overflow-hidden">
          <div className="absolute top-2 left-2 text-[9px] font-tech font-bold opacity-60 z-20">
            KNOWLEDGE GRAPH: ACTIVE
            <br />
            MEMORY LINKS: 3,431
          </div>
          <Magi3DCore theme={theme} />
        </Panel>
      </div>
    </div>

    <div className="md:col-span-4 flex flex-col gap-4 z-30">
      <Panel title="OPERATOR STATE" jpTitle="input layer" theme={theme}>
        {DATA.brain.operator.map(([k, v]) => (
          <KV key={k} k={k} v={v} alert={k === "Intent delta"} green={k === "Stop-doing compliance"} theme={theme} />
        ))}
      </Panel>
      <Panel title="MEMORY ALLOCATION" jpTitle="メモリ" theme={theme} className="flex-grow">
        <EvaDataStream height="24" theme={theme} />
        <div className="mt-auto space-y-2">
          <Bar label="Link density" val={82} green theme={theme} />
          <Bar label="Note quality" val={89} theme={theme} />
          <Bar label="Actionability" val={81} theme={theme} />
        </div>
      </Panel>
      <div className="grid grid-cols-2 gap-2 h-28">
        <Panel title="CAPTURE" theme={theme}>
          <KV k="Quick notes" v="17" theme={theme} />
          <KV k="Voice memos" v="02" theme={theme} />
        </Panel>
        <Panel title="RESEARCH" theme={theme}>
          <KV k="AI alignment" v="68%" theme={theme} />
          <KV k="Sync trends" v="57%" theme={theme} />
        </Panel>
      </div>
    </div>
  </motion.div>
);

const MusicFinanceView = ({ theme }) => (
  <motion.div variants={pageRevealVariants} initial="hidden" animate="show" exit="exit" className="grid grid-cols-1 md:grid-cols-12 gap-4 h-full relative z-30 p-2 md:p-4">
    <div className="md:col-span-8 flex flex-col gap-4 h-full">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {DATA.finance.kpis.map((item) => (
          <Panel key={item.label} title={item.label} theme={theme}>
            <div className="text-xl font-tech font-bold">{item.value}</div>
            <div className="text-[10px] font-tech font-bold" style={{ color: item.delta.includes("below") ? "#FF2200" : "#33FF00" }}>
              {item.delta}
            </div>
            <EvaDataStream height="6" theme={theme} />
          </Panel>
        ))}
      </div>

      <Panel title="INCOME BY SOURCE" jpTitle="recurring vs one-time" theme={theme}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            {DATA.finance.sources.map((item) => (
              <Bar key={item.label} label={item.label} val={item.val} amount={item.amount} green={item.label === "Music"} theme={theme} />
            ))}
          </div>
          <DataTable rows={DATA.finance.units} theme={theme} />
        </div>
      </Panel>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-grow">
        <Panel title="EXPENSE PRESSURE" theme={theme}>
          {DATA.finance.expenses.map((item) => (
            <Bar key={item.label} label={item.label} val={item.val} alert={item.val > 60} theme={theme} />
          ))}
        </Panel>
        <Panel title="ROYALTY / AR SYNC" theme={theme} className="items-center justify-center">
          <EvaSyncDial val={46} size="24" title="PAYOUT" theme={theme} />
          <KV k="Outstanding AR" v="$192.4K" alert theme={theme} />
          <KV k="Pending payouts" v="$18.7K" theme={theme} />
        </Panel>
        <Panel title="ACCOUNT HEALTH" theme={theme}>
          <KV k="Cash reserves" v="GOOD" green theme={theme} />
          <KV k="Debt level" v="LOW" green theme={theme} />
          <KV k="Tax compliance" v="WATCH" alert theme={theme} />
          <KV k="Contract health" v="STRONG" green theme={theme} />
        </Panel>
      </div>
    </div>

    <div className="md:col-span-4 relative pointer-events-none flex flex-col justify-end">
      <div className="text-[14px] font-display font-bold opacity-90 text-right bg-black/60 backdrop-blur-md p-4 cyber-panel-wrap border-r-4 pointer-events-auto" style={{ borderColor: theme.hex, color: theme.hex }}>
        MONEY IS A SENSOR.
        <br />
        RUNWAY IS FREEDOM.
        <br />
        FLOW PAYS TODAY.
        <br />
        STOCK BUILDS POWER.
      </div>
    </div>
  </motion.div>
);

const NetworkOpsView = ({ theme }) => (
  <motion.div variants={pageRevealVariants} initial="hidden" animate="show" exit="exit" className="grid grid-cols-1 md:grid-cols-12 gap-4 h-full relative p-2 md:p-4">
    <div className="md:col-span-4 flex flex-col gap-4 z-30">
      <Panel title="AT FIELD RADAR" theme={theme} className="h-56 items-center justify-center">
        <div className="relative w-40 h-40 flex items-center justify-center">
          <svg className="absolute inset-0 w-full h-full animate-[spin-slow_4s_linear_infinite]" viewBox="0 0 100 100">
            <polygon points="50,5 90,50 50,95 10,50" fill="none" stroke={theme.hex} strokeWidth="1" opacity="0.6" />
            <circle cx="50" cy="50" r="45" fill="none" stroke={theme.hex} strokeWidth="2" strokeDasharray="10 20" />
          </svg>
          <svg className="absolute inset-0 w-full h-full animate-[spin-reverse_2s_linear_infinite]" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="30" fill="none" stroke="#33FF00" strokeWidth="1" strokeDasharray="5 5" />
            <line x1="20" y1="50" x2="80" y2="50" stroke="#33FF00" strokeWidth="1" />
          </svg>
        </div>
      </Panel>
      <Panel title="AUDIENCE PIPELINE" theme={theme}>
        {DATA.network.kpis.map(([k, v, delta]) => (
          <KV key={k} k={k} v={`${v} / ${delta}`} green={k === "Calls booked"} theme={theme} />
        ))}
      </Panel>
      <Panel title="AGENT STACK HEALTH" theme={theme} className="flex-grow">
        {DATA.network.agents.map((item) => (
          <Bar key={item.label} label={item.label} val={item.val} amount={item.amount} theme={theme} green={item.label === "Automations"} />
        ))}
      </Panel>
      <Panel title="AUDIENCE QUALITY" theme={theme}>
        {DATA.network.list.map(([k, v, detail]) => (
          <KV key={k} k={k} v={`${v} / ${detail}`} green={k === "Engagement"} theme={theme} />
        ))}
      </Panel>
    </div>

    <div className="md:col-span-4 flex flex-col gap-4 z-30">
      <Panel title="WARNING: CRITICAL ALERTS" isAlert theme={theme} className="justify-center py-6">
        <div className="flex items-center gap-4 w-full px-4">
          <AlertTriangle size={40} className="text-red-500 animate-pulse shrink-0" />
          <div className="text-[10px] font-tech font-bold leading-loose">
            <div className="text-red-500">AI SPEND NEAR DAILY GUARDRAIL</div>
            <div className="text-yellow-500">PLATFORM CONCENTRATION ABOVE 40%</div>
            <div className="text-yellow-500">6 AUTOMATIONS REQUIRE OWNER TAGS</div>
          </div>
        </div>
      </Panel>
      <div className="grid grid-cols-1 gap-4 flex-grow">
        <Panel title="AUTOMATION INCIDENTS" theme={theme}>
          <KV k="Failed automations" v="6 active" alert theme={theme} />
          <KV k="Stalled jobs" v="3 over SLA" alert theme={theme} />
          <KV k="Avg completion" v="18m 42s" theme={theme} />
          <KV k="Time saved / week" v="27.4h" green theme={theme} />
        </Panel>
        <Panel title="RISK METER" theme={theme}>
          {DATA.network.risks.map(([k, v, level]) => (
            <KV key={k} k={k} v={`${v} ${level}`} alert={level === "RED" || level === "HIGH"} green={level === "OK"} theme={theme} />
          ))}
        </Panel>
      </div>
    </div>

    <div className="md:col-span-4 relative pointer-events-none flex items-end">
      <Panel title="CONVERSION FUNNEL" theme={theme} className="w-full pointer-events-auto">
        <Bar label="Inbound" val={100} amount="55" theme={theme} />
        <Bar label="Qualified" val={42} amount="23" theme={theme} />
        <Bar label="Calls" val={20} amount="11" theme={theme} />
        <Bar label="Deals" val={9} amount="5" green theme={theme} />
      </Panel>
    </div>
  </motion.div>
);

const WorldView = ({ theme }) => (
  <motion.div variants={pageRevealVariants} initial="hidden" animate="show" exit="exit" className="grid grid-cols-1 md:grid-cols-12 gap-4 h-full relative p-2 md:p-4">
    <div className="md:col-span-3 flex flex-col gap-4 z-30">
      <Panel title="GLOBAL SENTIMENT" theme={theme} className="h-44 items-center justify-center">
        <Globe size={64} strokeWidth={1} style={{ color: theme.hex }} className="opacity-50 animate-[spin-slow_60s_linear_infinite]" />
        <div className="absolute inset-0 flex flex-col items-center justify-center font-display font-bold text-2xl" style={{ color: theme.hex }}>
          68.4 <span className="text-[10px] tracking-widest opacity-80 mt-1">INDEX</span>
        </div>
      </Panel>
      <Panel title="CULTURAL RADAR" theme={theme}>
        {DATA.world.cultural.map((item) => (
          <Bar key={item.label} label={item.label} val={item.val} green={item.val > 75} theme={theme} />
        ))}
      </Panel>
      <Panel title="MARKET SECTORS" theme={theme}>
        <Bar label="Technology" val={88} green theme={theme} />
        <Bar label="Defense" val={65} theme={theme} />
        <Bar label="Energy" val={32} theme={{ ...theme, hex: "#FF0000" }} />
        <Bar label="Finance" val={54} theme={theme} />
        <Bar label="Agri-bio" val={72} green theme={theme} />
      </Panel>
    </div>

    <div className="md:col-span-5 flex flex-col gap-4 z-30">
      <Panel title="NEWS DATALINK" jpTitle="outside-in" theme={theme} className="flex-grow">
        <div className="space-y-3 font-tech text-[10px] mt-2 max-h-[360px] overflow-y-auto scrollbar-hide pr-1">
          {DATA.world.news.map(([title, body], index) => (
            <div key={title} className={`border-l-2 pl-2 ${index === 1 ? "border-red-500" : ""}`} style={{ borderColor: index === 1 ? undefined : theme.hex }}>
              <div className="opacity-60" style={{ color: index === 1 ? "#FF0000" : theme.hex }}>
                RADAR 0{index + 1}
              </div>
              <div style={{ color: index === 1 ? "#FF7777" : theme.hex }}>{title}</div>
              <div className="text-white/65 leading-snug">{body}</div>
            </div>
          ))}
        </div>
      </Panel>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Panel title="GEOPOLITICAL RADAR" theme={theme} className="h-44 items-center justify-center">
          <div className="relative w-full h-full flex items-center justify-center opacity-60">
            <svg className="absolute inset-0 w-full h-full animate-[spin-slow_10s_linear_infinite]" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" fill="none" stroke={theme.hex} strokeWidth="1" strokeDasharray="5 15" />
              <line x1="50" y1="10" x2="50" y2="90" stroke={theme.hex} strokeWidth="0.5" />
              <line x1="10" y1="50" x2="90" y2="50" stroke={theme.hex} strokeWidth="0.5" />
            </svg>
            <MapIcon size={64} style={{ color: theme.hex }} strokeWidth={1} />
          </div>
        </Panel>
        <Panel title="ANOMALY FLAGS" theme={theme} className="h-44">
          <KV k="Search trend" v="+18% / >2 sigma" green theme={theme} />
          <KV k="Competitor releases" v="3 this week" theme={theme} />
          <KV k="AI regulation" v="WATCH" alert theme={theme} />
          <KV k="Sync demand" v="+12% in short-form" green theme={theme} />
        </Panel>
      </div>
    </div>

    <div className="hidden md:block md:col-span-4 pointer-events-none" />
  </motion.div>
);

const MusicView = ({ theme }) => (
  <motion.div variants={pageRevealVariants} initial="hidden" animate="show" exit="exit" className="flex flex-col h-full relative p-2 md:p-4 z-30">
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pointer-events-auto max-w-4xl">
      {DATA.music.kpis.map((item) => (
        <MiniKpi key={item.label} label={item.label} value={item.value} delta={item.delta} theme={theme} />
      ))}
    </div>
    <div className="flex-grow pointer-events-none" />
    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mt-auto pointer-events-auto">
      <Panel title="AUDIO CORE" theme={theme} className="md:col-span-2 items-center justify-center">
        <EvaSyncDial val={94} size="24" title="SAVE" theme={theme} />
      </Panel>
      <Panel title="STREAMING MIX" theme={theme} className="md:col-span-3 justify-center">
        {DATA.music.platforms.map((item) => (
          <Bar key={item.label} label={item.label} val={item.val} amount={item.amount} green={item.label === "Spotify"} theme={theme} />
        ))}
      </Panel>
      <Panel title="RELEASE CURVE" theme={theme} className="md:col-span-3 justify-center">
        {DATA.music.releaseCurve.map((item) => (
          <Bar key={item.label} label={item.label} val={item.val} green={item.val > 70} theme={theme} />
        ))}
      </Panel>
      <Panel title="TOP TRACKS" theme={theme} className="md:col-span-4">
        <DataTable rows={DATA.music.tracks} theme={theme} />
      </Panel>
      <Panel title="SYNC / RIGHTS PIPELINE" theme={theme} className="md:col-span-4">
        {DATA.music.pipeline.map(([k, v, detail]) => (
          <KV key={k} k={k} v={`${v} / ${detail}`} green={k === "Split sheets"} alert={detail === "watch"} theme={theme} />
        ))}
      </Panel>
      <Panel title="PLAYLIST / SOCIAL CONVERSION" theme={theme} className="md:col-span-3">
        {DATA.music.conversion.map(([k, v, detail]) => (
          <KV key={k} k={k} v={`${v} / ${detail}`} green={k === "Profile -> streams"} theme={theme} />
        ))}
      </Panel>
      <Panel title="CATALOG SPLIT" theme={theme} className="md:col-span-5">
        <KV k="Front catalog / last 90d" v="42%" theme={theme} />
        <KV k="Back catalog" v="58%" green theme={theme} />
        <KV k="Top track concentration" v="18%" green theme={theme} />
        <KV k="Top city" v="Tokyo 11.2%" theme={theme} />
        {DATA.music.conversion.map(([k, v, detail]) => (
          <KV key={k} k={k} v={`${v} / ${detail}`} green={k === "Profile -> streams"} theme={theme} />
        ))}
      </Panel>
    </div>
  </motion.div>
);

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
    if (activeView === VIEWS.WORLD) return "58%";
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

            <footer className="mt-4 pt-4 border-t border-dashed flex justify-between items-center font-tech text-[11px] uppercase font-bold opacity-80 relative z-50 pointer-events-auto bg-black/60 backdrop-blur-md px-4 py-2 cyber-panel-wrap" style={{ borderColor: currentTheme.hex, color: currentTheme.hex }}>
              <div className="flex gap-4 items-center" onMouseEnter={triggerMascotSwap}>
                <StatusChip theme={currentTheme} time={formatTime(time)} />
              </div>
              <div className="relative hidden h-[72px] w-[260px] items-center justify-center md:flex lg:w-[340px]" onMouseEnter={triggerMascotSwap}>
                <span
                  className="absolute inset-0"
                  style={{
                    background: `radial-gradient(ellipse at center, ${currentTheme.hex}66 0%, ${currentTheme.hex}3d 34%, transparent 72%)`
                  }}
                  aria-hidden="true"
                />
                <img
                  src={LOGO_HORIZONTAL_FOOTER}
                  alt="AX-L Mania OS"
                  className="relative h-[84px] w-full object-contain drop-shadow-[0_0_10px_currentColor]"
                />
              </div>
              <div className="flex items-center gap-2">
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
