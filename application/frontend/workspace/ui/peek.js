/* ==========================================================================
   Défilement sans barre visible : une zone qui déborde s'arrête au milieu
   d'un de ses éléments (lignes, cartes), coupé à 40 % (entre le tiers et la
   moitié), pour signaler la suite.
   - La zone occupe la hauteur disponible jusqu'au bas de l'écran, moins ce
     qui la suit dans son cadre (ex. pagination sous un tableau).
   - Une zone collante (panneau latéral) garde la hauteur maximale de son CSS.
   - Une grille qui défile avec la page (tableau de bord, bâtiments) ajuste la
     hauteur de ses rangées pour que le bas de l'écran coupe la suivante.
   - Recalcul à chaque rendu et au redimensionnement, jamais pendant le
     défilement : la position de lecture est conservée.
   ========================================================================== */

import { useCallback, useEffect, useLayoutEffect, useRef } from 'react';

const SHOWN = .4;    // part visible de l'élément suivant
const MIN = 220;     // hauteur minimale d'une zone, en pixels

function available(el, frame) {
  const view = document.getElementById('view');
  const vs = view ? getComputedStyle(view) : null;
  const top = vs ? parseFloat(vs.paddingTop) : 0;       // bas de la barre haute
  const gap = vs ? parseFloat(vs.paddingBottom) : 20;   // marge basse (barre basse sur mobile)
  if (getComputedStyle(el).position === 'sticky') {
    const inline = el.style.maxHeight;
    el.style.maxHeight = '';
    const css = parseFloat(getComputedStyle(el).maxHeight);
    el.style.maxHeight = inline;
    return css || innerHeight - top - gap;
  }
  const box = el.getBoundingClientRect();
  const below = frame ? frame.getBoundingClientRect().bottom - box.bottom : 0;
  const pageTop = box.top + scrollY;
  // Une zone placée plus bas dans la page dispose d'un écran entier une fois amenée sous la barre haute
  const start = pageTop < innerHeight * .7 ? pageTop : top;
  return innerHeight - start - below - gap;
}

/** Ajuste la hauteur maximale de la zone défilante el (items : sélecteur des éléments, frame : cadre). */
function fitPeek(el, items, frame = null) {
  if (!el?.isConnected) return;
  if (getComputedStyle(el).overflowY === 'visible') { el.style.maxHeight = ''; return; } // zone non défilante (ex. écran Stock)
  const limit = Math.max(MIN, available(el, frame));
  if (el.scrollHeight <= limit + 1) { el.style.maxHeight = ''; return; }
  const origin = el.getBoundingClientRect().top - el.scrollTop;
  let cut = 0;
  for (const item of el.querySelectorAll(items)) {
    const r = item.getBoundingClientRect();
    if (!r.height) continue;
    const at = r.top - origin + r.height * SHOWN;
    if (at > limit) break;
    cut = at;
  }
  el.style.maxHeight = `${Math.round(cut || limit)}px`;
}

/**
 * Grille défilant avec la page (tableau de bord, bâtiments) : la hauteur des
 * rangées, définie par la propriété CSS prop utilisée dans grid-auto-rows, est
 * ajustée à ±20 % de sa valeur CSS pour que le bas de l'écran coupe la rangée
 * suivante à 40 %.
 */
function fitRows(grid, prop) {
  if (!grid?.isConnected) return;
  grid.style.removeProperty(prop);
  const cs = getComputedStyle(grid);
  const base = parseFloat(cs.gridAutoRows.match(/[\d.]+px/)?.[0]); // hauteur calculée de la rangée
  const gap = parseFloat(cs.rowGap) || 0;
  const visible = innerHeight - (grid.getBoundingClientRect().top + scrollY);
  if (!base || grid.offsetHeight <= visible) return;
  // n rangées entières, puis 40 % de la suivante : rangée la plus proche de la valeur CSS
  let best = 0;
  for (let n = 1; n < 12; n++) {
    const row = (visible - n * gap) / (n + SHOWN);
    if (row > 0 && Math.abs(row - base) < Math.abs(best - base)) best = row;
  }
  if (Math.abs(best - base) <= base * .2) grid.style.setProperty(prop, `${Math.floor(best)}px`);
}

/** Ajuste une grille (fitRows) quand deps change et au redimensionnement ; grid() renvoie l'élément. */
export function useFitRows(grid, prop, deps) {
  const fit = useRef(null);
  fit.current = () => fitRows(grid(), prop);
  useLayoutEffect(() => fit.current(), deps); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    const onResize = () => fit.current();
    addEventListener('resize', onResize);
    return () => removeEventListener('resize', onResize);
  }, []);
}

/**
 * Référence d'une zone défilante ajustée par fitPeek.
 * items : éléments à couper (ex. 'tbody tr') ; frame : sélecteur du cadre englobant.
 */
export function usePeek(items, frame) {
  const ref = useRef(null);
  const fit = useCallback(() => {
    const el = ref.current;
    if (el) fitPeek(el, items, frame ? el.closest(frame) : null);
  }, [items, frame]);
  useLayoutEffect(fit);
  useEffect(() => {
    addEventListener('resize', fit);
    return () => removeEventListener('resize', fit);
  }, [fit]);
  return ref;
}
