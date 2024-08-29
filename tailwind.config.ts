import type { Config } from "tailwindcss";
const flowbite = require("flowbite-react/tailwind");

/** @type {import('tailwindcss').Config} */
const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}", flowbite.content()],
  darkMode: 'class',
  theme: {
    extend: {},
  },
  plugins: [
    flowbite.plugin(), require('flowbite/plugin')({
      charts: true,
    })
  ],
}

export default config;