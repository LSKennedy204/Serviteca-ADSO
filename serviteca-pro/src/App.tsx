/**
 * src/App.tsx
 * Raíz de la aplicación: router completo con todas las páginas.
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { type ReactNode } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';

// ── Páginas ───────────────────────────────────────────────────────────────
import Login             from './pages/Login';
import Dashboard         from './pages/Dashboard';
import AgregarCliente    from './pages/clientes/AgregarCliente';
import ConsultarCliente  from './pages/clientes/ConsultarCliente';
import ListarClientes    from './pages/clientes/ListarClientes';
import AgregarCarro      from './pages/carros/AgregarCarro';
import ConsultarCarro    from './pages/carros/ConsultarCarro';
import ListarCarros      from './pages/carros/ListarCarros';
import AgregarServicio   from './pages/servicios/AgregarServicio';
import ConsultarServicio from './pages/servicios/ConsultarServicio';
import ListarServicios   from './pages/servicios/ListarServicios';
import Ayuda             from './pages/ayuda/Ayuda';

// ── Guard de ruta protegida ───────────────────────────────────────────────

function RutaProtegida({ children }: { children: ReactNode }) {
  const { estaAutenticado, cargando } = useAuth();

  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center"
           style={{ backgroundColor: '#0F0F10' }}>
        <div className="w-8 h-8 border-4 border-yellow-400 border-t-transparent
                        rounded-full animate-spin" />
      </div>
    );
  }

  if (!estaAutenticado) return <Navigate to="/login" replace />;
  return <Layout>{children}</Layout>;
}

// ── Rutas ─────────────────────────────────────────────────────────────────

function AppRoutes() {
  const { estaAutenticado, cargando } = useAuth();

  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center"
           style={{ backgroundColor: '#0F0F10' }}>
        <div className="w-8 h-8 border-4 border-yellow-400 border-t-transparent
                        rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <Routes>
      {/* Pública */}
      <Route
        path="/login"
        element={estaAutenticado ? <Navigate to="/inicio" replace /> : <Login />}
      />

      {/* Inicio */}
      <Route path="/inicio" element={
        <RutaProtegida><Dashboard /></RutaProtegida>
      } />

      {/* Clientes */}
      <Route path="/clientes/agregar"   element={<RutaProtegida><AgregarCliente   /></RutaProtegida>} />
      <Route path="/clientes/consultar" element={<RutaProtegida><ConsultarCliente /></RutaProtegida>} />
      <Route path="/clientes/listar"    element={<RutaProtegida><ListarClientes   /></RutaProtegida>} />

      {/* Carros */}
      <Route path="/carros/agregar"     element={<RutaProtegida><AgregarCarro    /></RutaProtegida>} />
      <Route path="/carros/consultar"   element={<RutaProtegida><ConsultarCarro  /></RutaProtegida>} />
      <Route path="/carros/listar"      element={<RutaProtegida><ListarCarros    /></RutaProtegida>} />

      {/* Servicios */}
      <Route path="/servicios/agregar"   element={<RutaProtegida><AgregarServicio   /></RutaProtegida>} />
      <Route path="/servicios/consultar" element={<RutaProtegida><ConsultarServicio /></RutaProtegida>} />
      <Route path="/servicios/listar"    element={<RutaProtegida><ListarServicios   /></RutaProtegida>} />

      {/* Ayuda */}
      <Route path="/ayuda" element={<RutaProtegida><Ayuda /></RutaProtegida>} />

      {/* Redireccionamientos */}
      <Route path="/"  element={<Navigate to="/login"  replace />} />
      <Route path="*"  element={<Navigate to="/login"  replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
