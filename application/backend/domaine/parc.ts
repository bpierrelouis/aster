/* ==========================================================================
   Domaine · parc : matériels, salles et étages
   L'identifiant ORION, la date de mise hors service et le suivi de
   l'installation physique (déplacement en cours, dernière installation
   confirmée) sont fixés par le serveur. Import JSON : import.ts.
   ========================================================================== */

import { batimentCode } from '#shared/buildings.ts';
import { adresseMac, numeroMateriel } from '#shared/catalog.ts';
import { assert, fail, same } from './commun.ts';
import type { CollectionName } from '#shared/types.ts';
import type { Contexte, LooseItem } from './commun.ts';

/** Déclaration ou modification d'un matériel */
export function regleMateriel(x: LooseItem, old: LooseItem | undefined, { actor, now, salles, numeros }: Contexte) {
  assert(typeof x.modele === 'string' && x.modele.trim() && x.modele.length <= 250 && Number.isFinite(x.dateReception) && typeof x.hs === 'boolean');
  assert(!x.salleId || salles.some((s) => s.id === x.salleId && s.ecoleId === x.ecoleId), 'Salle inconnue ou hors école.');
  if (x.mac != null && x.mac !== '') { x.mac = adresseMac(x.mac); assert(x.mac, 'Adresse MAC invalide : douze chiffres hexadécimaux attendus.'); } else x.mac = null;
  // Un matériel hors service ne peut qu'être remis en service ou renvoyé au stock (orientation de l'utilisateur du 12 novembre)
  if (old && x.hs && x.salleId && x.salleId !== (old.salleId ?? null)) fail(400, 'Un matériel hors service ne peut aller qu’au stock.');
  // Date de mise hors service : fixée au passage hors service, conservée tant qu'il dure, retirée au retour en service
  if (!x.hs) delete x.dateHs;
  else if (old?.hs) { if (old.dateHs) x.dateHs = old.dateHs; else delete x.dateHs; }
  else x.dateHs = now;
  if (old) assert(old.idOrion === x.idOrion, 'Identifiant ORION immuable.');
  else x.idOrion = numeroMateriel(++numeros.materiel);
  // Installation physique : toute nouvelle affectation reste en cours (deplacement) jusqu'à la confirmation du
  // déplacement physique, qui devient le dernier déplacement confirmé (installation). Les deux sont tenus ici ;
  // le navigateur peut seulement retirer deplacement (confirmation, réservée au gestionnaire) et sa valeur d'installation est ignorée.
  // de : emplacement physique d'origine (null pour le stock), conservé si le matériel n'a pas encore bougé.
  const keepInstallation = () => { if (old?.installation) x.installation = old.installation; else delete x.installation; };
  if (!old) { delete x.deplacement; delete x.installation; } // un matériel déclaré ou importé est là où il est déclaré
  else if ((old.salleId ?? null) !== (x.salleId ?? null)) {
    const de = old.deplacement ? old.deplacement.de : old.salleId ?? null;
    if (de === (x.salleId ?? null)) { delete x.deplacement; keepInstallation(); } // retour à son emplacement physique
    else { x.deplacement = { de, at: now, par: actor.nom, parId: actor.id }; delete x.installation; }
  } else if (x.deplacement && !same(x.deplacement, old.deplacement)) fail(400, 'Le suivi du déplacement est tenu par le serveur.');
  else if (old.deplacement && !x.deplacement) {
    // Confirmation de l'installation : gestionnaire seul, dans ORION ou avec RIGEL ; les administrateurs initient et suivent (décision de l'utilisateur du 14 novembre)
    if (actor.role !== 'gestionnaire') fail(403, 'Confirmation de l’installation réservée au gestionnaire.');
    x.installation = { de: old.deplacement.de, at: now, par: actor.nom, parId: actor.id };
  }
  else keepInstallation();
}

/** Bâtiment en code capitales (salles, étages, règles d'un bâtiment) ; étage et niveau bornés */
export function regleLieu(c: CollectionName, x: LooseItem) {
  if (['salles', 'etages'].includes(c) || (c === 'regles' && x.portee === 'batiment')) x.batiment = batimentCode(x.batiment); // code en capitales, comme à la saisie
  if (c === 'salles') assert(typeof x.nom === 'string' && x.nom.trim() && typeof x.batiment === 'string' && x.batiment.trim() && Number.isInteger(x.etage ?? 0) && (x.etage ?? 0) >= -5 && (x.etage ?? 0) <= 30);
  if (c === 'etages') assert(Number.isInteger(x.niveau) && x.niveau! >= -5 && x.niveau! <= 30 && typeof x.batiment === 'string' && x.batiment.trim());
}
