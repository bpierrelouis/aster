// Parc : salles, bâtiments, matériels, installation et recensement
import { test, expect, open, state, asAccount } from './espace-travail.ts';
import { dateNum } from '#shared/format.ts';
import type { Materiel, WorkspaceView } from '#shared/types.ts';

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


test('un matériel créé est conservé après rechargement', async ({ page, request }) => {
  const model = `Écran contrôle ${Date.now()}`;
  await open(page, '/materiels/inventaire');
  await page.getByRole('button', { name: 'Ajouter un matériel', exact: true }).first().click();
  const dialog = page.getByRole('dialog', { name: 'Ajouter un matériel', exact: true });
  // Le champ Modèle reçoit le focus à l'ouverture : attendu avant de remplir les autres champs
  await expect(dialog.getByLabel('Modèle *', { exact: true })).toBeFocused();
  await dialog.getByLabel('Modèle *', { exact: true }).fill(model);
  await dialog.getByLabel('Marque', { exact: true }).fill('Équipement de contrôle');
  await dialog.getByRole('button', { name: 'Enregistrer', exact: true }).click();
  await expect(dialog).toHaveCount(0);
  await expect.poll(async () => (await state(request)).materiels.some((m) => m.modele === model)).toBe(true);
  await page.reload();
  await expect(page.locator('#view h1')).toBeAttached();
  await expect.poll(async () => page.evaluate((name) => window.orion.store.state.materiels.some((m) => m.modele === name), model)).toBe(true);
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
  const admin = data.comptes.find((c) => c.actif && c.role === 'admin')!;
  const manager = data.comptes.find((c) => c.actif && c.role === 'gestionnaire' && c.ecoleId === admin.ecoleId)!;
  // L'administrateur suit l'installation sans la confirmer : points non cliquables, qui confirme en infobulle (décision du 14 novembre)
  await open(page, `/salles/deplacements?salle=${atelier.id}`);
  const suivi = page.getByRole('region', { name: 'Stock vers Atelier 2' });
  await expect(suivi.locator('span.inst-dot--wait[data-tip="Confirmation par le gestionnaire"]')).toHaveCount(pending.length);
  await expect(suivi.locator('button.inst-dot')).toHaveCount(0);
  await asAccount(request, manager.id);
  try { await installer(); } finally { await asAccount(request, admin.id); }
  async function installer() {
    await open(page, `/salles/salle/${atelier.id}`);
    const block = page.locator('.inst-block');
    await expect(block).toContainText('En cours d’installation');
    const progress = () => block.getByRole('progressbar').getAttribute('aria-valuenow').then(Number);
    const start = await progress();
    await page.getByRole('link', { name: 'Installation en cours' }).click();
    await expect(page).toHaveURL(new RegExp(`/salles/deplacements\\?salle=${atelier.id}$`));
    await expect(page.locator('.group-lead')).toContainText(/\d+ matériels? à déplacer$/);
    const card = page.getByRole('region', { name: 'Stock vers Atelier 2' });
    await expect(card.locator('button.inst-dot')).toHaveCount(pending.length);
    await card.locator('button.inst-dot').first().click(); // en cours → installé, enregistré par le serveur
    await expect(card.locator('button.inst-dot')).toHaveCount(pending.length - 1);
    await expect.poll(async () => (await state(request)).materiels.filter((m) => m.salleId === atelier.id && m.installation && !m.deplacement && m.installation.at > Date.now() - 60_000).length).toBe(1);
    await open(page, `/salles/salle/${atelier.id}`);
    expect(await progress()).toBeGreaterThan(start);
    await page.getByRole('link', { name: 'Installation en cours' }).click();
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
  await expect(page.getByRole('link', { name: 'Installation en cours' })).toHaveCount(0);
  await expect(page.locator('.insp-title')).toContainText('Équipée');
  }
});


test('seul un matériel du stock, cité par aucune remontée, peut être supprimé', async ({ page, request }) => {
  const data = await state(request);
  const cites = new Set(data.remontees.flatMap((r) => r.materielIds));
  const libre = (salle: boolean) => data.materiels.find((m) => m.ecoleId === 'e-num' && Boolean(m.salleId) === salle && !m.deplacement && !cites.has(m.id))!;
  const [enSalle, auStock] = [libre(true), libre(false)];
  const supprimer = async (m: Materiel) => {
    await open(page, '/materiels/inventaire');
    await page.getByRole('searchbox', { name: 'Rechercher un matériel' }).fill(m.idOrion);
    await page.locator('tbody tr', { hasText: m.idOrion }).locator('.inv-device').click();
    return page.getByRole('dialog', { name: m.modele }).getByRole('button', { name: 'Supprimer', exact: true });
  };
  const refus = await supprimer(enSalle);
  await expect(refus).toHaveAttribute('aria-disabled', 'true');
  await expect(refus).toHaveAccessibleDescription(/Seul un matériel du stock/); // motif visible sous les actions
  await expect(page.locator('#motif-suppression')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(await supprimer(auStock)).not.toHaveAttribute('aria-disabled', 'true');
  await page.keyboard.press('Escape');
  await open(page, `/salles/salle/${enSalle.salleId}`);
  await page.locator(`.dev[aria-label*="${enSalle.idOrion}"]`).click();
  await expect(page.getByRole('button', { name: 'Supprimer le matériel' })).toHaveAttribute('data-tip', /Seul un matériel du stock/);
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
    await expect(page.getByRole('region', { name: 'Retour au stock' })).toContainText(/\d+ matériels? à ramener au stock/);
    await expect(page.getByRole('region', { name: /vers Stock$/ })).toHaveCount(0); // une seule carte, quelle que soit la salle d'origine
  } finally {
    await asAccount(request, admin.id);
  }
});


test('la fiche d’un matériel hors service dans la vue Salles indique depuis quand', async ({ page, request }) => {
  const m = (await state(request)).materiels.find((x) => x.hs && x.salleId && x.dateHs)!;
  await open(page, `/salles/salle/${m.salleId}`);
  await page.locator(`.dev[aria-label*="${m.idOrion}"]`).click();
  await expect(page.locator('.dev-card .dev-facts')).toContainText(`Hors service depuis le ${dateNum(m.dateHs!)}`);
});



test('recensement : ouverture, appairage par QR code, code inconnu ajouté au parc par le serveur, anciens constats à traiter', async ({ page, request }, testInfo) => {
  const { chiffrer, lireAppairage } = await import('#shared/rigel.ts');
  const comptes = (await state(request)).comptes.filter((c) => c.actif);
  const admin = comptes.find((c) => c.role === 'admin')!;
  const manager = comptes.find((c) => c.role === 'gestionnaire' && c.ecoleId === admin.ecoleId)!;
  // RIGEL réservé au gestionnaire (ticket #156)
  await asAccount(request, manager.id);
  try { await recenser(); } finally { await asAccount(request, admin.id); }
  // L'administrateur suit le recensement en lecture seule : action désactivée, avec son motif
  await open(page, '/materiels/recensement');
  await expect(page.getByRole('button', { name: 'Nouveau recensement' })).toHaveAttribute('aria-disabled', 'true');
  await expect(page.getByRole('button', { name: 'Nouveau recensement' })).toHaveAttribute('data-tip', 'Recensement réservé au gestionnaire');
  await page.locator('.rec-card', { hasText: 'Recensement de test' }).click();
  await expect(page.locator('.group-lead')).toContainText('Recensement de test');
  await expect(page.locator('#view').getByRole('button')).toHaveCount(0);
  await page.setViewportSize({ width: 390, height: 844 });
  await open(page, '/materiels/recensement');
  await page.waitForTimeout(800);
  await page.screenshot({ path: testInfo.outputPath('recensement-liste-mobile.png'), fullPage: true, animations: 'disabled' });

  async function recenser() {
    await open(page, '/materiels/recensement');
    await page.getByRole('button', { name: 'Nouveau recensement' }).click();
    await page.getByLabel('Nom *').fill('Recensement de test');
    await page.getByRole('radio', { name: 'Salles choisies' }).click();
    await page.locator('.rec-batiment').first().locator('legend input').check();
    await page.getByRole('button', { name: 'Lancer le recensement' }).click();
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

    // Constats d'un téléphone, transmis par le connecteur : présence d'un matériel, code inconnu confirmé et renseigné
    const data = await state(request);
    const campagne = data.recensements.find((r) => r.id === id)!;
    const salle = data.salles.find((s) => s.id === campagne.salleIds[0])!;
    const present = data.materiels.find((m) => m.salleId === salle.id && !m.deplacement)!;
    const evenements = [
      { id: crypto.randomUUID(), type: 'vu', code: present.idOrion, salleId: salle.id, materielId: present.id, observeLe: Date.now() },
      { id: crypto.randomUUID(), type: 'inconnu', code: 'SN-RECENSE-1', salleId: salle.id, materielId: null, observeLe: Date.now(), saisie: { type: 'ecran', modele: 'Écran recensé', marque: 'Iiyama', serie: 'SN-RECENSE-1' } },
      // Même code inconnu scanné par un second agent : rattaché au matériel ajouté, sans doublon
      { id: crypto.randomUUID(), type: 'inconnu', code: 'sn recense 1', salleId: salle.id, materielId: null, observeLe: Date.now(), saisie: { type: 'ecran', modele: 'Ecran', marque: null, serie: 'sn-recense-1' } },
      // Codes inconnus d'un téléphone d'une version antérieure (sans saisie) : à traiter dans ORION
      { id: crypto.randomUUID(), type: 'inconnu', code: 'SN-ANCIEN-1', salleId: salle.id, materielId: null, observeLe: Date.now() },
      // … dont le matériel est ensuite créé dans ORION par quelqu'un d'autre
      { id: crypto.randomUUID(), type: 'inconnu', code: 'SN-DEJA-CREE', salleId: salle.id, materielId: null, observeLe: Date.now() },
    ];
    const blocs = await Promise.all(evenements.map(async (e) => ({ id: e.id, bloc: await chiffrer(acces.cle, id, e) })));
    const reponse = await request.post(`/api/rigel/campagnes/${id}/evenements`, { headers: { Authorization: 'Bearer orion-rigel-local' }, data: { evenements: blocs } });
    expect((await reponse.json()).resultats.map((r: { statut: string }) => r.statut)).toEqual(['applique', 'applique', 'applique', 'applique', 'applique']);
    const ajoute = (await state(request)).materiels.filter((m) => m.serie === 'SN-RECENSE-1');
    expect(ajoute.map((m) => [m.salleId, m.modele, Boolean(m.deplacement), /^MAT-\d{4}$/.test(m.idOrion)])).toEqual([[salle.id, 'Écran recensé', false, true]]);

    await page.reload();
    const aTraiter = page.locator('.group-card', { hasText: 'À traiter' });
    await expect(aTraiter.locator('.rec-row')).toHaveCount(2);
    const derniers = page.locator('.group-card', { hasText: 'Derniers constats' });
    await expect(derniers).toContainText(present.idOrion);
    await expect(derniers.locator('.rec-row', { hasText: 'Ajouté au parc' })).toContainText(ajoute[0].idOrion);
    await page.screenshot({ path: testInfo.outputPath('recensement-bilan.png'), fullPage: true });

    await aTraiter.locator('.rec-row', { hasText: 'SN-ANCIEN-1' }).getByRole('button', { name: 'Ajouter au parc' }).click();
    await expect(page.getByLabel('Numéro de série')).toHaveValue('SN-ANCIEN-1');
    await page.getByLabel('Modèle *').fill('Écran ancien');
    await page.locator('.sheet-foot').getByRole('button', { name: 'Enregistrer' }).click();
    await expect(aTraiter.locator('.rec-row')).toHaveCount(1);
    await expect.poll(async () => {
      const apres = await state(request);
      return [apres.materiels.filter((m) => m.serie === 'SN-ANCIEN-1').map((m) => m.salleId), apres.constats.filter((c) => c.code === 'SN-ANCIEN-1').every((c) => c.traite?.par)];
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
    await expect(page.locator('.rec-card', { hasText: 'Recensement de test' })).toContainText('Clos le');
  }
});


test('la recherche du formateur ignore le stock et mène à la salle du matériel', async ({ page, request }) => {
  const view = await state(request);
  const admin = view.comptes.find((c) => c.actif && c.role === 'admin')!;
  const formateur = view.comptes.find((c) => c.actif && c.role === 'formateur' && c.ecoleId === admin.ecoleId)!;
  const enStock = view.materiels.find((m) => !m.salleId && m.ecoleId === formateur.ecoleId)!;
  const enSalle = view.materiels.find((m) => m.salleId && m.ecoleId === formateur.ecoleId)!;
  const chercher = async (texte: string) => {
    await page.getByRole('button', { name: 'Rechercher', exact: true }).click();
    await page.getByRole('searchbox', { name: 'Recherche' }).fill(texte);
  };
  try {
    await asAccount(request, formateur.id);
    await open(page, '/accueil');
    await chercher(enStock.idOrion);
    await expect(page.getByText(`Aucun résultat pour « ${enStock.idOrion} »`)).toBeVisible();
    await page.getByRole('searchbox', { name: 'Recherche' }).fill(enSalle.idOrion);
    await page.getByRole('option', { name: new RegExp(enSalle.idOrion) }).click();
    await expect(page).toHaveURL(new RegExp(`/salles/salle/${enSalle.salleId}\\?m=${enSalle.id}$`));
  } finally {
    await asAccount(request, admin.id);
  }
});

// Le formateur signale le matériel d'une salle : le stock ne lui est pas proposé

test('installation et recensement simultanés d’une salle : deux boutons, QR codes de l’installation, restockage groupé', async ({ page, request }, testInfo) => {
  const data = await state(request);
  const admin = data.comptes.find((c) => c.actif && c.role === 'admin' && c.ecoleId === 'e-num')!;
  const manager = data.comptes.find((c) => c.actif && c.role === 'gestionnaire' && c.ecoleId === admin.ecoleId)!;
  const prevu = data.materiels.find((m) => m.ecoleId === admin.ecoleId && m.deplacement && m.salleId)!;
  const salle = data.salles.find((s) => s.id === prevu.salleId)!;
  // L'administrateur suit : ni installation avec un téléphone, ni restockage groupé
  await open(page, '/salles/deplacements');
  await expect(page.getByRole('button', { name: /avec un téléphone$/ })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Terminer le restockage' })).toHaveCount(0);
  await asAccount(request, manager.id);
  try {
    // Recensement de toute l'école, en même temps que l'installation de la salle
    await open(page, '/materiels/recensement');
    await page.getByRole('button', { name: 'Nouveau recensement' }).click();
    await expect(page.getByRole('radio', { name: 'Réaliser une installation' })).toHaveCount(0);
    await page.getByLabel('Nom *').fill('Recensement simultané');
    await page.getByRole('button', { name: 'Lancer le recensement' }).click();
    await expect(page).toHaveURL(/\/materiels\/recensement\/rec-/);
    const campagne = page.url().split('/').at(-1)!;

    await open(page, `/salles/salle/${salle.id}`);
    await expect(page.getByRole('link', { name: 'Recensement en cours' })).toBeVisible();
    await page.waitForTimeout(400);
    await page.screenshot({ path: testInfo.outputPath('salle-operations.png'), animations: 'disabled' });
    await page.getByRole('link', { name: 'Recensement en cours' }).click();
    await expect(page).toHaveURL(new RegExp(`/materiels/recensement/${campagne}$`));
    await open(page, `/salles/salle/${salle.id}`);
    await page.getByRole('link', { name: 'Installation en cours' }).click();
    await expect(page).toHaveURL(new RegExp(`/salles/deplacements\\?salle=${salle.id}$`));

    // Installation avec un téléphone : appairage, salle et stock ; lancée par le serveur, reprise à la réouverture
    await page.getByRole('button', { name: `Installer ${salle.nom} avec un téléphone` }).click();
    const fenetre = page.getByRole('dialog', { name: `Installer ${salle.nom}` });
    await expect(fenetre.getByRole('img', { name: `QR code d’appairage de l’installation de ${salle.nom}` })).toBeVisible();
    await expect(fenetre.getByRole('img', { name: `QR code de la salle ${salle.nom}` })).toBeVisible();
    await expect(fenetre.getByRole('img', { name: 'QR code du stock' })).toBeVisible();
    await page.waitForTimeout(600);
    await page.screenshot({ path: testInfo.outputPath('installation-qr.png'), animations: 'disabled' });
    const installations = (await state(request)).recensements.filter((r) => r.mode === 'installation' && r.salleIds[0] === salle.id && !r.close);
    expect(installations).toHaveLength(1);
    await open(page, '/materiels/recensement');
    await expect(page.locator('.rec-card', { hasText: installations[0].nom })).toHaveCount(0); // pas présentée comme un recensement
    await expect(page.locator('.rec-card', { hasText: 'Recensement simultané' })).toBeVisible();

    await open(page, `/salles/deplacements?salle=${salle.id}`);
    await page.getByRole('button', { name: `Installer ${salle.nom} avec un téléphone` }).click();
    await expect(fenetre.getByRole('img', { name: /QR code d’appairage/ })).toBeVisible();
    expect((await state(request)).recensements.filter((r) => r.mode === 'installation' && r.salleIds[0] === salle.id)).toHaveLength(1);
    await expect(fenetre.getByRole('button', { name: 'Clore l’installation' })).toHaveCount(0); // close d'elle-même
    await fenetre.getByRole('button', { name: 'Fermer' }).click();
    // Dernier déplacement de la salle confirmé par le gestionnaire : l'installation se clôt, à son nom
    await page.evaluate((sid) => window.orion.store.update('data', (s) => { for (const m of s.materiels) if (m.deplacement && (m.salleId === sid || m.deplacement.de === sid)) delete m.deplacement; }), salle.id);
    await expect.poll(async () => (await state(request)).recensements.find((r) => r.id === installations[0].id)?.close?.par).toBe(manager.nom);
    expect((await state(request)).recensements.find((r) => r.id === campagne)?.close).toBeUndefined(); // le recensement continue

    // Retour au stock : une seule carte, origine de chaque matériel, confirmation groupée en une écriture
    await open(page, '/salles/deplacements');
    const stock = page.getByRole('region', { name: 'Retour au stock' });
    const aRamener = (await state(request)).materiels.filter((m) => m.ecoleId === manager.ecoleId && m.deplacement && !m.salleId);
    expect(aRamener.length).toBeGreaterThan(0);
    await expect(stock.getByRole('heading')).toHaveText(new RegExp(`^${aRamener.length} matériels? à ramener au stock$`));
    await expect(stock).toContainText(/Depuis /);
    await page.waitForTimeout(400);
    await stock.screenshot({ path: testInfo.outputPath('retour-stock.png'), animations: 'disabled' });
    let ecritures = 0;
    page.on('request', (r) => { if (r.method() === 'PUT' && r.url().endsWith('/api/workspace') && r.postData()?.includes('"materiels"')) ecritures++; });
    await stock.getByRole('button', { name: 'Terminer le restockage' }).click();
    await page.locator('.sheet-foot').getByRole('button', { name: 'Terminer', exact: true }).click();
    await expect(stock).toHaveCount(0);
    await expect.poll(async () => (await state(request)).materiels.filter((m) => m.ecoleId === manager.ecoleId && m.deplacement && !m.salleId).length).toBe(0);
    expect(ecritures).toBe(1);

    await page.evaluate((id) => window.orion.store.update('data', (s) => { s.recensements.find((r) => r.id === id)!.close = { at: Date.now(), par: '', parId: null }; }), campagne);
    await expect.poll(async () => Boolean((await state(request)).recensements.find((r) => r.id === campagne)?.close)).toBe(true);
  } finally { await asAccount(request, admin.id); }
});
