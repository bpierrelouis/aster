/* ==========================================================================
   Installation physique : point d'un matériel (orange en cours, vert
   installé) et confirmation du déplacement. Le point orange est cliquable
   pour le gestionnaire ; le scanner le fera passer au vert automatiquement
   une fois validé par le client (cadrage § 23).
   ========================================================================== */

import { notify } from '../../ui/overlays.tsx';
import { store } from '../../core/store.ts';
import { can } from '../../core/permissions.ts';
import { traceProvisoire } from '../../core/selectors.ts';
import { logistique } from '#shared/catalog.ts';
import type { Materiel } from '#shared/types.ts';

/** Confirme le déplacement physique d'un matériel ; le serveur enregistre l'installation (valeur provisoire affichée sans attendre) */
async function confirmerInstallation(m: Materiel) {
  store.update('data', (s) => {
    const x = s.materiels.find((y) => y.id === m.id);
    if (!x?.deplacement) return;
    x.installation = { de: x.deplacement.de, ...traceProvisoire() };
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
