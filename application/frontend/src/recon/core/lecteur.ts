/* Lecture des codes : QR code, Data Matrix et codes-barres linéaires, par ZXing compilé en WebAssembly
   (ponyfill de l'API BarcodeDetector) ; le fichier .wasm est servi par l'application, jamais par un CDN. */
import { BarcodeDetector, prepareZXingModule } from 'barcode-detector/ponyfill';
import zxing from 'zxing-wasm/reader/zxing_reader.wasm?url';
import type { CodeLu } from '#shared/recon.ts';

prepareZXingModule({ overrides: { locateFile: (chemin: string, prefixe: string) => (chemin.endsWith('.wasm') ? zxing : prefixe + chemin) } });

export const FORMATS = ['qr_code', 'data_matrix', 'code_128', 'code_39', 'ean_13', 'ean_8', 'upc_a', 'upc_e', 'itf', 'codabar'] as const;

let detecteur: BarcodeDetector | null = null;
/** Tous les codes lus dans l'image : une étiquette en porte souvent plusieurs (modèle, EAN, numéro de série) */
export async function lireCodes(image: HTMLVideoElement): Promise<CodeLu[]> {
  detecteur ??= new BarcodeDetector({ formats: [...FORMATS] });
  const codes = await detecteur.detect(image);
  return codes.filter((c) => c.rawValue).map((c) => ({ format: c.format, valeur: c.rawValue }));
}
