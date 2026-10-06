/**
 * server/db.ts
 * Gestión de la base de datos SQLite con sql.js.
 * Trabaja en memoria y persiste en data/serviteca.sqlite.
 * Al arrancar crea las tablas si no existen y carga los datos iniciales.
 */

import { createRequire } from 'module';
import { existsSync, readFileSync, writeFileSync, renameSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import {
  randomBytes,
  pbkdf2Sync,
  createHash,
  timingSafeEqual,
} from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);
const require    = createRequire(import.meta.url);

// ── Rutas de archivos ──
const DATA_DIR = resolve(__dirname, '../data');
const DB_PATH  = resolve(DATA_DIR, 'serviteca.sqlite');
const DB_TMP   = resolve(DATA_DIR, 'serviteca.tmp.sqlite');

// ── Tipos ──
export interface DbRow {
  [key: string]: string | number | null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let SQL: any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let db: any;

// ──────────────────────────────────────────────────────────────────────────────
// Inicialización
// ──────────────────────────────────────────────────────────────────────────────

export async function initDb(): Promise<void> {
  const initSqlJs = require('sql.js') as (opts?: object) => Promise<typeof SQL>;
  SQL = await initSqlJs();

  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }

  if (existsSync(DB_PATH)) {
    const fileBuffer = readFileSync(DB_PATH);
    db = new SQL.Database(fileBuffer);
    console.log('[DB] Base de datos cargada desde', DB_PATH);
  } else {
    db = new SQL.Database();
    console.log('[DB] Nueva base de datos creada');
  }

  db.run('PRAGMA foreign_keys = ON;');
  createSchema();
  seedData();
  persistDb();
  console.log('[DB] Esquema y datos listos.');
}

/** Persiste la BD en disco de forma atómica (escribe temporal → renombra). */
export function persistDb(): void {
  const data: Uint8Array = db.export() as Uint8Array;
  writeFileSync(DB_TMP, Buffer.from(data));
  renameSync(DB_TMP, DB_PATH);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getDb(): any { return db; }

// ──────────────────────────────────────────────────────────────────────────────
// Esquema
// ──────────────────────────────────────────────────────────────────────────────

function createSchema(): void {
  db.run(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario       TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      salt          TEXT NOT NULL,
      nombre        TEXT NOT NULL,
      rol           TEXT NOT NULL DEFAULT 'OPERARIO',
      creado_en     TEXT NOT NULL DEFAULT (datetime('now','localtime'))
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS clientes (
      id             INTEGER PRIMARY KEY AUTOINCREMENT,
      identificacion TEXT NOT NULL UNIQUE,
      nombres        TEXT NOT NULL,
      apellidos      TEXT NOT NULL,
      correo         TEXT NOT NULL,
      celular        TEXT NOT NULL,
      creado_en      TEXT NOT NULL DEFAULT (datetime('now','localtime'))
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS carros (
      id        INTEGER PRIMARY KEY AUTOINCREMENT,
      placa     TEXT NOT NULL UNIQUE,
      marca     TEXT NOT NULL,
      modelo    TEXT NOT NULL,
      creado_en TEXT NOT NULL DEFAULT (datetime('now','localtime'))
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS servicios (
      id             INTEGER PRIMARY KEY AUTOINCREMENT,
      placa          TEXT NOT NULL,
      identificacion TEXT NOT NULL,
      fecha          TEXT NOT NULL,
      tipo_servicio  TEXT NOT NULL CHECK(tipo_servicio IN (
                       'Cambio de aceite','Sincronización','Alineación','Lavado'
                     )),
      creado_en      TEXT NOT NULL DEFAULT (datetime('now','localtime')),
      FOREIGN KEY (placa)          REFERENCES carros(placa)            ON DELETE RESTRICT,
      FOREIGN KEY (identificacion) REFERENCES clientes(identificacion) ON DELETE RESTRICT
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS sesiones (
      token_hash TEXT PRIMARY KEY,
      usuario_id INTEGER NOT NULL,
      creado_en  TEXT NOT NULL DEFAULT (datetime('now','localtime')),
      expira_en  TEXT NOT NULL,
      FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
    );
  `);
}

// ──────────────────────────────────────────────────────────────────────────────
// Datos iniciales (seed)
// ──────────────────────────────────────────────────────────────────────────────

function seedData(): void {
  const resultado = db.exec('SELECT COUNT(*) as c FROM usuarios;') as
    { columns: string[]; values: (number | null)[][] }[];
  const count = resultado[0]?.values[0][0] as number;
  if (count > 0) return;

  console.log('[DB] Insertando datos iniciales...');

  // Usuario admin
  const { hash, salt } = hashPassword('admin123');
  db.run(
    `INSERT INTO usuarios (usuario, password_hash, salt, nombre, rol)
     VALUES (?,?,?,?,?)`,
    ['admin', hash, salt, 'Administrador', 'ADMIN']
  );

  // Clientes
  const clientes = [
    ['1001234567', 'Juan Carlos',   'Pérez Gómez',   'juan.perez@correo.com',   '3001234567'],
    ['1009876543', 'María Fernanda','López Torres',   'mfernanda@email.com',     '3109876543'],
    ['1005551234', 'Carlos Andrés', 'Ramírez Silva',  'carlos.ramirez@web.com',  '3205551234'],
  ];
  for (const c of clientes) {
    db.run(
      `INSERT INTO clientes (identificacion,nombres,apellidos,correo,celular)
       VALUES (?,?,?,?,?)`,
      c
    );
  }

  // Carros
  const carros = [
    ['ABC123', 'Toyota',    'Corolla 2020'],
    ['XYZ789', 'Chevrolet', 'Spark 2021'],
    ['DEF456', 'Renault',   'Logan 2019'],
  ];
  for (const c of carros) {
    db.run(`INSERT INTO carros (placa,marca,modelo) VALUES (?,?,?)`, c);
  }

  // Servicios – ABC123 tiene 2 (uno de ellos Lavado)
  const servicios: [string, string, string, string][] = [
    ['ABC123', '1001234567', daysAgo(2), 'Cambio de aceite'],
    ['ABC123', '1009876543', daysAgo(5), 'Lavado'],
    ['XYZ789', '1005551234', daysAgo(3), 'Sincronización'],
    ['DEF456', '1001234567', daysAgo(7), 'Alineación'],
  ];
  for (const s of servicios) {
    db.run(
      `INSERT INTO servicios (placa,identificacion,fecha,tipo_servicio)
       VALUES (?,?,?,?)`,
      s
    );
  }

  console.log('[DB] Datos iniciales insertados.');
}

// ──────────────────────────────────────────────────────────────────────────────
// Criptografía
// ──────────────────────────────────────────────────────────────────────────────

/** PBKDF2-SHA512 con 210 000 iteraciones. Retorna hex. */
export function hashPassword(password: string): { hash: string; salt: string } {
  const salt = randomBytes(32).toString('hex');
  const hash = pbkdf2Sync(password, salt, 210_000, 64, 'sha512').toString('hex');
  return { hash, salt };
}

/** Compara contraseña con hash almacenado usando timingSafeEqual. */
export function verifyPassword(
  password: string,
  storedHash: string,
  salt: string
): boolean {
  const derived = pbkdf2Sync(password, salt, 210_000, 64, 'sha512');
  const stored  = Buffer.from(storedHash, 'hex');
  if (derived.length !== stored.length) return false;
  return timingSafeEqual(derived, stored);
}

/** Genera token de 32 bytes aleatorios; retorna el token en claro y su hash SHA-256. */
export function generateToken(): { token: string; tokenHash: string } {
  const token     = randomBytes(32).toString('hex');
  const tokenHash = createHash('sha256').update(token).digest('hex');
  return { token, tokenHash };
}

/** Hashea un token con SHA-256. */
export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

// ──────────────────────────────────────────────────────────────────────────────
// Helpers de consulta
// ──────────────────────────────────────────────────────────────────────────────

/** Ejecuta un SELECT y devuelve array de objetos. */
export function queryAll(
  sql: string,
  params: (string | number | null)[] = []
): DbRow[] {
  const result = db.exec(sql, params) as
    { columns: string[]; values: (string | number | null)[][] }[];
  if (!result || result.length === 0) return [];
  const { columns, values } = result[0];
  return values.map(row => {
    const obj: DbRow = {};
    columns.forEach((col, i) => { obj[col] = row[i]; });
    return obj;
  });
}

/** Primer resultado o null. */
export function queryOne(
  sql: string,
  params: (string | number | null)[] = []
): DbRow | null {
  const rows = queryAll(sql, params);
  return rows.length > 0 ? rows[0] : null;
}

/** Ejecuta escritura (INSERT / UPDATE / DELETE) y persiste en disco. */
export function runWrite(
  sql: string,
  params: (string | number | null)[] = []
): void {
  db.run(sql, params);
  persistDb();
}

// ──────────────────────────────────────────────────────────────────────────────
// Utilidades
// ──────────────────────────────────────────────────────────────────────────────

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}
