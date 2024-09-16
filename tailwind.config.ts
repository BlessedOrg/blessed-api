import type { Config } from "tailwindcss";

const flowbite = require("flowbite-react/tailwind");

/** @type {import("tailwindcss").Config} */
const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}", flowbite.content()],
  darkMode: "class",
  theme: {
    screens: {
      "xs": "580px",
      "sm": "640px",
      "md": "768px",
      "lg": "1024px",
      "xl": "1280px",
      "2xl": "1440px",
      "3xl": "1536px",
      "4xl": "1680px",
      "5xl": "1920px",
    },
    extend: {
      backgroundImage: {
        'primary': 'linear-gradient(90deg, #06F881 0%, #FFFACD 100%)',
        'secondary': 'linear-gradient(247.1deg, #06F881 0%, #FFFACD 67%)',
      },
      height: {
        "button": "3.25rem"
      },
      colors: {
        "primary": {
          50: "#E0FEF0",
          100: "#B3FCE0",
          200: "#80FAD0",
          300: "#4DF9C0",
          400: "#26F7B0",
          500: "#06F881",
          600: "#05C667",
          700: "#04954E",
          800: "#037134",
          900: "#024D1A"
        },
        "secondary": {
          50: "#FFFEF5",
          100: "#FFFDEB",
          200: "#FFFBD6",
          300: "#FFF9C2",
          400: "#FFF7AD",
          500: "#FFFACD",
          600: "#CCB870",
          700: "#998A54",
          800: "#665C38",
          900: "#332E1C"
        },
        "gray": {
          50: "#FFFFFF",
          100: "#F7F7F7",
          200: "#5F5F5F",
          300: "#E0E0E0",
          400: "#D1D1D1",
          500: "#EFEFEF",
          600: "#B3B3B3",
          700: "#A4A4A4",
          800: "#959595",
          900: "#868686"
        },
        "black": {
          50: "#000000",
          100: "#D9D9D9",
          200: "#BFBFBF",
          300: "#A6A6A6",
          400: "#8C8C8C",
          500: "#1D1D1D",
          600: "#191919",
          700: "#141414",
          800: "#101010",
          900: "#0C0C0C"
        }
      }
    }
  },
  plugins: [
    flowbite.plugin(), require("flowbite/plugin")({
      charts: true
    })
  ]
};

export default config;