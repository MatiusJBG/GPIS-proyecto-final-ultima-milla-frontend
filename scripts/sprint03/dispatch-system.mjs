/* global console */
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import process from 'node:process';

/**
 * Orquestador de prueba de sistema para el submódulo de Despacho (Sprint 3 · Alexis López).
 * Ejecuta el caso automatizado S3-CP-004 contra APIs y base de datos PostgreSQL reales.
 */

const requiredEnvironment = [
  'DATABASE_PACKAGE_DIR',
];

for (const variable of requiredEnvironment) {
  if (!process.env[variable]) {
    console.error(`[dispatch-system] ERROR: ${variable} es obligatorio para ejecutar la prueba de sistema de Despacho.`);
    process.exit(1);
  }
}

const databaseDirectory = resolve(process.env.DATABASE_PACKAGE_DIR);
if (!existsSync(databaseDirectory)) {
  console.error(`[dispatch-system] ERROR: DATABASE_PACKAGE_DIR (${databaseDirectory}) no existe o no es accesible.`);
  process.exit(1);
}

// Verificación opcional de revisiones congeladas de backend S2 (Routes y Couriers)
if (process.env.BACKEND_ROUTES_DIR) {
  const routesDir = resolve(process.env.BACKEND_ROUTES_DIR);
  if (!existsSync(routesDir)) {
    console.error(`[dispatch-system] ERROR: BACKEND_ROUTES_DIR no existe.`);
    process.exit(1);
  }
  if (process.env.BACKEND_ROUTES_COMMIT) {
    const revision = run('git', ['-C', routesDir, 'rev-parse', 'HEAD']).trim();
    if (revision !== process.env.BACKEND_ROUTES_COMMIT) {
      console.error(`[dispatch-system] ERROR: El commit de Routes (${revision}) no coincide con BACKEND_ROUTES_COMMIT (${process.env.BACKEND_ROUTES_COMMIT}).`);
      process.exit(1);
    }
  }
}

if (process.env.BACKEND_COURIERS_DIR) {
  const couriersDir = resolve(process.env.BACKEND_COURIERS_DIR);
  if (!existsSync(couriersDir)) {
    console.error(`[dispatch-system] ERROR: BACKEND_COURIERS_DIR no existe.`);
    process.exit(1);
  }
  if (process.env.BACKEND_COURIERS_COMMIT) {
    const revision = run('git', ['-C', couriersDir, 'rev-parse', 'HEAD']).trim();
    if (revision !== process.env.BACKEND_COURIERS_COMMIT) {
      console.error(`[dispatch-system] ERROR: El commit de Couriers (${revision}) no coincide con BACKEND_COURIERS_COMMIT (${process.env.BACKEND_COURIERS_COMMIT}).`);
      process.exit(1);
    }
  }
}

const routesApiUrl = process.env.VITE_ROUTES_API_BASE_URL || process.env.ROUTES_API_URL || process.env.VITE_API_BASE_URL || 'http://127.0.0.1:3000';
const couriersApiUrl = process.env.VITE_COURIERS_API_BASE_URL || process.env.COURIERS_API_URL || process.env.VITE_API_BASE_URL || 'http://127.0.0.1:3000';

console.log('[dispatch-system] Iniciando verificación S3-CP-004 de Despacho...');
console.log(`[dispatch-system] Routes API:   ${routesApiUrl}`);
console.log(`[dispatch-system] Couriers API: ${couriersApiUrl}`);
console.log(`[dispatch-system] Database:     ${databaseDirectory}`);

const rootDir = resolve(import.meta.dirname, '../..');
const npx = process.platform === 'win32' ? 'npx.cmd' : 'npx';

const cypressArgs = [
  'cypress',
  'run',
  '--spec',
  'cypress/e2e/sprint03-dispatch.cy.js',
  '--browser',
  process.env.CYPRESS_BROWSER || 'electron',
  '--env',
  `routesApiUrl=${routesApiUrl},couriersApiUrl=${couriersApiUrl}`,
];

const result = spawnSync(npx, cypressArgs, {
  cwd: rootDir,
  env: {
    ...process.env,
    VITE_ROUTES_API_BASE_URL: routesApiUrl,
    VITE_COURIERS_API_BASE_URL: couriersApiUrl,
  },
  stdio: 'inherit',
});

if (result.error) {
  console.error('[dispatch-system] Error al invocar Cypress:', result.error.message);
  process.exit(1);
}

process.exit(result.status ?? 1);

function run(command, args) {
  const cmdResult = spawnSync(command, args, { encoding: 'utf8' });
  if (cmdResult.status !== 0) {
    throw new Error(cmdResult.stderr || `No se pudo ejecutar ${command}.`);
  }
  return cmdResult.stdout;
}

