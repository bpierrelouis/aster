/* ==========================================================================
   Remontées · matériels concernés (détail) : chaque matériel ouvre sa fiche.
   Remontée en cours, pour le gestionnaire : un interrupteur déclare le
   matériel en service ou hors service. Un matériel hors service d'une salle
   ne peut qu'être remis en service ou renvoyé au stock (règle tenue par le
   serveur) : il peut être relocalisé dans le stock, remplacé par un matériel
   en service du stock de même type, ou les deux ; chaque choix lance un
   déplacement, confirmé comme les autres (Salles › Déplacements).
   ========================================================================== */

import { useState } from 'react';
import { Link } from 'react-router';
import { store } from '../../core/store.js';
import { remonteeContext, materielsOf } from '../../core/selectors.js';
import { deviceType } from '#shared/catalog.js';
import { plural } from '#shared/format.js';
import { Icon, Tile } from '../../ui/icons.jsx';
import { Switch } from '../../ui/forms.jsx';
import { notify } from '../../ui/overlays.jsx';
import { LieuChip } from '../../widgets/parts.jsx';

/** gerer : remontée en cours et compte qui traite les remontées et déplace le matériel */
export function MaterielsConcernes({ r, gerer }) {
  return <ul className="rows rows--flat">{remonteeContext(r).mats.map((m) => <Materiel key={m.id} m={m} gerer={gerer} />)}</ul>;
}

function Materiel({ m, gerer }) {
  const t = deviceType(m.type);
  async function setHs(hs) {
    store.update('data', (s) => { s.materiels.find((x) => x.id === m.id).hs = hs; });
    try { await store.flush(); } catch { return; }
    notify(`${m.idAster} ${hs ? 'déclaré hors service' : 'remis en service'}`, { icon: hs ? 'power' : 'checkCircle', tone: hs ? 'warn' : 'ok' });
  }
  return <li>
    <div className="rm-mat">
      <Link className="row" to={`/salles/${m.salleId ? `salle/${m.salleId}` : 'stock'}?m=${m.id}`}>
        <span className="tile-wrap"><Tile name={t.icon} color={t.color} size="m" /><span className={`led led--${m.hs ? 'hs' : 'ok'} tile-led`} /></span>
        <span className="row-main"><span className="row-title">{m.modele}</span><span className="row-sub"><LieuChip m={m} /><span className="row-meta">{m.idAster}</span></span></span>
        {!gerer && <Icon name="chevR" size={16} />}
      </Link>
      {gerer && <span className="rm-mat-etat"><small>{m.hs ? 'Hors service' : 'En service'}</small><Switch on={!m.hs} onChange={(on) => setHs(!on)} label={`${m.modele} ${m.idAster} en service`} /></span>}
    </div>
    {gerer && m.hs && m.salleId && !m.deplacement && <Remise m={m} />}
  </li>;
}

/** Matériel hors service d'une salle : relocalisation dans le stock et remplacement, un déplacement chacun */
function Remise({ m }) {
  const [stock, setStock] = useState(false);
  const [remplacer, setRemplacer] = useState(false);
  const candidats = materielsOf(null).filter((x) => x.ecoleId === m.ecoleId && x.type === m.type && !x.hs && !x.deplacement);
  const [remplacant, setRemplacant] = useState(candidats[0]?.id ?? '');
  const choisi = remplacer && candidats.some((x) => x.id === remplacant);
  const n = Number(stock) + Number(choisi);

  async function submit(e) {
    e.preventDefault();
    if (!n) return;
    store.update('data', (s) => {
      if (stock) s.materiels.find((x) => x.id === m.id).salleId = null;
      if (choisi) s.materiels.find((x) => x.id === remplacant).salleId = m.salleId;
    });
    try { await store.flush(); } catch { return; }
    notify(`${plural(n, 'déplacement lancé', 'déplacements lancés')}, à confirmer dans Salles › Déplacements`, { icon: 'refresh', tone: 'info' });
  }

  return <form className="rm-remise" onSubmit={submit} aria-label={`Remise de ${m.idAster}`}>
    <label className="rm-remise-choix"><input type="checkbox" checked={stock} onChange={(e) => setStock(e.target.checked)} />Relocaliser dans le stock</label>
    <label className="rm-remise-choix"><input type="checkbox" checked={remplacer} disabled={!candidats.length} onChange={(e) => setRemplacer(e.target.checked)} />Remplacer par
      {candidats.length
        ? <select value={remplacant} disabled={!remplacer} onChange={(e) => setRemplacant(e.target.value)} aria-label="Matériel de remplacement">
          {candidats.map((x) => <option key={x.id} value={x.id}>{x.modele} · {x.idAster}</option>)}
        </select>
        : <small>aucun {deviceType(m.type).label.toLowerCase()} en service au stock</small>}
    </label>
    <button type="submit" className="btn btn--primary" disabled={!n}><Icon name="refresh" size={17} /><span>{n === 2 ? 'Lancer les 2 déplacements' : 'Lancer le déplacement'}</span></button>
  </form>;
}
