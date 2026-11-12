/* Navigateur des tests Playwright : Google Chrome s'il est installé (postes de développement, machines de la CI),
   sinon le Chromium fourni par Playwright (npx playwright install chromium).
   Types du code exécuté dans la page (page.evaluate) : DOM et window.orion, exposé par l'interface (workspace.tsx). */
/// <reference lib="dom" />
import { existsSync } from 'node:fs';
import type { WorkspaceView } from '#shared/types.ts';

declare global {
  /** Partie du magasin de l'interface utilisée par les tests */
  interface Window {
    orion: {
      store: {
        state: WorkspaceView;
        subscribe(fn: (topic: string) => void): () => void;
        update(topic: string, mutator: (s: WorkspaceView) => void): void;
        flush(): Promise<void>;
      };
    };
  }
}

const CHROME: Partial<Record<NodeJS.Platform, string>> = {
  darwin: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  linux: '/opt/google/chrome/chrome',
  win32: `${process.env.PROGRAMFILES}\\Google\\Chrome\\Application\\chrome.exe`,
};

export const channel = existsSync(CHROME[process.platform] ?? '') ? 'chrome' : undefined;
