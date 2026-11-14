/* ==========================================================================
   Installation physique : point d'un matériel (orange en cours, vert
   installé) et confirmation du déplacement. Le point orange n'est cliquable
   que pour le gestionnaire, seul à confirmer une installation (ici ou avec
   RIGEL) ; les administrateurs la suivent (décision du 14 novembre).
   ========================================================================== */

import { notify } from '../../ui/overlays.tsx';
import { store } from '../../core/store.ts';
import { can, why } from '../../core/permissions.ts';
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

/** Point d'installation d'un matériel (vert une fois à sa place, en salle ou rangé au stock) ; en cours, il confirme le déplacement au clic du gestionnaire */
export function InstallDot({ m }: { m: Materiel }) {
  const l = logistique(m);
  if (l.tone !== 'wait' || !can('installation.confirm')) {
    const label = l.tone === 'none' ? 'Rangé au stock' : l.label;
    // En cours, pour un administrateur qui suit sans confirmer : qui confirme (le formateur ne voit que l'état)
    if (l.tone === 'wait' && can('materiel.move')) return <span className="inst-dot inst-dot--wait" role="img" aria-label={`${label}, ${why('installation.confirm').toLowerCase()}`} data-tip-title={label} data-tip={why('installation.confirm')} />;
    return <span className={`inst-dot inst-dot--${l.tone === 'wait' ? 'wait' : 'ok'}`} role="img" aria-label={label} data-tip={label} />;
  }
  const action = `Marquer ${l.done}`;
  return <button type="button" className="inst-dot inst-dot--wait" aria-label={`${l.label} : ${action.toLowerCase()}`} data-tip-title={l.label} data-tip={action}
    onClick={(e) => { e.stopPropagation(); confirmerInstallation(m); }} />;
}
