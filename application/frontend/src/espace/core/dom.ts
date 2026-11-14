/* Petits utilitaires DOM et d'animation, sans dépendance */

export const $$ = <E extends Element = HTMLElement>(sel: string, root: ParentNode = document) => [...root.querySelectorAll<E>(sel)];

export const reduceMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
/** Touche destinée à une saisie IME en cours (Entrée qui valide un caractère japonais, chinois…) ; 229 couvre Safari. */
export const composing = (e: { nativeEvent: KeyboardEvent; keyCode: number }) => e.nativeEvent.isComposing || e.keyCode === 229;

/** Clic sur une ligne de tableau en dehors de ses commandes (lien, bouton, case, champ) */
export const outsideControls = (e: { target: EventTarget | null }) => !(e.target as Element).closest('a, button, input, select, textarea, label');

/**
 * FLIP : anime les éléments de leur ancienne position vers la nouvelle
 * après une mutation du DOM.
 */
export function flip(elements: Element[], mutate: () => void, { duration = 380, easing = 'cubic-bezier(.2,.8,.2,1)', skip }: { duration?: number; easing?: string; skip?: Element | null } = {}) {
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

export const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
