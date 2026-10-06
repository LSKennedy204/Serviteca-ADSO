/**
 * src/pages/carros/ListarCarros.tsx
 * Lista todos los carros con filtro en tiempo real.
 * Cada fila tiene un botón "Historial" que lleva a la consulta de servicios.
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Car, PlusCircle, RefreshCw, Search, History } from 'lucide-react';
import { carrosApi } from '../../services/api';
import Breadcrumb from '../../components/Breadcrumb';
import AlertMessage from '../../components/AlertMessage';
import type { Carro } from '../../types';

function fechaDDMMAAAA(f: string) {
  if (!f) return '';
  const [y, m, d] = f.slice(0, 10).split('-');
  return `${d}/${m}/${y}`;
}

export default function ListarCarros() {
  const [carros,   setCarros]   = useState<Carro[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error,    setError]    = useState('');
  const [filtro,   setFiltro]   = useState('');
  const navigate = useNavigate();

  const cargar = useCallback(async () => {
    setCargando(true);
    setError('');
    try {
      const res = await carrosApi.listar();
      if (res.ok && res.data) setCarros(res.data);
      else setError(res.error ?? 'No se pudo cargar la lista.');
    } catch {
      setError('Error de conexión.');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const filtrados = useMemo(() => {
    const q = filtro.trim().toLowerCase();
    if (!q) return carros;
    return carros.filter(c =>
      c.placa.toLowerCase().includes(q)  ||
      c.marca.toLowerCase().includes(q)  ||
      c.modelo.toLowerCase().includes(q)
    );
  }, [carros, filtro]);

  return (
    <div className="max-w-5xl mx-auto">
      <Breadcrumb migas={[{ label: 'Carros' }, { label: 'Listar' }]} />

      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Car size={22} className="text-yellow-400" />
          Listado de Carros
        </h1>
        <div className="flex gap-2">
          <button
            onClick={cargar}
            disabled={cargando}
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold
                       border border-slate-600 text-slate-300 hover:bg-slate-700
                       transition-colors disabled:opacity-50 min-h-[44px]"
          >
            <RefreshCw size={15} className={cargando ? 'animate-spin' : ''} />
            Recargar
          </button>
          <Link
            to="/carros/agregar"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold
                       min-h-[44px] transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#FACC15', color: '#0F0F10' }}
          >
            <PlusCircle size={15} /> Agregar
          </Link>
        </div>
      </div>

      {error && (
        <AlertMessage tipo="error" mensaje={error} onCerrar={() => setError('')} className="mb-4" />
      )}

      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          type="text"
          value={filtro}
          onChange={e => setFiltro(e.target.value)}
          placeholder="Filtrar por placa, marca o modelo..."
          className="w-full pl-9 pr-4 py-3 rounded-xl text-white placeholder-slate-500 text-sm
                     border border-slate-600 focus:border-yellow-400 focus:outline-none transition-colors"
          style={{ backgroundColor: '#1E293B' }}
        />
      </div>

      {!cargando && (
        <p className="text-xs text-slate-500 mb-3">
          Mostrando <span className="text-slate-300 font-semibold">{filtrados.length}</span> de{' '}
          <span className="text-slate-300 font-semibold">{carros.length}</span> carros
        </p>
      )}

      <div className="rounded-2xl border border-slate-700 overflow-hidden" style={{ backgroundColor: '#1E293B' }}>
        {cargando ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : carros.length === 0 ? (
          <div className="text-center py-12">
            <Car size={40} className="text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 mb-3">No hay carros registrados.</p>
            <Link to="/carros/agregar"
              className="inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2.5 rounded-xl"
              style={{ backgroundColor: '#FACC15', color: '#0F0F10' }}>
              <PlusCircle size={15} /> Agregar el primer carro
            </Link>
          </div>
        ) : filtrados.length === 0 ? (
          <div className="text-center py-12">
            <Search size={32} className="text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">No se encontraron carros que coincidan con "{filtro}".</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-700">
                <tr>
                  {['Placa', 'Marca', 'Modelo', 'Registrado', 'Historial'].map(h => (
                    <th key={h} className="text-left text-slate-400 font-medium px-4 py-3 whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtrados.map(c => (
                  <tr key={c.id}
                    className="border-b border-slate-800 last:border-0 hover:bg-slate-700/30 transition-colors">
                    <td className="px-4 py-3 font-mono text-yellow-400 font-bold tracking-widest">
                      {c.placa}
                    </td>
                    <td className="px-4 py-3 text-white">{c.marca}</td>
                    <td className="px-4 py-3 text-slate-300">{c.modelo}</td>
                    <td className="px-4 py-3 text-slate-400 whitespace-nowrap">
                      {fechaDDMMAAAA(c.creado_en)}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => navigate('/servicios/consultar', { state: { placa: c.placa } })}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
                                   border border-slate-600 text-slate-300 hover:bg-slate-600
                                   transition-colors min-h-[36px]"
                      >
                        <History size={13} /> Historial
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
