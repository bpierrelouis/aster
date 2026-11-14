/* ==========================================================================
   Matériels › Recensement : recensements mobiles (RIGEL).
   Un recensement couvre l'école ou des salles ; les agents y appairent leur
   téléphone par un QR code, scannent salles et matériels ; les constats
   reviennent ici (confirmations, relocalisations, codes à traiter).
   /materiels/recensement : recensements ; /materiels/recensement/:id : bilan.
   RIGEL est réservé au gestionnaire (ticket #156) : les administrateurs
   suivent recensements et bilans en lecture, sans action.
   ========================================================================== */

import { Link, Navigate, useParams } from 'react-router';
import { Icon } from '../../ui/icons.tsx';
import { useStore } from '../../hooks/use-store.ts';
import { useTitle } from '../../hooks/use-title.ts';
import { can } from '../../core/permissions.ts';
import { bilan, echeance, ouverte, perimetre, recensements } from '../../core/recensements.ts';
import { plural } from '#shared/format.ts';
import { OpsEmpty, PageHead, Progress } from '../../widgets/parts.tsx';
import { openRecensementForm } from './recensement-sheets.tsx';
import { Bilan } from './recensement-bilan.tsx';
import type { Recensement as Operation } from '#shared/types.ts';

function RecensementCard({ r }: { r: Operation }) {
  const b = bilan(r);
  const n = b.aTraiter.length;
  return <Link to={`/materiels/recensement/${r.id}`} className="ops-card glass rec-card" aria-label={`Recensement ${r.nom}`}>
    <div className="ops-card-top">
      <span className={`badge-icon rec-badge${ouverte(r) ? ' is-open' : ''}`}><Icon name="clipboardCheck" size={18} /></span>
      <div><h2>{r.nom}</h2><p>{perimetre(r)} · {echeance(r)}</p></div>
    </div>
    <Progress value={b.pct} label={`Avancement de ${r.nom}`} />
    <p className="rec-card-foot">
      <span>{plural(b.vus, 'matériel vu', 'matériels vus')} sur {b.attendus}</span>
      {n > 0 && <span className="chip chip--move"><Icon name="alert" size={13} />{plural(n, 'constat')} à traiter</span>}
    </p>
  </Link>;
}

export function Recensement() {
  useTitle('Recensement');
  useStore();
  const { id } = useParams();
  if (!can('recensement.view')) return <Navigate to="/materiels/inventaire" replace />;
  if (id) return <Bilan id={id} />;
  const list = recensements();
  return <div className="group-view">
    <PageHead title="Recensement">
      {can('materiel.recensement') && <button className="btn btn--primary" onClick={() => openRecensementForm()}><Icon name="plus" size={18} /><span>Nouveau recensement</span></button>}
    </PageHead>
    {list.length
      ? <div className="ops-grid rec-grid">{list.map((r) => <RecensementCard key={r.id} r={r} />)}</div>
      : <OpsEmpty icon="clipboardCheck" title="Aucun recensement" text={can('materiel.recensement')
        ? 'Lancez un recensement, puis appairez les téléphones des agents : ils scannent les salles et les matériels, et leurs constats arrivent ici.'
        : 'Les recensements lancés par le gestionnaire et leurs constats apparaîtront ici.'} />}
  </div>;
}
