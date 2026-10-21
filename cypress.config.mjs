import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig } from 'cypress';
import process from 'node:process';

export default defineConfig({
  e2e: {
    baseUrl: 'http://127.0.0.1:5173',
    specPattern: 'cypress/e2e/**/*.cy.js',
    supportFile: false,
    setupNodeEvents(on) {
      on('task', {
        recordAcceptance(data) {
          const directory = resolve(process.env.E2E_REPORT_DIR ?? 'reports/e2e');
          mkdirSync(directory, { recursive: true });
          writeFileSync(resolve(directory, 'data.json'), JSON.stringify(data, null, 2) + '\n');
          return null;
        },
      });
    },
    env: { apiUrl: process.env.E2E_API_URL ?? 'http://127.0.0.1:3000' },
    video: false,
  },
});
