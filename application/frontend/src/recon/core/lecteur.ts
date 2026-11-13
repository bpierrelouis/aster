/* Lecture des codes : QR code, Data Matrix et codes-barres linéaires, par ZXing compilé en WebAssembly
   (ponyfill de l'API BarcodeDetector) ; le fichier .wasm est servi par l'application, jamais par un CDN. */
import { BarcodeDetector, prepareZXingModule } from 'barcode-detector/ponyfill';
import zxing from 'zxing-wasm/reader/zxing_reader.wasm?url';

prepareZXingModule({ overrides: { locateFile: (chemin: string, prefixe: string) => (chemin.endsWith('.wasm') ? zxing : prefixe + chemin) } });

export const FORMATS = ['qr_code', 'data_matrix', 'code_128', 'code_39', 'ean_13', 'ean_8', 'upc_a', 'upc_e', 'itf', 'codabar'] as const;

let detecteur: BarcodeDetector | null = null;
/** Premier code lu dans l'image ; null si aucun */
export async function lireCode(image: HTMLVideoElement): Promise<string | null> {
  detecteur ??= new BarcodeDetector({ formats: [...FORMATS] });
  const codes = await detecteur.detect(image);
  return codes.find((c) => c.rawValue)?.rawValue ?? null;
}
