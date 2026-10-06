/**
 * src/components/Breadcrumb.tsx
 * Migas de pan. Recibe un array de { label, to? }.
 * El último item se muestra sin enlace (página actual).
 */

import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export interface MigaPan {
  label: string;
  to?: string;
}

interface Props {
  migas: MigaPan[];
}

export default function Breadcrumb({ migas }: Props) {
  return (
    <nav aria-label="Migas de pan" className="flex items-center gap-1 text-sm mb-4 flex-wrap">
      <Link
        to="/inicio"
        className="text-slate-400 hover:text-yellow-400 transition-colors flex items-center gap-1"
      >
        <Home size={14} />
        <span>Inicio</span>
      </Link>

      {migas.map((miga, i) => {
        const esUltima = i === migas.length - 1;
        return (
          <span key={i} className="flex items-center gap-1">
            <ChevronRight size={14} className="text-slate-600" />
            {esUltima || !miga.to ? (
              <span className="text-yellow-400 font-medium">{miga.label}</span>
            ) : (
              <Link
                to={miga.to}
                className="text-slate-400 hover:text-yellow-400 transition-colors"
              >
                {miga.label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
