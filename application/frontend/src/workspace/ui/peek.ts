/* ==========================================================================
   Défilement sans barre visible.
   - Une zone qui déborde occupe toute la hauteur disponible : le bas de sa
     fenêtre s'aligne sur celui du menu et des autres fenêtres. Un fondu au
     bas de la zone (classe has-more) signale la suite tant qu'il en reste.
   - Hauteur disponible : jusqu'au bas de l'écran, moins ce qui suit la zone
     dans son cadre (ex. pagination sous un tableau) ; dans un panneau
     collant, la hauteur maximale de son CSS, quel que soit le défilement de
     la page.
   - Une grille qui défile avec la page (tableau de bord, bâtiments) ajuste la
     hauteur de ses rangées pour que le bas de l'écran coupe la suivante à
     40 % (entre le tiers et la moitié).
   - Recalcul à chaque rendu et au redimensionnement, jamais pendant le
     défilement : la position de lecture est conservée.
   ========================================================================== */

import { useCallback, useEffect, useLayoutEffect, useRef } from 'react';
import type { DependencyList } from 'react';

const SHOWN = .4;    // part visible de l'élément suivant
const MIN = 220;     // hauteur minimale d'une zone, en pixels

/** Panneau collant qui contient la zone (ou la zone elle-même) */
function stickyOf(el: HTMLElement) {
  for (let n: HTMLElement | null = el; n && n !== document.body; n = n.parentElement) if (getComputedStyle(n).position === 'sticky') return n;
  return null;
}

function available(el: HTMLElement, frame: Element | null) {
  const view = document.getElementById('view');
  const vs = view ? getComputedStyle(view) : null;
  const top = vs ? parseFloat(vs.paddingTop) : 0;       // bas de la barre haute
  const gap = vs ? parseFloat(vs.paddingBottom) : 20;   // marge basse (barre basse sur mobile)
  const sticky = stickyOf(el);
  if (sticky) {
    // Hauteur maximale du CSS (sans celle posée ici), moins ce qui entoure la zone dans le panneau (marges, fiche dessous)
    const inline = sticky.style.maxHeight;
    sticky.style.maxHeight = '';
    const css = parseFloat(getComputedStyle(sticky).maxHeight) || innerHeight - top - gap;
    sticky.style.maxHeight = inline;
    return css - (sticky.getBoundingClientRect().height - el.getBoundingClientRect().height);
  }
  const box = el.getBoundingClientRect();
  const below = frame ? frame.getBoundingClientRect().bottom - box.bottom : 0;
  const pageTop = box.top + scrollY;
  // Une zone placée plus bas dans la page dispose d'un écran entier une fois amenée sous la barre haute
  const start = pageTop < innerHeight * .7 ? pageTop : top;
  return innerHeight - start - below - gap;
}

/** Fondu bas tant qu'il reste à lire plus bas */
const markMore = (el: HTMLElement) => el.classList.toggle('has-more', el.scrollTop + el.clientHeight < el.scrollHeight - 2);

/** Ajuste la hauteur maximale de la zone défilante el (frame : cadre englobant). */
function fitPeek(el: HTMLElement, frame: Element | null = null) {
  if (!el?.isConnected) return;
  const scrolls = getComputedStyle(el).overflowY !== 'visible'; // l'écran Stock défile avec la page
  const limit = scrolls ? Math.max(MIN, available(el, frame)) : Infinity;
  el.style.maxHeight = el.scrollHeight > limit + 1 ? `${Math.round(limit)}px` : '';
  markMore(el);
}

/**
 * Grille défilant avec la page (tableau de bord, bâtiments) : la hauteur des
 * rangées, définie par la propriété CSS prop utilisée dans grid-auto-rows, est
 * ajustée à ±20 % de sa valeur CSS pour que le bas de l'écran coupe la rangée
 * suivante à 40 %.
 */
function fitRows(grid: HTMLElement | null | undefined, prop: string) {
  if (!grid?.isConnected) return;
  grid.style.removeProperty(prop);
  const cs = getComputedStyle(grid);
  const base = parseFloat(cs.gridAutoRows.match(/[\d.]+px/)?.[0] ?? ''); // hauteur calculée de la rangée
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
export function useFitRows(grid: () => HTMLElement | null | undefined, prop: string, deps: DependencyList) {
  const fit = useRef<() => void>(null);
  fit.current = () => fitRows(grid(), prop);
  useLayoutEffect(() => fit.current!(), deps); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    const onResize = () => fit.current!();
    addEventListener('resize', onResize);
    return () => removeEventListener('resize', onResize);
  }, []);
}

/**
 * Référence d'une zone défilante ajustée par fitPeek.
 * frame : sélecteur du cadre englobant (ce qui suit la zone dans ce cadre reste visible).
 */
export function usePeek(frame?: string) {
  const ref = useRef<HTMLDivElement>(null);
  const fit = useCallback(() => {
    const el = ref.current;
    if (el) fitPeek(el, frame ? el.closest(frame) : null);
  }, [frame]);
  useLayoutEffect(fit);
  useLayoutEffect(() => { // fondu : suivi pendant le défilement, sans recalcul de hauteur
    const el = ref.current;
    if (!el) return undefined;
    const onScroll = () => markMore(el);
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  });
  useEffect(() => {
    addEventListener('resize', fit);
    return () => removeEventListener('resize', fit);
  }, [fit]);
  return ref;
}
