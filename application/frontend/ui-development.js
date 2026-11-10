import express from 'express';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { ROLES } from '../backend/workspace/rules.js';
import { createWorkspaceRepository } from '../backend/workspace/engine.js';
import { createWorkspaceRouter, createAgentRouter } from '../backend/workspace/routes.js';
import { createAgentEmulator, directTransport } from '../backend/demonstrateur/agents.js';
import { userFromAccount } from '../backend/profiles.js';

// Mode interface seule : mêmes règles et même API, sans fournisseur d'identité ni base de données.
// L'utilisateur est d'abord le premier compte actif du profil ASTER_UI_ROLE ; /api/dev permet d'en changer
// (menu du compte) pour passer d'un profil à l'autre. Les postes sont émulés en mémoire.
export function uiDevelopment() {
  return {
    name: 'aster-local-workspace',
    async configureServer(server) {
      if (process.env.NODE_ENV === 'production' || server.config.server.host !== '127.0.0.1') throw new Error('Le mode local nécessite une écoute sur 127.0.0.1 hors production.');
      const role = (process.env.ASTER_UI_ROLE || 'admin').replace('super_admin', 'superadmin');
      if (!ROLES.includes(role)) throw new Error('Profil ASTER_UI_ROLE inconnu.');
      const namespace = createHash('sha256').update(server.config.root).digest('hex').slice(0, 12);
      const file = process.env.ASTER_UI_STATE_FILE || join(tmpdir(), `aster-workspace-${namespace}.json`);
      const repository = await createWorkspaceRepository({ file });
      let account = repository.state.comptes.find((c) => c.actif && c.role === role && (role === 'superadmin' || c.ecoleId === repository.state.ecoles[0]?.id));
      if (!account) throw new Error(`Aucun compte actif pour le profil ${role}.`);
      const actor = () => repository.actor(account.id);
      if (process.env.ASTER_UI_AGENTS !== '0') createAgentEmulator({ transport: directTransport(repository) }).start();

      const app = express();
      app.disable('x-powered-by');
      app.use('/api', (req, res, next) => {
        const host = req.get('host');
        const allowed = [`127.0.0.1:${server.config.server.port}`, `localhost:${server.config.server.port}`];
        if (!allowed.includes(host)) return res.sendStatus(403);
        if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method) && !req.path.startsWith('/agent/') && req.get('origin') !== `http://${host}`) return res.sendStatus(403);
        res.set('Cache-Control', 'no-store');
        next();
      });
      app.get('/api/me', (_req, res) => {
        const current = actor();
        if (!current) return res.status(401).json({ error: 'Connexion nécessaire.' });
        res.json({ user: userFromAccount(current, repository.state.ecoles.find((e) => e.id === current.ecoleId)?.nom) });
      });
      // Changement d'utilisateur, propre à ce mode
      app.get('/api/dev/comptes', (_req, res) => res.json({
        courant: account.id,
        comptes: repository.state.comptes.filter((c) => c.actif).map((c) => ({ id: c.id, nom: c.nom, role: c.role, ecole: repository.state.ecoles.find((e) => e.id === c.ecoleId)?.nom ?? null })),
      }));
      app.post('/api/dev/compte', express.json(), (req, res) => {
        const next = repository.state.comptes.find((c) => c.id === req.body?.id && c.actif);
        if (!next) return res.status(400).json({ error: 'Compte inconnu ou inactif.' });
        account = next;
        res.json({ ok: true });
      });
      app.use('/api/workspace', createWorkspaceRouter({ repository, actor }));
      app.use('/api/agent', createAgentRouter({ repository, token: process.env.AGENT_TOKEN || 'aster-agent-local' }));
      app.use('/api', (_req, res) => res.status(404).json({ error: 'Ressource introuvable.' }));
      server.middlewares.use(app);
    },
  };
}
