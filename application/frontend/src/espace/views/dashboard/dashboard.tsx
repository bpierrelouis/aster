/* ==========================================================================
   Accueil : tableaux de bord personnalisables
   - « Mon tableau de bord », les tableaux spécialisés Parc et Remontées (RG-36)
     et les tableaux ajoutés par le compte (dashboard-boards.tsx)
   - Mode édition (bouton ou appui long) : les widgets « respirent »
   - Glisser pour réordonner (FLIP), tailles S/M/L/XL, retrait, galerie d'ajout
   - Clavier en mode édition : ←/→ déplacer, Entrée taille suivante, Suppr retirer
   - Disposition persistée par rôle
   ========================================================================== */

import { useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { useNavigate, useParams } from 'react-router';
import { flip, uid, reduceMotion, $$ } from '../../core/dom.ts';
import { store } from '../../core/store.ts';
import { useStore } from '../../hooks/use-store.ts';
import { refreshLens } from '../../core/glass.ts';
import { can } from '../../core/permissions.ts';
import { SIZES, widgetDef } from '../../widgets/catalog.tsx';
import { PageHead } from '../../widgets/parts.tsx';
import { Widget, Gallery } from './dashboard-widgets.tsx';
import { customBoards, openBoardForm, deleteBoard } from './dashboard-boards.tsx';
import { Icon, Tile } from '../../ui/icons.tsx';
import { Sheet, openSheet, notify } from '../../ui/overlays.tsx';
import { useTitle } from '../../hooks/use-title.ts';
import { useFitRows } from '../../hooks/use-peek.ts';
import { useBoardDrag, move } from '../../hooks/use-board-drag.ts';
import type { KeyboardEvent } from 'react';
import type { Board, Layout, Widget as WidgetItem, WidgetSize } from '#shared/types.ts';
import type { Capability } from '../../core/permissions.ts';

const TITLES: Record<Board, string> = { perso: 'Accueil', parc: 'Gestion du parc', remontees: 'Remontées' };

/** Widgets d'un tableau (prédéfini ou ajouté) ; « tableaux » n'est jamais un identifiant de tableau. */
const widgetsOf = (layout: Layout | undefined, boardId: string) => layout?.[boardId] as WidgetItem[] | undefined;

/* ---------- Écran ---------- */

export function Dashboard() {
  const state = useStore();
  const navigate = useNavigate();
  const { board: requested = 'perso' } = useParams();
  const custom = customBoards().find((b) => b.id === requested) ?? null;
  let boardId = requested;
  if (!custom && boardId !== 'perso' && !can(`dashboard.${boardId}` as Capability)) boardId = 'perso';
  if (!state.layouts[state.role]?.[boardId]) boardId = 'perso';
  const board = boardId === requested ? custom : null; // tableau personnalisé affiché
  const title = board?.nom ?? TITLES[boardId as Board]; // sans tableau personnalisé, boardId est un tableau prédéfini
  useTitle(title);

  const [editing, setEditingState] = useState(false);
  const [order, setOrder] = useState<string[] | null>(null); // ordre provisoire (identifiants) pendant un glisser
  const [live, setLive] = useState('');
  const boardRef = useRef<HTMLElement>(null);
  const editingRef = useRef(editing);
  editingRef.current = editing;
  const selfUpdate = useRef(false);
  const liveTimer = useRef(0);

  // Les widgets retirés du catalogue sont ignorés dans les dispositions enregistrées
  const layout = (widgetsOf(state.layouts[state.role], boardId) ?? []).filter((w) => widgetDef(w.type));
  const items = order ? order.map((id) => layout.find((w) => w.id === id)).filter(Boolean) as WidgetItem[] : layout;

  const announce = (msg: string) => { setLive(''); clearTimeout(liveTimer.current); liveTimer.current = setTimeout(() => setLive(msg), 30); };

  function setEditing(v: boolean) {
    setEditingState(v);
    editingRef.current = v;
    announce(v ? 'Mode personnalisation : glissez les widgets pour les réorganiser.' : 'Disposition enregistrée.');
  }

  /* ---------- Mutations de disposition ---------- */

  function saveLayout(mutator: (l: WidgetItem[]) => void) {
    selfUpdate.current = true;
    store.update('layout', (s) => mutator(widgetsOf(s.layouts[s.role], boardId)!));
    selfUpdate.current = false;
  }

  const saveOrder = (ids: string[]) => saveLayout((l) => l.sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id)));
  const others = () => $$('.widget', boardRef.current!);

  function setSize(el: HTMLElement, size: WidgetSize) {
    if (el.dataset.size === size) return;
    flip(others(), () => flushSync(() => saveLayout((l) => { const w = l.find((x) => x.id === el.dataset.id); if (w) w.size = size; })));
    refreshLens(el.querySelector('.widget-card'));
    announce(`Taille : ${SIZES[size].label}`);
  }

  function removeWidget(el: HTMLElement) {
    const id = el.dataset.id;
    const done = () => {
      flip(others().filter((x) => x !== el), () => flushSync(() => saveLayout((l) => { const i = l.findIndex((x) => x.id === id); if (i >= 0) l.splice(i, 1); })));
      announce('Widget retiré');
    };
    if (reduceMotion()) return done();
    // l'opacité s'applique au verre lui-même, jamais à un ancêtre (sinon le flou perd son arrière-plan)
    el.querySelector('.widget-card')!.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, easing: 'ease-in', fill: 'forwards' });
    el.querySelector('.widget-inner')!.animate([{ transform: 'scale(1)' }, { transform: 'scale(.82)' }], { duration: 200, easing: 'ease-in', fill: 'forwards' }).onfinish = done;
  }

  function addWidget(type: string, size: WidgetSize) {
    const w: WidgetItem = { id: uid('w'), type, size };
    flip(others(), () => flushSync(() => saveLayout((l) => l.push(w))));
    const el = boardRef.current!.querySelector(`[data-id="${w.id}"]`)!;
    if (!reduceMotion()) {
      el.querySelector('.widget-inner')!.animate([{ transform: 'scale(.85)' }, { transform: 'scale(1)' }], { duration: 420, easing: 'cubic-bezier(.34,1.42,.64,1)' });
      el.querySelector('.widget-card')!.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 240, easing: 'ease-out' });
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

  /* ---------- Glisser-déposer et clavier ---------- */

  const dragHandlers = useBoardDrag({ board: boardRef, editing, startEditing: () => setEditing(true), setOrder, saveOrder });

  function onWidgetKey(e: KeyboardEvent<HTMLElement>) {
    const el = e.currentTarget;
    if (!editing || e.target !== el) return;
    const all = $$('.widget', boardRef.current!);
    const i = all.indexOf(el);
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp' || e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      const j = e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? i - 1 : i + 1;
      if (j < 0 || j >= all.length) return;
      flip(others(), () => flushSync(() => saveOrder(move(all.map((w) => w.dataset.id!), i, j))));
      el.focus();
      announce(`Position ${j + 1} sur ${all.length}`);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const def = widgetDef(el.dataset.type!)!;
      const k = def.sizes.indexOf(el.dataset.size as WidgetSize);
      setSize(el, def.sizes[(k + 1) % def.sizes.length]);
    } else if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault();
      (all[i + 1] ?? all[i - 1])?.focus();
      removeWidget(el);
    }
  }

  // Défilement sans barre : le bas de l'écran coupe la rangée suivante
  useFitRows(() => boardRef.current, '--board-row', [items.map((w) => w.size).join()]);

  /* ---------- Abonnements ---------- */

  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => { if (e.key === 'Escape' && editingRef.current && !document.querySelector('dialog[open]')) setEditing(false); };
    document.addEventListener('keydown', onKey);
    // Changement de profil, échec d'enregistrement ou disposition modifiée ailleurs : sortie du mode édition
    const off = store.subscribe((topic) => {
      if (topic === 'all' || (topic === 'layout' && !selfUpdate.current)) { setEditingState(false); setOrder(null); }
    });
    return () => {
      document.removeEventListener('keydown', onKey);
      off();
      clearTimeout(liveTimer.current);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return <div className={`view-dashboard${editing ? ' is-editing' : ''}`}>
    <PageHead title={title}>
      {board ? <>
        <button type="button" className="btn btn--glass btn--icon" data-tip="Renommer" aria-label="Renommer le tableau de bord" hidden={!editing} onClick={() => openBoardForm(board)}>
          <Icon name="pencil" size={20} />
        </button>
        <button type="button" className="btn btn--glass btn--icon" data-tip="Supprimer le tableau de bord" aria-label="Supprimer le tableau de bord" hidden={!editing}
          onClick={async () => { if (await deleteBoard(board)) navigate('/accueil'); }}>
          <Icon name="trash" size={20} />
        </button>
      </> : <button type="button" className="btn btn--glass btn--icon" data-tip="Disposition par défaut" aria-label="Revenir à la disposition par défaut" hidden={!editing}
        onClick={() => { store.resetLayout(boardId as Board); notify('Disposition par défaut', { icon: 'refresh', tone: 'info' }); }}>
        <Icon name="refresh" size={20} />
      </button>}
      <button type="button" className="btn btn--glass btn--icon" data-tip="Ajouter un widget" aria-label="Ajouter un widget" hidden={!editing || !items.length} onClick={openGallery}>
        <Icon name="widgets" size={20} />
      </button>
      <button type="button" className={`btn ${editing ? 'btn--primary' : 'btn--glass'}`} aria-pressed={editing} onClick={() => setEditing(!editing)}>
        <Icon name={editing ? 'check' : 'pencil'} size={18} /><span>{editing ? 'Terminé' : 'Personnaliser'}</span>
      </button>
    </PageHead>
    {/* Liens désactivés en mode édition */}
    <section ref={boardRef} className="board" aria-label="Widgets"
      onClickCapture={(e) => { if (editing && (e.target as Element).closest('a')) e.preventDefault(); }}
      {...dragHandlers}>
      {items.map((w) => <Widget key={w.id} w={w} editing={editing}
        onRemove={(e) => removeWidget(e.currentTarget.closest<HTMLElement>('.widget')!)}
        onSize={(e, s) => setSize(e.currentTarget.closest<HTMLElement>('.widget')!, s)}
        onKeyDown={onWidgetKey} />)}
    </section>
    {!items.length && <div className="empty-state glass">
      <Tile name="widgets" color="var(--accent)" size="xl" />
      <p>Ce tableau de bord est vide. Choisissez les indicateurs, graphiques et listes à y afficher.</p>
      <button type="button" className="btn btn--primary" onClick={openGallery}><Icon name="plus" size={18} /><span>Ajouter un widget</span></button>
    </div>}
    <div className="sr-only" aria-live="polite">{live}</div>
  </div>;
}
