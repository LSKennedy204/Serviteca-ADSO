/**
 * src/components/AlertMessage.tsx
 * Mensaje de alerta con íconos, colores por tipo y botón de cierre.
 * Tipos: exito | error | advertencia | info
 */

import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { type ReactNode } from 'react';
import type { TipoAlerta } from '../types';

interface Props {
  tipo: TipoAlerta;
  mensaje: string;
  onCerrar?: () => void;
  className?: string;
}

const CONFIG: Record<TipoAlerta, {
  bg: string; border: string; text: string; icon: ReactNode;
}> = {
  exito: {
    bg:     'bg-green-950',
    border: 'border-green-500',
    text:   'text-green-300',
    icon:   <CheckCircle size={18} className="text-green-400 shrink-0 mt-0.5" />,
  },
  error: {
    bg:     'bg-red-950',
    border: 'border-red-500',
    text:   'text-red-300',
    icon:   <XCircle size={18} className="text-red-400 shrink-0 mt-0.5" />,
  },
  advertencia: {
    bg:     'bg-yellow-950',
    border: 'border-yellow-500',
    text:   'text-yellow-300',
    icon:   <AlertTriangle size={18} className="text-yellow-400 shrink-0 mt-0.5" />,
  },
  info: {
    bg:     'bg-blue-950',
    border: 'border-blue-500',
    text:   'text-blue-300',
    icon:   <Info size={18} className="text-blue-400 shrink-0 mt-0.5" />,
  },
};

export default function AlertMessage({ tipo, mensaje, onCerrar, className = '' }: Props) {
  const c = CONFIG[tipo];
  return (
    <div
      role="alert"
      className={`flex items-start gap-3 px-4 py-3 rounded-xl border
        ${c.bg} ${c.border} ${c.text} text-sm animate-fade-in ${className}`}
    >
      {c.icon}
      <span className="flex-1 leading-snug">{mensaje}</span>
      {onCerrar && (
        <button
          onClick={onCerrar}
          aria-label="Cerrar alerta"
          className="text-slate-400 hover:text-white transition-colors shrink-0 mt-0.5"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
