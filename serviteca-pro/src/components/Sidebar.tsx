/**
 * src/components/Sidebar.tsx
 * Barra lateral colapsible en escritorio.
 * En móvil se muestra como menú desplegable (overlay).
 * Los submenús se cierran al elegir una opción o al hacer clic afuera.
 */

import {
  useState,
  useRef,
  useEffect,
  type ReactNode,
} from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Home, Users, Car, Wrench, HelpCircle, LogOut,
  ChevronDown, ChevronRight, Menu, X, PlusCircle,
  Search, List,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ModalConfirm from './ModalConfirm';

// ── Tipos ──────────────────────────────────────────────────────────────────

interface SubItem {
  label: string;
  to: string;
  icon: ReactNode;
}

interface MenuItem {
  id: string;
  label: string;
  icon: ReactNode;
  to?: string;
  sub?: SubItem[];
}

// ── Menú completo ──────────────────────────────────────────────────────────

const MENU: MenuItem[] = [
  {
    id: 'inicio',
    label: 'Inicio',
    icon: <Home size={18} />,
    to: '/inicio',
  },
  {
    id: 'clientes',
    label: 'Clientes',
    icon: <Users size={18} />,
    sub: [
      { label: 'Agregar',  to: '/clientes/agregar',  icon: <PlusCircle size={15} /> },
      { label: 'Consultar',to: '/clientes/consultar', icon: <Search    size={15} /> },
      { label: 'Listar',   to: '/clientes/listar',    icon: <List      size={15} /> },
    ],
  },
  {
    id: 'carros',
    label: 'Carros',
    icon: <Car size={18} />,
    sub: [
      { label: 'Agregar',  to: '/carros/agregar',   icon: <PlusCircle size={15} /> },
      { label: 'Consultar',to: '/carros/consultar',  icon: <Search    size={15} /> },
      { label: 'Listar',   to: '/carros/listar',     icon: <List      size={15} /> },
    ],
  },
  {
    id: 'servicios',
    label: 'Servicios',
    icon: <Wrench size={18} />,
    sub: [
      { label: 'Agregar',  to: '/servicios/agregar',  icon: <PlusCircle size={15} /> },
      { label: 'Consultar',to: '/servicios/consultar', icon: <Search    size={15} /> },
      { label: 'Listar',   to: '/servicios/listar',    icon: <List      size={15} /> },
    ],
  },
  {
    id: 'ayuda',
    label: 'Ayuda',
    icon: <HelpCircle size={18} />,
    to: '/ayuda',
  },
];

// ── Componente principal ───────────────────────────────────────────────────

export default function Sidebar() {
  const { usuario, cerrarSesion } = useAuth();
  const location  = useLocation();
  const navigate  = useNavigate();

  // Sidebar colapsado/expandido en escritorio
  const [colapsado, setColapsado] = useState(false);
  // Menú abierto en móvil
  const [movil, setMovil] = useState(false);
  // Submenú abierto
  const [abierto, setAbierto] = useState<string | null>(null);
  // Modal salir
  const [modalSalir, setModalSalir] = useState(false);
  const [cerrando, setCerrando]     = useState(false);

  const sidebarRef = useRef<HTMLDivElement>(null);

  // Cerrar submenús al cambiar de ruta
  useEffect(() => {
    setAbierto(null);
    setMovil(false);
  }, [location.pathname]);

  // Cerrar al hacer clic afuera (en móvil)
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (movil && sidebarRef.current && !sidebarRef.current.contains(e.target as Node)) {
        setMovil(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [movil]);

  // Determinar si una ruta está activa
  const esActiva = (to: string) => location.pathname === to;
  const tieneSubActiva = (sub?: SubItem[]) =>
    sub?.some(s => location.pathname.startsWith(s.to)) ?? false;

  const handleLogout = async () => {
    setCerrando(true);
    await cerrarSesion();
    navigate('/login', { replace: true });
  };

  // ── Contenido del sidebar ──────────────────────────────────────────────

  const contenido = (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        {!colapsado && (
          <div className="flex items-center gap-2 overflow-hidden">
            <img src="/logo.svg" alt="Serviteca PRO" className="h-8 shrink-0" />
          </div>
        )}
        {/* Botón colapsar (solo escritorio) */}
        <button
          onClick={() => setColapsado(p => !p)}
          className="hidden md:flex items-center justify-center w-8 h-8 rounded-lg
                     text-slate-400 hover:text-yellow-400 hover:bg-slate-700 transition-colors"
          aria-label={colapsado ? 'Expandir menú' : 'Colapsar menú'}
        >
          {colapsado ? <ChevronRight size={18} /> : <Menu size={18} />}
        </button>
        {/* Botón cerrar en móvil */}
        <button
          onClick={() => setMovil(false)}
          className="md:hidden flex items-center justify-center w-8 h-8 rounded-lg
                     text-slate-400 hover:text-white"
          aria-label="Cerrar menú"
        >
          <X size={18} />
        </button>
      </div>

      {/* Perfil de usuario */}
      {!colapsado && (
        <div className="px-4 py-3 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
              style={{ backgroundColor: '#FACC15', color: '#0F0F10' }}
            >
              {usuario?.nombre?.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-white text-sm font-semibold truncate">{usuario?.nombre}</p>
              <p className="text-yellow-400 text-xs">{usuario?.rol}</p>
            </div>
          </div>
        </div>
      )}

      {/* Navegación */}
      <nav className="flex-1 p-2 overflow-y-auto">
        {MENU.map(item => {
          if (item.sub) {
            const subActiva = tieneSubActiva(item.sub);
            const expanded  = abierto === item.id || subActiva;
            return (
              <div key={item.id}>
                <button
                  onClick={() => setAbierto(p => p === item.id ? null : item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
                    text-sm font-medium transition-colors mb-0.5 min-h-[44px]
                    ${subActiva
                      ? 'text-yellow-400 bg-yellow-400/10'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700'
                    }`}
                >
                  <span className="shrink-0">{item.icon}</span>
                  {!colapsado && (
                    <>
                      <span className="flex-1 text-left">{item.label}</span>
                      <ChevronDown
                        size={14}
                        className={`transition-transform ${expanded ? 'rotate-180' : ''}`}
                      />
                    </>
                  )}
                </button>
                {!colapsado && expanded && (
                  <div className="ml-4 border-l border-slate-700 pl-2 mb-1">
                    {item.sub.map(s => (
                      <Link
                        key={s.to}
                        to={s.to}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm
                          transition-colors min-h-[40px]
                          ${esActiva(s.to)
                            ? 'text-yellow-400 bg-yellow-400/10 font-semibold'
                            : 'text-slate-400 hover:text-white hover:bg-slate-700'
                          }`}
                      >
                        {s.icon}
                        {s.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          return (
            <Link
              key={item.id}
              to={item.to!}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                transition-colors mb-0.5 min-h-[44px]
                ${esActiva(item.to!)
                  ? 'text-yellow-400 bg-yellow-400/10'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700'
                }`}
            >
              <span className="shrink-0">{item.icon}</span>
              {!colapsado && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Botón salir */}
      <div className="p-2 border-t border-slate-700">
        <button
          onClick={() => setModalSalir(true)}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                     text-red-400 hover:text-red-300 hover:bg-red-950 transition-colors min-h-[44px]"
        >
          <LogOut size={18} className="shrink-0" />
          {!colapsado && <span>Salir</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* ── Botón hamburguesa en móvil (fuera del sidebar) ── */}
      <button
        onClick={() => setMovil(true)}
        className="md:hidden fixed top-4 left-4 z-40 p-2 rounded-lg
                   text-slate-400 hover:text-white"
        style={{ backgroundColor: '#1E293B' }}
        aria-label="Abrir menú"
      >
        <Menu size={22} />
      </button>

      {/* ── Sidebar escritorio ── */}
      <aside
        className={`hidden md:flex flex-col h-screen sticky top-0 shrink-0 transition-all duration-300
                    border-r border-slate-700`}
        style={{
          backgroundColor: '#1E293B',
          width: colapsado ? '64px' : '240px',
        }}
      >
        {contenido}
      </aside>

      {/* ── Sidebar móvil (overlay) ── */}
      {movil && (
        <div className="md:hidden fixed inset-0 z-50">
          {/* Fondo oscuro */}
          <div
            className="absolute inset-0"
            style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
            onClick={() => setMovil(false)}
          />
          {/* Panel */}
          <aside
            ref={sidebarRef}
            className="absolute left-0 top-0 h-full w-72 flex flex-col
                       border-r border-slate-700 animate-slide-in"
            style={{ backgroundColor: '#1E293B' }}
          >
            {contenido}
          </aside>
        </div>
      )}

      {/* ── Modal de confirmación de salida ── */}
      {modalSalir && (
        <ModalConfirm
          titulo="¿Cerrar sesión?"
          mensaje="¿Desea cerrar la sesión actual?"
          textoConfirmar="Sí, salir"
          textoCancelar="Cancelar"
          onConfirmar={handleLogout}
          onCancelar={() => setModalSalir(false)}
          cargando={cerrando}
        />
      )}
    </>
  );
}
