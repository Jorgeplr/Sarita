import { useState, useCallback, useEffect, useRef } from "react";
import { useAudioPlayer } from "../hooks/useAudioPlayer";
import { AudioCtx } from "./audio-context-object";
import { useContent } from "../lib/useContent";
import { localFondo } from "../data/playlist";

const FONDO_VOLUME = 0.3;
const FONDO_FADE_IN_MS = 1500;
const FONDO_PAUSE_FADE_MS = 250;

export function AudioProvider({ children }) {
  const { data: fondoData } = useContent("fondo");
  const fondoSrc = fondoData?.url ?? localFondo.url;
  const fondo = useAudioPlayer(fondoSrc, { loop: true, initialVolume: 0 });
  const [muted, setMuted] = useState(false);
  const [iniciado, setIniciado] = useState(false);
  const playlistAudioRef = useRef(null);
  const pauseTimeoutRef = useRef(null);

  const playFondo = useCallback(
    (fadeMs) => {
      if (!fondoSrc) return;
      if (playlistAudioRef.current) return;
      fondo.setMuted(muted);
      fondo.play();
      fondo.fadeTo(FONDO_VOLUME, fadeMs);
    },
    [fondoSrc, fondo, muted]
  );

  const iniciarFondo = useCallback(() => {
    if (iniciado) return;
    setIniciado(true);
    playFondo(FONDO_FADE_IN_MS);
  }, [iniciado, playFondo]);

  useEffect(() => {
    if (!iniciado) return;
    playFondo(FONDO_FADE_IN_MS);
  }, [fondoSrc, iniciado, playFondo]);

  const registerPlaylistAudio = useCallback(
    (audio) => {
      if (pauseTimeoutRef.current) {
        clearTimeout(pauseTimeoutRef.current);
        pauseTimeoutRef.current = null;
      }
      playlistAudioRef.current = audio;
      if (audio) {
        audio.muted = muted;
        fondo.fadeTo(0, FONDO_PAUSE_FADE_MS);
        pauseTimeoutRef.current = setTimeout(() => {
          fondo.pause();
          pauseTimeoutRef.current = null;
        }, FONDO_PAUSE_FADE_MS);
      } else if (iniciado) {
        playFondo(FONDO_FADE_IN_MS);
      }
    },
    [fondo, iniciado, muted, playFondo]
  );

  const toggleMute = useCallback(() => {
    setMuted((m) => {
      const next = !m;
      fondo.setMuted(next);
      if (playlistAudioRef.current) {
        playlistAudioRef.current.muted = next;
      }
      return next;
    });
  }, [fondo]);

  return (
    <AudioCtx.Provider
      value={{
        iniciado,
        iniciarFondo,
        registerPlaylistAudio,
        muted,
        toggleMute,
      }}
    >
      {children}
    </AudioCtx.Provider>
  );
}
