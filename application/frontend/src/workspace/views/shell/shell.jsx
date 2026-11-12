/* ==========================================================================
   Shell ASTER
   - Menu principal : rail vertical à gauche (barre basse sur mobile) ; le
     module actif prend la couleur d'accent et son icône grandit légèrement.
   - Menu secondaire : en haut, sous-navigation du module courant.
   - Actions de l'écran : dans la barre haute, toujours visibles (PageHead).
   - Menus de la barre haute : voir shell-menus.jsx.
   ========================================================================== */

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link, Navigate, Outlet, useLocation, useNavigate } from 'react-router';
import { Icon, Tile, Brand } from '../../ui/icons.jsx';
import { Sheet, openSheet } from '../../ui/overlays.jsx';
import { me, currentEcole } from '../../core/store.js';
import { useStore } from '../../hooks/use-store.js';
import { can } from '../../core/permissions.js';
import { setGlassLevel } from '../../core/glass.js';
import { applyAmbiance } from '../../core/theme.js';
import { role as roleOf } from '#shared/catalog.js';
import { remontees, batiments, batimentLabel, index, parc } from '../../core/selectors.js';
import { installations } from '../../core/installations.js';
import { interventionsOuvertes } from '../../core/interventions.js';
import { TABS, remonteeTabs } from '../remontees/remontees-tabs.js';
import { num } from '#shared/format.js';
import { reveal } from '../../ui/reveal.js';
import { PageActionsSlot } from '../../widgets/parts.jsx';
import { AccountPopover, EcolePopover, AlertsPopover, Spotlight, ecoleNom, initiale } from './shell-menus.jsx';
import { notificationGroups } from '../../core/notifications.js';
import { customBoards, openBoardForm } from '../dashboard/dashboard-boards.jsx';

/* Modules du menu principal */
export const NAV = [
  { id: 'accueil', path: '/accueil', label: 'Accueil', icon: 'home', cap: 'dashboard.perso' },
  { id: 'salles', path: '/salles', label: 'Salles', icon: 'salles', cap: 'salle.view' },
  { id: 'materiels', path: '/materiels/inventaire', label: 'Matériels', icon: 'materiel', cap: 'materiel.create' },
  { id: 'remontees', path: '/remontees', label: 'Remontées', icon: 'ticket', cap: null },
  { id: 'supervision', path: '/supervision/alertes', label: 'Supervision', icon: 'supervision', cap: 'supervision.view' },
  { id: 'administration', path: '/administration/postes', label: 'Administration', icon: 'sliders', cap: 'administration.view' },
];
const allowed = (n) => n.cap === null || can(n.cap);

/* Sous-navigation de chaque module */
function subnav(navId) {
  switch (navId) {
    case 'accueil': return [
      { path: '/accueil', label: 'Mon tableau de bord', icon: 'home' },
      can('dashboard.parc') && { path: '/accueil/parc', label: 'Parc', icon: 'materiel' },
      can('dashboard.remontees') && { path: '/accueil/remontees', label: 'Remontées', icon: 'ticket' },
      ...customBoards().map((b) => ({ path: `/accueil/${b.id}`, label: b.nom, icon: 'gauge' })),
    ].filter(Boolean);
    case 'salles': return [
      { path: '/salles', label: 'Tous les bâtiments', icon: 'salles' },
      ...batiments().map((b) => ({ path: `/salles/batiment/${b}`, label: batimentLabel(b), badge: b })),
      can('materiel.move') && { path: '/salles/stock', label: 'Stock', icon: 'stockage' },
      can('materiel.move') && { path: '/salles/deplacements', label: 'Déplacements', icon: 'refresh', count: parc().deplacements.length },
    ].filter(Boolean);
    case 'materiels': return [
      { path: '/materiels/inventaire', label: 'Inventaire', icon: 'recherche' },
      { path: '/materiels/import', label: 'Import JSON', icon: 'importJson' },
    ];
    case 'remontees': return remonteeTabs().map((id) => ({
      path: `/remontees/${id}`, label: TABS[id].label, icon: TABS[id].icon,
      // nouvelles remontées à prendre en charge ; salles en cours d'installation
      count: ['attente', 'backlog'].includes(id) ? remontees().attente.length : id === 'installations' ? installations().enCours.length : undefined,
    }));
    case 'supervision': return [
      { path: '/supervision/alertes', label: 'Alertes', icon: 'alertes' },
      { path: '/supervision/salles', label: 'Salles', icon: 'salles' },
      can('administration.view') && { path: '/supervision/listes', label: 'Listes de processus', icon: 'shield' },
      can('administration.view') && { path: '/supervision/statistiques', label: 'Statistiques', icon: 'chartLine' },
    ].filter(Boolean);
    case 'administration': return [
      { path: '/administration/postes', label: 'Postes', icon: 'desktop' },
      { path: '/administration/applications', label: 'Applications', icon: 'widgets' },
      { path: '/administration/interventions', label: 'Interventions', icon: 'clock', count: interventionsOuvertes().length }, // pas encore terminées
      { path: '/administration/batiments', label: 'Bâtiments', icon: 'building' },
      { path: '/administration/comptes', label: 'Comptes', icon: 'users' },
    ];
    default: return [];
  }
}

/* --------------------------------------------------------------------------
   Shell
   -------------------------------------------------------------------------- */
export function Shell() {
  const s = useStore();
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname;
  const navId = path.split('/')[1] || 'accueil';
  const nav = NAV.find((n) => n.id === navId);

  const subRef = useRef(null);
  const viewRef = useRef(null);
  const [actionsSlot, setActionsSlot] = useState(null); // actions de l'écran, dans la barre haute
  const [pop, setPop] = useState(null); // { kind, anchor }
  const closePop = useCallback(() => setPop(null), []);
  const toggle = (kind) => (e) => { const anchor = e.currentTarget; setPop((p) => (p?.kind === kind ? null : { kind, anchor })); };

  const spotlight = useCallback(() => {
    if (document.querySelector('dialog[open]')) return;
    openSheet(<Sheet title="Rechercher" size="m" lead={<Tile name="recherche" color="var(--accent)" />}><Spotlight navigate={navigate} /></Sheet>);
  }, [navigate]);

  // Préférences d'affichage
  useEffect(() => {
    applyAmbiance(s.prefs.ambiance, s.prefs.tone);
    setGlassLevel(s.prefs.glass);
  }, [s.prefs.ambiance, s.prefs.tone, s.prefs.glass]);

  // Recherche au clavier
  useEffect(() => {
    const onKey = (ev) => { if ((ev.ctrlKey || ev.metaKey) && ev.key.toLowerCase() === 'k') { ev.preventDefault(); spotlight(); } };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [spotlight]);

  // Changement d'écran : popover fermé ; changement de module : retour en haut
  useEffect(() => { setPop(null); }, [path]);
  const firstModule = useRef(true);
  useEffect(() => {
    if (firstModule.current) { firstModule.current = false; return; }
    scrollTo({ top: 0, behavior: 'instant' });
  }, [navId]);


  // Sous-navigation : quand les onglets débordent, ceux à pastille (bâtiments) se réduisent à leur pastille ;
  // s'ils débordent encore, les autres se réduisent à leur icône, leur libellé passant en infobulle
  const fitSub = useCallback(() => {
    const sub = subRef.current;
    if (!sub) return;
    const overflows = () => sub.scrollWidth > sub.clientWidth + 1;
    sub.classList.remove('is-compact', 'is-tight');
    if (overflows()) sub.classList.add('is-compact');
    const tight = overflows();
    sub.classList.toggle('is-tight', tight);
    for (const btn of sub.querySelectorAll('.seg-btn:not(.has-badge):not(.seg-btn--add)')) {
      if (tight) Object.assign(btn.dataset, { tip: btn.querySelector(':scope > span:not(.seg-count)').textContent, tipPos: 'bottom' });
      else { delete btn.dataset.tip; delete btn.dataset.tipPos; }
    }
  }, []);
  useLayoutEffect(fitSub);
  useEffect(() => { addEventListener('resize', fitSub); return () => removeEventListener('resize', fitSub); }, [fitSub]);
  // Les actions de l'écran partagent la barre haute : leur largeur peut aussi réduire les onglets
  useEffect(() => {
    if (!actionsSlot) return undefined;
    const ro = new ResizeObserver(fitSub);
    ro.observe(actionsSlot);
    return () => ro.disconnect();
  }, [actionsSlot, fitSub]);

  const items = subnav(navId);
  // Une salle ouverte active l'onglet de son bâtiment
  const roomId = path.match(/^\/salles\/salle\/([^/]+)/)?.[1];
  const room = roomId && index().salle.get(decodeURIComponent(roomId));
  const activePath = room ? `/salles/batiment/${room.batiment}` : path;
  const activeItem = items.slice().sort((a, b) => b.path.length - a.path.length)
    .find((i) => activePath === i.path || activePath.startsWith(`${i.path}/`)) ?? items[0];

  // Entrée de chaque écran (onglet du menu secondaire) : cartes et textes glissent de gauche à droite
  const screen = activeItem?.path ?? path;
  useLayoutEffect(() => { reveal(viewRef.current); }, [screen]);

  // Module non accessible au profil : retour à l'accueil
  if (nav && !allowed(nav)) return <Navigate to="/accueil" replace />;

  const attente = remontees().attente.length;
  const notifs = notificationGroups().length; // notifications regroupées
  const r = roleOf(s.role);
  const ecole = ecoleNom(currentEcole());
  const switchable = can('ecole.switch');
  const boards = navId === 'accueil' && can('dashboard.customize'); // tableaux de bord personnalisés

  return <>
    <a className="skip" href="#view">Aller au contenu</a>
    <nav className="rail glass" data-lens="strong" aria-label="Menu principal">
      <Link className="rail-brand" to="/accueil" aria-label="ASTER, accueil"><Brand ambiance={s.prefs.ambiance} size={34} /></Link>
      <div className="rail-items">
        {NAV.filter(allowed).map((n) => <Link key={n.id} className={`rail-item${n.id === navId ? ' is-active' : ''}`} to={n.path} data-nav={n.id}
          aria-label={n.label} aria-current={n.id === navId ? 'page' : undefined}>
          <span className="rail-ico"><Icon name={n.icon} size={24} />{n.id === 'remontees' && attente > 0 && <span className="badge">{attente > 99 ? '99+' : attente}</span>}</span>
          <span className="rail-label">{n.label}</span>
        </Link>)}
      </div>
    </nav>
    <header className="topbar">
      {(items.length >= 2 || boards) && <nav ref={subRef} className="subnav seg seg--glass glass" data-lens="strong" aria-label="Menu secondaire">
        {items.map((i) => {
          const on = i === activeItem;
          return <Link key={i.path} to={i.path} className={`seg-btn${on ? ' is-on' : ''}${i.badge ? ' has-badge' : ''}`} aria-current={on ? 'page' : undefined}
            {...(i.badge ? { 'aria-label': i.label, 'data-tip': i.label, 'data-tip-pos': 'bottom' } : {})}>
            {i.badge ? <span className="code-badge">{i.badge}</span> : i.icon ? <Icon name={i.icon} size={17} /> : null}
            <span>{i.label}</span>
            {i.count ? <span className="seg-count">{num(i.count)}</span> : null}
          </Link>;
        })}
        {boards && <button type="button" className="seg-btn seg-btn--add" aria-label="Nouveau tableau de bord" data-tip="Nouveau tableau de bord" data-tip-pos="bottom"
          onClick={() => openBoardForm()}><Icon name="plus" size={17} /></button>}
      </nav>}
      <div ref={setActionsSlot} className="page-actions" />
      <div className="topbar-actions glass" data-lens="strong">
        <button type="button" className={`ecole-chip${switchable ? '' : ' is-static'}`} aria-label={`École affichée : ${ecole}`}
          onClick={switchable ? toggle('ecole') : undefined}>
          <Icon name="school" size={18} /><span>{ecole}</span>{switchable && <Icon name="chevD" size={14} />}
        </button>
        <button type="button" className="icon-btn" aria-label="Rechercher" data-tip="Rechercher" data-tip-kbd="Ctrl K" data-tip-pos="bottom" onClick={spotlight}>
          <Icon name="recherche" size={22} />
        </button>
        <button type="button" className="icon-btn" aria-label="Notifications" data-tip="Notifications" data-tip-pos="bottom" onClick={toggle('alerts')}>
          <Icon name="bell" size={20} />{notifs > 0 && <span className="badge">{notifs}</span>}
        </button>
        <button type="button" className="avatar" aria-label="Compte" aria-haspopup="dialog" aria-expanded={pop?.kind === 'account'} onClick={toggle('account')}>
          <span className="avatar-face">{initiale()}</span>
          <span className="avatar-role" style={{ '--c': r.color }}><Icon name={r.icon} size={11} stroke={2.6} /></span>
        </button>
      </div>
    </header>
    <main id="view" className="view" tabIndex={-1}>
      <PageActionsSlot.Provider value={actionsSlot}><div ref={viewRef} className="view-inner"><Outlet /></div></PageActionsSlot.Provider>
    </main>
    {pop?.kind === 'account' && <AccountPopover anchor={pop.anchor} onClose={closePop} />}
    {pop?.kind === 'ecole' && <EcolePopover anchor={pop.anchor} onClose={closePop} />}
    {pop?.kind === 'alerts' && <AlertsPopover anchor={pop.anchor} onClose={closePop} />}
  </>;
}
