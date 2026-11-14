/* QR code en SVG, tracé en JSX à partir de la matrice du paquet uqr (correction d'erreur moyenne, marge de 4 modules). */
import { useMemo } from 'react';
import { encode } from 'uqr';

export function QrCode({ value, label, className = '' }: { value: string; label: string; className?: string }) {
  const { size, d } = useMemo(() => {
    const { data, size } = encode(value, { ecc: 'M', border: 4 });
    let path = '';
    data.forEach((ligne, y) => ligne.forEach((plein, x) => { if (plein) path += `M${x} ${y}h1v1h-1z`; }));
    return { size, d: path };
  }, [value]);
  return <svg className={`qr ${className}`.trim()} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={label} shapeRendering="crispEdges">
    <rect width={size} height={size} fill="#fff" />
    <path d={d} fill="#040b1e" />
  </svg>;
}
