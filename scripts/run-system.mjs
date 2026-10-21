import { spawnSync, execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import process from 'node:process';

const directory = process.env.BACKEND_DIR;
if (!directory) throw new Error('Configura BACKEND_DIR con el clon backend a verificar.');
const backend = resolve(directory);
if (!existsSync(resolve(backend, 'scripts/run-postgres-integration.mjs'))) throw new Error('BACKEND_DIR no contiene el harness canónico.');
const revision = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: backend, encoding: 'utf8' }).trim();
const expected = process.env.BACKEND_COMMIT;
if (expected && (!/^[0-9a-f]{40}$/.test(expected) || expected !== revision)) throw new Error('La revisión backend no coincide con BACKEND_COMMIT.');
if (!process.env.DATABASE_PACKAGE_DIR) throw new Error('Configura DATABASE_PACKAGE_DIR con el paquete DB verificado.');
const manifest = JSON.parse(readFileSync(resolve(backend, '.ci/database-package.json'), 'utf8'));
const command = resolve('scripts/run-system-browser.mjs');
const result = spawnSync(process.execPath, ['scripts/run-postgres-integration.mjs', '--', process.execPath, command], {
  cwd: backend, stdio: 'inherit', timeout: 660_000,
  env: { ...process.env, BACKEND_DIR: backend, FRONTEND_DIR: process.cwd(),
    DATABASE_PACKAGE_DIR: resolve(process.env.DATABASE_PACKAGE_DIR), POSTGRES_IMAGE: manifest.postgresImage },
});
if (result.error) throw result.error;
process.exitCode = result.status ?? 1;
