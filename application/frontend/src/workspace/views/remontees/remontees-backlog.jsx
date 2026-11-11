/* ==========================================================================
   Remontées · backlog des remontées du gestionnaire : avancement de son
   travail, une colonne par phase (en attente, en cours, traitées, validées).
   Une carte ouvre le détail, où se trouvent les actions (une action, un seul
   endroit). Validées : celles du dernier mois seulement. La colonne sert
   aussi au backlog des installations.
   ========================================================================== */

import { Link } from 'react-router';
import { Icon } from '../../ui/icons.jsx';
import { usePeek } from '../../ui/peek.js';
import { num, plural, ago, DAY } from '#shared/format.js';
import { REMONTEE_PHASES, phaseOf, problem } from '#shared/catalog.js';
import { remonteeContext } from '../../core/selectors.js';
import { LieuChip, StatutPill } from '../../widgets/parts.jsx';

const lastChange = (r) => r.historique.at(-1)?.at ?? r.createdAt;
const MONTH = 30 * DAY;
const shown = (r, now) => phaseOf(r) !== 'validee' || lastChange(r) > now - MONTH; // validées : le dernier mois
// À traiter : les plus anciennes d'abord ; traitées et validées : les plus récentes d'abord
const ORDER = {
  attente: (a, b) => a.createdAt - b.createdAt,
  encours: (a, b) => a.createdAt - b.createdAt,
  traitee: (a, b) => lastChange(b) - lastChange(a),
  validee: (a, b) => lastChange(b) - lastChange(a),
};

function BacklogCard({ r, selected }) {
  const { first } = remonteeContext(r);
  const p = problem(r.probleme);
  return <li>
    <Link className={`bl-card${selected ? ' is-selected' : ''}`} to={`/remontees/backlog/${r.id}`} aria-current={selected ? 'true' : 'false'}>
      <span className="bl-card-top">
        <span className="row-meta">{r.id}</span>
        {phaseOf(r) === 'traitee' && <StatutPill r={r} />}
        <span className="rm-age" data-tip="Dernier changement">{ago(lastChange(r))}</span>
      </span>
      <b className="bl-title"><Icon name={p.icon} size={16} />{p.label}</b>
      <span className="bl-sub">
        <LieuChip m={first ?? {}} />
        <span className="bl-author"><Icon name="user" size={13} />{r.auteur}</span>
      </span>
    </Link>
  </li>;
}

/** Colonne d'un backlog (remontées, installations) : titre, nombre, aide, cartes ; tone : couleur de l'icône ; noun : nom des cartes, au singulier */
export function BoardColumn({ id, tone, icon, label, hint, count, noun, empty, children }) {
  const scroll = usePeek('.bl-col');
  return <section className={`bl-col glass bl-col--${id}`} aria-label={`${label}, ${plural(count, noun)}`}>
    <header className="bl-head">
      <span className={`pill-ico pill-ico--${tone}`}><Icon name={icon} size={14} /></span>
      <b>{label}</b>
      <span className="bl-count">{num(count)}</span>
    </header>
    <p className="bl-hint">{hint}</p>
    <div ref={scroll} className="bl-scroll">
      {count ? <ul className="bl-list">{children}</ul> : <div className="w-empty"><span>{empty}</span></div>}
    </div>
  </section>;
}

export function Backlog({ list, selId }) {
  const now = Date.now();
  return <div className="bl-board">
    {REMONTEE_PHASES.map((phase) => {
      const items = list.filter((r) => phaseOf(r) === phase.id && shown(r, now)).sort(ORDER[phase.id]);
      const hint = phase.id === 'validee' ? `${phase.hint}, depuis moins d’un mois` : phase.hint;
      return <BoardColumn key={phase.id} id={phase.id} tone={phase.id} icon={phase.icon} label={phase.label} hint={hint} count={items.length} noun="remontée" empty="Aucune remontée">
        {items.map((r) => <BacklogCard key={r.id} r={r} selected={r.id === selId} />)}
      </BoardColumn>;
    })}
  </div>;
}
