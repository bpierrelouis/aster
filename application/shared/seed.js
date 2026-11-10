/* ==========================================================================
   Données de démonstration ASTER, générées de façon déterministe.
   Jeu de travail : une école de quatre bâtiments aux étages et salles
   hétérogènes (de 1 à 8 salles par étage, du sous-sol au 4e étage).
   Une seconde école illustre la vue super administrateur.
   La forme des objets suit le glossaire et les règles de gestion.
   ========================================================================== */

import { DAY, HOUR } from './format.js';

function prng(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Version du jeu de données : un état enregistré plus ancien est régénéré. */
export const SEED_VERSION = 6;

/**
 * Comptes ASTER de départ : profil et école de rattachement de chaque personne.
 * L'identité (connexion) est portée par le fournisseur d'identité ; le compte
 * ASTER est rapproché de cette identité par son adresse électronique.
 */
export const ACCOUNTS = [
  { id: 'cpt-superadmin', nom: 'S. Lefèvre', email: 'superadmin@aster.demo', role: 'superadmin', ecoleId: null, actif: true },
  { id: 'cpt-num-admin', nom: 'C. Durand', email: 'admin@aster.demo', role: 'admin', ecoleId: 'e-num', actif: true },
  { id: 'cpt-num-gestionnaire', nom: 'G. Bernard', email: 'gestionnaire@aster.demo', role: 'gestionnaire', ecoleId: 'e-num', actif: true },
  { id: 'cpt-num-formateur', nom: 'L. Martin', email: 'formateur@aster.demo', role: 'formateur', ecoleId: 'e-num', actif: true },
  { id: 'cpt-num-petit', nom: 'N. Petit', email: 'n.petit@aster.demo', role: 'formateur', ecoleId: 'e-num', actif: true },
  { id: 'cpt-num-garcia', nom: 'R. Garcia', email: 'r.garcia@aster.demo', role: 'formateur', ecoleId: 'e-num', actif: true },
  { id: 'cpt-num-robert', nom: 'M. Robert', email: 'm.robert@aster.demo', role: 'formateur', ecoleId: 'e-num', actif: true },
  { id: 'cpt-res-admin', nom: 'A. Moreau', email: 'a.moreau@aster.demo', role: 'admin', ecoleId: 'e-res', actif: true },
  { id: 'cpt-res-gestionnaire', nom: 'E. Dubois', email: 'e.dubois@aster.demo', role: 'gestionnaire', ecoleId: 'e-res', actif: true },
  { id: 'cpt-res-formateur', nom: 'J. Lambert', email: 'j.lambert@aster.demo', role: 'formateur', ecoleId: 'e-res', actif: true },
];

/* Catalogue de modèles : [type, modèle, marque, a un n° de série, garantie (années)] */
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
};

export function seed(now = Date.now()) {
  const rnd = prng(20261107);
  const pick = (arr) => arr[Math.floor(rnd() * arr.length)];
  const between = (a, b) => a + Math.floor(rnd() * (b - a + 1));
  const serie = (prefix) => `${prefix}-${String(between(10000, 99999))}`;

  const ecoles = [
    { id: 'e-num', nom: 'École du numérique' },
    { id: 'e-res', nom: 'École des réseaux' },
  ];

  const salles = [];
  // etage : déduit du nom (A101 → 1er étage) sauf indication contraire
  const addSalle = (ecoleId, batiment, nom, profil, etage = Number(nom.match(/^[A-Z](\d)\d{2}/)?.[1] ?? 0)) => salles.push({ id: `s-${ecoleId}-${nom.toLowerCase().replace(/\s+/g, '-')}`, ecoleId, batiment, nom, etage, profil });
  // profil : nombre de postes de formation (sert uniquement à générer les données)
  // A : 3 niveaux (3, 4 et 1 salles)
  [['A012', 8], ['A014', 10], ['A018', 6], ['A101', 40], ['A105', 12], ['A112', 14], ['A118', 6], ['A203', 10]].forEach(([n, p]) => addSalle('e-num', 'A', n, p));
  // B : 5 niveaux, étroit et haut
  [['B001', 6], ['B004', 0], ['B101', 12], ['B104', 8], ['B110', 0], ['B203', 14], ['B204', 12], ['B210', 6], ['B305', 10], ['B402', 4]].forEach(([n, p]) => addSalle('e-num', 'B', n, p));
  // C : 3 niveaux de 8 salles
  for (const level of [0, 1, 2]) for (let i = 1; i <= 8; i++) addSalle('e-num', 'C', `C${level}${String(i).padStart(2, '0')}`, [4, 6, 8, 10, 12, 6, 0, 8][(i + level) % 8]);
  // D : ateliers de plain-pied et réserve en sous-sol
  [['Atelier 1', 4, 0], ['Atelier 2', 6, 0], ['Réserve', 0, -1]].forEach(([n, p, e]) => addSalle('e-num', 'D', n, p, e));
  [['R101', 10], ['R102', 10], ['R201', 8], ['Labo réseau', 6], ['R204', 4]].forEach(([n, p]) => addSalle('e-res', 'R', n, p, n === 'Labo réseau' ? 2 : undefined));

  const materiels = [];
  const mkMat = (ecoleId, salleId, key) => {
    const [type, modele, marque, hasSerie, garantie] = pick(MODELES[key]);
    const recu = now - between(20, 1100) * DAY;
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
  for (const [ecoleId, n] of [['e-num', 46], ['e-res', 14]]) {
    for (let i = 0; i < n; i++) mkMat(ecoleId, null, pick(['uc', 'ecran', 'ecran', 'clavier', 'souris', 'cable', 'cable', 'audio', 'autre', 'borne']));
  }
  // Stock pour équiper une nouvelle salle : une vingtaine de postes (un ou deux écrans chacun) et des matériels secondaires
  const LOT = { uc: 20, ecran: 40, clavier: 20, souris: 20, vp: 3, switch: 2, borne: 3, cable: 24, audio: 4, imprimante: 2, autre: 3 };
  for (const [key, n] of Object.entries(LOT)) for (let i = 0; i < n; i++) mkMat('e-num', null, key);
  // Identifiant ASTER attribué dans l'ordre de réception (RG-03)
  [...materiels].sort((a, b) => a.dateReception - b.dateReception).forEach((m, i) => { m.idAster = `MAT-${String(i + 1).padStart(4, '0')}`; });

  // Postes de supervision (domaine distinct du parc, RG-40)
  const postes = [];
  for (const s of salles) {
    for (let i = 0; i < s.profil; i++) {
      postes.push({ id: `p-${postes.length + 1}`, salleId: s.id, nomReseau: `${s.nom.replace(/\s+/g, '').toUpperCase()}-PC${String(i + 1).padStart(2, '0')}`, connecte: rnd() > 0.12 });
    }
  }
  for (const s of salles) delete s.profil;

  /* Remontées : 12 semaines d'historique, statut commun à la remontée (RG-13) */
  const DESCRIPTIONS = {
    power: ['Aucun voyant au démarrage, même après changement de prise.', 'S’éteint seul quelques secondes après l’allumage.', 'Le bouton d’alimentation ne répond plus.'],
    display: ['L’écran reste noir alors que l’unité centrale démarre.', 'Image qui scintille puis disparaît.', 'Le vidéoprojecteur affiche « aucun signal » avec tous les câbles.'],
    network: ['Pas de connexion réseau sur ce poste, les voisins fonctionnent.', 'Le câble ne tient plus dans la prise murale.', 'Connexion qui coupe toutes les cinq minutes.'],
    broken: ['Coque fendue après une chute.', 'Pied de l’écran cassé, l’écran ne tient plus.', 'Plusieurs touches arrachées.'],
    malfunction: ['Touches E et R inopérantes.', 'Le clic droit ne fonctionne plus.', 'Ventilateur très bruyant en continu.'],
    other: ['Matériel manquant après la séance de la veille.', 'Étiquette d’inventaire illisible.', 'Odeur de brûlé signalée par les stagiaires.'],
  };
  const typeToProblem = { uc: ['power', 'malfunction', 'network'], ecran: ['display', 'broken'], videoprojecteur: ['display', 'power'], peripherique: ['malfunction', 'broken'], reseau: ['network'], audio: ['malfunction', 'other'], imprimante: ['malfunction', 'power'], autre: ['other', 'power'] };
  // Auteurs : formateurs (L. Martin plus souvent) et administrateur de l'école du matériel
  const comptes = structuredClone(ACCOUNTS);
  const auteursDe = (ecoleId) => { const list = comptes.filter((c) => c.ecoleId === ecoleId && ['formateur', 'admin'].includes(c.role)); const lead = list.find((c) => c.role === 'formateur'); return [lead, ...list]; };
  const gestionnaireDe = (ecoleId) => comptes.find((c) => c.ecoleId === ecoleId && c.role === 'gestionnaire');
  const remontees = [];
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
    const prob = pick(typeToProblem[first.type] ?? ['other']);
    const open = ageDays < 16 ? rnd() < 0.85 : ageDays < 32 ? rnd() < 0.3 : false;
    const auteur = pick(auteursDe(first.ecoleId));
    const historique = [{ statut: 'attente', at: createdAt, par: auteur.nom, parId: auteur.id }];
    let st = 'attente';
    if (!open) {
      st = rnd() < 0.55 ? 'remplace' : 'corrige';
      historique.push({ statut: st, at: Math.min(now - HOUR, createdAt + between(3, 120) * HOUR), par: gestionnaireDe(first.ecoleId).nom, parId: gestionnaireDe(first.ecoleId).id });
    }
    remontees.push({
      id: '', ecoleId: first.ecoleId, auteur: auteur.nom, auteurId: auteur.id, createdAt, materielIds: ids, probleme: prob,
      description: pick(DESCRIPTIONS[prob]), statut: st, historique,
    });
  }
  remontees.sort((a, b) => a.createdAt - b.createdAt).forEach((r, i) => { r.id = `REM-${String(101 + i).padStart(4, '0')}`; });
  remontees.reverse();
  // Matériels concernés par une remontée en attente : souvent hors service
  for (const r of remontees) if (r.statut === 'attente' && rnd() < 0.5) { const m = materiels.find((x) => x.id === r.materielIds[0]); if (m) m.hs = true; }

  /* Détections de processus (historique RG-56) */
  const procs = [['steam.exe', 'blacklist'], ['discord.exe', 'blacklist'], ['torrent.exe', 'blacklist'], ['vlc.exe', 'nonref'], ['notepad++.exe', 'nonref'], ['spotify.exe', 'blacklist'], ['putty.exe', 'nonref']];
  const detections = [];
  const onlinePostes = postes.filter((p) => p.connecte);
  for (let i = 0; i < 14; i++) {
    const p = pick(onlinePostes);
    const [nom, classement] = pick(procs);
    const at = now - Math.pow(rnd(), 1.4) * 9 * DAY;
    detections.push({ id: `d-${i + 1}`, at, posteId: p.id, salleId: p.salleId, processus: nom, compte: `stagiaire.${between(10, 48)}`, classement, arret: classement === 'blacklist' ? (rnd() < 0.92 ? 'réussi' : 'échec') : null });
  }
  detections.sort((a, b) => b.at - a.at);

  return {
    // Préférences, dispositions et dernière consultation : propres à chaque compte
    preferences: {},
    ecoles,
    version: SEED_VERSION,
    salles,
    etages: [...new Map(salles.map((s) => [`${s.ecoleId}-${s.batiment}-${s.etage}`, { id: `etage-${s.ecoleId}-${s.batiment}-${s.etage}`, ecoleId: s.ecoleId, batiment: s.batiment, niveau: s.etage }])).values()],
    materiels,
    postes,
    remontees,
    comptes,
    detections,
    seededAt: now,
  };
}

/* Dispositions par profil et par tableau de bord (RG-36 : tableaux spécialisés) */
export function defaultLayouts() {
  let i = 0;
  const w = (type, size) => ({ id: `w${++i}`, type, size });
  const parc = () => [
    w('kpi.materiels', 'S'), w('kpi.affectes', 'S'), w('kpi.stock', 'S'), w('kpi.hs', 'S'),
    w('chart.parcBatiments', 'L'), w('chart.garanties', 'L'),
    w('chart.localisation', 'M'), w('chart.disponibilite', 'M'),
    w('chart.receptions', 'XL'),
    w('chart.types', 'L'), w('chart.marques', 'L'),
    w('list.salles', 'L'), w('list.hs', 'L'),
    w('list.recents', 'XL'),
  ];
  const remontees = () => [
    w('kpi.attente', 'S'), w('kpi.traitees', 'S'), w('chart.statuts', 'M'),
    w('chart.flux', 'L'), w('list.attente', 'L'),
    w('chart.problemes', 'L'), w('chart.semaines', 'L'),
    w('chart.batiments', 'XL'),
  ];
  const admin = () => ({
    perso: [
      w('kpi.parc', 'M'), w('kpi.hs', 'S'), w('kpi.attente', 'S'),
      w('chart.flux', 'L'), w('list.attente', 'L'),
      w('chart.problemes', 'M'), w('chart.postes', 'M'),
      w('chart.parcBatiments', 'L'), w('chart.garanties', 'L'),
      w('chart.disponibilite', 'M'), w('list.detections', 'M'),
      w('chart.batiments', 'XL'),
    ],
    parc: parc(),
    remontees: remontees(),
  });
  return {
    admin: admin(),
    superadmin: admin(),
    gestionnaire: {
      perso: [
        w('kpi.stock', 'S'), w('kpi.hs', 'S'), w('kpi.attente', 'S'), w('chart.disponibilite', 'S'),
        w('list.attente', 'L'), w('chart.problemes', 'L'),
        w('chart.garanties', 'L'), w('chart.types', 'L'),
        w('chart.receptions', 'XL'),
        w('kpi.garanties', 'M'), w('list.hs', 'M'),
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
