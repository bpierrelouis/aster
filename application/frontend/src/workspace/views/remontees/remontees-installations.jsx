/* ==========================================================================
   Remontées · backlog des installations du gestionnaire : une carte par
   salle, selon l'avancement de son installation physique
   (core/installations.js). Une carte ouvre les déplacements de la salle, où
   chaque matériel se confirme (une action, un seul endroit).
   ========================================================================== */

import { Link } from 'react-router';
import { ago, num } from '#shared/format.js';
import { REMONTEE_PHASES } from '#shared/catalog.js';
import { installations } from '../../core/installations.js';
import { batimentLabel } from '../../core/selectors.js';
import { Progress } from '../../widgets/parts.jsx';
import { resteAFaire } from '../salles/installation.jsx';
import { BoardColumn } from './remontees-backlog.jsx';

// Mêmes phases que le backlog des remontées : en attente, en cours, terminées
const HINTS = {
  attente: 'Déplacements enregistrés, aucun encore confirmé',
  encours: 'Installation commencée',
  terminee: 'Salles équipées depuis moins de 30 jours',
};

function InstallationCard({ x }) {
  const done = !x.enCours.length;
  const detail = done
    ? `${num(x.faits.length)} matériel${x.faits.length > 1 ? 's' : ''} déplacé${x.faits.length > 1 ? 's' : ''}`
    : resteAFaire(x);
  return <li>
    <Link className="bl-card" to={done ? `/salles/salle/${x.salle.id}` : `/salles/deplacements?salle=${x.salle.id}`}>
      <span className="bl-card-top">
        <b className="bl-title"><span className="code-badge" data-tip={batimentLabel(x.salle.batiment)}>{x.salle.batiment}</span>{x.salle.nom}</b>
        <span className="rm-age" data-tip={done ? 'Fin de l’installation' : 'Premier déplacement enregistré'}>{ago(done ? x.fin : x.debut)}</span>
      </span>
      <Progress value={x.pct} label={`Avancement de l’installation de ${x.salle.nom}`} />
      <span className="bl-sub">{detail}</span>
    </Link>
  </li>;
}

/** Salles du périmètre, filtrées par bâtiment et par nom (barre d'outils du backlog) */
export function InstallationsBoard({ bat, query }) {
  const { enCours, terminees } = installations();
  const q = query.trim().toLowerCase();
  const keep = (x) => (!bat || x.salle.batiment === bat) && (!q || x.salle.nom.toLowerCase().includes(q));
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
