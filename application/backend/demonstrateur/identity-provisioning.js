/* ==========================================================================
   Démonstrateur uniquement : création des identités dans l'annuaire LDAP local,
   au travers du Keycloak qui le fédère et tient lieu de MindefConnect. En
   production, les identités existent déjà chez le fournisseur ; ASTER
   n'attribue que le profil et l'école.
   ========================================================================== */

// adminUrl : adresse de l'API d'administration, par défaut celle de l'émetteur ; sur les VM, l'adresse interne de Keycloak.
export function createKeycloakProvisioning({ issuer, adminUrl = issuer, adminUser, adminPassword, log = console }) {
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
    return (await response.json()).access_token;
  }

  async function api(path, access, options = {}) {
    const response = await fetch(`${base}/admin/realms/${realm}${path}`, { ...options, headers: { Authorization: `Bearer ${access}`, 'Content-Type': 'application/json', ...options.headers }, signal: AbortSignal.timeout(5000) });
    if (!response.ok && response.status !== 409) throw new Error(`Keycloak ${options.method ?? 'GET'} ${path} : ${response.status}`);
    return response.status === 204 || response.status === 201 || response.status === 409 ? null : response.json();
  }

  /** Crée les identités manquantes pour les comptes actifs (rapprochement par adresse électronique). */
  async function ensure(accounts) {
    const active = accounts.filter((c) => c.actif && c.email);
    if (!active.length) return 0;
    const access = await token();
    let created = 0;
    for (const c of active) {
      const found = await api(`/users?email=${encodeURIComponent(c.email)}&exact=true`, access);
      if (found.length) continue;
      const [firstName, ...rest] = c.nom.split(' ');
      await api('/users', access, { method: 'POST', body: JSON.stringify({ username: c.email.split('@')[0], email: c.email, firstName, lastName: rest.join(' ') || firstName, enabled: true, emailVerified: true }) });
      created++;
    }
    if (created) log.info?.(`Identités créées dans le fournisseur local : ${created}`);
    return created;
  }

  return { ensure };
}
