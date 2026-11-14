/* ==========================================================================
   Recensement · bilan d'un recensement : avancement, constats à traiter
   (codes inconnus, écarts, refus), avancement par salle et derniers
   constats. Actions du gestionnaire : appairer un téléphone, étiquettes,
   clôture, traitement des constats ; les administrateurs suivent en lecture.
   ========================================================================== */

import { Link, Navigate } from 'react-router';
import { Icon, Tile } from '../../ui/icons.tsx';
import { store } from '../../core/store.ts';
import { index, materielPath, traceProvisoire } from '../../core/selectors.ts';
import { bilan, echeance, ouverte, perimetre } from '../../core/recensements.ts';
import { can } from '../../core/permissions.ts';
import { confirmSheet, notify } from '../../ui/overlays.tsx';
import { RESULTATS, estInstallation } from '#shared/rigel.ts';
import { deviceType } from '#shared/catalog.ts';
import { ago, dateMed, num, plural } from '#shared/format.ts';
import { GroupCard, GroupGrid, PageHead, Progress } from '../../widgets/parts.tsx';
import { openAjoutParc, openAppairage, openEtiquettes } from './recensement-sheets.tsx';
import type { ATraiter, BilanSalle } from '../../core/recensements.ts';
import type { Constat, Materiel, Recensement } from '#shared/types.ts';

const TONES = { ok: 'good', install: 'move', crit: 'bad', stock: 'stock', accent: 'pin' } as const;

/** Résultat d'un constat : icône et libellé dans la couleur de son état */
function Resultat({ c }: { c: Constat }) {
  const r = RESULTATS[c.resultat];
  return <span className={`chip chip--${TONES[r.tone]}`}><Icon name={r.icon} size={13} />{r.label}</span>;
}

/** Désignation d'un constat : matériel reconnu, sinon saisie ou code lu */
function Sujet({ c }: { c: Constat }) {
  const m = c.materielId ? index().materiel.get(c.materielId) : undefined;
  if (m) return <Link className="row-title" to={materielPath(m)}>{m.idOrion} · {m.modele}</Link>;
  return <span className="row-title">{c.saisie ? `${deviceType(c.saisie.type).label} · ${c.saisie.modele}` : c.code || 'Code illisible'}</span>;
}

const lieu = (salleId: string | null) => (salleId ? index().salle.get(salleId)?.nom ?? 'Salle retirée' : 'Stock');

function marquerTraite(g: ATraiter) {
  const ids = new Set(g.constats.map((c) => c.id));
  store.update('data', (s) => { for (const c of s.constats) if (ids.has(c.id)) c.traite = { ...traceProvisoire(), action: 'ecarte' }; });
  notify(g.constats.length > 1 ? plural(g.constats.length, 'constat traité', 'constats traités') : 'Constat traité', { icon: 'check' });
}

async function resoudre(g: ATraiter, action: 'stock' | 'affectation' | 'constat') {
  try {
    for (const c of g.constats) await store.call(`/constats/${encodeURIComponent(c.id)}/traitement`, { action });
    notify(g.constats.length > 1 ? plural(g.constats.length, 'écart traité', 'écarts traités') : 'Écart traité', { icon: 'check' });
  } catch (error) { notify((error as Error).message, { tone: 'danger' }); }
}

/**
 * Ancien écart : remettre au stock ou ramener à l'affectation (déplacement lancé depuis le lieu constaté, à confirmer),
 * ou réaffecter ici (immédiat). Une action qui reviendrait à une autre n'est pas proposée ; hors service, le stock seul (RG-87).
 */
function EcartActions({ g, m }: { g: ATraiter; m: Materiel }) {
  const ici = g.constat.salleId;
  const hs = m.hs ? { 'aria-disabled': 'true' as const, 'data-tip': 'Un matériel hors service ne peut aller qu’au stock' } : null;
  return <>
    {ici !== null && <button className="btn btn--ghost btn--s" type="button" onClick={() => resoudre(g, 'stock')}>Remettre au stock</button>}
    {m.salleId !== null && <button className="btn btn--ghost btn--s" type="button" {...(hs ?? { onClick: () => resoudre(g, 'affectation') })}>Ramener dans {lieu(m.salleId)}</button>}
    <button className="btn btn--primary btn--s" type="button" {...(hs && ici !== null ? hs : { onClick: () => resoudre(g, 'constat') })}>{ici === null ? 'Ranger au stock' : 'Réaffecter ici'}</button>
  </>;
}

/** Constat à traiter : ce qui a été vu, où, combien de fois, et l'action qui le règle */
function ATraiterRow({ g }: { g: ATraiter }) {
  const c = g.constat;
  const m = c.materielId ? index().materiel.get(c.materielId) : undefined;
  const detail = c.resultat === 'ecart' && m ? `Affecté : ${lieu(m.salleId)} · constaté : ${lieu(c.salleId)}`
    : c.resultat === 'refuse' ? c.message ?? 'Refusé'
    : [c.saisie?.marque, c.saisie?.serie && `S/N ${c.saisie.serie}`, c.code && c.code !== c.saisie?.serie && `Code ${c.code}`].filter(Boolean).join(' · ');
  return <li><div className="row rec-row">
    <Resultat c={c} />
    <span className="row-main"><Sujet c={c} /><span className="row-sub"><span className="row-meta">{lieu(c.salleId)}</span>{detail && <span className="row-meta">{detail}</span>}{g.constats.length > 1 && <span className="row-meta">Vu {g.constats.length} fois</span>}</span></span>
    {can('materiel.recensement') && <span className="rec-row-actions">
      {c.resultat === 'inconnu' && <button className="btn btn--ghost btn--s" onClick={() => openAjoutParc(g)}><Icon name="plus" size={16} />Ajouter au parc</button>}
      {c.resultat === 'ecart' && m ? <EcartActions g={g} m={m} /> : <button className="btn btn--ghost btn--s" type="button" onClick={() => marquerTraite(g)}><Icon name="check" size={16} />{c.resultat === 'inconnu' ? 'Écarter' : 'Traité'}</button>}
    </span>}
  </div></li>;
}

function SalleRow({ s }: { s: BilanSalle }) {
  const pct = s.attendus.length ? s.vus.length / s.attendus.length : 1;
  return <li><Link className="row rec-row" to={`/salles/salle/${s.salle.id}`}>
    <span className="code-badge">{s.salle.batiment}</span>
    <span className="row-main"><span className="row-title">{s.salle.nom}</span>
      <span className="row-sub"><span className="row-meta">{num(s.vus.length)} / {plural(s.attendus.length, 'matériel')}</span></span></span>
    <Progress value={pct} label={`Avancement de ${s.salle.nom}`} />
  </Link></li>;
}

function ConstatRow({ c }: { c: Constat }) {
  return <li><div className="row rec-row">
    <Resultat c={c} />
    <span className="row-main"><Sujet c={c} /><span className="row-sub"><span className="row-meta">{lieu(c.salleId)}</span></span></span>
    <span className="row-when">{ago(c.observeLe)}</span>
  </div></li>;
}

async function cloturer(r: Recensement) {
  if (!await confirmSheet({ title: 'Clôturer le recensement', message: `Les téléphones appairés à « ${r.nom} » ne pourront plus envoyer de constats. Un recensement clos ne peut pas être rouvert.`, confirm: 'Clôturer', iconName: 'check' })) return;
  try {
    store.update('data', (s) => { s.recensements.find((x) => x.id === r.id)!.close = traceProvisoire(); });
    await store.flush();
    notify('Recensement clos', { icon: 'clipboardCheck' });
  } catch (error) { notify((error as Error).message, { tone: 'danger' }); }
}

export function Bilan({ id }: { id: string }) {
  const r = store.state.recensements.find((x) => x.id === id);
  if (!r || estInstallation(r)) return <Navigate to="/materiels/recensement" replace />;
  const b = bilan(r);
  const enCours = ouverte(r);
  const gerer = can('materiel.recensement');
  const salles = [...b.parSalle].sort((x, y) => (x.vus.length / (x.attendus.length || 1)) - (y.vus.length / (y.attendus.length || 1)) || x.salle.nom.localeCompare(y.salle.nom, 'fr', { numeric: true }));
  return <div className="group-view">
    <PageHead title={r.nom}>
      {gerer && enCours && <button className="btn btn--ghost" onClick={() => cloturer(r)}><Icon name="check" size={18} /><span>Clôturer</span></button>}
      {gerer && <button className="btn btn--ghost" onClick={() => openEtiquettes(r)}><Icon name="print" size={18} /><span>Étiquettes</span></button>}
      {gerer && enCours && <button className="btn btn--primary" onClick={() => openAppairage(r)}><Icon name="tablet" size={18} /><span>Appairer un téléphone</span></button>}
    </PageHead>
    <p className="group-lead"><Link to="/materiels/recensement">Recensements</Link> · <strong>{r.nom}</strong> · {perimetre(r)} · lancé par {r.par} le {dateMed(r.at)} · {echeance(r)}</p>
    <div className="ops-metrics">
      <div className="ops-metric glass"><span>Matériels vus</span><strong>{num(b.vus)}<small> / {num(b.attendus)}</small></strong><Progress value={b.pct} label="Avancement du recensement" /></div>
      <div className="ops-metric glass"><span>Relocalisés</span><strong>{num(b.deplaces)}</strong><span>{plural(b.ajoutes, 'matériel ajouté', 'matériels ajoutés')} au parc</span></div>
      <div className={`ops-metric glass${b.aTraiter.length ? ' rec-metric--alert' : ''}`}><span>À traiter</span><strong>{num(b.aTraiter.length)}</strong><span>Anciens écarts, codes inconnus et refus</span></div>
    </div>
    <GroupGrid items={['traiter', 'salles', 'constats'] as const} weight={(k) => (k === 'salles' ? 3 + Math.min(14, salles.length) : 3 + Math.min(10, k === 'traiter' ? b.aTraiter.length : b.constats.length))} render={(k) => {
      if (k === 'traiter') return <GroupCard key={k} tile={<Tile name="alert" color="var(--install)" size="s" />} title="À traiter" sub={b.aTraiter.length ? plural(b.aTraiter.length, 'constat') : 'Rien à traiter'}>
        {b.aTraiter.length ? b.aTraiter.map((g) => <ATraiterRow key={g.constat.id} g={g} />) : <li className="rec-empty">Les constats refusés par ORION apparaîtront ici.</li>}
      </GroupCard>;
      if (k === 'salles') return <GroupCard key={k} tile={<Tile name="salles" color="var(--c3)" size="s" />} title="Avancement par salle" sub={plural(salles.length, 'salle')}>
        {salles.map((s) => <SalleRow key={s.salle.id} s={s} />)}
      </GroupCard>;
      return <GroupCard key={k} tile={<Tile name="clipboardCheck" color="var(--c5)" size="s" />} title="Derniers constats" sub={b.constats.length ? plural(b.constats.length, 'constat') : 'Aucun constat'}>
        {b.constats.length ? b.constats.slice(0, 100).map((c) => <ConstatRow key={c.id} c={c} />) : <li className="rec-empty">Aucun téléphone n’a encore transmis de constat.</li>}
      </GroupCard>;
    }} />
  </div>;
}
