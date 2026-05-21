import { useEffect } from "react";
import { AudioProvider } from "./context/AudioContext";
import Intro from "./sections/Intro";
import Galeria from "./sections/Galeria";
import RazonesYLoki from "./sections/RazonesYLoki";
import FinalYPlaylist from "./sections/FinalYPlaylist";
import BotonAudio from "./components/BotonAudio";
import { logVisit } from "./lib/api";

export default function App() {
  useEffect(() => {
    logVisit();
  }, []);

  return (
    <AudioProvider>
      <Intro />
      <Galeria />
      <RazonesYLoki />
      <FinalYPlaylist />
      <BotonAudio />
    </AudioProvider>
  );
}
