/* ==========================================================================
   Salles · déplacements (installation physique). Une affectation enregistrée
   dans ORION reste en cours tant que le déplacement physique n'est pas
   confirmé (règle tenue par le serveur). Une carte par trajet vers une salle
   (du stock ou d'une autre salle) avec son avancement, et une seule carte pour
   tous les matériels à ramener au stock, quelle que soit leur salle d'origine
   (décision de l'utilisateur du 14 novembre). Le point orange d'un matériel
   confirme son déplacement ; « Terminer le restockage » les confirme tous en
   une écriture (gestionnaire seul ; les administrateurs suivent).
   L'installation d'une salle avec un téléphone (RIGEL) se lance sur le
   premier trajet qui y arrive : QR codes d'appairage, de la salle et du stock
   (gestionnaire seul). ?salle= limite l'écran à une salle.
   ========================================================================== */

import { Link, Navigate, useSearchParams } from 'react-router';
import { Icon } from '../../ui/icons.tsx';
import { useStore } from '../../hooks/use-store.ts';
import { useTitle } from '../../hooks/use-title.ts';
import { can } from '../../core/permissions.ts';
import { index, batimentLabel } from '../../core/selectors.ts';
import { installations, lieuNom } from '../../core/installations.ts';
import { ago, plural } from '#shared/format.ts';
import { confirmSheet } from '../../ui/overlays.tsx';
import { openInstallation } from '../recensement/recensement-sheets.tsx';
import { GroupCard, GroupGrid, PageHead, Progress } from '../../widgets/parts.tsx';
import { InstallDot, confirmerDeplacements } from './salles-installation.tsx';
import type { Trajet } from '../../core/installations.ts';
import type { Materiel } from '#shared/types.ts';

/** Matériel d'un trajet ; origine : salle de départ affichée (carte du stock, qui réunit plusieurs origines) */
function MoveRow({ m, origine = false }: { m: Materiel; origine?: boolean }) {
  const pending = Boolean(m.deplacement);
  const trace = (m.deplacement ?? m.installation)!;
  return <li><div className={`row${pending ? '' : ' is-done'}`}>
    <InstallDot m={m} />
    <span className="row-main"><span className="row-title">{m.modele}</span>
      <span className="row-sub"><span className="row-meta">{m.idOrion}</span>{origine && <span className="row-meta">Depuis {lieuNom(trace.de)}</span>}<span className="row-meta">{pending ? 'Affecté' : m.salleId ? 'Installé' : 'Rangé'} par {trace.par}</span></span></span>
    <span className="row-when">{ago(trace.at)}</span>
  </div></li>;
}

/** Carte d'un trajet vers une salle : d'où vers où, avancement, matériels en cours puis installés ; installer : action du téléphone */
function RouteCard({ t, installer }: { t: Trajet; installer: boolean }) {
  const salle = index().salle.get(t.vers!);
  const [de, vers] = [lieuNom(t.de), lieuNom(t.vers)];
  return <GroupCard title={<>{de}<Icon name="chevR" size={16} className="route-arrow" />{vers}</>}
    label={`${de} vers ${vers}`} sub={`${salle ? batimentLabel(salle.batiment) : ''} · ${plural(t.enCours.length, 'matériel')} à installer`}
    action={installer && salle ? <button className="btn btn--ghost btn--s" type="button" aria-label={`Installer ${salle.nom} avec un téléphone`} onClick={() => openInstallation(salle)}><Icon name="tablet" size={16} />Installer avec un téléphone</button> : null}
    extra={<Progress value={t.pct} label={`Avancement du trajet ${de} vers ${vers}`} />}>
    {[...t.enCours, ...t.faits].map((m) => <MoveRow key={m.id} m={m} />)}
  </GroupCard>;
}

/** Tous les matériels à ramener au stock, quelle que soit leur salle d'origine */
function StockCard({ trajets }: { trajets: Trajet[] }) {
  const enCours = trajets.flatMap((t) => t.enCours);
  const faits = trajets.flatMap((t) => t.faits);
  const titre = `${plural(enCours.length, 'matériel')} à ramener au stock`;
  async function terminer() {
    if (!await confirmSheet({ title: 'Terminer le restockage', message: `Confirmer que ${plural(enCours.length, 'matériel est rangé', 'matériels sont rangés')} au stock ?`, confirm: 'Terminer', tone: 'primary', iconName: 'check' })) return;
    await confirmerDeplacements(enCours, `${plural(enCours.length, 'matériel rangé', 'matériels rangés')} au stock`);
  }
  return <GroupCard title={titre} label="Retour au stock" sub={plural(trajets.length, 'salle d’origine', 'salles d’origine')}
    action={can('installation.confirm') && enCours.length ? <button className="btn btn--ghost btn--s" type="button" onClick={terminer}><Icon name="check" size={16} />Terminer le restockage</button> : null}
    extra={<Progress value={faits.length / (enCours.length + faits.length)} label="Avancement du retour au stock" />}>
    {[...enCours, ...faits].map((m) => <MoveRow key={m.id} m={m} origine />)}
  </GroupCard>;
}

export function Deplacements() {
  useTitle('Déplacements');
  useStore();
  const [query] = useSearchParams();
  if (!can('materiel.move')) return <Navigate to="/salles" replace />;
  const only = query.get('salle');
  const routes = installations().routes.filter((t) => !only || t.vers === only || t.de === only);
  const versSalles = routes.filter((t) => t.vers);
  const versStock = routes.filter((t) => !t.vers);
  const n = routes.reduce((sum, t) => sum + t.enCours.length, 0);
  // Installation avec un téléphone : une seule action par salle, sur son premier trajet à l'arrivée (gestionnaire seul)
  const premiers = new Set(can('materiel.recensement') ? versSalles.filter((t, i) => versSalles.findIndex((x) => x.vers === t.vers) === i) : []);
  const cartes: (Trajet | 'stock')[] = [...versSalles, ...(versStock.length ? ['stock' as const] : [])];
  const poids = (t: Trajet) => t.enCours.length + t.faits.length;
  return <div className="group-view">
    <PageHead title="Déplacements" />
    <p className="group-lead">
      {only ? <>{lieuNom(only)} · <Link to="/salles/deplacements">tous les déplacements</Link> · </> : null}
      {n ? `${plural(n, 'matériel')} à déplacer` : null}
    </p>
    {cartes.length
      ? <GroupGrid items={cartes} weight={(c) => 3 + Math.min(12, c === 'stock' ? versStock.reduce((x, t) => x + poids(t), 0) : poids(c))}
        render={(c) => (c === 'stock' ? <StockCard key="stock" trajets={versStock} /> : <RouteCard key={`${c.de}>${c.vers}`} t={c} installer={premiers.has(c)} />)} />
      : <div className="w-empty w-empty--l glass group-empty"><Icon name="checkCircle" size={32} /><span>Aucun déplacement à faire : chaque matériel est à sa place.</span></div>}
  </div>;
}
