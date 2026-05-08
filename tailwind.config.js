/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["Chakra Petch", "sans-serif"],
        tech: ["Share Tech Mono", "monospace"]
      },
      keyframes: {
        "spin-reverse": {
          "100%": { transform: "rotate(-360deg)" }
        },
        "scale-breath": {
          "0%, 100%": { transform: "scale(1.04)" },
          "50%": { transform: "scale(1.1)" }
        },
        "pan-left": {
          "0%": { transform: "translateX(0) scale(1.1)" },
          "100%": { transform: "translateX(-2.5%) scale(1.12)" }
        },
        "pan-right": {
          "0%": { transform: "translateX(-2%) scale(1.08)" },
          "100%": { transform: "translateX(2%) scale(1.1)" }
        }
      },
      animation: {
        "spin-reverse": "spin-reverse 10s linear infinite",
        "scale-breath": "scale-breath 20s ease-in-out infinite",
        "pan-left": "pan-left 30s linear infinite alternate",
        "pan-right": "pan-right 25s linear infinite alternate"
      }
    }
  },
  safelist: [
    "w-16",
    "h-16",
    "w-24",
    "h-24",
    "w-32",
    "h-32",
    "text-[#00E5FF]",
    "text-[#FFB300]",
    "text-[#33FF00]",
    "text-[#FF2200]",
    "text-[#D2A86B]",
    "text-[#FF7700]"
  ],
  plugins: []
};
