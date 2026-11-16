// Suivi : remontées, supervision, interventions, comptes et notifications
import { test, expect, open, state, asAccount, pick } from './espace-travail.ts';
import type { Page } from '@playwright/test';

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
  await expect(page.locator('.inv-table tbody tr').first().locator('td').nth(1)).toHaveText(/^.+ · Bâtiment [A-Z] · (Rez-de-chaussée|\d+e?r? étage|Sous-sol \d)$/);
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


test('supervision : Alertes par défaut ; la recherche ignore casse et espaces, reconnaît l’application et filtre les processus', async ({ page }) => {
  await open(page, '/supervision/inconnu');
  await expect(page.locator('#view h1')).toHaveText('Alertes & détections');
  await open(page, '/supervision/listes');
  const search = page.getByRole('searchbox', { name: 'Rechercher', exact: true });
  await search.fill('  LibreOffice ');
  await expect(page.locator('.inv-table tbody tr')).toHaveText([/soffice\.bin/, /soffice\.exe/]);
  await search.fill('blacklist STEAM');
  await expect(page.locator('.inv-table tbody tr')).toHaveText([/steam\.exe/]);
  // Filtre par classement : aucune règle autorisée ne correspond à « steam »
  await page.getByRole('combobox', { name: 'Filtrer par classement' }).click();
  await page.getByRole('listbox').getByRole('option', { name: 'Whitelist', exact: true }).click();
  await search.fill('steam');
  await expect(page.locator('.inv-table tbody tr')).toHaveText([/Aucune règle/]);
  await search.fill('processus-absent');
  await expect(page.locator('.inv-table tbody tr')).toHaveText([/Aucune règle/]);
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
    await expect(page.getByRole('button', { name: /^(Remplacé|Corrigé)$/ })).toHaveCount(0); // prise en charge obligatoire avant la fin
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


test('les administrateurs prennent en charge et traitent les remontées, comme le gestionnaire (RG-64)', async ({ page, request }) => {
  const data = await state(request);
  const actions = { attente: ['État des lieux', 'Prendre en charge'], encours: ['État des lieux', 'Remplacé', 'Corrigé'] };
  for (const phase of ['attente', 'encours'] as const) {
    const r = data.remontees.find((x) => x.statut === phase)!;
    await open(page, `/remontees/${phase}/${r.id}`);
    await expect(page.locator('.rm-detail .insp-title h2')).toHaveText(r.id);
    for (const nom of actions[phase]) await expect(page.locator('.insp-foot').getByRole('button', { name: nom, exact: true })).toBeVisible();
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
    await expect(pop.locator('.pop-row', { hasText: / hors garantie/ })).toHaveCount(1);
    await expect(pop.locator('.pop-row', { hasText: /à échéance/ })).toHaveCount(1);
    const groups = await pop.locator('.pop-row').count();
    await expect(page.locator('.topbar-actions .badge')).toHaveText(String(groups)); // un sujet par groupe
    await pop.getByRole('link', { name: 'Voir toutes les notifications' }).click();
    await expect(page).toHaveURL(/\/notifications$/);
    await expect(page.locator('.group-card')).toHaveCount(groups);
    await page.locator('.group-card', { hasText: / hors garantie/ }).getByRole('link', { name: 'Ouvrir' }).click();
    await expect(page).toHaveURL(/\/materiels\/inventaire\?garantie=/);
    await expect(page.getByRole('combobox', { name: 'Garantie' })).toContainText('Hors garantie');
  } finally {
    await asAccount(request, admin.id);
  }
});

// Le choix recharge la page : on attend le nouveau document plutôt que la fermeture du menu

test('supervision : la carte d’un poste montre son système et, sous l’état, l’utilisateur tronqué dans le cadre', async ({ page }) => {
  await open(page, '/supervision/salles?salle=s-e-num-a101');
  const card = page.locator('.ops-card', { has: page.locator('.poste-session--ligne') }).first();
  await expect(card.locator('.poste-os')).toHaveText('Windows 11', { timeout: 10_000 }); // remonté par le poste émulé
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 900 });
    const [box, user, etat] = await Promise.all([card.boundingBox(), card.locator('.poste-session--ligne').boundingBox(), card.locator('.poste-etat > .inv-state').boundingBox()]);
    expect(user!.y).toBeGreaterThanOrEqual(etat!.y + etat!.height - 1); // sous l'état, sur sa propre ligne
    expect(user!.x + user!.width).toBeLessThanOrEqual(box!.x + box!.width); // dans le cadre
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});


test('comptes : l’administrateur rattache un compte à son école ; le super administrateur choisit l’école et peut créer un super administrateur', async ({ page, request }) => {
  const comptes = (await state(request)).comptes.filter((c) => c.actif);
  const admin = comptes.find((c) => c.role === 'admin' && c.ecoleId === 'e-num')!;
  const nouveau = async () => {
    await open(page, '/administration/comptes');
    await page.getByRole('button', { name: 'Créer un compte', exact: true }).click();
    return page.getByRole('dialog', { name: 'Créer un compte', exact: true });
  };
  let dialog = await nouveau();
  await expect(dialog.getByRole('textbox', { name: 'École' })).toHaveValue('École du numérique');
  await expect(dialog.getByRole('textbox', { name: 'École' })).toHaveAttribute('readonly', '');
  await expect(dialog.getByRole('combobox', { name: 'École' })).toHaveCount(0);
  await page.keyboard.press('Escape');
  try {
    await asAccount(request, 'cpt-superadmin'); // invisible à l'administrateur d'une école
    dialog = await nouveau();
    await expect(dialog.getByRole('combobox', { name: 'École' })).toBeVisible();
    await pick(page, dialog.getByRole('combobox', { name: 'Profil' }), 'Super administrateur');
  } finally { await asAccount(request, admin.id); }
});

// #118 : le formateur ne trouve pas le stock par la recherche ; un matériel trouvé ouvre sa salle

test('le formateur ne signale un problème que dans une salle, pas au stock', async ({ page, request }) => {
  const view = await state(request);
  const admin = view.comptes.find((c) => c.actif && c.role === 'admin')!;
  const formateur = view.comptes.find((c) => c.actif && c.role === 'formateur' && c.ecoleId === admin.ecoleId)!;
  const dialogue = async () => {
    await page.getByRole('button', { name: 'Signaler un problème', exact: true }).last().click();
    return page.getByRole('dialog', { name: 'Signaler un problème', exact: true });
  };
  await open(page, '/remontees/attente');
  await expect((await dialogue()).locator('[data-salle="stock"]')).toBeVisible();
  try {
    await asAccount(request, formateur.id);
    await open(page, '/remontees/attente');
    const dialog = await dialogue();
    await expect(dialog.locator('.pick-room').first()).toBeVisible();
    await expect(dialog.locator('[data-salle="stock"]')).toHaveCount(0);
    expect(await page.evaluate(() => window.orion.store.state.materiels.every((m) => m.salleId))).toBe(true);
  } finally {
    await asAccount(request, admin.id);
  }
});
