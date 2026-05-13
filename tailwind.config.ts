import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "media",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        sand: {
          50: "#fdfaf3",
          100: "#f8efd9",
          200: "#f0dfb1",
          300: "#e7cd84",
          400: "#dcb959",
        },
        turquoise: {
          50: "#ecfbfa",
          100: "#cdf4f1",
          200: "#9ee8e3",
          300: "#63d6cf",
          400: "#2fbab2",
          500: "#159a93",
          600: "#0e7a76",
          700: "#0c615f",
          800: "#0d4d4c",
          900: "#0b3f3f",
        },
        coral: {
          50: "#fff3f1",
          100: "#ffe2dd",
          200: "#ffc4ba",
          300: "#ff9d8b",
          400: "#fb6f57",
          500: "#ed4a30",
          600: "#c93316",
          700: "#a02611",
          800: "#82200f",
          900: "#6a1c0e",
        },
        ink: {
          900: "#0a1820", // body text on light bg — ~17:1 vs sand-50
          800: "#162735", // headings / strong text
          700: "#2a3d4b", // secondary body — passes AA
          600: "#3f5564", // meta / labels — passes AA
          500: "#5b6f7c", // decorative only
          400: "#9fb0bc", // on dark bg only
          300: "#c6d2da", // on dark bg only
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Helvetica",
          "Arial",
          "sans-serif",
        ],
        display: [
          "Manrope",
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
      },
      boxShadow: {
        soft: "0 10px 30px -12px rgba(13, 77, 76, 0.18)",
        card: "0 8px 24px -10px rgba(13, 77, 76, 0.15)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};

export default config;
