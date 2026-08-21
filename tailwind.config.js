/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        background: "#09090B",
        card: "#18181B",
        "card-hover": "#1F1F23",
        border: "#27272A",
        "border-hover": "#3F3F46",
        primary: {
          DEFAULT: "#7C3AED",
          light: "#8B5CF6",
          dark: "#6D28D9",
        },
        secondary: {
          DEFAULT: "#3B82F6",
          light: "#60A5FA",
        },
        accent: {
          DEFAULT: "#F59E0B",
          light: "#FBBF24",
        },
        muted: {
          DEFAULT: "#71717A",
          foreground: "#A1A1AA",
        },
        destructive: "#EF4444",
        success: "#22C55E",
        surface: "#111113",
        "surface-elevated": "#1C1C1F",
      },
      animation: {
        "fade-in": "fade-in 0.4s ease-out both",
        "fade-in-up": "fade-in-up 0.45s ease-out both",
        "fade-in-down": "fade-in-down 0.35s ease-out both",
        "slide-up": "slide-up 0.45s ease-out both",
        "slide-down": "slide-down 0.3s ease-out both",
        "slide-left": "slide-left 0.35s ease-out both",
        "slide-right": "slide-right 0.35s ease-out both",
        "scale-in": "scale-in 0.25s ease-out both",
        "scale-in-lg": "scale-in-lg 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) both",
        "pop-in": "pop-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) both",
        glow: "glow 2s ease-in-out infinite alternate",
        shimmer: "shimmer 2s linear infinite",
        "float-slow": "float-slow 8s ease-in-out infinite",
        "float-medium": "float-medium 6s ease-in-out infinite",
        "float-fast": "float-fast 4s ease-in-out infinite",
        "spin-slow": "spin 3s linear infinite",
        "bounce-subtle": "bounce-subtle 2s ease-in-out infinite",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "fade-in-up": {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in-down": {
          from: { opacity: "0", transform: "translateY(-10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(24px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-down": {
          from: { opacity: "0", transform: "translateY(-10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-left": {
          from: { opacity: "0", transform: "translateX(24px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        "slide-right": {
          from: { opacity: "0", transform: "translateX(-24px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.95)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        "scale-in-lg": {
          from: { opacity: "0", transform: "scale(0.9)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        "pop-in": {
          from: { opacity: "0", transform: "scale(0)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        glow: {
          from: { boxShadow: "0 0 20px rgba(124, 58, 237, 0.3)" },
          to: { boxShadow: "0 0 40px rgba(124, 58, 237, 0.6)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "float-slow": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-16px)" },
        },
        "float-medium": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
        "float-fast": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        "bounce-subtle": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(124, 58, 237, 0)" },
          "50%": { boxShadow: "0 0 20px 4px rgba(124, 58, 237, 0.3)" },
        },
      },
    },
  },
  plugins: [],
};
