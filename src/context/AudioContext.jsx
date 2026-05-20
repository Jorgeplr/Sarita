import { useState, useCallback } from "react";
import { useAudioPlayer } from "../hooks/useAudioPlayer";
import { AudioCtx } from "./audio-context-object";

const FONDO_SRC = "/assets/musica/fondo.mp3";

export function AudioProvider({ children }) {
  const fondo = useAudioPlayer(FONDO_SRC, { loop: true, initialVolume: 0 });
  const [muted, setMuted] = useState(false);
  const [iniciado, setIniciado] = useState(false);

  const iniciarFondo = useCallback(() => {
    if (iniciado) return;
    setIniciado(true);
    fondo.play();
    fondo.fadeTo(0.3, 2000);
  }, [iniciado, fondo]);

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
