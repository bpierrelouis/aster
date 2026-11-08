/* Éléments d'affichage partagés par plusieurs écrans. */
import { Icon } from '../ui/icons.jsx';
import { num } from '../core/format.js';
import { ETATS, statut } from '../core/catalog.js';
import { index, batimentLabel } from '../core/selectors.js';

/** État d'un matériel : icône seule */
export function EtatIcon({ m }) {
  const e = m.hs ? ETATS.hs : ETATS.ok;
  return <span className={`st st--${e.id}`} data-tip={e.label}><Icon name={e.icon} size={16} /></span>;
}

/** Pastille d'état d'un matériel : témoin + libellé */
export function EtatPill({ m }) {
  return <span className={`pill pill--${m.hs ? 'hs' : 'ok'}`}><span className={`led led--${m.hs ? 'hs' : 'ok'}`} />{m.hs ? 'Hors service' : 'En service'}</span>;
}

/** Pastille de statut d'une remontée */
export function StatutPill({ r }) {
  const s = statut(r.statut);
  return <span className={`pill pill--${s.id}`}><Icon name={s.icon} size={14} />{s.label}</span>;
}

/** Localisation d'un matériel : salle ou stock */
export function LieuChip({ m }) {
  const salle = m.salleId ? index().salle.get(m.salleId) : null;
  return salle
    ? <span className="chip chip--pin" data-tip={batimentLabel(salle.batiment)}><Icon name="pin" size={13} />{salle.nom}</span>
    : <span className="chip chip--stock" data-tip="Sans localisation"><Icon name="stockage" size={13} />Stock</span>;
}

/** Barre en service / hors service */
export function EtatBar({ c, thin = false }) {
  const seg = (id, n, label) => (n ? <span className={`sb-seg sb-seg--${id}`} style={{ flex: n }} data-tip={`${label} : ${num(n)}`} /> : null);
  return <div className={`sbar${thin ? ' sbar--thin' : ''}`} role="img" aria-label={`En service ${c.ok}, hors service ${c.hs}`}>
    {seg('ok', c.ok, 'En service')}{seg('hs', c.hs, 'Hors service')}
  </div>;
}

/** État vide des écrans Supervision et Administration */
export function OpsEmpty({ icon, title, text }) {
  return <div className="ops-empty glass"><Icon name={icon} size={36} /><h2>{title}</h2>{text && <p>{text}</p>}</div>;
}
