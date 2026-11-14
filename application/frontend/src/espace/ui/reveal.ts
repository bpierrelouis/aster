/* ==========================================================================
   Entrée d'un écran : les cartes, puis leurs textes, glissent de gauche à
   droite en fondu. La cascade part du coin haut gauche ; seuls les éléments
   visibles sont animés. Animations Web : rien ne reste appliqué ensuite.
   ========================================================================== */

import { reduceMotion } from '../core/dom.ts';

const CARDS = '.glass, .scene:has(> .iso)';
const TEXTS = 'h2, h3, p, li, tr, dt, dd, label, blockquote';
const EASE = 'cubic-bezier(.2, .8, .2, 1)';
const MAX = 160; // au-delà, le reste apparaît sans animation

/** Éléments visibles du sélecteur, sans ceux contenus dans un autre élément retenu ni ceux masqués par opacité. */
function outermost(root: HTMLElement, selector: string) {
  return [...root.querySelectorAll<HTMLElement>(selector)].filter((el) => {
    const parent = el.parentElement!.closest(selector);
    if (parent && root.contains(parent)) return false;
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.bottom > 0 && r.top < innerHeight && getComputedStyle(el).opacity !== '0';
  });
}

export function reveal(root: HTMLElement | null) {
  if (!root || reduceMotion()) return;
  const box = root.getBoundingClientRect();
  // Retard selon la position : de gauche à droite, puis de haut en bas
  const delay = (el: Element) => {
    const r = el.getBoundingClientRect();
    return Math.round(Math.min(1, Math.max(0, (r.left - box.left) / (box.width || 1))) * 240 + Math.min(1, Math.max(0, r.top / innerHeight)) * 300);
  };
  const cards = outermost(root, CARDS).slice(0, MAX);
  const texts = outermost(root, TEXTS).slice(0, MAX);
  for (const el of cards) {
    el.animate([{ opacity: 0, transform: 'translateX(-32px)' }, { opacity: 1, transform: 'none' }],
      { duration: 720, delay: delay(el), easing: EASE, fill: 'backwards' });
  }
  for (const el of texts) {
    el.animate([{ opacity: 0, transform: 'translateX(-18px)', filter: 'blur(3px)' }, { opacity: 1, transform: 'none', filter: 'none' }],
      { duration: 640, delay: delay(el) + 120, easing: EASE, fill: 'backwards' });
  }
}
