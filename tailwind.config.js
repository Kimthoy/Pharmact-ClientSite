/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        khmer: ["'Noto Sans Khmer'", "Khmer OS Battambang", "sans-serif"],
      },
    },
  },
  plugins: [],
};

