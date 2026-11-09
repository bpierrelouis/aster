import { test, expect } from '@playwright/test';
import { expectPublicPresentation } from './presentation.js';
import pg from 'pg';
import { createS3Storage } from '../backend/storage.js';
import { readConfig } from '../backend/config.js';

// Contrôles directs de la persistance : PostgreSQL et stockage S3 de l'infrastructure locale
const config = readConfig();
const sql = async (text, values) => { const client = new pg.Client({ connectionString: config.databaseUrl }); await client.connect(); try { return (await client.query(text, values)).rows; } finally { await client.end(); } };
const s3 = createS3Storage(config.s3);
test.afterAll(() => s3.destroy());

// Requires real PostgreSQL, Keycloak and the Express server. No mocked authentication.
// Modules visibles par profil (rail principal) et profil appliqué par le serveur à l'espace de travail.
const PROFILES = [
  { username: 'superadmin', profile: 'Super administrateur', role: 'superadmin', nom: 'S. Lefèvre', modules: ['Accueil', 'Salles', 'Matériels', 'Remontées', 'Supervision', 'Administration'] },
  { username: 'admin', profile: 'Administrateur', role: 'admin', nom: 'C. Durand', modules: ['Accueil', 'Salles', 'Matériels', 'Remontées', 'Supervision', 'Administration'] },
  { username: 'gestionnaire', profile: 'Gestionnaire', role: 'gestionnaire', nom: 'G. Bernard', modules: ['Accueil', 'Salles', 'Matériels', 'Remontées'] },
  { username: 'formateur', profile: 'Formateur', role: 'formateur', nom: 'L. Martin', modules: ['Accueil', 'Salles', 'Remontées', 'Supervision'] },
];

async function login(page, username) {
  await page.goto('/');
  await page.getByRole('link', { name: "S'identifier avec MinDefConnect" }).click();
  await expect(page).toHaveURL(/localhost:8081/);
  await page.getByLabel('email', { exact: true }).fill(`${username}@aster.demo`);
  await expect(page.locator('#password')).toHaveValue('');
  await page.getByRole('button', { name: 'Se connecter', exact: true }).click();
  await expect(page).toHaveURL(/\/accueil$/);
  await expect(page.locator('#view h1')).toBeAttached();
  await expect(page.locator('.loading')).toHaveCount(0);
}

async function logout(page) {
  await page.getByRole('button', { name: 'Compte', exact: true }).click();
  await page.getByRole('button', { name: 'Se déconnecter', exact: true }).click();
  await expect(page.getByRole('link', { name: "S'identifier avec MinDefConnect" })).toBeVisible();
}

for (const { username, profile, role, nom, modules } of PROFILES) {
  test(`${profile} : connexion vide, espace de travail, session persistante et déconnexion`, async ({ page }) => {
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    const anonymous = await page.request.get('/api/me');
    expect(anonymous.status()).toBe(401);
    expect((await page.request.get('/api/workspace')).status()).toBe(401);
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
    await expect(page).toHaveURL(/\/accueil$/);
    await expect(page.locator('#view h1')).toBeAttached();
    await expectPublicPresentation(page);
    if (username === 'superadmin') await page.screenshot({ path: 'test-results/accueil-superadmin.png', fullPage: true });

    const authenticated = await page.request.get('/api/me');
    expect(authenticated.status()).toBe(200);
    const { user } = await authenticated.json();
    expect(user.profile).toBe(profile);
    expect(user).not.toHaveProperty('idToken');
    const workspace = await (await page.request.get('/api/workspace')).json();
    expect(workspace.role).toBe(role);
    expect(workspace.moi).toMatchObject({ nom, email: `${username}@aster.demo` });
    expect(user.name).toBe(nom);
    expect(await page.locator('.rail-item:not([hidden]) .rail-label').allTextContents()).toEqual(modules);

    await page.reload();
    await expect(page.locator('#view h1')).toBeAttached();
    expect((await page.request.get('/api/me')).status()).toBe(200);
    await logout(page);
    await expectPublicPresentation(page);
    expect((await page.request.get('/api/me')).status()).toBe(401);
    expect((await page.request.get('/api/workspace')).status()).toBe(401);
    expect(errors).toEqual([]);
  });
}

test('administrateur : un matériel créé est enregistré par le serveur réel', async ({ page }) => {
  await login(page, 'admin');
  const model = `Onduleur contrôle ${Date.now()}`;
  await page.goto('/materiels/inventaire');
  await page.getByRole('button', { name: 'Ajouter un matériel', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Ajouter un matériel', exact: true });
  await dialog.getByLabel('Modèle *', { exact: true }).fill(model);
  await dialog.getByRole('button', { name: 'Enregistrer', exact: true }).click();
  await expect(dialog).toHaveCount(0);
  await expect.poll(async () => (await (await page.request.get('/api/workspace')).json()).materiels.find((m) => m.modele === model)?.idAster ?? null).toMatch(/^MAT-\d{4}$/);
  await page.reload();
  await expect(page.locator('#view h1')).toBeAttached();
  await expect.poll(() => page.evaluate((name) => window.aster.store.state.materiels.some((m) => m.modele === name), model)).toBe(true);
  const [row] = await sql('SELECT id_aster, ecole_id, salle_id, hors_service FROM aster_materiel WHERE modele = $1', [model]);
  expect(row).toMatchObject({ ecole_id: 'e-num', salle_id: null, hors_service: false });
  expect(row.id_aster).toMatch(/^MAT-\d{4}$/);
  await logout(page);
});

test('formateur : une remontée transmise produit son PDF ; le gestionnaire la traite', async ({ page }) => {
  const description = `Écran noir après allumage ${Date.now()}`;
  await login(page, 'formateur');
  await page.goto('/remontees/attente');
  await page.getByRole('button', { name: 'Signaler un problème', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Signaler un problème', exact: true });
  await dialog.locator('[data-salle]').filter({ hasText: 'A012' }).click();
  await dialog.locator('[data-mat]').first().click();
  await dialog.getByRole('button', { name: 'Continuer', exact: true }).click();
  await dialog.getByLabel('Description du problème *').fill(description);
  await dialog.getByRole('button', { name: 'Transmettre la remontée', exact: true }).click();
  await expect(dialog).toHaveCount(0);
  let report;
  await expect.poll(async () => { report = (await (await page.request.get('/api/workspace')).json()).remontees.find((r) => r.description === description); return Boolean(report); }).toBe(true);
  const pdf = await page.request.get(`/api/workspace/reports/${report.id}/pdf`);
  expect(report.id).toMatch(/^REM-\d{4}$/);
  expect(pdf.ok()).toBeTruthy();
  expect((await pdf.body()).subarray(0, 5).toString()).toBe('%PDF-');
  const [stored] = await sql('SELECT etat_des_lieux_cle, statut, auteur, auteur_id FROM aster_remontee WHERE id = $1', [report.id]);
  expect(stored).toMatchObject({ etat_des_lieux_cle: `etats-des-lieux/${report.ecoleId}/${report.id}.pdf`, statut: 'attente', auteur: 'L. Martin', auteur_id: 'cpt-num-formateur' });
  expect((await sql('SELECT materiel_id FROM aster_remontee_materiel WHERE remontee_id = $1 ORDER BY rang', [report.id])).map((r) => r.materiel_id)).toEqual(report.materielIds);
  expect(await s3.get(stored.etat_des_lieux_cle)).toEqual(await pdf.body());
  await logout(page);
  expect((await page.request.get(`/api/workspace/reports/${report.id}/pdf`)).status()).toBe(401);

  await login(page, 'gestionnaire');
  const managed = await (await page.request.get('/api/workspace')).json();
  expect(managed.remontees.some((r) => r.id === report.id)).toBe(true);
  expect(managed.postes).toEqual([]);
  await page.goto('/supervision/salles');
  await expect(page).toHaveURL(/\/accueil$/);
  await logout(page);
});

// Administration du fournisseur local (Keycloak, substitut de MindefConnect)
async function keycloak(path, options = {}) {
  const tokenResponse = await fetch(`${config.issuer.origin}/realms/master/protocol/openid-connect/token`, { method: 'POST', body: new URLSearchParams({ grant_type: 'password', client_id: 'admin-cli', username: config.keycloakAdmin.adminUser, password: config.keycloakAdmin.adminPassword }) });
  const { access_token: token } = await tokenResponse.json();
  const response = await fetch(`${config.issuer.origin}/admin/realms/aster-demo${path}`, { ...options, headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } });
  return response.status === 200 ? response.json() : response;
}

test('administrateur : un compte créé permet de se connecter ; désactivé, il coupe la session', async ({ page, browser }) => {
  const email = 'nouveau.formateur@aster.demo';
  await login(page, 'admin');
  await page.goto('/administration/comptes');
  const row = page.locator('tr', { hasText: email });
  if (await row.count()) {
    if (await row.getByRole('button', { name: 'Réactiver' }).count()) {
      await row.getByRole('button', { name: 'Réactiver' }).click();
      await page.getByRole('dialog').getByRole('button', { name: 'Réactiver', exact: true }).click();
    }
  } else {
    await page.getByRole('button', { name: 'Créer un compte', exact: true }).click();
    const dialog = page.getByRole('dialog', { name: 'Créer un compte', exact: true });
    await dialog.getByLabel('Nom *').fill('P. Nouveau');
    await dialog.getByLabel('Adresse électronique *').fill(email);
    await dialog.getByRole('button', { name: 'Enregistrer', exact: true }).click();
    await expect(dialog).toHaveCount(0);
  }
  await expect.poll(async () => (await sql('SELECT actif FROM aster_compte WHERE email = $1', [email]))[0]?.actif ?? false).toBe(true);
  // L'identité est créée dans le fournisseur local, puis le nouvel utilisateur se connecte réellement
  await expect.poll(async () => (await keycloak(`/users?email=${encodeURIComponent(email)}&exact=true`)).length ?? 0, { timeout: 10_000 }).toBe(1);
  const other = await browser.newContext();
  const newcomer = await other.newPage();
  await login(newcomer, 'nouveau.formateur');
  const mine = await (await newcomer.request.get('/api/workspace')).json();
  expect(mine.moi).toMatchObject({ nom: 'P. Nouveau', role: 'formateur', ecoleId: 'e-num' });
  expect((await sql('SELECT sujet FROM aster_compte WHERE email = $1', [email]))[0].sujet).toBeTruthy();

  // Désactivation par l'administrateur : session coupée et connexion refusée
  await page.reload();
  await page.locator('tr', { hasText: email }).getByRole('button', { name: 'Désactiver' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Désactiver', exact: true }).click();
  await expect.poll(async () => (await newcomer.request.get('/api/me')).status()).toBe(401);
  await newcomer.goto('/');
  await newcomer.getByRole('link', { name: "S'identifier avec MinDefConnect" }).click();
  await newcomer.getByLabel('email', { exact: true }).fill(email);
  await newcomer.getByRole('button', { name: 'Se connecter', exact: true }).click();
  await expect(newcomer.getByRole('alert')).toContainText('aucun compte ASTER actif');
  expect((await newcomer.request.get('/api/me')).status()).toBe(401);
  await other.close();
  await logout(page);
});

test('une identité du fournisseur sans compte ASTER est refusée', async ({ page }) => {
  const email = 'sans.compte@aster.demo';
  if (!(await keycloak(`/users?email=${encodeURIComponent(email)}&exact=true`)).length) {
    await keycloak('/users', { method: 'POST', body: JSON.stringify({ username: email, email, firstName: 'Sans', lastName: 'Compte', enabled: true, emailVerified: true }) });
  }
  await page.goto('/');
  await page.getByRole('link', { name: "S'identifier avec MinDefConnect" }).click();
  await page.getByLabel('email', { exact: true }).fill(email);
  await page.getByRole('button', { name: 'Se connecter', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('aucun compte ASTER actif');
  expect((await page.request.get('/api/me')).status()).toBe(401);
});

test('formateur : un arrêt de processus est exécuté par le poste', async ({ page }) => {
  await login(page, 'formateur');
  await page.goto('/supervision/salles?salle=s-e-num-a101');
  const stop = page.locator('[data-stop]').first();
  await expect(stop).toBeVisible({ timeout: 15_000 });
  const processId = await stop.getAttribute('data-stop');
  await stop.click();
  await expect(page.getByText('Arrêt demandé').first()).toBeVisible();
  // Le poste reçoit la commande, l'exécute et renvoie le résultat
  await expect.poll(async () => (await (await page.request.get('/api/workspace')).json()).operations.find((o) => o.processusId === processId)?.statut, { timeout: 20_000 }).toMatch(/^(terminee|echec)$/);
  const [op] = (await sql("SELECT data FROM aster_donnee WHERE collection = 'operations' AND data->>'processusId' = $1", [processId])).map((r) => r.data);
  expect(op).toMatchObject({ type: 'arret', par: 'L. Martin', parId: 'cpt-num-formateur' });
  if (op.statut === 'terminee') expect((await (await page.request.get('/api/workspace')).json()).processus.find((p) => p.id === processId)?.stoppedAt ?? Date.now()).toBeTruthy();
  await logout(page);
});

test('sans session, l’espace de travail renvoie à la connexion', async ({ page }) => {
  await page.goto('/salles');
  await expect(page.getByRole('link', { name: "S'identifier avec MinDefConnect" })).toBeVisible();
  await expect(page.getByText('momentanément indisponible')).toHaveCount(0);
});

test('une écriture d’une autre origine est refusée', async ({ page }) => {
  await login(page, 'admin');
  const state = await (await page.request.get('/api/workspace')).json();
  const forged = await page.request.put('/api/workspace', { headers: { Origin: 'https://autre.example', 'Content-Type': 'application/json' }, data: { baseRevision: state.revision, state } });
  expect(forged.status()).toBe(403);
  await logout(page);
});

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
