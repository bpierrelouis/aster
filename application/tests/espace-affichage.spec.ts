// Navigation, apparence et composants communs de l’espace de travail
import { test, expect, open, state, asAccount } from './espace-travail.ts';
import { role as roleOf } from '#shared/catalog.ts';
import { dateTime } from '#shared/format.ts';
import type { Locator } from '@playwright/test';
import type { Compte } from '#shared/types.ts';

const routes = [
  '/accueil', '/accueil/parc', '/accueil/remontees', '/salles',
  '/salles/batiment/A', '/salles/stock',
  '/materiels/inventaire', '/materiels/import', '/materiels/recensement',
  '/remontees/attente', '/remontees/encours', '/remontees/terminees', '/remontees/toutes', '/remontees/miennes',
  '/supervision/salles', '/supervision/alertes', '/supervision/listes', '/supervision/statistiques',
  '/administration/postes', '/administration/applications', '/administration/interventions', '/administration/batiments', '/administration/comptes',
  '/salles/deplacements', '/notifications',
];

// Police embarquée (Marianne) pour tous les tests : la police système (Segoe UI sous Windows, plus large sous la

test('tous les écrans se chargent sans erreur JavaScript', async ({ page }) => {
  // 25 écrans, dont la première compilation de Vite à froid sur la CI : délai proportionné au parcours
  test.setTimeout(120_000);
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  for (const route of routes) {
    await open(page, route);
    await expect(page.locator('#view')).not.toContainText(/Bientôt disponible|première livraison/i);
  }
  expect(errors).toEqual([]);
});


test('les onglets trop larges perdent d’abord leur icône, puis seulement leur libellé, avec une infobulle', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 820 });
  await open(page, '/administration/postes');
  const sub = page.locator('.subnav');
  const onglet = sub.getByRole('link', { name: 'Comptes' });
  const largeur = (sel: string) => onglet.locator(sel).evaluate((n) => n.getBoundingClientRect().width);
  // Serrés : libellés gardés, icônes retirées
  await page.setViewportSize({ width: 1300, height: 820 });
  await expect(sub).toHaveClass(/is-tight/);
  await expect(sub).not.toHaveClass(/is-icons/);
  expect(await largeur(':scope > span')).toBeGreaterThan(1);
  expect(await largeur(':scope > .ico')).toBe(0);
  await expect(onglet).not.toHaveAttribute('data-tip');
  // En dernier recours : icône seule, libellé en infobulle
  await page.setViewportSize({ width: 1000, height: 820 });
  await expect(sub).toHaveClass(/is-icons/);
  expect(await largeur(':scope > span')).toBeLessThanOrEqual(1);
  await expect(onglet).toHaveAttribute('data-tip', 'Comptes');
  await page.setViewportSize({ width: 1600, height: 820 });
  await expect(sub).not.toHaveClass(/is-tight/);
  await expect(onglet).not.toHaveAttribute('data-tip');
});


test('les sous-onglets des remontées de l’administrateur gardent leur libellé', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await open(page, '/remontees/attente');
  const sub = page.locator('.subnav');
  await expect(sub).not.toHaveClass(/is-icons/);
  for (const name of ['En attente', 'En cours', 'Terminées', 'Toutes']) {
    expect(await sub.getByRole('link', { name: new RegExp(`^${name}`) }).locator(':scope > span').first().evaluate((n) => n.getBoundingClientRect().width)).toBeGreaterThan(1);
  }
});


test('les titres d’écran ne sont pas affichés', async ({ page }) => {
  for (const route of ['/accueil', '/salles', '/materiels/inventaire', '/remontees/attente', '/supervision/salles', '/administration/postes']) {
    await open(page, route);
    expect(await page.locator('#view h1').evaluate((n) => n.getBoundingClientRect().width), route).toBeLessThanOrEqual(1);
  }
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
  await page.emulateMedia({ colorScheme: 'light' });
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
  await page.evaluate(() => window.orion.store.flush());
});


test('une synchronisation lue pendant un enregistrement ne rétablit pas l’apparence précédente', async ({ page, request }) => {
  await open(page, '/accueil');
  // Choix suivis dans l'état du magasin, avant toute transition de l'affichage
  await page.evaluate(() => {
    const seen: string[] = [];
    Object.assign(window, { ambiances: seen });
    window.orion.store.subscribe(() => seen.push(window.orion.store.state.prefs.ambiance));
  });
  // L'enregistrement est retenu le temps qu'une autre écriture avance la révision et qu'une synchronisation soit demandée
  let release!: () => void;
  const held = new Promise<void>((resolve) => { release = resolve; });
  await page.route('**/api/workspace', async (route) => { if (route.request().method() === 'PUT') await held; await route.continue(); });
  await page.getByRole('button', { name: 'Compte' }).click();
  await page.getByRole('radiogroup', { name: 'Ambiance' }).getByRole('radio', { name: 'Minarm' }).click();
  await asAccount(request, (await state(request)).moi.id); // connexion : révision avancée par le serveur
  await page.evaluate(async () => {
    const reads: Promise<unknown>[] = [];
    const fetch = window.fetch;
    window.fetch = (...args) => { const answer = fetch(...args); if (!args[1]?.method) reads.push(answer.then((r) => r.clone().json())); return answer; };
    document.dispatchEvent(new Event('visibilitychange'));
    window.fetch = fetch;
    await Promise.all(reads);
    await new Promise((resolve) => setTimeout(resolve));
  });
  release();
  await page.evaluate(() => window.orion.store.flush());
  await expect(page.locator('html')).toHaveAttribute('data-ambiance', 'minarm');
  // Avant le choix, une synchronisation périodique peut reprendre l'apparence enregistrée (le simulateur des postes
  // fait avancer la révision) : seul compte qu'aucune ne revienne en arrière une fois Minarm choisi
  const ambiances = await page.evaluate(() => (window as unknown as { ambiances: string[] }).ambiances);
  expect(ambiances).toContain('minarm');
  expect(new Set(ambiances.slice(ambiances.indexOf('minarm')))).toEqual(new Set(['minarm']));
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


test('le menu principal n’a pas de bulle ; les règles de processus portent le logo de leur application', async ({ page }) => {
  await open(page, '/supervision/listes');
  await expect(page.locator('.rail-lens')).toHaveCount(0);
  await expect(page.locator('.rail-item.is-active')).toHaveAttribute('data-nav', 'supervision');
  for (const nom of ['firefox.exe', 'Code.exe', 'steam.exe']) {
    await page.getByRole('searchbox', { name: 'Rechercher', exact: true }).fill(nom);
    await expect(page.locator('.inv-table tr', { hasText: nom }).locator('img.app-icon')).toHaveCount(1);
  }
});


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
