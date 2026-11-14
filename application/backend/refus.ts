/* ==========================================================================
   Refus avant lecture du corps (session, origine, jeton) : le corps envoyé est
   d'abord lu puis ignoré, sinon la connexion est coupée pendant son envoi et un
   proxy (celui de Vite en développement) peut répondre 502 au lieu du refus.
   ========================================================================== */
import type { Request, Response } from 'express';

/** Au-delà, le corps n'est pas lu : la connexion est fermée avec la réponse */
const LECTURE_MAX = 16 * 1024 * 1024;

export function refuser(req: Request, res: Response, statut: number, corps: unknown) {
  const repondre = () => { if (!res.headersSent) res.status(statut).json(corps); };
  const taille = Number(req.get('content-length') ?? 0);
  if (req.complete || (!taille && !req.get('transfer-encoding'))) return repondre();
  if (taille > LECTURE_MAX) { res.set('Connection', 'close'); return repondre(); }
  req.once('end', repondre).once('error', repondre).resume();
}
