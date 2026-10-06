/**
 * src/pages/clientes/ConsultarCliente.tsx
 * Consulta un cliente por identificación y muestra sus datos.
 */

import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ArrowLeft, UserPlus, List, Wrench } from 'lucide-react';
import { clientesApi } from '../../services/api';
import Breadcrumb from '../../components/Breadcrumb';
import AlertMessage from '../../components/AlertMessage';
import type { Cliente } from '../../types';

function fechaDDMMAAAA(f: string) {
  const [y, m, d] = f.split('-');
  return `${d}/${m}/${y}`;
}

export default function ConsultarCliente() {
  const [id,       setId]       = useState('');
  const [cliente,  setCliente]  = useState<Cliente | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error,    setError]    = useState('');
  const navigate = useNavigate();

  const buscar = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setCliente(null);

    if (!id.trim()) {
      setError('Ingrese una identificación para buscar.');
      return;
    }

    setCargando(true);
    try {
      const res = await clientesApi.buscar(id.trim());
      if (res.ok && res.data) {
        setCliente(res.data);
      } else {
        setError(res.error ?? 'Cliente no encontrado.');
      }
    } catch {
      setError('Error de conexión con el servidor.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      <Breadcrumb migas={[{ label: 'Clientes', to: '/clientes/listar' }, { label: 'Consultar' }]} />

      <div className="flex items-center gap-3 mb-6">
        <Link to="/clientes/listar" className="text-slate-400 hover:text-yellow-400 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Search size={22} className="text-yellow-400" />
            Consultar Cliente
          </h1>
          <p className="text-slate-400 text-sm">Busca un cliente por su identificación</p>
        </div>
      </div>

      {/* Formulario de búsqueda */}
      <div className="rounded-2xl border border-slate-700 p-6 mb-4" style={{ backgroundColor: '#1E293B' }}>
        <form onSubmit={buscar} className="flex gap-3">
          <div className="flex-1">
            <label htmlFor="buscarId" className="block text-sm font-medium text-slate-300 mb-1.5">
              Identificación <span className="text-yellow-400">*</span>
            </label>
            <input
              id="buscarId"
              type="text"
              value={id}
              onChange={e => { setId(e.target.value); setError(''); setCliente(null); }}
              disabled={cargando}
              placeholder="Ej: 1001234567"
              className="w-full px-4 py-3 rounded-xl text-white placeholder-slate-500 text-sm
                         border border-slate-600 focus:border-yellow-400 focus:outline-none
                         transition-colors disabled:opacity-60"
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
              {cargando
                ? <><Spinner /> Consultando...</>
                : <><Search size={16} /> Consultar</>
              }
            </button>
          </div>
        </form>

        {error && (
          <AlertMessage tipo="error" mensaje={error} onCerrar={() => setError('')} className="mt-4" />
        )}
      </div>

      {/* Resultado */}
      {cliente && (
        <div className="rounded-2xl border border-slate-700 p-6 animate-fade-in" style={{ backgroundColor: '#1E293B' }}>
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-4">
            Datos del cliente
          </h2>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6">
            <Dato label="Identificación" valor={cliente.identificacion} />
            <Dato label="Nombres"        valor={cliente.nombres} />
            <Dato label="Apellidos"      valor={cliente.apellidos} />
            <Dato label="Correo"         valor={cliente.correo} />
            <Dato label="Celular"        valor={cliente.celular} />
            <Dato label="Registrado"     valor={fechaDDMMAAAA(cliente.creado_en?.slice(0,10))} />
          </dl>

          {/* Acciones */}
          <div className="flex flex-wrap gap-3 mt-6 pt-4 border-t border-slate-700">
            <button
              onClick={() => navigate(`/servicios/agregar`, {
                state: { identificacion: cliente.identificacion }
              })}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold
                         transition-colors min-h-[44px]"
              style={{ backgroundColor: '#FACC15', color: '#0F0F10' }}
            >
              <Wrench size={15} /> Asignar Servicio a este Cliente
            </button>
            <Link
              to="/clientes/listar"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold
                         border border-slate-600 text-slate-300 hover:bg-slate-700
                         transition-colors min-h-[44px]"
            >
              <List size={15} /> Ver todos los clientes
            </Link>
          </div>
        </div>
      )}

      <div className="mt-4 text-center">
        <Link to="/clientes/agregar"
          className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-yellow-400 transition-colors">
          <UserPlus size={15} /> Agregar nuevo cliente
        </Link>
      </div>
    </div>
  );
}

function Dato({ label, valor }: { label: string; valor: string }) {
  return (
    <div>
      <dt className="text-xs text-slate-500 uppercase tracking-wide mb-0.5">{label}</dt>
      <dd className="text-white font-medium break-all">{valor}</dd>
    </div>
  );
}

function Spinner() {
  return <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin inline-block" />;
}
