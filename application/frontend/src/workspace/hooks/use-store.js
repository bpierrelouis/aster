import { useSyncExternalStore } from 'react';
import { store } from '../core/store.js';

/** Redessine le composant à chaque changement de l'état partagé et renvoie cet état. */
export function useStore() {
  useSyncExternalStore(store.subscribe, () => store.version);
  return store.state;
}
