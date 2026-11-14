/* Captures des maquettes (design/maquettes/captures/) : 1440 × 900, une par écran, profil et ambiance.
   Utilise le mode interface seule déjà lancé (npm run dev:ui), changement de compte par /api/dev/compte ;
   refait quelques fois une opération refusée momentanément ; rétablit à la fin, même après un échec, le compte
   courant et les préférences des comptes utilisés. Compression par pngquant.
   ORION_URL=http://127.0.0.1:5175 npm run captures */
import { chromium } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { channel } from './navigateur.ts';
import type { APIRequestContext, Page } from '@playwright/test';
import type { WorkspaceView } from '#shared/types.ts';

const BASE = (process.env.ORION_URL || 'http://127.0.0.1:5175').replace(/\/$/, '');
const DIR = fileURLToPath(new URL('../../design/maquettes/captures/', import.meta.url));
const ACCOUNTS = { admin: 'cpt-num-admin', gestionnaire: 'cpt-num-gestionnaire', formateur: 'cpt-num-formateur', superadmin: 'cpt-superadmin' };
type Profile = keyof typeof ACCOUNTS;
type Saved = Pick<WorkspaceView, 'prefs' | 'layouts' | 'ecoleId'>;

const browser = await chromium.launch({ channel, headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, colorScheme: 'light', locale: 'fr-FR', timezoneId: 'Europe/Paris' });
const page = await context.newPage();
const request = context.request;
const headers = { origin: BASE };

const TRANSIENT = [409, 500, 502, 503, 504];
/** Refus momentané du serveur (écriture concurrente des postes, redémarrage du serveur de développement) : quelques essais espacés */
async function retry<T>(what: string, attempt: () => Promise<T>, tries = 5): Promise<T> {
  for (let n = 1; ; n++) {
    try { return await attempt(); } catch (error) {
      const status = (error as { status?: number }).status;
      if (n >= tries || (status !== undefined && !TRANSIENT.includes(status))) throw error;
      console.warn(`${what} : nouvel essai (${n}/${tries - 1}) après « ${(error as Error).message} »`);
      await new Promise((resolve) => setTimeout(resolve, 500 * n));
    }
  }
}
const failure = (message: string, status: number) => Object.assign(new Error(message), { status });

async function workspace(): Promise<WorkspaceView> {
  return retry('Lecture de l’espace', async () => {
    const response = await request.get(`${BASE}/api/workspace`);
    if (!response.ok()) throw failure(`Espace de travail indisponible sur ${BASE} (npm run dev:ui).`, response.status());
    return response.json();
  });
}

async function switchTo(id: string) {
  await retry(`Changement de compte (${id})`, async () => {
    const response = await request.post(`${BASE}/api/dev/compte`, { data: { id }, headers });
    if (!response.ok()) throw failure(`Changement de compte impossible (${id}) : mode interface seule requis.`, response.status());
  });
}

/** Écran chargé, polices prêtes, animations d'entrée terminées */
async function settle() {
  await page.locator('.loading').waitFor({ state: 'detached' }).catch(() => {});
  await page.evaluate(() => document.fonts.ready);
  // Animations finies du temps du document ; celles liées au défilement ou sans fin sont ignorées
  await page.waitForFunction(() => document.getAnimations().every((a) => a.timeline !== document.timeline || a.effect?.getTiming().iterations === Infinity || a.playState !== 'running'), null, { timeout: 10_000 });
  await page.waitForTimeout(400);
}

async function open(route: string) {
  await page.goto(BASE + route);
  await page.locator('#view h1').waitFor({ state: 'attached' });
  await settle();
}

async function shot(name: string) {
  await settle();
  await page.mouse.move(1439, 899); // aucun survol ni infobulle
  await page.waitForTimeout(200);
  await page.screenshot({ path: `${DIR}${name}.png`, animations: 'disabled' });
  console.log(`${name}.png`);
}

/** Enregistrement par la même voie que l'interface (apply, exécuté dans la page), une fois celui en cours terminé ;
   un refus momentané recharge l'état du serveur, puis recommence */
async function save<A>(what: string, apply: (arg: A) => unknown, arg: A) {
  await retry(what, async () => {
    await page.evaluate(() => window.orion.store.flush().catch(() => {}));
    await page.evaluate(apply as (arg: unknown) => unknown, arg);
    const error = await page.evaluate(() => window.orion.store.flush().then(() => null, (e: Error & { status?: number }) => ({ message: e.message, status: e.status ?? 500 })));
    if (!error) return;
    await page.reload();
    await page.locator('#view h1').waitFor({ state: 'attached' });
    throw failure(error.message, error.status);
  });
}

/** Préférences d'affichage du compte courant */
const setPrefs = (prefs: Partial<WorkspaceView['prefs']>) => save('Préférences', (p) => window.orion.store.update('prefs', (s) => { Object.assign(s.prefs, p); }), prefs);

// Le serveur de développement peut avoir été relancé (compte initial) : le compte est toujours redemandé
const as = (profile: Profile) => switchTo(ACCOUNTS[profile]);

const original = (await (await request.get(`${BASE}/api/dev/comptes`)).json()).courant as string;
const saved = new Map<Profile, Saved>();
for (const profile of Object.keys(ACCOUNTS) as Profile[]) {
  await as(profile);
  const { prefs, layouts, ecoleId } = await workspace();
  saved.set(profile, { prefs, layouts, ecoleId });
}

try {
  await as('admin');
  const data = await workspace();
  const salle = (nom: string) => data.salles.find((s) => s.nom === nom)!.id;
  await open('/accueil');
  await setPrefs({ ambiance: 'orion', tone: 'light' });

  // Connexion : page publique, affichée quand aucune session n'est ouverte
  await page.route('**/api/me', (route) => route.fulfill({ status: 401, contentType: 'application/json', body: '{"error":"Connexion nécessaire."}' }));
  await page.goto(BASE + '/');
  await page.getByRole('link', { name: "S'identifier avec MinDefConnect" }).waitFor();
  await shot('01-connexion');
  await page.unroute('**/api/me');

  // Administrateur
  await open('/accueil'); await shot('02-accueil-administrateur');
  await open('/accueil/parc'); await shot('06-tableau-parc');
  await open('/accueil/remontees'); await shot('07-tableau-remontees');
  // Personnalisation : contour pointillé des cartes (mouvement réduit), le tremblement ne se voit pas sur une image
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await open('/accueil');
  await page.getByRole('button', { name: 'Personnaliser' }).click();
  await shot('08-personnaliser');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await open('/salles'); await shot('10-salles-vue-eclatee');
  await open('/salles/batiment/A'); await shot('11-salles-batiment');
  await open(`/salles/salle/${salle('A101')}`); await shot('12-salle-detail');
  await open('/salles/stock'); await shot('13-salles-stock');
  await open('/materiels/inventaire'); await shot('20-materiels-inventaire');
  await page.locator('.inv-device').first().click();
  await shot('21-materiel-fiche');
  await open('/materiels/inventaire');
  await page.getByRole('button', { name: 'Ajouter un matériel' }).click();
  await shot('22-materiel-ajout');
  await open('/materiels/import'); await shot('23-materiels-import');
  await open('/remontees/attente'); await shot('30-remontees-liste');
  await page.locator('.rm-row').first().click();
  await shot('31-remontee-detail');
  await page.getByRole('button', { name: 'État des lieux' }).click();
  await page.locator('article.edl').waitFor();
  await shot('34-remontee-etat-des-lieux');
  await open('/supervision/alertes'); await shot('40-supervision-alertes');
  await open(`/supervision/salles?salle=${salle('B204')}`); await shot('41-supervision-salle');
  await open('/supervision/listes'); await shot('42-supervision-listes');
  await open('/supervision/statistiques'); await shot('43-supervision-statistiques');
  await open('/administration/postes'); await shot('50-administration-postes');
  await page.getByRole('button', { name: 'Ouvrir' }).first().click();
  await shot('51-administration-poste');
  await open('/administration/applications'); await shot('52-administration-applications');
  await open('/administration/interventions');
  await page.locator('.rm-row').first().click();
  await shot('53-administration-interventions');
  await open('/administration/batiments'); await shot('54-administration-batiments');

  // Ambiances, choisies dans les préférences du compte
  await setPrefs({ ambiance: 'orion', tone: 'dark' });
  await open('/accueil'); await shot('70-ambiance-orion-sombre');
  await open('/salles'); await shot('71-ambiance-orion-sombre-salles');
  await setPrefs({ ambiance: 'minarm', tone: 'light' });
  await open('/accueil'); await shot('72-ambiance-minarm');
  await open('/remontees/attente');
  await page.locator('.rm-row').first().click();
  await shot('73-ambiance-minarm-remontee');

  // Gestionnaire
  await as('gestionnaire');
  await open('/accueil'); await setPrefs({ ambiance: 'orion', tone: 'light' });
  await open('/accueil'); await shot('03-accueil-gestionnaire');
  await open('/salles/deplacements'); await shot('14-salles-deplacements');
  await open('/remontees/backlog'); await shot('33-remontees-backlog');
  await open('/notifications'); await shot('60-notifications');

  // Formateur
  await as('formateur');
  await open('/accueil'); await setPrefs({ ambiance: 'orion', tone: 'light' });
  await open('/accueil'); await shot('04-accueil-formateur');
  await open('/remontees');
  await page.getByRole('button', { name: 'Signaler un problème', exact: true }).click();
  await shot('32-remontee-creation');
  await page.getByRole('dialog').getByRole('button', { name: /^A105/ }).click();
  await shot('32b-remontee-creation-materiels');

  // Super administrateur
  await as('superadmin');
  await open('/accueil'); await setPrefs({ ambiance: 'orion', tone: 'light' });
  await open('/accueil');
  await page.getByRole('button', { name: /^École affichée/ }).click();
  await page.getByRole('dialog', { name: 'École affichée' }).or(page.locator('.popover--list')).first().waitFor();
  await shot('05-accueil-super-administrateur');
} finally {
  // Préférences et compte d'origine, rétablis même si une étape a échoué
  const errors: unknown[] = [];
  const attempt = async (step: () => Promise<unknown>) => { try { await step(); } catch (error) { errors.push(error); } };
  await attempt(() => page.unrouteAll());
  for (const [profile, before] of saved) {
    await attempt(async () => {
      await as(profile);
      await page.goto(BASE + '/accueil');
      await page.locator('#view h1').waitFor({ state: 'attached' });
      const same = (x: unknown, y: unknown) => JSON.stringify(x) === JSON.stringify(y);
      const now = await page.evaluate(() => { const { prefs, layouts, ecoleId } = window.orion.store.state; return { prefs, layouts, ecoleId }; });
      if (!same(now.prefs, before.prefs)) await save(`Préférences de ${profile}`, (b) => window.orion.store.update('prefs', (s) => { s.prefs = b.prefs; }), before);
      if (!same(now.layouts, before.layouts) || now.ecoleId !== before.ecoleId) await save(`Dispositions de ${profile}`, (b) => window.orion.store.update('layout', (s) => { s.layouts = b.layouts; s.ecoleId = b.ecoleId; }), before);
    });
  }
  await attempt(() => switchTo(original));
  await browser.close();
  if (errors.length) { console.error('Rétablissement incomplet :', ...errors); process.exitCode = 1; }
}

execFileSync('sh', ['-c', 'pngquant --quality=70-90 --skip-if-larger --strip --force --ext .png -- *.png || [ $? -eq 98 -o $? -eq 99 ]'], { cwd: DIR, stdio: 'inherit' });
