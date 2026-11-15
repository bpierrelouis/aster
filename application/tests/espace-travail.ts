// Outils communs aux tests de l'espace de travail (mode interface seule, port 5174)
import { test as base, expect } from '@playwright/test';
import { displayPrefs } from '#shared/ambiance.ts';
import type { APIRequestContext, Locator, Page } from '@playwright/test';
import type { WorkspaceView } from '#shared/types.ts';

const origin = 'http://127.0.0.1:5174';

export { expect };

export const test = base.extend<{ preparation: void }>({
  preparation: [async ({ page, request }, use) => {
    // Police embarquée (Marianne) pour tous les tests : la police système (Segoe UI sous Windows, plus large sous la
    // CI Linux) change la largeur des libellés, donc les seuils de repli des onglets (is-compact, is-tight, is-icons).
    await page.addInitScript(() => {
      document.addEventListener('DOMContentLoaded', () => {
        const style = document.createElement('style');
        style.textContent = ':root:root:root { --font-text: Marianne, sans-serif; --font-display: Marianne, sans-serif; }';
        document.head.append(style);
      });
    });
    // L'apparence est enregistrée par compte sur le serveur, partagé par tous les tests : chacun part de l'apparence par défaut
    const { revision, role } = await state(request);
    const response = await request.put('/api/workspace', { data: { baseRevision: revision, state: { role, prefs: displayPrefs() } }, headers: { origin } });
    expect(response.ok()).toBeTruthy();
    await use();
  }, { auto: true }],
});

// Le titre de chaque écran est réservé aux lecteurs d'écran : présent, mais non affiché
export async function open(page: Page, route: string) {
  await page.goto(route);
  await expect(page.locator('#view h1')).toBeAttached();
  await expect(page.locator('.loading')).toHaveCount(0);
  await page.evaluate(() => document.fonts.ready);
}

export async function state(request: APIRequestContext): Promise<WorkspaceView> {
  const response = await request.get('/api/workspace');
  expect(response.ok()).toBeTruthy();
  return response.json();
}

/** Mode interface seule : change le compte courant du serveur */
export async function asAccount(request: APIRequestContext, id: string) {
  expect((await request.post('/api/dev/compte', { data: { id }, headers: { origin } })).ok()).toBeTruthy();
}

export async function pick(page: Page, control: Locator, name: string | RegExp) {
  if (await control.getAttribute('aria-expanded') !== 'true') await control.click();
  await page.getByRole('listbox').getByRole('option', { name, exact: typeof name === 'string' }).click();
  await expect(control).toHaveAttribute('aria-expanded', 'false');
}
