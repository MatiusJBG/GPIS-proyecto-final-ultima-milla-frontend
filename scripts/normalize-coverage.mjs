import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { isAbsolute, resolve, relative } from 'node:path';
import process from 'node:process';

// Normalize only LCOV source paths for scanners running in Linux containers.
// Counts and branch/function records remain exactly as measured by c8.
const file = resolve('coverage/lcov.info');
const report = readFileSync(file, 'utf8').replace(/^SF:(.+)$/gm, (_line, source) => {
  const normalized = source.trim().replaceAll('\\', '/');
  const local = relative(process.cwd(), resolve(normalized));
  if (isAbsolute(normalized) || local.startsWith('..') || !existsSync(normalized)) {
    throw new Error(`LCOV source outside the application: ${normalized}`);
  }
  return `SF:${normalized}`;
});
writeFileSync(file, report);
