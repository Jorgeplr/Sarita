import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useContent } from "../lib/useContent";
import ReproductorMusica from "../components/ReproductorMusica";
import TulipanesFlotando from "../components/TulipanesFlotando";
import { enviarRespuesta, getOrCreateVisitorUuid } from "../lib/api";
import { localPlaylist } from "../data/playlist";

const MENSAJE_FINAL =
  "Génesis Sarahí, me gustas más de lo que sé decirte. Esta carta es solo el principio.";
const MENSAJE_GRACIAS = "💚 Gracias por responder. Esto solo es el principio.";
const PARTICULAS_EXPLOSION = 30;

const STATE = {
  INVITE: "invite",
  FORM: "form",
  THANKS: "thanks",
};

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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.18, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

function OptionButton({ active, onClick, children, color = "verde" }) {
  const palette =
    color === "verde"
      ? "border-verde-glow/60 text-verde-glow hover:bg-verde-loki/30"
      : color === "ambar"
      ? "border-dorado-loki/60 text-dorado-loki hover:bg-dorado-loki/15"
      : "border-mist/40 text-texto-muted hover:bg-white/5";
  const activeStyles =
    color === "verde"
      ? "bg-verde-loki/40 border-verde-glow shadow-verde-glow"
      : color === "ambar"
      ? "bg-dorado-loki/25 border-dorado-loki shadow-dorado-tenue"
      : "bg-white/10 border-mist text-texto-claro";
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
      className={`px-5 py-2.5 rounded-full border font-inter text-sm md:text-base transition-colors ${palette} ${
        active ? activeStyles : ""
      }`}
    >
      {children}
    </motion.button>
  );
}

export default function FinalYPlaylist() {
  const [phase, setPhase] = useState(STATE.INVITE);
  const [explosion, setExplosion] = useState(null);
  const [opinion, setOpinion] = useState("");
  const [teEncanto, setTeEncanto] = useState(null);
  const [salida, setSalida] = useState(null);
  const [enviando, setEnviando] = useState(false);

  const { data, loading } = useContent("playlist");
  const apiPlaylist = Array.isArray(data) ? data : [];
  const playlist = apiPlaylist.length > 0 ? apiPlaylist : localPlaylist;

  const abrirFormulario = () => {
    setPhase(STATE.FORM);
  };

  const onEnviar = async () => {
    if (enviando) return;
    setEnviando(true);
    const ok = await enviarRespuesta(getOrCreateVisitorUuid(), {
      opinion: opinion.trim() || null,
      teEncanto,
      salida,
    });
    setEnviando(false);
    if (!ok) return;
    setExplosion(generarExplosion());
    setTimeout(() => setPhase(STATE.THANKS), 600);
  };

  const formCompleto = teEncanto !== null || salida !== null || opinion.trim().length > 0;

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

        <AnimatePresence mode="wait">
          {phase === STATE.INVITE && (
            <motion.div
              key="invite"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.4 } }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            >
              <motion.button
                onClick={abrirFormulario}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative px-8 py-4 rounded-full bg-verde-loki text-texto-claro font-cinzel text-lg md:text-xl shadow-verde-glow animate-pulse-glow border border-dorado-loki/50"
              >
                💚 ¿Quieres ser parte de mi historia?
              </motion.button>
            </motion.div>
          )}

          {phase === STATE.FORM && (
            <motion.div
              key="form"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, y: -16, transition: { duration: 0.4 } }}
              className="mx-auto max-w-xl"
            >
              <motion.div
                variants={itemVariants}
                className="rounded-3xl border border-dorado-loki/30 bg-verde-loki/15 backdrop-blur p-6 md:p-8 text-left shadow-verde-glow"
              >
                <motion.div variants={itemVariants} className="mb-6">
                  <label
                    htmlFor="opinion"
                    className="block font-dancing text-2xl md:text-3xl text-dorado-loki mb-3"
                  >
                    ¿Qué opinas de todo esto?
                  </label>
                  <textarea
                    id="opinion"
                    value={opinion}
                    onChange={(e) => setOpinion(e.target.value)}
                    rows={3}
                    maxLength={1000}
                    placeholder="Cuéntame lo que sientes..."
                    className="w-full rounded-2xl border border-dorado-loki/30 bg-fondo/60 px-4 py-3 text-texto-claro placeholder:text-texto-muted/60 font-inter focus:outline-none focus:border-verde-glow transition-colors resize-none"
                  />
                  <div className="text-right text-xs text-texto-muted mt-1">
                    {opinion.length}/1000
                  </div>
                </motion.div>

                <motion.div variants={itemVariants} className="mb-6">
                  <div className="block font-dancing text-2xl md:text-3xl text-dorado-loki mb-3">
                    ¿Te encantó?
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <OptionButton
                      active={teEncanto === true}
                      onClick={() => setTeEncanto(teEncanto === true ? null : true)}
                      color="verde"
                    >
                      💚 Sí, mucho
                    </OptionButton>
                    <OptionButton
                      active={teEncanto === false}
                      onClick={() => setTeEncanto(teEncanto === false ? null : false)}
                      color="neutral"
                    >
                      No tanto
                    </OptionButton>
                  </div>
                </motion.div>

                <motion.div variants={itemVariants} className="mb-8">
                  <div className="block font-dancing text-2xl md:text-3xl text-dorado-loki mb-3">
                    ¿Te gustaría tener una salida conmigo?
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <OptionButton
                      active={salida === "si"}
                      onClick={() => setSalida(salida === "si" ? null : "si")}
                      color="verde"
                    >
                      🌷 Sí
                    </OptionButton>
                    <OptionButton
                      active={salida === "tal_vez"}
                      onClick={() => setSalida(salida === "tal_vez" ? null : "tal_vez")}
                      color="ambar"
                    >
                      Tal vez
                    </OptionButton>
                    <OptionButton
                      active={salida === "no"}
                      onClick={() => setSalida(salida === "no" ? null : "no")}
                      color="neutral"
                    >
                      Aún no
                    </OptionButton>
                  </div>
                </motion.div>

                <motion.div variants={itemVariants} className="flex justify-center">
                  <motion.button
                    onClick={onEnviar}
                    disabled={enviando || !formCompleto}
                    whileHover={{ scale: formCompleto ? 1.04 : 1 }}
                    whileTap={{ scale: formCompleto ? 0.96 : 1 }}
                    className="px-8 py-3 rounded-full bg-verde-loki text-texto-claro font-cinzel text-base md:text-lg shadow-verde-glow border border-dorado-loki/50 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                  >
                    {enviando ? "Enviando..." : "💌 Enviar respuesta"}
                  </motion.button>
                </motion.div>
              </motion.div>
            </motion.div>
          )}

          {phase === STATE.THANKS && (
            <motion.div
              key="thanks"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="space-y-4"
            >
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.2 }}
                className="font-dancing text-3xl md:text-5xl text-verde-glow"
              >
                {MENSAJE_GRACIAS}
              </motion.p>
              {salida === "si" && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1, delay: 0.8 }}
                  className="font-inter text-texto-muted italic"
                >
                  Te escribo pronto para acordar el día.
                </motion.p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

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
