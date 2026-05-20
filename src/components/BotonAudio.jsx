import { useAudio } from "../context/useAudio";
import { motion, AnimatePresence } from "framer-motion";

export default function BotonAudio() {
  const { iniciado, muted, toggleMute } = useAudio();

  return (
    <AnimatePresence>
      {iniciado && (
        <motion.button
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          onClick={toggleMute}
          aria-label={muted ? "Activar audio" : "Silenciar audio"}
          className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-verde-loki text-texto-claro shadow-dorado-tenue border border-dorado-loki/40 flex items-center justify-center hover:bg-verde-loki-claro transition"
        >
          {muted ? "🔇" : "🔊"}
        </motion.button>
      )}
    </AnimatePresence>
  );
}
