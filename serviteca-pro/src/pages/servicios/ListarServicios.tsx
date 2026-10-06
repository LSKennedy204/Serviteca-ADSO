/**
 * src/pages/servicios/ListarServicios.tsx
 * Lista todos los servicios con filtro de texto y por tipo.
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Wrench, PlusCircle, RefreshCw, Search } from 'lucide-react';
import { serviciosApi } from '../../services/api';
import Breadcrumb from '../../components/Breadcrumb';
import AlertMessage from '../../components/AlertMessage';
import { TIPOS_SERVICIO, type Servicio } from '../../types';

function fechaDDMMAAAA(f: string) {
  if (!f) return '';
  const [y, m, d] = f.slice(0, 10).split('-');
  return `${d}/${m}/${y}`;
}

export default function ListarServicios() {
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [cargando,  setCargando]  = useState(true);
  const [error,     setError]     = useState('');
  const [filtro,    setFiltro]    = useState('');
  const [tipoFiltro, setTipoFiltro] = useState('');

  const cargar = useCallback(async () => {
    setCargando(true);
    setError('');
    try {
      const res = await serviciosApi.listar();
      if (res.ok && res.data) setServicios(res.data);
      else setError(res.error ?? 'No se pudo cargar la lista.');
    } catch {
      setError('Error de conexión.');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const filtrados = useMemo(() => {
    let lista = servicios;
    if (tipoFiltro) {
      lista = lista.filter(s => s.tipo_servicio === tipoFiltro);
    }
    const q = filtro.trim().toLowerCase();
    if (!q) return lista;
    return lista.filter(s =>
      s.placa.toLowerCase().includes(q)                             ||
      s.identificacion.toLowerCase().includes(q)                    ||
      (s.nombres  ?? '').toLowerCase().includes(q)                  ||
      (s.apellidos ?? '').toLowerCase().includes(q)                 ||
      (s.marca    ?? '').toLowerCase().includes(q)                  ||
      (s.modelo   ?? '').toLowerCase().includes(q)                  ||
      s.tipo_servicio.toLowerCase().includes(q)
    );
  }, [servicios, filtro, tipoFiltro]);

  return (
    <div className="max-w-5xl mx-auto">
      <Breadcrumb migas={[{ label: 'Servicios' }, { label: 'Listar' }]} />

      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Wrench size={22} className="text-yellow-400" />
          Listado de Servicios
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
            to="/servicios/agregar"
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

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={filtro}
            onChange={e => setFiltro(e.target.value)}
            placeholder="Filtrar por placa, cliente, marca, modelo..."
            className="w-full pl-9 pr-4 py-3 rounded-xl text-white placeholder-slate-500 text-sm
                       border border-slate-600 focus:border-yellow-400 focus:outline-none transition-colors"
            style={{ backgroundColor: '#1E293B' }}
          />
        </div>
        <select
          value={tipoFiltro}
          onChange={e => setTipoFiltro(e.target.value)}
          className="px-4 py-3 rounded-xl text-white text-sm border border-slate-600
                     focus:border-yellow-400 focus:outline-none transition-colors"
          style={{ backgroundColor: '#1E293B' }}
        >
          <option value="">Todos los tipos</option>
          {TIPOS_SERVICIO.map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      {!cargando && (
        <p className="text-xs text-slate-500 mb-3">
          Mostrando <span className="text-slate-300 font-semibold">{filtrados.length}</span> de{' '}
          <span className="text-slate-300 font-semibold">{servicios.length}</span> servicios
        </p>
      )}

      <div className="rounded-2xl border border-slate-700 overflow-hidden" style={{ backgroundColor: '#1E293B' }}>
        {cargando ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : servicios.length === 0 ? (
          <div className="text-center py-12">
            <Wrench size={40} className="text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 mb-3">No hay servicios registrados.</p>
            <Link to="/servicios/agregar"
              className="inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2.5 rounded-xl"
              style={{ backgroundColor: '#FACC15', color: '#0F0F10' }}>
              <PlusCircle size={15} /> Registrar el primer servicio
            </Link>
          </div>
        ) : filtrados.length === 0 ? (
          <div className="text-center py-12">
            <Search size={32} className="text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">No se encontraron servicios que coincidan con los filtros.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-700">
                <tr>
                  {['Placa', 'Vehículo', 'Cliente', 'Fecha', 'Servicio'].map(h => (
                    <th key={h} className="text-left text-slate-400 font-medium px-4 py-3 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtrados.map(s => (
                  <tr key={s.id}
                    className="border-b border-slate-800 last:border-0 hover:bg-slate-700/30 transition-colors">
                    <td className="px-4 py-3 font-mono text-yellow-400 font-bold tracking-widest whitespace-nowrap">
                      {s.placa}
                    </td>
                    <td className="px-4 py-3 text-slate-300 whitespace-nowrap">
                      {s.marca} {s.modelo}
                    </td>
                    <td className="px-4 py-3 text-white whitespace-nowrap">
                      {s.nombres} {s.apellidos}
                    </td>
                    <td className="px-4 py-3 text-slate-400 whitespace-nowrap">
                      {fechaDDMMAAAA(s.fecha)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap"
                        style={{ backgroundColor: '#0F0F10', color: '#FACC15' }}>
                        {s.tipo_servicio}
                      </span>
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
