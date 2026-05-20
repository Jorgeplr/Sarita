import { useEffect, useRef, useState } from "react";
import { useAudio } from "../context/AudioContext";

function formatTime(s) {
  if (!isFinite(s)) return "0:00";
  const m = Math.floor(s / 60);
  const ss = Math.floor(s % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${ss}`;
}

export default function ReproductorMusica({ canciones }) {
  const { pausarFondoParaPlaylist, reanudarFondo } = useAudio();
  const [activa, setActiva] = useState(null);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (activa === null) {
      reanudarFondo();
      return;
    }
    const audio = new Audio(canciones[activa].src);
    audio.volume = 0.6;
    audio.preload = "metadata";
    audioRef.current = audio;

    const onTime = () => setProgress(audio.currentTime);
    const onLoaded = () => setDuration(audio.duration || 0);
    const onEnded = () => setActiva(null);

    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onLoaded);
    audio.addEventListener("ended", onEnded);

    pausarFondoParaPlaylist();
    audio.play().catch(() => {});

    return () => {
      audio.pause();
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onLoaded);
      audio.removeEventListener("ended", onEnded);
    };
  }, [activa, canciones, pausarFondoParaPlaylist, reanudarFondo]);

  const togglePlay = (i) => setActiva((cur) => (cur === i ? null : i));

  return (
    <div className="max-w-xl mx-auto space-y-4">
      {canciones.map((c, i) => {
        const sonando = activa === i;
        const pct = sonando && duration > 0 ? (progress / duration) * 100 : 0;
        return (
          <div
            key={i}
            className="flex items-center gap-4 p-4 rounded-xl bg-verde-loki/30 border border-dorado-loki/30 backdrop-blur"
          >
            <img
              src={c.cover}
              alt={`Carátula ${c.titulo}`}
              className="w-16 h-16 rounded shrink-0 border border-dorado-loki/40"
            />
            <div className="flex-1 min-w-0">
              <div className="font-inter font-semibold text-texto-claro truncate">
                {c.titulo}
              </div>
              <div className="text-sm text-texto-muted truncate">{c.artista}</div>
              <div className="mt-2 h-1 bg-fondo rounded overflow-hidden">
                <div
                  className="h-full bg-verde-glow transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
              {sonando && (
                <div className="text-xs text-texto-muted mt-1">
                  {formatTime(progress)} / {formatTime(duration)}
                </div>
              )}
            </div>
            <button
              onClick={() => togglePlay(i)}
              aria-label={sonando ? "Pausar" : "Reproducir"}
              className="w-12 h-12 rounded-full bg-dorado-loki text-fondo font-bold text-lg shrink-0 hover:bg-verde-glow transition"
            >
              {sonando ? "❚❚" : "▶"}
            </button>
          </div>
        );
      })}
    </div>
  );
}
