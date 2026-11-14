/* Lecture des numéros de série (OCR) sur le téléphone : Tesseract compilé en WebAssembly, dans un worker,
   modèle LSTM anglais, une ligne de capitales, chiffres, tirets et barres obliques. Toutes les ressources
   sont servies par l'application et précachées : la lecture fonctionne hors ligne. */
import { createWorker, OEM, PSM } from 'tesseract.js';
import type { Worker } from 'tesseract.js';
import workerPath from 'tesseract.js/dist/worker.min.js?url';
import coeurSimd from 'tesseract.js-core/tesseract-core-simd-lstm.wasm.js?url';
import coeur from 'tesseract.js-core/tesseract-core-lstm.wasm.js?url';

/* Module WebAssembly minimal utilisant une instruction SIMD : valide si le navigateur prend en charge SIMD */
const SIMD = new Uint8Array([0, 97, 115, 109, 1, 0, 0, 0, 1, 5, 1, 96, 0, 1, 123, 3, 2, 1, 0, 10, 10, 1, 8, 0, 65, 0, 253, 15, 253, 98, 11]);

let worker: Promise<Worker> | null = null;
function lecteur() {
  worker ??= (async () => {
    const w = await createWorker('eng', OEM.LSTM_ONLY, {
      workerPath, corePath: WebAssembly.validate(SIMD) ? coeurSimd : coeur, langPath: '/ocr', workerBlobURL: false, cacheMethod: 'none', gzip: true,
    });
    await w.setParameters({ tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-/', tessedit_pageseg_mode: PSM.SINGLE_LINE });
    return w;
  })().catch((error) => { worker = null; throw error; });
  return worker;
}

/** Charge le lecteur à l'avance (après l'appairage), pour que ses ressources soient en cache */
export const precharger = () => lecteur().then(() => undefined);

/**
 * Lit la bande centrale de l'image de la vidéo : recadrage (90 % de la largeur, 22 % de la hauteur), agrandissement,
 * niveaux de gris et étirement du contraste, puis reconnaissance.
 */
export async function lireTexte(video: HTMLVideoElement) {
  const l = video.videoWidth, h = video.videoHeight;
  const bande = { x: l * 0.05, y: h * 0.39, l: l * 0.9, h: h * 0.22 };
  const echelle = Math.min(2, 1600 / bande.l);
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bande.l * echelle);
  canvas.height = Math.round(bande.h * echelle);
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
  ctx.drawImage(video, bande.x, bande.y, bande.l, bande.h, 0, 0, canvas.width, canvas.height);
  const image = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const p = image.data;
  let min = 255, max = 0;
  for (let i = 0; i < p.length; i += 4) {
    const g = 0.299 * p[i] + 0.587 * p[i + 1] + 0.114 * p[i + 2];
    p[i] = g;
    if (g < min) min = g;
    if (g > max) max = g;
  }
  const etendue = Math.max(1, max - min);
  for (let i = 0; i < p.length; i += 4) p[i] = p[i + 1] = p[i + 2] = ((p[i] - min) * 255) / etendue;
  ctx.putImageData(image, 0, 0);
  const { data } = await (await lecteur()).recognize(canvas);
  return data.text.trim();
}
