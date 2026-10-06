/**
 * src/pages/clientes/AgregarCliente.tsx
 * Formulario para registrar un nuevo cliente.
 */

import { useState, type FormEvent, type ChangeEvent, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { UserPlus, Eraser, List, ArrowLeft } from 'lucide-react';
import { clientesApi } from '../../services/api';
import Breadcrumb from '../../components/Breadcrumb';
import AlertMessage from '../../components/AlertMessage';
import type { TipoAlerta } from '../../types';

interface Alerta { tipo: TipoAlerta; mensaje: string }

const VACIO = {
  identificacion: '',
  nombres: '',
  apellidos: '',
  correo: '',
  celular: '',
};

export default function AgregarCliente() {
  const [form,     setForm]     = useState(VACIO);
  const [cargando, setCargando] = useState(false);
  const [alerta,   setAlerta]   = useState<Alerta | null>(null);

  const cambiar = (campo: keyof typeof VACIO) =>
    (e: ChangeEvent<HTMLInputElement>) => {
      setForm(p => ({ ...p, [campo]: e.target.value }));
      setAlerta(null);
    };

  const limpiar = () => {
    setForm(VACIO);
    setAlerta(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setAlerta(null);

    // Validación local básica (el servidor valida en profundidad)
    const { identificacion, nombres, apellidos, correo, celular } = form;
    if (!identificacion.trim() || !nombres.trim() || !apellidos.trim() ||
        !correo.trim() || !celular.trim()) {
      setAlerta({ tipo: 'error', mensaje: 'Todos los campos son obligatorios.' });
      return;
    }

    setCargando(true);
    try {
      const res = await clientesApi.crear({
        identificacion: identificacion.trim(),
        nombres:        nombres.trim(),
        apellidos:      apellidos.trim(),
        correo:         correo.trim().toLowerCase(),
        celular:        celular.trim(),
      });

      if (res.ok) {
        setAlerta({ tipo: 'exito', mensaje: 'Cliente registrado correctamente.' });
        setForm(VACIO);
      } else {
        setAlerta({ tipo: 'error', mensaje: res.error ?? 'Error al registrar el cliente.' });
      }
    } catch {
      setAlerta({ tipo: 'error', mensaje: 'Error de conexión con el servidor.' });
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      <Breadcrumb migas={[{ label: 'Clientes', to: '/clientes/listar' }, { label: 'Agregar' }]} />

      <div className="flex items-center gap-3 mb-6">
        <Link to="/clientes/listar" className="text-slate-400 hover:text-yellow-400 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <UserPlus size={22} className="text-yellow-400" />
            Agregar Cliente
          </h1>
          <p className="text-slate-400 text-sm">Registra un nuevo cliente en el sistema</p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-700 p-6" style={{ backgroundColor: '#1E293B' }}>
        {alerta && (
          <AlertMessage
            tipo={alerta.tipo}
            mensaje={alerta.mensaje}
            onCerrar={() => setAlerta(null)}
            className="mb-5"
          />
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="grid grid-cols-1 gap-4">

            {/* Identificación */}
            <Campo label="Identificación" id="identificacion" requerido>
              <input
                id="identificacion"
                type="text"
                value={form.identificacion}
                onChange={cambiar('identificacion')}
                disabled={cargando}
                placeholder="Ej: 1001234567"
                className={estiloInput}
              />
            </Campo>

            {/* Nombres */}
            <Campo label="Nombres" id="nombres" requerido>
              <input
                id="nombres"
                type="text"
                value={form.nombres}
                onChange={cambiar('nombres')}
                disabled={cargando}
                placeholder="Ej: Juan Carlos"
                className={estiloInput}
              />
            </Campo>

            {/* Apellidos */}
            <Campo label="Apellidos" id="apellidos" requerido>
              <input
                id="apellidos"
                type="text"
                value={form.apellidos}
                onChange={cambiar('apellidos')}
                disabled={cargando}
                placeholder="Ej: Pérez Gómez"
                className={estiloInput}
              />
            </Campo>

            {/* Correo */}
            <Campo label="Correo electrónico" id="correo" requerido>
              <input
                id="correo"
                type="email"
                value={form.correo}
                onChange={cambiar('correo')}
                disabled={cargando}
                placeholder="Ej: juan@correo.com"
                className={estiloInput}
              />
            </Campo>

            {/* Celular */}
            <Campo label="Celular" id="celular" requerido hint="10 dígitos">
              <input
                id="celular"
                type="tel"
                inputMode="numeric"
                maxLength={10}
                value={form.celular}
                onChange={cambiar('celular')}
                disabled={cargando}
                placeholder="Ej: 3001234567"
                className={estiloInput}
              />
            </Campo>
          </div>

          {/* Botones */}
          <div className="flex gap-3 mt-6">
            <button
              type="submit"
              disabled={cargando}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl
                         text-sm font-bold transition-opacity disabled:opacity-50 min-h-[44px]"
              style={{ backgroundColor: '#FACC15', color: '#0F0F10' }}
            >
              {cargando ? (
                <><Spinner /> Guardando...</>
              ) : (
                <><UserPlus size={16} /> Guardar</>
              )}
            </button>
            <button
              type="button"
              onClick={limpiar}
              disabled={cargando}
              className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold
                         border border-slate-600 text-slate-300 hover:bg-slate-700
                         transition-colors disabled:opacity-50 min-h-[44px]"
            >
              <Eraser size={16} /> Limpiar
            </button>
          </div>
        </form>
      </div>

      {/* Enlace al listado */}
      <div className="mt-4 text-center">
        <Link
          to="/clientes/listar"
          className="inline-flex items-center gap-1.5 text-sm text-slate-400
                     hover:text-yellow-400 transition-colors"
        >
          <List size={15} /> Ver Listado de Clientes
        </Link>
      </div>
    </div>
  );
}

// ── Helpers de UI ──────────────────────────────────────────────────────────

const estiloInput =
  `w-full px-4 py-3 rounded-xl text-white placeholder-slate-500 text-sm
   border border-slate-600 focus:border-yellow-400 focus:outline-none
   transition-colors disabled:opacity-60`
  .replace(/\s+/g, ' ');

function Campo({
  label, id, requerido, hint, children,
}: {
  label: string; id: string; requerido?: boolean; hint?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-slate-300 mb-1.5">
        {label}{requerido && <span className="text-yellow-400 ml-1">*</span>}
        {hint && <span className="text-slate-500 font-normal ml-1">({hint})</span>}
      </label>
      <div style={{ backgroundColor: '#0F0F10' }} className="rounded-xl">
        {children}
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <span className="w-4 h-4 border-2 border-current border-t-transparent
                     rounded-full animate-spin inline-block" />
  );
}
