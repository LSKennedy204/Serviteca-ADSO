/**
 * src/components/Layout.tsx
 * Layout principal con Sidebar y área de contenido.
 * Todas las páginas protegidas se renderizan dentro de este layout.
 */

import type { ReactNode } from 'react';
import Sidebar from './Sidebar';

interface Props {
  children: ReactNode;
}

export default function Layout({ children }: Props) {
  return (
    <div className="flex min-h-screen" style={{ backgroundColor: '#0F0F10' }}>
      <Sidebar />
      <main className="flex-1 min-w-0 overflow-y-auto">
        {/* Padding top en móvil para el botón hamburguesa */}
        <div className="p-4 md:p-6 pt-16 md:pt-6">
          {children}
        </div>
      </main>
    </div>
  );
}
