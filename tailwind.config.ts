import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: { paper: "#F6F8FA", ink: "#173743", slate: "#667782", line: "#D8E0E4", signal: { DEFAULT: "#D94B45", soft: "#FDECEC" }, steady: { DEFAULT: "#2B5D6B", soft: "#E7F0F2" } },
      fontFamily: { sans: ["var(--font-body)", "system-ui", "sans-serif"], display: ["var(--font-body)", "system-ui", "sans-serif"], mono: ["ui-monospace", "monospace"] },
      borderRadius: { sm: "6px", DEFAULT: "10px" },
    },
  },
  plugins: [],
};
export default config;
