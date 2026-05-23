import { motion } from "framer-motion";

export default function CualidadCard({ icono, texto, icon, text, index }) {
  const fromLeft = index % 2 === 0;
  const emoji = icono ?? icon ?? "";
  const label = texto ?? text ?? "";

  return (
    <motion.div
      initial={{ opacity: 0, x: fromLeft ? -50 : 50 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className="flex items-center gap-4 p-5 rounded-xl bg-verde-loki/40 backdrop-blur border border-dorado-loki/40 max-w-2xl mx-auto"
    >
      <div className="text-3xl shrink-0">{emoji}</div>
      <p className="font-inter text-lg md:text-xl text-texto-claro">{label}</p>
    </motion.div>
  );
}
