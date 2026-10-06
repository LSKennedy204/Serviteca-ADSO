/**
 * src/pages/Dashboard.tsx
 * Panel de inicio:
 * - Bienvenida con el nombre del usuario.
 * - Tarjetas de totales: clientes, carros, servicios.
 * - Conteo por cada tipo de servicio.
 * - Últimos 5 servicios.
 * - Accesos rápidos a Agregar, Consultar y Listar de cada módulo.
 * - Botón "Actualizar datos".
 * - Acceso directo para registrar un servicio.
 */

import { useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, Car, Wrench, RefreshCw, PlusCircle,
  Search, List, DropletIcon, Settings, AlignCenter, Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { dashboardApi } from '../services/api';
import AlertMessage from '../components/AlertMessage';
import type { DashboardData } from '../types';

// ── Helpers ────────────────────────────────────────────────────────────────

function fechaDDMMAAAA(fecha: string): string {
  if (!fecha) return '';
  const [y, m, d] = fecha.split('-');
  return `${d}/${m}/${y}`;
}

const TIPO_ICONOS: Record<string, ReactNode> = {
  'Cambio de aceite': <DropletIcon size={16} className="text-yellow-400" />,
  'Sincronización':   <Settings    size={16} className="text-blue-400"   />,
  'Alineación':       <AlignCenter size={16} className="text-purple-400" />,
  'Lavado':           <Sparkles    size={16} className="text-cyan-400"   />,
};

// ── Tarjeta de total ────────────────────────────────────────────────────────

function TarjetaTotal({
  label, valor, icon, color, to,
}: {
  label: string; valor: number | string | null; icon: ReactNode;
  color: string; to: string;
}) {
  return (
    <Link
      to={to}
      className="flex items-center gap-4 p-5 rounded-2xl border border-slate-700
                 hover:border-slate-500 transition-all group"
      style={{ backgroundColor: '#1E293B' }}
    >
      <div
        className="p-3 rounded-xl shrink-0 transition-transform group-hover:scale-110"
        style={{ backgroundColor: `${color}20` }}
      >
        {icon}
      </div>
      <div>
        <p className="text-3xl font-bold text-white">
          {valor === null || valor === undefined ? '—' : Number(valor)}
        </p>
        <p className="text-slate-400 text-sm">{label}</p>
      </div>
    </Link>
  );
}

// ── Acceso rápido ────────────────────────────────────────────────────────────

function AccesoRapido({
  to, icon, label, color,
}: {
  to: string; icon: ReactNode; label: string; color: string;
}) {
  return (
    <Link
      to={to}
      className="flex flex-col items-center gap-2 p-4 rounded-xl border border-slate-700
                 hover:border-slate-500 transition-all text-center group"
      style={{ backgroundColor: '#1E293B' }}
    >
      <div
        className="p-2.5 rounded-lg transition-transform group-hover:scale-110"
        style={{ backgroundColor: `${color}20` }}
      >
        {icon}
      </div>
      <span className="text-xs text-slate-300 font-medium">{label}</span>
    </Link>
  );
}

// ── Componente principal ────────────────────────────────────────────────────

export default function Dashboard() {
  const { usuario } = useAuth();
  const [datos,     setDatos]     = useState<DashboardData | null>(null);
  const [cargando,  setCargando]  = useState(true);
  const [error,     setError]     = useState('');

  const cargarDatos = useCallback(async () => {
    setCargando(true);
    setError('');
    try {
      const res = await dashboardApi.get();
      if (res.ok && res.data) {
        setDatos(res.data);
      } else {
        setError(res.error ?? 'No se pudo cargar el panel.');
      }
    } catch {
      setError('Error de conexión.');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => { cargarDatos(); }, [cargarDatos]);

  return (
    <div className="max-w-5xl mx-auto">
      {/* Bienvenida */}
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">
            ¡Bienvenido, {usuario?.nombre}! 👋
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">
            Panel de control · Serviteca PRO
          </p>
        </div>
        <button
          onClick={cargarDatos}
          disabled={cargando}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold
                     border border-slate-600 text-slate-300 hover:bg-slate-700
                     transition-colors disabled:opacity-50 min-h-[44px]"
        >
          <RefreshCw size={16} className={cargando ? 'animate-spin' : ''} />
          Actualizar datos
        </button>
      </div>

      {error && (
        <AlertMessage tipo="error" mensaje={error} onCerrar={() => setError('')} className="mb-6" />
      )}

      {/* ── Totales ── */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <TarjetaTotal
          label="Clientes"
          valor={datos?.totalClientes ?? null}
          icon={<Users size={22} color="#FACC15" />}
          color="#FACC15"
          to="/clientes/listar"
        />
        <TarjetaTotal
          label="Carros"
          valor={datos?.totalCarros ?? null}
          icon={<Car size={22} color="#22C55E" />}
          color="#22C55E"
          to="/carros/listar"
        />
        <TarjetaTotal
          label="Servicios"
          valor={datos?.totalServicios ?? null}
          icon={<Wrench size={22} color="#818CF8" />}
          color="#818CF8"
          to="/servicios/listar"
        />
      </section>

      {/* ── Por tipo de servicio ── */}
      {datos?.porTipo && datos.porTipo.length > 0 && (
        <section
          className="p-5 rounded-2xl border border-slate-700 mb-6"
          style={{ backgroundColor: '#1E293B' }}
        >
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-4">
            Servicios por tipo
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {datos.porTipo.map(t => (
              <div
                key={t.tipo_servicio as string}
                className="flex flex-col gap-1.5 p-3 rounded-xl"
                style={{ backgroundColor: '#0F0F10' }}
              >
                <div className="flex items-center gap-2">
                  {TIPO_ICONOS[t.tipo_servicio as string] ?? <Wrench size={16} />}
                  <span className="text-xs text-slate-400 leading-tight">
                    {t.tipo_servicio as string}
                  </span>
                </div>
                <p className="text-2xl font-bold text-white">{t.total as number}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Acceso directo servicios ── */}
      <div className="mb-6">
        <Link
          to="/servicios/agregar"
          className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl
                     font-bold text-sm transition-opacity hover:opacity-90 min-h-[48px]"
          style={{ backgroundColor: '#FACC15', color: '#0F0F10' }}
        >
          <PlusCircle size={18} />
          Registrar nuevo servicio
        </Link>
      </div>

      {/* ── Últimos servicios ── */}
      <section
        className="p-5 rounded-2xl border border-slate-700 mb-6"
        style={{ backgroundColor: '#1E293B' }}
      >
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-4">
          Últimos servicios registrados
        </h2>

        {cargando ? (
          <div className="flex justify-center py-6">
            <div className="w-6 h-6 border-2 border-yellow-400 border-t-transparent
                            rounded-full animate-spin" />
          </div>
        ) : datos?.ultimosServicios?.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left text-slate-400 font-medium pb-2 pr-4">Placa</th>
                  <th className="text-left text-slate-400 font-medium pb-2 pr-4">Cliente</th>
                  <th className="text-left text-slate-400 font-medium pb-2 pr-4">Fecha</th>
                  <th className="text-left text-slate-400 font-medium pb-2">Servicio</th>
                </tr>
              </thead>
              <tbody>
                {datos.ultimosServicios.map(s => (
                  <tr key={s.id} className="border-b border-slate-800 last:border-0">
                    <td className="py-2.5 pr-4">
                      <span className="font-mono text-yellow-400 font-semibold">{s.placa}</span>
                    </td>
                    <td className="py-2.5 pr-4 text-slate-300">
                      {s.nombres} {s.apellidos}
                    </td>
                    <td className="py-2.5 pr-4 text-slate-400">
                      {fechaDDMMAAAA(s.fecha)}
                    </td>
                    <td className="py-2.5">
                      <span
                        className="px-2.5 py-1 rounded-full text-xs font-medium"
                        style={{ backgroundColor: '#0F0F10', color: '#FACC15' }}
                      >
                        {s.tipo_servicio}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-slate-500 text-sm text-center py-4">
            No hay servicios registrados aún.
          </p>
        )}
      </section>

      {/* ── Accesos rápidos ── */}
      <section
        className="p-5 rounded-2xl border border-slate-700"
        style={{ backgroundColor: '#1E293B' }}
      >
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-4">
          Accesos rápidos
        </h2>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          <AccesoRapido to="/clientes/agregar"  icon={<PlusCircle size={20} color="#FACC15" />} label="Agregar cliente"   color="#FACC15" />
          <AccesoRapido to="/clientes/consultar" icon={<Search    size={20} color="#FACC15" />} label="Consultar cliente" color="#FACC15" />
          <AccesoRapido to="/clientes/listar"    icon={<List      size={20} color="#FACC15" />} label="Listar clientes"  color="#FACC15" />
          <AccesoRapido to="/carros/agregar"     icon={<PlusCircle size={20} color="#22C55E" />} label="Agregar carro"   color="#22C55E" />
          <AccesoRapido to="/carros/consultar"   icon={<Search    size={20} color="#22C55E" />} label="Consultar carro"  color="#22C55E" />
          <AccesoRapido to="/carros/listar"      icon={<List      size={20} color="#22C55E" />} label="Listar carros"   color="#22C55E" />
          <AccesoRapido to="/servicios/agregar"  icon={<PlusCircle size={20} color="#818CF8" />} label="Agregar servicio" color="#818CF8" />
          <AccesoRapido to="/servicios/consultar" icon={<Search   size={20} color="#818CF8" />} label="Consultar servicio" color="#818CF8" />
          <AccesoRapido to="/servicios/listar"   icon={<List      size={20} color="#818CF8" />} label="Listar servicios" color="#818CF8" />
          <AccesoRapido to="/ayuda"              icon={<Search    size={20} color="#64748B" />} label="Ayuda"            color="#64748B" />
        </div>
      </section>
    </div>
  );
}
