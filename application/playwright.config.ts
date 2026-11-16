import { defineConfig } from '@playwright/test';
import { channel } from './tests/navigateur.ts';
import { robustesse } from './tests/playwright-commun.ts';

export default defineConfig({
  testDir: './tests',
  ...robustesse,
  use: { baseURL: 'http://localhost:5173', headless: true, channel },
  webServer: {
    command: 'npm run dev:frontend',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});
