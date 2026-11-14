/* ==========================================================================
   Démonstrateur uniquement : identifiant de connexion formé à partir du nom
   d'un compte ORION, pour les identités créées dans l'annuaire local.
   - Forme prénom.nom, en minuscules, sans accents ni caractères spéciaux.
   - Prénom composé (Pierre-Louis, Pierre Louis) : initiales (pl).
   - Nom composé (Dupont-Moretti) : premier élément et initiales des
     suivants (dupont-m) ; particules retirées (de La Fontaine : fontaine).
   - Le nom est le mot en capitales (Pierre-Louis BAELDE), sinon le dernier
     mot, précédé de ses particules.
   - Longueurs bornées : 8 pour le prénom, 12 pour le nom, 20 en tout,
     comme un identifiant Windows (sAMAccountName).
   - Homonymes : chiffre ajouté à partir du deuxième (pl.baelde, pl.baelde1…).
   ========================================================================== */

const PARTICULES = new Set(['de', 'du', 'des', 'd', 'la', 'le', 'les', 'l', 'van', 'von', 'der', 'den', 'di', 'da', 'del', 'dos', 'el', 'al', 'ben', 'ter', 'zu']);
const MAX_PRENOM = 8, MAX_NOM = 12, MAX = 20;

/** Éléments d'un mot ou d'un groupe de mots : minuscules sans accents, coupés aux espaces, tirets et apostrophes */
const elements = (texte: string) => texte
  .replace(/œ/gi, 'oe').replace(/æ/gi, 'ae').replace(/ß/g, 'ss')
  .normalize('NFD').replace(/\p{M}/gu, '').toLowerCase()
  .split(/[\s\-‐'’.]+/).map((e) => e.replace(/[^a-z0-9]/g, '')).filter(Boolean);

const capitales = (mot: string) => /\p{Lu}{2}/u.test(mot) && mot === mot.toUpperCase();

/** Sépare prénoms et nom : mots en capitales, sinon dernier mot avec ses particules */
function decouper(nomComplet: string) {
  const mots = nomComplet.trim().split(/\s+/).filter(Boolean);
  let debut = mots.findIndex(capitales);
  if (debut < 0) {
    debut = Math.max(0, mots.length - 1);
    while (debut > 1 && PARTICULES.has(elements(mots[debut - 1])[0] ?? '')) debut--;
  }
  return { prenoms: mots.slice(0, debut).join(' '), nom: mots.slice(debut).join(' ') };
}

/** Identifiant de base, sans suffixe d'homonymie */
export function identifiantDeBase(nomComplet: string, repli = 'utilisateur') {
  const { prenoms, nom } = decouper(nomComplet);
  const p = elements(prenoms);
  const n = elements(nom).filter((e, i, all) => !PARTICULES.has(e) || i === all.length - 1);
  const prenom = p.length > 1 ? p.map((e) => e[0]).join('') : (p[0] ?? '').slice(0, MAX_PRENOM);
  const famille = n.length ? [n[0].slice(0, MAX_NOM), n.slice(1).map((e) => e[0]).join('')].filter(Boolean).join('-') : '';
  const base = [prenom, famille].filter(Boolean).join('.');
  return (base || elements(repli).join('.') || 'utilisateur').slice(0, MAX).replace(/[.-]+$/, '');
}

/** Premier identifiant libre : base, puis base1, base2… (raccourci si besoin pour tenir en 20 caractères) */
export function identifiantUnique(nomComplet: string, pris: (identifiant: string) => boolean, repli?: string) {
  const base = identifiantDeBase(nomComplet, repli);
  if (!pris(base)) return base;
  for (let i = 1; ; i++) {
    const candidat = `${base.slice(0, MAX - String(i).length).replace(/[.-]+$/, '')}${i}`;
    if (!pris(candidat)) return candidat;
  }
}
