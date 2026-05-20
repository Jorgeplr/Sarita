import { useContext } from "react";
import { AudioCtx } from "./audio-context-object";

export function useAudio() {
  const ctx = useContext(AudioCtx);
  if (!ctx) throw new Error("useAudio debe usarse dentro de AudioProvider");
  return ctx;
}
