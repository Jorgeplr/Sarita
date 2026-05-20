import { motion } from "framer-motion";
import { fotos } from "../data/fotos";
import FotoCard from "../components/FotoCard";
import TulipanesFlotando from "../components/TulipanesFlotando";

export default function Galeria() {
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

      <div className="relative z-10 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {fotos.map((foto, i) => (
          <FotoCard key={i} index={i} {...foto} />
        ))}
      </div>
    </section>
  );
}
