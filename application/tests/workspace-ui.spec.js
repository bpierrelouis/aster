import { test, expect } from '@playwright/test';

const routes = [
  '/accueil', '/accueil/parc', '/accueil/remontees', '/salles',
  '/salles/batiment/A', '/salles/stock',
  '/materiels/inventaire', '/materiels/import',
  '/remontees/attente', '/remontees/traitees', '/remontees/toutes', '/remontees/miennes',
  '/supervision/salles', '/supervision/alertes', '/supervision/listes', '/supervision/statistiques',
  '/administration/postes', '/administration/applications', '/administration/batiments', '/administration/comptes',
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

test('sans barre de défilement, l’en-tête du tableau reste visible et la ligne suivante est coupée', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await open(page, '/materiels/inventaire');
  const scroller = page.locator('.inv-table-scroll');
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).scrollbarWidth)).toBe('none');
  expect(await scroller.evaluate((el) => getComputedStyle(el).scrollbarWidth)).toBe('none');
  // La ligne qui croise le bas de la zone en montre entre le tiers et la moitié
  const shown = await scroller.evaluate((el) => {
    const bottom = el.getBoundingClientRect().bottom;
    const row = [...el.querySelectorAll('tbody tr')].map((r) => r.getBoundingClientRect()).find((r) => r.top < bottom && r.bottom > bottom);
    return row ? (bottom - row.top) / row.height : null;
  });
  expect(shown).toBeGreaterThanOrEqual(1 / 3 - .02);
  expect(shown).toBeLessThanOrEqual(1 / 2 + .02);
  await scroller.evaluate((el) => { el.scrollTop = 600; });
  const [head, box] = [await page.locator('.inv-table thead th').first().boundingBox(), await scroller.boundingBox()];
  expect(Math.abs(head.y - box.y)).toBeLessThanOrEqual(1);
});

test('la légende des salles reste visible pendant le défilement', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await open(page, '/salles');
  await page.mouse.move(500, 600);
  await page.mouse.wheel(0, 1200);
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(200);
  await expect(page.locator('.iso-legend')).toBeInViewport({ ratio: 1 });
});

test('quatre ambiances changent les couleurs et la marque', async ({ page }) => {
  await open(page, '/accueil');
  await page.getByRole('button', { name: 'Compte' }).click();
  const group = page.getByRole('radiogroup', { name: 'Ambiance' });
  await expect(group.getByRole('radio')).toHaveText(['Aube', 'Encre', 'Orion', 'Vigie']);
  await expect(page.getByRole('radiogroup', { name: 'Verre' }).getByRole('radio')).toHaveText(['Liquide', 'Opaque']);
  await group.getByRole('radio', { name: 'Orion' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-ambiance', 'orion');
  await expect(page.locator('html')).toHaveAttribute('data-tone', 'dark');
  await expect(page.locator('.rail-brand .brand--orion')).toHaveCount(1);
  await group.getByRole('radio', { name: 'Vigie' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-tone', 'light');
  await expect(page.locator('.rail-brand .brand--vigie')).toHaveCount(1);
  await group.getByRole('radio', { name: 'Aube' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-ambiance', 'aube');
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
});

test('les postes de l’administration sont paginés, sans les demandes d’intervention', async ({ page, request }) => {
  await open(page, '/administration/postes');
  const total = (await state(request)).postes.length;
  const pages = Math.ceil(total / 25);
  await expect(page.locator('.ops-table tbody tr')).toHaveCount(Math.min(25, total));
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
