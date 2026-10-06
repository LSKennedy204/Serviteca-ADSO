/**
 * server/routes.ts
 * API REST completa de Serviteca PRO.
 *
 * Rutas públicas:  GET  /api/health
 *                  POST /api/auth/login
 * Rutas protegidas: todo lo demás requiere Bearer token válido.
 *
 * Códigos de respuesta usados:
 *   200 OK · 201 Created · 400 Bad Request · 401 Unauthorized
 *   404 Not Found · 409 Conflict (duplicado) · 500 Internal Server Error
 */

import { Router, Request, Response, NextFunction } from 'express';
import {
  queryAll,
  queryOne,
  runWrite,
  verifyPassword,
  generateToken,
  hashToken,
} from './db.js';

const router = Router();

// ──────────────────────────────────────────────────────────────────────────────
// Tipos auxiliares
// ──────────────────────────────────────────────────────────────────────────────

interface AuthRequest extends Request {
  usuarioId?: number;
}

const TIPOS_VALIDOS = ['Cambio de aceite', 'Sincronización', 'Alineación', 'Lavado'] as const;
const RE_CORREO    = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RE_CELULAR   = /^\d{10}$/;
const RE_PLACA     = /^[A-Z]{3}\d{3}$/;
const RE_FECHA     = /^\d{4}-\d{2}-\d{2}$/;

// ──────────────────────────────────────────────────────────────────────────────
// Middleware de autenticación
// ──────────────────────────────────────────────────────────────────────────────

function autenticar(req: AuthRequest, res: Response, next: NextFunction): void {
  const header = req.headers['authorization'];
  if (!header || !header.startsWith('Bearer ')) {
    res.status(401).json({ ok: false, error: 'Token requerido.' });
    return;
  }

  const token = header.slice(7).trim();
  if (!token) {
    res.status(401).json({ ok: false, error: 'Token requerido.' });
    return;
  }

  const tokenHash = hashToken(token);
  const sesion = queryOne(
    `SELECT usuario_id, expira_en FROM sesiones WHERE token_hash = ?`,
    [tokenHash]
  );

  if (!sesion) {
    res.status(401).json({ ok: false, error: 'Sesión inválida o expirada.' });
    return;
  }

  // Verificar expiración
  const ahora    = new Date();
  const expiraEn = new Date(sesion['expira_en'] as string);
  if (ahora > expiraEn) {
    runWrite(`DELETE FROM sesiones WHERE token_hash = ?`, [tokenHash]);
    res.status(401).json({ ok: false, error: 'Sesión expirada.' });
    return;
  }

  req.usuarioId = sesion['usuario_id'] as number;
  next();
}

// ──────────────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────────────

function normalizarPlaca(p: string): string {
  return p.trim().toUpperCase().replace(/\s+/g, '');
}

function expiraEn24h(): string {
  const d = new Date();
  d.setHours(d.getHours() + 24);
  // Formato ISO sin zona horaria para SQLite
  return d.toISOString().replace('T', ' ').slice(0, 19);
}

// ──────────────────────────────────────────────────────────────────────────────
// RUTAS PÚBLICAS
// ──────────────────────────────────────────────────────────────────────────────

// GET /api/health
router.get('/health', (_req: Request, res: Response) => {
  res.json({
    ok: true,
    mensaje: 'Serviteca PRO API funcionando correctamente.',
    timestamp: new Date().toISOString(),
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// AUTH
// ──────────────────────────────────────────────────────────────────────────────

// POST /api/auth/login
router.post('/auth/login', (req: Request, res: Response) => {
  try {
    const { usuario, password } = req.body as { usuario?: string; password?: string };

    // Campos obligatorios
    if (!usuario?.trim() || !password?.trim()) {
      res.status(400).json({ ok: false, error: 'Complete todos los campos.' });
      return;
    }

    const user = queryOne(
      `SELECT id, usuario, password_hash, salt, nombre, rol FROM usuarios WHERE usuario = ?`,
      [usuario.trim()]
    );

    // Mensaje genérico para no revelar si el usuario existe
    const MENSAJE_ERROR = 'Usuario o contraseña incorrectos.';

    if (!user) {
      res.status(401).json({ ok: false, error: MENSAJE_ERROR });
      return;
    }

    const valido = verifyPassword(
      password,
      user['password_hash'] as string,
      user['salt'] as string
    );

    if (!valido) {
      res.status(401).json({ ok: false, error: MENSAJE_ERROR });
      return;
    }

    // Crear sesión
    const { token, tokenHash } = generateToken();
    const expira = expiraEn24h();

    runWrite(
      `INSERT INTO sesiones (token_hash, usuario_id, expira_en) VALUES (?,?,?)`,
      [tokenHash, user['id'] as number, expira]
    );

    res.status(200).json({
      ok: true,
      data: {
        token,
        usuario: {
          id:       user['id'],
          usuario:  user['usuario'],
          nombre:   user['nombre'],
          rol:      user['rol'],
        },
      },
    });
  } catch {
    res.status(500).json({ ok: false, error: 'Error interno del servidor.' });
  }
});

// POST /api/auth/logout
router.post('/auth/logout', autenticar, (req: AuthRequest, res: Response) => {
  try {
    const header = req.headers['authorization'] as string;
    const token  = header.slice(7).trim();
    const th     = hashToken(token);
    runWrite(`DELETE FROM sesiones WHERE token_hash = ?`, [th]);
    res.json({ ok: true, mensaje: 'Sesión cerrada correctamente.' });
  } catch {
    res.status(500).json({ ok: false, error: 'Error interno del servidor.' });
  }
});

// GET /api/auth/verify
router.get('/auth/verify', autenticar, (req: AuthRequest, res: Response) => {
  try {
    const usuario = queryOne(
      `SELECT id, usuario, nombre, rol, creado_en FROM usuarios WHERE id = ?`,
      [req.usuarioId as number]
    );
    if (!usuario) {
      res.status(401).json({ ok: false, error: 'Usuario no encontrado.' });
      return;
    }
    res.json({ ok: true, data: usuario });
  } catch {
    res.status(500).json({ ok: false, error: 'Error interno del servidor.' });
  }
});

// ──────────────────────────────────────────────────────────────────────────────
// DASHBOARD
// ──────────────────────────────────────────────────────────────────────────────

// GET /api/dashboard
router.get('/dashboard', autenticar, (_req: Request, res: Response) => {
  try {
    const totalesClientes  = queryAll(`SELECT COUNT(*) as total FROM clientes`);
    const totalesCarros    = queryAll(`SELECT COUNT(*) as total FROM carros`);
    const totalesServicios = queryAll(`SELECT COUNT(*) as total FROM servicios`);

    const totalClientes  = totalesClientes[0]?.['total']  ?? 0;
    const totalCarros    = totalesCarros[0]?.['total']    ?? 0;
    const totalServicios = totalesServicios[0]?.['total'] ?? 0;

    const porTipo = queryAll(`
      SELECT tipo_servicio, COUNT(*) as total
      FROM servicios
      GROUP BY tipo_servicio
      ORDER BY total DESC
    `);

    const ultimosServicios = queryAll(`
      SELECT
        s.id, s.placa, s.identificacion, s.fecha, s.tipo_servicio, s.creado_en,
        c.nombres, c.apellidos,
        ca.marca, ca.modelo
      FROM servicios s
      JOIN clientes c  ON s.identificacion = c.identificacion
      JOIN carros   ca ON s.placa          = ca.placa
      ORDER BY s.creado_en DESC, s.id DESC
      LIMIT 5
    `);

    res.json({
      ok: true,
      data: {
        totalClientes,
        totalCarros,
        totalServicios,
        porTipo,
        ultimosServicios,
      },
    });
  } catch {
    res.status(500).json({ ok: false, error: 'Error interno del servidor.' });
  }
});

// ──────────────────────────────────────────────────────────────────────────────
// CLIENTES
// ──────────────────────────────────────────────────────────────────────────────

// GET /api/clientes
router.get('/clientes', autenticar, (_req: Request, res: Response) => {
  try {
    const clientes = queryAll(
      `SELECT id, identificacion, nombres, apellidos, correo, celular, creado_en
       FROM clientes ORDER BY creado_en DESC, id DESC`
    );
    res.json({ ok: true, data: clientes });
  } catch {
    res.status(500).json({ ok: false, error: 'Error interno del servidor.' });
  }
});

// GET /api/clientes/:identificacion
router.get('/clientes/:identificacion', autenticar, (req: Request, res: Response) => {
  try {
    const id = req.params['identificacion']?.trim();
    if (!id) {
      res.status(400).json({ ok: false, error: 'Identificación requerida.' });
      return;
    }
    const cliente = queryOne(
      `SELECT id, identificacion, nombres, apellidos, correo, celular, creado_en
       FROM clientes WHERE identificacion = ?`,
      [id]
    );
    if (!cliente) {
      res.status(404).json({
        ok: false,
        error: 'El cliente con la identificación ingresada no se encuentra registrado.',
      });
      return;
    }
    res.json({ ok: true, data: cliente });
  } catch {
    res.status(500).json({ ok: false, error: 'Error interno del servidor.' });
  }
});

// POST /api/clientes
router.post('/clientes', autenticar, (req: Request, res: Response) => {
  try {
    let { identificacion, nombres, apellidos, correo, celular } =
      req.body as {
        identificacion?: string;
        nombres?: string;
        apellidos?: string;
        correo?: string;
        celular?: string;
      };

    // Normalizar
    identificacion = identificacion?.trim() ?? '';
    nombres        = nombres?.trim() ?? '';
    apellidos      = apellidos?.trim() ?? '';
    correo         = correo?.trim().toLowerCase() ?? '';
    celular        = celular?.trim() ?? '';

    // Campos obligatorios
    if (!identificacion || !nombres || !apellidos || !correo || !celular) {
      res.status(400).json({ ok: false, error: 'Todos los campos son obligatorios.' });
      return;
    }

    // Validar correo
    if (!RE_CORREO.test(correo)) {
      res.status(400).json({
        ok: false,
        error: 'El correo electrónico no tiene un formato válido.',
      });
      return;
    }

    // Validar celular (10 dígitos)
    if (!RE_CELULAR.test(celular)) {
      res.status(400).json({
        ok: false,
        error: 'El celular debe tener exactamente 10 dígitos.',
      });
      return;
    }

    // Unicidad
    const existe = queryOne(
      `SELECT id FROM clientes WHERE identificacion = ?`,
      [identificacion]
    );
    if (existe) {
      res.status(409).json({
        ok: false,
        error: 'Ya existe un cliente registrado con esta identificación.',
      });
      return;
    }

    runWrite(
      `INSERT INTO clientes (identificacion, nombres, apellidos, correo, celular)
       VALUES (?,?,?,?,?)`,
      [identificacion, nombres, apellidos, correo, celular]
    );

    const nuevo = queryOne(
      `SELECT id, identificacion, nombres, apellidos, correo, celular, creado_en
       FROM clientes WHERE identificacion = ?`,
      [identificacion]
    );

    res.status(201).json({ ok: true, mensaje: 'Cliente registrado correctamente.', data: nuevo });
  } catch {
    res.status(500).json({ ok: false, error: 'Error interno del servidor.' });
  }
});

// ──────────────────────────────────────────────────────────────────────────────
// CARROS
// ──────────────────────────────────────────────────────────────────────────────

// GET /api/carros
router.get('/carros', autenticar, (_req: Request, res: Response) => {
  try {
    const carros = queryAll(
      `SELECT id, placa, marca, modelo, creado_en FROM carros ORDER BY creado_en DESC, id DESC`
    );
    res.json({ ok: true, data: carros });
  } catch {
    res.status(500).json({ ok: false, error: 'Error interno del servidor.' });
  }
});

// GET /api/carros/:placa
router.get('/carros/:placa', autenticar, (req: Request, res: Response) => {
  try {
    const placa = normalizarPlaca(req.params['placa'] ?? '');
    if (!placa) {
      res.status(400).json({ ok: false, error: 'Placa requerida.' });
      return;
    }
    const carro = queryOne(
      `SELECT id, placa, marca, modelo, creado_en FROM carros WHERE placa = ?`,
      [placa]
    );
    if (!carro) {
      res.status(404).json({
        ok: false,
        error: 'El carro con la placa ingresada no se encuentra registrado.',
      });
      return;
    }
    res.json({ ok: true, data: carro });
  } catch {
    res.status(500).json({ ok: false, error: 'Error interno del servidor.' });
  }
});

// POST /api/carros
router.post('/carros', autenticar, (req: Request, res: Response) => {
  try {
    let { placa, marca, modelo } =
      req.body as { placa?: string; marca?: string; modelo?: string };

    placa  = normalizarPlaca(placa ?? '');
    marca  = marca?.trim() ?? '';
    modelo = modelo?.trim() ?? '';

    if (!placa || !marca || !modelo) {
      res.status(400).json({ ok: false, error: 'Todos los campos son obligatorios.' });
      return;
    }

    if (!RE_PLACA.test(placa)) {
      res.status(400).json({
        ok: false,
        error: 'La placa debe tener el formato 3 letras seguidas de 3 números (ej: ABC123).',
      });
      return;
    }

    const existe = queryOne(`SELECT id FROM carros WHERE placa = ?`, [placa]);
    if (existe) {
      res.status(409).json({
        ok: false,
        error: 'Ya existe un carro registrado con esta placa.',
      });
      return;
    }

    runWrite(
      `INSERT INTO carros (placa, marca, modelo) VALUES (?,?,?)`,
      [placa, marca, modelo]
    );

    const nuevo = queryOne(
      `SELECT id, placa, marca, modelo, creado_en FROM carros WHERE placa = ?`,
      [placa]
    );

    res.status(201).json({ ok: true, mensaje: 'Carro registrado correctamente.', data: nuevo });
  } catch {
    res.status(500).json({ ok: false, error: 'Error interno del servidor.' });
  }
});

// ──────────────────────────────────────────────────────────────────────────────
// SERVICIOS
// ──────────────────────────────────────────────────────────────────────────────

// GET /api/servicios
router.get('/servicios', autenticar, (_req: Request, res: Response) => {
  try {
    const servicios = queryAll(`
      SELECT
        s.id, s.placa, s.identificacion, s.fecha, s.tipo_servicio, s.creado_en,
        c.nombres, c.apellidos,
        ca.marca, ca.modelo
      FROM servicios s
      JOIN clientes c  ON s.identificacion = c.identificacion
      JOIN carros   ca ON s.placa          = ca.placa
      ORDER BY s.creado_en DESC, s.id DESC
    `);
    res.json({ ok: true, data: servicios });
  } catch {
    res.status(500).json({ ok: false, error: 'Error interno del servidor.' });
  }
});

// GET /api/servicios/carro/:placa  — historial de un carro
router.get('/servicios/carro/:placa', autenticar, (req: Request, res: Response) => {
  try {
    const placa = normalizarPlaca(req.params['placa'] ?? '');
    if (!placa) {
      res.status(400).json({ ok: false, error: 'Placa requerida.' });
      return;
    }

    const carro = queryOne(
      `SELECT placa, marca, modelo FROM carros WHERE placa = ?`,
      [placa]
    );
    if (!carro) {
      res.status(404).json({
        ok: false,
        error: 'El carro con la placa ingresada no se encuentra registrado.',
      });
      return;
    }

    const servicios = queryAll(`
      SELECT
        s.id, s.placa, s.identificacion, s.fecha, s.tipo_servicio, s.creado_en,
        c.nombres, c.apellidos
      FROM servicios s
      JOIN clientes c ON s.identificacion = c.identificacion
      WHERE s.placa = ?
      ORDER BY s.fecha DESC, s.creado_en DESC, s.id DESC
    `, [placa]);

    res.json({
      ok: true,
      data: {
        placa:    carro['placa'],
        marca:    carro['marca'],
        modelo:   carro['modelo'],
        total:    servicios.length,
        servicios,
      },
    });
  } catch {
    res.status(500).json({ ok: false, error: 'Error interno del servidor.' });
  }
});

// POST /api/servicios
router.post('/servicios', autenticar, (req: Request, res: Response) => {
  try {
    let { placa, identificacion, fecha, tipo_servicio } =
      req.body as {
        placa?: string;
        identificacion?: string;
        fecha?: string;
        tipo_servicio?: string;
      };

    // Normalizar
    placa          = normalizarPlaca(placa ?? '');
    identificacion = identificacion?.trim() ?? '';
    fecha          = fecha?.trim() ?? '';
    tipo_servicio  = tipo_servicio?.trim() ?? '';

    // Obligatorios
    if (!placa || !identificacion || !fecha || !tipo_servicio) {
      res.status(400).json({ ok: false, error: 'Todos los campos son obligatorios.' });
      return;
    }

    // Formato de fecha
    if (!RE_FECHA.test(fecha)) {
      res.status(400).json({
        ok: false,
        error: 'La fecha debe tener el formato AAAA-MM-DD.',
      });
      return;
    }

    // Fecha válida real
    const fechaObj = new Date(fecha + 'T12:00:00');
    if (isNaN(fechaObj.getTime())) {
      res.status(400).json({ ok: false, error: 'La fecha ingresada no es válida.' });
      return;
    }

    // Tipo de servicio permitido
    if (!(TIPOS_VALIDOS as readonly string[]).includes(tipo_servicio)) {
      res.status(400).json({
        ok: false,
        error: `Tipo de servicio no válido. Opciones: ${TIPOS_VALIDOS.join(', ')}.`,
      });
      return;
    }

    // Existencia del carro
    const carro = queryOne(`SELECT placa FROM carros WHERE placa = ?`, [placa]);
    if (!carro) {
      res.status(404).json({
        ok: false,
        error: 'El carro ingresado no está registrado.',
      });
      return;
    }

    // Existencia del cliente
    const cliente = queryOne(
      `SELECT identificacion FROM clientes WHERE identificacion = ?`,
      [identificacion]
    );
    if (!cliente) {
      res.status(404).json({
        ok: false,
        error: 'El cliente ingresado no está registrado.',
      });
      return;
    }

    runWrite(
      `INSERT INTO servicios (placa, identificacion, fecha, tipo_servicio)
       VALUES (?,?,?,?)`,
      [placa, identificacion, fecha, tipo_servicio]
    );

    const nuevo = queryOne(`
      SELECT
        s.id, s.placa, s.identificacion, s.fecha, s.tipo_servicio, s.creado_en,
        c.nombres, c.apellidos,
        ca.marca, ca.modelo
      FROM servicios s
      JOIN clientes c  ON s.identificacion = c.identificacion
      JOIN carros   ca ON s.placa          = ca.placa
      WHERE s.id = (SELECT MAX(id) FROM servicios WHERE placa = ? AND identificacion = ?)
    `, [placa, identificacion]);

    res.status(201).json({
      ok: true,
      mensaje: 'Servicio registrado correctamente.',
      data: nuevo,
    });
  } catch {
    res.status(500).json({ ok: false, error: 'Error interno del servidor.' });
  }
});

export default router;
