import { motion } from "framer-motion";
import { useAudio } from "../context/AudioContext";
import TulipanesFlotando from "../components/TulipanesFlotando";

const NOMBRE = "Genesis Sarahi";

const letras = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 1.5 },
  },
};

const letra = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function Intro() {
  const { iniciado, iniciarFondo } = useAudio();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {iniciado && <TulipanesFlotando densidad="media" />}

      {!iniciado && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          onClick={iniciarFondo}
          className="relative z-10 px-8 py-4 rounded-full bg-verde-loki text-texto-claro font-cinzel text-xl shadow-verde-glow animate-pulse-glow border border-dorado-loki/50"
        >
          💚 Toca aquí
        </motion.button>
      )}

      {iniciado && (
        <div className="relative z-10 text-center px-6">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="font-cinzel text-3xl md:text-5xl text-texto-claro mb-6"
          >
            Para...
          </motion.h2>

          <motion.h1
            variants={letras}
            initial="hidden"
            animate="visible"
            className="font-dancing text-6xl md:text-8xl text-dorado-loki"
            style={{ textShadow: "0 0 24px rgba(57, 255, 122, 0.4)" }}
          >
            {NOMBRE.split("").map((char, i) => (
              <motion.span key={i} variants={letra} className="inline-block">
                {char === " " ? " " : char}
              </motion.span>
            ))}
          </motion.h1>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 4, duration: 1 }}
            className="mt-16 text-texto-muted font-inter"
          >
            <div className="text-sm tracking-widest">Desliza ↓</div>
          </motion.div>
        </div>
      )}
    </section>
  );
}
