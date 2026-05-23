import { useEffect, useRef, useState } from "react";
import { useAudio } from "../context/useAudio";

function formatTime(s) {
  if (!isFinite(s)) return "0:00";
  const m = Math.floor(s / 60);
  const ss = Math.floor(s % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${ss}`;
}

const FALLBACK_COVER = "/assets/decoraciones/cover-placeholder.svg";

export default function ReproductorMusica({ canciones }) {
  const { pausarFondoParaPlaylist, reanudarFondo } = useAudio();
  const [activa, setActiva] = useState(null);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);
  const items = Array.isArray(canciones) ? canciones : [];

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (activa === null) {
      reanudarFondo();
      return;
    }
    const current = items[activa];
    const src = current?.url || current?.src;
    if (!src) {
      setActiva(null);
      return;
    }
    const audio = new Audio(src);
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
  }, [activa, items, pausarFondoParaPlaylist, reanudarFondo]);

  const togglePlay = (i) => setActiva((cur) => (cur === i ? null : i));

  return (
    <div className="max-w-xl mx-auto space-y-4">
      {items.length === 0 && (
        <div className="text-center text-texto-muted font-inter">
          No hay canciones todavia.
        </div>
      )}
      {items.map((c, i) => {
        const sonando = activa === i;
        const pct = sonando && duration > 0 ? (progress / duration) * 100 : 0;
        const title = c.title || c.titulo || "";
        const artist = c.artist || c.artista || "";
        const cover = c.cover || FALLBACK_COVER;
        return (
          <div
            key={i}
            className="flex items-center gap-4 p-4 rounded-xl bg-verde-loki/30 border border-dorado-loki/30 backdrop-blur"
          >
            <img
              src={cover}
              alt={`Caratula ${title}`}
              className="w-16 h-16 rounded shrink-0 border border-dorado-loki/40"
            />
            <div className="flex-1 min-w-0">
              <div className="font-inter font-semibold text-texto-claro truncate">
                {title}
              </div>
              <div className="text-sm text-texto-muted truncate">{artist}</div>
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
