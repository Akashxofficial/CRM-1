import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        brand: {
          50: "#f0f7ff",
          100: "#e0effe",
          200: "#bae0fd",
          300: "#7cc8fb",
          400: "#36aaf5",
          500: "#0c8ee9",
          600: "#026fc7",
          700: "#0358a1",
          800: "#074b84",
          900: "#0b3f6e",
          950: "#072849",
        },
        gold: {
          500: "#eab308",
          600: "#ca8a04",
        },
        estate: {
          available: "#10b981", // Emerald Green
          held: "#f59e0b",      // Amber
          booked: "#3b82f6",    // Blue
          sold: "#ef4444",      // Red
          blocked: "#64748b",   // Slate
        }
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        heading: ["var(--font-outfit)", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
