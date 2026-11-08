/* ==========================================================================
   Infobulle globale pour [data-tip], construite en texte (jamais en HTML) :
   - data-tip       : texte, les retours à la ligne sont conservés
   - data-tip-title : première ligne en gras (facultatif)
   - data-tip-kbd   : raccourci clavier (facultatif)
   - data-tip-pos   : top (défaut) | bottom
   ========================================================================== */

let tipEl;
let tipTarget = null;

const el = (tag, className, text) => { const n = document.createElement(tag); if (className) n.className = className; if (text != null) n.textContent = text; return n; };

function fill(parts) {
  tipEl.replaceChildren();
  const { title, text, kbd, rows } = parts;
  if (rows) {
    // Graphiques : titre puis une ligne par série (pastille de couleur, nom, valeur)
    tipEl.append(el('div', 'tip-title', title));
    for (const r of rows) {
      const key = el('span', 'tip-key');
      key.style.background = r.color;
      const row = el('div', 'tip-row');
      row.append(key, r.name, el('b', null, r.value));
      tipEl.append(row);
    }
    return;
  }
  if (title) { const b = document.createElement('b'); b.textContent = title; tipEl.append(b); }
  (text ?? '').split('\n').filter((line, i) => line || i).forEach((line) => {
    if (tipEl.childNodes.length) tipEl.append(document.createElement('br'));
    tipEl.append(line);
  });
  if (kbd) { const k = document.createElement('kbd'); k.textContent = kbd; tipEl.append(k); }
}

function place(left, top) {
  tipEl.style.transform = `translate(${Math.round(left)}px, ${Math.round(top)}px)`;
}

function showTip(target) {
  const text = target.getAttribute('data-tip');
  if (!text && !target.dataset.tipTitle) return;
  tipTarget = target;
  fill({ title: target.dataset.tipTitle, text, kbd: target.dataset.tipKbd });
  tipEl.classList.add('is-on');
  const r = target.getBoundingClientRect();
  const t = tipEl.getBoundingClientRect();
  let top = target.dataset.tipPos === 'bottom' ? r.bottom + 8 : r.top - t.height - 8;
  if (top < 8) top = r.bottom + 8;
  place(Math.max(8, Math.min(innerWidth - t.width - 8, r.left + r.width / 2 - t.width / 2)), top);
}

function hideTip() {
  tipTarget = null;
  tipEl?.classList.remove('is-on');
}

export function initTooltips() {
  if (tipEl) return;
  tipEl = document.createElement('div');
  tipEl.className = 'tooltip';
  tipEl.setAttribute('role', 'tooltip');
  document.body.appendChild(tipEl);
  const selector = '[data-tip], [data-tip-title]';
  document.addEventListener('pointerover', (e) => {
    const t = e.target.closest?.(selector);
    if (t && t !== tipTarget) showTip(t);
    else if (!t && tipTarget) hideTip();
  });
  document.addEventListener('focusin', (e) => {
    const t = e.target.closest?.(selector);
    if (t && t.matches(':focus-visible')) showTip(t);
  });
  document.addEventListener('focusout', hideTip);
  document.addEventListener('pointerdown', hideTip, true);
  addEventListener('scroll', hideTip, { passive: true, capture: true });
}

/**
 * Infobulle libre (ex. survol de graphique), à la position donnée.
 * @param {{title?: string, text?: string, rows?: {color: string, name: string, value: string}[]} | null} content
 *        null masque l'infobulle
 */
export function floatTip(content, x, y) {
  if (!tipEl) return;
  if (content == null) { hideTip(); return; }
  tipTarget = null;
  fill(content);
  tipEl.classList.add('is-on');
  const t = tipEl.getBoundingClientRect();
  let top = y - t.height - 14;
  if (top < 8) top = y + 18;
  place(Math.max(8, Math.min(innerWidth - t.width - 8, x - t.width / 2)), top);
}
