/* ==========================================================================
   Démonstrateur uniquement : affiche l'adresse et le mot de passe de chaque
   compte ORION actif, à transmettre aux présentateurs par un canal sûr.
   Local : npm run mots-de-passe. VM (orion-4 ou orion-5) :
   docker exec $(docker ps -qf name=orion_api | head -n1) orion-secrets node outils/identites-keycloak/mots-de-passe.ts
   ========================================================================== */

import pg from 'pg';
import { readConfig } from '../../backend/config.ts';
import { motDePasse } from './mot-de-passe.ts';

const config = readConfig();
const client = new pg.Client({ connectionString: config.databaseUrl });
await client.connect();
try {
  const { rows } = await client.query<{ email: string; nom: string; role: string }>('SELECT email, nom, role FROM orion_compte WHERE actif ORDER BY role, email');
  console.table(rows.map((c) => ({ adresse: c.email, nom: c.nom, profil: c.role, 'mot de passe': motDePasse(config.provisioning.passwordSecret, c.email) })));
} finally {
  await client.end();
}
