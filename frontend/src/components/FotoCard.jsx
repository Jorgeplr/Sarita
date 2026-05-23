import { motion } from "framer-motion";
import { useState } from "react";

export default function FotoCard({ src, alt, texto, caption, index }) {
  const [hover, setHover] = useState(false);
  const overlayText = texto ?? caption;
  const safeAlt = alt || overlayText || "Foto";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.7, delay: (index % 3) * 0.1 }}
      whileHover={{ scale: 1.03 }}
      onHoverStart={() => setHover(true)}
      onHoverEnd={() => setHover(false)}
      onTouchStart={() => setHover((h) => !h)}
      className="relative overflow-hidden rounded-lg border-2 border-verde-loki shadow-dorado-tenue cursor-pointer"
    >
      <img
        src={src}
        alt={safeAlt}
        loading="lazy"
        decoding="async"
        className="w-full h-auto block"
      />
      {overlayText && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: hover ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 flex items-end p-4 bg-gradient-to-t from-fondo via-fondo/70 to-transparent"
        >
          <p className="font-dancing text-2xl text-texto-claro">{overlayText}</p>
        </motion.div>
      )}
    </motion.div>
  );
}
