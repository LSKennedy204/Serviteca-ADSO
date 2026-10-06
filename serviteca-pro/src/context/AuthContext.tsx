/**
 * src/context/AuthContext.tsx
 * Contexto global de autenticación.
 * Persiste el token y datos del usuario en localStorage.
 * Si la API responde 401, api.ts limpia la sesión automáticamente.
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import type { Usuario, SesionUsuario } from '../types';
import { authApi } from '../services/api';

interface AuthContextType {
  usuario: Usuario | null;
  token: string | null;
  cargando: boolean;
  iniciarSesion: (sesion: SesionUsuario) => void;
  cerrarSesion: () => Promise<void>;
  estaAutenticado: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

const TOKEN_KEY = 'serviteca_token';
const USUARIO_KEY = 'serviteca_usuario';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);

  // Al montar, verificar si hay sesión guardada
  useEffect(() => {
    async function verificarSesion() {
      const tokenGuardado = localStorage.getItem(TOKEN_KEY);
      const usuarioGuardado = localStorage.getItem(USUARIO_KEY);

      if (!tokenGuardado || !usuarioGuardado) {
        setCargando(false);
        return;
      }

      // Verificar con el servidor que el token sigue vigente
      try {
        const res = await authApi.verify();
        if (res.ok && res.data) {
          setToken(tokenGuardado);
          setUsuario(res.data);
        } else {
          // Token inválido o expirado
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(USUARIO_KEY);
        }
      } catch {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USUARIO_KEY);
      } finally {
        setCargando(false);
      }
    }

    verificarSesion();
  }, []);

  const iniciarSesion = useCallback((sesion: SesionUsuario) => {
    localStorage.setItem(TOKEN_KEY, sesion.token);
    localStorage.setItem(USUARIO_KEY, JSON.stringify(sesion.usuario));
    setToken(sesion.token);
    setUsuario(sesion.usuario);
  }, []);

  const cerrarSesion = useCallback(async () => {
    const t = localStorage.getItem(TOKEN_KEY);
    if (t) {
      await authApi.logout(t);
    }
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USUARIO_KEY);
    setToken(null);
    setUsuario(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        usuario,
        token,
        cargando,
        iniciarSesion,
        cerrarSesion,
        estaAutenticado: !!token && !!usuario,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Hook personalizado
export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  }
  return ctx;
}
