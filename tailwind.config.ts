import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#0D1F1A",
        emerald: {
          DEFAULT: "#12433A",
          lo: "#1B5C50",
          light: "#EBF3F0",
        },
        champagne: {
          DEFAULT: "#C9A227",
          lo: "#E8D9A8",
        },
        bone: "#F7F5F0",
        card: "#FFFFFF",
        line: "rgba(13,31,26,0.08)",
        muted: "#6B7A75",
        urgent: "#B4453A",
        dept: {
          fb: "#12433A",
          housekeeping: "#3A6EA5",
          spa: "#8E5AA8",
          front_desk: "#C9A227",
          dining: "#B0763A",
          maintenance: "#7A6A55",
        },
        goldramp: {
          0: "#EFEDE7",
          1: "#F0EAD6",
          2: "#E0CC8E",
          3: "#C9A227",
          4: "#9A7A15",
          5: "#6B5410",
        },
      },
      fontFamily: {
        serif: ["'Cormorant Garamond'", "'Playfair Display'", "Georgia", "serif"],
        sans: ["'Inter'", "system-ui", "-apple-system", "sans-serif"],
      },
      boxShadow: {
        luxury: "0 1px 3px rgba(13,31,26,.04), 0 8px 24px rgba(13,31,26,.06)",
        "luxury-hover": "0 16px 36px -4px rgba(13,31,26,.12), 0 0 0 1px rgba(201,162,39,.25)",
        "gold-glow": "0 0 20px -3px rgba(201,162,39,0.35)",
        "emerald-glow": "0 0 20px -3px rgba(18,67,58,0.35)",
      },
      borderRadius: {
        luxury: "14px",
      },
      keyframes: {
        fadeUp: {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        slideInLeft: {
          from: { opacity: "0", transform: "translateX(-16px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        goldFlash: {
          "0%": { backgroundColor: "rgba(201, 162, 39, 0.24)" },
          "100%": { backgroundColor: "transparent" },
        },
        fadeCell: {
          from: { opacity: "0", transform: "scale(0.92)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        glowPulse: {
          "0%, 100%": { opacity: "0.14", transform: "scale(1)" },
          "50%": { opacity: "0.26", transform: "scale(1.08)" },
        },
        subtleFloat: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-4px)" },
        },
      },
      animation: {
        fadeUp: "fadeUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        slideInLeft: "slideInLeft 0.4s ease-out forwards",
        goldFlash: "goldFlash 1.5s ease-out forwards",
        fadeCell: "fadeCell 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        glowPulse: "glowPulse 6s ease-in-out infinite",
        subtleFloat: "subtleFloat 4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
