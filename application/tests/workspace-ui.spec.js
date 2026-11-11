import { test, expect } from '@playwright/test';

const routes = [
  '/accueil', '/accueil/parc', '/accueil/remontees', '/salles',
  '/salles/batiment/A', '/salles/stock',
  '/materiels/inventaire', '/materiels/import',
  '/remontees/attente', '/remontees/encours', '/remontees/traitees', '/remontees/validees', '/remontees/toutes', '/remontees/miennes',
  '/supervision/salles', '/supervision/alertes', '/supervision/listes', '/supervision/statistiques',
  '/administration/postes', '/administration/applications', '/administration/batiments', '/administration/comptes',
  '/salles/deplacements', '/notifications',
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
  // Onglets réduits ou non : chacun garde un nom lisible par les lecteurs d'écran
  for (const name of ['Tous les bâtiments', 'Stock']) await expect(sub.getByRole('link', { name })).toBeVisible();
});

test('les onglets trop larges se réduisent à leur icône, avec une infobulle', async ({ page }) => {
  await page.setViewportSize({ width: 1000, height: 820 });
  await open(page, '/salles');
  const sub = page.locator('.subnav');
  await expect(sub).toHaveClass(/is-tight/);
  expect(await sub.evaluate((n) => n.scrollWidth <= n.clientWidth + 1)).toBe(true);
  const stock = sub.getByRole('link', { name: 'Stock' });
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

const bottom = async (locator) => { const b = await locator.boundingBox(); return b.y + b.height; };

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
  const [head, box] = [await page.locator('.inv-table thead th').first().boundingBox(), await scroller.boundingBox()];
  expect(Math.abs(head.y - box.y)).toBeLessThanOrEqual(1);
  await scroller.evaluate((el) => { el.scrollTop = el.scrollHeight; });
  await expect(scroller).not.toHaveClass(/has-more/);
});

test('la légende des salles reste visible pendant le défilement ; le panneau garde sa forme', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await open(page, '/salles');
  const panel = page.locator('.spanel');
  const height = (await panel.boundingBox()).height;
  expect(Math.abs(await bottom(panel) - await bottom(page.locator('.rail')))).toBeLessThanOrEqual(1);
  await page.mouse.move(500, 600);
  await page.mouse.wheel(0, 1200);
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(200);
  await expect(page.locator('.iso-legend')).toBeInViewport({ ratio: 1 });
  await page.locator('.salle-row').nth(3).hover(); // nouveau rendu une fois la page défilée
  expect((await panel.boundingBox()).height).toBe(height);
});

test('quatre ambiances ; Aster et Minarm suivent la machine, ou la tonalité forcée par le soleil ou la lune', async ({ page }) => {
  await open(page, '/accueil');
  await page.getByRole('button', { name: 'Compte' }).click();
  const group = page.getByRole('radiogroup', { name: 'Ambiance' });
  const html = page.locator('html');
  await expect(group.getByRole('radio')).toHaveText(['Aster', 'Minarm', 'Orion', 'Vigie']);
  await expect(page.getByRole('radiogroup', { name: 'Verre' }).getByRole('radio')).toHaveText(['Liquide', 'Opaque']);
  // Aster (défaut) : Aube en clair, Encre en sombre, en direct
  await expect(html).toHaveAttribute('data-ambiance', 'aster');
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
  await expect(html).toHaveAttribute('data-tone', 'dark');
  await expect(page.locator('.rail-brand .brand--orion')).toHaveCount(1);
  await expect(page.locator('.tone-switch')).toHaveCount(0); // tonalité propre à l'ambiance
  await group.getByRole('radio', { name: 'Vigie' }).click();
  await expect(html).toHaveAttribute('data-tone', 'light');
  await expect(page.locator('.rail-brand .brand--vigie')).toHaveCount(1);
  await group.getByRole('radio', { name: 'Aster' }).click();
  await expect(html).toHaveAttribute('data-ambiance', 'aster');
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

test('les tableaux de bord présentent des diagrammes ; indicateurs et diagrammes sans icône', async ({ page, request }) => {
  await open(page, '/accueil/parc');
  const widget = (type) => page.locator(`.widget[data-type="${type}"]`);
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
  for (const title of ['Postes connectés par bâtiment', 'Remontées par jour', 'Hors service par type et par bâtiment', 'Solde hebdomadaire des remontées']) {
    await expect(gallery.locator('.gal-meta b', { hasText: title })).toHaveCount(1);
  }
});

test('un bâtiment se renomme depuis l’administration, avec ses salles', async ({ page, request }) => {
  await open(page, '/administration/batiments');
  const rename = async (from, to) => {
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
  const rename = async (from, to) => {
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
  const salle = before.salles.find((s) => s.nom === 'B004');
  const stock = before.materiels.filter((m) => m.ecoleId === salle.ecoleId && !m.salleId && !m.hs);
  const count = (pred) => stock.filter(pred).length;
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

  const inRoom = (data) => data.materiels.filter((m) => m.salleId === salle.id).length;
  await expect.poll(async () => inRoom(await state(request))).toBe(inRoom(before) + expected);
  const after = await state(request);
  const moved = after.materiels.filter((m) => m.salleId === salle.id && !before.materiels.find((b) => b.id === m.id).salleId);
  expect(moved).toHaveLength(expected);
  expect(moved.every((m) => !m.hs)).toBe(true);
  expect(moved.filter((m) => m.type === 'ecran')).toHaveLength(postes * 2);
  expect(moved.every((m) => m.deplacement?.de === null)).toBe(true); // à déplacer depuis le stock
});

test('installation : un point orange passe au vert, la salle est équipée une fois tout installé', async ({ page, request }) => {
  const data = await state(request);
  const atelier = data.salles.find((s) => s.nom === 'Atelier 2');
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
  const search = page.getByRole('searchbox', { name: 'Rechercher' });
  await search.fill('  LibreOffice ');
  await expect(page.locator('.ops-table tbody tr')).toHaveText([/soffice\.exe/, /soffice\.bin/]);
  await search.fill('blacklist STEAM');
  await expect(page.locator('.ops-table tbody tr')).toHaveText([/steam\.exe/]);
  await search.fill('processus-absent');
  await expect(page.locator('.ops-table tbody tr')).toHaveText([/Aucune règle/]);
  // Un poste trouvé par un processus ne montre que les processus correspondants
  await open(page, '/supervision/salles?salle=s-e-num-a101');
  await search.fill('FIREFOX');
  const names = page.locator('.ops-process strong');
  await expect(names.first()).toBeVisible();
  expect(new Set(await names.allTextContents())).toEqual(new Set(['firefox.exe']));
});

test('le gestionnaire suit son travail dans le backlog ; seul l’auteur valide et clôt', async ({ page, request }) => {
  const comptes = (await state(request)).comptes.filter((c) => c.actif);
  const admin = comptes.find((c) => c.role === 'admin');
  const manager = comptes.find((c) => c.role === 'gestionnaire');
  const report = (await state(request)).remontees.find((r) => r.statut === 'attente');
  const asAccount = async (id) => expect((await request.post('/api/dev/compte', { data: { id }, headers: { origin: 'http://127.0.0.1:5174' } })).ok()).toBeTruthy();
  const col = (phase) => page.locator(`.bl-col--${phase}`);
  try {
    await asAccount(manager.id);
    await page.goto('/remontees');
    await expect(page).toHaveURL(/\/remontees\/backlog$/);
    await expect(page.locator('.subnav .seg-btn')).toHaveText([/Remontées/, /Installations/, /Toutes/]);
    await expect(page.locator('.bl-col')).toHaveCount(4);
    await expect(col('attente').locator('.bl-title').first()).toHaveText(/^(Ne s’allume pas|Pas d’image|Connexion|Casse|Fonctionnement anormal|Autre)$/); // la remontée, pas ses matériels
    await col('attente').locator('.bl-card', { hasText: report.id }).click();
    await page.getByRole('button', { name: 'Prendre en charge' }).click();
    await expect(col('encours').locator('.bl-card', { hasText: report.id })).toHaveCount(1);
    await page.getByRole('button', { name: 'Remplacé', exact: true }).click();
    await expect(col('traitee').locator('.bl-card', { hasText: report.id })).toHaveCount(1);
    await expect(page.getByRole('button', { name: 'Valider et clore' })).toHaveCount(0); // le gestionnaire n'en est pas l'auteur
    await asAccount(report.auteurId);
    await open(page, '/accueil'); // l'auteur est invité à valider le traitement
    await page.getByRole('button', { name: 'Notifications', exact: true }).click();
    await expect(page.locator('.popover--list .pop-row', { hasText: /traitées?, à valider/ })).toHaveCount(1);
    await open(page, `/remontees/traitees/${report.id}`);
    await page.getByRole('button', { name: 'Valider et clore' }).click();
    await expect.poll(async () => (await state(request)).remontees.find((r) => r.id === report.id)?.statut).toBe('validee');
  } finally {
    await asAccount(admin.id);
  }
});

test('l’import JSON n’ajoute que les nouveaux matériels et, une fois validés, les transferts d’une autre école', async ({ page, request }) => {
  const asAccount = async (id) => expect((await request.post('/api/dev/compte', { data: { id }, headers: { origin: 'http://127.0.0.1:5174' } })).ok()).toBeTruthy();
  try {
    await asAccount('cpt-superadmin'); // toutes les écoles, pour choisir les matériels du fichier
    const all = await state(request);
    const cited = new Set(all.remontees.filter((r) => r.statut !== 'validee').flatMap((r) => r.materielIds));
    const ici = all.materiels.find((m) => m.ecoleId === 'e-num' && m.serie);
    const ailleurs = all.materiels.find((m) => m.ecoleId === 'e-res' && m.serie && !cited.has(m.id));
    await asAccount('cpt-num-admin');
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
    await expect(preview.locator('tbody tr').first()).toContainText(`École des réseaux · ${ailleurs.idAster}`); // à décider : en premier
    await expect(preview.locator('tbody tr', { hasText: `Déjà présent · ${ici.idAster}` })).toContainText('Non traité');
    await expect(preview.locator('tbody tr', { hasText: /APERCU-0001/ })).toContainText('Prêt à être ajouté');
    await expect(page.getByRole('button', { name: 'Importer 1 matériel' })).toBeEnabled();
    await preview.getByRole('switch', { name: `Transférer ${ailleurs.idAster} depuis École des réseaux` }).click();
    await page.getByRole('button', { name: 'Importer 2 matériels' }).click();
    await expect(page.getByRole('button', { name: 'Import terminé' })).toBeVisible(); // coche, puis bouton initial
    await expect(page.locator('.inv-import [role="status"]')).toContainText('1 matériel ajouté, 1 transféré, 2 non traités');
    await expect(preview).toHaveCount(0);
    const resultat = page.getByRole('region', { name: 'Résultat de l’import' }); // la liste reste, avec le résultat
    await expect(resultat.locator('tbody tr', { hasText: /APERCU-0001/ })).toContainText('Ajouté');
    await expect(resultat.locator('tbody tr', { hasText: ailleurs.idAster })).toContainText('Transféré');
    await expect(page.getByRole('button', { name: 'Importer les matériels' })).toBeDisabled();
    await expect(page.locator('.inv-drop input[type="file"]')).toHaveValue('');
    const after = await state(request);
    expect(after.materiels.filter((m) => m.modele === 'Clavier aperçu')).toHaveLength(1);
    expect(after.materiels.find((m) => m.id === ailleurs.id)).toMatchObject({ ecoleId: 'e-num', idAster: ailleurs.idAster, salleId: null });
  } finally {
    await asAccount('cpt-num-admin');
  }
});

test('le gestionnaire suit l’installation des salles dans un second backlog ; les déplacements vont d’un lieu à un autre', async ({ page, request }) => {
  const comptes = (await state(request)).comptes.filter((c) => c.actif);
  const admin = comptes.find((c) => c.role === 'admin');
  const manager = comptes.find((c) => c.role === 'gestionnaire');
  const asAccount = async (id) => expect((await request.post('/api/dev/compte', { data: { id }, headers: { origin: 'http://127.0.0.1:5174' } })).ok()).toBeTruthy();
  try {
    await asAccount(manager.id);
    await open(page, '/remontees/installations');
    await expect(page.locator('.bl-col')).toHaveCount(3);
    await expect(page.locator('.bl-col--terminees .bl-card', { hasText: 'B203' }).getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100');
    await page.locator('.bl-col--afaire .bl-card', { hasText: 'C202' }).click();
    await expect(page).toHaveURL(/\/salles\/deplacements\?salle=/);
    await expect(page.getByRole('region', { name: 'C201 vers C202' })).toContainText('2 matériels à installer');
    await open(page, '/salles/deplacements');
    await expect(page.getByRole('region', { name: 'Atelier 1 vers Stock' })).toContainText(/\d+ matériels? à rapatrier/);
  } finally {
    await asAccount(admin.id);
  }
});

test('les notifications sont regroupées par nature ; l’espace Notifications les détaille toutes', async ({ page, request }) => {
  const comptes = (await state(request)).comptes.filter((c) => c.actif);
  const admin = comptes.find((c) => c.role === 'admin');
  const manager = comptes.find((c) => c.role === 'gestionnaire');
  const asAccount = async (id) => expect((await request.post('/api/dev/compte', { data: { id }, headers: { origin: 'http://127.0.0.1:5174' } })).ok()).toBeTruthy();
  try {
    await asAccount(manager.id);
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
    await expect(page.getByRole('combobox', { name: 'Garantie' })).toHaveValue('Échue');
  } finally {
    await asAccount(admin.id);
  }
});

// Dernier test : il change d'utilisateur puis revient au compte de départ
test('en mode interface seule, le menu du compte change d’utilisateur', async ({ page, request }) => {
  const comptes = (await state(request)).comptes.filter((c) => c.actif);
  const admin = comptes.find((c) => c.role === 'admin');
  const formateur = comptes.find((c) => c.role === 'formateur');
  const switchTo = async (compte) => {
    await page.getByRole('button', { name: 'Compte' }).click();
    await page.getByRole('combobox', { name: /Changer d’utilisateur/ }).selectOption(compte.id);
    await expect(page).toHaveURL(/\/accueil$/);
    await expect(page.locator('#view h1')).toBeAttached();
  };
  await open(page, '/accueil');
  await switchTo(formateur);
  await expect(page.locator('.rail-item[data-nav="administration"]')).toHaveCount(0);
  await switchTo(admin);
  await expect(page.locator('.rail-item[data-nav="administration"]')).toHaveCount(1);
});
