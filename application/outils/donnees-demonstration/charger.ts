/* ==========================================================================
   Données de démonstration · chargement dans l'espace de travail
   Commande : npm run donnees:demo [-- --reinitialiser]  (DATABASE_URL)
   - espace sans écoles ni comptes : le jeu (jeu.ts) est chargé ;
   - jeu de même version (SEED_VERSION) déjà chargé : rien ne change ;
   - autres données : refus, sauf avec --reinitialiser, qui remplace toutes
     les données par le jeu (développement, démonstrateur sur VM).
   Appelée par npm run dev, le mode interface seule et le service api du
   démonstrateur sur VM ; jamais par le serveur de production.
   ========================================================================== */

import pg from 'pg';
import { fileURLToPath } from 'node:url';
import { initialState } from '../../backend/domaine/espace.ts';
import { createPostgresWorkspaceRepository } from '../../backend/persistance/postgres.ts';
import { readConfig } from '../../backend/config.ts';
import { journal, raison } from '../../backend/journal.ts';
import { seed, SEED_VERSION } from './jeu.ts';
import type { Engine } from '../../backend/persistance/engine.ts';
import type { WorkspaceState } from '#shared/types.ts';

/** Espace complet de démonstration : référentiels, jeu de départ ; aucune activité de poste avant le premier rapport */
export function etatDemonstration(now = Date.now()): WorkspaceState {
  const state = { ...initialState(now), ...seed(now) } as WorkspaceState; // étages du jeu : niveau toujours renseigné
  for (const p of state.postes) { p.session = null; p.vuLe = null; }
  return state;
}

/** Charge le jeu de démonstration ; renvoie true s'il a été chargé, false s'il l'était déjà. */
export function chargerDemonstration(espace: Pick<Engine, 'remplacer'>, { reinitialiser = false } = {}) {
  return espace.remplacer((state) => {
    if (state.version === SEED_VERSION) return null;
    if ((state.ecoles.length || state.comptes.length) && !reinitialiser) {
      throw new Error(`Données en version ${state.version}, jeu de démonstration en version ${SEED_VERSION} : chargement refusé (--reinitialiser pour remplacer toutes les données).`);
    }
    return etatDemonstration();
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const pool = new pg.Pool({ connectionString: readConfig().databaseUrl });
  try {
    const charge = await chargerDemonstration(await createPostgresWorkspaceRepository({ pool }), { reinitialiser: process.argv.includes('--reinitialiser') });
    journal.info('donnees_demonstration', { version: SEED_VERSION, resultat: charge ? 'chargees' : 'deja_chargees' });
  } catch (error) {
    journal.error('donnees_demonstration', { erreur: raison(error) });
    process.exitCode = 1;
  } finally { await pool.end(); }
}
