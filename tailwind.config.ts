import type { Config } from "tailwindcss";

export default {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./styles/**/*.{css}"
  ],
  theme: { 
    extend: {
      fontFamily: {
        sans: ['var(--font-suit)', 'system-ui', '-apple-system'],
      },
  } },
  plugins: [],
} satisfies Config;
