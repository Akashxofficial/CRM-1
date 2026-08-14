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
        // Exact brand swatch from C:77 M:45 Y:0 K:0
        brand: {
          50: "#F0F6FF",
          100: "#E0ECFF",
          200: "#B9D5FF",
          300: "#86B8FF",
          400: "#579BFF",
          500: "#3B8CFF", // Exact CMYK C:77 M:45 Y:0 K:0 Primary Blue
          600: "#2570E8",
          700: "#1A57BD",
          800: "#164799",
          900: "#163C7A",
          950: "#0E254E",
        },
        estate: {
          available: "#10b981", // Emerald Green
          held: "#f59e0b",      // Amber
          booked: "#3B8CFF",    // Brand Blue
          sold: "#ef4444",      // Red
          blocked: "#64748b",   // Slate
        }
      },
      fontFamily: {
        sans: ["var(--font-titillium)", "'Titillium Web'", "-apple-system", "BlinkMacSystemFont", "'Segoe UI'", "Roboto", "sans-serif"],
        heading: ["var(--font-titillium)", "'Titillium Web'", "-apple-system", "BlinkMacSystemFont", "'Segoe UI'", "Roboto", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
