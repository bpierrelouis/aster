import { readdirSync, readFileSync } from 'node:fs';

/**
 * Environnement complété par les secrets Docker Swarm : le fichier /run/secrets/NOM fournit la valeur NOM. Les secrets restent
 * dans la configuration lue, sans devenir des variables d'environnement du processus (héritées, visibles par docker exec env).
 */
export function environnement(env: NodeJS.ProcessEnv = process.env, dossier = '/run/secrets'): NodeJS.ProcessEnv {
  let fichiers;
  try { fichiers = readdirSync(dossier, { withFileTypes: true }); } catch { return env; }
  const secrets = fichiers
    .filter((f) => f.isFile() && /^[A-Z][A-Z0-9_]*$/.test(f.name))
    .map((f) => [f.name, readFileSync(`${dossier}/${f.name}`, 'utf8').replace(/\n+$/, '')]);
  return { ...env, ...Object.fromEntries(secrets) };
}
