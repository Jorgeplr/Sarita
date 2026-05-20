import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { playlist } from "../data/playlist";
import ReproductorMusica from "../components/ReproductorMusica";
import TulipanesFlotando from "../components/TulipanesFlotando";

const MENSAJE_FINAL =
  "Genesis Sarahi, me gustas más de lo que sé decirte. Esta carta es solo el principio.";
const MENSAJE_GRACIAS = "💚 Gracias por leer hasta el final. Tú haces todo más bonito.";

export default function FinalYPlaylist() {
  const [revelado, setRevelado] = useState(false);
  const [explosion, setExplosion] = useState(false);

  const onRevelar = () => {
    setExplosion(true);
    setTimeout(() => setRevelado(true), 600);
  };

  return (
    <section className="relative min-h-screen py-20 px-6 overflow-hidden">
      <TulipanesFlotando densidad="alta" />

      <div className="relative z-10 max-w-3xl mx-auto text-center">
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2 }}
          className="font-dancing text-4xl md:text-6xl text-dorado-loki leading-tight mb-12"
        >
          {MENSAJE_FINAL}
        </motion.p>

        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6, duration: 0.8 }}
          onClick={onRevelar}
          disabled={revelado}
          className="relative px-8 py-4 rounded-full bg-verde-loki text-texto-claro font-cinzel text-lg md:text-xl shadow-verde-glow animate-pulse-glow border border-dorado-loki/50 disabled:opacity-60"
        >
          💚 ¿Quieres ser parte de mi historia?
        </motion.button>

        <AnimatePresence>
          {explosion && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              {Array.from({ length: 30 }).map((_, i) => {
                const angle = (i / 30) * Math.PI * 2;
                const dist = 200 + Math.random() * 100;
                return (
                  <motion.span
                    key={i}
                    initial={{ x: 0, y: 0, opacity: 1, scale: 0.5 }}
                    animate={{
                      x: Math.cos(angle) * dist,
                      y: Math.sin(angle) * dist,
                      opacity: 0,
                      scale: 1.5,
                    }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="absolute text-3xl"
                  >
                    {i % 2 === 0 ? "💚" : "🌷"}
                  </motion.span>
                );
              })}
            </div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {revelado && (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
              className="mt-12 font-dancing text-2xl md:text-3xl text-verde-glow"
            >
              {MENSAJE_GRACIAS}
            </motion.p>
          )}
        </AnimatePresence>

        <div className="mt-20">
          <h3 className="font-cinzel text-2xl md:text-3xl text-dorado-loki mb-6">
            Nuestras canciones
          </h3>
          <ReproductorMusica canciones={playlist} />
        </div>
      </div>
    </section>
  );
}
