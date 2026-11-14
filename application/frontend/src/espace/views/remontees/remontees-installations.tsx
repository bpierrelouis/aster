/* ==========================================================================
   Remontées · backlog des installations du gestionnaire : une carte par
   salle, selon l'avancement de son installation physique
   (core/installations.ts). Une carte ouvre les déplacements de la salle, où
   chaque matériel se confirme (une action, un seul endroit).
   ========================================================================== */

import { Link } from 'react-router';
import { ago, plural } from '#shared/format.ts';
import { REMONTEE_PHASES } from '#shared/catalog.ts';
import { installations, resteAFaire } from '../../core/installations.ts';
import { batimentLabel } from '../../core/selectors.ts';
import { Progress } from '../../widgets/parts.tsx';
import { BoardColumn } from './remontees-backlog.tsx';
import type { SalleEnInstallation, SalleInstallee } from '../../core/installations.ts';
import type { RemonteePhase } from '#shared/types.ts';

// Mêmes phases que le backlog des remontées : en attente, en cours, terminées
const HINTS: Record<RemonteePhase, string> = {
  attente: 'Déplacements enregistrés, aucun encore confirmé',
  encours: 'Installation commencée',
  terminee: 'Salles équipées depuis moins de 30 jours',
};

function InstallationCard({ x }: { x: SalleEnInstallation | SalleInstallee }) {
  const done = !x.enCours.length;
  const detail = done
    ? plural(x.faits.length, 'matériel déplacé', 'matériels déplacés')
    : resteAFaire(x);
  return <li>
    <Link className="bl-card" to={done ? `/salles/salle/${x.salle.id}` : `/salles/deplacements?salle=${x.salle.id}`}>
      <span className="bl-card-top">
        <b className="bl-title"><span className="code-badge" data-tip={batimentLabel(x.salle.batiment)}>{x.salle.batiment}</span>{x.salle.nom}</b>
        <span className="rm-age" data-tip={done ? 'Fin de l’installation' : 'Premier déplacement enregistré'}>{ago((done ? x.fin : x.debut)!)}</span>
      </span>
      <Progress value={x.pct} label={`Avancement de l’installation de ${x.salle.nom}`} />
      <span className="bl-sub">{detail}</span>
    </Link>
  </li>;
}

/** Salles du périmètre, filtrées par bâtiment et par nom (barre d'outils du backlog) */
export function InstallationsBoard({ bat, query }: { bat: string; query: string }) {
  const { enCours, terminees } = installations();
  const q = query.trim().toLowerCase();
  const keep = (x: SalleEnInstallation | SalleInstallee) => (!bat || x.salle.batiment === bat) && (!q || x.salle.nom.toLowerCase().includes(q));
  const items = {
    attente: enCours.filter((x) => !x.faits.length && keep(x)),
    encours: enCours.filter((x) => x.faits.length && keep(x)),
    terminee: terminees.filter(keep),
  };
  return <div className="bl-board">
    {REMONTEE_PHASES.map((phase) => <BoardColumn key={phase.id} phase={phase} hint={HINTS[phase.id]} count={items[phase.id].length} noun="salle" empty="Aucune salle">
      {items[phase.id].map((x) => <InstallationCard key={x.salle.id} x={x} />)}
    </BoardColumn>)}
  </div>;
}
