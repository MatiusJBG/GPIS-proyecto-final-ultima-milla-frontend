import {existsSync} from 'node:fs';
import {resolve} from 'node:path';
import {spawnSync} from 'node:child_process';

const requiredEnvironment = [
  'BACKEND_COURIERS_DIR',
  'BACKEND_COURIERS_COMMIT',
  'DATABASE_PACKAGE_DIR',
  'MOBILE_COURIERS_API_URL',
  'MOBILE_DEMO_COURIER_ID',
];

for (const variable of requiredEnvironment) {
  if (!process.env[variable]) {
    throw new Error(`${variable} es obligatorio para ejecutar la prueba móvil real.`);
  }
}

const backendDirectory = resolve(process.env.BACKEND_COURIERS_DIR);
const databaseDirectory = resolve(process.env.DATABASE_PACKAGE_DIR);
if (!existsSync(backendDirectory) || !existsSync(databaseDirectory)) {
  throw new Error('BACKEND_COURIERS_DIR y DATABASE_PACKAGE_DIR deben apuntar a artefactos S2 recibidos.');
}

const receivedRevision = run('git', ['-C', backendDirectory, 'rev-parse', 'HEAD']).trim();
if (receivedRevision !== process.env.BACKEND_COURIERS_COMMIT) {
  throw new Error('El commit de Couriers no coincide con BACKEND_COURIERS_COMMIT; no se ejecuta contra una base no fijada.');
}

const mobileDirectory = resolve(import.meta.dirname, '../../mobile');
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const result = spawnSync(npm, ['run', 'test:e2e'], {
  cwd: mobileDirectory,
  env: process.env,
  stdio: 'inherit',
});

process.exit(result.status ?? 1);

function run(command, args) {
  const result = spawnSync(command, args, {encoding: 'utf8'});
  if (result.status !== 0) {
    throw new Error(result.stderr || `No se pudo ejecutar ${command}.`);
  }
  return result.stdout;
}
