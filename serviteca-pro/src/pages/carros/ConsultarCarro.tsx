/**
 * src/pages/carros/ConsultarCarro.tsx
 * Consulta un carro por placa y muestra sus datos.
 */

import { useState, type FormEvent, type ChangeEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ArrowLeft, Car, List, Wrench, History } from 'lucide-react';
import { carrosApi } from '../../services/api';
import Breadcrumb from '../../components/Breadcrumb';
import AlertMessage from '../../components/AlertMessage';
import type { Carro } from '../../types';

function fechaDDMMAAAA(f: string) {
  if (!f) return '';
  const [y, m, d] = f.slice(0, 10).split('-');
  return `${d}/${m}/${y}`;
}

export default function ConsultarCarro() {
  const [placa,    setPlaca]    = useState('');
  const [carro,    setCarro]    = useState<Carro | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error,    setError]    = useState('');
  const navigate = useNavigate();

  const cambiarPlaca = (e: ChangeEvent<HTMLInputElement>) => {
    setPlaca(e.target.value.toUpperCase().replace(/\s+/g, ''));
    setError('');
    setCarro(null);
  };

  const buscar = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setCarro(null);

    if (!placa.trim()) {
      setError('Ingrese una placa para buscar.');
      return;
    }

    setCargando(true);
    try {
      const res = await carrosApi.buscar(placa.trim());
      if (res.ok && res.data) {
        setCarro(res.data);
      } else {
        setError(res.error ?? 'Carro no encontrado.');
      }
    } catch {
      setError('Error de conexión.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      <Breadcrumb migas={[{ label: 'Carros', to: '/carros/listar' }, { label: 'Consultar' }]} />

      <div className="flex items-center gap-3 mb-6">
        <Link to="/carros/listar" className="text-slate-400 hover:text-yellow-400 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Search size={22} className="text-yellow-400" />
            Consultar Carro
          </h1>
          <p className="text-slate-400 text-sm">Busca un vehículo por su placa</p>
        </div>
      </div>

      {/* Búsqueda */}
      <div className="rounded-2xl border border-slate-700 p-6 mb-4" style={{ backgroundColor: '#1E293B' }}>
        <form onSubmit={buscar} className="flex gap-3">
          <div className="flex-1">
            <label htmlFor="buscarPlaca" className="block text-sm font-medium text-slate-300 mb-1.5">
              Placa <span className="text-yellow-400">*</span>
            </label>
            <input
              id="buscarPlaca"
              type="text"
              value={placa}
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
      {carro && (
        <div className="rounded-2xl border border-slate-700 p-6 animate-fade-in" style={{ backgroundColor: '#1E293B' }}>
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-4">
            Datos del vehículo
          </h2>
          <dl className="grid grid-cols-2 gap-y-3 gap-x-6">
            <Dato label="Placa"     valor={carro.placa} mono />
            <Dato label="Marca"     valor={carro.marca} />
            <Dato label="Modelo"    valor={carro.modelo} />
            <Dato label="Registrado" valor={fechaDDMMAAAA(carro.creado_en?.slice(0,10))} />
          </dl>

          <div className="flex flex-wrap gap-3 mt-6 pt-4 border-t border-slate-700">
            <button
              onClick={() => navigate(`/servicios/consultar`, { state: { placa: carro.placa } })}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold
                         transition-colors min-h-[44px]"
              style={{ backgroundColor: '#FACC15', color: '#0F0F10' }}
            >
              <History size={15} /> Ver Servicios de este Carro
            </button>
            <button
              onClick={() => navigate(`/servicios/agregar`, { state: { placa: carro.placa } })}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold
                         border border-slate-600 text-slate-300 hover:bg-slate-700
                         transition-colors min-h-[44px]"
            >
              <Wrench size={15} /> Registrar Servicio
            </button>
            <Link
              to="/carros/listar"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold
                         border border-slate-600 text-slate-300 hover:bg-slate-700
                         transition-colors min-h-[44px]"
            >
              <List size={15} /> Ver todos los carros
            </Link>
          </div>
        </div>
      )}

      <div className="mt-4 text-center">
        <Link to="/carros/agregar"
          className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-yellow-400 transition-colors">
          <Car size={15} /> Agregar nuevo carro
        </Link>
      </div>
    </div>
  );
}

function Dato({ label, valor, mono }: { label: string; valor: string; mono?: boolean }) {
  return (
    <div>
      <dt className="text-xs text-slate-500 uppercase tracking-wide mb-0.5">{label}</dt>
      <dd className={`font-medium ${mono ? 'font-mono text-yellow-400 tracking-widest' : 'text-white'}`}>{valor}</dd>
    </div>
  );
}

function Spinner() {
  return <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin inline-block" />;
}
