import { test, expect } from '@playwright/test';
import { expectPublicPresentation } from './presentation.js';

// Requires real PostgreSQL, Keycloak and the Express server. No mocked authentication.
for (const [username, profile] of [
  ['superadmin', 'Super administrateur'], ['admin', 'Administrateur'],
  ['gestionnaire', 'Gestionnaire'], ['formateur', 'Formateur'],
]) {
  test(`${profile} : connexion vide, session persistante et déconnexion`, async ({ page }) => {
    const anonymous = await page.request.get('/api/me');
    expect(anonymous.status()).toBe(401);
    await page.goto('/');
    await page.getByRole('link', { name: "S'identifier avec MinDefConnect" }).click();
    await expect(page).toHaveURL(/localhost:8081/);
    await expectPublicPresentation(page);
    await expect(page.getByRole('list')).toHaveCount(0);
    await expect(page.getByText(/superadmin@aster\.demo|gestionnaire@aster\.demo|formateur@aster\.demo/)).toHaveCount(0);
    if (username === 'superadmin') {
      await page.setViewportSize({ width: 2048, height: 1118 });
      await page.waitForLoadState('networkidle');
      await page.getByRole('heading', { name: 'MindefConnect', exact: true }).click();
      await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
      await page.screenshot({ path: 'test-results/mindef-form-desktop.png', fullPage: true });
      await page.setViewportSize({ width: 390, height: 844 });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
      await page.screenshot({ path: 'test-results/mindef-form-mobile.png', fullPage: true });
      await page.setViewportSize({ width: 1280, height: 800 });
      await expect(page.locator('#password')).toHaveAttribute('readonly', '');
      await page.getByLabel('Afficher', { exact: true }).check();
      await expect(page.locator('#password')).toHaveAttribute('type', 'text');
      await page.getByRole('button', { name: 'Créer un compte', exact: true }).click();
      await expect(page.getByRole('dialog')).toContainText('Pour demander un accès à ASTER, contactez votre administrateur.');
      await expectPublicPresentation(page);
      await page.getByRole('button', { name: 'Fermer', exact: true }).click();
      await page.getByRole('button', { name: 'Mot de passe oublié?', exact: true }).click();
      await expect(page.getByRole('dialog')).toContainText('Pour obtenir de l’aide concernant votre accès, contactez votre administrateur.');
      await expectPublicPresentation(page);
      await page.getByRole('button', { name: 'Fermer', exact: true }).click();
    }
    await page.getByLabel('email', { exact: true }).fill(`${username}@aster.demo`);
    await expect(page.locator('#password')).toHaveValue('');
    await page.getByRole('button', { name: 'Se connecter', exact: true }).click();
    await expect(page.getByRole('heading', { name: profile, exact: true })).toBeVisible();
    await expectPublicPresentation(page);
    if (username === 'superadmin') await page.screenshot({ path: 'test-results/accueil-superadmin.png', fullPage: true });
    const authenticated = await page.request.get('/api/me');
    expect(authenticated.status()).toBe(200);
    const { user } = await authenticated.json();
    expect(user.profile).toBe(profile);
    expect(user).not.toHaveProperty('idToken');
    await page.reload();
    await expect(page.getByRole('heading', { name: profile, exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Se déconnecter' }).click();
    await expect(page.getByRole('link', { name: "S'identifier avec MinDefConnect" })).toBeVisible();
    await expectPublicPresentation(page);
    expect((await page.request.get('/api/me')).status()).toBe(401);
  });
}

test('un compte inconnu ne crée aucune session ASTER', async ({ page }) => {
  await page.goto('/auth/login');
  await page.getByLabel('email', { exact: true }).fill('inconnu@aster.demo');
  await page.getByRole('button', { name: 'Se connecter', exact: true }).click();
  await expect(page.getByRole('alert')).toBeVisible();
  expect((await page.request.get('http://localhost:5173/api/me')).status()).toBe(401);
});

test('un state incorrect pendant une tentative réelle ne crée pas de session', async ({ request }) => {
  const login = await request.get('/auth/login', { maxRedirects: 0 });
  expect(login.status()).toBe(302);
  expect(new URL(login.headers().location).searchParams.get('state')).toBeTruthy();
  const callback = await request.get('/auth/callback?code=faux&state=incorrect', { maxRedirects: 0 });
  expect(callback.headers().location).toBe('/?error=connexion');
  expect((await request.get('/api/me')).status()).toBe(401);
});

test('un callback sans demande préalable et une déconnexion externe sont refusés', async ({ request }) => {
  const callback = await request.get('/auth/callback?code=faux&state=faux', { maxRedirects: 0 });
  expect(callback.headers().location).toBe('/?error=session');
  expect((await request.get('/api/me')).status()).toBe(401);
  const logout = await request.post('/auth/logout', { headers: { Origin: 'https://autre.example' }, maxRedirects: 0 });
  expect(logout.status()).toBe(403);
});
