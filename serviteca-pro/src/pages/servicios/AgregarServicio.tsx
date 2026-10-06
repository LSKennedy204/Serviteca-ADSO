/**
 * src/pages/servicios/AgregarServicio.tsx
 * Formulario para registrar un nuevo servicio.
 * - Al escribir una placa registrada muestra marca y modelo.
 * - Al escribir una identificación registrada muestra nombres y apellidos.
 * - Acepta state de navegación: { placa?, identificacion? } desde otras páginas.
 * - Tras guardar, vacía placa e identificación, conserva fecha y tipo.
 * - "Limpiar" restablece todo al estado inicial (fecha hoy).
 */

import { useState, useEffect, useCallback, type FormEvent } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Wrench, Eraser, List, ArrowLeft } from 'lucide-react';
import { serviciosApi, carrosApi, clientesApi } from '../../services/api';
import Breadcrumb from '../../components/Breadcrumb';
import AlertMessage from '../../components/AlertMessage';
import { TIPOS_SERVICIO, type TipoAlerta, type TipoServicio } from '../../types';

interface Alerta { tipo: TipoAlerta; mensaje: string }
interface NavState { placa?: string; identificacion?: string }

function hoy(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function AgregarServicio() {
  const navState = (useLocation().state ?? {}) as NavState;

  const [placa,          setPlaca]          = useState(navState.placa ?? '');
  const [identificacion, setIdentificacion] = useState(navState.identificacion ?? '');
  const [fecha,          setFecha]          = useState(hoy());
  const [tipo,           setTipo]           = useState<TipoServicio>('Cambio de aceite');

  const [infoCarro,    setInfoCarro]    = useState('');
  const [infoCliente,  setInfoCliente]  = useState('');
  const [errorPlaca,   setErrorPlaca]   = useState('');
  const [errorCliente, setErrorCliente] = useState('');

  const [cargando, setCargando] = useState(false);
  const [alerta,   setAlerta]   = useState<Alerta | null>(null);

  // ── Autocompletar info de carro ──
  const buscarCarro = useCallback(async (p: string) => {
    const val = p.trim().toUpperCase().replace(/\s+/g, '');
    if (!val) { setInfoCarro(''); setErrorPlaca(''); return; }
    try {
      const res = await carrosApi.buscar(val);
      if (res.ok && res.data) {
        setInfoCarro(`${res.data.marca} · ${res.data.modelo}`);
        setErrorPlaca('');
      } else {
        setInfoCarro('');
        setErrorPlaca('El carro ingresado no está registrado.');
      }
    } catch { /* silencioso */ }
  }, []);

  // ── Autocompletar info de cliente ──
  const buscarCliente = useCallback(async (id: string) => {
    const val = id.trim();
    if (!val) { setInfoCliente(''); setErrorCliente(''); return; }
    try {
      const res = await clientesApi.buscar(val);
      if (res.ok && res.data) {
        setInfoCliente(`${res.data.nombres} ${res.data.apellidos}`);
        setErrorCliente('');
      } else {
        setInfoCliente('');
        setErrorCliente('El cliente ingresado no está registrado.');
      }
    } catch { /* silencioso */ }
  }, []);

  // Al cargar con state, buscar inmediatamente
  useEffect(() => {
    if (navState.placa)          buscarCarro(navState.placa);
    if (navState.identificacion) buscarCliente(navState.identificacion);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounce para búsqueda mientras se escribe
  useEffect(() => {
    const t = setTimeout(() => buscarCarro(placa), 500);
    return () => clearTimeout(t);
  }, [placa, buscarCarro]);

  useEffect(() => {
    const t = setTimeout(() => buscarCliente(identificacion), 500);
    return () => clearTimeout(t);
  }, [identificacion, buscarCliente]);

  const limpiar = () => {
    setPlaca(''); setIdentificacion('');
    setFecha(hoy()); setTipo('Cambio de aceite');
    setInfoCarro(''); setInfoCliente('');
    setErrorPlaca(''); setErrorCliente('');
    setAlerta(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setAlerta(null);

    if (!placa.trim() || !identificacion.trim() || !fecha || !tipo) {
      setAlerta({ tipo: 'error', mensaje: 'Todos los campos son obligatorios.' });
      return;
    }

    setCargando(true);
    try {
      const res = await serviciosApi.crear({
        placa:          placa.trim().toUpperCase().replace(/\s+/g, ''),
        identificacion: identificacion.trim(),
        fecha,
        tipo_servicio:  tipo,
      });

      if (res.ok) {
        setAlerta({ tipo: 'exito', mensaje: 'Servicio registrado correctamente.' });
        // Vacía placa e identificación; conserva fecha y tipo
        setPlaca(''); setIdentificacion('');
        setInfoCarro(''); setInfoCliente('');
        setErrorPlaca(''); setErrorCliente('');
      } else {
        setAlerta({ tipo: 'error', mensaje: res.error ?? 'Error al registrar el servicio.' });
      }
    } catch {
      setAlerta({ tipo: 'error', mensaje: 'Error de conexión.' });
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      <Breadcrumb migas={[{ label: 'Servicios', to: '/servicios/listar' }, { label: 'Agregar' }]} />

      <div className="flex items-center gap-3 mb-6">
        <Link to="/servicios/listar" className="text-slate-400 hover:text-yellow-400 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Wrench size={22} className="text-yellow-400" />
            Agregar Servicio
          </h1>
          <p className="text-slate-400 text-sm">Registra un nuevo servicio en el sistema</p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-700 p-6" style={{ backgroundColor: '#1E293B' }}>
        {alerta && (
          <AlertMessage tipo={alerta.tipo} mensaje={alerta.mensaje}
            onCerrar={() => setAlerta(null)} className="mb-5" />
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="grid grid-cols-1 gap-4">

            {/* Placa */}
            <div>
              <label htmlFor="sPlaca" className="block text-sm font-medium text-slate-300 mb-1.5">
                Placa del vehículo <span className="text-yellow-400">*</span>
              </label>
              <input
                id="sPlaca"
                type="text"
                value={placa}
                onChange={e => setPlaca(e.target.value.toUpperCase().replace(/\s+/g, ''))}
                disabled={cargando}
                maxLength={6}
                placeholder="ABC123"
                className="w-full px-4 py-3 rounded-xl text-yellow-400 font-mono font-bold
                           placeholder-slate-500 text-sm border border-slate-600
                           focus:border-yellow-400 focus:outline-none transition-colors
                           disabled:opacity-60 tracking-widest"
                style={{ backgroundColor: '#0F0F10' }}
              />
              {infoCarro && (
                <p className="mt-1.5 text-xs text-green-400 flex items-center gap-1">
                  ✓ {infoCarro}
                </p>
              )}
              {errorPlaca && !infoCarro && (
                <p className="mt-1.5 text-xs text-red-400">{errorPlaca}</p>
              )}
            </div>

            {/* Identificación */}
            <div>
              <label htmlFor="sId" className="block text-sm font-medium text-slate-300 mb-1.5">
                Identificación del cliente <span className="text-yellow-400">*</span>
              </label>
              <input
                id="sId"
                type="text"
                value={identificacion}
                onChange={e => setIdentificacion(e.target.value.trim())}
                disabled={cargando}
                placeholder="Ej: 1001234567"
                className="w-full px-4 py-3 rounded-xl text-white placeholder-slate-500 text-sm
                           border border-slate-600 focus:border-yellow-400 focus:outline-none
                           transition-colors disabled:opacity-60"
                style={{ backgroundColor: '#0F0F10' }}
              />
              {infoCliente && (
                <p className="mt-1.5 text-xs text-green-400 flex items-center gap-1">
                  ✓ {infoCliente}
                </p>
              )}
              {errorCliente && !infoCliente && (
                <p className="mt-1.5 text-xs text-red-400">{errorCliente}</p>
              )}
            </div>

            {/* Fecha */}
            <div>
              <label htmlFor="sFecha" className="block text-sm font-medium text-slate-300 mb-1.5">
                Fecha <span className="text-yellow-400">*</span>
              </label>
              <input
                id="sFecha"
                type="date"
                value={fecha}
                onChange={e => setFecha(e.target.value)}
                disabled={cargando}
                className="w-full px-4 py-3 rounded-xl text-white text-sm
                           border border-slate-600 focus:border-yellow-400 focus:outline-none
                           transition-colors disabled:opacity-60"
                style={{ backgroundColor: '#0F0F10', colorScheme: 'dark' }}
              />
            </div>

            {/* Tipo de servicio */}
            <div>
              <label htmlFor="sTipo" className="block text-sm font-medium text-slate-300 mb-1.5">
                Tipo de servicio <span className="text-yellow-400">*</span>
              </label>
              <select
                id="sTipo"
                value={tipo}
                onChange={e => setTipo(e.target.value as TipoServicio)}
                disabled={cargando}
                className="w-full px-4 py-3 rounded-xl text-white text-sm
                           border border-slate-600 focus:border-yellow-400 focus:outline-none
                           transition-colors disabled:opacity-60"
                style={{ backgroundColor: '#0F0F10' }}
              >
                {TIPOS_SERVICIO.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
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
              {cargando ? <><Spinner /> Guardando...</> : <><Wrench size={16} /> Guardar</>}
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
        <Link to="/servicios/listar"
          className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-yellow-400 transition-colors">
          <List size={15} /> Ver Listado de Servicios
        </Link>
      </div>
    </div>
  );
}

function Spinner() {
  return <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin inline-block" />;
}
