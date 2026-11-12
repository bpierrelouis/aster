/* ==========================================================================
   Remontées · backlog des remontées du gestionnaire : avancement de son
   travail, une colonne par phase (en attente, en cours, terminées). Une
   carte ouvre le détail, où se trouvent les actions (une action, un seul
   endroit). Terminées : celles des 30 derniers jours seulement. La colonne
   sert aussi au backlog des installations, avec les mêmes phases.
   ========================================================================== */

import { Link } from 'react-router';
import { Icon } from '../../ui/icons.tsx';
import { usePeek } from '../../ui/peek.ts';
import { num, plural, ago } from '#shared/format.ts';
import { REMONTEE_PHASES, TERMINEES_RECENTES, phaseOf, problem } from '#shared/catalog.ts';
import { remonteeContext } from '../../core/selectors.ts';
import { LieuChip, StatutPill } from '../../widgets/parts.tsx';
import type { ReactNode } from 'react';
import type { Id, Remontee, RemonteePhase } from '#shared/types.ts';

const lastChange = (r: Remontee) => r.historique.at(-1)?.at ?? r.createdAt;
const shown = (r: Remontee, now: number) => phaseOf(r) !== 'terminee' || lastChange(r) > now - TERMINEES_RECENTES;
// À traiter : les plus anciennes d'abord ; terminées : les plus récentes d'abord
const ORDER: Record<RemonteePhase, (a: Remontee, b: Remontee) => number> = {
  attente: (a, b) => a.createdAt - b.createdAt,
  encours: (a, b) => a.createdAt - b.createdAt,
  terminee: (a, b) => lastChange(b) - lastChange(a),
};

function BacklogCard({ r, selected }: { r: Remontee; selected: boolean }) {
  const { first } = remonteeContext(r);
  const p = problem(r.probleme);
  return <li>
    <Link className={`bl-card${selected ? ' is-selected' : ''}`} to={`/remontees/backlog/${r.id}`} aria-current={selected ? 'true' : 'false'}>
      <span className="bl-card-top">
        <span className="row-meta">{r.id}</span>
        {phaseOf(r) === 'terminee' && <StatutPill r={r} />}
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

/** Colonne d'un backlog (remontées, installations) : phase (titre, icône et couleur), nombre, aide, cartes ; noun : nom des cartes, au singulier */
export function BoardColumn({ phase, hint, count, noun, empty, children }: { phase: (typeof REMONTEE_PHASES)[number]; hint: string; count: number; noun: string; empty: string; children: ReactNode }) {
  const scroll = usePeek('.bl-col');
  return <section className={`bl-col glass bl-col--${phase.id}`} aria-label={`${phase.label}, ${plural(count, noun)}`}>
    <header className="bl-head">
      <span className={`pill-ico pill-ico--${phase.id}`}><Icon name={phase.icon} size={14} /></span>
      <b>{phase.label}</b>
      <span className="bl-count">{num(count)}</span>
    </header>
    <p className="bl-hint">{hint}</p>
    <div ref={scroll} className="bl-scroll">
      {count ? <ul className="bl-list">{children}</ul> : <div className="w-empty"><span>{empty}</span></div>}
    </div>
  </section>;
}

export function Backlog({ list, selId }: { list: Remontee[]; selId: Id | null }) {
  const now = Date.now();
  return <div className="bl-board">
    {REMONTEE_PHASES.map((phase) => {
      const items = list.filter((r) => phaseOf(r) === phase.id && shown(r, now)).sort(ORDER[phase.id]);
      const hint = phase.id === 'terminee' ? `${phase.hint}, depuis moins de 30 jours` : phase.hint;
      return <BoardColumn key={phase.id} phase={phase} hint={hint} count={items.length} noun="remontée" empty="Aucune remontée">
        {items.map((r) => <BacklogCard key={r.id} r={r} selected={r.id === selId} />)}
      </BoardColumn>;
    })}
  </div>;
}
