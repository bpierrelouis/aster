/* ==========================================================================
   ASTER · Moteur du verre
   1. Lentille : pour chaque élément .glass[data-lens], génère une carte de
      déplacement (SDF d'un rectangle arrondi) et un filtre SVG appliqué en
      backdrop-filter. Les bords réfractent réellement ce qui est derrière.
   2. Lumière (ambiances claires) : un point lumineux suit le pointeur ;
      chaque surface reçoit --la (angle), --lx/--ly (position locale) et
      --li (intensité). Rien n'est recalculé pendant le défilement.
   3. Niveaux : liquid | frost | solid, avec repli automatique hors Chromium.
   ========================================================================== */

const SVG_NS = 'http://www.w3.org/2000/svg';
// La réfraction en backdrop-filter (url(#filtre)) n'est rendue que par Chromium (Chrome, Edge, Opera, Arc…)
const supportsLens =
  !!navigator.userAgentData?.brands?.some((b) => /Chromium/i.test(b.brand)) ||
  (/Chrome\/\d+/.test(navigator.userAgent) && !/Firefox|FxiOS/.test(navigator.userAgent));

let defs;                       // <svg> qui contient les filtres
let level = 'liquid';
let uid = 0;
const lensed = new Map();       // element -> { id, filter, w, h }
const mapCache = new Map();     // "w×h×r×b" -> dataURL
const ro = new ResizeObserver(onResize);
let resizeQueue = new Set();
let resizeTimer = 0;

/* --------------------------------------------------------------------------
   Carte de déplacement
   R = déplacement X, G = déplacement Y (128 = neutre). On échantillonne vers
   l'intérieur : le bord grossit ce qui est derrière, comme une lentille convexe.
   -------------------------------------------------------------------------- */
function displacementMap(w, h, r, bezel) {
  const key = `${w}x${h}x${r}x${bezel}`;
  if (mapCache.has(key)) return mapCache.get(key);
  // demi-résolution : la carte est lisse, le navigateur l'agrandit
  const s = 0.5;
  const cw = Math.max(2, Math.round(w * s));
  const ch = Math.max(2, Math.round(h * s));
  const canvas = document.createElement('canvas');
  canvas.width = cw;
  canvas.height = ch;
  const ctx = canvas.getContext('2d');
  const img = ctx.createImageData(cw, ch);
  const data = img.data;
  const hw = w / 2, hh = h / 2;
  const rr = Math.min(r, hw, hh);
  for (let j = 0; j < ch; j++) {
    const py = (j + 0.5) / s - hh;
    for (let i = 0; i < cw; i++) {
      const px = (i + 0.5) / s - hw;
      // SDF d'un rectangle arrondi + normale analytique
      const qx = Math.abs(px) - (hw - rr);
      const qy = Math.abs(py) - (hh - rr);
      let dist, nx, ny;
      if (qx > 0 && qy > 0) {
        const l = Math.hypot(qx, qy) || 1;
        dist = l - rr;
        nx = (qx / l) * Math.sign(px);
        ny = (qy / l) * Math.sign(py);
      } else if (qx > qy) {
        dist = qx - rr;
        nx = Math.sign(px); ny = 0;
      } else {
        dist = qy - rr;
        nx = 0; ny = Math.sign(py);
      }
      const inside = -dist;          // distance au bord, positive à l'intérieur
      let dx = 0, dy = 0;
      if (inside > 0 && inside < bezel) {
        const t = 1 - inside / bezel; // 1 au bord, 0 à l'intérieur du biseau
        const m = t * t * (3 - 2 * t); // profil doux (smoothstep)
        dx = -nx * m;                  // vers l'intérieur
        dy = -ny * m;
      }
      const k = (j * cw + i) * 4;
      data[k] = 128 + dx * 127;
      data[k + 1] = 128 + dy * 127;
      data[k + 2] = 128;
      data[k + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  const url = canvas.toDataURL();
  if (mapCache.size > 120) mapCache.clear();
  mapCache.set(key, url);
  return url;
}

function ensureDefs() {
  if (defs) return defs;
  defs = document.createElementNS(SVG_NS, 'svg');
  defs.setAttribute('aria-hidden', 'true');
  defs.setAttribute('width', '0');
  defs.setAttribute('height', '0');
  defs.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden;pointer-events:none';
  document.body.appendChild(defs);
  return defs;
}

/**
 * Construit (ou met à jour) le filtre d'un élément.
 * Profil "soft" pour les grandes surfaces, "strong" pour les contrôles
 * (avec aberration chromatique : trois canaux déplacés différemment).
 */
function buildFilter(el, entry) {
  const rect = el.getBoundingClientRect();
  // dimensions de mise en page (sans transformation en cours)
  const w = Math.round(el.offsetWidth || rect.width);
  const h = Math.round(el.offsetHeight || rect.height);
  if (w < 8 || h < 8) return;
  const cs = getComputedStyle(el);
  const r = parseFloat(cs.borderTopLeftRadius) || 0;
  const strong = el.dataset.lens === 'strong';
  // Biseau étroit : seul le bord réfracte, le centre reste lisible
  const bezel = Math.round(Math.min(strong ? 16 : 20, Math.min(w, h) / 3.4, Math.max(r * .9, 10)));
  const scale = Math.round(bezel * (strong ? 1.25 : 1));
  const blur = strong ? 7 : (parseFloat(cs.getPropertyValue('--lens-blur')) || 11);
  const sat = strong ? 1.8 : 1.7;
  if (entry.w === w && entry.h === h && entry.r === r) return;
  Object.assign(entry, { w, h, r });

  const href = displacementMap(w, h, r, bezel);
  const f = entry.filter;
  f.setAttribute('x', '0');
  f.setAttribute('y', '0');
  f.setAttribute('width', w);
  f.setAttribute('height', h);
  f.setAttribute('filterUnits', 'userSpaceOnUse');
  f.setAttribute('color-interpolation-filters', 'sRGB');

  const disp = (inp, sc, res) =>
    `<feDisplacementMap in="${inp}" in2="map" scale="${sc}" xChannelSelector="R" yChannelSelector="G" result="${res}"/>`;
  const chan = (inp, m, res) => `<feColorMatrix in="${inp}" type="matrix" values="${m}" result="${res}"/>`;

  f.innerHTML = `
    <feImage href="${href}" x="0" y="0" width="${w}" height="${h}" preserveAspectRatio="none" result="map"/>
    <feGaussianBlur in="SourceGraphic" stdDeviation="${blur}" result="blur"/>
    ${strong ? `
      ${disp('blur', scale, 'dr')}${chan('dr', '1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0', 'r')}
      ${disp('blur', Math.round(scale * 0.95), 'dg')}${chan('dg', '0 0 0 0 0 0 1 0 0 0 0 0 0 0 0 0 0 0 1 0', 'g')}
      ${disp('blur', Math.round(scale * 0.9), 'db')}${chan('db', '0 0 0 0 0 0 0 0 0 0 0 0 1 0 0 0 0 0 1 0', 'b')}
      <feBlend in="r" in2="g" mode="screen" result="rg"/>
      <feBlend in="rg" in2="b" mode="screen" result="rgb"/>
      <feColorMatrix in="rgb" type="saturate" values="${sat}"/>
    ` : `
      ${disp('blur', scale, 'd')}
      <feColorMatrix in="d" type="saturate" values="${sat}"/>
    `}`;
}

function attach(el) {
  if (lensed.has(el)) return;
  ensureDefs();
  const id = `lens-${++uid}`;
  const filter = document.createElementNS(SVG_NS, 'filter');
  filter.id = id;
  defs.appendChild(filter);
  const entry = { id, filter, w: 0, h: 0, r: -1 };
  lensed.set(el, entry);
  buildFilter(el, entry);
  el.style.setProperty('backdrop-filter', `url(#${id})`);
  el.style.setProperty('-webkit-backdrop-filter', `url(#${id})`);
  el.classList.add('is-lensed');
  ro.observe(el);
}

function detach(el) {
  const entry = lensed.get(el);
  if (!entry) return;
  entry.filter.remove();
  lensed.delete(el);
  ro.unobserve(el);
  el.style.removeProperty('backdrop-filter');
  el.style.removeProperty('-webkit-backdrop-filter');
  el.classList.remove('is-lensed');
}

function onResize(entries) {
  for (const e of entries) resizeQueue.add(e.target);
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    for (const el of resizeQueue) {
      const entry = lensed.get(el);
      if (entry && el.isConnected) buildFilter(el, entry);
    }
    resizeQueue = new Set();
  }, 90);
}

/** Force le recalcul (ex. après un changement de taille de widget). */
export function refreshLens(el) {
  const entry = lensed.get(el);
  if (entry) { entry.w = 0; buildFilter(el, entry); }
}

function scan(root = document) {
  const lensOn = level === 'liquid' && supportsLens;
  const nodes = root.querySelectorAll ? root.querySelectorAll('.glass[data-lens]') : [];
  for (const el of nodes) (lensOn ? attach : detach)(el);
  if (root instanceof Element && root.matches?.('.glass[data-lens]')) (lensOn ? attach : detach)(root);
}

/* --------------------------------------------------------------------------
   Lumière qui suit le pointeur
   -------------------------------------------------------------------------- */
let px = -9999, py = -9999, raf = 0, dirty = true;
let surfaces = [];

function updateLight() {
  raf = 0;
  if (dirty) { surfaces = [...document.querySelectorAll('.glass')]; dirty = false; }
  const vh = innerHeight;
  for (const el of surfaces) {
    const r = el.getBoundingClientRect();
    if (r.bottom < -40 || r.top > vh + 40 || r.width === 0) continue;
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const dx = Math.max(r.left - px, 0, px - r.right);
    const dy = Math.max(r.top - py, 0, py - r.bottom);
    const li = Math.max(0.12, 1 - Math.hypot(dx, dy) / 420);
    // Surfaces éloignées : on ne repeint qu'une fois en sortant de la zone
    const far = li <= 0.12;
    if (far && el._lightFar) continue;
    el._lightFar = far;
    const ang = (Math.atan2(px - cx, -(py - cy)) * 180) / Math.PI;
    const s = el.style;
    s.setProperty('--la', `${ang.toFixed(1)}deg`);
    s.setProperty('--lx', `${Math.round(px - r.left)}px`);
    s.setProperty('--ly', `${Math.round(py - r.top)}px`);
    s.setProperty('--li', li.toFixed(2));
  }
}

function onPointer(e) {
  if (e.pointerType === 'touch' || document.documentElement.dataset.ambiance === 'encre') return;
  px = e.clientX; py = e.clientY;
  if (!raf) raf = requestAnimationFrame(updateLight);
}

/* --------------------------------------------------------------------------
   API
   -------------------------------------------------------------------------- */
export function setGlassLevel(next) {
  level = next;
  document.documentElement.dataset.glass = next;
  if (next !== 'liquid' || !supportsLens) for (const el of [...lensed.keys()]) detach(el);
  scan(document);
}

export function glassInfo() {
  return { level, supportsLens, lensed: lensed.size };
}

export function initGlass(initialLevel = 'liquid') {
  level = initialLevel;
  document.documentElement.dataset.glass = level;
  if (!supportsLens) document.documentElement.dataset.lens = 'off';

  const mo = new MutationObserver((muts) => {
    dirty = true;
    for (const m of muts) {
      for (const n of m.addedNodes) if (n.nodeType === 1) scan(n);
      for (const n of m.removedNodes) {
        if (n.nodeType !== 1) continue;
        if (lensed.has(n)) detach(n);
        n.querySelectorAll?.('.is-lensed').forEach((c) => { if (!c.isConnected) detach(c); });
      }
    }
  });
  mo.observe(document.body, { childList: true, subtree: true });
  addEventListener('pointermove', onPointer, { passive: true });
  scan(document);
}
