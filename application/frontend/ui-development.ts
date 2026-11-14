import express from 'express';
import type { Plugin } from 'vite';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { createWorkspaceRepository } from '../backend/workspace/engine.ts';
import { createWorkspaceRouter, createAgentRouter, createRigelRouter } from '../backend/workspace/routes.ts';
import { createAgentEmulator, directTransport } from '../backend/demonstrateur/agents.ts';
import { userFromAccount } from '../backend/profiles.ts';
import { isRole } from '#shared/catalog.ts';

// Mode interface seule : mêmes règles et même API, sans fournisseur d'identité ni base de données.
// L'utilisateur est d'abord le premier compte actif du profil ORION_UI_ROLE ; /api/dev permet d'en changer
// (menu du compte) pour passer d'un profil à l'autre. Les postes sont émulés en mémoire.
export function uiDevelopment(): Plugin {
  return {
    name: 'orion-local-workspace',
    async configureServer(server) {
      if (process.env.NODE_ENV === 'production' || server.config.server.host !== '127.0.0.1') throw new Error('Le mode local nécessite une écoute sur 127.0.0.1 hors production.');
      const role = process.env.ORION_UI_ROLE || 'admin';
      if (!isRole(role)) throw new Error('Profil ORION_UI_ROLE inconnu.');
      const namespace = createHash('sha256').update(server.config.root).digest('hex').slice(0, 12);
      const file = process.env.ORION_UI_STATE_FILE || join(tmpdir(), `orion-workspace-${namespace}.json`);
      const repository = await createWorkspaceRepository({ file });
      const initial = await repository.snapshot();
      let account = initial.comptes.find((c) => c.actif && c.role === role && (role === 'superadmin' || c.ecoleId === initial.ecoles[0]?.id));
      if (!account) throw new Error(`Aucun compte actif pour le profil ${role}.`);
      await repository.connexion(account.id); // ouverture de session simulée : dernière connexion fixée par le serveur
      const actor = () => repository.actor(account!.id);
      if (process.env.ORION_UI_AGENTS !== '0') createAgentEmulator({ transport: directTransport(repository) }).start();

      const app = express();
      app.disable('x-powered-by');
      app.use('/api', (req, res, next) => {
        const host = req.get('host');
        const allowed: (string | undefined)[] = [`127.0.0.1:${server.config.server.port}`, `localhost:${server.config.server.port}`];
        if (!allowed.includes(host)) return res.sendStatus(403);
        if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method) && !/^\/(agent|rigel)\//.test(req.path) && req.get('origin') !== `http://${host}`) return res.sendStatus(403);
        res.set('Cache-Control', 'no-store');
        next();
      });
      app.get('/api/me', async (_req, res) => {
        const current = await actor();
        if (!current) return res.status(401).json({ error: 'Connexion nécessaire.' });
        res.json({ user: userFromAccount(current, (await repository.snapshot()).ecoles.find((e) => e.id === current.ecoleId)?.nom) });
      });
      // Changement d'utilisateur, propre à ce mode
      app.get('/api/dev/comptes', async (_req, res) => {
        const state = await repository.snapshot();
        res.json({
          courant: account!.id,
          comptes: state.comptes.filter((c) => c.actif).map((c) => ({ id: c.id, nom: c.nom, role: c.role, ecole: state.ecoles.find((e) => e.id === c.ecoleId)?.nom ?? null })),
        });
      });
      app.post('/api/dev/compte', express.json(), async (req, res) => {
        const next = (await repository.snapshot()).comptes.find((c) => c.id === req.body?.id && c.actif);
        if (!next) return res.status(400).json({ error: 'Compte inconnu ou inactif.' });
        account = next;
        await repository.connexion(next.id);
        res.json({ ok: true });
      });
      const agentToken = process.env.AGENT_TOKEN || 'orion-agent-local';
      const rigel = { secret: process.env.RIGEL_SECRET || 'orion-rigel-local', url: process.env.RIGEL_URL || 'http://localhost:5175' };
      app.use('/api/workspace', createWorkspaceRouter({ repository, actor, agentToken, rigel }));
      app.use('/api/agent', createAgentRouter({ repository, token: agentToken }));
      app.use('/api/rigel', createRigelRouter({ repository, secret: rigel.secret }));
      app.use('/api', (_req, res) => res.status(404).json({ error: 'Adresse inconnue.' }));
      server.middlewares.use(app);
    },
  };
}
