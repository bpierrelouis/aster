/* ==========================================================================
   Recensement · bilan d'une campagne : avancement, constats à traiter
   (codes inconnus, écarts, refus), avancement par salle et derniers
   constats. Actions : appairer un téléphone, étiquettes, clôture.
   ========================================================================== */

import { Link, Navigate } from 'react-router';
import { Icon, Tile } from '../../ui/icons.tsx';
import { store } from '../../core/store.ts';
import { index, materielPath, traceProvisoire } from '../../core/selectors.ts';
import { bilan, echeance, ouverte, perimetre } from '../../core/recensements.ts';
import { confirmSheet, notify } from '../../ui/overlays.tsx';
import { RESULTATS } from '#shared/recon.ts';
import { deviceType } from '#shared/catalog.ts';
import { ago, dateMed, num, plural } from '#shared/format.ts';
import { GroupCard, GroupGrid, PageHead, Progress } from '../../widgets/parts.tsx';
import { openAjoutParc, openAppairage, openEtiquettes } from './recensement-sheets.tsx';
import type { BilanSalle } from '../../core/recensements.ts';
import type { Constat, Recensement } from '#shared/types.ts';

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

function marquerTraite(c: Constat) {
  store.update('data', (s) => { s.constats.find((x) => x.id === c.id)!.traite = traceProvisoire(); });
  notify('Constat traité', { icon: 'check' });
}

/** Constat à traiter : ce qui a été vu, où, et l'action qui le règle */
function ATraiterRow({ c }: { c: Constat }) {
  const m = c.materielId ? index().materiel.get(c.materielId) : undefined;
  const detail = c.resultat === 'ecart' && m ? `Affecté : ${lieu(m.salleId)} · constaté : ${lieu(c.salleId)}`
    : c.resultat === 'refuse' ? c.message ?? 'Refusé'
    : [c.saisie?.marque, c.saisie?.serie && `S/N ${c.saisie.serie}`, c.code && c.code !== c.saisie?.serie && `Code ${c.code}`].filter(Boolean).join(' · ');
  return <li><div className="row rec-row">
    <Resultat c={c} />
    <span className="row-main"><Sujet c={c} /><span className="row-sub"><span className="row-meta">{lieu(c.salleId)}</span>{detail && <span className="row-meta">{detail}</span>}</span></span>
    <span className="rec-row-actions">
      {c.resultat === 'inconnu' && <button className="btn btn--ghost btn--s" onClick={() => openAjoutParc(c)}><Icon name="plus" size={16} />Ajouter au parc</button>}
      <button className="btn btn--ghost btn--s" onClick={() => marquerTraite(c)}><Icon name="check" size={16} />{c.resultat === 'inconnu' ? 'Écarter' : 'Traité'}</button>
    </span>
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
  if (!await confirmSheet({ title: 'Clôturer la campagne', message: `Les téléphones appairés à « ${r.nom} » ne pourront plus envoyer de constats. Une campagne close ne peut pas être rouverte.`, confirm: 'Clôturer', iconName: 'check' })) return;
  try {
    store.update('data', (s) => { s.recensements.find((x) => x.id === r.id)!.close = traceProvisoire(); });
    await store.flush();
    notify('Campagne close', { icon: 'clipboardCheck' });
  } catch (error) { notify((error as Error).message, { tone: 'danger' }); }
}

export function Campagne({ id }: { id: string }) {
  const r = store.state.recensements.find((x) => x.id === id);
  if (!r) return <Navigate to="/materiels/recensement" replace />;
  const b = bilan(r);
  const enCours = ouverte(r);
  const salles = [...b.parSalle].sort((x, y) => (x.vus.length / (x.attendus.length || 1)) - (y.vus.length / (y.attendus.length || 1)) || x.salle.nom.localeCompare(y.salle.nom, 'fr', { numeric: true }));
  return <div className="group-view">
    <PageHead title={r.nom}>
      {enCours && <button className="btn btn--ghost" onClick={() => cloturer(r)}><Icon name="check" size={18} /><span>Clôturer</span></button>}
      <button className="btn btn--ghost" onClick={() => openEtiquettes(r)}><Icon name="print" size={18} /><span>Étiquettes</span></button>
      {enCours && <button className="btn btn--primary" onClick={() => openAppairage(r)}><Icon name="tablet" size={18} /><span>Appairer un téléphone</span></button>}
    </PageHead>
    <p className="group-lead"><Link to="/materiels/recensement">Campagnes</Link> · <strong>{r.nom}</strong> · {perimetre(r)} · ouverte par {r.par} le {dateMed(r.at)} · {echeance(r)}</p>
    <div className="ops-metrics">
      <div className="ops-metric glass"><span>Matériels vus</span><strong>{num(b.vus)}<small> / {num(b.attendus)}</small></strong><Progress value={b.pct} label="Avancement de la campagne" /></div>
      <div className="ops-metric glass"><span>Installations confirmées</span><strong>{num(b.confirmes)}</strong><span>{plural(b.deplaces, 'matériel relocalisé', 'matériels relocalisés')} ou rangé{b.deplaces > 1 ? 's' : ''}</span></div>
      <div className={`ops-metric glass${b.aTraiter.length ? ' rec-metric--alert' : ''}`}><span>À traiter</span><strong>{num(b.aTraiter.length)}</strong><span>Codes inconnus, écarts et refus</span></div>
    </div>
    <GroupGrid items={['traiter', 'salles', 'constats'] as const} weight={(k) => (k === 'salles' ? 3 + Math.min(14, salles.length) : 3 + Math.min(10, k === 'traiter' ? b.aTraiter.length : b.constats.length))} render={(k) => {
      if (k === 'traiter') return <GroupCard key={k} tile={<Tile name="alert" color="var(--install)" size="s" />} title="À traiter" sub={b.aTraiter.length ? plural(b.aTraiter.length, 'constat') : 'Rien à traiter'}>
        {b.aTraiter.length ? b.aTraiter.map((c) => <ATraiterRow key={c.id} c={c} />) : <li className="rec-empty">Les codes inconnus et les écarts constatés par les agents apparaîtront ici.</li>}
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
