export const fotos = Array.from({ length: 15 }, (_, i) => ({
  src: `/assets/fotos/${String(i + 1).padStart(2, "0")}.webp`,
  alt: `Genesis Sarahi — foto ${i + 1}`,
  texto: "",
}));
