/* ==========================================================================
   Spécification OpenAPI de l'API ORION, servie sur /api/openapi.json et
   présentée par Swagger UI sur /api/docs.
   ========================================================================== */

const error = { description: 'Erreur', content: { 'application/json': { schema: { $ref: '#/components/schemas/Erreur' } } } };
const json = (schema: object, description = 'Succès') => ({ description, content: { 'application/json': { schema } } });
const session = [{ session: [] }];
const poste = [{ jetonPoste: [] }];
const connecteur = [{ jetonRigel: [] }];
const bloc = { type: 'object', required: ['iv', 'data'], properties: { iv: { type: 'string' }, data: { type: 'string' } }, description: 'Bloc chiffré AES-GCM (base64url)' };

export const openapi = {
  openapi: '3.1.0',
  info: {
    title: 'API ORION',
    version: '1.0.0',
    description: 'API du serveur ORION : état et description des services, connexion OIDC, espace de travail des utilisateurs et API des postes Windows.',
  },
  servers: [{ url: '/' }],
  tags: [
    { name: 'Système', description: 'État et description des services' },
    { name: 'Connexion', description: 'Connexion par le fournisseur d’identité (OIDC) et session' },
    { name: 'Espace de travail', description: 'Données métier visibles par l’utilisateur connecté' },
    { name: 'Postes', description: 'Rapports d’activité et résultats d’intervention des postes' },
    { name: 'Recensement', description: 'Connecteur du relais de l’application mobile RIGEL : campagnes publiées et constats des téléphones, chiffrés' },
  ],
  paths: {
    '/api/health': {
      get: {
        tags: ['Système'], summary: 'État de chaque service',
        description: 'Contrôle chaque service joint par ORION : adresse, IP, port et état. Répond 503 si un service requis (base de données, fournisseur d’identité) est indisponible.',
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
        description: 'Valide le code, rapproche l’identité d’un compte ORION actif, enregistre la date de dernière connexion et ouvre la session.',
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
        description: 'Ferme la session ORION puis celle du fournisseur d’identité. Exige l’en-tête `Origin` de l’application.',
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
        description: 'Applique les droits de l’utilisateur, puis fusionne élément par élément avec les écritures intervenues depuis `baseRevision`. Les valeurs tenues par le serveur sont ignorées : état, session, dernier rapport et adresse IP des postes (API des postes), dernière connexion et date de désactivation des comptes. Exige l’en-tête `Origin` de l’application.',
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
    '/api/workspace/import/analyse': {
      post: {
        tags: ['Espace de travail'], summary: 'Rapprocher les numéros de série d’un import du parc', security: session,
        description: 'Gestionnaire ou administrateur. Pour chaque numéro de série connu, dans l’école de destination ou dans une autre école, donne le matériel correspondant ; un transfert est bloqué si le matériel est cité par une remontée en cours de son école. Exige l’en-tête `Origin` de l’application.',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: {
            type: 'object', required: ['ecoleId', 'series'],
            properties: { ecoleId: { type: 'string', description: 'École de destination' }, series: { type: 'array', maxItems: 2000, items: { type: 'string' } } },
          } } },
        },
        responses: {
          200: json({ type: 'object', description: 'Par numéro de série normalisé (sans espaces de début et de fin, en minuscules)', additionalProperties: { $ref: '#/components/schemas/MaterielConnu' } }),
          400: error, 401: error, 403: error,
        },
      },
    },
    '/api/workspace/import': {
      post: {
        tags: ['Espace de travail'], summary: 'Importer des matériels', security: session,
        description: 'Gestionnaire ou administrateur. Ajoute les nouveaux matériels et transfère dans l’école de destination les matériels d’une autre école dont le numéro de série figure dans `transferts` ; un matériel déjà présent dans l’école, ou répété dans le fichier, n’est pas traité. Exige l’en-tête `Origin` de l’application.',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: {
            type: 'object', required: ['ecoleId', 'materiels'],
            properties: {
              ecoleId: { type: 'string', description: 'École de destination' },
              materiels: { type: 'array', minItems: 1, maxItems: 2000, items: { type: 'object', description: 'modele, dateReception (obligatoires), type, marque, serie, hs, salleId, garantieFin' } },
              transferts: { type: 'array', items: { type: 'string' }, description: 'Numéros de série des matériels d’une autre école à transférer' },
            },
          } } },
        },
        responses: {
          200: json({ type: 'object', properties: {
            ajoutes: { type: 'integer' }, transferes: { type: 'integer' }, ignores: { type: 'integer', description: 'Lignes non traitées' },
            state: { $ref: '#/components/schemas/Espace' },
          } }),
          400: error, 401: error, 403: error,
        },
      },
    },
    '/api/workspace/reports/{id}/pdf': {
      get: {
        tags: ['Espace de travail'], summary: 'Télécharger l’état des lieux d’une remontée', security: session,
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Document PDF, produit à la demande avec les informations actuelles', content: { 'application/pdf': { schema: { type: 'string', format: 'binary' } } } },
          401: error, 403: error, 404: error,
        },
      },
    },
    '/api/workspace/postes/{id}/jeton': {
      get: {
        tags: ['Espace de travail'], summary: 'Jeton à installer sur un poste de son périmètre (administrateurs)', security: session,
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: json({ type: 'object', properties: { poste: { type: 'string', description: 'Nom réseau du poste, en capitales' }, jeton: { type: 'string', description: 'NOM:signature, à présenter en jeton porteur sur l’API des postes' } } }),
          401: error, 403: error, 404: error,
        },
      },
    },
    '/api/workspace/recensements/{id}/appairage': {
      get: {
        tags: ['Espace de travail'], summary: 'Adresse d’appairage d’un téléphone à une campagne de recensement', security: session,
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: json({ type: 'object', properties: { url: { type: 'string' }, expireLe: { type: 'integer' } } }), 400: error, 401: error, 403: error, 404: error, 503: error },
      },
    },
    '/api/agent/postes': {
      get: {
        tags: ['Postes'], summary: 'Lister les postes', security: poste,
        responses: { 200: json({ type: 'object', properties: { postes: { type: 'array', items: {
          type: 'object', properties: { id: { type: 'string' }, nomReseau: { type: 'string' }, salleId: { type: 'string' }, ecoleId: { type: ['string', 'null'], description: 'École de la salle du poste' }, allume: { type: 'boolean', description: 'Rapport reçu depuis moins de 30 secondes' }, horsService: { type: 'boolean', description: 'Unité centrale du poste hors service : le poste ne peut pas s’allumer' } },
        } } } }), 401: error },
      },
    },
    '/api/agent/rapports': {
      post: {
        tags: ['Postes'], summary: 'Envoyer les rapports d’activité', security: poste,
        description: 'Adresse IP, système d’exploitation, session, processus utilisateur en cours et applications installées, 2 000 rapports au plus. La réponse donne les interventions à exécuter.',
        requestBody: { required: true, content: { 'application/json': { schema: {
          type: 'object', required: ['rapports'],
          properties: { rapports: { type: 'array', maxItems: 2000, items: {
            type: 'object', required: ['poste'],
            properties: {
              poste: { type: 'string', description: 'Nom réseau du poste' },
              session: { type: ['string', 'null'], description: 'Compte Windows de la session ouverte ; absent ou null si le poste est seulement allumé' },
              adresseIp: { type: 'string', format: 'ipv4', description: 'Adresse IPv4 du poste, enregistrée sur le poste ; une valeur absente ou invalide laisse l’adresse connue inchangée' },
              os: { type: 'string', maxLength: 80, description: 'Système d’exploitation installé (« Windows 11 »), enregistré sur le poste ; une valeur absente laisse la valeur connue inchangée' },
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
    '/api/rigel/campagnes': {
      get: {
        tags: ['Recensement'], summary: 'Campagnes ouvertes et leur instantané chiffré', security: connecteur,
        responses: { 200: json({ type: 'object', properties: { campagnes: { type: 'array', items: { type: 'object', properties: {
          id: { type: 'string' }, expireLe: { type: 'integer' }, empreinte: { type: 'string', description: 'SHA-256 du jeton des téléphones' }, version: { type: 'string' }, instantane: bloc,
        } } } } }), 401: error },
      },
    },
    '/api/rigel/campagnes/{id}/evenements': {
      post: {
        tags: ['Recensement'], summary: 'Transmettre les constats chiffrés des téléphones', security: connecteur,
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: { required: true, content: { 'application/json': { schema: {
          type: 'object', required: ['evenements'],
          properties: { evenements: { type: 'array', maxItems: 1000, items: { type: 'object', required: ['id', 'bloc'], properties: { id: { type: 'string' }, bloc } } } },
        } } } },
        responses: { 200: json({ type: 'object', properties: { resultats: { type: 'array', items: { type: 'object', properties: {
          id: { type: 'string' }, statut: { type: 'string', enum: ['applique', 'doublon', 'refuse'] }, message: { type: 'string' },
        } } } } }), 400: error, 401: error },
      },
    },
  },
  components: {
    securitySchemes: {
      session: { type: 'apiKey', in: 'cookie', name: 'orion.sid', description: 'Session ouverte par /auth/login' },
      jetonPoste: { type: 'http', scheme: 'bearer', description: 'Jeton des postes' },
      jetonRigel: { type: 'http', scheme: 'bearer', description: 'Secret du connecteur RIGEL (RIGEL_SECRET)' },
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
      MaterielConnu: {
        type: 'object',
        properties: {
          idOrion: { type: 'string' }, modele: { type: 'string' }, ecoleId: { type: 'string' }, ecole: { type: 'string' },
          bloque: { type: ['string', 'null'], description: 'Raison qui empêche le transfert' },
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
