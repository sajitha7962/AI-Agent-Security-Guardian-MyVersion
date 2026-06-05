/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#050a0f",
        surface: "#0a1520",
        surface2: "#0f1e2e",
        border: "#1a3a5c",
        accent: "#00d4ff",
        danger: "#ff4060",
        safe: "#00ff9d",
        warn: "#ffb800",
        muted: "#4a7a9b",
        "text-primary": "#c8e0f4",
      },
      fontFamily: {
        mono: ["'Share Tech Mono'", "monospace"],
        sans: ["'Syne'", "sans-serif"],
      },
    },
  },
  plugins: [],
};
