import { useEffect, useSyncExternalStore } from 'react';
import { recon } from '../core/etat.ts';
import { vueDe } from '../core/vue.ts';

/** État du téléphone et vue de la campagne, rendus à chaque changement */
export function useRecon() {
  const etat = useSyncExternalStore(recon.abonner, () => recon.etat);
  return { etat, vue: vueDe(etat) };
}

/** Titre de l'onglet et de l'application installée */
export function useTitre(titre: string) {
  useEffect(() => { document.title = `${titre} — Recensement`; }, [titre]);
}
