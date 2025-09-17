/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: "#7c3aed",
        },
      },
      boxShadow: {
        soft: "0 6px 18px rgba(0,0,0,0.12)",
      },
    },
  },
  plugins: [],
};
