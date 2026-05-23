import { motion } from "framer-motion";
import { useContent } from "../lib/useContent";
import FotoCard from "../components/FotoCard";
import TulipanesFlotando from "../components/TulipanesFlotando";

function SkeletonGaleria() {
  return (
    <div className="relative z-10 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 9 }).map((_, i) => (
        <div
          key={i}
          className="aspect-[2/3] rounded-lg bg-verde-loki/30 animate-pulse"
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
        <div className="relative z-10 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {fotos.map((foto, i) => (
            <FotoCard
              key={foto.id ?? i}
              index={i}
              src={foto.thumbUrl || foto.url}
              caption={foto.caption}
            />
          ))}
        </div>
      )}
    </section>
  );
}
