/* ==========================================================================
   Domaine · remontées
   Cycle : en attente → en cours (prise en charge) → remplacé ou corrigé.
   L'auteur, les dates, le numéro et l'historique sont fixés par le serveur.
   ========================================================================== */

import { normalizeProblemLabel, PROBLEM_LABEL_HELP } from '#shared/problem-label.ts';
import { PROBLEMS } from '#shared/catalog.ts';
import { assert, fail, seulsModifies } from './commun.ts';
import type { RemonteeStatut } from '#shared/types.ts';
import type { Contexte, LooseItem } from './commun.ts';

/** Champs d'une remontée saisis par l'utilisateur ; les autres sont fixés par le serveur, toute autre propriété est ignorée */
const SAISIE_REMONTEE: readonly string[] = ['id', 'ecoleId', 'materielIds', 'probleme', 'description'];

/** Création ou traitement d'une remontée */
export function regleRemontee(x: LooseItem, old: LooseItem | undefined, { actor, now, materiels, state }: Contexte) {
  if (!old) {
    if (actor.role === 'gestionnaire') fail(403, 'Création de remontée non autorisée.');
    for (const k of Object.keys(x)) if (!SAISIE_REMONTEE.includes(k)) delete (x as Record<string, unknown>)[k]; // ni salle ni autre valeur hors saisie
    Object.assign(x, { auteur: actor.nom, auteurId: actor.id, createdAt: now, statut: 'attente', historique: [{ statut: 'attente', at: now, par: actor.nom, parId: actor.id }] });
  } else {
    // Cycle : en attente → en cours (prise en charge) → remplacé ou corrigé : terminée. Le gestionnaire seul
    // prend en charge et termine ; la prise en charge précède toujours la fin (décisions de l'utilisateur du 13 novembre)
    const possibles = ({ attente: ['encours'], encours: ['remplace', 'corrige'] } as Partial<Record<string, string[]>>)[old.statut!] ?? [];
    if (actor.role !== 'gestionnaire') fail(403, 'Prise en charge et traitement réservés au gestionnaire.');
    if (old.statut === 'attente' && ['remplace', 'corrige'].includes(x.statut!)) fail(400, 'Prenez d’abord la remontée en charge avant de la terminer.');
    assert(possibles.includes(x.statut!), 'Transition de statut indisponible.');
    seulsModifies(old, x, ['statut', 'historique'], 'Seul le traitement peut être modifié.');
    x.historique = [...old.historique!, { statut: x.statut as RemonteeStatut, at: now, par: actor.nom, parId: actor.id }];
  }
  // Type de problème obligatoire à la création : un type proposé, ou le libellé précisé pour « Autre »
  if (!old) assert(x.probleme != null && String(x.probleme).trim(), 'Type de problème obligatoire : choisissez un type ou précisez le problème.');
  if (x.probleme != null) {
    assert(typeof x.probleme === 'string' && x.probleme.trim() && x.probleme.length <= 100, 'Type de problème invalide.');
    if (!old && !PROBLEMS.some((p) => p.id === x.probleme)) {
      const label = normalizeProblemLabel(x.probleme);
      assert(!label.invalid, `Type de problème invalide. ${PROBLEM_LABEL_HELP}`);
      x.probleme = label.value.trim();
    } else x.probleme = x.probleme.trim();
  }
  assert(typeof x.description === 'string' && x.description.trim() && x.description.length <= 12000, 'Description obligatoire.');
  // Le formateur signale le matériel d'une salle, jamais celui du stock (décision de l'utilisateur du 14 novembre)
  if (!old && actor.role === 'formateur' && Array.isArray(x.materielIds) && state.materiels.some((m) => m.ecoleId === x.ecoleId && !m.salleId && x.materielIds!.includes(m.id))) fail(400, 'Un formateur ne signale que le matériel d’une salle, pas celui du stock.');
  assert(Array.isArray(x.materielIds) && x.materielIds.length > 0 && x.materielIds.every((mid) => materiels.some((m) => m.id === mid && m.ecoleId === x.ecoleId)), 'Matériels invalides.');
}
