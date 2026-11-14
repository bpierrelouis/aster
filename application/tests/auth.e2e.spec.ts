import { test, expect } from '@playwright/test';
import { expectPublicPresentation } from './presentation.ts';
import pg from 'pg';
import { readConfig } from '../backend/config.ts';
import type { Page } from '@playwright/test';
import type { Materiel, Operation, Processus, Remontee } from '#shared/types.ts';

// Contrôles directs de la persistance : PostgreSQL de l'infrastructure locale
const config = readConfig();
const sql = async (text: string, values: unknown[]) => { const client = new pg.Client({ connectionString: config.databaseUrl }); await client.connect(); try { return (await client.query(text, values)).rows; } finally { await client.end(); } };

// Requires real PostgreSQL, Keycloak and the Express server. No mocked authentication.
// Modules visibles par profil (rail principal) et profil appliqué par le serveur à l'espace de travail.
const EMAILS = {
  superadmin: 'camille.rousseau@gmail.com',
  admin: 'julien.mercier@outlook.fr',
  gestionnaire: 'sophie.garnier@yahoo.fr',
  formateur: 'thomas.lefebvre@hotmail.fr',
};
type Profil = keyof typeof EMAILS;
const PROFILES: { username: Profil; profile: string; role: string; nom: string; modules: string[] }[] = [
  { username: 'superadmin', profile: 'Super administrateur', role: 'superadmin', nom: 'Camille Rousseau', modules: ['Accueil', 'Salles', 'Matériels', 'Remontées', 'Supervision', 'Administration'] },
  { username: 'admin', profile: 'Administrateur', role: 'admin', nom: 'Julien Mercier', modules: ['Accueil', 'Salles', 'Matériels', 'Remontées', 'Supervision', 'Administration'] },
  { username: 'gestionnaire', profile: 'Gestionnaire', role: 'gestionnaire', nom: 'Sophie Garnier', modules: ['Accueil', 'Salles', 'Matériels', 'Remontées'] },
  { username: 'formateur', profile: 'Formateur', role: 'formateur', nom: 'Thomas Lefebvre', modules: ['Accueil', 'Salles', 'Remontées', 'Supervision'] },
];

async function login(page: Page, username: Profil | string) {
  await page.goto('/');
  await page.getByRole('link', { name: "S'identifier avec MinDefConnect" }).click();
  await expect(page).toHaveURL(/localhost:8081/);
  await page.getByLabel('email', { exact: true }).fill(username in EMAILS ? EMAILS[username as Profil] : username);
  await expect(page.locator('#password')).toHaveValue('');
  await page.getByRole('button', { name: 'Se connecter', exact: true }).click();
  await expect(page).toHaveURL(/\/accueil$/);
  await expect(page.locator('#view h1')).toBeAttached();
  await expect(page.locator('.loading')).toHaveCount(0);
}

async function logout(page: Page) {
  await page.getByRole('button', { name: 'Compte', exact: true }).click();
  await page.getByRole('button', { name: 'Se déconnecter', exact: true }).click();
  await expect(page.getByRole('link', { name: "S'identifier avec MinDefConnect" })).toBeVisible();
}

for (const { username, profile, role, nom, modules } of PROFILES) {
  test(`${profile} : connexion vide, espace de travail, session persistante et déconnexion`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    const anonymous = await page.request.get('/api/me');
    expect(anonymous.status()).toBe(401);
    expect((await page.request.get('/api/workspace')).status()).toBe(401);
    await page.goto('/');
    await page.getByRole('link', { name: "S'identifier avec MinDefConnect" }).click();
    await expect(page).toHaveURL(/localhost:8081/);
    await expectPublicPresentation(page);
    await expect(page.getByRole('list')).toHaveCount(0);
    // Présentation au client : tableau des comptes en marge de la page de connexion (ORION_COMPTES_PRESENTATION)
    await expect(page.getByRole('table', { name: 'Comptes' }).getByRole('row').filter({ hasText: EMAILS[username] })).toBeVisible();
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
      await expect(page.getByRole('dialog')).toContainText('Pour demander un accès à Orion, contactez votre administrateur.');
      await expectPublicPresentation(page);
      await page.getByRole('button', { name: 'Fermer', exact: true }).click();
      await page.getByRole('button', { name: 'Mot de passe oublié?', exact: true }).click();
      await expect(page.getByRole('dialog')).toContainText('Pour obtenir de l’aide concernant votre accès, contactez votre administrateur.');
      await expectPublicPresentation(page);
      await page.getByRole('button', { name: 'Fermer', exact: true }).click();
    }
    await page.getByLabel('email', { exact: true }).fill(EMAILS[username]);
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
    expect(workspace.moi).toMatchObject({ nom, email: EMAILS[username] });
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
  await expect.poll(async () => (await (await page.request.get('/api/workspace')).json()).materiels.find((m: Materiel) => m.modele === model)?.idOrion ?? null).toMatch(/^MAT-\d{4}$/);
  await page.reload();
  await expect(page.locator('#view h1')).toBeAttached();
  await expect.poll(() => page.evaluate((name) => window.orion.store.state.materiels.some((m) => m.modele === name), model)).toBe(true);
  const [row] = await sql('SELECT id_orion, ecole_id, salle_id, hors_service FROM orion_materiel WHERE modele = $1', [model]);
  expect(row).toMatchObject({ ecole_id: 'e-num', salle_id: null, hors_service: false });
  expect(row.id_orion).toMatch(/^MAT-\d{4}$/);
  await logout(page);
});

test('formateur : une remontée transmise produit son PDF ; le gestionnaire la traite', async ({ page }) => {
  const problemType = 'Bruit de ventilation';
  const description = `Écran noir après allumage ${Date.now()}`;
  await login(page, 'formateur');
  await page.goto('/remontees/attente');
  await page.getByRole('button', { name: 'Signaler un problème', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Signaler un problème', exact: true });
  await dialog.locator('[data-salle]').filter({ hasText: 'A012' }).click();
  await dialog.locator('[data-mat]').first().click();
  await dialog.getByRole('button', { name: 'Continuer', exact: true }).click();
  await dialog.getByLabel('Description du problème *').fill(description);
  await dialog.getByRole('radio', { name: 'Autre', exact: true }).click();
  await dialog.getByLabel('Précisez le type de problème *').fill(problemType);
  await dialog.getByRole('button', { name: 'Transmettre la remontée', exact: true }).click();
  await expect(dialog).toHaveCount(0);
  let report!: Remontee;
  await expect.poll(async () => { report = (await (await page.request.get('/api/workspace')).json()).remontees.find((r: Remontee) => r.description === description); return Boolean(report); }).toBe(true);
  expect(report.probleme).toBe(problemType);
  // Le serveur contrôle les droits puis produit le PDF à la demande
  const pdf = await page.request.get(`/api/workspace/reports/${report.id}/pdf`);
  expect(report.id).toMatch(/^REM-\d{4}$/);
  expect(pdf.ok()).toBeTruthy();
  expect(pdf.headers()['content-type']).toBe('application/pdf');
  expect((await pdf.body()).subarray(0, 5).toString()).toBe('%PDF-');
  const [stored] = await sql('SELECT statut, auteur, auteur_id, probleme FROM orion_remontee WHERE id = $1', [report.id]);
  expect(stored).toMatchObject({ statut: 'attente', auteur: 'Thomas Lefebvre', auteur_id: 'cpt-num-formateur', probleme: problemType });
  expect((await sql('SELECT materiel_id FROM orion_remontee_materiel WHERE remontee_id = $1 ORDER BY rang', [report.id])).map((r) => r.materiel_id)).toEqual(report.materielIds);
  await logout(page);
  expect((await page.request.get(`/api/workspace/reports/${report.id}/pdf`)).status()).toBe(401);

  await login(page, 'gestionnaire');
  const managed = await (await page.request.get('/api/workspace')).json();
  expect(managed.remontees.some((r: Remontee) => r.id === report.id)).toBe(true);
  expect(managed.postes).toEqual([]);
  await page.goto('/supervision/salles');
  await expect(page).toHaveURL(/\/accueil$/);
  await logout(page);
});

// Gestion des utilisateurs du fournisseur local (Keycloak, substitut de MindefConnect), par le compte de service d'ORION
async function keycloak(path: string, options: RequestInit = {}) {
  const tokenResponse = await fetch(`${config.issuer.origin}/realms/orion/protocol/openid-connect/token`, { method: 'POST', body: new URLSearchParams({ grant_type: 'client_credentials', client_id: config.provisioning.clientId, client_secret: config.provisioning.clientSecret }) });
  const { access_token: token } = (await tokenResponse.json()) as { access_token: string };
  const response = await fetch(`${config.issuer.origin}/admin/realms/orion${path}`, { ...options, headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } });
  return response.status === 200 ? response.json() : response;
}

test('administrateur : un compte créé permet de se connecter ; désactivé, il coupe la session', async ({ page, browser }) => {
  const email = 'nouveau.formateur@orion.demo';
  await login(page, 'admin');
  await page.goto('/administration/comptes');
  await expect(page.locator('tr', { hasText: EMAILS.admin })).toBeVisible(); // liste affichée avant de chercher le compte (test rejouable)
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
  await expect.poll(async () => (await sql('SELECT actif FROM orion_compte WHERE email = $1', [email]))[0]?.actif ?? false).toBe(true);
  // L'identité est créée dans le fournisseur local, puis le nouvel utilisateur se connecte réellement
  await expect.poll(async () => ((await keycloak(`/users?email=${encodeURIComponent(email)}&exact=true`)) as unknown[]).length ?? 0, { timeout: 10_000 }).toBe(1);
  const other = await browser.newContext();
  const newcomer = await other.newPage();
  await login(newcomer, email);
  const mine = await (await newcomer.request.get('/api/workspace')).json();
  expect(mine.moi).toMatchObject({ nom: 'P. Nouveau', role: 'formateur', ecoleId: 'e-num' });
  const connecte = (await sql('SELECT sujet, derniere_connexion, date_desactivation FROM orion_compte WHERE email = $1', [email]))[0];
  expect(connecte.sujet).toBeTruthy();
  expect(Date.now() - new Date(connecte.derniere_connexion).getTime()).toBeLessThan(5 * 60_000); // dernière connexion fixée par le serveur
  expect(connecte.date_desactivation).toBeNull(); // effacée à la réactivation

  // Désactivation par l'administrateur : session coupée et connexion refusée
  await page.reload();
  await page.locator('tr', { hasText: email }).getByRole('button', { name: 'Désactiver' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Désactiver', exact: true }).click();
  await expect.poll(async () => (await newcomer.request.get('/api/me')).status()).toBe(401);
  expect((await sql('SELECT date_desactivation FROM orion_compte WHERE email = $1', [email]))[0].date_desactivation).toBeTruthy();
  await expect(page.locator('tr', { hasText: email })).toContainText(/Désactivé\s*le \d{2}\/\d{2}\/\d{4}/);
  await newcomer.goto('/');
  await newcomer.getByRole('link', { name: "S'identifier avec MinDefConnect" }).click();
  await newcomer.getByLabel('email', { exact: true }).fill(email);
  await newcomer.getByRole('button', { name: 'Se connecter', exact: true }).click();
  await expect(newcomer.getByRole('alert')).toContainText('aucun compte Orion actif');
  expect((await newcomer.request.get('/api/me')).status()).toBe(401);
  await other.close();
  await logout(page);
});

test('une identité du fournisseur sans compte ORION est refusée', async ({ page }) => {
  const email = 'sans.compte@orion.demo';
  if (!((await keycloak(`/users?email=${encodeURIComponent(email)}&exact=true`)) as unknown[]).length) {
    await keycloak('/users', { method: 'POST', body: JSON.stringify({ username: email, email, firstName: 'Sans', lastName: 'Compte', enabled: true, emailVerified: true }) });
  }
  await page.goto('/');
  await page.getByRole('link', { name: "S'identifier avec MinDefConnect" }).click();
  await page.getByLabel('email', { exact: true }).fill(email);
  await page.getByRole('button', { name: 'Se connecter', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('aucun compte Orion actif');
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
  await expect.poll(async () => (await (await page.request.get('/api/workspace')).json()).operations.find((o: Operation) => o.processusId === processId)?.statut, { timeout: 20_000 }).toMatch(/^(terminee|echec)$/);
  const [op] = (await sql("SELECT data FROM orion_donnee WHERE collection = 'operations' AND data->>'processusId' = $1", [processId])).map((r) => r.data);
  expect(op).toMatchObject({ type: 'arret', par: 'Thomas Lefebvre', parId: 'cpt-num-formateur' });
  if (op.statut === 'terminee') expect((await (await page.request.get('/api/workspace')).json()).processus.find((p: Processus) => p.id === processId)?.stoppedAt ?? Date.now()).toBeTruthy();
  await logout(page);
});

test('tableau des comptes : la flèche connecte directement avec le compte choisi', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: "S'identifier avec MinDefConnect" }).click();
  const row = page.getByRole('table', { name: 'Comptes' }).getByRole('row').filter({ hasText: 'manon.faure@outlook.com' });
  await expect(row).toContainText('Gestionnaire');
  await expect(row).toContainText('Réseaux');
  await row.getByRole('button', { name: 'Se connecter avec manon.faure@outlook.com' }).click();
  await expect(page).toHaveURL(/\/accueil$/);
  const workspace = await (await page.request.get('/api/workspace')).json();
  expect(workspace.moi).toMatchObject({ nom: 'Manon Faure', role: 'gestionnaire', ecoleId: 'e-res' });
  await logout(page);
});

// Page de connexion déjà utilisée (retour arrière, autre onglet) : la session Keycloak est ouverte avec un autre compte.
// La page d'erreur ferme cette session et la connexion reprend avec le compte choisi.
const choisir = (page: Page, email: string) => page.getByRole('table', { name: 'Comptes' }).getByRole('button', { name: `Se connecter avec ${email}` }).click();
const moi = async (page: Page) => (await (await page.request.get('/api/workspace')).json()).moi;

test('changement de compte : retour arrière vers la page de connexion puis autre compte', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: "S'identifier avec MinDefConnect" }).click();
  await choisir(page, EMAILS.superadmin);
  await expect(page).toHaveURL(/\/accueil$/);
  await page.goBack();
  await choisir(page, EMAILS.admin);
  await expect(page).toHaveURL(/\/accueil$/);
  expect(await moi(page)).toMatchObject({ email: EMAILS.admin });
  await logout(page);
});

test('changement de compte : adresse saisie sur une page déjà utilisée, reprise préremplie', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: "S'identifier avec MinDefConnect" }).click();
  await choisir(page, EMAILS.superadmin);
  await expect(page).toHaveURL(/\/accueil$/);
  await page.goBack();
  // Envoyée par l'utilisateur après la reprise (mot de passe en production)
  await page.getByLabel('email', { exact: true }).fill(EMAILS.gestionnaire);
  await page.getByRole('button', { name: 'Se connecter', exact: true }).click();
  await expect(page.getByLabel('email', { exact: true })).toHaveValue(EMAILS.gestionnaire);
  await expectPublicPresentation(page);
  await page.getByRole('button', { name: 'Se connecter', exact: true }).click();
  await expect(page).toHaveURL(/\/accueil$/);
  expect(await moi(page)).toMatchObject({ email: EMAILS.gestionnaire });
  await logout(page);
});

test('changement de compte : deux onglets ouverts sur la page de connexion', async ({ context }) => {
  const [a, b] = [await context.newPage(), await context.newPage()];
  for (const p of [a, b]) {
    await p.goto('/');
    await p.getByRole('link', { name: "S'identifier avec MinDefConnect" }).click();
    await expect(p.getByRole('table', { name: 'Comptes' })).toBeVisible();
  }
  await choisir(a, EMAILS.formateur);
  await expect(a).toHaveURL(/\/accueil$/);
  await choisir(b, EMAILS.gestionnaire);
  await expect(b).toHaveURL(/\/accueil$/);
  expect(await moi(b)).toMatchObject({ email: EMAILS.gestionnaire });
  await logout(b);
});

test('sans session, l’espace de travail renvoie à la connexion', async ({ page }) => {
  await page.goto('/salles');
  await expect(page.getByRole('link', { name: "S'identifier avec MinDefConnect" })).toBeVisible();
  await expect(page.getByText('momentanément indisponible')).toHaveCount(0);
});

test('une écriture d’une autre origine est refusée', async ({ page }) => {
  await login(page, 'admin');
  const state = await (await page.request.get('/api/workspace')).json();
  // Corps réduit : le refus porte sur l'origine, avant toute lecture (un gros corps rejeté tôt fait échouer le proxy de Vite)
  const forged = await page.request.put('/api/workspace', { headers: { Origin: 'https://autre.example', 'Content-Type': 'application/json' }, data: { baseRevision: state.revision, state: { role: state.role } } });
  expect(forged.status()).toBe(403);
  await logout(page);
});

test('un compte inconnu ne crée aucune session ORION', async ({ page }) => {
  await page.goto('/auth/login');
  await page.getByLabel('email', { exact: true }).fill('inconnu@orion.demo');
  await page.getByRole('button', { name: 'Se connecter', exact: true }).click();
  await expect(page.getByRole('alert')).toBeVisible();
  expect((await page.request.get('http://localhost:5173/api/me')).status()).toBe(401);
});

test('un state incorrect pendant une tentative réelle ne crée pas de session', async ({ request }) => {
  const login = await request.get('/auth/login', { maxRedirects: 0 });
  expect(login.status()).toBe(302);
  expect(new URL(login.headers().location).searchParams.get('state')).toBeTruthy();
  const callback = await request.get('/auth/callback?code=faux&state=incorrect', { maxRedirects: 0 });
  expect(callback.headers().location).toBe('/?error=session'); // état inconnu : aucune tentative ne lui correspond
  const faux = await request.get(`/auth/callback?code=faux&state=${new URL(login.headers().location).searchParams.get('state')}`, { maxRedirects: 0 });
  expect(faux.headers().location).toBe('/?error=connexion'); // état connu, code refusé par le fournisseur
  expect((await request.get('/api/me')).status()).toBe(401);
});

test('un callback sans demande préalable et une déconnexion externe sont refusés', async ({ request }) => {
  const callback = await request.get('/auth/callback?code=faux&state=faux', { maxRedirects: 0 });
  expect(callback.headers().location).toBe('/?error=session');
  expect((await request.get('/api/me')).status()).toBe(401);
  const logout = await request.post('/auth/logout', { headers: { Origin: 'https://autre.example' }, maxRedirects: 0 });
  expect(logout.status()).toBe(403);
});
