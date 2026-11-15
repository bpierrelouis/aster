/* Captures de l'application mobile RIGEL (design/maquettes/captures/80-…) : téléphone 390 × 844, et bilan du recensement
   dans ORION (24-materiels-recensement, 1440 × 900). Utilise le mode interface seule (npm run dev:ui) et le module
   mobile (relais, application mobile et connecteur relié à ORION par ORION_API) déjà lancés. Le gestionnaire lance (ou reprend)
   le recensement « Recensement du bâtiment A », un téléphone neuf y est appairé et confirme quelques présences.
   La caméra du téléphone est remplacée, pour la capture seulement, par une image fixe sans code lisible.
   ORION_URL=http://127.0.0.1:5175 RIGEL_URL=http://127.0.0.1:5177 npm run captures:rigel (valeurs par défaut) */
import { chromium } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { channel } from './navigateur.ts';
import type { Page } from '@playwright/test';
import type { WorkspaceView } from '#shared/types.ts';

const ORION = (process.env.ORION_URL || 'http://127.0.0.1:5175').replace(/\/$/, '');
const RIGEL = (process.env.RIGEL_URL || 'http://127.0.0.1:5177').replace(/\/$/, '');
const DIR = fileURLToPath(new URL('../../design/maquettes/captures/', import.meta.url));
const NOM = 'Recensement du bâtiment A';
const headers = { origin: ORION };

const browser = await chromium.launch({ channel, headless: true });
const bureau = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: 'light', locale: 'fr-FR', timezoneId: 'Europe/Paris' });

// Caméra simulée, pour la capture seulement : image fixe d'une étiquette (motif sans repères de lecture, jamais décodé)
const image = join(mkdtempSync(join(tmpdir(), 'rigel-camera-')), 'camera.mjpeg');
const dessin = await bureau.newPage();
await dessin.setViewportSize({ width: 1920, height: 1080 });
await dessin.setContent('<body style="margin:0"><canvas width="1920" height="1080" style="display:block"></canvas></body>');
await dessin.evaluate(() => {
  const g = document.querySelector('canvas')!.getContext('2d')!;
  const fond = g.createLinearGradient(0, 0, 0, 1080);
  fond.addColorStop(0, '#5a5f68'); fond.addColorStop(1, '#202329');
  g.fillStyle = fond; g.fillRect(0, 0, 1920, 1080);
  g.fillStyle = '#2b2f36'; g.beginPath(); g.roundRect(700, 250, 520, 580, 28); g.fill();
  g.fillStyle = '#f4f4f2'; g.beginPath(); g.roundRect(800, 470, 320, 150, 10); g.fill();
  let graine = 7;
  const hasard = () => ((graine = (graine * 16807) % 2147483647) / 2147483647);
  g.fillStyle = '#1b1b1b';
  for (let x = 0; x < 13; x++) for (let y = 0; y < 13; y++) if (hasard() > 0.55) g.fillRect(820 + x * 8, 493 + y * 8, 8, 8);
  for (let i = 0; i < 4; i++) g.fillRect(945, 500 + i * 26, 150 - i * 28, 10);
});
const jpeg = await dessin.screenshot({ type: 'jpeg', quality: 85 });
writeFileSync(image, Buffer.concat([jpeg, jpeg, jpeg]));
await dessin.close();

const camera = await chromium.launch({ channel, headless: true, args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', `--use-file-for-fake-video-capture=${image}`] });
const telephone = await camera.newContext({
  viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true,
  colorScheme: 'light', locale: 'fr-FR', timezoneId: 'Europe/Paris', permissions: ['camera'],
});

const orion = await bureau.newPage();
const mobile = await telephone.newPage();

async function api<T>(chemin: string, init?: { data: unknown }): Promise<T> {
  const reponse = init ? await bureau.request.post(ORION + chemin, { data: init.data, headers }) : await bureau.request.get(ORION + chemin);
  if (!reponse.ok()) throw new Error(`${chemin} : ${reponse.status()} (mode interface seule requis sur ${ORION})`);
  return reponse.json();
}

async function settle(page: Page) {
  await page.evaluate(() => document.fonts.ready);
  await page.waitForFunction(() => document.getAnimations().every((a) => a.timeline !== document.timeline || a.effect?.getTiming().iterations === Infinity || a.playState !== 'running'), null, { timeout: 10_000 });
  await page.waitForTimeout(400);
}

async function shot(page: Page, name: string) {
  await settle(page);
  if (page === mobile) await page.waitForFunction(() => !document.querySelector('.annonce[data-visible]'), null, { timeout: 5000 }); // retour d'action effacé
  await page.screenshot({ path: `${DIR}${name}.png`, animations: 'disabled' });
  console.log(`${name}.png`);
}

/** Écran mobile ouvert par son adresse (navigation interne de l'application, sans rechargement) */
async function ecran(route: string, titre?: string) {
  await mobile.evaluate((r) => { history.pushState(null, '', r); dispatchEvent(new PopStateEvent('popstate')); }, route);
  if (titre) await mobile.getByRole('heading', { name: titre, exact: true }).first().waitFor();
}

const original = (await api<{ courant: string }>('/api/dev/comptes')).courant;
try {
  await api('/api/dev/compte', { data: { id: 'cpt-num-gestionnaire' } });
  let data = await api<WorkspaceView>('/api/workspace');
  const salle = (nom: string) => data.salles.find((s) => s.nom === nom)!.id;

  // Recensement du bâtiment A, lancé par le gestionnaire s'il n'est pas déjà ouvert
  const ouvert = () => data.recensements.find((r) => r.nom === NOM && !r.close && r.expireLe > Date.now());
  if (!ouvert()) {
    await orion.goto(`${ORION}/materiels/recensement`);
    await orion.getByRole('button', { name: 'Nouveau recensement' }).click();
    const fenetre = orion.getByRole('dialog');
    await fenetre.getByLabel('Nom *').fill(NOM);
    await fenetre.getByRole('radio', { name: 'Salles choisies' }).click();
    await fenetre.locator('legend').filter({ hasText: /^A/ }).getByRole('checkbox').check();
    await fenetre.getByRole('button', { name: 'Lancer le recensement' }).click();
    await orion.waitForURL(/\/materiels\/recensement\/.+/);
    data = await api<WorkspaceView>('/api/workspace');
  }
  const recensement = ouvert()!;
  const { url } = await api<{ url: string }>(`/api/workspace/recensements/${encodeURIComponent(recensement.id)}/appairage`);

  // Téléphone neuf : appairage, puis appairé au recensement (instantané publié par le connecteur)
  await mobile.goto(`${RIGEL}/`);
  await mobile.getByRole('heading', { name: 'Associer ce téléphone' }).waitFor();
  await shot(mobile, '80-rigel-appairage');
  await mobile.goto(`${RIGEL}/${new URL(url).hash}`);
  await mobile.getByRole('heading', { name: NOM }).waitFor({ timeout: 60_000 });

  // Présences confirmées dans A101, en tête de son inventaire, un matériel sur trois laissé non vu ;
  // un matériel de A105 est ensuite ouvert depuis A101
  const a101 = salle('A101');
  const presents = data.materiels.filter((m) => m.salleId === a101 && !m.hs && !m.deplacement)
    .sort((x, y) => x.idOrion.localeCompare(y.idOrion, 'fr', { numeric: true })).filter((_, i) => i % 3 !== 2).slice(0, 6);
  const ailleurs = data.materiels.find((m) => m.salleId === salle('A105') && !m.hs && !m.deplacement)!;
  for (const m of presents.slice(0, 5)) {
    await ecran(`/materiels/${encodeURIComponent(m.id)}?lieu=${a101}`, m.modele);
    await mobile.getByRole('button', { name: 'Confirmer la présence' }).click();
    await mobile.waitForURL(/\/scanner/);
  }
  await ecran('/synchronisation', 'Synchronisation');
  await mobile.getByRole('heading', { name: 'Intégrés' }).waitFor({ timeout: 60_000 });

  await ecran('/', NOM); await shot(mobile, '81-rigel-accueil');
  await ecran('/explorer', 'Explorer'); await shot(mobile, '82-rigel-explorer');
  await ecran(`/salles/${a101}`, 'A101'); await shot(mobile, '83-rigel-salle');
  await ecran(`/salles/${a101}/inventaire`, 'Inventaire · A101'); await shot(mobile, '84-rigel-inventaire');
  await ecran(`/scanner?lieu=${a101}`);
  await mobile.locator('.scanner-mode').waitFor();
  await shot(mobile, '85-rigel-scanner');
  await ecran(`/materiels/${encodeURIComponent(ailleurs.id)}?lieu=${a101}`, ailleurs.modele);
  await shot(mobile, '86-rigel-materiel');
  await ecran(`/inconnu?code=PF4KX29T&serie=PF4KX29T&marque=Lenovo&lieu=${a101}`, 'Matériel inconnu');
  await shot(mobile, '87-rigel-code-inconnu');
  await mobile.getByRole('button', { name: 'Installer ici' }).click();
  await mobile.getByRole('combobox', { name: 'Type' }).selectOption({ label: 'Écran' });
  await mobile.getByRole('textbox', { name: 'Modèle' }).fill('ThinkVision T24i-30');
  await mobile.locator('body').click({ position: { x: 5, y: 5 } });
  await shot(mobile, '88-rigel-code-inconnu-saisie');

  // Hors connexion : une présence reste en attente sur le téléphone
  await telephone.setOffline(true);
  await ecran(`/materiels/${encodeURIComponent(presents[5].id)}?lieu=${a101}`, presents[5].modele);
  await mobile.getByRole('button', { name: 'Confirmer la présence' }).click();
  await mobile.waitForURL(/\/scanner/);
  await ecran('/synchronisation', 'Synchronisation');
  await mobile.getByText('En attente').first().waitFor();
  await shot(mobile, '89-rigel-synchronisation');
  await telephone.setOffline(false);

  // Bilan du recensement dans ORION
  await orion.goto(`${ORION}/materiels/recensement/${recensement.id}`);
  await orion.locator('#view h1').waitFor({ state: 'attached' });
  await orion.mouse.move(1439, 899);
  await shot(orion, '24-materiels-recensement');
} finally {
  await api('/api/dev/compte', { data: { id: original } }).catch((error) => { console.error('Compte d’origine non rétabli :', error); process.exitCode = 1; });
  await Promise.all([browser.close(), camera.close()]);
}

execFileSync('sh', ['-c', 'pngquant --quality=70-90 --skip-if-larger --strip --force --ext .png -- 24-*.png 8?-rigel-*.png || [ $? -eq 98 -o $? -eq 99 ]'], { cwd: DIR, stdio: 'inherit' });
