/**
 * src/pages/carros/AgregarCarro.tsx
 * Formulario para registrar un nuevo carro.
 * La placa se convierte automáticamente a mayúsculas y se eliminan espacios.
 */

import { useState, type FormEvent, type ChangeEvent } from 'react';
import { Link } from 'react-router-dom';
import { Car, Eraser, List, ArrowLeft } from 'lucide-react';
import { carrosApi } from '../../services/api';
import Breadcrumb from '../../components/Breadcrumb';
import AlertMessage from '../../components/AlertMessage';
import type { TipoAlerta } from '../../types';

interface Alerta { tipo: TipoAlerta; mensaje: string }

const VACIO = { placa: '', marca: '', modelo: '' };

export default function AgregarCarro() {
  const [form,     setForm]     = useState(VACIO);
  const [cargando, setCargando] = useState(false);
  const [alerta,   setAlerta]   = useState<Alerta | null>(null);

  const cambiarPlaca = (e: ChangeEvent<HTMLInputElement>) => {
    // Normalizar en tiempo real: mayúsculas y sin espacios
    const val = e.target.value.toUpperCase().replace(/\s+/g, '');
    setForm(p => ({ ...p, placa: val }));
    setAlerta(null);
  };

  const cambiar = (campo: 'marca' | 'modelo') =>
    (e: ChangeEvent<HTMLInputElement>) => {
      setForm(p => ({ ...p, [campo]: e.target.value }));
      setAlerta(null);
    };

  const limpiar = () => { setForm(VACIO); setAlerta(null); };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setAlerta(null);

    if (!form.placa.trim() || !form.marca.trim() || !form.modelo.trim()) {
      setAlerta({ tipo: 'error', mensaje: 'Todos los campos son obligatorios.' });
      return;
    }

    setCargando(true);
    try {
      const res = await carrosApi.crear({
        placa:  form.placa.trim(),
        marca:  form.marca.trim(),
        modelo: form.modelo.trim(),
      });

      if (res.ok) {
        setAlerta({ tipo: 'exito', mensaje: 'Carro registrado correctamente.' });
        setForm(VACIO);
      } else {
        setAlerta({ tipo: 'error', mensaje: res.error ?? 'Error al registrar el carro.' });
      }
    } catch {
      setAlerta({ tipo: 'error', mensaje: 'Error de conexión con el servidor.' });
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      <Breadcrumb migas={[{ label: 'Carros', to: '/carros/listar' }, { label: 'Agregar' }]} />

      <div className="flex items-center gap-3 mb-6">
        <Link to="/carros/listar" className="text-slate-400 hover:text-yellow-400 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Car size={22} className="text-yellow-400" />
            Agregar Carro
          </h1>
          <p className="text-slate-400 text-sm">Registra un nuevo vehículo en el sistema</p>
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

            {/* Placa */}
            <div>
              <label htmlFor="placa" className="block text-sm font-medium text-slate-300 mb-1.5">
                Placa <span className="text-yellow-400">*</span>
                <span className="text-slate-500 font-normal ml-1">(3 letras + 3 números, ej: ABC123)</span>
              </label>
              <input
                id="placa"
                type="text"
                value={form.placa}
                onChange={cambiarPlaca}
                disabled={cargando}
                maxLength={6}
                placeholder="ABC123"
                className="w-full px-4 py-3 rounded-xl text-yellow-400 font-mono font-bold
                           placeholder-slate-500 text-sm border border-slate-600
                           focus:border-yellow-400 focus:outline-none transition-colors
                           disabled:opacity-60 tracking-widest uppercase"
                style={{ backgroundColor: '#0F0F10' }}
              />
            </div>

            {/* Marca */}
            <div>
              <label htmlFor="marca" className="block text-sm font-medium text-slate-300 mb-1.5">
                Marca <span className="text-yellow-400">*</span>
              </label>
              <input
                id="marca"
                type="text"
                value={form.marca}
                onChange={cambiar('marca')}
                disabled={cargando}
                placeholder="Ej: Toyota"
                className="w-full px-4 py-3 rounded-xl text-white placeholder-slate-500 text-sm
                           border border-slate-600 focus:border-yellow-400 focus:outline-none
                           transition-colors disabled:opacity-60"
                style={{ backgroundColor: '#0F0F10' }}
              />
            </div>

            {/* Modelo */}
            <div>
              <label htmlFor="modelo" className="block text-sm font-medium text-slate-300 mb-1.5">
                Modelo <span className="text-yellow-400">*</span>
              </label>
              <input
                id="modelo"
                type="text"
                value={form.modelo}
                onChange={cambiar('modelo')}
                disabled={cargando}
                placeholder="Ej: Corolla 2020"
                className="w-full px-4 py-3 rounded-xl text-white placeholder-slate-500 text-sm
                           border border-slate-600 focus:border-yellow-400 focus:outline-none
                           transition-colors disabled:opacity-60"
                style={{ backgroundColor: '#0F0F10' }}
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="submit"
              disabled={cargando}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl
                         text-sm font-bold transition-opacity disabled:opacity-50 min-h-[44px]"
              style={{ backgroundColor: '#FACC15', color: '#0F0F10' }}
            >
              {cargando ? <><Spinner /> Guardando...</> : <><Car size={16} /> Guardar</>}
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

      <div className="mt-4 text-center">
        <Link to="/carros/listar"
          className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-yellow-400 transition-colors">
          <List size={15} /> Ver Listado de Carros
        </Link>
      </div>
    </div>
  );
}

function Spinner() {
  return <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin inline-block" />;
}
