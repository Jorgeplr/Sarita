import { motion } from "framer-motion";
import { useContent } from "../lib/useContent";
import CualidadCard from "../components/CualidadCard";
import ParticulasLoki from "../components/ParticulasLoki";

const CITA_LOKI =
  "Pero a diferencia de Loki, yo no quiero ser el villano de tu historia... quiero ser tu siempre.";

export default function RazonesYLoki() {
  const { data, loading } = useContent("cualidades");
  const cualidades = Array.isArray(data) ? data : [];

  return (
    <>
      <section className="relative py-20 px-6">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="font-cinzel text-3xl md:text-5xl text-dorado-loki text-center mb-12"
        >
          Cosas que me gustan de ti
        </motion.h2>

        <div className="space-y-6">
          {loading && (
            <div className="space-y-6">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="h-20 max-w-2xl mx-auto rounded-xl bg-verde-loki/30 animate-pulse"
                />
              ))}
            </div>
          )}
          {!loading &&
            cualidades.map((c, i) => (
              <CualidadCard key={c.id ?? i} index={i} icon={c.icon} text={c.text} />
            ))}
        </div>
      </section>

      <section className="relative min-h-screen flex items-center justify-center px-6 overflow-hidden bg-fondo">
        <ParticulasLoki densidad="alta" />

        <div className="relative z-10 text-center max-w-3xl">
          <motion.img
            src="/assets/decoraciones/loki-casco.svg"
            alt="Casco de Loki"
            initial={{ opacity: 0, y: -100, rotate: -10 }}
            whileInView={{ opacity: 1, y: 0, rotate: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="mx-auto mb-8 w-32 md:w-48"
          />

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6, duration: 1 }}
            className="font-cinzel text-xl md:text-3xl text-texto-claro leading-relaxed italic"
            style={{ textShadow: "0 0 20px rgba(57, 255, 122, 0.5)" }}
          >
            &ldquo;{CITA_LOKI}&rdquo;
          </motion.p>
        </div>
      </section>
    </>
  );
}
