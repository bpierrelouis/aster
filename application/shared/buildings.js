/* ==========================================================================
   Bâtiments : information portée par chaque salle (RG-02), sans entité
   autonome. Fonctions pures, partagées avec les tests du serveur.
   ========================================================================== */

/** Saisie d'un bâtiment : code court en capitales (ex. C) */
export const batimentCode = (value) => String(value ?? '').trim().toUpperCase();

/**
 * Renomme le bâtiment d'une école : ses salles, ses étages et les règles de
 * processus de portée bâtiment prennent le nouveau nom. Un nom déjà utilisé
 * dans l'école fusionnerait deux bâtiments : il est refusé.
 */
export function renameBuilding(state, { ecoleId, batiment }, value) {
  const nom = batimentCode(value);
  if (!nom) throw Error('Renseignez le nom du bâtiment.');
  if (nom === batiment) return;
  if (state.salles.some((x) => x.ecoleId === ecoleId && x.batiment === nom)) throw Error(`Le bâtiment ${nom} existe déjà dans cette école.`);
  const renamed = (x) => x.ecoleId === ecoleId && x.batiment === batiment;
  for (const x of state.salles) if (renamed(x)) x.batiment = nom;
  for (const x of state.etages ?? []) if (renamed(x)) x.batiment = nom;
  for (const x of state.regles ?? []) if (x.portee === 'batiment' && renamed(x)) x.batiment = nom;
}
