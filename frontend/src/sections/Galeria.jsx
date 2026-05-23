import { motion } from "framer-motion";
import { useContent } from "../lib/useContent";
import FotoCard from "../components/FotoCard";
import TulipanesFlotando from "../components/TulipanesFlotando";

function SkeletonGaleria() {
  const heights = [320, 420, 360, 480, 300, 400, 380, 460, 340];
  return (
    <div className="relative z-10 max-w-6xl mx-auto columns-1 md:columns-2 lg:columns-3 gap-6">
      {heights.map((h, i) => (
        <div
          key={i}
          className="mb-6 break-inside-avoid rounded-2xl bg-verde-loki/30 animate-pulse"
          style={{ height: h }}
        />
      ))}
    </div>
  );
}

export default function Galeria() {
  const { data, loading } = useContent("fotos");
  const fotos = Array.isArray(data) ? data : [];

  return (
    <section className="relative min-h-screen py-20 px-6 md:px-12 overflow-hidden">
      <TulipanesFlotando densidad="baja" />

      <motion.h2
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="relative z-10 font-cinzel text-3xl md:text-5xl text-dorado-loki text-center mb-12"
      >
        Momentos
      </motion.h2>

      {loading ? (
        <SkeletonGaleria />
      ) : (
        <div className="relative z-10 max-w-6xl mx-auto columns-1 md:columns-2 lg:columns-3 gap-6">
          {fotos.map((foto, i) => (
            <FotoCard
              key={foto.id ?? i}
              index={i}
              src={foto.url || foto.thumbUrl}
              caption={foto.caption}
            />
          ))}
        </div>
      )}
    </section>
  );
}
