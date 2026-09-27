import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0E1210",
        paper: "#F6F5F1",
        paper2: "#ECEAE3",
        line: "#DAD6CB",
        pulse: "#7CFF6B",
        pulseDim: "#3C7A34",
        amber: "#E8A33D",
        rust: "#C24C3A",
        steel: "#3E6FA8",
        inkfaint: "#6B675C",
      },
      fontFamily: {
        display: ["var(--font-display)", "ui-sans-serif", "system-ui"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
