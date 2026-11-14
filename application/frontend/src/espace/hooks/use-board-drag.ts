/* ==========================================================================
   Glisser-déposer des widgets d'un tableau de bord (views/dashboard).
   - En mode édition, un glisser de plus de 5 px déplace le widget ; hors
     édition, un appui long (480 ms) active l'édition et commence le glisser.
   - Pendant le glisser, l'ordre provisoire suit le widget survolé (FLIP) et
     la page défile près des bords ; au lâcher, l'ordre est enregistré.
   ========================================================================== */

import { useEffect, useRef } from 'react';
import { flushSync } from 'react-dom';
import { flip, reduceMotion, $$ } from '../core/dom.ts';
import type { PointerEvent, RefObject } from 'react';

/** Appui en cours (avant un glisser) */
type Press = { el: HTMLElement; x: number; y: number; pointerId: number; timer: number };
/** Glisser en cours ; raf : défilement automatique */
type Drag = { el: HTMLElement; grabX: number; grabY: number; lastTarget: HTMLElement | null; raf?: number; px: number; py: number };

/** Déplace l'élément d'indice from à l'indice to (copie). */
export const move = <T,>(list: T[], from: number, to: number) => { const next = [...list]; next.splice(to, 0, ...next.splice(from, 1)); return next; };

/**
 * board : grille des widgets (.widget, data-id) ; editing : mode édition ; startEditing : l'active (appui long) ;
 * setOrder : ordre provisoire (identifiants) pendant le glisser, null ensuite ; saveOrder : enregistre l'ordre final.
 * Renvoie les gestionnaires d'événements de la grille.
 */
export function useBoardDrag({ board, editing, startEditing, setOrder, saveOrder }: {
  board: RefObject<HTMLElement | null>;
  editing: boolean;
  startEditing: () => void;
  setOrder: (ids: string[] | null) => void;
  saveOrder: (ids: string[]) => void;
}) {
  const press = useRef<Press>(null);
  const drag = useRef<Drag>(null);
  const widgets = () => $$('.widget', board.current!);
  const layoutPos = (el: HTMLElement) => ({ x: el.offsetLeft, y: el.offsetTop, w: el.offsetWidth, h: el.offsetHeight });

  function placeDragged() {
    const { el, grabX, grabY, px, py } = drag.current!;
    const br = board.current!.getBoundingClientRect();
    const p = layoutPos(el);
    el.style.transform = `translate(${px - grabX - (br.left + p.x)}px, ${py - grabY - (br.top + p.y)}px) scale(1.03)`;
  }

  function autoScroll() {
    const d = drag.current;
    if (!d) return;
    const edge = 90;
    const speed = d.py < edge ? -(edge - d.py) / 4 : d.py > innerHeight - edge ? (d.py - (innerHeight - edge)) / 4 : 0;
    if (speed) { scrollBy(0, speed); placeDragged(); }
    d.raf = requestAnimationFrame(autoScroll);
  }

  function startDrag(el: HTMLElement, x: number, y: number) {
    const p = layoutPos(el);
    const br = board.current!.getBoundingClientRect();
    drag.current = { el, grabX: x - (br.left + p.x), grabY: y - (br.top + p.y), lastTarget: null, px: x, py: y };
    el.classList.add('is-dragging');
    board.current!.classList.add('has-drag');
    navigator.vibrate?.(8);
    autoScroll();
  }

  function hitTest() {
    const d = drag.current!;
    const br = board.current!.getBoundingClientRect();
    const x = d.px - br.left, y = d.py - br.top;
    let target: HTMLElement | null = null;
    for (const w of widgets()) {
      if (w === d.el) continue;
      const p = layoutPos(w);
      if (x >= p.x && x <= p.x + p.w && y >= p.y && y <= p.y + p.h) { target = w; break; }
    }
    if (!target) { d.lastTarget = null; return; }
    if (target === d.lastTarget) return;
    d.lastTarget = target;
    const all = widgets();
    const next = move(all.map((w) => w.dataset.id!), all.indexOf(d.el), all.indexOf(target));
    flip(all, () => flushSync(() => setOrder(next)), { skip: d.el, duration: 320 });
    placeDragged();
  }

  function endDrag() {
    const { el, raf } = drag.current!;
    cancelAnimationFrame(raf!); // posé par autoScroll dès startDrag
    const from = el.style.transform;
    el.style.transform = '';
    el.classList.remove('is-dragging');
    board.current!.classList.remove('has-drag');
    if (!reduceMotion() && from) {
      el.animate([{ transform: from }, { transform: 'none' }], { duration: 360, easing: 'cubic-bezier(.34,1.3,.64,1)' });
    }
    drag.current = null;
    saveOrder(widgets().map((w) => w.dataset.id!));
    setOrder(null);
  }

  function onPointerDown(e: PointerEvent<HTMLElement>) {
    if (e.button !== 0) return;
    const target = e.target as Element;
    const el = target.closest<HTMLElement>('.widget');
    if (!el || target.closest('.w-remove, .w-sizes')) return;
    if (!editing && target.closest('button, .chart-host, .table')) return;
    const p: Press = { el, x: e.clientX, y: e.clientY, pointerId: e.pointerId, timer: 0 };
    press.current = p;
    if (!editing) {
      p.timer = setTimeout(() => {
        if (press.current !== p) return;
        flushSync(startEditing);
        board.current!.setPointerCapture(p.pointerId);
        startDrag(p.el, p.x, p.y);
        placeDragged();
      }, 480);
    }
  }

  function onPointerMove(e: PointerEvent<HTMLElement>) {
    if (drag.current) {
      drag.current.px = e.clientX; drag.current.py = e.clientY;
      placeDragged();
      hitTest();
      return;
    }
    const p = press.current;
    if (!p) return;
    const moved = Math.hypot(e.clientX - p.x, e.clientY - p.y);
    if (!editing) { if (moved > 8) { clearTimeout(p.timer); press.current = null; } return; }
    if (moved > 5) {
      board.current!.setPointerCapture(p.pointerId);
      startDrag(p.el, p.x, p.y);
      drag.current!.px = e.clientX; drag.current!.py = e.clientY;
      placeDragged();
      press.current = null;
    }
  }

  function release() {
    if (press.current) { clearTimeout(press.current.timer); press.current = null; }
    if (drag.current) endDrag();
  }

  useEffect(() => () => {
    clearTimeout(press.current?.timer);
    cancelAnimationFrame(drag.current?.raf ?? 0); // 0 : aucune image demandée (comme undefined)
  }, []);

  return {
    onPointerDown, onPointerMove, onPointerUp: release, onPointerCancel: release,
    onLostPointerCapture: () => { if (drag.current) endDrag(); },
  };
}
