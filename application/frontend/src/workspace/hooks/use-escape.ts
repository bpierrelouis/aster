import { useLayoutEffect, useRef } from 'react';
import type { RefObject } from 'react';

/* Échap ferme la fenêtre ou la fiche munie d'une croix ouverte en dernier (fiche d'un matériel avant la fiche de sa
   salle). Les fenêtres modales et les menus se ferment d'eux-mêmes ; la frappe dans un champ n'est pas interrompue. */
const stack: RefObject<() => void>[] = [];
const editable = (el: EventTarget | null) => (el as Element | null)?.closest?.('input, textarea, select, [contenteditable="true"]');

function onKey(e: KeyboardEvent) {
  if (e.key !== 'Escape' || e.defaultPrevented || editable(e.target) || document.querySelector('dialog[open]')) return;
  const top = stack.at(-1);
  if (top) { e.preventDefault(); top.current(); }
}

/** close : ferme la fenêtre ; active : la fenêtre est ouverte */
export function useEscape(close: () => void, active = true) {
  const ref = useRef(close);
  ref.current = close;
  useLayoutEffect(() => { // enregistré avant l'affichage : Échap agit dès que la fenêtre est visible
    if (!active) return undefined;
    if (!stack.length) addEventListener('keydown', onKey);
    stack.push(ref);
    return () => {
      stack.splice(stack.indexOf(ref), 1);
      if (!stack.length) removeEventListener('keydown', onKey);
    };
  }, [active]);
}
