import type { Config } from "tailwindcss";
const flowbite = require("flowbite-react/tailwind");

/** @type {import('tailwindcss').Config} */
const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}", flowbite.content()],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#E0F9E5',
          100: '#B2F0B7',
          200: '#80E89A',
          300: '#4DE77D',
          400: '#26D76A',
          500: '#06F881',
          600: '#05C76D',
          700: '#04A563',
          800: '#038D57',
          900: '#027A4B',
        },
      },
    },
  },
  plugins: [
    flowbite.plugin(), require('flowbite/plugin')({
      charts: true,
    })
  ],
}

export default config;