/**
 * src/services/api.ts
 * Cliente HTTP centralizado para comunicarse con la API REST.
 * Inyecta el token Bearer automáticamente y maneja el 401.
 */

import type {
  ApiResponse,
  Cliente,
  Carro,
  Servicio,
  DashboardData,
  HistorialCarro,
  SesionUsuario,
} from '../types';

const BASE = '/api';

// ──────────────────────────────────────────────
// Helper base
// ──────────────────────────────────────────────

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  token?: string
): Promise<ApiResponse<T>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  const storedToken = token ?? localStorage.getItem('serviteca_token');
  if (storedToken) {
    headers['Authorization'] = `Bearer ${storedToken}`;
  }

  try {
    const res = await fetch(`${BASE}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    // Si responde 401, limpiar sesión y recargar al login
    if (res.status === 401) {
      localStorage.removeItem('serviteca_token');
      localStorage.removeItem('serviteca_usuario');
      window.location.href = '/';
      return { ok: false, error: 'Sesión expirada.' };
    }

    const data = await res.json() as ApiResponse<T>;
    return data;
  } catch {
    return { ok: false, error: 'Error de conexión con el servidor.' };
  }
}

// ──────────────────────────────────────────────
// Auth
// ──────────────────────────────────────────────

export const authApi = {
  login: (usuario: string, password: string) =>
    request<SesionUsuario>('POST', '/auth/login', { usuario, password }),

  logout: (token: string) =>
    request('POST', '/auth/logout', undefined, token),

  verify: () =>
    request<SesionUsuario['usuario']>('GET', '/auth/verify'),

  health: () =>
    request('GET', '/health'),
};

// ──────────────────────────────────────────────
// Dashboard
// ──────────────────────────────────────────────

export const dashboardApi = {
  get: () =>
    request<DashboardData>('GET', '/dashboard'),
};

// ──────────────────────────────────────────────
// Clientes
// ──────────────────────────────────────────────

export const clientesApi = {
  listar: () =>
    request<Cliente[]>('GET', '/clientes'),

  buscar: (identificacion: string) =>
    request<Cliente>('GET', `/clientes/${encodeURIComponent(identificacion)}`),

  crear: (data: Omit<Cliente, 'id' | 'creado_en'>) =>
    request<Cliente>('POST', '/clientes', data),
};

// ──────────────────────────────────────────────
// Carros
// ──────────────────────────────────────────────

export const carrosApi = {
  listar: () =>
    request<Carro[]>('GET', '/carros'),

  buscar: (placa: string) =>
    request<Carro>('GET', `/carros/${encodeURIComponent(placa)}`),

  crear: (data: Omit<Carro, 'id' | 'creado_en'>) =>
    request<Carro>('POST', '/carros', data),
};

// ──────────────────────────────────────────────
// Servicios
// ──────────────────────────────────────────────

export const serviciosApi = {
  listar: () =>
    request<Servicio[]>('GET', '/servicios'),

  porCarro: (placa: string) =>
    request<HistorialCarro>('GET', `/servicios/carro/${encodeURIComponent(placa)}`),

  crear: (data: {
    placa: string;
    identificacion: string;
    fecha: string;
    tipo_servicio: string;
  }) => request<Servicio>('POST', '/servicios', data),
};
