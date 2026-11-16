/* Compression des captures par pngquant, commune à captures.ts et captures-rigel.ts ; sans shell, donc valable sous
   Windows, macOS et Linux. pngquant doit être installé (brew, apt, winget) ou désigné par PNGQUANT. */
import { spawnSync } from 'node:child_process';
import { readdirSync } from 'node:fs';

export function compresserCaptures(dossier: string, retenir: (nom: string) => boolean) {
  const fichiers = readdirSync(dossier).filter((f) => f.endsWith('.png') && retenir(f));
  const { status, error } = spawnSync(process.env.PNGQUANT || 'pngquant', ['--quality=70-90', '--skip-if-larger', '--strip', '--force', '--ext', '.png', '--', ...fichiers], { cwd: dossier, stdio: 'inherit' });
  if (error) throw new Error(`pngquant introuvable : installez-le ou indiquez son chemin dans PNGQUANT (${error.message}).`);
  // 98 : image compressée plus lourde, 99 : qualité minimale non atteinte ; l'image d'origine est gardée
  if (status !== 0 && status !== 98 && status !== 99) throw new Error(`pngquant a échoué (code ${status}).`);
}
