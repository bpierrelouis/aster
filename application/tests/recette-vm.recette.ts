/* ==========================================================================
   Recette de l'application déployée (VM) : parcours réels par profil, contre l'adresse d'entrée, sans base ni serveur
   locaux. Tickets #116 (vérifications après déploiement), #105 (connexion et droits), #106 (inventaire et affectations),
   #107 (supervision, interventions et remontées).
   - Les tests écrivent dans les données de démonstration (matériel, remontée, interventions, recensement) : les
     recharger ensuite si besoin (incrémenter SEED_VERSION et redéployer).
   - Mots de passe dérivés du secret PROVISIONING_PASSWORD_SECRET de la VM, lu au lancement, jamais enregistré :
       . infra/vm/vm.sh && export RECETTE_SECRET=$(ssh_vm 4 'docker exec $(docker ps -qf name=orion_api | head -1) cat /run/secrets/PROVISIONING_PASSWORD_SECRET')
       npm run test:recette            # RECETTE_URL (https://172.16.131.188 par défaut), RECETTE_VERSION (SHA attendu, facultatif)
   - Non couverts : caméra et installation de l'application mobile sur un vrai téléphone, import JSON, ergonomie.
   ========================================================================== */
import { test, expect } from '@playwright/test';
import { motDePasse } from '../outils/identites-keycloak/mot-de-passe.ts';
import type { APIResponse, Browser, Page } from '@playwright/test';
import type { Intervention, Materiel, Remontee, WorkspaceView } from '#shared/types.ts';

const BASE = (process.env.RECETTE_URL || 'https://172.16.131.188').replace(/\/$/, '');
const SECRET = process.env.RECETTE_SECRET ?? '';
test.skip(!SECRET, 'RECETTE_SECRET absent : voir l’en-tête du fichier');

// Comptes du jeu de démonstration (outils/donnees-demonstration/jeu.ts)
const COMPTES = {
  superadmin: 'camille.rousseau@gmail.com',
  admin: 'julien.mercier@outlook.fr',
  autreAdmin: 'antoine.girard@gmail.com',
  gestionnaire: 'sophie.garnier@yahoo.fr',
  formateur: 'thomas.lefebvre@hotmail.fr',
};
type Compte = keyof typeof COMPTES;
const MODULES: Record<'superadmin' | 'admin' | 'gestionnaire' | 'formateur', string[]> = {
  superadmin: ['Accueil', 'Salles', 'Matériels', 'Remontées', 'Supervision', 'Administration'],
  admin: ['Accueil', 'Salles', 'Matériels', 'Remontées', 'Supervision', 'Administration'],
  gestionnaire: ['Accueil', 'Salles', 'Matériels', 'Remontées'],
  formateur: ['Accueil', 'Salles', 'Remontées', 'Supervision'],
};

async function connecter(page: Page, compte: Compte) {
  await page.goto('/');
  await page.getByRole('link', { name: "S'identifier avec MinDefConnect" }).click();
  await expect(page).toHaveURL(/\/realms\/orion\//);
  // Adresse, puis mot de passe sur la page suivante (sautée pour les comptes des jetons de présentation)
  await page.getByLabel('email', { exact: true }).fill(COMPTES[compte]);
  await page.getByRole('button', { name: 'Continuer', exact: true }).click();
  const formulaire = page.locator('#password-form');
  await expect(formulaire.or(page.locator('#view h1')).first()).toBeAttached({ timeout: 30_000 });
  if (await formulaire.count()) {
    await page.locator('#password').fill(motDePasse(SECRET, COMPTES[compte]));
    await page.getByRole('button', { name: 'Se connecter', exact: true }).click();
  }
  await expect(page).toHaveURL(/\/accueil$/, { timeout: 30_000 });
  await expect(page.locator('#view h1')).toBeAttached();
}

async function deconnecter(page: Page) {
  await page.getByRole('button', { name: 'Compte', exact: true }).click();
  await page.getByRole('button', { name: 'Se déconnecter', exact: true }).click();
  await expect(page.getByRole('link', { name: "S'identifier avec MinDefConnect" })).toBeVisible();
}

const vue = async (page: Page) => (await (await page.request.get('/api/workspace')).json()) as WorkspaceView;

/** Écriture comme l'interface : vue courante modifiée, renvoyée avec sa révision (PUT /api/workspace) */
async function ecrire(page: Page, modifier: (v: WorkspaceView) => void, origine = BASE): Promise<APIResponse> {
  const v = await vue(page);
  modifier(v);
  return page.request.put('/api/workspace', { data: { baseRevision: v.revision, state: v }, headers: { origin: origine } });
}

/* ---------- #116 · Vérifications après déploiement ---------- */

test('#116 · version servie, état public limité, documentation et API des postes fermées sans connexion', async ({ request }) => {
  const infos = await (await request.get('/api/infos')).json();
  expect(Object.keys(infos)).toEqual(['application']);
  expect(infos.application.mode).toBe('production');
  if (process.env.RECETTE_VERSION) expect(infos.application.version).toMatch(new RegExp(`^${process.env.RECETTE_VERSION}`));
  const health = await request.get('/api/health');
  expect(health.status()).toBe(200);
  expect(Object.keys(await health.json()).sort()).toEqual(['checkedAt', 'status']);
  for (const chemin of ['/api/me', '/api/workspace', '/api/openapi.json', '/api/agent/postes']) expect((await request.get(chemin)).status(), chemin).toBe(401);
  expect((await request.get('/realms/orion/account')).status()).toBe(403);
});

for (const compte of ['superadmin', 'admin', 'gestionnaire', 'formateur'] as const) {
  test(`#116 #105 · ${compte} : connexion par mot de passe, profil appliqué par le serveur, déconnexion`, async ({ page }) => {
    const erreurs: string[] = [];
    page.on('pageerror', (e) => erreurs.push(e.message));
    await connecter(page, compte);
    const v = await vue(page);
    expect(v.role).toBe(compte);
    expect(v.moi.email).toBe(COMPTES[compte]);
    expect(await page.locator('.rail-item:not([hidden]) .rail-label').allTextContents()).toEqual(MODULES[compte]);
    await page.reload();
    expect((await page.request.get('/api/me')).status()).toBe(200);
    await deconnecter(page);
    expect((await page.request.get('/api/workspace')).status()).toBe(401);
    expect(erreurs).toEqual([]);
  });
}

test('#116 · jetons « Accès de présentation » : chaque jeton connecte son compte', async ({ page }) => {
  for (const [jeton, role] of [['Super administrateur', 'superadmin'], ['Administrateur', 'admin'], ['Gestionnaire', 'gestionnaire'], ['Formateur', 'formateur']] as const) {
    await page.goto('/');
    await page.getByRole('link', { name: "S'identifier avec MinDefConnect" }).click();
    await page.getByRole('region', { name: 'Accès de présentation' }).getByRole('button', { name: jeton }).click();
    await expect(page).toHaveURL(/\/accueil$/, { timeout: 30_000 });
    expect((await vue(page)).role).toBe(role);
    await deconnecter(page);
  }
});

test('#116 · super administrateur : toutes les écoles, comptes et état détaillé des services', async ({ page }) => {
  await connecter(page, 'superadmin');
  const v = await vue(page);
  expect(v.ecoles.length).toBeGreaterThan(1);
  expect(new Set(v.materiels.map((m) => m.ecoleId)).size).toBeGreaterThan(1);
  const health = await (await page.request.get('/api/health')).json();
  expect(health.services.length).toBeGreaterThan(3);
  expect(health.status).toBe('ok');
  await page.goto('/administration/comptes');
  await expect(page.locator('#view h1')).toBeAttached();
  await deconnecter(page);
});

test('#116 · postes simulés : rapports récents reçus par ORION', async ({ page }) => {
  await connecter(page, 'admin');
  const v = await vue(page);
  const recents = v.postes.filter((p) => p.vuLe && Date.now() - p.vuLe < 120_000);
  expect(recents.length, 'postes ayant envoyé un rapport depuis deux minutes').toBeGreaterThan(0);
  expect(v.processus.length).toBeGreaterThan(0);
  await deconnecter(page);
});

/* ---------- #105 · Droits et cloisonnement ---------- */

test('#105 · cloisonnement : un administrateur ne voit ni n’écrit dans une autre école', async ({ page }) => {
  await connecter(page, 'admin');
  const v = await vue(page);
  const ecole = v.moi.ecoleId!;
  for (const c of ['materiels', 'salles', 'remontees', 'postes'] as const) expect((v[c] as { ecoleId?: string }[]).every((x) => !x.ecoleId || x.ecoleId === ecole), c).toBe(true);
  const intrus = await ecrire(page, (w) => { w.materiels.push({ ...w.materiels[0], id: 'recette-intrus', ecoleId: 'e-inexistante', salleId: null } as Materiel); });
  expect(intrus.status()).toBeGreaterThanOrEqual(400);
  const autreOrigine = await ecrire(page, () => {}, 'https://ailleurs.example');
  expect(autreOrigine.status()).toBe(403);
  await deconnecter(page);
});

test('#105 · formateur et gestionnaire : écritures hors de leurs droits refusées', async ({ page }) => {
  await connecter(page, 'formateur');
  const refusMateriel = await ecrire(page, (w) => { w.materiels.push({ ...w.materiels[0], id: 'recette-formateur', modele: 'Interdit' } as Materiel); });
  expect(refusMateriel.status(), 'le formateur ne crée pas de matériel').toBeGreaterThanOrEqual(400);
  await page.goto('/materiels/inventaire');
  await expect(page).toHaveURL(/\/accueil$/);
  await deconnecter(page);

  await connecter(page, 'gestionnaire');
  const v = await vue(page);
  expect(v.postes, 'le gestionnaire ne voit pas les postes').toEqual([]);
  const refusIntervention = await ecrire(page, (w) => { (w.interventions ??= []).push({ id: 'recette', type: 'arret', cibles: [] } as unknown as Intervention); });
  expect(refusIntervention.status(), 'le gestionnaire ne demande pas d’intervention').toBeGreaterThanOrEqual(400);
  await page.goto('/supervision/salles');
  await expect(page).toHaveURL(/\/accueil$/);
  await deconnecter(page);
});

/* ---------- #106 · Inventaire et affectations ---------- */

test('#106 · gestionnaire : matériel créé, affecté à une salle, installation confirmée', async ({ page }) => {
  await connecter(page, 'gestionnaire');
  const modele = `Recette onduleur ${Date.now()}`;
  await page.goto('/materiels/inventaire');
  await page.getByRole('button', { name: 'Ajouter un matériel', exact: true }).click();
  const fenetre = page.getByRole('dialog', { name: 'Ajouter un matériel', exact: true });
  await fenetre.getByLabel('Modèle *', { exact: true }).fill(modele);
  await fenetre.getByRole('button', { name: 'Enregistrer', exact: true }).click();
  await expect(fenetre).toHaveCount(0);
  let m!: Materiel;
  await expect.poll(async () => { m = (await vue(page)).materiels.find((x) => x.modele === modele)!; return m?.idOrion; }).toMatch(/^MAT-\d{4}$/);
  expect(m.salleId).toBeNull();

  const salle = (await vue(page)).salles.find((s) => s.ecoleId === m.ecoleId)!;
  expect((await ecrire(page, (w) => { w.materiels.find((x) => x.id === m.id)!.salleId = salle.id; })).ok()).toBe(true);
  const affecte = (await vue(page)).materiels.find((x) => x.id === m.id)!;
  expect(affecte.deplacement, 'déplacement lancé par le serveur').toBeTruthy();

  expect((await ecrire(page, (w) => {
    const x = w.materiels.find((y) => y.id === m.id)!;
    x.installation = { de: x.deplacement!.de, at: Date.now(), par: '', parId: null };
    delete x.deplacement;
  })).ok()).toBe(true);
  const installe = (await vue(page)).materiels.find((x) => x.id === m.id)!;
  expect(installe.deplacement).toBeUndefined();
  expect(installe.installation?.par).toBe('Sophie Garnier');

  await page.goto('/materiels/inventaire');
  await page.getByLabel('Rechercher un matériel').fill(m.idOrion);
  await expect(page.getByText(modele).first()).toBeVisible();
  await deconnecter(page);
});

/* ---------- #107 · Supervision, interventions et remontées ---------- */

test('#107 · formateur : arrêt d’un processus exécuté par le poste', async ({ page }) => {
  await connecter(page, 'formateur');
  const v = await vue(page);
  const salle = v.processus.find((p) => !p.stoppedAt)!.salleId;
  await page.goto(`/supervision/salles?salle=${salle}`);
  const arret = page.locator('[data-stop]').first();
  await expect(arret).toBeVisible({ timeout: 30_000 });
  const processus = await arret.getAttribute('data-stop');
  await arret.click();
  await expect(page.getByText('Arrêt demandé').first()).toBeVisible();
  await expect.poll(async () => (await vue(page)).interventions.find((o) => o.processusId === processus)?.statut, { timeout: 60_000 }).toMatch(/^(terminee|echec)$/);
  await deconnecter(page);
});

test('#107 · administrateur : installation d’une application exécutée par le poste', async ({ page }) => {
  await connecter(page, 'admin');
  const v = await vue(page);
  const poste = v.postes.find((p) => p.allume && p.vuLe && Date.now() - p.vuLe < 120_000)!;
  const app = v.applications.find((a) => !v.installations.some((i) => i.posteId === poste.id && i.applicationId === a.id))!;
  expect(poste && app, 'poste actif et application non installée').toBeTruthy();
  const avant = new Set(v.interventions.map((o) => o.id));
  expect((await ecrire(page, (w) => { w.interventions.push({ id: 'recette', type: 'installation', cibles: [poste.id], applicationId: app.id } as unknown as Intervention); })).ok()).toBe(true);
  let demande!: Intervention;
  await expect.poll(async () => { demande = (await vue(page)).interventions.find((o) => !avant.has(o.id) && o.applicationId === app.id)!; return demande?.statut; }, { timeout: 90_000 }).toMatch(/^(terminee|echec)$/);
  expect(demande.par).toBe('Julien Mercier');
  await deconnecter(page);
});

test('#107 · remontée : créée par le formateur, PDF, prise en charge et corrigée par le gestionnaire', async ({ page }) => {
  const description = `Recette : écran noir ${Date.now()}`;
  await connecter(page, 'formateur');
  await page.goto('/remontees/attente');
  await page.getByRole('button', { name: 'Signaler un problème', exact: true }).click();
  const fenetre = page.getByRole('dialog', { name: 'Signaler un problème', exact: true });
  await fenetre.locator('[data-salle]').first().click();
  await fenetre.locator('[data-mat]').first().click();
  await fenetre.getByRole('button', { name: 'Continuer', exact: true }).click();
  await fenetre.getByLabel('Description du problème *').fill(description);
  await fenetre.getByRole('radio', { name: 'Autre', exact: true }).click();
  await fenetre.getByLabel('Précisez le type de problème *').fill('Recette');
  await fenetre.getByRole('button', { name: 'Transmettre la remontée', exact: true }).click();
  await expect(fenetre).toHaveCount(0);
  let r!: Remontee;
  await expect.poll(async () => { r = (await vue(page)).remontees.find((x) => x.description === description)!; return r?.id; }).toMatch(/^REM-\d{4}$/);
  const pdf = await page.request.get(`/api/workspace/reports/${r.id}/pdf`);
  expect(pdf.headers()['content-type']).toBe('application/pdf');
  expect((await pdf.body()).subarray(0, 5).toString()).toBe('%PDF-');
  await deconnecter(page);

  await connecter(page, 'gestionnaire');
  for (const statut of ['encours', 'corrige'] as const) {
    expect((await ecrire(page, (w) => { w.remontees.find((x) => x.id === r.id)!.statut = statut; })).ok(), statut).toBe(true);
  }
  const traitee = (await vue(page)).remontees.find((x) => x.id === r.id)!;
  expect(traitee.historique.map((e) => e.statut)).toEqual(['attente', 'encours', 'corrige']);
  expect(traitee.historique.at(-1)!.par).toBe('Sophie Garnier');
  await deconnecter(page);
});

/* ---------- #116 · RIGEL de bout en bout (téléphone émulé, relais Hidora, connecteur) ---------- */

async function telephone(browser: Browser) {
  const contexte = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, locale: 'fr-FR', timezoneId: 'Europe/Paris' });
  return contexte.newPage();
}

test('#116 · RIGEL : recensement lancé, téléphone appairé, présences synchronisées et intégrées par ORION', async ({ page, browser }) => {
  const nom = `Recette RIGEL ${Date.now()}`;
  await connecter(page, 'gestionnaire');
  await page.goto('/materiels/recensement');
  await page.getByRole('button', { name: 'Nouveau recensement' }).click();
  const fenetre = page.getByRole('dialog');
  await fenetre.getByLabel('Nom *').fill(nom);
  await fenetre.getByRole('button', { name: 'Lancer le recensement' }).click();
  await page.waitForURL(/\/materiels\/recensement\/.+/);
  let v = await vue(page);
  const operation = v.operations.find((o) => o.nom === nom)!;
  const { url } = await (await page.request.get(`/api/workspace/operations/${encodeURIComponent(operation.id)}/appairage`)).json();
  expect(url).toMatch(/^https:\/\//);

  // Matériels d'une salle de l'école, présents et non en déplacement
  const salle = v.salles.find((s) => s.ecoleId === operation.ecoleId && v.materiels.filter((m) => m.salleId === s.id && !m.hs && !m.deplacement).length >= 2)!;
  const presents = v.materiels.filter((m) => m.salleId === salle.id && !m.hs && !m.deplacement).slice(0, 2);

  const mobile = await telephone(browser);
  await mobile.goto(url);
  await mobile.getByRole('heading', { name: nom }).waitFor({ timeout: 90_000 }); // instantané publié par le connecteur sur le relais
  const ecran = (route: string) => mobile.evaluate((r) => { history.pushState(null, '', r); dispatchEvent(new PopStateEvent('popstate')); }, route);
  for (const m of presents) {
    await ecran(`/materiels/${encodeURIComponent(m.id)}?lieu=${salle.id}`);
    await mobile.getByRole('heading', { name: m.modele }).first().waitFor();
    await mobile.getByRole('button', { name: 'Confirmer la présence' }).click();
    await mobile.waitForURL(/\/scanner/);
  }
  await ecran('/synchronisation');
  await mobile.getByRole('heading', { name: 'Intégrés' }).waitFor({ timeout: 120_000 });
  await mobile.context().close();

  await expect.poll(async () => { v = await vue(page); return v.constats.filter((c) => c.operationId === operation.id).length; }, { timeout: 60_000 }).toBeGreaterThanOrEqual(presents.length);
  expect(v.constats.filter((c) => c.operationId === operation.id).every((c) => c.resultat === 'present' || c.resultat === 'confirme')).toBe(true);

  // Recensement clos pour ne pas laisser d'opération ouverte dans les données de démonstration
  expect((await ecrire(page, (w) => { w.operations.find((o) => o.id === operation.id)!.close = { at: Date.now(), par: '', parId: null }; })).ok()).toBe(true);
  await deconnecter(page);
});
