/* ==========================================================================
   Démonstrateur uniquement : création des identités dans l'annuaire LDAP local,
   au travers du Keycloak qui le fédère et tient lieu de MindefConnect. En
   production, les identités existent déjà chez le fournisseur ; ORION
   n'attribue que le profil et l'école.
   ========================================================================== */

import { identifiantDeBase, identifiantUnique } from './identifiant.ts';
import type { Compte } from '#shared/types.ts';

// adminUrl : adresse de l'API d'administration, par défaut celle de l'émetteur ; sur les VM, l'adresse interne de Keycloak.
export function createKeycloakProvisioning({ issuer, adminUrl = issuer, adminUser, adminPassword, log = console }: {
  issuer: URL; adminUrl?: URL; adminUser: string; adminPassword: string; log?: Partial<Pick<Console, 'info'>>;
}) {
  const base = adminUrl.origin;
  const realm = issuer.pathname.match(/\/realms\/([^/]+)/)?.[1];
  if (!realm) throw new Error('Realm Keycloak introuvable dans OIDC_ISSUER.');

  async function token() {
    const response = await fetch(`${base}/realms/master/protocol/openid-connect/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ grant_type: 'password', client_id: 'admin-cli', username: adminUser, password: adminPassword }),
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) throw new Error(`Jeton d'administration refusé (${response.status}).`);
    return ((await response.json()) as { access_token: string }).access_token;
  }

  /** Appel de l'API d'administration ; une création refusée parce que l'identité existe déjà (409) renvoie false */
  async function api(path: string, access: string, options: { method?: string; body?: string } = {}): Promise<unknown> {
    const response = await fetch(`${base}/admin/realms/${realm}${path}`, { ...options, headers: { Authorization: `Bearer ${access}`, 'Content-Type': 'application/json' }, signal: AbortSignal.timeout(5000) });
    if (response.status === 409) return false;
    if (!response.ok) throw new Error(`Keycloak ${options.method ?? 'GET'} ${path} : ${response.status}`);
    return response.status === 201 || response.status === 204 ? true : response.json();
  }

  /** Crée les identités manquantes pour les comptes actifs (rapprochement par adresse électronique). */
  async function ensure(accounts: Compte[]) {
    const active = accounts.filter((c) => c.actif && c.email);
    if (!active.length) return 0;
    const access = await token();
    let created = 0;
    for (const c of active) {
      const found = (await api(`/users?email=${encodeURIComponent(c.email)}&exact=true`, access)) as unknown[];
      if (found.length) continue;
      // Identifiant formé à partir du nom ; homonymes départagés par un chiffre (identifiant.ts). Recherche
      // (sous-chaîne) sur les 17 premiers caractères : couvre aussi les identifiants raccourcis pour le chiffre.
      const repli = c.email.split('@')[0];
      const existants = (await api(`/users?username=${encodeURIComponent(identifiantDeBase(c.nom, repli).slice(0, 17))}&briefRepresentation=true&max=1000`, access)) as { username: string }[];
      const pris = new Set(existants.map((u) => u.username.toLowerCase()));
      const username = identifiantUnique(c.nom, (id) => pris.has(id), repli);
      const [firstName, ...rest] = c.nom.split(' ');
      if (await api('/users', access, { method: 'POST', body: JSON.stringify({ username, email: c.email, firstName, lastName: rest.join(' ') || firstName, enabled: true, emailVerified: true }) })) created++;
    }
    if (created) log.info?.(`Identités créées dans le fournisseur local : ${created}`);
    return created;
  }

  return { ensure };
}
