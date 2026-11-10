import { test, expect } from '@playwright/test';
import { expectPublicPresentation } from './presentation.js';

// Public screen only: no identity provider is simulated as a successful login.
test('la page publique affiche le bouton et reste utilisable sur mobile', async ({ page }) => {
  await page.route('**/api/me', (route) => route.fulfill({ status: 401, contentType: 'application/json', body: '{"error":"Connexion nécessaire."}' }));
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('ASTER');
  await expect(page.getByRole('link', { name: "S'identifier avec MinDefConnect" })).toHaveAttribute('href', '/auth/login');
  await expectPublicPresentation(page);
  const button = page.getByRole('link', { name: "S'identifier avec MinDefConnect" });
  // Couleurs de référence MindefConnect : texte blanc sur fond #000091
  await expect(button).toHaveCSS('color', 'rgb(255, 255, 255)');
  await expect(button).toHaveCSS('background-color', 'rgb(0, 0, 145)');
  // Bouton centré horizontalement et visible sans défilement
  const expectCenteredButton = async () => {
    const box = await button.boundingBox();
    const viewport = page.viewportSize();
    expect(Math.abs(box.x + box.width / 2 - viewport.width / 2)).toBeLessThanOrEqual(1);
    expect(box.y + box.height).toBeLessThanOrEqual(viewport.height);
  };
  await expectCenteredButton();
  await page.screenshot({ path: 'test-results/connexion-desktop.png', fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.getByRole('link', { name: "S'identifier avec MinDefConnect" })).toBeVisible();
  await expectPublicPresentation(page);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await expectCenteredButton();
  await page.screenshot({ path: 'test-results/connexion-mobile.png', fullPage: true });
});

test('un serveur indisponible affiche une erreur et non une fausse session', async ({ page }) => {
  await page.route('**/api/me', (route) => route.fulfill({ status: 503, contentType: 'application/json', body: '{}' }));
  await page.goto('/');
  await expect(page.getByRole('alert')).toContainText('connexion est momentanément indisponible');
  await expectPublicPresentation(page);
  await expect(page.getByRole('heading', { name: /Bienvenue/ })).toHaveCount(0);
});
