import { defineConfig } from '@playwright/test';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

export default defineConfig({
  testDir: './tests',
  testMatch: 'workspace-ui.spec.js',
  workers: 1,
  timeout: 30_000,
  use: { baseURL: 'http://127.0.0.1:5174', headless: true, channel: 'chrome', trace: 'retain-on-failure' },
  webServer: {
    command: 'npm run dev:ui -- --port 5174',
    url: 'http://127.0.0.1:5174/api/workspace',
    reuseExistingServer: false,
    env: {
      ASTER_UI_ROLE: 'admin',
      ASTER_UI_STATE_FILE: join(tmpdir(), `aster-workspace-test-${process.pid}-${Date.now()}.json`),
    },
  },
});
