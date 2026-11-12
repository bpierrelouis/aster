/* ==========================================================================
   Installation physique : point d'un matériel (orange en cours, vert
   installé), confirmation du déplacement et libellés communs aux écrans
   (lieu, reste à faire). Le point orange est cliquable pour le
   gestionnaire ; le scanner le fera passer au vert automatiquement une fois
   validé par le client (cadrage § 23).
   ========================================================================== */

import { notify } from '../../ui/overlays.tsx';
import { store, me } from '../../core/store.ts';
import { can } from '../../core/permissions.ts';
import { index } from '../../core/selectors.ts';
import { logistique } from '#shared/catalog.ts';
import { num } from '#shared/format.ts';
import type { SalleEnInstallation } from '../../core/installations.ts';
import type { Id, Materiel } from '#shared/types.ts';

/** Nom d'un lieu : salle, ou stock (id null) */
export const lieuNom = (salleId: Id | null | undefined) => (salleId ? index().salle.get(salleId)?.nom ?? 'Salle supprimée' : 'Stock');

/** Reste à faire dans une salle en cours d'installation (core/installations.ts) : « 3 à installer · 1 à retirer » */
export const resteAFaire = (x: Pick<SalleEnInstallation, 'aInstaller' | 'aRetirer'>) => [x.aInstaller.length && `${num(x.aInstaller.length)} à installer`, x.aRetirer.length && `${num(x.aRetirer.length)} à retirer`]
  .filter(Boolean).join(' · ');

/** Confirme le déplacement physique d'un matériel ; le serveur enregistre l'installation (valeur provisoire affichée sans attendre) */
async function confirmerInstallation(m: Materiel) {
  store.update('data', (s) => {
    const x = s.materiels.find((y) => y.id === m.id);
    if (!x?.deplacement) return;
    x.installation = { de: x.deplacement.de, at: Date.now(), par: me().nom, parId: me().id };
    delete x.deplacement;
  });
  try { await store.flush(); } catch { return; }
  notify(`${m.idOrion} ${logistique(m).done}`, { icon: 'check', tone: 'ok' });
}

/** Point d'installation d'un matériel (vert une fois à sa place, en salle ou rangé au stock) ; en cours et modifiable, il confirme le déplacement au clic */
export function InstallDot({ m }: { m: Materiel }) {
  const l = logistique(m);
  if (l.tone !== 'wait' || !can('materiel.move')) {
    const label = l.tone === 'none' ? 'Rangé au stock' : l.label;
    return <span className={`inst-dot inst-dot--${l.tone === 'wait' ? 'wait' : 'ok'}`} role="img" aria-label={label} data-tip={label} />;
  }
  const action = `Marquer ${l.done}`;
  return <button type="button" className="inst-dot inst-dot--wait" aria-label={`${l.label} : ${action.toLowerCase()}`} data-tip-title={l.label} data-tip={action}
    onClick={(e) => { e.stopPropagation(); confirmerInstallation(m); }} />;
}
