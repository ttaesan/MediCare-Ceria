/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brightPink: "#FF5C8D",
        brightYellow: "#FFD166",
        brightGreen: "#06D6A0",
        softCream: "#FFFDF7",
      },
      boxShadow: {
        pop: "4px 4px 0px 0px #1E293B",
        popSm: "2px 2px 0px 0px #1E293B",
      },
    },
  },
  plugins: [],
};
