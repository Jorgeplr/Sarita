/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0b0f1a",
        mist: "#f3f4f8",
        ember: "#ff6b35",
        emberDark: "#c2451f",
        sea: "#0ea5e9",
        pine: "#0f766e",
      },
      boxShadow: {
        glow: "0 10px 30px rgba(255, 107, 53, 0.25)",
      },
    },
  },
  plugins: [],
};
