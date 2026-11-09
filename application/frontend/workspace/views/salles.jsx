/* ==========================================================================
   Salles
   Les salles sont rattachées à une école et portent leur bâtiment (RG-02) :
   les étages sont des dalles de verre, toujours tous affichés ; un étage ou
   une salle choisi est mis en évidence. Les salles sont ordonnées par nom,
   avec des blocs de hauteur constante, sans coordonnées physiques. Une balise rouge signale du matériel hors service, une
   balise dorée une remontée en attente.
   - Glisser un matériel (ou une sélection) sur une salle ou sur le stock :
     affectation immédiate (RG-26, RG-27). Alternative clavier dans la fiche.
   - Créer, renommer ou changer le bâtiment d'une salle : administrateurs.
   ========================================================================== */

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal, flushSync } from 'react-dom';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router';
import { Icon, Tile } from '../ui/icons.jsx';
import { store } from '../core/store.js';
import { useStore } from '../core/useStore.js';
import { can } from '../core/permissions.js';
import { num } from '../core/format.js';
import { deviceType } from '../core/catalog.js';
import { parc, scope, batiments, batimentLabel, materielsOf, index } from '../core/selectors.js';
import { confirmSheet, notify } from '../ui/overlays.jsx';
import { useTitle } from '../ui/useTitle.js';
import { PageHead } from '../widgets/parts.jsx';
import { floorLabel, floorLevel, floorHref, modelOf, signature, BatCard, Building, fitIso } from './salles-scene.jsx';
import { Overview, SalleDetail, Stock } from './salles-panel.jsx';
import { openSalleForm } from './salles-forms.jsx';

/** Mode affiché d'après l'adresse : all | batiment | salle | stock */
function routeState(params, query) {
  const ix = index();
  const floorParam = query.get('etage');
  const floor = floorParam !== null && /^-?\d+$/.test(floorParam) ? Number(floorParam) : null;
  const x = params.mode === 'salle' && params.id ? ix.salle.get(params.id) : null;
  if (x) return { mode: 'salle', salleId: x.id, stageBat: x.batiment, stageFloor: floorLevel(x) };
  if (params.mode === 'batiment' && params.id && batiments().includes(params.id)) return { mode: 'batiment', salleId: null, stageBat: params.id, stageFloor: floor };
  if (params.mode === 'stock' && can('materiel.move')) return { mode: 'stock', salleId: null, stageBat: null, stageFloor: null }; // tous les bâtiments, cibles du glisser-déposer
  return { mode: 'all', salleId: null, stageBat: null, stageFloor: floor };
}

const initialSelection = (query) => {
  const mid = query.get('m');
  return new Set(mid && index().materiel.get(mid) ? [mid] : []);
};

export function Salles() {
  useTitle('Salles');
  const state = useStore();
  const params = useParams();
  const [query] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { mode, salleId, stageBat, stageFloor } = routeState(params, query);
  const ix = index();
  const { bySalle, stock } = parc();

  // Sélection de matériels : reprise de ?m= à chaque changement d'adresse
  const routeKey = location.pathname + location.search;
  const [selection, setSelection] = useState(() => ({ key: routeKey, ids: initialSelection(query) }));
  let selected = selection.ids;
  if (selection.key !== routeKey) { selected = initialSelection(query); setSelection({ key: routeKey, ids: selected }); }
  selected = new Set([...selected].filter((id) => ix.materiel.get(id)));
  const setSelected = (ids) => setSelection((s) => ({ ...s, ids }));
  const selectedRef = useRef(selected);
  selectedRef.current = selected;

  const [hoverId, setHoverId] = useState(null);
  const [dropId, setDropId] = useState(null);   // salle survolée pendant un glisser, ou 'stock'
  const [ghost, setGhost] = useState(null);     // fantôme du glisser-déposer
  const ghostRef = useRef(null);
  const dragRef = useRef(null);
  const suppressRef = useRef(false);
  const rootRef = useRef(null);
  const sceneRef = useRef(null);

  /* ---------- Mise à l'échelle des scènes ---------- */
  const scenes = useRef(new Map()); // élément .iso → { model, box, options d'échelle }
  const sizeIso = () => { for (const [iso, sc] of scenes.current) fitIso(iso, sc.box, sc.model, sc); };
  const scene = {
    register: (model, opts) => (iso) => { scenes.current.set(iso, { model, box: iso.parentElement, ...opts }); return () => scenes.current.delete(iso); },
    suppressClick: () => suppressRef.current,
    props: {
      bySalle, selectedId: salleId, hoverId, dropId,
      onRoom: (id, key) => {
        if (key) { navigate(`/salles/salle/${id}`); return; }
        if (suppressRef.current) return;
        navigate(id === salleId ? `/salles${stageBat ? `/batiment/${stageBat}` : ''}` : `/salles/salle/${id}`);
      },
    },
  };

  // Mise en place sans transition quand les données affichées changent : seuls le survol et la sélection restent animés
  const sig = useMemo(() => signature(state), [store.version]); // eslint-disable-line react-hooks/exhaustive-deps
  useLayoutEffect(() => {
    const host = sceneRef.current;
    host.classList.add('is-placing');
    sizeIso();
    void host.offsetWidth; // styles finaux appliqués avant de réactiver les transitions
    const raf = requestAnimationFrame(() => host.classList.remove('is-placing'));
    return () => cancelAnimationFrame(raf);
  }, [sig, state.role, stageBat]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const ro = new ResizeObserver(() => sizeIso());
    ro.observe(rootRef.current);
    return () => ro.disconnect();
  }, []);

  // Changement de profil ou d'école : une salle hors du périmètre renvoie à la vue d'ensemble
  const scopeKey = `${state.role}|${state.ecoleId}`;
  const lastScope = useRef(scopeKey);
  useEffect(() => {
    if (lastScope.current === scopeKey) return;
    lastScope.current = scopeKey;
    if (params.mode === 'salle' && params.id && !scope().salleIds.has(params.id)) navigate('/salles');
  }, [scopeKey]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ---------- Affectation ---------- */
  async function moveTo(ids, targetSalleId) {
    const mats = ids.map((id) => index().materiel.get(id)).filter(Boolean).filter((m) => (m.salleId ?? null) !== (targetSalleId ?? null));
    if (!mats.length) return;
    const dest = targetSalleId ? index().salle.get(targetSalleId) : null;
    if (dest && mats.some((m) => m.ecoleId !== dest.ecoleId)) { notify('Destination dans une autre école', { icon: 'alertes', tone: 'warn' }); return; }
    const previousSelection = selectedRef.current;
    setSelected(new Set());
    try {
      store.update('data', (s) => { for (const m of mats) s.materiels.find((x) => x.id === m.id).salleId = targetSalleId ?? null; });
      await store.flush();
      const label = mats.length > 1 ? `${num(mats.length)} matériels` : mats[0].idAster;
      notify(dest ? `${label} affecté${mats.length > 1 ? 's' : ''} à ${dest.nom}` : `${label} remis en stock`, { icon: 'deplacement' });
    } catch { setSelected(previousSelection); }
  }
  const moveRef = useRef(moveTo);
  moveRef.current = moveTo;

  /* ---------- Glisser-déposer ---------- */
  useEffect(() => {
    const onMove = (e) => {
      const drag = dragRef.current;
      if (!drag) return;
      if (!drag.started) {
        if (Math.hypot(e.clientX - drag.x, e.clientY - drag.y) < 6) return;
        drag.started = true;
        const sel = selectedRef.current;
        drag.ids = sel.has(drag.id) && sel.size > 1 ? [...sel] : [drag.id];
        const m = index().materiel.get(drag.id);
        flushSync(() => setGhost({ type: deviceType(m.type), count: drag.ids.length, hs: m.hs }));
      }
      if (ghostRef.current) ghostRef.current.style.transform = `translate(${e.clientX - 26}px, ${e.clientY - 26}px)`;
      const under = document.elementFromPoint(e.clientX, e.clientY)?.closest('.blk, .stock-tray');
      drag.over = under ? (under.matches('.stock-tray') ? 'stock' : under.dataset.salle) : null;
      setDropId(drag.over);
    };
    const onUp = () => {
      const d = dragRef.current;
      if (!d) return;
      dragRef.current = null;
      setGhost(null);
      setDropId(null);
      if (!d.started) return;
      suppressRef.current = true;
      setTimeout(() => { suppressRef.current = false; }, 0);
      if (!d.over) return;
      moveRef.current(d.ids, d.over === 'stock' ? null : d.over);
    };
    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
    return () => {
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
      dragRef.current = null;
    };
  }, []);

  const devs = {
    onGrab: (e, id) => { if (e.button === 0) dragRef.current = { id, x: e.clientX, y: e.clientY, started: false, over: null }; },
    onPick: (e, id) => {
      if (suppressRef.current) return;
      const next = new Set(selected);
      if (e.ctrlKey || e.metaKey || e.shiftKey) { if (next.has(id)) next.delete(id); else next.add(id); setSelected(next); }
      else setSelected(selected.size === 1 && selected.has(id) ? new Set() : new Set([id]));
    },
  };

  const act = {
    clear: () => setSelected(new Set()),
    move: (target) => moveTo([...selected], target),
    async setHs(id, hs) {
      try {
        store.update('data', (s) => { s.materiels.find((m) => m.id === id).hs = hs; });
        await store.flush();
        notify(hs ? 'Hors service' : 'En service', { icon: hs ? 'power' : 'checkCircle', tone: hs ? 'danger' : 'ok' });
      } catch { /* Le store restaure la fiche et affiche l'erreur serveur. */ }
    },
    async deleteMat(m) {
      try {
        const ok = await confirmSheet({ title: `Supprimer ${m.idAster} ?`, message: `${m.modele} sera retiré de l’inventaire. Les remontées qui le mentionnent restent consultables.`, confirm: 'Supprimer' });
        if (!ok) return;
        setSelected(new Set());
        store.update('data', (s) => { s.materiels = s.materiels.filter((y) => y.id !== m.id); });
        await store.flush();
        notify(`${m.idAster} supprimé`, { icon: 'trash', tone: 'danger' });
      } catch { /* Le store restaure les données et affiche l'erreur serveur. */ }
    },
    async deleteSalle(x) {
      try {
        if (store.state.postes.some((p) => p.salleId === x.id)) return;
        const n = materielsOf(x.id).length;
        const ok = await confirmSheet({ title: `Supprimer ${x.nom} ?`, message: n ? `Les ${num(n)} matériels de la salle passeront en stock.` : 'La salle est vide.', confirm: 'Supprimer la salle' });
        if (!ok) return;
        store.update('data', (s) => { s.materiels.forEach((m) => { if (m.salleId === x.id) m.salleId = null; }); s.salles = s.salles.filter((y) => y.id !== x.id); });
        await store.flush();
        notify(`${x.nom} supprimée`, { icon: 'trash', tone: 'danger' });
        navigate('/salles');
      } catch { /* Le store restaure les données et affiche l'erreur serveur. */ }
    },
  };

  // Survol synchronisé entre la scène et la liste : recalculé à chaque passage du pointeur
  const onOver = (e) => {
    const id = e.target.closest?.('.blk')?.dataset.salle ?? e.target.closest?.('[data-salle-row]')?.dataset.salleRow ?? null;
    if (id !== hoverId) setHoverId(id);
  };

  const stageModel = stageBat ? modelOf(stageBat, .88) : null;
  const x = salleId ? ix.salle.get(salleId) : null;
  const canManage = can('salle.manage');
  const title = mode === 'stock' ? 'Stock' : stageBat ? `${batimentLabel(stageBat)}${stageFloor === null ? '' : ` · ${floorLabel(stageFloor)}`}` : 'Salles';

  return <div ref={rootRef} className={`view-salles${ghost ? ' is-dragging-mat' : ''}`} onPointerOver={onOver} onPointerLeave={() => { if (hoverId) setHoverId(null); }}>
    <PageHead title={title}>
      {canManage && <button className="btn btn--glass" onClick={() => openSalleForm(null, { batiment: stageBat, etage: stageFloor ?? 0 })}><Icon name="plus" size={18} /><span>Nouvelle salle</span></button>}
    </PageHead>
    <div className="salles">
      <section className={`iso-stage${stageBat ? '' : ' is-overview'}`} aria-label="Bâtiments et étages">
        <div className="scene" ref={sceneRef}>
          {stageModel
            ? <div className="iso is-exploded" ref={scene.register(stageModel, { tagW: 190 })}>
                <Building model={stageModel} {...scene.props} floorHref={floorHref(stageBat)} activeLevel={stageFloor} />
              </div>
            : <div className="bat-grid">{batiments().map((b) => <BatCard key={b} b={b} scene={scene} />)}</div>}
        </div>
        {can('materiel.move') && <div className={`stock-tray glass glass--strong${dropId === 'stock' ? ' is-drop' : ''}`} aria-hidden="true">
          <Tile name="stockage" color="var(--c8)" size="m" /><span><b>Remettre en stock</b><small>{num(stock.total)} matériels en stock</small></span></div>}
        <div className="iso-legend">
          <span><span className="lg-key lg-key--ok" />Salle</span>
          <span><span className="lg-key lg-key--hs" />Matériel hors service</span>
          <span><span className="lg-key lg-key--wait" />Remontée en attente</span>
        </div>
      </section>
      <aside className="spanel glass">
        {mode === 'salle' && x ? <SalleDetail x={x} stageBat={stageBat} selected={selected} devs={devs} act={act} />
          : mode === 'stock' ? <Stock selected={selected} devs={devs} act={act} />
            : <Overview mode={mode} stageBat={stageBat} stageFloor={stageFloor} hoverId={hoverId} />}
      </aside>
    </div>
    {ghost && createPortal(
      <div className="drag-ghost" ref={ghostRef}>
        <Tile name={ghost.type.icon} color={ghost.type.color} size="l" />
        {ghost.count > 1 ? <span className="drag-count">{ghost.count}</span> : <span className={`led led--${ghost.hs ? 'hs' : 'ok'} tile-led`} />}
      </div>, document.body)}
  </div>;
}
