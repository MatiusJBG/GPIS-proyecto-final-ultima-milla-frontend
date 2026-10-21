import { execFileSync } from 'node:child_process';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import process from 'node:process';
import { createServer } from 'vite';
import cypress from 'cypress';

const frontend = resolve(process.env.FRONTEND_DIR);
const backend = resolve(process.env.BACKEND_DIR);
const reports = resolve(frontend, process.env.E2E_REPORT_DIR ?? 'reports/e2e');
mkdirSync(reports, { recursive: true });
const revision = directory => execFileSync('git', ['rev-parse', 'HEAD'], { cwd: directory, encoding: 'utf8' }).trim();
const contract = JSON.parse(readFileSync(resolve(frontend, 'docs/contracts/version.json'), 'utf8'));
const canonical = readFileSync(resolve(backend, contract.path), 'utf8').replaceAll('\r\n', '\n');
if (createHash('sha256').update(canonical).digest('hex') !== contract.sha256) throw new Error('Contrato backend incompatible con la revisión frontend.');
const port = Number(process.env.E2E_WEB_PORT ?? '5173');
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('E2E_WEB_PORT inválido.');
const origin = `http://127.0.0.1:${port}`;
const { createDatabaseClient } = await import(pathToFileURL(resolve(backend, 'dist/bootstrap/database.js')).href);
const { createPersistedApp } = await import(pathToFileURL(resolve(backend, 'dist/bootstrap/create-persisted-app.js')).href);
const database = createDatabaseClient(process.env.TEST_DATABASE_URL);
let api;
let web;
try {
  await database.$connect();
  const app = createPersistedApp(database, origin);
  api = await new Promise((done, reject) => { const server = app.listen(0, '127.0.0.1', () => done(server)); server.once('error', reject); });
  const apiUrl = `http://127.0.0.1:${api.address().port}`;
  process.env.VITE_API_BASE_URL = apiUrl;
  process.env.E2E_API_URL = apiUrl;
  process.env.E2E_REPORT_DIR = reports;
  delete process.env.ELECTRON_RUN_AS_NODE;
  web = await createServer({ root: frontend, server: { host: '127.0.0.1', port, strictPort: true, hmr: false } });
  await web.listen();
  const results = await cypress.run({ project: frontend, configFile: resolve(frontend, 'cypress.config.mjs'),
    browser: 'electron', headed: false, config: { baseUrl: origin }, env: { apiUrl },
    reporter: 'junit', reporterOptions: { mochaFile: resolve(reports, 'cp-015-[hash].xml'), toConsole: true } });
  const passed = !('failures' in results) && results.totalFailed === 0 && results.totalPassed >= 2;
  const evidence = { recordedAt: new Date().toISOString(), backendCommit: revision(backend), frontendCommit: revision(frontend),
    contract, postgresImage: process.env.POSTGRES_IMAGE, databaseProject: process.env.TEST_DATABASE_PROJECT,
    result: passed ? 'PASS' : 'FAIL', totalPassed: results.totalPassed ?? 0, totalFailed: results.totalFailed ?? results.failures ?? 1,
    runs: results.runs?.map(run => ({ spec: run.spec.relative, tests: run.tests.map(test => ({ title: test.title, state: test.state })) })) ?? [] };
  writeFileSync(resolve(reports, 'acceptance.json'), JSON.stringify(evidence, null, 2) + '\n');
  if (!passed) throw new Error('CP-015 no aprobado; revisar el reporte Cypress.');
} finally {
  await web?.close();
  if (api) { api.closeAllConnections(); await new Promise(done => api.close(done)); }
  await database.$disconnect();
}
