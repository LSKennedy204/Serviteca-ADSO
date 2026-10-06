/**
 * src/pages/Login.tsx
 * Pantalla de inicio de sesión.
 * - Campo de usuario y contraseña con botón "ojo" para mostrar/ocultar.
 * - Validación local: muestra "Complete todos los campos." si hay campos vacíos.
 * - Durante la petición el botón dice "Validando credenciales..." y se deshabilita.
 * - En etapa de pruebas muestra las credenciales y un botón "Autocompletar".
 */

import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../services/api';
import AlertMessage from '../components/AlertMessage';

export default function Login() {
  const [usuario,   setUsuario]   = useState('');
  const [password,  setPassword]  = useState('');
  const [verPass,   setVerPass]   = useState(false);
  const [cargando,  setCargando]  = useState(false);
  const [error,     setError]     = useState('');

  const { iniciarSesion } = useAuth();
  const navigate          = useNavigate();

  const limpiarError = () => setError('');

  const autocompletar = () => {
    setUsuario('admin');
    setPassword('admin123');
    setError('');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!usuario.trim() || !password.trim()) {
      setError('Complete todos los campos.');
      return;
    }

    setCargando(true);
    try {
      const res = await authApi.login(usuario.trim(), password);
      if (res.ok && res.data) {
        iniciarSesion(res.data);
        navigate('/inicio', { replace: true });
      } else {
        setError(res.error ?? 'Error al iniciar sesión.');
      }
    } catch {
      setError('No se pudo conectar con el servidor.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4"
      style={{ backgroundColor: '#0F0F10' }}
    >
      {/* Tarjeta */}
      <div
        className="w-full max-w-sm rounded-2xl p-8 shadow-2xl"
        style={{ backgroundColor: '#1E293B' }}
      >
        {/* Logo y título */}
        <div className="text-center mb-8">
          <img src="/logo.svg" alt="Serviteca PRO" className="h-12 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white">Serviteca PRO</h1>
          <p className="text-slate-400 text-sm mt-1">
            Sistema de gestión para servitecas
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} noValidate>
          {error && (
            <AlertMessage
              tipo="error"
              mensaje={error}
              onCerrar={limpiarError}
              className="mb-4"
            />
          )}

          {/* Usuario */}
          <div className="mb-4">
            <label htmlFor="usuario" className="block text-sm font-medium text-slate-300 mb-1.5">
              Usuario <span className="text-yellow-400">*</span>
            </label>
            <input
              id="usuario"
              type="text"
              value={usuario}
              onChange={e => { setUsuario(e.target.value); limpiarError(); }}
              autoComplete="username"
              autoFocus
              disabled={cargando}
              placeholder="Ingrese su usuario"
              className="w-full px-4 py-3 rounded-xl text-white placeholder-slate-500
                         border border-slate-600 focus:border-yellow-400 focus:outline-none
                         transition-colors text-sm disabled:opacity-60"
              style={{ backgroundColor: '#0F0F10' }}
            />
          </div>

          {/* Contraseña */}
          <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-1.5">
              Contraseña <span className="text-yellow-400">*</span>
            </label>
            <div className="relative">
              <input
                id="password"
                type={verPass ? 'text' : 'password'}
                value={password}
                onChange={e => { setPassword(e.target.value); limpiarError(); }}
                autoComplete="current-password"
                disabled={cargando}
                placeholder="Ingrese su contraseña"
                className="w-full px-4 py-3 pr-11 rounded-xl text-white placeholder-slate-500
                           border border-slate-600 focus:border-yellow-400 focus:outline-none
                           transition-colors text-sm disabled:opacity-60"
                style={{ backgroundColor: '#0F0F10' }}
              />
              <button
                type="button"
                onClick={() => setVerPass(p => !p)}
                aria-label={verPass ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400
                           hover:text-white transition-colors p-1"
              >
                {verPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Botón ingresar */}
          <button
            type="submit"
            disabled={cargando}
            className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center
                       gap-2 transition-opacity disabled:opacity-60 min-h-[48px]"
            style={{ backgroundColor: '#FACC15', color: '#0F0F10' }}
          >
            {cargando ? (
              <>
                <span className="w-4 h-4 border-2 border-current border-t-transparent
                                 rounded-full animate-spin" />
                Validando credenciales...
              </>
            ) : (
              <>
                <LogIn size={18} />
                Ingresar
              </>
            )}
          </button>
        </form>

        {/* Credenciales de prueba */}
        <div
          className="mt-6 p-4 rounded-xl border border-slate-700 text-xs"
          style={{ backgroundColor: '#0F0F10' }}
        >
          <p className="text-slate-400 font-semibold mb-2 uppercase tracking-wide">
            Credenciales de prueba
          </p>
          <div className="space-y-1 text-slate-400 mb-3">
            <div className="flex justify-between">
              <span>Usuario:</span>
              <span className="text-yellow-400 font-mono">admin</span>
            </div>
            <div className="flex justify-between">
              <span>Contraseña:</span>
              <span className="text-yellow-400 font-mono">admin123</span>
            </div>
          </div>
          <button
            type="button"
            onClick={autocompletar}
            disabled={cargando}
            className="w-full py-2 rounded-lg text-xs font-semibold border border-slate-600
                       text-slate-300 hover:bg-slate-700 transition-colors disabled:opacity-50"
          >
            Autocompletar
          </button>
        </div>
      </div>

      <p className="mt-6 text-slate-600 text-xs text-center">
        Proyecto Formativo SENA · Tecnólogo ADSO
      </p>
    </div>
  );
}
