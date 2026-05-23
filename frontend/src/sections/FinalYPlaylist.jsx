import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useContent } from "../lib/useContent";
import ReproductorMusica from "../components/ReproductorMusica";
import TulipanesFlotando from "../components/TulipanesFlotando";
import { enviarRespuesta, getOrCreateVisitorUuid } from "../lib/api";

const MENSAJE_FINAL =
  "Genesis Sarahi, me gustas más de lo que sé decirte. Esta carta es solo el principio.";
const MENSAJE_GRACIAS = "💚 Gracias por leer hasta el final. Tú haces todo más bonito.";
const PARTICULAS_EXPLOSION = 30;

function generarExplosion() {
  return Array.from({ length: PARTICULAS_EXPLOSION }, (_, i) => {
    const angle = (i / PARTICULAS_EXPLOSION) * Math.PI * 2;
    const dist = 200 + Math.random() * 100;
    return {
      id: i,
      x: Math.cos(angle) * dist,
      y: Math.sin(angle) * dist,
      emoji: i % 2 === 0 ? "💚" : "🌷",
    };
  });
}

export default function FinalYPlaylist() {
  const [revelado, setRevelado] = useState(false);
  const [explosion, setExplosion] = useState(null);
  const { data, loading } = useContent("playlist");
  const playlist = Array.isArray(data) ? data : [];

  const onRevelar = () => {
    enviarRespuesta(getOrCreateVisitorUuid());
    setExplosion(generarExplosion());
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
              {explosion.map((p) => (
                <motion.span
                  key={p.id}
                  initial={{ x: 0, y: 0, opacity: 1, scale: 0.5 }}
                  animate={{ x: p.x, y: p.y, opacity: 0, scale: 1.5 }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="absolute text-3xl"
                >
                  {p.emoji}
                </motion.span>
              ))}
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
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="h-20 rounded-xl bg-verde-loki/30 animate-pulse"
                />
              ))}
            </div>
          ) : (
            <ReproductorMusica canciones={playlist} />
          )}
        </div>
      </div>
    </section>
  );
}
