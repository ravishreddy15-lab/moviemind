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
        "fade-in": "fade-in 0.5s ease-out",
        "slide-up": "slide-up 0.5s ease-out",
        "slide-down": "slide-down 0.3s ease-out",
        "scale-in": "scale-in 0.3s ease-out",
        glow: "glow 2s ease-in-out infinite alternate",
        shimmer: "shimmer 2s linear infinite",
        float: "float 6s ease-in-out infinite",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-down": {
          from: { opacity: "0", transform: "translateY(-10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.95)" },
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
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-20px)" },
        },
      },
    },
  },
  plugins: [],
};
