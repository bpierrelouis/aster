/* ==========================================================================
   Salles · déplacements (installation physique). Une affectation enregistrée
   dans ORION reste en cours tant que le déplacement physique n'est pas
   confirmé (règle tenue par le serveur). Une carte par trajet (du stock vers
   une salle, d'une salle à une autre, d'une salle vers le stock) avec son
   avancement ; le point orange d'un matériel le confirme. ?salle= limite
   l'écran à une salle.
   ========================================================================== */

import { Link, Navigate, useSearchParams } from 'react-router';
import { Icon } from '../../ui/icons.jsx';
import { useStore } from '../../hooks/use-store.js';
import { useTitle } from '../../hooks/use-title.js';
import { can } from '../../core/permissions.js';
import { index, batimentLabel } from '../../core/selectors.js';
import { installations } from '../../core/installations.js';
import { ago, plural } from '#shared/format.js';
import { GroupCard, GroupGrid, PageHead, Progress } from '../../widgets/parts.jsx';
import { InstallDot, lieuNom } from './installation.jsx';


function MoveRow({ m }) {
  const pending = Boolean(m.deplacement);
  const trace = m.deplacement ?? m.installation;
  return <li><div className={`row${pending ? '' : ' is-done'}`}>
    <InstallDot m={m} />
    <span className="row-main"><span className="row-title">{m.modele}</span>
      <span className="row-sub"><span className="row-meta">{m.idOrion}</span><span className="row-meta">{pending ? 'Affecté' : m.salleId ? 'Installé' : 'Rangé'} par {trace.par}</span></span></span>
    <span className="row-when">{ago(trace.at)}</span>
  </div></li>;
}

/** Carte d'un trajet : d'où vers où, avancement, matériels en cours puis installés */
function RouteCard({ t }) {
  const salle = t.vers ? index().salle.get(t.vers) : null;
  const [de, vers] = [lieuNom(t.de), lieuNom(t.vers)];
  const where = salle ? batimentLabel(salle.batiment) : 'Retour au stock';
  const reste = `${plural(t.enCours.length, 'matériel')} ${t.vers ? 'à installer' : 'à rapatrier'}`;
  return <GroupCard title={<>{de}<Icon name="chevR" size={16} className="route-arrow" />{vers}</>}
    label={`${de} vers ${vers}`} sub={`${where} · ${reste}`}
    extra={<Progress value={t.pct} label={`Avancement du trajet ${de} vers ${vers}`} />}>
    {[...t.enCours, ...t.faits].map((m) => <MoveRow key={m.id} m={m} />)}
  </GroupCard>;
}

export function Deplacements() {
  useTitle('Déplacements');
  useStore();
  const [query] = useSearchParams();
  if (!can('materiel.move')) return <Navigate to="/salles" replace />;
  const only = query.get('salle');
  const routes = installations().routes.filter((t) => !only || t.vers === only || t.de === only);
  const n = routes.reduce((sum, t) => sum + t.enCours.length, 0);
  return <div className="group-view">
    <PageHead title="Déplacements" />
    <p className="group-lead">
      {only ? <>{lieuNom(only)} · <Link to="/salles/deplacements">tous les déplacements</Link> · </> : null}
      {n ? `${plural(n, 'matériel')} à déplacer` : null}
    </p>
    {routes.length
      ? <GroupGrid items={routes} weight={(t) => 3 + Math.min(12, t.enCours.length + t.faits.length)} render={(t) => <RouteCard key={`${t.de}>${t.vers}`} t={t} />} />
      : <div className="w-empty w-empty--l glass group-empty"><Icon name="checkCircle" size={32} /><span>Aucun déplacement à faire : chaque matériel est à sa place.</span></div>}
  </div>;
}
