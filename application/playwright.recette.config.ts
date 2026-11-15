import { defineConfig } from '@playwright/test';
import { channel } from './tests/navigateur.ts';

/* Recette sur l'application déployée (VM) : npm run test:recette. Aucun serveur local ; les tests s'enchaînent dans
   l'ordre, un à la fois, pour rester sous les limites de débit de HAProxy. Voir tests/recette-vm.recette.ts. */
export default defineConfig({
  testDir: './tests',
  testMatch: 'recette-vm.recette.ts',
  workers: 1,
  timeout: 180_000,
  reporter: [['list'], ['html', { outputFolder: 'playwright-report/recette', open: 'never' }]],
  use: {
    baseURL: process.env.RECETTE_URL || 'https://172.16.131.188',
    ignoreHTTPSErrors: true, // autorité ORION non installée sur le poste qui lance la recette
    headless: true,
    channel,
    locale: 'fr-FR',
    timezoneId: 'Europe/Paris',
    trace: 'retain-on-failure',
  },
});
