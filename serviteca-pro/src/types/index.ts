/**
 * src/types/index.ts
 * Tipos compartidos entre frontend y lógica de la aplicación.
 */

// ── Entidades del modelo de datos ──

export interface Usuario {
  id: number;
  usuario: string;
  nombre: string;
  rol: string;
  creado_en: string;
}

export interface Cliente {
  id: number;
  identificacion: string;
  nombres: string;
  apellidos: string;
  correo: string;
  celular: string;
  creado_en: string;
}

export interface Carro {
  id: number;
  placa: string;
  marca: string;
  modelo: string;
  creado_en: string;
}

export interface Servicio {
  id: number;
  placa: string;
  identificacion: string;
  fecha: string;
  tipo_servicio: TipoServicio;
  creado_en: string;
  // Campos enriquecidos para listados
  nombres?: string;
  apellidos?: string;
  marca?: string;
  modelo?: string;
}

export type TipoServicio =
  | 'Cambio de aceite'
  | 'Sincronización'
  | 'Alineación'
  | 'Lavado';

export const TIPOS_SERVICIO: TipoServicio[] = [
  'Cambio de aceite',
  'Sincronización',
  'Alineación',
  'Lavado',
];

// ── Respuestas de la API ──

export interface ApiResponse<T = unknown> {
  ok: boolean;
  mensaje?: string;
  data?: T;
  error?: string;
}

export interface DashboardData {
  totalClientes: number | string | null;
  totalCarros: number | string | null;
  totalServicios: number | string | null;
  porTipo: { tipo_servicio: string | number | null; total: number | string | null }[];
  ultimosServicios: Servicio[];
}

export interface HistorialCarro {
  placa: string;
  marca: string;
  modelo: string;
  total: number;
  servicios: Servicio[];
}

// ── Sesión / Auth ──

export interface SesionUsuario {
  token: string;
  usuario: Usuario;
}

// ── Alertas de UI ──

export type TipoAlerta = 'exito' | 'error' | 'advertencia' | 'info';

export interface AlertaData {
  tipo: TipoAlerta;
  mensaje: string;
  id?: number;
}
