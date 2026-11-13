import { test, expect } from '@playwright/test';
import { role as roleOf } from '#shared/catalog.ts';
import { dateNum, dateTime } from '#shared/format.ts';
import type { APIRequestContext, Locator, Page } from '@playwright/test';
import type { Compte, Materiel, WorkspaceView } from '#shared/types.ts';

const routes = [
  '/accueil', '/accueil/parc', '/accueil/remontees', '/salles',
  '/salles/batiment/A', '/salles/stock',
  '/materiels/inventaire', '/materiels/import', '/materiels/recensement',
  '/remontees/attente', '/remontees/encours', '/remontees/terminees', '/remontees/toutes', '/remontees/miennes',
  '/supervision/salles', '/supervision/alertes', '/supervision/listes', '/supervision/statistiques',
  '/administration/postes', '/administration/applications', '/administration/interventions', '/administration/batiments', '/administration/comptes',
  '/salles/deplacements', '/notifications',
];

// Le titre de chaque écran est réservé aux lecteurs d'écran : présent, mais non affiché
async function open(page: Page, route: string) {
  await page.goto(route);
  await expect(page.locator('#view h1')).toBeAttached();
  await expect(page.locator('.loading')).toHaveCount(0);
}

async function state(request: APIRequestContext): Promise<WorkspaceView> {
  const response = await request.get('/api/workspace');
  expect(response.ok()).toBeTruthy();
  return response.json();
}

/** Mode interface seule : change le compte courant du serveur */
async function asAccount(request: APIRequestContext, id: string) {
  expect((await request.post('/api/dev/compte', { data: { id }, headers: { origin: 'http://127.0.0.1:5174' } })).ok()).toBeTruthy();
}

async function pick(page: Page, control: Locator, name: string | RegExp) {
  if (await control.getAttribute('aria-expanded') !== 'true') await control.click();
  await page.getByRole('listbox').getByRole('option', { name, exact: typeof name === 'string' }).click();
  await expect(control).toHaveAttribute('aria-expanded', 'false');
}

test('tous les écrans se chargent sans erreur JavaScript', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  for (const route of routes) {
    await open(page, route);
    await expect(page.locator('#view')).not.toContainText(/Bientôt disponible|première livraison/i);
  }
  expect(errors).toEqual([]);
});

test('un étage choisi est mis en évidence parmi tous les étages, salles ordonnées par nom et de hauteur fixe', async ({ page, request }) => {
  await open(page, '/salles/batiment/C');
  const data = await state(request);
  const rooms = data.salles.filter((s) => s.batiment === 'C');
  const levels = [...new Set(rooms.map((s) => s.etage))];
  await expect(page.locator('.floor-slab')).toHaveCount(levels.length);
  await expect(page.getByRole('button', { name: /Ajouter un étage|Modifier l’étage/ })).toHaveCount(0);
  await page.getByRole('link', { name: /^1er étage, \d+ salles$/ }).click();
  await expect(page).toHaveURL(/etage=1/);
  const expected = rooms.filter((s) => s.etage === 1).sort((a, b) => a.nom.localeCompare(b.nom, 'fr', { numeric: true }));
  expect(expected.length).toBe(8);
  // Tous les étages restent affichés ; celui choisi est mis en évidence et filtre la liste
  await expect(page.locator('.floor-slab')).toHaveCount(levels.length);
  await expect(page.locator('.blk')).toHaveCount(rooms.length);
  await expect(page.locator('.floor-slab.is-active .blk .blk-label b')).toHaveText(expected.map((s) => s.nom));
  await expect(page.locator('.salle-row > b')).toHaveText(expected.map((s) => s.nom));
  expect(await page.locator('.blk').evaluateAll((nodes) => new Set(nodes.map((n) => getComputedStyle(n).height + getComputedStyle(n).getPropertyValue('--h3'))).size)).toBe(1);
  // Huit salles : grille de trois colonnes sur trois rangées, la plus proche d'un carré
  const cells = await page.locator('.floor-slab.is-active .blk').evaluateAll((nodes) => nodes.map((n) => [n.style.getPropertyValue('--bx'), n.style.getPropertyValue('--by')]));
  expect(new Set(cells.map(([x]) => x)).size).toBe(3);
  expect(new Set(cells.map(([, y]) => y)).size).toBe(3);
  await page.locator('.salle-row').first().click();
  await expect(page.locator('.insp-title')).toContainText(expected[0].nom);
  await expect(page.locator('.floor-slab')).toHaveCount(levels.length);
});

test('les noms de toutes les salles sont visibles dans la vue d’ensemble', async ({ page, request }) => {
  await page.setViewportSize({ width: 1180, height: 820 });
  await open(page, '/salles');
  const data = await state(request);
  const labels = page.locator('.bat-card .blk-label b');
  await expect(labels).toHaveCount(data.salles.length);
  const hidden = await labels.evaluateAll((nodes) => nodes.filter((n) => { const r = n.getBoundingClientRect(); return !r.width || !r.height || getComputedStyle(n).visibility === 'hidden'; }).length);
  expect(hidden).toBe(0);
  const sub = page.locator('.subnav');
  expect(await sub.evaluate((n) => n.scrollWidth <= n.clientWidth + 1)).toBe(true);
  // Onglets réduits ou non : chacun garde un nom lisible par les lecteurs d'écran
  for (const name of ['Tous les bâtiments', 'Stock']) await expect(sub.getByRole('link', { name })).toBeVisible();
});

test('les onglets trop larges se réduisent à leur icône, avec une infobulle', async ({ page }) => {
  // Police embarquée (Marianne) : la largeur des onglets ne dépend pas de la police du système (CI Linux)
  await page.setViewportSize({ width: 1100, height: 820 });
  await open(page, '/salles');
  await page.evaluate(async () => {
    document.documentElement.style.setProperty('--font-text', 'Marianne');
    await document.fonts.ready;
  });
  await page.setViewportSize({ width: 1000, height: 820 });
  const sub = page.locator('.subnav');
  await expect(sub).toHaveClass(/is-tight/);
  const stock = sub.getByRole('link', { name: 'Stock' });
  expect(await stock.locator(':scope > span').evaluate((n) => n.getBoundingClientRect().width)).toBeLessThanOrEqual(1);
  await expect(stock).toHaveAttribute('data-tip', 'Stock');
  await page.setViewportSize({ width: 1600, height: 820 });
  await expect(sub).not.toHaveClass(/is-tight/);
  await expect(stock).not.toHaveAttribute('data-tip');
});

test('le stock n’affiche que le stock', async ({ page }) => {
  await open(page, '/salles/batiment/C');
  await expect(page.locator('#view h1')).toHaveText('Bâtiment C');
  await page.locator('.subnav').getByRole('link', { name: 'Stock' }).click();
  await expect(page).toHaveURL(/salles\/stock/);
  await expect(page.locator('#view h1')).toHaveText('Stock');
  await expect(page.locator('.spanel .insp-title h2')).toHaveText('Stock');
  await expect(page.locator('.bat-card, .iso, .floor-slab')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Nouvelle salle', exact: true })).toHaveCount(0);
  await page.locator('.subnav').getByRole('link', { name: /Bâtiment B/ }).click();
  await expect(page.locator('#view h1')).toHaveText('Bâtiment B');
  await expect(page.locator('.floor-slab').first()).toBeVisible();
});

test('les titres d’écran ne sont pas affichés', async ({ page }) => {
  for (const route of ['/accueil', '/salles', '/materiels/inventaire', '/remontees/attente', '/supervision/salles', '/administration/postes']) {
    await open(page, route);
    expect(await page.locator('#view h1').evaluate((n) => n.getBoundingClientRect().width), route).toBeLessThanOrEqual(1);
  }
});

test('cliquer une ligne de l’inventaire la sélectionne', async ({ page }) => {
  await open(page, '/materiels/inventaire');
  const row = page.locator('.inv-table tbody tr').first();
  await row.locator('.inv-id').click();
  await expect(row.locator('input[type=checkbox]')).toBeChecked();
  await expect(page.locator('.inv-selection strong')).toHaveText('1');
  await row.locator('td').last().click();
  await expect(row.locator('input[type=checkbox]')).not.toBeChecked();
  // Les commandes de la ligne gardent leur action : le matériel s'ouvre sans changer la sélection
  await row.locator('.inv-device').click();
  await expect(page.getByRole('dialog')).toHaveCount(1);
  await expect(row.locator('input[type=checkbox]')).not.toBeChecked();
});

test('un tableau de bord personnalisé se crée, se renomme et se supprime depuis l’accueil', async ({ page }) => {
  const name = `Tableau ${Date.now()}`;
  await open(page, '/accueil');
  await page.getByRole('button', { name: 'Nouveau tableau de bord', exact: true }).click();
  let dialog = page.getByRole('dialog', { name: 'Nouveau tableau de bord' });
  await dialog.getByLabel('Nom').fill(name);
  await dialog.getByLabel('Nom').press('Enter');
  await expect(page).toHaveURL(/\/accueil\/tb-/);
  await expect(page.locator('.subnav .is-on')).toHaveText(name);
  await page.getByRole('button', { name: 'Ajouter un widget', exact: true }).click();
  await page.getByRole('dialog', { name: 'Ajouter un widget' }).getByRole('button', { name: 'Ajouter', exact: true }).first().click();
  await expect(page.locator('.widget')).toHaveCount(1);
  await page.reload();
  await expect(page.locator('.subnav .is-on')).toHaveText(name);
  await expect(page.locator('.widget')).toHaveCount(1);
  await page.getByRole('button', { name: 'Personnaliser' }).click();
  await page.getByRole('button', { name: 'Renommer le tableau de bord' }).click();
  dialog = page.getByRole('dialog', { name: 'Renommer le tableau de bord' });
  await dialog.getByLabel('Nom').fill(`${name} bis`);
  await dialog.getByRole('button', { name: 'Renommer', exact: true }).click();
  await expect(page.locator('.subnav .is-on')).toHaveText(`${name} bis`);
  await page.getByRole('button', { name: 'Personnaliser' }).click();
  await page.getByRole('button', { name: 'Supprimer le tableau de bord' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Supprimer', exact: true }).click();
  await expect(page).toHaveURL(/\/accueil$/);
  await expect(page.locator('.subnav')).not.toContainText(name);
});

test('quitter une salle de la vue éclatée retire son état survolé', async ({ page }) => {
  await open(page, '/salles/batiment/C');
  const room = page.locator('.blk').first();
  await room.hover();
  await expect(page.locator('.blk.is-hover')).toHaveCount(1);
  await expect(page.locator('.salle-row.is-hover')).toHaveCount(1);
  const box = (await page.locator('.iso-stage').boundingBox())!;
  await page.mouse.move(box.x + 12, box.y + 12);
  await expect(page.locator('.blk.is-hover, .salle-row.is-hover')).toHaveCount(0);
  await page.locator('.salle-row').nth(2).hover();
  await expect(page.locator('.blk.is-hover')).toHaveCount(1);
  await page.mouse.move(box.x + 12, box.y + 12);
  await expect(page.locator('.blk.is-hover, .salle-row.is-hover')).toHaveCount(0);
});

test('les mises à jour reçues ne rejouent pas les animations de la scène', async ({ page }) => {
  await open(page, '/salles/batiment/C');
  await page.waitForTimeout(1000);
  const running = await page.evaluate(() => new Promise((resolve) => {
    const unsub = window.orion.store.subscribe((topic) => {
      if (topic !== 'remote') return;
      unsub();
      requestAnimationFrame(() => requestAnimationFrame(() => resolve(document.getAnimations().filter((a) => a.playState === 'running' && (a.effect as KeyframeEffect | null)?.target?.closest?.('.iso')).length)));
    });
    setTimeout(() => resolve(-1), 15000);
  }));
  expect(running).toBe(0);
});

test('chaque action n’a qu’un point d’entrée par écran', async ({ page }) => {
  await open(page, '/remontees/attente');
  await expect(page.getByRole('button', { name: 'Signaler un problème', exact: true })).toHaveCount(1);
  await expect(page.locator('.rail-action')).toHaveCount(0);
  for (const route of ['/accueil', '/accueil/parc', '/accueil/remontees']) {
    await open(page, route);
    await expect(page.getByRole('button', { name: /Signaler un problème|Ajouter un matériel/ })).toHaveCount(0);
  }
  await open(page, '/salles/batiment/A');
  await expect(page.getByRole('button', { name: 'Nouvelle salle', exact: true })).toHaveCount(1);
  await expect(page.getByRole('button', { name: 'Ajouter un matériel', exact: true })).toHaveCount(0);
  await page.goto('/materiels/affectation');
  await expect(page).toHaveURL(/materiels\/inventaire/);
});

test('la navigation donne une adresse à chaque écran et suit l’historique', async ({ page }) => {
  await open(page, '/');
  await expect(page).toHaveURL(/\/accueil$/);
  await page.getByRole('link', { name: 'Salles', exact: true }).click();
  await expect(page).toHaveURL(/\/salles$/);
  await expect(page.locator('.rail-item.is-active')).toHaveAttribute('data-nav', 'salles');
  await page.getByRole('link', { name: 'Bâtiment A', exact: true }).click();
  await expect(page).toHaveURL(/\/salles\/batiment\/A$/);
  await expect(page.locator('.subnav .is-on')).toHaveAttribute('aria-current', 'page');
  await page.goBack();
  await expect(page).toHaveURL(/\/salles$/);
  await page.goBack();
  await expect(page).toHaveURL(/\/accueil$/);
  await page.goForward();
  await expect(page).toHaveURL(/\/salles$/);
  await open(page, '/adresse-inconnue');
  await expect(page).toHaveURL(/\/accueil$/);
});

test('un matériel créé est conservé après rechargement', async ({ page, request }) => {
  const model = `Écran contrôle ${Date.now()}`;
  await open(page, '/materiels/inventaire');
  await page.getByRole('button', { name: 'Ajouter un matériel', exact: true }).first().click();
  const dialog = page.getByRole('dialog', { name: 'Ajouter un matériel', exact: true });
  await dialog.getByLabel('Modèle *', { exact: true }).fill(model);
  await dialog.getByLabel('Marque', { exact: true }).fill('Équipement de contrôle');
  await dialog.getByRole('button', { name: 'Enregistrer', exact: true }).click();
  await expect(dialog).toHaveCount(0);
  await expect.poll(async () => (await state(request)).materiels.some((m) => m.modele === model)).toBe(true);
  await page.reload();
  await expect(page.locator('#view h1')).toBeAttached();
  await expect.poll(async () => page.evaluate((name) => window.orion.store.state.materiels.some((m) => m.modele === name), model)).toBe(true);
});

test('une remontée créée produit un PDF téléchargeable', async ({ page, request }, testInfo) => {
  const problemType = 'Bruit de ventilation';
  const description = `Écran noir après allumage ${Date.now()}`;
  await open(page, '/remontees/attente');
  await page.getByRole('button', { name: 'Signaler un problème', exact: true }).last().click();
  const dialog = page.getByRole('dialog', { name: 'Signaler un problème', exact: true });
  await dialog.getByRole('searchbox', { name: 'Rechercher une salle' }).fill('a012');
  await expect(dialog.locator('.pick-room')).toHaveCount(1);
  await dialog.locator('[data-salle]').filter({ hasText: 'A012' }).click();
  await dialog.locator('[data-mat]').first().click();
  await dialog.getByRole('button', { name: 'Continuer', exact: true }).click();
  await dialog.getByLabel('Description du problème *').fill(description);
  // Type de problème obligatoire : pas de transmission sans type choisi, ni sans libellé pour « Autre »
  await expect(dialog.getByRole('button', { name: 'Transmettre la remontée', exact: true })).toBeDisabled();
  await dialog.getByRole('radio', { name: 'Autre', exact: true }).click();
  const customType = dialog.getByLabel('Précisez le type de problème *');
  await expect(customType).toBeVisible();
  await expect(dialog.getByRole('button', { name: 'Transmettre la remontée', exact: true })).toBeDisabled();
  await customType.fill('bRUIT# DE VENTILATION!');
  await expect(customType).toHaveValue(problemType);
  await expect(dialog.locator('#probleme-autre-info')).toContainText('Les caractères non autorisés ont été retirés.');
  await customType.fill(problemType.toLocaleUpperCase('fr-FR'));
  await expect(dialog.locator('#probleme-autre-info')).not.toContainText('ont été retirés');
  await page.screenshot({ path: testInfo.outputPath('signalement-autre-desktop.png'), fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(customType).toBeVisible();
  const panel = (await dialog.locator('.sheet-panel').boundingBox())!;
  expect(panel.x).toBeGreaterThanOrEqual(0);
  expect(panel.x + panel.width).toBeLessThanOrEqual(391);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath('signalement-autre-mobile.png'), fullPage: true });
  await dialog.getByRole('button', { name: 'Transmettre la remontée', exact: true }).click();
  await expect(dialog).toHaveCount(0);
  await expect.poll(async () => (await state(request)).remontees.some((r) => r.description === description)).toBe(true);
  const report = (await state(request)).remontees.find((r) => r.description === description)!;
  expect(report.probleme).toBe(problemType);
  await expect(page.locator('#view')).toContainText(problemType);
  const pdf = await request.get(`/api/workspace/reports/${report.id}/pdf`);
  expect(pdf.ok()).toBeTruthy();
  expect(pdf.headers()['content-type']).toContain('application/pdf');
  expect((await pdf.body()).subarray(0, 5).toString()).toBe('%PDF-');
});

test('les écrans principaux restent contenus sur mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const route of ['/accueil', '/salles/batiment/A', '/materiels/inventaire', '/remontees/attente', '/supervision/salles', '/administration/comptes']) {
    await open(page, route);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), route).toBe(true);
  }
  await page.screenshot({ path: 'test-results/workspace-mobile.png', fullPage: true });
});

test('les actions de l’écran restent visibles pendant le défilement', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await open(page, '/accueil');
  const action = page.getByRole('button', { name: 'Personnaliser' });
  await expect(page.locator('.topbar .page-actions')).toContainText('Personnaliser');
  await page.mouse.move(700, 500);
  await page.mouse.wheel(0, 1500);
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(200);
  await expect(action).toBeInViewport();
});

const bottom = async (locator: Locator) => { const b = (await locator.boundingBox())!; return b.y + b.height; };

test('sans barre ni rebond de défilement, la fenêtre s’aligne sur le bas du menu et un fondu signale la suite', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await open(page, '/materiels/inventaire');
  const scroller = page.locator('.inv-table-scroll');
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).scrollbarWidth)).toBe('none');
  expect(await scroller.evaluate((el) => [getComputedStyle(el).scrollbarWidth, getComputedStyle(el).overscrollBehaviorY])).toEqual(['none', 'none']);
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).overscrollBehaviorY)).toBe('none');
  expect(Math.abs(await bottom(page.locator('.inv-panel')) - await bottom(page.locator('.rail')))).toBeLessThanOrEqual(1);
  await expect(scroller).toHaveClass(/has-more/);
  await scroller.evaluate((el) => { el.scrollTop = 600; });
  const [head, box] = [(await page.locator('.inv-table thead th').first().boundingBox())!, (await scroller.boundingBox())!];
  expect(Math.abs(head.y - box.y)).toBeLessThanOrEqual(1);
  await scroller.evaluate((el) => { el.scrollTop = el.scrollHeight; });
  await expect(scroller).not.toHaveClass(/has-more/);
});

test('la légende des salles reste visible pendant le défilement ; le panneau garde sa forme', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await open(page, '/salles');
  const panel = page.locator('.spanel');
  const height = (await panel.boundingBox())!.height;
  expect(Math.abs(await bottom(panel) - await bottom(page.locator('.rail')))).toBeLessThanOrEqual(1);
  await page.mouse.move(500, 600);
  await page.mouse.wheel(0, 1200);
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(200);
  await expect(page.locator('.iso-legend')).toBeInViewport({ ratio: 1 });
  await page.locator('.salle-row').nth(3).hover(); // nouveau rendu une fois la page défilée
  expect((await panel.boundingBox())!.height).toBe(height);
});

test('deux ambiances ; Orion et Minarm suivent la machine, ou la tonalité forcée par le soleil ou la lune', async ({ page }) => {
  await open(page, '/accueil');
  await page.getByRole('button', { name: 'Compte' }).click();
  const group = page.getByRole('radiogroup', { name: 'Ambiance' });
  const html = page.locator('html');
  await expect(group.getByRole('radio')).toHaveText(['Orion', 'Minarm']);
  await expect(page.getByRole('radiogroup', { name: 'Verre' }).getByRole('radio')).toHaveText(['Liquide', 'Opaque']);
  // Orion (défaut) : clair ou sombre selon la machine, en direct
  await expect(html).toHaveAttribute('data-ambiance', 'orion');
  await expect(page.locator('.rail-brand .brand--orion')).toHaveCount(1);
  await page.emulateMedia({ colorScheme: 'dark' });
  await expect(html).toHaveAttribute('data-tone', 'dark');
  await page.emulateMedia({ colorScheme: 'light' });
  await expect(html).toHaveAttribute('data-tone', 'light');
  // Minarm : couleurs du DSFR et Marianne
  await page.emulateMedia({ colorScheme: 'dark' });
  await group.getByRole('radio', { name: 'Minarm' }).click();
  await expect(html).toHaveAttribute('data-ambiance', 'minarm');
  await expect(html).toHaveAttribute('data-tone', 'dark');
  await expect(page.locator('.rail-brand .brand--minarm')).toHaveCount(1);
  await page.emulateMedia({ colorScheme: 'light' });
  await expect(html).toHaveAttribute('data-tone', 'light');
  await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(246, 246, 246)'); // background-alt-grey du DSFR
  await group.getByRole('radio', { name: 'Orion' }).click();
  await expect(html).toHaveAttribute('data-ambiance', 'orion');
  // Soleil ou lune : force l'autre tonalité ; revenir à celle de la machine la suit de nouveau
  await expect(page.getByText(/Chrome ou Edge/)).toHaveCount(0);
  await page.getByRole('button', { name: 'Passer en sombre' }).click();
  await expect(html).toHaveAttribute('data-tone', 'dark');
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.getByRole('button', { name: 'Passer en clair' }).click();
  await expect(html).toHaveAttribute('data-tone', 'light');
  await page.getByRole('button', { name: 'Passer en sombre' }).click();
  await page.emulateMedia({ colorScheme: 'light' });
  await expect(html).toHaveAttribute('data-tone', 'light');
});

test('les tableaux de bord présentent des diagrammes ; indicateurs et diagrammes sans icône', async ({ page, request }, testInfo) => {
  await open(page, '/accueil/parc');
  const widget = (type: string) => page.locator(`.widget[data-type="${type}"]`);
  await expect(widget('chart.parcBatiments').locator('.col')).toHaveCount(4);
  await expect(widget('chart.parcBatiments').locator('.col-value').first()).toContainText('%');
  // Grandeurs sans palette décorative : une seule couleur, l'accent
  expect(await widget('chart.parcBatiments').locator('.col-bar').evaluateAll((n) => [...new Set(n.map((e) => e.style.getPropertyValue('--c')))])).toEqual(['var(--accent)']);
  await expect(widget('chart.garanties').locator('.segbar-part').first()).toBeVisible();
  await expect(widget('chart.garanties').locator('.seglegend li')).toHaveCount(5);
  await expect(widget('chart.disponibilite').locator('.gauge-text b')).toContainText('%');
  await expect(widget('chart.receptions').locator('.combo-col')).toHaveCount(12);
  await expect(widget('chart.echeances').locator('.vbar')).toHaveCount(12);
  await expect(widget('chart.hsBatiments').locator('.bullet-mark').first()).toBeAttached();
  await expect(page.locator('.widget--kpi .tile, .widget .w-head .tile')).toHaveCount(0);
  // Aucune pastille : un indicateur hors service non nul teinte le fond de sa carte
  await expect(page.locator('.widget .led')).toHaveCount(0);
  const hs = (await state(request)).materiels.filter((m) => m.hs && m.ecoleId === 'e-num').length;
  await expect(widget('kpi.hs').locator('.kpi--hs')).toHaveCount(hs > 0 ? 1 : 0);
  await expect(widget('chart.matriceHs').locator('.heatmx-row--total .heatmx-total').last()).toHaveText(String(hs));
  await open(page, '/accueil/remontees');
  await expect(widget('chart.problemes').locator('.radial-part').first()).toBeVisible();
  await expect(widget('chart.semaines').locator('.multiples li').first()).toBeVisible();
  await expect(widget('chart.calendrier').locator('.heatcal .heat-cell')).toHaveCount(12 * 7);
  await expect(widget('chart.solde').locator('.vbar')).toHaveCount(12);
  await expect(widget('kpi.delai').locator('.kpi-value')).toBeVisible();
  // Remontées à traiter : les plus anciennes d'abord
  const ages = (await widget('list.aTraiter').locator('.age b').allTextContents()).map((t) => (t === 'Auj.' ? 0 : parseInt(t, 10)));
  expect(ages.length).toBeGreaterThan(0);
  expect(ages).toEqual([...ages].sort((a, b) => b - a));
  // La galerie propose les diagrammes
  await page.getByRole('button', { name: 'Personnaliser' }).click();
  await page.getByRole('button', { name: 'Ajouter un widget', exact: true }).click();
  const gallery = page.getByRole('dialog', { name: 'Ajouter un widget' });
  await gallery.getByRole('tab', { name: 'Graphiques' }).click();
  for (const [i, title] of ['Postes allumés par bâtiment', 'Remontées par jour', 'Hors service par type et par bâtiment', 'Solde hebdomadaire des remontées'].entries()) {
    await expect(gallery.locator('.gal-meta b', { hasText: title })).toHaveCount(1);
    const preview = gallery.locator('.gal-item').filter({ has: page.locator('.gal-meta b', { hasText: title }) });
    await preview.screenshot({ path: testInfo.outputPath(`galerie-graphe-${i}.png`), animations: 'disabled' });
  }
});

test('un bâtiment se renomme depuis l’administration, avec ses salles', async ({ page, request }) => {
  await open(page, '/administration/batiments');
  const rename = async (from: string, to: string) => {
    await page.locator('tr', { hasText: `Bâtiment ${from}` }).getByRole('button', { name: 'Renommer' }).click();
    const dialog = page.getByRole('dialog', { name: `Renommer le bâtiment ${from}` });
    await dialog.getByLabel('Nom du bâtiment *').fill(to);
    await dialog.getByLabel('Nom du bâtiment *').press('Enter');
    return dialog;
  };
  const refused = await rename('D', 'a');
  await expect(refused.getByRole('alert')).toContainText('existe déjà');
  await refused.getByRole('button', { name: 'Annuler' }).click();
  await expect(await rename('D', 'e')).toHaveCount(0);
  await expect(page.locator('tr', { hasText: 'Bâtiment E' })).toHaveCount(1);
  await expect.poll(async () => (await state(request)).salles.some((s) => s.batiment === 'E')).toBe(true);
  expect((await state(request)).salles.some((s) => s.batiment === 'D')).toBe(false);
  // Retour au nom initial : les autres tests gardent leur jeu de données
  await expect(await rename('E', 'D')).toHaveCount(0);
  await expect(page.locator('tr', { hasText: 'Bâtiment D' })).toHaveCount(1);
});

test('un bâtiment se renomme depuis sa vue, qui suit le nouveau nom', async ({ page }) => {
  const rename = async (from: string, to: string) => {
    await page.getByRole('button', { name: 'Renommer le bâtiment' }).click();
    const dialog = page.getByRole('dialog', { name: `Renommer le bâtiment ${from}` });
    await dialog.getByLabel('Nom du bâtiment *').fill(to);
    await dialog.getByLabel('Nom du bâtiment *').press('Enter');
    await expect(dialog).toHaveCount(0);
    await expect(page).toHaveURL(new RegExp(`/salles/batiment/${to}$`));
    await expect(page.locator('.insp-title h2')).toHaveText(`Bâtiment ${to}`);
  };
  await open(page, '/salles/batiment/D');
  await rename('D', 'E');
  await rename('E', 'D'); // retour au nom initial pour les autres tests
});

test('une salle s’équipe de postes et de matériels secondaires pris dans le stock', async ({ page, request }) => {
  const before = await state(request);
  const salle = before.salles.find((s) => s.nom === 'B004')!;
  const stock = before.materiels.filter((m) => m.ecoleId === salle.ecoleId && !m.salleId && !m.hs);
  const count = (pred: (m: Materiel) => boolean) => stock.filter(pred).length;
  // Postes complets avec deux écrans (unité centrale, deux écrans, clavier, souris), plus un câble réseau
  const postes = Math.min(2, count((m) => m.type === 'uc'), Math.floor(count((m) => m.type === 'ecran') / 2), count((m) => m.modele === 'Clavier USB'), count((m) => m.modele === 'Souris filaire'));
  const cables = Math.min(1, count((m) => m.modele === 'Câble Ethernet 5 m'));
  const expected = postes * 5 + cables;
  expect(expected).toBeGreaterThan(0);

  await open(page, `/salles/salle/${salle.id}`);
  await page.getByRole('button', { name: 'Équiper la salle', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: `Équiper ${salle.nom}` });
  await dialog.getByRole('spinbutton', { name: 'Nombre de postes' }).fill(String(postes));
  await dialog.getByRole('radio', { name: '2 écrans' }).click();
  if (cables) await dialog.getByRole('button', { name: 'Un de plus : Câble Ethernet 5 m' }).click();
  await expect(dialog.locator('.sheet-hint')).toHaveText(`${expected} matériel${expected > 1 ? 's' : ''} du stock`);
  await dialog.getByRole('button', { name: `Affecter à ${salle.nom}` }).click();
  await expect(dialog).toHaveCount(0);

  const inRoom = (data: WorkspaceView) => data.materiels.filter((m) => m.salleId === salle.id).length;
  await expect.poll(async () => inRoom(await state(request))).toBe(inRoom(before) + expected);
  const after = await state(request);
  const moved = after.materiels.filter((m) => m.salleId === salle.id && !before.materiels.find((b) => b.id === m.id)!.salleId);
  expect(moved).toHaveLength(expected);
  expect(moved.every((m) => !m.hs)).toBe(true);
  expect(moved.filter((m) => m.type === 'ecran')).toHaveLength(postes * 2);
  expect(moved.every((m) => m.deplacement?.de === null)).toBe(true); // à déplacer depuis le stock
});

test('installation : un point orange passe au vert, la salle est équipée une fois tout installé', async ({ page, request }) => {
  const data = await state(request);
  const atelier = data.salles.find((s) => s.nom === 'Atelier 2')!;
  const pending = data.materiels.filter((m) => m.salleId === atelier.id && m.deplacement?.de === null);
  expect(pending.length).toBeGreaterThan(1);
  await open(page, `/salles/salle/${atelier.id}`);
  const block = page.locator('.inst-block');
  await expect(block).toContainText('En cours d’installation');
  const progress = () => block.getByRole('progressbar').getAttribute('aria-valuenow').then(Number);
  const start = await progress();
  await block.click();
  await expect(page).toHaveURL(new RegExp(`/salles/deplacements\\?salle=${atelier.id}$`));
  await expect(page.locator('.group-lead')).toContainText(/\d+ matériels? à déplacer$/);
  const card = page.getByRole('region', { name: 'Stock vers Atelier 2' });
  await expect(card.locator('button.inst-dot')).toHaveCount(pending.length);
  await card.locator('button.inst-dot').first().click(); // en cours → installé, enregistré par le serveur
  await expect(card.locator('button.inst-dot')).toHaveCount(pending.length - 1);
  await expect.poll(async () => (await state(request)).materiels.filter((m) => m.salleId === atelier.id && m.installation && !m.deplacement && m.installation.at > Date.now() - 60_000).length).toBe(1);
  await open(page, `/salles/salle/${atelier.id}`);
  expect(await progress()).toBeGreaterThan(start);
  await page.locator('.inst-block').click();
  const dots = page.getByRole('region', { name: 'Stock vers Atelier 2' }).locator('button.inst-dot');
  await expect(dots.first()).toBeVisible();
  await expect(page.getByRole('button', { name: /Tout est/ })).toHaveCount(0); // un matériel à la fois
  for (let left = await dots.count(); left > 0; left--) {
    await dots.first().click();
    await expect(dots).toHaveCount(left - 1);
  }
  await expect.poll(async () => (await state(request)).materiels.filter((m) => m.salleId === atelier.id && m.deplacement).length).toBe(0);
  await open(page, `/salles/salle/${atelier.id}`);
  await expect(page.locator('.inst-block')).toHaveCount(0);
  await expect(page.locator('.insp-title')).toContainText('Équipée');
});

test('Échap ferme la fenêtre munie d’une croix ouverte en dernier', async ({ page }) => {
  await open(page, '/salles/salle/s-e-num-a012');
  await page.locator('.dev').first().click();
  await expect(page.locator('.dev-card .dev-card-head')).toBeVisible();
  await page.keyboard.press('Escape'); // fiche du matériel
  await expect(page.locator('.dev-card')).toHaveCount(0);
  await expect(page).toHaveURL(/\/salles\/salle\/s-e-num-a012/);
  await page.keyboard.press('Escape'); // fiche de la salle : retour à son bâtiment, comme la croix
  await expect(page).toHaveURL(/\/salles\/batiment\/A$/);
  await open(page, '/remontees/toutes');
  await page.locator('.rm-row').first().click();
  await expect(page.locator('.rm-detail .insp-title h2')).toHaveText(/^REM-/);
  await page.keyboard.press('Escape'); // détail de la remontée
  await expect(page).toHaveURL(/\/remontees\/toutes$/);
});

test('les postes de l’administration sont paginés, sans les demandes d’intervention', async ({ page, request }) => {
  await open(page, '/administration/postes');
  const total = (await state(request)).postes.length;
  const pages = Math.ceil(total / 25);
  await expect(page.locator('.inv-table tbody tr')).toHaveCount(Math.min(25, total));
  await expect(page.getByRole('heading', { name: 'Demandes d’intervention' })).toHaveCount(0);
  if (pages > 1) {
    await page.locator('.pagination').getByRole('button', { name: 'Suivant' }).click();
    await expect(page.locator('.pagination')).toContainText(`Page 2 sur ${pages}`);
  }
});

test('une application s’installe sur une salle entière, des postes se réinitialisent ; un seul suivi, une ligne par demande', async ({ page, request }) => {
  const data = await state(request);
  const salle = data.salles.find((s) => s.id === 's-e-num-a012')!;
  const postes = data.postes.filter((p) => p.salleId === salle.id).sort((a, b) => a.nomReseau.localeCompare(b.nomReseau));
  await open(page, '/administration/applications');
  await expect(page.getByRole('heading', { name: 'Demandes d’intervention' })).toHaveCount(0); // le suivi n'est plus ici
  const card = page.locator('.ops-card', { hasText: 'PuTTY' });
  await expect(card.getByRole('button', { name: 'Désinstaller' })).toHaveClass(/btn--danger-ghost/);
  await card.getByRole('button', { name: 'Installer', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Installer PuTTY' });
  await expect(dialog.getByRole('radio', { name: 'Salle entière' })).toHaveAttribute('aria-checked', 'true');
  await expect(dialog.getByRole('combobox', { name: 'Salle', exact: true })).toContainText('Choisir une salle'); // aucune salle filtrée : à choisir
  await dialog.getByRole('button', { name: 'Installer', exact: true }).click();
  await expect(dialog.getByRole('combobox', { name: 'Salle', exact: true })).toHaveAttribute('aria-expanded', 'true');
  await pick(page, dialog.getByRole('combobox', { name: 'Salle', exact: true }), new RegExp(`^${salle.nom} ·`));
  await expect(dialog.locator('.ops-summary')).toContainText(`${postes.length} postes visés, toute la salle`);
  await dialog.getByRole('button', { name: 'Installer', exact: true }).click();
  await expect(dialog).toHaveCount(0);
  // La salle tient sur une ligne ; le détail suit chacun de ses postes
  await open(page, '/administration/interventions');
  const row = page.locator('.rm-row', { hasText: 'Installation de PuTTY' });
  await expect(row).toHaveCount(1);
  await expect(row).toContainText(salle.nom);
  await row.click();
  await expect(page).toHaveURL(/\/administration\/interventions\/[^/]+$/);
  const detail = page.locator('.rm-detail');
  await expect(detail.locator('.rows .row')).toHaveCount(postes.length);
  await expect(detail.locator('.rows .pill').first()).toHaveText(/En cours d’installation|En attente d’installation|Installé|Échec/);
  // Simulation : une installation attend un poste dont l'unité centrale est hors service ; une désinstallation et une
  // réinitialisation attendent une salle fermée ; une installation est commencée sur B104
  await expect(page.locator('.rm-row', { hasText: 'Installation de Postman' })).toContainText('En attente d’installation');
  await expect(page.locator('.rm-row', { hasText: 'Désinstallation de LibreOffice' })).toContainText('En attente de désinstallation');
  await expect(page.locator('.rm-row', { hasText: 'Réinitialisation de Windows' }).filter({ hasText: 'A105' })).toContainText('En attente de réinitialisation');
  await expect(page.locator('.rm-row', { hasText: 'Installation d’IntelliJ IDEA' })).toContainText('B104');
  // Postes : emplacement, matériel et état ; le total en bas à gauche, sans bandeau au-dessus du tableau
  await open(page, '/administration/postes');
  await expect(page.locator('.inv-table input[type="checkbox"]')).toHaveCount(0);
  await expect(page.locator('.inv-selection')).toHaveCount(0);
  await expect(page.locator('.pagination-total')).toHaveText(/^\d+ postes$/);
  await expect(page.locator('.inv-table thead th')).toHaveText(['Poste', 'Emplacement', 'Matériel', 'État', 'Applications', 'Actions']);
  await expect(page.locator('.inv-table tbody tr').first().locator('td').nth(1)).toHaveText(/^[A-Z] – (RDC|\d+e?r?|SS\d) – .+$/);
  // Réinitialisation : la salle filtrée est proposée ; plusieurs postes choisis
  await pick(page, page.getByRole('combobox', { name: 'Filtrer par salle' }), salle.nom);
  await page.getByRole('button', { name: 'Réinitialiser', exact: true }).click();
  const reinstall = page.getByRole('dialog', { name: 'Réinitialiser Windows' });
  await expect(reinstall.getByRole('combobox', { name: 'Salle', exact: true })).toContainText(salle.nom);
  await reinstall.getByRole('radio', { name: 'Postes' }).click();
  for (const p of postes.slice(0, 2)) await reinstall.getByRole('button', { name: p.nomReseau, exact: true }).click();
  await expect(reinstall.locator('.ops-summary')).toContainText('2 postes visés');
  await reinstall.getByRole('button', { name: 'Réinitialiser', exact: true }).click();
  await expect(reinstall).toHaveCount(0);
  await open(page, '/administration/interventions');
  await expect(page.locator('.rm-row', { hasText: 'Réinitialisation de Windows' }).filter({ hasText: '2 postes choisis' })).toHaveCount(1);
});

test('le menu principal n’a pas de bulle ; les règles de processus portent le logo de leur application', async ({ page }) => {
  await open(page, '/supervision/listes');
  await expect(page.locator('.rail-lens')).toHaveCount(0);
  await expect(page.locator('.rail-item.is-active')).toHaveAttribute('data-nav', 'supervision');
  for (const nom of ['firefox.exe', 'Code.exe', 'steam.exe']) {
    await expect(page.locator('.ops-table tr', { hasText: nom }).locator('img.app-icon')).toHaveCount(1);
  }
});

test('supervision : Alertes par défaut ; la recherche ignore casse et espaces, reconnaît l’application et filtre les processus', async ({ page }) => {
  await open(page, '/supervision/inconnu');
  await expect(page.locator('#view h1')).toHaveText('Alertes & détections');
  await open(page, '/supervision/listes');
  const search = page.getByRole('searchbox', { name: 'Rechercher', exact: true });
  await search.fill('  LibreOffice ');
  await expect(page.locator('.ops-table tbody tr')).toHaveText([/soffice\.exe/, /soffice\.bin/]);
  await search.fill('liste noire STEAM');
  await expect(page.locator('.ops-table tbody tr')).toHaveText([/steam\.exe/]);
  await search.fill('processus-absent');
  await expect(page.locator('.ops-table tbody tr')).toHaveText([/Aucune règle/]);
  // Un poste trouvé par un processus ne montre que les processus correspondants
  await open(page, '/supervision/salles?salle=s-e-num-a101');
  await search.fill('FIREFOX');
  const names = page.locator('.ops-process strong');
  await expect(names.first()).toBeVisible();
  expect(new Set(await names.allTextContents())).toEqual(new Set(['firefox.exe']));
  // Alertes : l'adresse IP remontée par le poste (API des postes) figure à côté du poste ; A105 est une salle fermée,
  // dont l'émulateur n'envoie aucun rapport
  const rapport = await page.request.post('/api/agent/rapports', {
    headers: { Authorization: 'Bearer orion-agent-local' },
    data: { rapports: [{ poste: 'A105-PC01', adresseIp: '10.1.9.21', session: 'camille.durand', processus: [{ nom: 'steam.exe', compte: 'camille.durand' }] }] },
  });
  expect(rapport.ok()).toBeTruthy();
  await open(page, '/supervision/alertes');
  await search.fill('A105-PC01');
  await expect(page.locator('.ops-table thead th').nth(2)).toHaveText('Adresse IP');
  await expect(page.locator('.ops-table tbody tr').first().locator('td').nth(2)).toHaveText('10.1.9.21');
});

test('le gestionnaire suit son travail dans le backlog : en attente, en cours, terminées ; il déclare et remet le matériel', async ({ page, request }) => {
  const comptes = (await state(request)).comptes.filter((c) => c.actif);
  const admin = comptes.find((c) => c.role === 'admin')!;
  const manager = comptes.find((c) => c.role === 'gestionnaire')!;
  const report = (await state(request)).remontees.find((r) => r.statut === 'attente')!;
  const col = (phase: string) => page.locator(`.bl-col--${phase}`);
  try {
    await asAccount(request, manager.id);
    await page.goto('/remontees');
    await expect(page).toHaveURL(/\/remontees\/backlog$/);
    await expect(page.locator('.subnav .seg-btn')).toHaveText([/Remontées/, /Installations/, /Toutes/]);
    await expect(page.locator('.bl-col .bl-head b')).toHaveText(['En attente', 'En cours', 'Terminées']);
    await expect(col('attente').locator('.bl-title').first()).toHaveText(/^(Ne s’allume pas|Pas d’image|Connexion|Casse|Fonctionnement anormal|Autre)$/); // la remontée, pas ses matériels
    await col('attente').locator('.bl-card', { hasText: report.id }).click();
    await page.getByRole('button', { name: 'Prendre en charge' }).click();
    await expect(col('encours').locator('.bl-card', { hasText: report.id })).toHaveCount(1);
    await expect(page.getByRole('button', { name: 'Corrigé', exact: true })).toBeVisible(); // remplacée ou corrigée
    // L'état des lieux suit la remontée de la transmission à la clôture
    await page.getByRole('button', { name: 'État des lieux', exact: true }).click();
    const suivi = page.getByRole('dialog', { name: `État des lieux ${report.id}` }).getByRole('table', { name: 'Suivi de la remontée' });
    await expect(suivi.locator('tbody tr')).toHaveText([/^Transmise, en attente/, new RegExp(`^En cours.*${manager.nom}$`), /^Remplacé ou corrigéÀ venir/]);
    await page.keyboard.press('Escape');
    // Remontée en cours : le matériel se déclare hors service, puis repart au stock (un déplacement à confirmer)
    const mat = (await state(request)).materiels.find((m) => m.id === report.materielIds[0])!;
    const enService = page.getByRole('switch', { name: `${mat.modele} ${mat.idOrion} en service` });
    if (await enService.getAttribute('aria-checked') === 'true') await enService.click();
    await expect(enService).toHaveAttribute('aria-checked', 'false');
    if (mat.salleId && !mat.deplacement) {
      const remise = page.getByRole('form', { name: `Remise de ${mat.idOrion}` });
      await remise.getByLabel('Relocaliser dans le stock').check();
      await remise.getByRole('button', { name: 'Lancer le déplacement' }).click();
      await expect.poll(async () => (await state(request)).materiels.find((m) => m.id === mat.id)?.deplacement?.de).toBe(mat.salleId);
    }
    await page.getByRole('button', { name: 'Remplacé', exact: true }).click();
    await expect(col('terminee').locator('.bl-card', { hasText: report.id })).toHaveCount(1);
    await expect(page.getByRole('button', { name: /Valider/ })).toHaveCount(0); // la validation par l'auteur n'existe plus
  } finally {
    await asAccount(request, admin.id);
  }
});

test('l’import JSON n’ajoute que les nouveaux matériels et, une fois validés, les transferts d’une autre école', async ({ page, request }) => {
  try {
    await asAccount(request, 'cpt-superadmin'); // toutes les écoles, pour choisir les matériels du fichier
    const all = await state(request);
    const cited = new Set(all.remontees.filter((r) => ['attente', 'encours'].includes(r.statut)).flatMap((r) => r.materielIds));
    const ici = all.materiels.find((m) => m.ecoleId === 'e-num' && m.serie)!;
    const ailleurs = all.materiels.find((m) => m.ecoleId === 'e-res' && m.serie && !cited.has(m.id))!;
    await asAccount(request, 'cpt-num-admin');
    await open(page, '/materiels/import');
    await page.getByText('Ou coller le JSON').click(); // champ facultatif, replié
    await page.getByLabel('JSON', { exact: true }).fill(JSON.stringify([
      { modele: 'Clavier aperçu', type: 'peripherique', dateReception: '2026-11-08', serie: 'APERCU-0001' },
      { modele: 'Écran aperçu', type: 'ecran', dateReception: '2026-11-08', serie: ici.serie },
      { modele: 'Écran échangé', type: 'ecran', dateReception: '2026-11-08', serie: ailleurs.serie },
      { modele: 'Clavier aperçu', type: 'peripherique', dateReception: '2026-11-08', serie: 'apercu-0001' },
    ]));
    const preview = page.getByRole('region', { name: 'Aperçu de l’import' });
    await expect(preview.locator('.inv-tally .is-ok')).toContainText(/1\s*nouveau matériel, prêt à être ajouté/);
    await expect(preview.locator('.inv-tally')).toContainText(/1\s*déjà présent dans le parc, non traité/);
    await expect(preview.getByRole('alert').first()).toContainText('autre école');
    await expect(preview.getByRole('alert').nth(1)).toContainText('déjà présent');
    await expect(preview.locator('tbody tr').first()).toContainText(`École des réseaux · ${ailleurs.idOrion}`); // à décider : en premier
    await expect(preview.locator('tbody tr', { hasText: `Déjà présent · ${ici.idOrion}` })).toContainText('Non traité');
    await expect(preview.locator('tbody tr', { hasText: /APERCU-0001/ })).toContainText('Prêt à être ajouté');
    await expect(page.getByRole('button', { name: 'Importer 1 matériel' })).toBeEnabled();
    await preview.getByRole('switch', { name: `Transférer ${ailleurs.idOrion} depuis École des réseaux` }).click();
    await page.getByRole('button', { name: 'Importer 2 matériels' }).click();
    await expect(page.getByRole('button', { name: 'Import terminé' })).toBeVisible(); // coche, puis bouton initial
    await expect(page.locator('.inv-import').getByRole('status')).toContainText('1 matériel ajouté, 1 transféré, 2 non traités');
    await expect(preview).toHaveCount(0);
    const resultat = page.getByRole('region', { name: 'Résultat de l’import' }); // la liste reste, avec le résultat
    await expect(resultat.locator('tbody tr', { hasText: /APERCU-0001/ })).toContainText('Ajouté');
    await expect(resultat.locator('tbody tr', { hasText: ailleurs.idOrion })).toContainText('Transféré');
    await expect(page.getByRole('button', { name: 'Importer les matériels' })).toBeDisabled();
    await expect(page.locator('.inv-drop input[type="file"]')).toHaveValue('');
    const after = await state(request);
    expect(after.materiels.filter((m) => m.modele === 'Clavier aperçu')).toHaveLength(1);
    expect(after.materiels.find((m) => m.id === ailleurs.id)).toMatchObject({ ecoleId: 'e-num', idOrion: ailleurs.idOrion, salleId: null });
  } finally {
    await asAccount(request, 'cpt-num-admin');
  }
});

test('le gestionnaire suit l’installation des salles dans un second backlog ; les déplacements vont d’un lieu à un autre', async ({ page, request }) => {
  const comptes = (await state(request)).comptes.filter((c) => c.actif);
  const admin = comptes.find((c) => c.role === 'admin')!;
  const manager = comptes.find((c) => c.role === 'gestionnaire')!;
  try {
    await asAccount(request, manager.id);
    await open(page, '/remontees/installations');
    await expect(page.locator('.bl-col')).toHaveCount(3);
    await expect(page.locator('.bl-col .bl-head b')).toHaveText(['En attente', 'En cours', 'Terminées']); // mêmes colonnes que les remontées
    await expect(page.locator('.bl-col--terminee .bl-card', { hasText: 'B203' }).getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100');
    await page.locator('.bl-col--attente .bl-card', { hasText: 'C202' }).click();
    await expect(page).toHaveURL(/\/salles\/deplacements\?salle=/);
    await expect(page.getByRole('region', { name: 'C201 vers C202' })).toContainText('2 matériels à installer');
    await open(page, '/salles/deplacements');
    await expect(page.getByRole('region', { name: 'Atelier 1 vers Stock' })).toContainText(/\d+ matériels? à rapatrier/);
  } finally {
    await asAccount(request, admin.id);
  }
});

test('les notifications sont regroupées par nature ; l’espace Notifications les détaille toutes', async ({ page, request }) => {
  const comptes = (await state(request)).comptes.filter((c) => c.actif);
  const admin = comptes.find((c) => c.role === 'admin')!;
  const manager = comptes.find((c) => c.role === 'gestionnaire')!;
  try {
    await asAccount(request, manager.id);
    await open(page, '/accueil');
    await page.getByRole('button', { name: 'Notifications', exact: true }).click();
    const pop = page.locator('.popover--list');
    await expect(pop.locator('.pop-row', { hasText: /sous garantie échue/ })).toHaveCount(1);
    await expect(pop.locator('.pop-row', { hasText: /à échéance/ })).toHaveCount(1);
    const groups = await pop.locator('.pop-row').count();
    await expect(page.locator('.topbar-actions .badge')).toHaveText(String(groups)); // un sujet par groupe
    await pop.getByRole('link', { name: 'Voir toutes les notifications' }).click();
    await expect(page).toHaveURL(/\/notifications$/);
    await expect(page.locator('.group-card')).toHaveCount(groups);
    await page.locator('.group-card', { hasText: /sous garantie échue/ }).getByRole('link', { name: 'Ouvrir' }).click();
    await expect(page).toHaveURL(/\/materiels\/inventaire\?garantie=/);
    await expect(page.getByRole('combobox', { name: 'Garantie' })).toContainText('Échue');
  } finally {
    await asAccount(request, admin.id);
  }
});

// Le choix recharge la page : on attend le nouveau document plutôt que la fermeture du menu
test('en mode interface seule, le menu du compte change d’utilisateur', async ({ page, request }) => {
  const comptes = (await state(request)).comptes.filter((c) => c.actif);
  const admin = comptes.find((c) => c.role === 'admin')!;
  const formateur = comptes.find((c) => c.role === 'formateur')!;
  const switchTo = async (compte: Compte) => {
    await page.getByRole('button', { name: 'Compte' }).click();
    await page.getByRole('combobox', { name: /Changer d’utilisateur/ }).click();
    const reload = page.waitForEvent('load');
    await page.getByRole('listbox').getByRole('option', { name: `${compte.nom} · ${roleOf(compte.role).label}`, exact: true }).click();
    await reload;
    await expect(page).toHaveURL(/\/accueil$/);
    await expect(page.locator('#view h1')).toBeAttached();
  };
  try {
    await open(page, '/accueil');
    await switchTo(formateur);
    await expect(page.locator('.rail-item[data-nav="administration"]')).toHaveCount(0);
    await switchTo(admin);
    await expect(page.locator('.rail-item[data-nav="administration"]')).toHaveCount(1);
  } finally {
    await asAccount(request, admin.id);
  }
  // Chaque changement d'utilisateur est une connexion : sa date, fixée par le serveur, figure dans Administration › Comptes
  const connecte = (await state(request)).comptes.find((c) => c.id === formateur.id)!;
  expect(connecte.derniereConnexion).toBeGreaterThan(Date.now() - 5 * 60_000);
  await open(page, '/administration/comptes');
  await expect(page.locator('.ops-table thead')).toContainText('Dernière connexion');
  await expect(page.locator('.ops-table tbody tr', { hasText: formateur.email })).toContainText(dateTime(connecte.derniereConnexion!));
});

test('la fiche d’un matériel hors service dans la vue Salles indique depuis quand', async ({ page, request }) => {
  const m = (await state(request)).materiels.find((x) => x.hs && x.salleId && x.dateHs)!;
  await open(page, `/salles/salle/${m.salleId}`);
  await page.locator(`.dev[aria-label*="${m.idOrion}"]`).click();
  await expect(page.locator('.dev-card .dev-facts')).toContainText(`Hors service depuis le ${dateNum(m.dateHs!)}`);
});


test('la palette Orion conserve la couleur du compte et Minarm garde les couleurs du DSFR', async ({ page }, testInfo) => {
  await open(page, '/materiels/inventaire');
  await page.evaluate(() => window.orion.store.update('prefs', (s) => { s.prefs.tone = 'auto'; }));
  const saves: object[] = [];
  page.on('request', (request) => {
    if (request.method() === 'PUT' && request.url().endsWith('/api/workspace')) saves.push(request.postDataJSON().state);
  });
  await page.getByRole('button', { name: 'Compte', exact: true }).click();
  const trigger = page.getByRole('button', { name: 'Choisir la couleur' });
  await expect(trigger.locator('svg')).toHaveCount(0);
  await expect.poll(() => page.locator('.popover').evaluate((el) => el.getAnimations().length)).toBe(0);
  const dot = (await trigger.boundingBox())!;
  const account = (await page.locator('.account').boundingBox())!;
  expect(dot.x - account.x).toBeLessThanOrEqual(4);
  const menuBefore = await page.locator('.popover').evaluate((el: HTMLElement) => ({ height: el.offsetHeight, width: el.offsetWidth }));
  await trigger.click();
  const palette = page.getByRole('radiogroup', { name: 'Couleur' });
  await expect(palette.getByRole('radio')).toHaveCount(8);
  const menuAfter = await page.locator('.popover').evaluate((el: HTMLElement) => ({ height: el.offsetHeight, width: el.offsetWidth }));
  expect(Math.abs(menuAfter.height - menuBefore.height)).toBeLessThan(1);
  expect(Math.abs(menuAfter.width - menuBefore.width)).toBeLessThan(1);
  const openedDot = (await trigger.boundingBox())!;
  expect(Math.abs(openedDot.x - dot.x)).toBeLessThan(1);
  expect(Math.abs(openedDot.y - dot.y)).toBeLessThan(1);
  const openingDelays = await page.locator('.accent-option').evaluateAll((els) => els.map((el) => parseFloat(getComputedStyle(el).transitionDelay)));
  expect(openingDelays[0]).toBeLessThan(openingDelays.at(-1)!);
  await expect(page.locator('.accent-wheel')).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
  await palette.getByRole('radio', { name: 'Violet', exact: true }).click();
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  const closingDelays = await page.locator('.accent-option').evaluateAll((els) => els.map((el) => parseFloat(getComputedStyle(el).transitionDelay)));
  expect(closingDelays[0]).toBeGreaterThan(closingDelays.at(-1)!);
  await expect(palette).toBeHidden();
  await page.evaluate(() => window.orion.store.flush());
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-accent', 'violet');
  await page.getByRole('button', { name: 'Compte', exact: true }).click();
  await trigger.click();
  await expect(palette.getByRole('radio', { name: 'Violet', exact: true })).toBeChecked();
  await page.emulateMedia({ colorScheme: 'dark' });
  const violetHalo = await page.locator('body').evaluate((el) => getComputedStyle(el, '::before').backgroundImage);
  await palette.getByRole('radio', { name: 'Violet', exact: true }).focus();
  await page.keyboard.press('ArrowRight');
  await expect(trigger).toBeFocused();
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  await expect(palette).toBeHidden();
  await expect(page.locator('html')).toHaveAttribute('data-accent', 'pink');
  await trigger.click();
  const ambiance = page.getByRole('radiogroup', { name: 'Ambiance' });
  await expect.poll(() => page.locator('body').evaluate((el) => getComputedStyle(el, '::before').backgroundImage)).not.toBe(violetHalo);
  const orion = (await ambiance.getByRole('radio', { name: 'Orion', exact: true }).boundingBox())!;
  const minarm = (await ambiance.getByRole('radio', { name: 'Minarm', exact: true }).boundingBox())!;
  expect(Math.abs(orion.y - minarm.y)).toBeLessThan(1);
  expect(minarm.x - orion.x - orion.width).toBeLessThanOrEqual(16);
  for (const theme of ['Orion', 'Minarm']) {
    await ambiance.getByRole('radio', { name: theme, exact: true }).click();
    for (const colorScheme of ['light', 'dark'] as const) {
      await page.emulateMedia({ colorScheme });
      await expect(page.locator('html')).toHaveAttribute('data-tone', colorScheme);
      await expect(page.locator('html')).toHaveAttribute('data-accent', 'pink');
      await expect(ambiance).toHaveAttribute('data-tone', colorScheme);
      if (theme === 'Orion' && colorScheme === 'dark') {
        await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(7, 10, 16)');
      }
      await expect(page.locator('.btn--primary').first()).toHaveCSS('background-image', 'none');
      if (theme === 'Orion') await expect(trigger).toBeVisible();
      else { await expect(trigger).toHaveCount(0); await expect(palette).toHaveCount(0); }
      const expectedAccent = theme === 'Orion' ? '#b4477c' : colorScheme === 'light' ? '#000091' : '#8585f6';
      await expect.poll(() => page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--accent').trim())).toBe(expectedAccent);
      await page.screenshot({ path: testInfo.outputPath(`apparence-${theme}-${colorScheme}.png`), fullPage: true, animations: 'disabled' });
      if (theme === 'Orion') {
        await page.evaluate(() => window.orion.store.flush());
        const dashboard = await page.context().newPage();
        await dashboard.emulateMedia({ colorScheme });
        await open(dashboard, '/accueil');
        await dashboard.screenshot({ path: testInfo.outputPath(`dashboard-${colorScheme}.png`), fullPage: true, animations: 'disabled' });
        await dashboard.close();
      }
    }
  }
  await ambiance.getByRole('radio', { name: 'Orion', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('data-accent', 'pink');
  await trigger.click();
  await page.setViewportSize({ width: 390, height: 600 });
  const pop = page.locator('.popover');
  await expect(palette).toBeVisible();
  await expect(async () => {
    for (const option of await palette.getByRole('radio').all()) {
      const chip = (await option.locator('span').boundingBox())!;
      expect(chip.x).toBeGreaterThanOrEqual(0);
      expect(chip.x + chip.width).toBeLessThanOrEqual(390);
    }
  }).toPass({ timeout: 3000 });
  const bounds = (await pop.boundingBox())!;
  expect(bounds.x).toBeGreaterThanOrEqual(0);
  expect(bounds.y).toBeGreaterThanOrEqual(0);
  expect(bounds.x + bounds.width).toBeLessThanOrEqual(390);
  expect(bounds.y + bounds.height).toBeLessThanOrEqual(600);
  await palette.getByRole('radio', { name: 'Bleu', exact: true }).click();
  await expect(trigger).toBeFocused();
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  await expect(palette).toBeHidden();
  await trigger.click();
  await page.keyboard.press('Escape');
  await expect(trigger).toBeFocused();
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  await expect(palette).toBeHidden();
  await expect(pop).toBeVisible();
  const foldedMobile = (await pop.boundingBox())!;
  await trigger.click();
  const expandedMobile = (await pop.boundingBox())!;
  expect(Math.abs(expandedMobile.height - foldedMobile.height)).toBeLessThan(1);
  await page.screenshot({ path: testInfo.outputPath('apparence-mobile.png'), fullPage: true, animations: 'disabled' });
  await ambiance.getByRole('radio', { name: 'Orion', exact: true }).click();
  await page.evaluate(() => window.orion.store.flush());
  expect(saves.length).toBeGreaterThan(0);
  for (const saved of saves) expect(Object.keys(saved).sort()).toEqual(['prefs', 'role']);
});


test('les listes longues intègrent leur recherche sans perdre la sélection ni la valeur du formulaire', async ({ page, request }, testInfo) => {
  await open(page, '/materiels/inventaire');
  const salle = (await state(request)).salles.find((s) => s.nom === 'C201')!;
  const location = page.getByRole('combobox', { name: 'Localisation', exact: true });
  const search = page.getByRole('searchbox', { name: 'Rechercher dans : Localisation', exact: true });
  await expect(search).toHaveCount(0); // Le filtre appartient au menu, pas à un champ distinct sur l'écran.
  await location.click();
  await search.fill('batiment c C201');
  await expect(page.getByRole('listbox', { name: 'Localisation' }).getByRole('option')).toHaveText(['C201']);
  await search.press('ArrowDown');
  await search.press('Enter');
  await expect(location).toContainText('C201');
  await expect(location).toHaveAttribute('aria-expanded', 'false');
  await location.click();
  await search.fill('introuvable');
  await expect(page.getByRole('listbox', { name: 'Localisation' }).getByRole('option')).toHaveCount(0);
  await expect(page.getByText('Aucun résultat', { exact: true })).toBeVisible();
  await search.press('Escape');
  await expect(location).toBeFocused();
  await expect(location).toContainText('C201');
  await page.getByRole('button', { name: 'Ajouter un matériel', exact: true }).first().click();
  const dialog = page.getByRole('dialog', { name: 'Ajouter un matériel', exact: true });
  const affectation = dialog.getByRole('combobox', { name: 'Affectation', exact: true });
  const filter = dialog.getByRole('searchbox', { name: 'Rechercher dans : Affectation', exact: true });
  await affectation.click();
  await filter.fill('c201');
  await filter.press('ArrowDown');
  await filter.press('Enter');
  await expect(affectation).toContainText('C201');
  await affectation.click();
  await filter.fill('aucune correspondance');
  expect(await dialog.locator('form').evaluate((form: HTMLFormElement) => new FormData(form).get('salle'))).toBe(salle.id);
  await filter.press('Escape');
  await expect(dialog).toBeVisible(); // Échap ferme le choix, pas la fenêtre de formulaire.
  await dialog.getByLabel('Modèle *', { exact: true }).fill('Matériel de vérification');
  await affectation.click();
  await filter.fill('c201');
  await filter.press('Enter');
  await expect(dialog).toBeVisible(); // Confirmer une option ne soumet pas le formulaire.
  await affectation.click();
  await filter.fill('c201');
  await page.screenshot({ path: testInfo.outputPath('liste-integree-desktop.png'), fullPage: true, animations: 'disabled' });
  await filter.press('Escape');
  await page.setViewportSize({ width: 390, height: 844 });
  await affectation.click();
  await filter.fill('c201');
  const panel = (await dialog.locator('.filter-select-popup:popover-open').boundingBox())!;
  expect(panel.x).toBeGreaterThanOrEqual(0);
  expect(panel.x + panel.width).toBeLessThanOrEqual(391);
  expect(panel.y).toBeGreaterThanOrEqual(0);
  expect(panel.y + panel.height).toBeLessThanOrEqual(845);
  await page.screenshot({ path: testInfo.outputPath('liste-integree-mobile.png'), fullPage: true, animations: 'disabled' });
});

test('les listes courtes partagent le menu de choix et se parcourent au clavier', async ({ page }, testInfo) => {
  await open(page, '/materiels/inventaire');
  const status = page.getByRole('combobox', { name: 'État', exact: true });
  await status.click();
  await expect(status).toHaveAttribute('aria-expanded', 'true');
  await status.click({ delay: 80 });
  await expect(status).toHaveAttribute('aria-expanded', 'false');
  await status.press('ArrowDown');
  await expect(page.getByRole('listbox', { name: 'État' }).getByRole('option')).toHaveText(['Tous les états', 'En service', 'Hors service']);
  await expect(page.getByRole('searchbox', { name: 'Rechercher dans : État', exact: true })).toHaveCount(0);
  await page.keyboard.press('End');
  await page.keyboard.press('Enter');
  await expect(status).toContainText('Hors service');
  await expect(status).toBeFocused();
  await status.press('ArrowDown');
  await page.keyboard.press('Home');
  await page.keyboard.press('Escape');
  await expect(status).toContainText('Hors service');
  await expect(status).toHaveAttribute('aria-expanded', 'false');
  await status.press('ArrowDown');
  await page.keyboard.press('Home');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await expect(status).toContainText('En service');
  for (const ambiance of ['orion', 'minarm']) for (const tone of ['light', 'dark']) {
    await page.evaluate(({ ambiance, tone }) => window.orion.store.update('prefs', (s) => { s.prefs.ambiance = ambiance; s.prefs.tone = tone; }), { ambiance, tone });
    await expect(page.locator('html')).toHaveAttribute('data-ambiance', ambiance);
    await expect(page.locator('html')).toHaveAttribute('data-tone', tone);
    await status.click();
    await expect(page.getByRole('listbox', { name: 'État' })).toBeVisible();
    await page.screenshot({ path: testInfo.outputPath(`choix-${ambiance}-${tone}.png`), fullPage: true, animations: 'disabled' });
    await page.keyboard.press('Escape');
  }
});

test('les menus de la barre haute se ferment par Échap, clic extérieur ou leur bouton', async ({ page }) => {
  await open(page, '/accueil');
  const account = page.getByRole('button', { name: 'Compte', exact: true });
  const alerts = page.getByRole('button', { name: 'Notifications', exact: true });
  const accountMenu = page.getByRole('dialog', { name: 'Compte' });
  const alertsMenu = page.getByRole('dialog', { name: 'Notifications' });
  await account.click();
  await expect(accountMenu).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(accountMenu).toHaveCount(0);
  await expect(account).toBeFocused();
  await account.click();
  await alerts.click();
  await expect(accountMenu).toHaveCount(0);
  await expect(alertsMenu).toBeVisible();
  const { width, height } = page.viewportSize()!;
  await page.mouse.click(width - 4, height - 4); // marge vide de la page
  await expect(alertsMenu).toHaveCount(0);
  await expect(page).toHaveURL(/\/accueil$/);
  await alerts.click();
  await expect(alertsMenu).toBeVisible();
  await alerts.click();
  await expect(alertsMenu).toHaveCount(0);
});

test('le menu du compte reste ancré pendant les changements d’apparence', async ({ page }, testInfo) => {
  for (const viewport of [{ width: 1280, height: 800 }, { width: 390, height: 600 }]) {
    await page.setViewportSize(viewport);
    await open(page, '/accueil');
    await page.evaluate(() => window.orion.store.update('prefs', (s) => { s.prefs.ambiance = 'orion'; s.prefs.tone = 'light'; }));
    await expect(page.locator('html')).toHaveAttribute('data-ambiance', 'orion');
    const account = page.getByRole('button', { name: 'Compte', exact: true });
    await account.click();
    const menu = page.locator('.popover');
    await expect.poll(() => menu.evaluate((node) => node.getAnimations().length)).toBe(0);
    const origin = (await menu.boundingBox())!;
    const anchor = (await account.boundingBox())!;
    expect(Math.abs(origin.y - anchor.y - anchor.height - 10)).toBeLessThan(1);
    const stable = async () => {
      await expect(async () => {
        const box = (await menu.boundingBox())!;
        expect(Math.abs(box.x - origin.x)).toBeLessThan(1);
        expect(Math.abs(box.y - origin.y)).toBeLessThan(1);
        expect(box.y + box.height).toBeLessThanOrEqual(viewport.height - 11);
      }).toPass({ timeout: 3000 });
    };
    const themes = page.getByRole('radiogroup', { name: 'Ambiance' });
    await themes.getByRole('radio', { name: 'Minarm', exact: true }).hover();
    await stable();
    for (const theme of ['Minarm', 'Orion']) {
      await themes.getByRole('radio', { name: theme, exact: true }).click();
      await expect(page.locator('html')).toHaveAttribute('data-ambiance', theme.toLowerCase());
      await page.evaluate(() => document.fonts.ready);
      await stable();
    }
    await page.getByRole('button', { name: 'Passer en sombre', exact: true }).click();
    await expect(page.locator('html')).toHaveAttribute('data-tone', 'dark');
    await stable();
    await page.getByRole('radiogroup', { name: 'Verre' }).getByRole('radio', { name: 'Opaque', exact: true }).click();
    await stable();
    await page.getByRole('button', { name: 'Choisir la couleur', exact: true }).click();
    await stable();
    await page.getByRole('radiogroup', { name: 'Couleur' }).getByRole('radio', { name: 'Violet', exact: true }).click();
    await expect(page.locator('html')).toHaveAttribute('data-accent', 'violet');
    await stable();
    await page.screenshot({ path: testInfo.outputPath(`menu-stable-${viewport.width}.png`), fullPage: true, animations: 'disabled' });
    await account.click();
    await expect(menu).toHaveCount(0);
  }
});

test('recensement : campagne, appairage par QR code, constats des téléphones à traiter puis ajout au parc', async ({ page, request }, testInfo) => {
  const { chiffrer, lireAppairage } = await import('#shared/recon.ts');
  await open(page, '/materiels/recensement');
  await page.getByRole('button', { name: 'Nouvelle campagne' }).click();
  await page.getByLabel('Nom *').fill('Recensement de test');
  await page.getByRole('radio', { name: 'Salles choisies' }).click();
  await page.locator('.rec-batiment').first().locator('legend input').check();
  await page.getByRole('button', { name: 'Ouvrir la campagne' }).click();
  await expect(page).toHaveURL(/\/materiels\/recensement\/rec-/);
  const id = page.url().split('/').at(-1)!;
  await expect(page.locator('.group-lead')).toContainText('Recensement de test');

  await page.getByRole('button', { name: 'Appairer un téléphone' }).click();
  await expect(page.getByRole('img', { name: /QR code d’appairage/ })).toBeVisible();
  await page.waitForTimeout(600); // fin de l'ouverture de la fenêtre, pour la capture
  await page.screenshot({ path: testInfo.outputPath('recensement-appairage.png') });
  const appairage = await (await request.get(`/api/workspace/recensements/${id}/appairage`)).json();
  const acces = lireAppairage(appairage.url)!;
  await page.getByRole('button', { name: 'Fermer' }).click();

  // Constats d'un téléphone, transmis par le connecteur : présence d'un matériel, code inconnu
  const data = await state(request);
  const campagne = data.recensements.find((r) => r.id === id)!;
  const salle = data.salles.find((s) => s.id === campagne.salleIds[0])!;
  const present = data.materiels.find((m) => m.salleId === salle.id && !m.deplacement)!;
  const evenements = [
    { id: crypto.randomUUID(), type: 'vu', code: present.idOrion, salleId: salle.id, materielId: present.id, observeLe: Date.now() },
    { id: crypto.randomUUID(), type: 'inconnu', code: 'SN-RECENSE-1', salleId: salle.id, materielId: null, observeLe: Date.now(), saisie: { type: 'ecran', modele: 'Écran recensé', marque: 'Iiyama', serie: 'SN-RECENSE-1' } },
    // Même code inconnu scanné par un second agent : une seule ligne à traiter
    { id: crypto.randomUUID(), type: 'inconnu', code: 'sn recense 1', salleId: salle.id, materielId: null, observeLe: Date.now(), saisie: { type: 'ecran', modele: 'Ecran', marque: null, serie: 'sn-recense-1' } },
    // Code inconnu dont le matériel est ensuite créé dans ORION par quelqu'un d'autre
    { id: crypto.randomUUID(), type: 'inconnu', code: 'SN-DEJA-CREE', salleId: salle.id, materielId: null, observeLe: Date.now(), saisie: { type: 'autre', modele: 'Câble', marque: null, serie: 'SN-DEJA-CREE' } },
  ];
  const blocs = await Promise.all(evenements.map(async (e) => ({ id: e.id, bloc: await chiffrer(acces.cle, id, e) })));
  const reponse = await request.post(`/api/recon/campagnes/${id}/evenements`, { headers: { Authorization: 'Bearer orion-recon-local' }, data: { evenements: blocs } });
  expect((await reponse.json()).resultats.map((r: { statut: string }) => r.statut)).toEqual(['applique', 'applique', 'applique', 'applique']);

  await page.reload();
  const aTraiter = page.locator('.group-card', { hasText: 'À traiter' });
  await expect(aTraiter.locator('.rec-row')).toHaveCount(2);
  await expect(aTraiter.locator('.rec-row', { hasText: 'Écran recensé' })).toContainText('Vu 2 fois');
  await expect(page.locator('.group-card', { hasText: 'Derniers constats' })).toContainText(present.idOrion);
  await page.screenshot({ path: testInfo.outputPath('recensement-campagne.png'), fullPage: true });

  await aTraiter.locator('.rec-row', { hasText: 'Écran recensé' }).getByRole('button', { name: 'Ajouter au parc' }).click();
  await expect(page.getByLabel('Modèle *')).toHaveValue('Écran recensé');
  await expect(page.getByLabel('Numéro de série')).toHaveValue('SN-RECENSE-1');
  await page.locator('.sheet-foot').getByRole('button', { name: 'Enregistrer' }).click();
  await expect(aTraiter.locator('.rec-row')).toHaveCount(1);
  await expect.poll(async () => {
    const apres = await state(request);
    return [apres.materiels.filter((m) => m.serie === 'SN-RECENSE-1').map((m) => m.salleId), apres.constats.filter((c) => /recense/i.test(c.code)).every((c) => c.traite?.par)];
  }).toEqual([[salle.id], true]);

  // Numéro de série déjà au parc : pas de doublon, le constat est seulement traité
  await page.evaluate((ecoleId) => window.orion.store.update('data', (s) => { s.materiels.push({ id: 'm-deja-cree', ecoleId, idOrion: '', salleId: null, type: 'autre', modele: 'Câble', marque: null, serie: 'SN-DEJA-CREE', dateReception: Date.now(), garantieFin: null, hs: false }); }), campagne.ecoleId);
  await aTraiter.getByRole('button', { name: 'Ajouter au parc' }).click();
  await expect(page.getByRole('dialog')).toContainText('Matériel déjà au parc');
  await page.getByRole('button', { name: 'Marquer traité' }).click();
  await expect(aTraiter).toContainText('Rien à traiter');
  await expect.poll(async () => (await state(request)).materiels.filter((m) => m.serie === 'SN-DEJA-CREE').length).toBe(1);

  await page.getByRole('button', { name: 'Étiquettes' }).click();
  await expect(page.getByRole('img', { name: `QR code de la salle ${salle.nom}` })).toBeVisible();
  await page.waitForTimeout(600);
  await page.screenshot({ path: testInfo.outputPath('recensement-etiquettes.png') });
  await page.getByRole('button', { name: 'Fermer' }).click();
  await page.getByRole('button', { name: 'Clôturer' }).click();
  await page.locator('.sheet-foot').getByRole('button', { name: 'Clôturer' }).click();
  await expect(page.getByRole('button', { name: 'Appairer un téléphone' })).toHaveCount(0);
  await open(page, '/materiels/recensement');
  await expect(page.locator('.rec-card', { hasText: 'Recensement de test' })).toContainText('Close le');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(800);
  await page.screenshot({ path: testInfo.outputPath('recensement-liste-mobile.png'), fullPage: true, animations: 'disabled' });
});
