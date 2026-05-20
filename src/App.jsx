import { AudioProvider } from "./context/AudioContext";
import Intro from "./sections/Intro";
import Galeria from "./sections/Galeria";
import BotonAudio from "./components/BotonAudio";

export default function App() {
  return (
    <AudioProvider>
      <Intro />
      <Galeria />
      <BotonAudio />
    </AudioProvider>
  );
}
