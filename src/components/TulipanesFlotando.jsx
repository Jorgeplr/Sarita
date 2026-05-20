import { motion } from "framer-motion";
import { useState } from "react";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";

const cantidades = { baja: 3, media: 8, alta: 14 };

function generar(cantidad) {
  return Array.from({ length: cantidad }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 6,
    duration: 10 + Math.random() * 8,
    size: 24 + Math.random() * 24,
    rotateStart: Math.random() * 30 - 15,
    rotateEnd: Math.random() * 30 - 15,
  }));
}

export default function TulipanesFlotando({ densidad = "media" }) {
  const reduced = usePrefersReducedMotion();

  const [tulipanes] = useState(() => {
    const base = cantidades[densidad] ?? 8;
    const isDesktop =
      typeof window !== "undefined" &&
      window.matchMedia("(min-width: 1024px)").matches;
    const cantidad = isDesktop ? base : Math.ceil(base / 2);
    return generar(cantidad);
  });

  if (reduced) return null;

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
      {tulipanes.map((t) => (
        <motion.img
          key={t.id}
          src="/assets/decoraciones/tulipan.svg"
          alt=""
          aria-hidden="true"
          className="absolute opacity-80"
          style={{ left: `${t.left}%`, width: `${t.size}px` }}
          initial={{ y: "-10vh", rotate: t.rotateStart }}
          animate={{ y: "110vh", rotate: t.rotateEnd }}
          transition={{
            duration: t.duration,
            delay: t.delay,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
}
