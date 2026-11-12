/* ==========================================================================
   Données de démonstration ORION, générées de façon déterministe.
   Jeu de travail : une école de quatre bâtiments aux étages et salles
   hétérogènes (de 1 à 8 salles par étage, du sous-sol au 4e étage).
   Une seconde école illustre la vue super administrateur.
   La forme des objets suit le glossaire et les règles de gestion.
   ========================================================================== */

import { DAY, HOUR } from './format.ts';
import type { Classement, Compte, DeviceTypeId, Detection, EtapeRemontee, Id, InterventionType, Layout, Materiel, Operation, Poste, ProblemId, Remontee, RemonteeStatut, RoleId, Salle, Widget, WidgetSize, WorkspaceState } from './types.ts';

function prng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Version du jeu de données : un état enregistré plus ancien est régénéré. */
export const SEED_VERSION = 13;

/**
 * Comptes ORION de départ : profil et école de rattachement de chaque personne.
 * L'identité (connexion) est portée par le fournisseur d'identité ; le compte
 * ORION est rapproché de cette identité par son adresse électronique.
 */
export const ACCOUNTS: Compte[] = [
  { id: 'cpt-superadmin', nom: 'S. Lefèvre', email: 'superadmin@orion.demo', role: 'superadmin', ecoleId: null, actif: true },
  { id: 'cpt-num-admin', nom: 'C. Durand', email: 'admin@orion.demo', role: 'admin', ecoleId: 'e-num', actif: true },
  { id: 'cpt-num-gestionnaire', nom: 'G. Bernard', email: 'gestionnaire@orion.demo', role: 'gestionnaire', ecoleId: 'e-num', actif: true },
  { id: 'cpt-num-formateur', nom: 'L. Martin', email: 'formateur@orion.demo', role: 'formateur', ecoleId: 'e-num', actif: true },
  { id: 'cpt-num-petit', nom: 'N. Petit', email: 'n.petit@orion.demo', role: 'formateur', ecoleId: 'e-num', actif: true },
  { id: 'cpt-num-garcia', nom: 'R. Garcia', email: 'r.garcia@orion.demo', role: 'formateur', ecoleId: 'e-num', actif: true },
  { id: 'cpt-num-robert', nom: 'M. Robert', email: 'm.robert@orion.demo', role: 'formateur', ecoleId: 'e-num', actif: true },
  { id: 'cpt-res-admin', nom: 'A. Moreau', email: 'a.moreau@orion.demo', role: 'admin', ecoleId: 'e-res', actif: true },
  { id: 'cpt-res-gestionnaire', nom: 'E. Dubois', email: 'e.dubois@orion.demo', role: 'gestionnaire', ecoleId: 'e-res', actif: true },
  { id: 'cpt-res-formateur', nom: 'J. Lambert', email: 'j.lambert@orion.demo', role: 'formateur', ecoleId: 'e-res', actif: true },
];

/* Catalogue de modèles : [type, modèle, marque, a un n° de série, garantie (années)] */
type Modele = [DeviceTypeId, string, string | null, boolean, number];
const MODELES = {
  uc: [['uc', 'Unité centrale OptiPlex 7010', 'Dell', true, 3], ['uc', 'Unité centrale ThinkCentre M70', 'Lenovo', true, 3]],
  ecran: [['ecran', 'Écran 24 pouces', 'Dell', true, 3], ['ecran', 'Écran 27 pouces', 'Iiyama', true, 3]],
  clavier: [['peripherique', 'Clavier USB', 'Logitech', false, 0]],
  souris: [['peripherique', 'Souris filaire', 'Logitech', false, 0]],
  vp: [['videoprojecteur', 'Vidéoprojecteur EB-W06', 'Epson', true, 2], ['videoprojecteur', 'Vidéoprojecteur MX560', 'BenQ', true, 2]],
  cable: [['reseau', 'Câble Ethernet 5 m', null, false, 0]],
  switch: [['reseau', 'Commutateur 24 ports', 'Cisco', true, 5]],
  borne: [['reseau', 'Borne Wi-Fi', 'Ubiquiti', true, 3]],
  audio: [['audio', 'Enceintes USB', 'Creative', false, 0], ['audio', 'Webcam HD', 'Logitech', true, 2]],
  imprimante: [['imprimante', 'Imprimante laser', 'HP', true, 2]],
  autre: [['autre', 'Station d’accueil', 'Dell', true, 2], ['autre', 'Onduleur', 'APC', true, 2]],
} satisfies Record<string, Modele[]>;
type ModeleKey = keyof typeof MODELES;
/* Salle en cours de génération : profil = nombre de postes de formation */
type SalleGeneree = Salle & { profil?: number };
/* Matériel en cours de génération : l'identifiant ORION est attribué une fois le parc complet */
type MaterielGenere = Omit<Materiel, 'idOrion'> & { idOrion?: string };

export function seed(now = Date.now()) {
  const rnd = prng(20261107);
  const pick = <T>(arr: readonly T[]): T => arr[Math.floor(rnd() * arr.length)];
  const between = (a: number, b: number) => a + Math.floor(rnd() * (b - a + 1));
  const serie = (prefix: string) => `${prefix}-${String(between(10000, 99999))}`;

  const ecoles = [
    { id: 'e-num', nom: 'École du numérique' },
    { id: 'e-res', nom: 'École des réseaux' },
  ];

  const salles: SalleGeneree[] = [];
  // etage : déduit du nom (A101 → 1er étage) sauf indication contraire
  const addSalle = (ecoleId: Id, batiment: string, nom: string, profil: number, etage = Number(nom.match(/^[A-Z](\d)\d{2}/)?.[1] ?? 0)) => salles.push({ id: `s-${ecoleId}-${nom.toLowerCase().replace(/\s+/g, '-')}`, ecoleId, batiment, nom, etage, profil });
  // profil : nombre de postes de formation (sert uniquement à générer les données)
  // A : 3 niveaux (3, 4 et 1 salles)
  ([['A012', 8], ['A014', 10], ['A018', 6], ['A101', 40], ['A105', 12], ['A112', 14], ['A118', 6], ['A203', 10]] as const).forEach(([n, p]) => addSalle('e-num', 'A', n, p));
  // B : 5 niveaux, étroit et haut
  ([['B001', 6], ['B004', 0], ['B101', 12], ['B104', 8], ['B110', 0], ['B203', 14], ['B204', 12], ['B210', 6], ['B305', 10], ['B402', 4]] as const).forEach(([n, p]) => addSalle('e-num', 'B', n, p));
  // C : 3 niveaux de 8 salles
  for (const level of [0, 1, 2]) for (let i = 1; i <= 8; i++) addSalle('e-num', 'C', `C${level}${String(i).padStart(2, '0')}`, [4, 6, 8, 10, 12, 6, 0, 8][(i + level) % 8]);
  // D : ateliers de plain-pied et réserve en sous-sol
  ([['Atelier 1', 4, 0], ['Atelier 2', 6, 0], ['Réserve', 0, -1]] as const).forEach(([n, p, e]) => addSalle('e-num', 'D', n, p, e));
  ([['R101', 10], ['R102', 10], ['R201', 8], ['Labo réseau', 6], ['R204', 4]] as const).forEach(([n, p]) => addSalle('e-res', 'R', n, p, n === 'Labo réseau' ? 2 : undefined));

  const materiels: MaterielGenere[] = [];
  // recentDays : réception récente, entre 2 et recentDays jours (sinon entre 20 jours et 3 ans)
  const mkMat = (ecoleId: Id, salleId: Id | null, key: ModeleKey, recentDays = 0) => {
    const [type, modele, marque, hasSerie, garantie] = pick<Modele>(MODELES[key]);
    const recu = now - (recentDays ? between(2, recentDays) : between(20, 1100)) * DAY;
    const r = rnd();
    materiels.push({
      id: `m-${materiels.length + 1}`,
      ecoleId,
      salleId,
      type,
      modele,
      marque,
      serie: hasSerie ? serie(modele.slice(0, 2).toUpperCase().replace(/[^A-Z]/g, 'X')) : null,
      dateReception: recu,
      hs: r < 0.018,
      garantieFin: garantie ? recu + garantie * 365 * DAY : null,
    });
  };

  for (const s of salles) {
    const n = s.profil;
    if (n) {
      for (let i = 0; i < n; i++) { mkMat(s.ecoleId, s.id, 'uc'); mkMat(s.ecoleId, s.id, 'ecran'); }
      for (let i = 0; i < Math.ceil(n / 2); i++) mkMat(s.ecoleId, s.id, rnd() < 0.5 ? 'clavier' : 'souris');
      mkMat(s.ecoleId, s.id, 'vp');
      mkMat(s.ecoleId, s.id, 'switch');
      for (let i = 0; i < between(1, 3); i++) mkMat(s.ecoleId, s.id, 'cable');
      if (rnd() < 0.5) mkMat(s.ecoleId, s.id, 'audio');
      if (rnd() < 0.3) mkMat(s.ecoleId, s.id, 'imprimante');
    } else {
      // salle de réunion ou bureau technique
      mkMat(s.ecoleId, s.id, 'vp'); mkMat(s.ecoleId, s.id, 'borne'); mkMat(s.ecoleId, s.id, 'audio'); mkMat(s.ecoleId, s.id, 'imprimante'); mkMat(s.ecoleId, s.id, 'autre');
    }
  }
  // Stock (sans localisation) : par école
  for (const [ecoleId, n] of [['e-num', 46], ['e-res', 14]] as const) {
    for (let i = 0; i < n; i++) mkMat(ecoleId, null, pick(['uc', 'ecran', 'ecran', 'clavier', 'souris', 'cable', 'cable', 'audio', 'autre', 'borne'] as const));
  }
  // Stock pour équiper une nouvelle salle : une vingtaine de postes (un ou deux écrans chacun) et des matériels secondaires,
  // reçus ces dernières semaines (garanties en cours)
  const LOT: Partial<Record<ModeleKey, number>> = { uc: 20, ecran: 40, clavier: 20, souris: 20, vp: 3, switch: 2, borne: 3, cable: 24, audio: 4, imprimante: 2, autre: 3 };
  for (const [key, n] of Object.entries(LOT) as [ModeleKey, number][]) for (let i = 0; i < n; i++) mkMat('e-num', null, key, 21);
  // Identifiant ORION attribué dans l'ordre de réception (RG-03)
  [...materiels].sort((a, b) => a.dateReception - b.dateReception).forEach((m, i) => { m.idOrion = `MAT-${String(i + 1).padStart(4, '0')}`; });

  const comptes = structuredClone(ACCOUNTS);
  const gestionnaireDe = (ecoleId: Id) => comptes.find((c) => c.ecoleId === ecoleId && c.role === 'gestionnaire')!;

  // Installation physique, affectations enregistrées par le gestionnaire : l'Atelier 2 reçoit huit postes du stock (trois
  // déjà installés), deux écrans passent de C201 à C202, trois matériels de l'Atelier 1 retournent au stock (pas encore
  // déplacés) et la B203 a fini d'être équipée il y a trois jours
  const gestNum = gestionnaireDe('e-num');
  const plan = (m: MaterielGenere, salleId: Id | null, at = now - between(2, 30) * HOUR) => { m.deplacement = { de: m.salleId ?? null, at, par: gestNum.nom, parId: gestNum.id }; m.salleId = salleId; };
  const installe = (m: MaterielGenere, de: Id | null, at: number) => { m.installation = { de, at, par: gestNum.nom, parId: gestNum.id }; };
  const salleNommee = (nom: string) => salles.find((s) => s.ecoleId === 'e-num' && s.nom === nom)!.id;
  const atelier = materiels.filter((m) => m.ecoleId === 'e-num' && !m.salleId && !m.hs && now - m.dateReception < 22 * DAY && ['uc', 'ecran'].includes(m.type)).slice(0, 8);
  atelier.forEach((m) => plan(m, salleNommee('Atelier 2'), now - 26 * HOUR));
  atelier.slice(0, 3).forEach((m) => { installe(m, null, now - between(1, 3) * HOUR); delete m.deplacement; });
  materiels.filter((m) => m.salleId === salleNommee('C201') && m.type === 'ecran').slice(0, 2).forEach((m) => plan(m, salleNommee('C202')));
  materiels.filter((m) => m.salleId === salleNommee('Atelier 1') && ['uc', 'ecran'].includes(m.type)).slice(0, 3).forEach((m) => plan(m, null));
  materiels.filter((m) => m.salleId === salleNommee('B203') && ['uc', 'ecran'].includes(m.type)).slice(0, 4).forEach((m) => installe(m, null, now - 3 * DAY + between(0, 4) * HOUR));

  // Postes de supervision, chacun rattaché à une unité centrale de sa salle (orientation de l'utilisateur du
  // 12 novembre ; RG-40 séparait les deux domaines)
  const postes: Poste[] = [];
  for (const s of salles) {
    const ucs = materiels.filter((m) => m.salleId === s.id && m.type === 'uc' && !m.deplacement);
    for (let i = 0; i < (s.profil ?? 0); i++) {
      postes.push({ id: `p-${postes.length + 1}`, salleId: s.id, nomReseau: `${s.nom.replace(/\s+/g, '').toUpperCase()}-PC${String(i + 1).padStart(2, '0')}`, materielId: ucs[i]?.id ?? null, allume: rnd() > 0.12 });
    }
  }
  for (const s of salles) delete s.profil;
  // Simulation : unités centrales hors service, dont les postes ne peuvent pas s'allumer ; les interventions qui
  // les visent restent en attente (interventionsDeDepart)
  for (const nom of SIMULATION.horsService) materiels.find((m) => m.id === postes.find((p) => p.nomReseau === nom)!.materielId)!.hs = true;

  /* Remontées : 12 semaines d'historique, statut commun à la remontée (RG-13) */
  const DESCRIPTIONS: Record<ProblemId, string[]> = {
    power: ['Aucun voyant au démarrage, même après changement de prise.', 'S’éteint seul quelques secondes après l’allumage.', 'Le bouton d’alimentation ne répond plus.'],
    display: ['L’écran reste noir alors que l’unité centrale démarre.', 'Image qui scintille puis disparaît.', 'Le vidéoprojecteur affiche « aucun signal » avec tous les câbles.'],
    network: ['Pas de connexion réseau sur ce poste, les voisins fonctionnent.', 'Le câble ne tient plus dans la prise murale.', 'Connexion qui coupe toutes les cinq minutes.'],
    broken: ['Coque fendue après une chute.', 'Pied de l’écran cassé, l’écran ne tient plus.', 'Plusieurs touches arrachées.'],
    malfunction: ['Touches E et R inopérantes.', 'Le clic droit ne fonctionne plus.', 'Ventilateur très bruyant en continu.'],
    other: ['Matériel manquant après la séance de la veille.', 'Étiquette d’inventaire illisible.', 'Odeur de brûlé signalée par les stagiaires.'],
  };
  const typeToProblem: Partial<Record<DeviceTypeId, ProblemId[]>> = { uc: ['power', 'malfunction', 'network'], ecran: ['display', 'broken'], videoprojecteur: ['display', 'power'], peripherique: ['malfunction', 'broken'], reseau: ['network'], audio: ['malfunction', 'other'], imprimante: ['malfunction', 'power'], autre: ['other', 'power'] };
  // Auteurs : formateurs (L. Martin plus souvent) et administrateur de l'école du matériel
  const auteursDe = (ecoleId: Id) => { const list = comptes.filter((c) => c.ecoleId === ecoleId && ['formateur', 'admin'].includes(c.role)); const lead = list.find((c) => c.role === 'formateur')!; return [lead, ...list]; };
  const remontees: Remontee[] = [];
  const placed = materiels.filter((m) => m.salleId);
  for (let i = 0; i < 74; i++) {
    const ageDays = Math.pow(rnd(), 1.05) * 84;
    const createdAt = now - ageDays * DAY - between(0, 8) * HOUR;
    const first = pick(placed);
    const ids = [first.id];
    if (rnd() < 0.3) {
      const same = placed.filter((m) => m.salleId === first.salleId && m.id !== first.id);
      for (let k = 0; k < between(1, 2); k++) { const x = pick(same); if (x && !ids.includes(x.id)) ids.push(x.id); }
    }
    const prob = pick<ProblemId>(typeToProblem[first.type] ?? ['other']);
    const open = ageDays < 16 ? rnd() < 0.85 : ageDays < 32 ? rnd() < 0.3 : false;
    const auteur = pick(auteursDe(first.ecoleId));
    const historique: EtapeRemontee[] = [{ statut: 'attente', at: createdAt, par: auteur.nom, parId: auteur.id }];
    const gest = gestionnaireDe(first.ecoleId);
    const step = (statut: RemonteeStatut, at: number, by = gest) => historique.push({ statut, at, par: by.nom, parId: by.id });
    let st: RemonteeStatut = 'attente';
    // Cycle : en attente → en cours (prise en charge) → remplacé ou corrigé (terminée)
    if (open) {
      if (rnd() < 0.45) { st = 'encours'; step(st, Math.min(now - HOUR, createdAt + between(1, 30) * HOUR)); }
    } else {
      const treatedAt = Math.min(now - HOUR, createdAt + between(3, 120) * HOUR);
      if (rnd() < 0.8) step('encours', createdAt + (treatedAt - createdAt) * (0.2 + rnd() * 0.5));
      st = rnd() < 0.55 ? 'remplace' : 'corrige';
      step(st, treatedAt);
    }
    remontees.push({
      id: '', ecoleId: first.ecoleId, auteur: auteur.nom, auteurId: auteur.id, createdAt, materielIds: ids, probleme: prob,
      description: pick(DESCRIPTIONS[prob]), statut: st, historique,
    });
  }
  remontees.sort((a, b) => a.createdAt - b.createdAt).forEach((r, i) => { r.id = `REM-${String(101 + i).padStart(4, '0')}`; });
  remontees.reverse();
  // Matériels concernés par une remontée non traitée : souvent hors service
  for (const r of remontees) if (['attente', 'encours'].includes(r.statut) && rnd() < 0.5) { const m = materiels.find((x) => x.id === r.materielIds[0]); if (m) m.hs = true; }

  /* Détections de processus (historique RG-56) */
  const procs: [string, Classement][] = [['steam.exe', 'blacklist'], ['discord.exe', 'blacklist'], ['torrent.exe', 'blacklist'], ['vlc.exe', 'nonref'], ['notepad++.exe', 'nonref'], ['spotify.exe', 'blacklist'], ['putty.exe', 'nonref']];
  const detections: Detection[] = [];
  const onlinePostes = postes.filter((p) => p.allume);
  for (let i = 0; i < 14; i++) {
    const p = pick(onlinePostes);
    const [nom, classement] = pick(procs);
    const at = now - Math.pow(rnd(), 1.4) * 9 * DAY;
    detections.push({ id: `d-${i + 1}`, at, posteId: p.id, salleId: p.salleId, processus: nom, compte: pick(UTILISATEURS), classement, arret: classement === 'blacklist' ? (rnd() < 0.92 ? 'réussi' : 'échec') : null });
  }
  detections.sort((a, b) => b.at - a.at);

  return {
    // Préférences, dispositions et dernière consultation : propres à chaque compte
    preferences: {} as WorkspaceState['preferences'],
    ecoles,
    version: SEED_VERSION,
    salles: salles as Salle[],
    etages: [...new Map(salles.map((s) => [`${s.ecoleId}-${s.batiment}-${s.etage}`, { id: `etage-${s.ecoleId}-${s.batiment}-${s.etage}`, ecoleId: s.ecoleId, batiment: s.batiment, niveau: s.etage }])).values()],
    materiels: materiels as Materiel[],
    postes,
    remontees,
    comptes,
    detections,
    operations: interventionsDeDepart(postes, salles, comptes, now),
    seededAt: now,
  };
}

/** Comptes Windows fictifs des stagiaires, pour les sessions des postes (émulateur) et les détections */
export const UTILISATEURS = [
  'camille.durand', 'lucas.bernard', 'chloe.moreau', 'hugo.lefebvre', 'lea.garnier', 'nathan.roux', 'manon.faure', 'theo.girard',
  'ines.mercier', 'louis.blanc', 'jade.guerin', 'gabriel.boyer', 'emma.lambert', 'arthur.fontaine', 'lina.chevalier', 'jules.robin',
  'sarah.masson', 'adam.sanchez', 'clara.muller', 'raphael.henry', 'zoe.perrin', 'mael.morin', 'alice.mathieu', 'noah.clement',
  'eva.gauthier', 'tom.dumont', 'lou.lopez', 'sacha.fournier', 'rose.nicolas', 'enzo.picard', 'anna.colin', 'leo.vidal',
];

/* Simulation : salles fermées, dont l'émulateur garde les postes éteints (backend/demonstrateur/agents.ts) ;
   identifiées par le début du nom réseau de leurs postes */
export const SALLES_FERMEES = ['A105', 'C203'];

/* Simulation : postes dont l'unité centrale est hors service, et interventions de départ :
   - en attente : une désinstallation et une réinstallation sur une salle fermée, une installation sur un poste hors service ;
   - en cours : une installation sur B104, faite par les postes allumés, que ses deux postes hors service ne finissent pas. */
const SIMULATION: {
  horsService: string[];
  interventions: { type: InterventionType; applicationId?: Id; image?: string; salle?: string; poste?: string; heures: number }[];
} = {
  horsService: ['B104-PC07', 'B104-PC08', 'A014-PC02'],
  interventions: [
    { type: 'desinstallation', applicationId: 'app-libreoffice', salle: 'C203', heures: 5 },
    { type: 'reinstallation', image: 'Windows — configuration de référence', salle: 'A105', heures: 26 },
    { type: 'installation', applicationId: 'app-postman', poste: 'A014-PC02', heures: 2 },
    { type: 'installation', applicationId: 'app-intellij', salle: 'B104', heures: 1 },
  ],
};

function interventionsDeDepart(postes: Poste[], salles: Salle[], comptes: Compte[], now: number) {
  const admin = comptes.find((c) => c.id === 'cpt-num-admin')!;
  return SIMULATION.interventions.map(({ salle, poste, heures, ...x }, i): Operation => {
    const s = salle ? salles.find((y) => y.ecoleId === admin.ecoleId && y.nom === salle) : undefined;
    const cibles = s ? postes.filter((p) => p.salleId === s.id).map((p) => p.id) : [postes.find((p) => p.nomReseau === poste)!.id];
    return {
      id: `op-depart-${i + 1}`, ...x, ...(s && { salleId: s.id }), cibles, ecoleId: admin.ecoleId!, at: now - heures * HOUR,
      par: admin.nom, parId: admin.id, statut: 'enregistree', resultats: Object.fromEntries(cibles.map((pid) => [pid, 'en_attente' as const])),
    };
  });
}

/* Dispositions par profil et par tableau de bord (RG-36 : tableaux spécialisés) */
export function defaultLayouts(): Record<RoleId, Layout> {
  let i = 0;
  const w = (type: string, size: WidgetSize): Widget => ({ id: `w${++i}`, type, size });
  // Parc : indicateurs, où sont les matériels hors service, composition, garanties, acquisitions, listes
  const parc = () => [
    w('kpi.materiels', 'S'), w('kpi.affectes', 'S'), w('kpi.stock', 'S'), w('kpi.hs', 'S'),
    w('chart.hsBatiments', 'L'), w('chart.types', 'L'),
    w('chart.matriceHs', 'L'), w('list.surveiller', 'L'),
    w('chart.garanties', 'M'), w('chart.disponibilite', 'M'),
    w('chart.echeances', 'L'), w('chart.parcBatiments', 'L'),
    w('chart.receptions', 'XL'),
    w('chart.localisation', 'M'), w('chart.marques', 'M'),
    w('list.hs', 'M'), w('list.salles', 'M'),
    w('list.recents', 'XL'),
  ];
  // Remontées : file de travail, flux, ancienneté, répartition dans le temps, par type et par bâtiment
  const remontees = () => [
    w('kpi.attente', 'M'), w('kpi.traitees', 'S'), w('kpi.delai', 'S'),
    w('list.aTraiter', 'L'), w('chart.flux', 'L'),
    w('chart.anciennete', 'M'), w('chart.solde', 'M'),
    w('chart.calendrier', 'XL'),
    w('chart.semaines', 'L'), w('chart.problemes', 'M'), w('chart.statuts', 'M'),
    w('chart.taux', 'L'), w('chart.batiments', 'L'),
  ];
  // Synthèse : ce qui demande une action d'abord, puis l'état du parc et des postes
  const admin = () => ({
    perso: [
      w('kpi.hs', 'S'), w('kpi.attente', 'S'), w('kpi.traitees', 'S'), w('kpi.delai', 'S'),
      w('list.aTraiter', 'L'), w('chart.flux', 'L'),
      w('chart.hsBatiments', 'L'), w('list.surveiller', 'L'),
      w('chart.postes', 'M'), w('list.detections', 'M'),
      w('kpi.parc', 'M'), w('chart.garanties', 'M'),
    ],
    parc: parc(),
    remontees: remontees(),
  });
  return {
    admin: admin(),
    superadmin: admin(),
    gestionnaire: {
      perso: [
        w('kpi.stock', 'S'), w('kpi.hs', 'S'), w('kpi.attente', 'S'), w('kpi.deplacements', 'S'),
        w('list.aTraiter', 'L'), w('list.installations', 'L'),
        w('chart.garanties', 'M'), w('chart.hsTypes', 'M'),
        w('list.surveiller', 'L'), w('chart.echeances', 'L'),
        w('chart.receptions', 'XL'),
      ],
      parc: parc(),
      remontees: remontees(),
    },
    formateur: {
      perso: [
        w('kpi.mesattente', 'S'), w('kpi.salles', 'S'),
        w('chart.postes', 'M'),
        w('list.mesremontees', 'XL'),
      ],
    },
  };
}
