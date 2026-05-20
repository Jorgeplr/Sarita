import { AudioProvider } from "./context/AudioContext";
import Intro from "./sections/Intro";
import BotonAudio from "./components/BotonAudio";

export default function App() {
  return (
    <AudioProvider>
      <Intro />
      <BotonAudio />
    </AudioProvider>
  );
}
