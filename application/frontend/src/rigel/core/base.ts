/* Stockage local du téléphone (IndexedDB) : une table clé → valeur. Le téléphone y garde l'appairage,
   l'instantané déchiffré de la campagne, la file des constats et leur historique, pour travailler hors ligne. */

const BASE = 'orion-recensement';
const TABLE = 'valeurs';

let ouverture: Promise<IDBDatabase> | null = null;
function base() {
  ouverture ??= new Promise((resolve, reject) => {
    const req = indexedDB.open(BASE, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(TABLE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => { ouverture = null; reject(req.error); };
  });
  return ouverture;
}

async function transaction<T>(mode: IDBTransactionMode, action: (table: IDBObjectStore) => IDBRequest<T>) {
  const db = await base();
  return new Promise<T>((resolve, reject) => {
    const tx = db.transaction(TABLE, mode);
    const req = action(tx.objectStore(TABLE));
    tx.oncomplete = () => resolve(req.result);
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

export const lire = <T>(cle: string) => transaction<T | undefined>('readonly', (t) => t.get(cle));
export const ecrire = (cle: string, valeur: unknown) => transaction('readwrite', (t) => t.put(valeur, cle)).then(() => undefined);
export const vider = () => transaction('readwrite', (t) => t.clear()).then(() => undefined);
