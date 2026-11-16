import { defineConfig } from '@playwright/test';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { channel } from './tests/navigateur.ts';
import { robustesse } from './tests/playwright-commun.ts';

export default defineConfig({
  testDir: './tests',
  testMatch: 'espace-*.spec.ts',
  workers: 1,
  ...robustesse,
  use: { baseURL: 'http://127.0.0.1:5174', headless: true, channel, trace: 'retain-on-failure' },
  webServer: {
    command: 'npm run dev:ui -- --port 5174',
    url: 'http://127.0.0.1:5174/api/workspace',
    reuseExistingServer: false,
    env: {
      ORION_UI_ROLE: 'admin',
      ORION_UI_STATE_FILE: join(tmpdir(), `orion-workspace-test-${process.pid}-${Date.now()}.json`),
    },
  },
});
