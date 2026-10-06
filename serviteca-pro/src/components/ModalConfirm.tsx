/**
 * src/components/ModalConfirm.tsx
 * Modal de confirmación genérico. Se usa para el cierre de sesión y otras acciones.
 */

import { AlertTriangle } from 'lucide-react';
import { useEffect } from 'react';

interface Props {
  titulo: string;
  mensaje: string;
  textoConfirmar?: string;
  textoCancelar?: string;
  onConfirmar: () => void;
  onCancelar: () => void;
  cargando?: boolean;
}

export default function ModalConfirm({
  titulo,
  mensaje,
  textoConfirmar = 'Confirmar',
  textoCancelar  = 'Cancelar',
  onConfirmar,
  onCancelar,
  cargando = false,
}: Props) {
  // Cerrar con Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancelar();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onCancelar]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}
      onClick={onCancelar}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-titulo"
    >
      {/* Tarjeta — detener propagación para no cerrar al hacer clic dentro */}
      <div
        className="w-full max-w-sm rounded-2xl p-6 shadow-2xl animate-fade-in"
        style={{ backgroundColor: '#1E293B' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Ícono */}
        <div className="flex justify-center mb-4">
          <span
            className="p-3 rounded-full"
            style={{ backgroundColor: 'rgba(250,204,21,0.15)' }}
          >
            <AlertTriangle size={28} className="text-yellow-400" />
          </span>
        </div>

        {/* Texto */}
        <h2
          id="modal-titulo"
          className="text-lg font-bold text-white text-center mb-2"
        >
          {titulo}
        </h2>
        <p className="text-slate-400 text-sm text-center mb-6">{mensaje}</p>

        {/* Botones */}
        <div className="flex gap-3">
          <button
            onClick={onCancelar}
            disabled={cargando}
            className="flex-1 py-3 rounded-xl text-sm font-semibold border border-slate-600
                       text-slate-300 hover:bg-slate-700 transition-colors disabled:opacity-50"
          >
            {textoCancelar}
          </button>
          <button
            onClick={onConfirmar}
            disabled={cargando}
            className="flex-1 py-3 rounded-xl text-sm font-bold transition-colors
                       disabled:opacity-50"
            style={{ backgroundColor: '#FACC15', color: '#0F0F10' }}
          >
            {cargando ? 'Cerrando...' : textoConfirmar}
          </button>
        </div>
      </div>
    </div>
  );
}
