/* Vue de l’opération (recensement ou installation) sur le téléphone : instantané d'ORION complété par les constats du téléphone
   non encore intégrés (présence, acceptation, retour), pour que l'écran reflète aussitôt chaque action. */
import type { Etat } from './etat.ts';
import type { MaterielRigel, SalleRigel } from '#shared/rigel.ts';
import type { Id } from '#shared/types.ts';

/** Contexte de lieu : une salle, le stock (null) ou aucun (undefined) */
export type Lieu = Id | null | undefined;
/** Paramètre d'adresse d'un lieu : identifiant de salle ou « stock » */
export const lieuDe = (parametre: string | null | undefined): Lieu => (parametre === 'stock' ? null : parametre || undefined);
export const parametreDe = (lieu: Id | null) => lieu ?? 'stock';

export interface MaterielVu extends MaterielRigel {
  /** Lieu où il a été vu pendant l’opération (salle, ou null pour le stock) ; undefined : pas encore vu */
  vuDans: Id | null | undefined;
  /** Vu dans un autre lieu que son affectation, sans y être accepté (retour ou mise au stock lancés, écart d'une version antérieure) */
  ecart: Id | null | undefined;
  /** Constat du téléphone pas encore intégré par ORION */
  attente: boolean;
}

export interface Vue {
  salles: SalleRigel[];
  materiels: MaterielVu[];
  materiel: Map<Id, MaterielVu>;
  salle: Map<Id, SalleRigel>;
  /** Matériels affectés à un lieu, et ceux qui y ont été vus */
  avancement(lieu: Id | null): { attendus: MaterielVu[]; vus: number };
}

const VU = new Set(['confirme', 'present', 'deplace', 'range', 'ajoute']);

let cache: { etat: Etat; vue: Vue } | null = null;
export function vueDe(etat: Etat): Vue {
  if (cache?.etat.instantane === etat.instantane && cache.etat.file === etat.file) return cache.vue;
  const inst = etat.instantane;
  const materiels = new Map<Id, MaterielVu>((inst?.materiels ?? []).map((m) => [m.id, { ...m, vuDans: undefined, ecart: undefined, attente: false }]));
  for (const c of [...(inst?.constats ?? [])].sort((a, b) => a.at - b.at)) {
    const m = c.materielId ? materiels.get(c.materielId) : undefined;
    if (!m) continue;
    if (VU.has(c.resultat)) { m.vuDans = c.salleId; m.ecart = undefined; }
    else if (['ecart', 'retour', 'stock'].includes(c.resultat)) m.ecart = c.salleId;
  }
  for (const { evenement: e } of etat.file) {
    const m = e.materielId ? materiels.get(e.materielId) : undefined;
    if (!m || e.type === 'inconnu') continue;
    m.attente = true;
    if (e.type === 'releve' && !(m.hs && e.salleId)) { m.salleId = e.salleId; m.enCours = false; }
    if (e.type === 'stock' && e.salleId) m.salleId = null;
    if (m.salleId === e.salleId) { m.vuDans = e.salleId; m.ecart = undefined; m.enCours = false; }
    else { m.ecart = e.salleId; if (e.type === 'retour' || e.type === 'stock') m.enCours = true; }
  }
  const liste = [...materiels.values()].sort((a, b) => a.idOrion.localeCompare(b.idOrion, 'fr', { numeric: true }));
  const salles = inst?.salles ?? [];
  const vue: Vue = {
    salles, materiels: liste, materiel: materiels, salle: new Map(salles.map((s) => [s.id, s])),
    avancement(lieu) {
      const attendus = liste.filter((m) => m.salleId === lieu);
      return { attendus, vus: attendus.filter((m) => m.vuDans === lieu).length };
    },
  };
  cache = { etat, vue };
  return vue;
}

/** Nom d'un lieu : salle, « Stock » */
export const nomLieu = (vue: Vue, lieu: Id | null) => (lieu === null ? 'Stock' : vue.salle.get(lieu)?.nom ?? 'Salle hors périmètre');
