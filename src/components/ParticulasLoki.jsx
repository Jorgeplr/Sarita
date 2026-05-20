import { motion } from "framer-motion";
import { useState } from "react";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";

const cantidades = { baja: 6, media: 12, alta: 20 };

function generar(cantidad) {
  return Array.from({ length: cantidad }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 4 + Math.random() * 8,
    delay: Math.random() * 4,
    duration: 3 + Math.random() * 3,
  }));
}

export default function ParticulasLoki({ densidad = "media" }) {
  const reduced = usePrefersReducedMotion();

  const [particulas] = useState(() => {
    const base = cantidades[densidad] ?? 12;
    const isDesktop =
      typeof window !== "undefined" &&
      window.matchMedia("(min-width: 1024px)").matches;
    const cantidad = isDesktop ? base : Math.ceil(base / 2);
    return generar(cantidad);
  });

  if (reduced) return null;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {particulas.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-verde-glow"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            boxShadow: "0 0 12px #39ff7a, 0 0 24px #39ff7a",
          }}
          animate={{ opacity: [0, 1, 0], scale: [0.5, 1.2, 0.5] }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
