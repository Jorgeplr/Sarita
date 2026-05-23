import { useState, useCallback, useEffect } from "react";
import { useAudioPlayer } from "../hooks/useAudioPlayer";
import { AudioCtx } from "./audio-context-object";
import { useContent } from "../lib/useContent";

export function AudioProvider({ children }) {
  const { data: fondoData } = useContent("fondo");
  const fondoSrc = fondoData?.url ?? null;
  const fondo = useAudioPlayer(fondoSrc, { loop: true, initialVolume: 0 });
  const [muted, setMuted] = useState(false);
  const [iniciado, setIniciado] = useState(false);

  const iniciarFondo = useCallback(() => {
    if (iniciado) return;
    setIniciado(true);
    if (fondoSrc) {
      fondo.play();
      fondo.fadeTo(0.3, 2000);
    }
  }, [iniciado, fondoSrc]);

  useEffect(() => {
    if (!iniciado || !fondoSrc) return;
    fondo.play();
    fondo.fadeTo(0.3, 2000);
  }, [fondoSrc, iniciado]);

  const pausarFondoParaPlaylist = useCallback(() => {
    fondo.fadeTo(0, 1000);
    setTimeout(() => fondo.pause(), 1000);
  }, [fondo]);

  const reanudarFondo = useCallback(() => {
    if (!iniciado) return;
    fondo.play();
    fondo.fadeTo(0.3, 1000);
  }, [fondo, iniciado]);

  const toggleMute = useCallback(() => {
    setMuted((m) => {
      const next = !m;
      fondo.setVolume(next ? 0 : 0.3);
      return next;
    });
  }, [fondo]);

  return (
    <AudioCtx.Provider
      value={{
        iniciado,
        iniciarFondo,
        pausarFondoParaPlaylist,
        reanudarFondo,
        muted,
        toggleMute,
      }}
    >
      {children}
    </AudioCtx.Provider>
  );
}
