import { useEffect } from 'react';

/** Titre de l'onglet du navigateur pour l'écran affiché. */
export function useTitle(title: string) {
  useEffect(() => { document.title = `${title} · Orion`; }, [title]);
}
