/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        /* Paleta principal — Slate escuro + Âmbar dourado */
        brand: {
          50:  "#fefce8",
          100: "#fef9c3",
          200: "#fef08a",
          300: "#fde047",
          400: "#facc15",
          500: "#eab308",
          600: "#ca8a04",
          700: "#a16207",
          800: "#854d0e",
          900: "#713f12",
        },
        surface: {
          0:   "#0a0a0f",   /* fundo base */
          50:  "#0f0f18",   /* sidebar */
          100: "#14141f",   /* cards */
          200: "#1a1a2e",   /* cards hover */
          300: "#1f1f35",   /* bordas suaves */
          400: "#2a2a45",   /* bordas visíveis */
        },
      },
      fontFamily: {
        sans:    ["var(--font-body)", "sans-serif"],
        display: ["var(--font-display)", "sans-serif"],
        mono:    ["var(--font-mono)", "monospace"],
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
      boxShadow: {
        "glow-sm": "0 0 12px 0 rgba(234,179,8,0.15)",
        "glow":    "0 0 24px 0 rgba(234,179,8,0.20)",
        "glow-lg": "0 0 48px 0 rgba(234,179,8,0.25)",
        "card":    "0 1px 3px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.5)",
      },
      backgroundImage: {
        "gradient-radial":    "radial-gradient(var(--tw-gradient-stops))",
        "gradient-subtle":    "linear-gradient(135deg, var(--tw-gradient-stops))",
        "noise":              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.05'/%3E%3C/svg%3E\")",
      },
      animation: {
        "fade-in":      "fadeIn 0.4s ease-out",
        "slide-in":     "slideIn 0.35s cubic-bezier(0.16,1,0.3,1)",
        "slide-up":     "slideUp 0.4s cubic-bezier(0.16,1,0.3,1)",
        "pulse-slow":   "pulse 3s cubic-bezier(0.4,0,0.6,1) infinite",
        "shimmer":      "shimmer 2s linear infinite",
      },
      keyframes: {
        fadeIn:  { from: { opacity: 0 }, to: { opacity: 1 } },
        slideIn: { from: { transform: "translateX(-16px)", opacity: 0 }, to: { transform: "translateX(0)", opacity: 1 } },
        slideUp: { from: { transform: "translateY(16px)", opacity: 0 }, to: { transform: "translateY(0)", opacity: 1 } },
        shimmer: { from: { backgroundPosition: "-200% 0" }, to: { backgroundPosition: "200% 0" } },
      },
    },
  },
  plugins: [],
};
