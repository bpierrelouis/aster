/* Navigateur des tests Playwright : Google Chrome s'il est installé (postes de développement, machines de la CI),
   sinon le Chromium fourni par Playwright (npx playwright install chromium). */
import { existsSync } from 'node:fs';

const CHROME = {
  darwin: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  linux: '/opt/google/chrome/chrome',
  win32: `${process.env.PROGRAMFILES}\\Google\\Chrome\\Application\\chrome.exe`,
};

export const channel = existsSync(CHROME[process.platform] ?? '') ? 'chrome' : undefined;
