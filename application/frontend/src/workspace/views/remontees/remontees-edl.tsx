/* ==========================================================================
   Remontées · état des lieux : document généré depuis la remontée,
   consultable et imprimable (RG-14, RG-35), avec son suivi de la
   transmission à la fin du traitement. Le PDF (backend/workspace/pdf.ts)
   est produit par le serveur à chaque demande, sans être conservé.
   ========================================================================== */

import { Icon, Tile } from '../../ui/icons.tsx';
import { OrionLogo } from '../../../connexion/brand.tsx';
import { Sheet, openSheet, notify } from '../../ui/overlays.tsx';
import { dateLong, dateShort } from '#shared/format.ts';
import { deviceType, problem, suiviRemontee } from '#shared/catalog.ts';
import { remonteeContext, batimentLabel, index } from '../../core/selectors.ts';
import type { Remontee } from '#shared/types.ts';

function printEtatDesLieux() {
  document.documentElement.classList.add('is-printing-edl');
  try { window.print(); } catch { notify('Impression momentanément indisponible', { icon: 'print', tone: 'warn' }); }
  setTimeout(() => document.documentElement.classList.remove('is-printing-edl'), 500);
}

export function openEtatDesLieux(r: Remontee) {
  const { mats } = remonteeContext(r);
  const ix = index();
  const ecole = ix.ecole.get(r.ecoleId);
  const p = problem(r.probleme);
  const steps = suiviRemontee(r);
  const updated = steps.findLast((s) => !s.todo)!.at!;
  openSheet(
    <Sheet title={`État des lieux ${r.id}`} size="l" lead={<Tile name="documents" color="var(--accent)" size="m" />}
      footer={<>
        <span className="sheet-hint"><Icon name="documents" size={16} />Format A4</span>
        <a className="btn btn--glass" href={`/api/workspace/reports/${encodeURIComponent(r.id)}/pdf`} target="_blank" rel="noopener">Télécharger le PDF</a>
        <button className="btn btn--primary" onClick={printEtatDesLieux}><Icon name="print" size={18} /><span>Imprimer ou enregistrer en PDF</span></button>
      </>}>
      <article className="edl" aria-label={`État des lieux ${r.id}`}>
        <header className="edl-head">
          <span className="edl-brand"><OrionLogo /></span>
          <div className="edl-ref"><span>État des lieux</span><b>{r.id}</b></div>
        </header>
        <dl className="edl-meta">
          <div><dt>École</dt><dd>{ecole?.nom ?? ''}</dd></div>
          <div><dt>Déclarée par</dt><dd>{r.auteur}</dd></div>
          <div><dt>Date</dt><dd>{dateLong(r.createdAt)}</dd></div>
        </dl>
        <h3>Matériels concernés</h3>
        <table className="edl-table">
          <thead><tr><th>Matériel</th><th>Identifiant Orion</th><th>N° de série</th><th>Localisation</th></tr></thead>
          <tbody>{mats.map((m) => {
            const salle = m.salleId ? ix.salle.get(m.salleId) : null;
            return <tr key={m.id}>
              <td><b>{m.modele}</b><br /><small>{deviceType(m.type).label}{m.marque ? `, ${m.marque}` : ''}</small></td>
              <td>{m.idOrion}</td><td>{m.serie ?? '—'}</td>
              <td>{salle ? `${salle.nom}, ${batimentLabel(salle.batiment)}` : 'Stock'}</td>
            </tr>;
          })}</tbody>
        </table>
        <h3>Problème</h3>
        <p className="edl-problem"><Icon name={p.icon} size={18} /><b>{p.label}</b></p>
        <p className="edl-desc">{r.description}</p>
        <h3>Suivi</h3>
        <table className="edl-table" aria-label="Suivi de la remontée">
          <thead><tr><th>Étape</th><th>Date</th><th>Par</th></tr></thead>
          <tbody>{steps.map((s, i) => (s.todo
            ? <tr key={i} className="is-todo"><td>{s.label}</td><td colSpan={2}>À venir · {s.sub}</td></tr>
            : <tr key={i}><td><b>{s.label}</b></td><td>{dateLong(s.at!)}</td><td>{s.par}</td></tr>))}</tbody>
        </table>
        <footer className="edl-foot">Document établi par Orion le {dateShort(r.createdAt)}{updated > r.createdAt && `, mis à jour le ${dateShort(updated)}`}.</footer>
      </article>
    </Sheet>,
  );
}
