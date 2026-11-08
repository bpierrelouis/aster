/* ==========================================================================
   Fond « éclosion » : rubans lilas, iris, rosé et cœur, et la fleur ASTER
   en filigrane. Des bords nets : c'est ce que le verre réfracte.
   Statique (pas d'animation continue) : le verre reste fluide.
   Les couleurs viennent des tokens d'ambiance (--wp-*).
   ========================================================================== */

export function mountWallpaper(host) {
  const petals = Array.from({ length: 8 }, (_, i) =>
    `<ellipse cx="0" cy="-205" rx="78" ry="205" transform="rotate(${i * 45})"/>`).join('');
  host.innerHTML = `
  <svg viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <defs>
      <linearGradient id="wp-ga" x1="0" y1="0" x2="1" y2=".4">
        <stop offset="0" style="stop-color:var(--wp-a2)"/><stop offset=".55" style="stop-color:var(--wp-a1)"/><stop offset="1" style="stop-color:var(--wp-a2)"/>
      </linearGradient>
      <linearGradient id="wp-gb" x1="0" y1="1" x2="1" y2="0">
        <stop offset="0" style="stop-color:var(--wp-b1)"/><stop offset=".6" style="stop-color:var(--wp-b2)"/><stop offset="1" style="stop-color:var(--wp-b1)"/>
      </linearGradient>
      <linearGradient id="wp-gc" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" style="stop-color:var(--wp-c2)"/><stop offset="1" style="stop-color:var(--wp-c1)"/>
      </linearGradient>
      <linearGradient id="wp-gd" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" style="stop-color:var(--wp-d2);stop-opacity:0"/><stop offset=".35" style="stop-color:var(--wp-d1)"/><stop offset=".8" style="stop-color:var(--wp-d2)"/><stop offset="1" style="stop-color:var(--wp-d1);stop-opacity:.2"/>
      </linearGradient>
      <radialGradient id="wp-petal" cx="0" cy="0" r="420" gradientUnits="userSpaceOnUse">
        <stop offset=".1" style="stop-color:var(--wp-a1);stop-opacity:.0"/><stop offset=".45" style="stop-color:var(--wp-a1);stop-opacity:.55"/><stop offset="1" style="stop-color:var(--wp-b1);stop-opacity:.15"/>
      </radialGradient>
      <radialGradient id="wp-heart" cx=".5" cy=".5" r=".5">
        <stop offset="0" style="stop-color:var(--wp-c1);stop-opacity:.95"/><stop offset=".55" style="stop-color:var(--wp-c1);stop-opacity:.35"/><stop offset="1" style="stop-color:var(--wp-c1);stop-opacity:0"/>
      </radialGradient>
      <radialGradient id="wp-glow" cx=".5" cy=".5" r=".5">
        <stop offset="0" style="stop-color:var(--wp-a2);stop-opacity:.9"/><stop offset="1" style="stop-color:var(--wp-a2);stop-opacity:0"/>
      </radialGradient>
      <filter id="wp-soft" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="5"/></filter>
      <filter id="wp-softer" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="9"/></filter>
      <filter id="wp-grain" x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" stitchTiles="stitch"/>
        <feColorMatrix type="saturate" values="0"/>
        <feComponentTransfer><feFuncA type="table" tableValues="0 .07"/></feComponentTransfer>
      </filter>
    </defs>

    <rect width="1600" height="1000" style="fill:var(--base)"/>
    <ellipse cx="320" cy="140" rx="560" ry="300" fill="url(#wp-glow)" opacity=".8"/>

    <!-- Fleur ASTER en filigrane -->
    <g transform="translate(1330 860) rotate(12)" filter="url(#wp-softer)">
      <g fill="url(#wp-petal)">${petals}</g>
      <circle r="120" fill="url(#wp-heart)"/>
    </g>

    <g filter="url(#wp-soft)">
      <path fill="url(#wp-ga)" d="M-100 250C300 110 620 420 1010 300S1500 110 1750 200L1750 430C1450 330 1250 540 940 530S340 380-100 540Z"/>
      <path fill="url(#wp-gb)" d="M-100 830C250 650 540 770 840 650S1320 420 1750 520L1750 720C1360 630 1110 870 760 890S200 900-100 1010Z" opacity=".85"/>
      <path fill="url(#wp-gc)" d="M-100 1100C40 960 260 930 520 990L520 1100Z"/>
      <path fill="url(#wp-gd)" d="M-100 610C300 548 700 628 1100 566S1500 486 1750 520L1750 548C1500 518 1300 598 1100 600S300 584-100 640Z"/>
    </g>

    <g fill="none" style="stroke:var(--wp-line)" stroke-linecap="round">
      <path stroke-width="2" d="M-100 250C300 110 620 420 1010 300S1500 110 1750 200"/>
      <path stroke-width="1.2" opacity=".7" d="M-100 540C340 380 620 540 940 530S1450 330 1750 430"/>
      <path stroke-width="2" d="M-100 830C250 650 540 770 840 650S1320 420 1750 520"/>
    </g>

    <rect width="1600" height="1000" filter="url(#wp-grain)" style="mix-blend-mode:overlay"/>
  </svg>`;
}
