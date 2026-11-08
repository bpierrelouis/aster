/* ==========================================================================
   Accueil : tableaux de bord personnalisables
   - « Mon tableau de bord », et les tableaux spécialisés Parc et Remontées (RG-36)
   - Mode édition (bouton ou appui long) : les widgets « respirent »
   - Glisser pour réordonner (FLIP), tailles S/M/L/XL, retrait, galerie d'ajout
   - Clavier en mode édition : ←/→ déplacer, Entrée taille suivante, Suppr retirer
   - Disposition persistée par rôle
   ========================================================================== */

import { useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { useParams } from 'react-router';
import { flip, uid, reduceMotion, $$ } from '../core/dom.js';
import { store, me } from '../core/store.js';
import { useStore } from '../core/useStore.js';
import { refreshLens } from '../core/glass.js';
import { can } from '../core/permissions.js';
import { SIZES, widgetDef } from '../widgets/catalog.jsx';
import { Widget, Gallery } from './dashboard-widgets.jsx';
import { Icon, Tile } from '../ui/icons.jsx';
import { Sheet, openSheet, notify } from '../ui/overlays.jsx';
import { useTitle } from '../ui/useTitle.js';
import { dateDay } from '../core/format.js';

const TITLES = { perso: 'Accueil', parc: 'Gestion du parc', remontees: 'Remontées' };

/** Déplace l'élément d'indice from à l'indice to (copie). */
const move = (list, from, to) => { const next = [...list]; next.splice(to, 0, ...next.splice(from, 1)); return next; };

/* ---------- Écran ---------- */

export function Dashboard() {
  const state = useStore();
  const { board: requested = 'perso' } = useParams();
  let boardId = requested;
  if (boardId !== 'perso' && !can(`dashboard.${boardId}`)) boardId = 'perso';
  if (!state.layouts[state.role]?.[boardId]) boardId = 'perso';
  useTitle(TITLES[boardId]);

  const [editing, setEditingState] = useState(false);
  const [order, setOrder] = useState(null); // ordre provisoire (identifiants) pendant un glisser
  const [live, setLive] = useState('');
  const boardRef = useRef(null);
  const editingRef = useRef(editing);
  editingRef.current = editing;
  const selfUpdate = useRef(false);
  const press = useRef(null); // { el, x, y, timer, pointerId }
  const drag = useRef(null);  // { el, grabX, grabY, lastTarget, raf, px, py }
  const liveTimer = useRef(0);

  // Les widgets retirés du catalogue sont ignorés dans les dispositions enregistrées
  const layout = (state.layouts[state.role]?.[boardId] ?? []).filter((w) => widgetDef(w.type));
  const items = order ? order.map((id) => layout.find((w) => w.id === id)).filter(Boolean) : layout;

  const announce = (msg) => { setLive(''); clearTimeout(liveTimer.current); liveTimer.current = setTimeout(() => setLive(msg), 30); };

  function setEditing(v) {
    setEditingState(v);
    editingRef.current = v;
    announce(v ? 'Mode personnalisation : glissez les widgets pour les réorganiser.' : 'Disposition enregistrée.');
  }

  /* ---------- Mutations de disposition ---------- */

  function saveLayout(mutator) {
    selfUpdate.current = true;
    store.update('layout', (s) => mutator(s.layouts[s.role][boardId]));
    selfUpdate.current = false;
  }

  const domIds = () => $$('.widget', boardRef.current).map((el) => el.dataset.id);
  const saveOrder = (ids) => saveLayout((l) => l.sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id)));
  const others = () => $$('.widget', boardRef.current);

  function setSize(el, size) {
    if (el.dataset.size === size) return;
    flip(others(), () => flushSync(() => saveLayout((l) => { const w = l.find((x) => x.id === el.dataset.id); if (w) w.size = size; })));
    refreshLens(el.querySelector('.widget-card'));
    announce(`Taille : ${SIZES[size].label}`);
  }

  function removeWidget(el) {
    const id = el.dataset.id;
    const done = () => {
      flip(others().filter((x) => x !== el), () => flushSync(() => saveLayout((l) => { const i = l.findIndex((x) => x.id === id); if (i >= 0) l.splice(i, 1); })));
      announce('Widget retiré');
    };
    if (reduceMotion()) return done();
    // l'opacité s'applique au verre lui-même, jamais à un ancêtre (sinon le flou perd son arrière-plan)
    el.querySelector('.widget-card').animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, easing: 'ease-in', fill: 'forwards' });
    el.querySelector('.widget-inner').animate([{ transform: 'scale(1)' }, { transform: 'scale(.82)' }], { duration: 200, easing: 'ease-in', fill: 'forwards' }).onfinish = done;
  }

  function addWidget(type, size) {
    const w = { id: uid('w'), type, size };
    flip(others(), () => flushSync(() => saveLayout((l) => l.push(w))));
    const el = boardRef.current.querySelector(`[data-id="${w.id}"]`);
    if (!reduceMotion()) {
      el.querySelector('.widget-inner').animate([{ transform: 'scale(.85)' }, { transform: 'scale(1)' }], { duration: 420, easing: 'cubic-bezier(.34,1.42,.64,1)' });
      el.querySelector('.widget-card').animate([{ opacity: 0 }, { opacity: 1 }], { duration: 240, easing: 'ease-out' });
    }
    el.scrollIntoView({ behavior: reduceMotion() ? 'auto' : 'smooth', block: 'center' });
    if (!editingRef.current) setEditing(true);
    notify('Widget ajouté', { icon: 'widgets' });
  }

  const openGallery = () => openSheet(
    <Sheet title="Ajouter un widget" size="l" lead={<Tile name="widgets" color="var(--c1)" size="m" />}>
      <Gallery onAdd={addWidget} />
    </Sheet>,
  );

  /* ---------- Glisser-déposer ---------- */

  const layoutPos = (el) => ({ x: el.offsetLeft, y: el.offsetTop, w: el.offsetWidth, h: el.offsetHeight });

  function placeDragged() {
    const { el, grabX, grabY, px, py } = drag.current;
    const br = boardRef.current.getBoundingClientRect();
    const p = layoutPos(el);
    el.style.transform = `translate(${px - grabX - (br.left + p.x)}px, ${py - grabY - (br.top + p.y)}px) scale(1.03)`;
  }

  function autoScroll() {
    const d = drag.current;
    if (!d) return;
    const edge = 90;
    const speed = d.py < edge ? -(edge - d.py) / 4 : d.py > innerHeight - edge ? (d.py - (innerHeight - edge)) / 4 : 0;
    if (speed) { scrollBy(0, speed); placeDragged(); }
    d.raf = requestAnimationFrame(autoScroll);
  }

  function startDrag(el, x, y) {
    const board = boardRef.current;
    const p = layoutPos(el);
    const br = board.getBoundingClientRect();
    drag.current = { el, grabX: x - (br.left + p.x), grabY: y - (br.top + p.y), lastTarget: null, px: x, py: y };
    el.classList.add('is-dragging');
    board.classList.add('has-drag');
    navigator.vibrate?.(8);
    autoScroll();
  }

  function hitTest() {
    const d = drag.current;
    const board = boardRef.current;
    const br = board.getBoundingClientRect();
    const x = d.px - br.left, y = d.py - br.top;
    let target = null;
    for (const w of $$('.widget', board)) {
      if (w === d.el) continue;
      const p = layoutPos(w);
      if (x >= p.x && x <= p.x + p.w && y >= p.y && y <= p.y + p.h) { target = w; break; }
    }
    if (!target) { d.lastTarget = null; return; }
    if (target === d.lastTarget) return;
    d.lastTarget = target;
    const all = $$('.widget', board);
    const next = move(all.map((w) => w.dataset.id), all.indexOf(d.el), all.indexOf(target));
    flip(others(), () => flushSync(() => setOrder(next)), { skip: d.el, duration: 320 });
    placeDragged();
  }

  function endDrag() {
    const { el, raf } = drag.current;
    cancelAnimationFrame(raf);
    const from = el.style.transform;
    el.style.transform = '';
    el.classList.remove('is-dragging');
    boardRef.current.classList.remove('has-drag');
    if (!reduceMotion() && from) {
      el.animate([{ transform: from }, { transform: 'none' }], { duration: 360, easing: 'cubic-bezier(.34,1.3,.64,1)' });
    }
    drag.current = null;
    saveOrder(domIds());
    setOrder(null);
  }

  function onPointerDown(e) {
    if (e.button !== 0) return;
    const el = e.target.closest('.widget');
    if (!el || e.target.closest('.w-remove, .w-sizes')) return;
    if (!editing && e.target.closest('button, .chart-host, .table')) return;
    const p = { el, x: e.clientX, y: e.clientY, pointerId: e.pointerId, timer: 0 };
    press.current = p;
    if (!editing) {
      p.timer = setTimeout(() => {
        if (press.current !== p) return;
        flushSync(() => setEditing(true));
        boardRef.current.setPointerCapture(p.pointerId);
        startDrag(p.el, p.x, p.y);
        placeDragged();
      }, 480);
    }
  }

  function onPointerMove(e) {
    if (drag.current) {
      drag.current.px = e.clientX; drag.current.py = e.clientY;
      placeDragged();
      hitTest();
      return;
    }
    const p = press.current;
    if (!p) return;
    const moved = Math.hypot(e.clientX - p.x, e.clientY - p.y);
    if (!editing) { if (moved > 8) { clearTimeout(p.timer); press.current = null; } return; }
    if (moved > 5) {
      boardRef.current.setPointerCapture(p.pointerId);
      startDrag(p.el, p.x, p.y);
      drag.current.px = e.clientX; drag.current.py = e.clientY;
      placeDragged();
      press.current = null;
    }
  }

  function release() {
    if (press.current) { clearTimeout(press.current.timer); press.current = null; }
    if (drag.current) endDrag();
  }

  /* ---------- Clavier ---------- */

  function onWidgetKey(e) {
    const el = e.currentTarget;
    if (!editing || e.target !== el) return;
    const all = $$('.widget', boardRef.current);
    const i = all.indexOf(el);
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp' || e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      const j = e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? i - 1 : i + 1;
      if (j < 0 || j >= all.length) return;
      flip(others(), () => flushSync(() => saveOrder(move(all.map((w) => w.dataset.id), i, j))));
      el.focus();
      announce(`Position ${j + 1} sur ${all.length}`);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const def = widgetDef(el.dataset.type);
      const k = def.sizes.indexOf(el.dataset.size);
      setSize(el, def.sizes[(k + 1) % def.sizes.length]);
    } else if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault();
      (all[i + 1] ?? all[i - 1])?.focus();
      removeWidget(el);
    }
  }

  /* ---------- Abonnements ---------- */

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape' && editingRef.current && !document.querySelector('dialog[open]')) setEditing(false); };
    document.addEventListener('keydown', onKey);
    // Changement de profil, échec d'enregistrement ou disposition modifiée ailleurs : sortie du mode édition
    const off = store.subscribe((topic) => {
      if (topic === 'role' || topic === 'all' || (topic === 'layout' && !selfUpdate.current)) { setEditingState(false); setOrder(null); }
    });
    return () => {
      document.removeEventListener('keydown', onKey);
      off();
      clearTimeout(liveTimer.current);
      clearTimeout(press.current?.timer);
      cancelAnimationFrame(drag.current?.raf);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const date = dateDay(Date.now());

  return <div className={`view-dashboard${editing ? ' is-editing' : ''}`}>
    <header className="page-head">
      <div className="page-title-wrap">
        <h1 className="page-title">{TITLES[boardId]}</h1>
        <span className="page-sub">{boardId === 'perso' ? date : me().nom}</span>
      </div>
      <div className="page-actions">
        <button type="button" className="btn btn--glass btn--icon" data-tip="Disposition par défaut" aria-label="Revenir à la disposition par défaut" hidden={!editing}
          onClick={() => { store.resetLayout(boardId); notify('Disposition par défaut', { icon: 'refresh', tone: 'info' }); }}>
          <Icon name="refresh" size={20} />
        </button>
        <button type="button" className="btn btn--glass btn--icon" data-tip="Ajouter un widget" aria-label="Ajouter un widget" hidden={!editing} onClick={openGallery}>
          <Icon name="widgets" size={20} />
        </button>
        <button type="button" className={`btn ${editing ? 'btn--primary' : 'btn--glass'}`} aria-pressed={editing} onClick={() => setEditing(!editing)}>
          <Icon name={editing ? 'check' : 'pencil'} size={18} /><span>{editing ? 'Terminé' : 'Personnaliser'}</span>
        </button>
      </div>
    </header>
    {/* Liens désactivés en mode édition */}
    <section ref={boardRef} className="board" aria-label="Widgets"
      onClickCapture={(e) => { if (editing && e.target.closest('a')) e.preventDefault(); }}
      onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={release} onPointerCancel={release}
      onLostPointerCapture={() => { if (drag.current) endDrag(); }}>
      {items.map((w) => <Widget key={w.id} w={w} editing={editing}
        onRemove={(e) => removeWidget(e.currentTarget.closest('.widget'))}
        onSize={(e, s) => setSize(e.currentTarget.closest('.widget'), s)}
        onKeyDown={onWidgetKey} />)}
    </section>
    <div className="sr-only" aria-live="polite">{live}</div>
  </div>;
}
