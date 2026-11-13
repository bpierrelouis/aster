/* Application mobile de recensement (RECON) : PWA servie par le relais, hors du réseau d'ORION.
   Ressources de lecture (ZXing, Tesseract, langue anglaise) servies par l'application, jamais par un CDN, et
   précachées par le service worker (recon/sw-modele.js) pour le travail hors ligne. */
import { defineConfig } from 'vite';
import type { Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('./recon', import.meta.url));
const publicDir = fileURLToPath(new URL('./recon/public', import.meta.url));
const application = fileURLToPath(new URL('..', import.meta.url));
const LANGUE = 'ocr/eng.traineddata.gz';
const langue = () => readFileSync(fileURLToPath(new URL('../node_modules/@tesseract.js-data/eng/4.0.0_best_int/eng.traineddata.gz', import.meta.url)));

/** Données de la langue anglaise de Tesseract (modèle LSTM entier) : servies en développement, émises au build */
function ocrLangue(): Plugin {
  return {
    name: 'recon-ocr-langue',
    configureServer(server) {
      server.middlewares.use(`/${LANGUE}`, (_req, res) => { res.setHeader('Content-Type', 'application/gzip'); res.end(langue()); });
    },
    generateBundle() { this.emitFile({ type: 'asset', fileName: LANGUE, source: langue() }); },
  };
}

/** Service worker : modèle complété par la liste des fichiers à précacher et une version propre au build */
function serviceWorker(): Plugin {
  return {
    name: 'recon-service-worker',
    apply: 'build',
    enforce: 'post',
    generateBundle(_options, bundle) {
      const publics = readdirSync(publicDir);
      const fichiers = [...new Set(['/', ...Object.keys(bundle), LANGUE, ...publics].filter((f) => !f.endsWith('.map') && f !== 'index.html').map((f) => (f === '/' ? f : `/${f}`)))].sort();
      const version = createHash('sha256').update(fichiers.join('\n')).digest('hex').slice(0, 12);
      const modele = readFileSync(fileURLToPath(new URL('./recon/sw-modele.js', import.meta.url)), 'utf8');
      this.emitFile({ type: 'asset', fileName: 'sw.js', source: `const VERSION = '${version}';\nconst FICHIERS = ${JSON.stringify(fichiers)};\n${modele}` });
    },
  };
}

export default defineConfig({
  root,
  publicDir,
  plugins: [react(), ocrLangue(), serviceWorker()],
  build: { outDir: fileURLToPath(new URL('./dist-recon', import.meta.url)), emptyOutDir: true, assetsInlineLimit: 0, chunkSizeWarningLimit: 1200 },
  server: {
    host: '127.0.0.1', port: 5175, strictPort: true,
    fs: { allow: [application] },
    proxy: { '/api': 'http://127.0.0.1:3002' },
  },
  preview: { host: '127.0.0.1', port: 5175, strictPort: true },
});
