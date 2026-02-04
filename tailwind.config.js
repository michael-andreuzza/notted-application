/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Your minimal palette
        bg: "var(--color-bg)",
        fg: "var(--color-fg)",
      },
      borderRadius: {
        'drawer': '24px',
      },
    },
  },
  darkMode: "class",
  plugins: [],
};
