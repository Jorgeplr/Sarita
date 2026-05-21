// Cuando lleguen las fotos reales en .webp, cambia la extensión .svg → .webp aquí.
// Los placeholders están en /public/assets/fotos/01.svg … 15.svg
export const fotos = Array.from({ length: 15 }, (_, i) => ({
  src: `/assets/fotos/${String(i + 1).padStart(2, "0")}.svg`,
  alt: `Genesis Sarahi — foto ${i + 1}`,
  texto: i === 0 ? "Tu sonrisa aquí..." : "",
}));
