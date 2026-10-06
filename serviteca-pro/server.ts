/**
 * server.ts
 * Servidor principal: entrega el frontend (Vite como middleware)
 * y la API REST en el mismo puerto 3000.
 */

import express, { Request, Response, NextFunction } from 'express';
import ViteExpress from 'vite-express';
import { initDb } from './server/db.js';
import router from './server/routes.js';

const app  = express();
const PORT = Number(process.env['PORT'] ?? 3000);

// ── Parsear JSON ──
app.use(express.json());

// ── API REST ──
app.use('/api', router);

// ── Manejador global de errores (no expone detalles internos) ──
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[ERROR]', err.message);
  res.status(500).json({ ok: false, error: 'Error interno del servidor.' });
});

// ── Arrancar ──
async function main() {
  try {
    await initDb();
    ViteExpress.listen(app, PORT, () => {
      console.log(`\n🚗  Serviteca PRO  →  http://localhost:${PORT}`);
      console.log(`    API Health    →  http://localhost:${PORT}/api/health\n`);
    });
  } catch (error) {
    console.error('[FATAL] No se pudo iniciar el servidor:', error);
    process.exit(1);
  }
}

main();
