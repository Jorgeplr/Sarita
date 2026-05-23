import { motion } from "framer-motion";

const CAPTION_GLOW = {
  textShadow:
    "0 0 8px rgba(212, 175, 55, 0.7), 0 0 18px rgba(212, 175, 55, 0.45), 0 0 36px rgba(212, 175, 55, 0.25)",
};

export default function FotoCard({ src, alt, texto, caption, index }) {
  const overlayText = texto ?? caption;
  const safeAlt = alt || overlayText || "Foto";

  return (
    <motion.figure
      initial={{ opacity: 0, scale: 0.95, y: 16 }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.7, delay: (index % 3) * 0.1 }}
      whileHover={{ scale: 1.02 }}
      className="mb-6 break-inside-avoid overflow-hidden rounded-2xl border-2 border-verde-loki shadow-dorado-tenue bg-fondo/40 backdrop-blur-sm"
    >
      <img
        src={src}
        alt={safeAlt}
        loading="lazy"
        decoding="async"
        className="w-full h-auto block"
      />
      {overlayText && (
        <figcaption
          className="px-4 py-3 text-center border-t border-dorado-loki/30 bg-fondo/60"
        >
          <p
            className="font-dancing text-xl md:text-2xl text-dorado-loki leading-snug"
            style={CAPTION_GLOW}
          >
            {overlayText}
          </p>
        </figcaption>
      )}
    </motion.figure>
  );
}
