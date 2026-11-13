/* ==========================================================================
   Superpositions : sheet (dialog modal), popover ancré, confirmation, « île »
   - <Sheet> s'affiche là où il est rendu, ou via openSheet(<Sheet …/>) depuis
     un gestionnaire d'événement. Dans un sheet, useSheetClose() ou un élément
     [data-sheet-close] le ferment ; children et footer peuvent être des
     fonctions (close) => …
   - <OverlayHost> (une fois, dans l'espace) rend les sheets ouverts par
     openSheet et l'île de notification.
   ========================================================================== */

import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react';
import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { reduceMotion } from '../core/dom.ts';
import { Icon, Tile } from './icons.tsx';

/* --------------------------------------------------------------------------
   Sheets ouverts depuis le code
   -------------------------------------------------------------------------- */
/** Ferme le sheet ; true : action validée (formulaire enregistré, confirmation) */
export type SheetClose = (result?: boolean) => void;
/** Contenu ou pied d'un sheet : élément, ou fonction qui reçoit close */
export type SheetPart = ReactNode | ((close: SheetClose) => ReactNode);
export type SheetSize = 's' | 'm' | 'l';
/** Classe du bouton d'action : btn--primary ou btn--danger */
export type ButtonTone = 'primary' | 'danger';

interface OpenedSheet {
  id: number;
  node: ReactNode;
  closing: boolean;
}

let sheets: OpenedSheet[] = [];
let seq = 0;
const sheetSubs = new Set<() => void>();
const publish = (next: OpenedSheet[]) => { sheets = next; for (const fn of sheetSubs) fn(); };
const subscribeSheets = (fn: () => void) => { sheetSubs.add(fn); return () => sheetSubs.delete(fn); };

/** Ouvre un sheet (élément <Sheet>) ; renvoie une fonction qui le ferme. */
export function openSheet(node: ReactNode) {
  const id = ++seq;
  publish([...sheets, { id, node, closing: false }]);
  return () => publish(sheets.map((s) => (s.id === id ? { ...s, closing: true } : s)));
}

const SlotContext = createContext<{ closing: boolean; remove: () => void } | null>(null);
const CloseContext = createContext<SheetClose>(() => {});

/** Ferme le sheet qui contient le composant. */
export const useSheetClose = () => useContext(CloseContext);

export function Sheet({ title, lead = null, size = 'm', footer = null, children, onClose }: { title: string; lead?: ReactNode; size?: SheetSize; footer?: SheetPart; children?: SheetPart; onClose?: SheetClose }) {
  const ref = useRef<HTMLDialogElement>(null);
  const slot = useContext(SlotContext);
  const [shown, setShown] = useState(false);
  const closing = useRef(false);
  const pressedOutside = useRef(false); // un clic commencé dans le panneau (sélection de texte) ne ferme pas le sheet

  const close = useCallback((result?: boolean) => {
    if (closing.current) return;
    closing.current = true;
    setShown(false);
    const done = () => {
      if (ref.current?.open) ref.current.close();
      onClose?.(result);
      slot?.remove();
    };
    if (reduceMotion()) done(); else setTimeout(done, 220);
  }, [onClose, slot]);

  useLayoutEffect(() => {
    const dlg = ref.current!;
    dlg.showModal();
    const raf = requestAnimationFrame(() => setShown(true));
    return () => { cancelAnimationFrame(raf); if (dlg.open) dlg.close(); };
  }, []);

  useEffect(() => { if (slot?.closing) close(); }, [slot?.closing, close]);

  const render = (part: SheetPart) => (typeof part === 'function' ? part(close) : part);
  return createPortal(
    <CloseContext.Provider value={close}>
      <dialog ref={ref} className={`sheet sheet--${size}${shown ? ' is-open' : ''}`} aria-label={title}
        onCancel={(e) => { e.preventDefault(); close(); }}
        onPointerDown={(e) => { pressedOutside.current = e.target === ref.current; }}
        onClick={(e) => { if ((e.target === ref.current && pressedOutside.current) || (e.target as Element).closest('[data-sheet-close]')) close(); }}>
        <div className="sheet-panel glass glass--strong" data-lens="">
          <header className="sheet-head">
            {lead}
            <h2 className="sheet-title">{title}</h2>
            <button className="icon-btn" type="button" data-sheet-close="" aria-label="Fermer"><Icon name="close" size={20} /></button>
          </header>
          <div className="sheet-body">{render(children)}</div>
          {footer && <footer className="sheet-foot">{render(footer)}</footer>}
        </div>
      </dialog>
    </CloseContext.Provider>,
    document.body,
  );
}

/** Confirmation ; résout true si l'utilisateur confirme. */
export function confirmSheet({ title, message, confirm = 'Supprimer', tone = 'danger', iconName = 'trash' }: { title: string; message: ReactNode; confirm?: string; tone?: ButtonTone; iconName?: string }) {
  return new Promise<boolean>((resolve) => {
    let ok = false;
    openSheet(
      <Sheet title={title} size="s" lead={<Tile name={iconName} color="var(--crit)" />} onClose={() => resolve(ok)}
        footer={(close) => <>
          <button className="btn btn--ghost" type="button" data-sheet-close="">Annuler</button>
          <button className={`btn btn--${tone}`} type="button" onClick={() => { ok = true; close(true); }}>
            <Icon name={iconName} size={18} /><span>{confirm}</span>
          </button>
        </>}>
        <p className="sheet-text">{message}</p>
      </Sheet>,
    );
  });
}

/* --------------------------------------------------------------------------
   Popover ancré sur un élément (anchor : élément DOM). Popover natif : couche
   supérieure, Échap et clic extérieur gérés par le navigateur ; l'ancre en est
   la source, son clic ferme donc le popover sans le rouvrir.
   -------------------------------------------------------------------------- */
export function Popover({ anchor, label, onClose, align = 'end', className = '', children }: { anchor: HTMLElement; label: string; onClose: () => void; align?: 'start' | 'center' | 'end'; className?: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const escaped = useRef(false);

  const place = useCallback(() => {
    const pop = ref.current;
    if (!pop || !anchor) return;
    const a = anchor.getBoundingClientRect();
    const width = pop.offsetWidth; // taille réelle, indépendante de l’animation d’ouverture
    let left = align === 'end' ? a.right - width : align === 'center' ? a.left + a.width / 2 - width / 2 : a.left;
    left = Math.max(12, Math.min(innerWidth - width - 12, left));
    const top = Math.max(12, a.bottom + 10);
    // Les menus de la barre haute restent sous leur bouton quand leur contenu change.
    pop.style.maxHeight = `${Math.max(0, innerHeight - top - 12)}px`;
    pop.style.left = `${left}px`;
    pop.style.top = `${top}px`;
  }, [anchor, align]);

  // Position recalculée à chaque rendu : le contenu peut changer de taille
  useLayoutEffect(place);

  useLayoutEffect(() => {
    const pop = ref.current!;
    pop.showPopover({ source: anchor });
    place();
    anchor.setAttribute('aria-expanded', 'true');
    const observer = new ResizeObserver(place);
    observer.observe(pop);
    pop.querySelector<HTMLElement>('button, [tabindex], input')?.focus({ preventScroll: true });
    addEventListener('resize', place);
    return () => {
      observer.disconnect();
      removeEventListener('resize', place);
      anchor.setAttribute('aria-expanded', 'false');
      if (pop.matches(':popover-open')) pop.hidePopover();
    };
  }, [anchor, place]);

  return createPortal(
    <div ref={ref} popover="auto" className={`popover glass glass--strong ${className}`} role="dialog" aria-label={label}
      onKeyDown={(e) => { if (e.key === 'Escape') escaped.current = true; }}
      onToggle={(e) => {
        // React propage toggle dans l'arbre : ignorer celui d'un popover imbriqué (palette, liste de choix)
        if (e.target !== e.currentTarget || e.newState !== 'closed') return;
        if (escaped.current) anchor.focus({ preventScroll: true });
        onClose();
      }}>{children}</div>,
    document.body,
  );
}

/* --------------------------------------------------------------------------
   « Île » : confirmations brèves
   -------------------------------------------------------------------------- */
let island: { n: number; message: string; icon: string; tone: NotifyTone } = { n: 0, message: '', icon: 'check', tone: 'ok' };
const islandSubs = new Set<() => void>();
const subscribeIsland = (fn: () => void) => { islandSubs.add(fn); return () => islandSubs.delete(fn); };
const TONES = { ok: 'var(--ok)', warn: 'var(--warn)', danger: 'var(--crit)', info: 'var(--c1)' };
export type NotifyTone = keyof typeof TONES;

export function notify(message: string, { icon = 'check', tone = 'ok' }: { icon?: string; tone?: NotifyTone } = {}) {
  island = { n: island.n + 1, message, icon, tone };
  for (const fn of islandSubs) fn();
}

function Island() {
  const current = useSyncExternalStore(subscribeIsland, () => island);
  const [on, setOn] = useState(false);
  useEffect(() => {
    if (!current.n) return undefined;
    setOn(false);
    const raf = requestAnimationFrame(() => setOn(true));
    const timer = setTimeout(() => setOn(false), 2600);
    return () => { cancelAnimationFrame(raf); clearTimeout(timer); };
  }, [current]);
  return <div className={`island glass glass--strong${on ? ' is-on' : ''}`} data-lens="strong" role="status" aria-live="polite">
    {current.n > 0 && <><Tile name={current.icon} color={TONES[current.tone]} size="s" /><span className="island-text">{current.message}</span></>}
  </div>;
}

export function OverlayHost() {
  const list = useSyncExternalStore(subscribeSheets, () => sheets);
  return <>
    {list.map((s) => (
      <SlotContext.Provider key={s.id} value={{ closing: s.closing, remove: () => publish(sheets.filter((x) => x.id !== s.id)) }}>
        {s.node}
      </SlotContext.Provider>
    ))}
    <Island />
  </>;
}
