/* ==========================================================================
   Spécification OpenAPI de l'API ASTER, servie sur /api/openapi.json et
   présentée par Swagger UI sur /api/docs.
   ========================================================================== */

const error = { description: 'Erreur', content: { 'application/json': { schema: { $ref: '#/components/schemas/Erreur' } } } };
const json = (schema, description = 'Succès') => ({ description, content: { 'application/json': { schema } } });
const session = [{ session: [] }];
const poste = [{ jetonPoste: [] }];

export const openapi = {
  openapi: '3.1.0',
  info: {
    title: 'API ASTER',
    version: '1.0.0',
    description: 'API du serveur ASTER : état et description des services, connexion OIDC, espace de travail des utilisateurs et API des postes Windows.',
  },
  servers: [{ url: '/' }],
  tags: [
    { name: 'Système', description: 'État et description des services' },
    { name: 'Connexion', description: 'Connexion par le fournisseur d’identité (OIDC) et session' },
    { name: 'Espace de travail', description: 'Données métier visibles par l’utilisateur connecté' },
    { name: 'Postes', description: 'Rapports d’activité et résultats d’intervention des postes' },
  ],
  paths: {
    '/api/health': {
      get: {
        tags: ['Système'], summary: 'État de chaque service',
        description: 'Contrôle chaque service joint par ASTER : adresse, IP, port et état. Répond 503 si un service requis (base de données, fournisseur d’identité) est indisponible.',
        responses: { 200: json({ $ref: '#/components/schemas/Etat' }, 'Services requis disponibles'), 503: json({ $ref: '#/components/schemas/Etat' }, 'Service requis indisponible') },
      },
    },
    '/api/infos': {
      get: {
        tags: ['Système'], summary: 'Description du système et des services',
        responses: { 200: json({ $ref: '#/components/schemas/Infos' }) },
      },
    },
    '/api/me': {
      get: {
        tags: ['Connexion'], summary: 'Utilisateur connecté', security: session,
        responses: { 200: json({ type: 'object', properties: { user: { type: 'object', description: 'Identité, profil, école et modules accessibles' } } }), 401: error },
      },
    },
    '/auth/login': {
      get: {
        tags: ['Connexion'], summary: 'Démarrer la connexion',
        description: 'Redirige vers le fournisseur d’identité (code d’autorisation avec PKCE).',
        responses: { 302: { description: 'Redirection vers le fournisseur d’identité' } },
      },
    },
    '/auth/callback': {
      get: {
        tags: ['Connexion'], summary: 'Retour du fournisseur d’identité',
        description: 'Valide le code, rapproche l’identité d’un compte ASTER actif et ouvre la session.',
        parameters: [
          { name: 'code', in: 'query', required: true, schema: { type: 'string' } },
          { name: 'state', in: 'query', required: true, schema: { type: 'string' } },
        ],
        responses: { 302: { description: 'Redirection vers l’application, avec `?error=` en cas d’échec' } },
      },
    },
    '/auth/logout': {
      post: {
        tags: ['Connexion'], summary: 'Se déconnecter', security: session,
        description: 'Ferme la session ASTER puis celle du fournisseur d’identité. Exige l’en-tête `Origin` de l’application.',
        responses: { 303: { description: 'Redirection vers la déconnexion du fournisseur d’identité' }, 403: { description: 'Origine refusée' } },
      },
    },
    '/api/workspace': {
      get: {
        tags: ['Espace de travail'], summary: 'Lire l’espace de travail', security: session,
        description: 'Données visibles par l’utilisateur selon son profil et son école. Requête conditionnelle par `ETag`.',
        parameters: [{ name: 'If-None-Match', in: 'header', schema: { type: 'string' } }],
        responses: {
          200: { ...json({ $ref: '#/components/schemas/Espace' }), headers: { ETag: { schema: { type: 'string' } } } },
          304: { description: 'Inchangé depuis l’ETag fourni' },
          401: error,
        },
      },
      put: {
        tags: ['Espace de travail'], summary: 'Enregistrer l’espace de travail', security: session,
        description: 'Applique les droits de l’utilisateur, puis fusionne élément par élément avec les écritures intervenues depuis `baseRevision`. Exige l’en-tête `Origin` de l’application.',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: {
            type: 'object', required: ['state', 'baseRevision'],
            properties: { state: { type: 'object', description: 'État modifié par l’utilisateur' }, baseRevision: { type: 'integer', description: 'Révision sur laquelle la modification a été préparée' } },
          } } },
        },
        responses: { 200: json({ $ref: '#/components/schemas/Espace' }), 400: error, 401: error, 403: error, 409: error },
      },
    },
    '/api/workspace/reports/{id}/pdf': {
      get: {
        tags: ['Espace de travail'], summary: 'Télécharger l’état des lieux d’une remontée', security: session,
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          303: { description: 'Redirection vers un lien signé du stockage S3, valable 60 secondes' },
          200: { description: 'Document PDF', content: { 'application/pdf': { schema: { type: 'string', format: 'binary' } } } },
          401: error, 403: error, 404: error, 503: error,
        },
      },
    },
    '/api/agent/postes': {
      get: {
        tags: ['Postes'], summary: 'Lister les postes', security: poste,
        responses: { 200: json({ type: 'object', properties: { postes: { type: 'array', items: {
          type: 'object', properties: { id: { type: 'string' }, nomReseau: { type: 'string' }, salleId: { type: 'string' }, connecte: { type: 'boolean' } },
        } } } }), 401: error },
      },
    },
    '/api/agent/rapports': {
      post: {
        tags: ['Postes'], summary: 'Envoyer les rapports d’activité', security: poste,
        description: 'Processus utilisateur en cours et applications installées, 2 000 rapports au plus. La réponse donne les interventions à exécuter.',
        requestBody: { required: true, content: { 'application/json': { schema: {
          type: 'object', required: ['rapports'],
          properties: { rapports: { type: 'array', maxItems: 2000, items: {
            type: 'object', required: ['poste'],
            properties: {
              poste: { type: 'string', description: 'Nom réseau du poste' },
              processus: { type: 'array', maxItems: 200, items: { type: 'object', properties: { nom: { type: 'string', maxLength: 120 }, compte: { type: 'string', description: 'Compte Windows' } } } },
              applications: { type: 'array', items: { type: 'string', description: 'Identifiant d’application' } },
            },
          } } },
        } } } },
        responses: { 200: json({ type: 'object', properties: {
          inconnus: { type: 'array', items: { type: 'string' }, description: 'Postes non référencés' },
          commandes: { type: 'array', items: { $ref: '#/components/schemas/Commande' } },
        } }), 400: error, 401: error },
      },
    },
    '/api/agent/resultats': {
      post: {
        tags: ['Postes'], summary: 'Envoyer les résultats d’intervention', security: poste,
        requestBody: { required: true, content: { 'application/json': { schema: {
          type: 'object', required: ['resultats'],
          properties: { resultats: { type: 'array', maxItems: 5000, items: {
            type: 'object', required: ['operation', 'poste', 'statut'],
            properties: { operation: { type: 'string' }, poste: { type: 'string' }, statut: { type: 'string', enum: ['reussie', 'echec'] } },
          } } },
        } } } },
        responses: { 200: json({ type: 'object', properties: { ok: { type: 'boolean' } } }), 400: error, 401: error },
      },
    },
  },
  components: {
    securitySchemes: {
      session: { type: 'apiKey', in: 'cookie', name: 'aster.sid', description: 'Session ouverte par /auth/login' },
      jetonPoste: { type: 'http', scheme: 'bearer', description: 'Jeton des postes' },
    },
    schemas: {
      Erreur: { type: 'object', properties: { error: { type: 'string' } } },
      Service: {
        type: 'object',
        properties: {
          id: { type: 'string' }, name: { type: 'string' },
          address: { type: ['string', 'null'], description: 'hôte:port' },
          ip: { type: 'array', items: { type: 'string' } },
          port: { type: ['integer', 'null'] },
          required: { type: 'boolean', description: 'Indisponible : l’API répond 503' },
          status: { type: 'string', enum: ['up', 'down', 'not-configured'] },
          latencyMs: { type: 'integer' }, error: { type: 'string' },
          connected: { type: 'integer', description: 'Postes : nombre de postes connectés' }, total: { type: 'integer' },
        },
      },
      Etat: {
        type: 'object',
        properties: {
          status: { type: 'string', enum: ['ok', 'degraded', 'unavailable'] },
          checkedAt: { type: 'string', format: 'date-time' },
          instance: { type: 'string', description: 'Nom d’hôte de l’instance qui répond' },
          services: { type: 'array', items: { $ref: '#/components/schemas/Service' } },
        },
      },
      Infos: {
        type: 'object',
        properties: {
          application: { type: 'object', properties: {
            name: { type: 'string' }, description: { type: 'string' }, version: { type: ['string', 'null'], description: 'Commit de l’image' },
            mode: { type: 'string', enum: ['production', 'développement'] }, startedAt: { type: 'string', format: 'date-time' },
          } },
          instance: { type: 'object', properties: {
            hostname: { type: 'string' }, ip: { type: 'array', items: { type: 'string' } }, node: { type: 'string' }, platform: { type: 'string' }, uptimeSeconds: { type: 'integer' },
          } },
          services: { type: 'array', items: { type: 'object', properties: {
            id: { type: 'string' }, name: { type: 'string' }, role: { type: 'string' }, host: { type: ['string', 'null'] }, port: { type: ['integer', 'null'] }, required: { type: 'boolean' },
          } } },
        },
      },
      Espace: { type: 'object', description: 'Révision et données visibles : écoles, bâtiments, salles, postes, matériels, remontées, opérations…', properties: { revision: { type: 'integer' } } },
      Commande: {
        type: 'object',
        properties: {
          operation: { type: 'string' }, poste: { type: 'string' },
          type: { type: 'string', enum: ['arret', 'installation', 'desinstallation', 'reinstallation'] },
          applicationId: { type: ['string', 'null'] }, image: { type: ['string', 'null'] },
          processus: { type: ['object', 'null'], properties: { nom: { type: 'string' }, compte: { type: 'string' } } },
        },
      },
    },
  },
};
