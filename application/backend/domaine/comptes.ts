/* ==========================================================================
   Domaine · comptes ORION et identité
   Le profil, l'école et l'état actif sont portés par le compte ORION ; le
   fournisseur d'identité ne fait qu'authentifier. Le sujet (rapprochement),
   la dernière connexion et la date de désactivation sont fixés par le serveur.
   ========================================================================== */

import { isRole } from '#shared/catalog.ts';
import { assert, fail } from './commun.ts';
import type { Actor, Compte, Id, WorkspaceState } from '#shared/types.ts';
import type { Contexte, LooseItem } from './commun.ts';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Utilisateur agissant : compte actif uniquement. */
export function actorOf(state: WorkspaceState, accountId: Id): Actor | null {
  const c = state.comptes.find((x) => x.id === accountId);
  return c && c.actif ? { id: c.id, nom: c.nom, email: c.email, role: c.role, ecoleId: c.ecoleId ?? null } : null;
}

/** Compte correspondant à une identité du fournisseur (sujet OIDC, sinon adresse électronique). */
export function accountForIdentity(state: WorkspaceState, { sub, email }: { sub?: string; email?: string | null }): Compte | null {
  const bySubject = sub ? state.comptes.find((c) => c.sujet === sub) : undefined;
  if (bySubject) return bySubject;
  const mail = String(email ?? '').toLowerCase();
  const byEmail = mail ? state.comptes.find((c) => c.email.toLowerCase() === mail) : undefined;
  if (byEmail?.sujet && byEmail.sujet !== sub) return null; // adresse reprise par une autre identité
  return byEmail ?? null;
}

/** Création ou modification d'un compte par un administrateur */
export function regleCompte(x: LooseItem, old: LooseItem | undefined, { state, next, actor, now, stored }: Contexte) {
  assert(typeof x.nom === 'string' && x.nom.trim() && x.nom.length <= 120, 'Nom obligatoire.');
  assert(typeof x.email === 'string' && EMAIL.test(x.email) && x.email.length <= 254, 'Adresse électronique invalide.');
  x.email = x.email.trim().toLowerCase();
  assert(isRole(x.role), 'Profil inconnu.');
  assert(typeof x.actif === 'boolean');
  if (x.role === 'superadmin') { if (actor.role !== 'superadmin') fail(403, 'Profil réservé au super administrateur.'); x.ecoleId = null; }
  else assert(next.ecoles.some((e) => e.id === x.ecoleId), 'École de rattachement obligatoire.');
  if (actor.role !== 'superadmin' && x.ecoleId !== actor.ecoleId) fail(403, 'Ressource hors de votre école.');
  assert(!state.comptes.some((o) => o.id !== x.id && o.email.toLowerCase() === x.email), 'Cette adresse est déjà utilisée par un autre compte.');
  if (old?.id === actor.id) assert(x.actif && x.role === old.role && (x.ecoleId ?? null) === (old.ecoleId ?? null), 'Vous ne pouvez pas modifier votre propre profil ni désactiver votre compte.');
  const account = stored.get(x.id);
  // Identité rapprochée : fixée par le serveur seul, conservée tant que l'adresse ne change pas
  if (account?.sujet && account.email!.toLowerCase() === x.email) x.sujet = account.sujet; else delete x.sujet;
  // Date de désactivation : fixée à la désactivation, conservée tant qu'elle dure, retirée à la réactivation
  if (x.actif) delete x.dateDesactivation;
  else if (!account || account.actif) x.dateDesactivation = now;
}
