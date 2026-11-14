/* ==========================================================================
   Accueil · cadre d'un widget du tableau (taille, retrait, édition) et
   galerie d'ajout.
   ========================================================================== */

import { useState } from 'react';
import { useStore } from '../../hooks/use-store.ts';
import { SIZES, KINDS, widgetDef, widgetsFor } from '../../widgets/catalog.tsx';
import { Icon } from '../../ui/icons.tsx';
import { useSheetClose } from '../../ui/overlays.tsx';
import type { CSSProperties, KeyboardEvent, MouseEvent, ReactNode } from 'react';
import type { Widget as WidgetItem, WidgetSize } from '#shared/types.ts';
import type { WidgetKind } from '../../widgets/catalog.tsx';

const SIZE_GLYPH: Record<WidgetSize, ReactNode> = {
  S: <rect x="7" y="4" width="8" height="8" rx="2" />,
  M: <rect x="2.5" y="4" width="17" height="8" rx="2" />,
  L: <rect x="4" y="1" width="14" height="14" rx="2.5" />,
  XL: <rect x="1" y="3" width="20" height="10" rx="2.5" />,
};
const SizeGlyph = ({ s }: { s: WidgetSize }) => <svg viewBox="0 0 22 16" width="22" height="16" fill="currentColor" aria-hidden="true">{SIZE_GLYPH[s]}</svg>;

/* ---------- Widget du tableau ---------- */

type WidgetProps = {
  w: WidgetItem; editing: boolean;
  onRemove: (e: MouseEvent<HTMLButtonElement>) => void;
  onSize: (e: MouseEvent<HTMLButtonElement>, size: WidgetSize) => void;
  onKeyDown: (e: KeyboardEvent<HTMLElement>) => void;
};

export function Widget({ w, editing, onRemove, onSize, onKeyDown }: WidgetProps) {
  const def = widgetDef(w.type)!; // dispositions déjà filtrées sur le catalogue (dashboard.tsx)
  const size = def.sizes.includes(w.size) ? w.size : def.sizes[0];
  const [jd] = useState(() => `${(Math.random() * -0.5).toFixed(2)}s`); // décalage de la respiration, fixe pour le widget
  return <article className={`widget widget--${def.kind}`} data-id={w.id} data-type={w.type} data-size={size}
    aria-label={`${def.title}, ${SIZES[size].label.toLowerCase()}`} tabIndex={editing ? 0 : undefined} onKeyDown={onKeyDown}>
    <div className="widget-inner" style={{ '--jd': jd } as CSSProperties}>
      <div className="widget-card glass">
        <div className="w-content"><def.Body size={size} /></div>
      </div>
      <button type="button" className="w-remove" aria-label={`Retirer ${def.title}`} tabIndex={editing ? 0 : -1} onClick={onRemove}>
        <Icon name="minus" size={16} stroke={3} />
      </button>
      {def.sizes.length > 1 && <div className="w-sizes glass glass--strong" role="group" aria-label="Taille">
        {def.sizes.map((s) => <button key={s} type="button" aria-pressed={s === size} aria-label={SIZES[s].label} data-tip={SIZES[s].label}
          tabIndex={editing ? 0 : -1} onClick={(e) => onSize(e, s)}><SizeGlyph s={s} /></button>)}
      </div>}
    </div>
  </article>;
}

/* ---------- Galerie d'ajout ---------- */

export function Gallery({ onAdd }: { onAdd: (type: string, size: WidgetSize) => void }) {
  useStore(); // aperçus à jour des données
  const close = useSheetClose();
  const available = widgetsFor();
  const [kind, setKind] = useState<WidgetKind>('kpi');
  const [chosen, setChosen] = useState(() => Object.fromEntries(available.map((w) => [w.type, w.sizes[0]])));
  const list = available.filter((w) => w.kind === kind);
  return <>
    <div className="seg seg--wide" role="tablist" aria-label="Catégories">
      {KINDS.filter((k) => available.some((w) => w.kind === k.id)).map((k) => (
        <button key={k.id} type="button" role="tab" className={`seg-btn${k.id === kind ? ' is-on' : ''}`} aria-selected={k.id === kind} onClick={() => setKind(k.id)}>
          <Icon name={k.icon} size={18} /><span>{k.label}</span>
        </button>
      ))}
    </div>
    <ul className="gallery">{list.map((w) => {
      const size = chosen[w.type];
      return <li key={w.type} className="gal-item">
        <div className={`gal-stage gal-stage--${size}`}>
          <div className="gal-scale">
            <article className={`widget widget--${w.kind} is-preview`} data-size={size} data-type={w.type}>
              <div className="widget-inner"><div className="widget-card glass"><div className="w-content"><w.Body size={size} /></div></div></div>
            </article>
          </div>
        </div>
        <div className="gal-meta">
          <b>{w.title}</b>
          <div className="gal-sizes" role="radiogroup" aria-label={`Taille de ${w.title}`}>
            {w.sizes.map((s) => <button key={s} type="button" role="radio" aria-checked={s === size} aria-label={SIZES[s].label} data-tip={SIZES[s].label}
              onClick={() => setChosen((c) => ({ ...c, [w.type]: s }))}><SizeGlyph s={s} /></button>)}
          </div>
          <button type="button" className="btn btn--primary btn--s" onClick={() => { close(); onAdd(w.type, size); }}><Icon name="plus" size={16} /><span>Ajouter</span></button>
        </div>
      </li>;
    })}</ul>
  </>;
}
