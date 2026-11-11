import { defineConfig } from '@playwright/test';
import { channel } from './tests/navigateur.js';

export default defineConfig({
  testDir: './tests',
  use: { baseURL: 'http://localhost:5173', headless: true, channel },
  webServer: {
    command: 'npm run dev:frontend',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});
