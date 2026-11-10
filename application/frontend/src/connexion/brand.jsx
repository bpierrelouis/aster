/* Marques des pages publiques : symbole MindefConnect et fleur ASTER */

export function MinDefSymbol() {
  const nodes = [[30, 12], [70, 12], [90, 50], [70, 88], [30, 88], [10, 50]];
  return <svg className="mindef-symbol" viewBox="0 0 100 100" aria-hidden="true">
    {/* Réseau : arêtes de l'hexagone et rayons vers le cercle central */}
    <g stroke="#007ac1" strokeWidth="2.5" strokeLinecap="round">
      {nodes.map(([x, y], i) => { const [nx, ny] = nodes[(i + 1) % 6]; return <line key={`e${i}`} x1={x} y1={y} x2={nx} y2={ny} />; })}
      {nodes.map(([x, y]) => <line key={`r${x}-${y}`} x1={x} y1={y} x2={50 + (x - 50) * 0.62} y2={50 + (y - 50) * 0.62} />)}
    </g>
    <circle cx="50" cy="50" r="25" fill="#4caf50" />
    {nodes.map(([cx, cy]) => <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="6" fill="#01a9f4" />)}
    <path d="M48 47a10 10 0 1 1 8 8l-18 18-7-7 5-5 4 2 3-3-2-4Z" fill="#01a9f4" stroke="#000091" strokeWidth="3" strokeLinejoin="round" />
    <circle cx="57" cy="44" r="3" fill="#000091" />
  </svg>;
}

/** Fleur ASTER : seize pétales iris et un cœur doré, comme la signature de la charte. */
export function AsterFlower({ className }) {
  return <svg className={className} viewBox="0 0 128 128" aria-hidden="true">
    {Array.from({ length: 16 }, (_, i) => <g key={i} transform={`rotate(${i * 22.5} 64 64)`}>
      <path className="petal" style={{ '--i': i }} fill={['#6954C0', '#8670CD', '#A28ADC'][i % 3]} d="M64 50 C56 41 53 17 62 9 C71 8 75 30 67 46 Q65 50 64 50Z" />
    </g>)}
    <circle className="flower-heart" cx="64" cy="64" r="11" fill="#E8B84E" />
  </svg>;
}
