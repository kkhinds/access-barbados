import type { Config } from "tailwindcss";

// Palette follows the Access Barbados brand guide:
//   #0B1D3A navy · #1166CC blue · #2FB1FF light blue · #FFC20E gold · #6B7280 gray
// The brand gray is Tailwind's own gray-500, so it needs no token here.
// Every value below carries the contrast ratio it was chosen for.
const config: Config = {
  darkMode: "media",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // The page ground. Deliberately a soft blue rather than white: large white
        // fields glare and wash out for low-vision readers, and a tinted ground
        // makes the white cards read as distinct surfaces. Navy body text still
        // measures 13.9:1 here, well past AAA.
        page: "#e2ebf6",
        // Cool near-whites. Card borders and dividers, and light text on navy.
        mist: {
          50: "#f4f7fb",
          100: "#e4ebf5", // on navy-900 ~14:1
          200: "#cdd9ea",
          300: "#a9bcd6",
          400: "#8aa1c2",
        },
        // Neutral scale, navy-tinted. Doubles as the dark-mode surface ramp.
        navy: {
          900: "#0b1d3a", // brand navy — body text on light, deepest surface
          800: "#142744", // headings / strong text, dark card surface
          700: "#1e3358", // secondary body — 11.7:1 on mist-50
          600: "#2f4671", // meta / labels — 8.7:1 on mist-50
          500: "#47608a", // borders, decorative
          400: "#93a6c0", // on dark bg only
          300: "#c3d0e2", // on dark bg only
        },
        // Brand blue. 700 is the exact brand value and carries every primary action.
        brand: {
          50: "#eef5ff",
          100: "#d9e8ff",
          200: "#aecfff",
          300: "#6fadff", // dark-mode link/accent on navy
          400: "#3d8bf0",
          500: "#2b7ae8",
          600: "#1a6fd8",
          700: "#1166cc", // brand blue — button bg, 5.5:1 with white
          800: "#0d51a4", // hover, and link text on light — 7.7:1
          900: "#0a3f7e",
        },
        // Brand light blue. Reads only on navy: 2.4:1 on white, so never a light-mode text color.
        sky: {
          100: "#d6efff",
          300: "#7fcbff",
          500: "#2fb1ff", // brand light blue — 7.1:1 on navy-900
          700: "#0e8fe0",
        },
        // Brand gold. The sun in the mark. Pairs with navy text at 10.4:1, never with white.
        gold: {
          100: "#fff4d1",
          200: "#ffe49a",
          400: "#ffc20e", // brand gold
          500: "#e8ae00",
          700: "#8a6800", // gold-toned text on light — 5.6:1
        },
        // Errors only. The brand has no red, and error states are functional, not brand.
        alert: {
          50: "#fdecea",
          200: "#f7bdb6",
          300: "#ff9d8b", // on navy-800 ~7.4:1
          400: "#f4695a",
          600: "#c0261a", // 5.9:1 on white
          700: "#b32317", // 6.6:1 on white
          800: "#8f1c12",
        },
        whatsapp: {
          50: "#dcf8c6", // soft tint, icon-circle background
          500: "#25d366", // primary brand green — icons + accents
          700: "#0e7a6e", // darker brand green — button bg, 5.2:1 with white text
          900: "#075e54", // deep teal — icons on light tint, AAA
        },
      },
      fontFamily: {
        // Montserrat throughout, per the brand guide.
        sans: [
          "Montserrat",
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
          "Montserrat",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
      },
      boxShadow: {
        soft: "0 10px 30px -12px rgba(11, 29, 58, 0.22)",
        card: "0 8px 24px -10px rgba(11, 29, 58, 0.18)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};

export default config;
