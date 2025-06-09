import { Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import Loading from "../components/Loading";
import ProtectedRoute from "./ProtectedRoute";
import AdminRoute from "./AdminRoute";

// Lazy-loaded componentes
const Inicio = lazy(() => import("../pages/Home"));
const Login = lazy(() => import("../pages/Login"));
const Register = lazy(() => import("../pages/Register"));
const PerfilCliente = lazy(() => import("../pages/PerfilCliente"));
const PerfilVeterinario = lazy(() => import("../pages/PerfilVeterinario"));
const AdminVets = lazy(() => import("../pages/AdminVets"));

export default function AppRouter() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/" element={<Inicio />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Rutas protegidas - requieren autenticación */}
        <Route 
          path="/perfilcliente" 
          element={
            <ProtectedRoute>
              <PerfilCliente />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/perfilveterinario" 
          element={
            <ProtectedRoute>
              <PerfilVeterinario />
            </ProtectedRoute>
          } 
        />
        
        {/* Ruta de administración - requiere rol ADMIN */}
        <Route 
          path="/adminvets" 
          element={
            <AdminRoute>
              <AdminVets />
            </AdminRoute>
          } 
        />
      </Routes>
    </Suspense>
  );
}