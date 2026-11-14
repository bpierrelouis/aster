/* Échanges avec le relais : le téléphone n'y dépose et n'y lit que des blocs chiffrés avec la clé de la campagne. */
import { chiffrer, dechiffrer } from '#shared/rigel.ts';
import type { Appairage, Bloc, EvenementRigel, InstantaneRigel } from '#shared/rigel.ts';

/** Campagne close, expirée ou accès révoqué : le relais refuse le jeton de ce téléphone */
export class AccesRefuse extends Error {}

async function appel<T>(a: Appairage, chemin: string, init: RequestInit = {}): Promise<T> {
  const reponse = await fetch(`/api/campagnes/${encodeURIComponent(a.campagne)}${chemin}`, {
    ...init, cache: 'no-store',
    headers: { Authorization: `Bearer ${a.jeton}`, 'Content-Type': 'application/json' },
  });
  if ([401, 403, 404, 410].includes(reponse.status)) throw new AccesRefuse('Cet appairage est clos ou l’accès de ce téléphone a été retiré.');
  if (!reponse.ok) throw new Error('Relais momentanément indisponible.');
  return reponse.json() as Promise<T>;
}

/** Dépose des constats chiffrés ; renvoie les identifiants reçus par le relais */
export async function deposer(a: Appairage, evenements: EvenementRigel[]) {
  const corps = { evenements: await Promise.all(evenements.map(async (e) => ({ id: e.id, bloc: await chiffrer(a.cle, a.campagne, e) }))) };
  const { recus } = await appel<{ recus: string[] }>(a, '/evenements', { method: 'POST', body: JSON.stringify(corps) });
  return new Set(recus);
}

/** Instantané de la campagne, déchiffré */
export async function telecharger(a: Appairage) {
  const { version, instantane } = await appel<{ version: string; instantane: Bloc }>(a, '/instantane');
  return { version, instantane: await dechiffrer<InstantaneRigel>(a.cle, a.campagne, instantane) };
}
