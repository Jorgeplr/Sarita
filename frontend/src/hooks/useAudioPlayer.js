import { useEffect, useRef, useState } from "react";

export function useAudioPlayer(src, { loop = false, initialVolume = 0.5 } = {}) {
  const audioRef = useRef(null);
  const fadeRafRef = useRef(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (!src) {
      audioRef.current = null;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsPlaying(false);
      setProgress(0);
      setDuration(0);
      return;
    }

    const audio = new Audio();
    audio.loop = loop;
    audio.volume = initialVolume;
    audio.preload = "auto";
    audio.src = src;
    audioRef.current = audio;

    const onTimeUpdate = () => setProgress(audio.currentTime);
    const onLoaded = () => setDuration(audio.duration || 0);
    const onEnded = () => {
      if (!loop) setIsPlaying(false);
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoaded);
    audio.addEventListener("ended", onEnded);

    return () => {
      cancelAnimationFrame(fadeRafRef.current);
      audio.pause();
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoaded);
      audio.removeEventListener("ended", onEnded);
      audio.src = "";
      audioRef.current = null;
    };
  }, [src, loop, initialVolume]);

  const play = () => {
    if (!audioRef.current) return;
    audioRef.current.play().catch(() => {});
    setIsPlaying(true);
  };

  const pause = () => {
    audioRef.current?.pause();
    setIsPlaying(false);
  };

  const toggle = () => (isPlaying ? pause() : play());

  const setVolume = (v) => {
    if (audioRef.current) audioRef.current.volume = v;
  };

  const setMuted = (m) => {
    if (audioRef.current) audioRef.current.muted = m;
  };

  const fadeTo = (target, ms = 1000) => {
    if (!audioRef.current) return;
    cancelAnimationFrame(fadeRafRef.current);
    const start = audioRef.current.volume;
    const startTime = performance.now();
    const step = (now) => {
      if (!audioRef.current) return;
      const t = Math.min(1, (now - startTime) / ms);
      audioRef.current.volume = start + (target - start) * t;
      if (t < 1) {
        fadeRafRef.current = requestAnimationFrame(step);
      }
    };
    fadeRafRef.current = requestAnimationFrame(step);
  };

  return { isPlaying, play, pause, toggle, setVolume, setMuted, fadeTo, progress, duration };
}
