/* ==========================================================================
   Remontées · état des lieux : document généré depuis la remontée,
   consultable et imprimable (RG-14, RG-35).
   ========================================================================== */

import { Icon, Tile, Flower } from '../ui/icons.jsx';
import { Sheet, openSheet, notify } from '../ui/overlays.jsx';
import { dateLong, dateShort } from '../core/format.js';
import { deviceType, problem } from '../core/catalog.js';
import { remonteeContext, batimentLabel, index } from '../core/selectors.js';

function printEtatDesLieux() {
  document.documentElement.classList.add('is-printing-edl');
  try { window.print(); } catch { notify('Impression momentanément indisponible', { icon: 'print', tone: 'warn' }); }
  setTimeout(() => document.documentElement.classList.remove('is-printing-edl'), 500);
}

export function openEtatDesLieux(r) {
  const { mats } = remonteeContext(r);
  const ix = index();
  const ecole = ix.ecole.get(r.ecoleId);
  const p = problem(r.probleme);
  openSheet(
    <Sheet title={`État des lieux ${r.id}`} size="l" lead={<Tile name="documents" color="var(--accent)" size="m" />}
      footer={<>
        <span className="sheet-hint"><Icon name="documents" size={16} />Format A4</span>
        <a className="btn btn--glass" href={`/api/workspace/reports/${encodeURIComponent(r.id)}/pdf`} target="_blank" rel="noopener">Télécharger le PDF</a>
        <button className="btn btn--primary" onClick={printEtatDesLieux}><Icon name="print" size={18} /><span>Imprimer ou enregistrer en PDF</span></button>
      </>}>
      <article className="edl" aria-label={`État des lieux ${r.id}`}>
        <header className="edl-head">
          <span className="edl-brand"><Flower size={40} /><b>ASTER</b></span>
          <div className="edl-ref"><span>État des lieux</span><b>{r.id}</b></div>
        </header>
        <dl className="edl-meta">
          <div><dt>École</dt><dd>{ecole?.nom ?? ''}</dd></div>
          <div><dt>Déclarée par</dt><dd>{r.auteur}</dd></div>
          <div><dt>Date</dt><dd>{dateLong(r.createdAt)}</dd></div>
        </dl>
        <h3>Matériels concernés</h3>
        <table className="edl-table">
          <thead><tr><th>Matériel</th><th>Identifiant ASTER</th><th>N° de série</th><th>Localisation</th></tr></thead>
          <tbody>{mats.map((m) => {
            const salle = m.salleId ? ix.salle.get(m.salleId) : null;
            return <tr key={m.id}>
              <td><b>{m.modele}</b><br /><small>{deviceType(m.type).label}{m.marque ? `, ${m.marque}` : ''}</small></td>
              <td>{m.idAster}</td><td>{m.serie ?? '—'}</td>
              <td>{salle ? `${salle.nom}, ${batimentLabel(salle.batiment)}` : 'Stock'}</td>
            </tr>;
          })}</tbody>
        </table>
        <h3>Problème</h3>
        <p className="edl-problem"><Icon name={p.icon} size={18} /><b>{p.label}</b></p>
        <p className="edl-desc">{r.description}</p>
        <footer className="edl-foot">Document établi par ASTER le {dateShort(r.createdAt)}.</footer>
      </article>
    </Sheet>,
  );
}
