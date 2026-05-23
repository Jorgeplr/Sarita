import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Visitas from "./pages/Visitas";
import Respuestas from "./pages/Respuestas";
import Cualidades from "./pages/Cualidades";
import MediaFotos from "./pages/MediaFotos";
import MediaCanciones from "./pages/MediaCanciones";
import Configuracion from "./pages/Configuracion";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/visitas" element={<Visitas />} />
        <Route path="/respuestas" element={<Respuestas />} />
        <Route path="/cualidades" element={<Cualidades />} />
        <Route path="/media/fotos" element={<MediaFotos />} />
        <Route path="/media/canciones" element={<MediaCanciones />} />
        <Route path="/configuracion" element={<Configuracion />} />
      </Route>
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
