/* Réglages communs des tests d'interface (playwright.config.ts, playwright.workspace.config.ts).
   Sur la CI, machines plus lentes et serveur de développement à froid : délais élargis et une reprise. Un test
   repris passe en « flaky » dans le rapport (annotation GitHub) : il signale une instabilité à corriger, sans bloquer
   le déploiement. En local, aucune reprise : une instabilité se voit tout de suite. */
import type { PlaywrightTestConfig } from '@playwright/test';

const ci = Boolean(process.env.CI);

export const robustesse: Pick<PlaywrightTestConfig, 'timeout' | 'expect' | 'retries' | 'reporter'> = {
  timeout: ci ? 90_000 : 30_000,
  expect: { timeout: ci ? 15_000 : 5_000 },
  retries: ci ? 1 : 0,
  reporter: ci ? [['list'], ['github']] : 'list',
};
