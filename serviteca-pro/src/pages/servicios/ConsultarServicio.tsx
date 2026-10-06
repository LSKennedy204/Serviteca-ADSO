/**
 * src/pages/servicios/ConsultarServicio.tsx
 * Consulta el historial de servicios de un carro por placa.
 * Acepta state de navegación: { placa? } desde otras páginas.
 */

import { useState, useEffect, useCallback, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, ArrowLeft, PlusCircle, RefreshCw, List, Wrench } from 'lucide-react';
import { serviciosApi } from '../../services/api';
import Breadcrumb from '../../components/Breadcrumb';
import AlertMessage from '../../components/AlertMessage';
import type { HistorialCarro } from '../../types';

function fechaDDMMAAAA(f: string) {
  if (!f) return '';
  const [y, m, d] = f.slice(0, 10).split('-');
  return `${d}/${m}/${y}`;
}

export default function ConsultarServicio() {
  const navState = (useLocation().state ?? {}) as { placa?: string };
  const [placa,     setPlaca]     = useState(navState.placa ?? '');
  const [historial, setHistorial] = useState<HistorialCarro | null>(null);
  const [cargando,  setCargando]  = useState(false);
  const [error,     setError]     = useState('');
  const navigate = useNavigate();

  const buscar = useCallback(async (p: string) => {
    const val = p.trim().toUpperCase().replace(/\s+/g, '');
    if (!val) return;
    setError('');
    setHistorial(null);
    setCargando(true);
    try {
      const res = await serviciosApi.porCarro(val);
      if (res.ok && res.data) {
        setHistorial(res.data);
      } else {
        setError(res.error ?? 'No se encontró información.');
      }
    } catch {
      setError('Error de conexión.');
    } finally {
      setCargando(false);
    }
  }, []);

  // Si llega con state, buscar inmediatamente
  useEffect(() => {
    if (navState.placa) buscar(navState.placa);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!placa.trim()) {
      setError('Ingrese una placa para consultar.');
      return;
    }
    buscar(placa);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <Breadcrumb migas={[{ label: 'Servicios', to: '/servicios/listar' }, { label: 'Consultar' }]} />

      <div className="flex items-center gap-3 mb-6">
        <Link to="/servicios/listar" className="text-slate-400 hover:text-yellow-400 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Search size={22} className="text-yellow-400" />
            Consultar Servicios por Carro
          </h1>
          <p className="text-slate-400 text-sm">Historial de servicios de un vehículo</p>
        </div>
      </div>

      {/* Búsqueda */}
      <div className="rounded-2xl border border-slate-700 p-6 mb-4" style={{ backgroundColor: '#1E293B' }}>
        <form onSubmit={handleSubmit} className="flex gap-3">
          <div className="flex-1">
            <label htmlFor="hPlaca" className="block text-sm font-medium text-slate-300 mb-1.5">
              Placa del vehículo <span className="text-yellow-400">*</span>
            </label>
            <input
              id="hPlaca"
              type="text"
              value={placa}
              onChange={e => { setPlaca(e.target.value.toUpperCase().replace(/\s+/g, '')); setError(''); setHistorial(null); }}
              disabled={cargando}
              maxLength={6}
              placeholder="ABC123"
              className="w-full px-4 py-3 rounded-xl text-yellow-400 font-mono font-bold
                         placeholder-slate-500 text-sm border border-slate-600
                         focus:border-yellow-400 focus:outline-none transition-colors
                         disabled:opacity-60 tracking-widest"
              style={{ backgroundColor: '#0F0F10' }}
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={cargando}
              className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold
                         transition-opacity disabled:opacity-50 min-h-[48px]"
              style={{ backgroundColor: '#3B82F6', color: '#fff' }}
            >
              {cargando ? <><Spinner /> Consultando...</> : <><Search size={16} /> Consultar</>}
            </button>
          </div>
        </form>

        {error && (
          <AlertMessage tipo="error" mensaje={error} onCerrar={() => setError('')} className="mt-4" />
        )}
      </div>

      {/* Resultado */}
      {historial && (
        <div className="animate-fade-in">
          {/* Info del carro */}
          <div className="rounded-2xl border border-slate-700 p-5 mb-4" style={{ backgroundColor: '#1E293B' }}>
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <span className="text-2xl font-mono font-bold text-yellow-400 tracking-widest">
                  {historial.placa}
                </span>
                <p className="text-slate-300 text-sm mt-0.5">
                  {historial.marca} · {historial.modelo}
                </p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-white">{historial.total}</p>
                <p className="text-slate-400 text-xs">
                  {historial.total === 1 ? 'servicio' : 'servicios'}
                </p>
              </div>
            </div>
          </div>

          {/* Tabla de servicios */}
          {historial.servicios.length === 0 ? (
            <div className="rounded-2xl border border-slate-700 p-8 text-center" style={{ backgroundColor: '#1E293B' }}>
              <Wrench size={36} className="text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400 mb-4">El carro no tiene servicios registrados.</p>
              <button
                onClick={() => navigate('/servicios/agregar', { state: { placa: historial.placa } })}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold"
                style={{ backgroundColor: '#FACC15', color: '#0F0F10' }}
              >
                <PlusCircle size={15} /> Agregar primer servicio
              </button>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-700 overflow-hidden" style={{ backgroundColor: '#1E293B' }}>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-slate-700">
                    <tr>
                      {['Placa', 'Servicio', 'Fecha', 'Cliente'].map(h => (
                        <th key={h} className="text-left text-slate-400 font-medium px-4 py-3 whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {historial.servicios.map(s => (
                      <tr key={s.id} className="border-b border-slate-800 last:border-0 hover:bg-slate-700/30 transition-colors">
                        <td className="px-4 py-3 font-mono text-yellow-400 font-bold tracking-widest">{s.placa}</td>
                        <td className="px-4 py-3">
                          <span className="px-2.5 py-1 rounded-full text-xs font-medium"
                            style={{ backgroundColor: '#0F0F10', color: '#FACC15' }}>
                            {s.tipo_servicio}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-300 whitespace-nowrap">{fechaDDMMAAAA(s.fecha)}</td>
                        <td className="px-4 py-3 text-slate-300 whitespace-nowrap">
                          {s.nombres} {s.apellidos}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Acciones */}
          <div className="flex flex-wrap gap-3 mt-4">
            <button
              onClick={() => navigate('/servicios/agregar', { state: { placa: historial.placa } })}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold
                         transition-opacity hover:opacity-90 min-h-[44px]"
              style={{ backgroundColor: '#FACC15', color: '#0F0F10' }}
            >
              <PlusCircle size={15} /> Agregar Servicio a este Carro
            </button>
            <button
              onClick={() => { setPlaca(''); setHistorial(null); setError(''); }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold
                         border border-slate-600 text-slate-300 hover:bg-slate-700
                         transition-colors min-h-[44px]"
            >
              <RefreshCw size={15} /> Consultar otra placa
            </button>
            <Link
              to="/servicios/listar"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold
                         border border-slate-600 text-slate-300 hover:bg-slate-700
                         transition-colors min-h-[44px]"
            >
              <List size={15} /> Ver todos los servicios
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

function Spinner() {
  return <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin inline-block" />;
}
