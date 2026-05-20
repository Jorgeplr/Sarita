/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        fondo: "#0a1f15",
        "verde-loki": "#1c5d3f",
        "verde-loki-claro": "#2d8659",
        "verde-glow": "#39ff7a",
        "dorado-loki": "#d4af37",
        "rojo-tulipan": "#c8344d",
        "texto-claro": "#f5f1e8",
        "texto-muted": "#a3b5ab",
      },
      fontFamily: {
        cinzel: ['"Cinzel"', "serif"],
        dancing: ['"Dancing Script"', "cursive"],
        inter: ['"Inter"', "sans-serif"],
      },
      boxShadow: {
        "dorado-tenue": "0 0 12px rgba(212, 175, 55, 0.3)",
        "verde-glow": "0 0 20px rgba(57, 255, 122, 0.5)",
      },
      animation: {
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
      },
      keyframes: {
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 15px rgba(57, 255, 122, 0.4)" },
          "50%": { boxShadow: "0 0 30px rgba(57, 255, 122, 0.8)" },
        },
      },
    },
  },
  plugins: [],
};
