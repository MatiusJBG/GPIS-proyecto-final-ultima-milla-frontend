import { defineConfig } from 'cypress';
import process from 'node:process';

export default defineConfig({
  e2e: {
    baseUrl: 'http://127.0.0.1:5173',
    specPattern: 'cypress/e2e/**/*.cy.js',
    supportFile: false,
    env: { apiUrl: process.env.E2E_API_URL ?? 'http://127.0.0.1:3000' },
    video: false,
  },
});
