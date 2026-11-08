/* Petits utilitaires DOM et d'animation, sans dépendance */

export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

export const reduceMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * FLIP : anime les éléments de leur ancienne position vers la nouvelle
 * après une mutation du DOM.
 */
export function flip(elements, mutate, { duration = 380, easing = 'cubic-bezier(.2,.8,.2,1)', skip } = {}) {
  const first = new Map(elements.map((el) => [el, el.getBoundingClientRect()]));
  mutate();
  if (reduceMotion()) return;
  for (const [el, a] of first) {
    if (!el.isConnected || el === skip) continue;
    const b = el.getBoundingClientRect();
    const dx = a.left - b.left;
    const dy = a.top - b.top;
    const sx = a.width / (b.width || 1);
    const sy = a.height / (b.height || 1);
    if (Math.abs(dx) < 1 && Math.abs(dy) < 1 && Math.abs(sx - 1) < 0.01 && Math.abs(sy - 1) < 0.01) continue;
    el.animate(
      [
        { transformOrigin: 'top left', transform: `translate(${dx}px, ${dy}px)` },
        { transformOrigin: 'top left', transform: 'none' },
      ],
      { duration, easing }
    );
  }
}

/** Identifiant court */
export const uid = (p = 'id') => `${p}-${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36).slice(-3)}`;

export const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
