import { test, expect } from '@playwright/test';

const routes = [
  '/accueil', '/accueil/parc', '/accueil/remontees', '/salles',
  '/salles/batiment/A', '/salles/stock',
  '/materiels/inventaire', '/materiels/import',
  '/remontees/attente', '/remontees/traitees', '/remontees/toutes', '/remontees/miennes',
  '/supervision/salles', '/supervision/alertes', '/supervision/listes', '/supervision/statistiques',
  '/administration/postes', '/administration/applications', '/administration/comptes',
];

// Le titre de chaque écran est réservé aux lecteurs d'écran : présent, mais non affiché
async function open(page, route) {
  await page.goto(route);
  await expect(page.locator('#view h1')).toBeAttached();
  await expect(page.locator('.loading')).toHaveCount(0);
}

async function state(request) {
  const response = await request.get('/api/workspace');
  expect(response.ok()).toBeTruthy();
  return response.json();
}

test('tous les écrans se chargent sans erreur JavaScript', async ({ page }) => {
  const errors = [];
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
  expect(await page.locator('.floor-slab.is-active .blk .blk-label b').allTextContents()).toEqual(expected.map((s) => s.nom));
  expect(await page.locator('.salle-row > b').allTextContents()).toEqual(expected.map((s) => s.nom));
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

test('quitter une salle de la vue éclatée retire son état survolé', async ({ page }) => {
  await open(page, '/salles/batiment/C');
  const room = page.locator('.blk').first();
  await room.hover();
  await expect(page.locator('.blk.is-hover')).toHaveCount(1);
  await expect(page.locator('.salle-row.is-hover')).toHaveCount(1);
  const box = await page.locator('.iso-stage').boundingBox();
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
    const unsub = window.aster.store.subscribe((topic) => {
      if (topic !== 'remote') return;
      unsub();
      requestAnimationFrame(() => requestAnimationFrame(() => resolve(document.getAnimations().filter((a) => a.playState === 'running' && a.effect?.target?.closest?.('.iso')).length)));
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
  await expect.poll(async () => page.evaluate((name) => window.aster.store.state.materiels.some((m) => m.modele === name), model)).toBe(true);
});

test('une remontée créée produit un PDF téléchargeable', async ({ page, request }) => {
  const description = `Écran noir après allumage ${Date.now()}`;
  await open(page, '/remontees/attente');
  await page.getByRole('button', { name: 'Signaler un problème', exact: true }).last().click();
  const dialog = page.getByRole('dialog', { name: 'Signaler un problème', exact: true });
  await dialog.locator('[data-salle]').filter({ hasText: 'A012' }).click();
  await dialog.locator('[data-mat]').first().click();
  await dialog.getByRole('button', { name: 'Continuer', exact: true }).click();
  await dialog.getByLabel('Description du problème *').fill(description);
  await dialog.getByRole('button', { name: 'Transmettre la remontée', exact: true }).click();
  await expect(dialog).toHaveCount(0);
  await expect.poll(async () => (await state(request)).remontees.some((r) => r.description === description)).toBe(true);
  const report = (await state(request)).remontees.find((r) => r.description === description);
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
