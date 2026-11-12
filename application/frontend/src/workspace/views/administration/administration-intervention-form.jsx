/* ==========================================================================
   Administration · demande d'intervention : installer ou désinstaller une
   application (Applications, fiche d'un poste), réinstaller Windows (Postes),
   sur une salle entière ou un seul poste. Le titre et le bouton reprennent
   l'intervention choisie ; le résumé indique les postes visés, ceux qui la
   commencent aussitôt (connectés) et ceux qui l'attendront (indisponibles).
   Le suivi est dans Administration › Interventions.
   ========================================================================== */

import { useState } from 'react';
import { store, me } from '../../core/store.js';
import { useStore } from '../../hooks/use-store.js';
import { scope, index, batimentLabel } from '../../core/selectors.js';
import { titreIntervention, objetIntervention, cibleIntervention } from '../../core/interventions.js';
import { uid } from '../../core/dom.js';
import { intervention } from '#shared/catalog.js';
import { plural } from '#shared/format.js';
import { Icon, Tile } from '../../ui/icons.jsx';
import { AppIcon } from '../../ui/app-icon.jsx';
import { Sheet, openSheet, notify } from '../../ui/overlays.jsx';
import { SheetForm, SheetFormActions } from '../../ui/forms.jsx';

const IMAGE = 'Windows — configuration de référence'; // image réappliquée par une réinstallation
const CIBLES = [['salle', 'Salle entière'], ['poste', 'Un poste']];

/** type : installation, desinstallation ou reinstallation ; salleId ou posteId : cible proposée */
export function openInterventionForm(type, { applicationId = null, salleId = '', posteId = null } = {}) {
  const t = intervention(type);
  const app = store.state.applications.find((a) => a.id === applicationId);
  if (type !== 'reinstallation' && !app) return;
  openSheet(<Sheet title={`${t.verbe} ${objetIntervention({ type, applicationId })}`} lead={app ? <AppIcon name={app.nom} size={36} /> : <Tile name={t.icon} color="var(--accent)" size="m" />}
    footer={<SheetFormActions form="intervention-form" label={t.verbe} icon={t.icon} tone={type === 'installation' ? 'primary' : 'danger'} />}>
    <InterventionForm type={type} app={app} salleId={salleId} posteId={posteId} />
  </Sheet>);
}

/** Enregistre la demande ; le serveur fixe les postes d'une salle, l'auteur, la date et le suivi. */
async function recordOperation(type, target, extra) {
  const cibles = target.salleId ? scope().postes.filter((p) => p.salleId === target.salleId).map((p) => p.id) : [target.posteId];
  await store.update('data', (s) => { s.operations.push({ id: uid('op'), type, cibles, ...(target.salleId && { salleId: target.salleId }), ...extra, at: Date.now(), par: me().nom }); });
  await store.flush();
  notify(`${titreIntervention({ type, ...extra })} demandée pour ${cibleIntervention(target)}`, { icon: intervention(type).icon, tone: 'info' });
}

function InterventionForm({ type, app, salleId, posteId }) {
  useStore();
  const salles = scope().salles.filter((s) => scope().postes.some((p) => p.salleId === s.id)); // salles équipées de postes
  const [mode, setMode] = useState(posteId ? 'poste' : 'salle');
  const [salle, setSalle] = useState(() => index().poste.get(posteId)?.salleId ?? (salles.some((s) => s.id === salleId) ? salleId : salles[0]?.id));
  const [poste, setPoste] = useState(posteId);
  const postes = scope().postes.filter((p) => p.salleId === salle).sort((a, b) => a.nomReseau.localeCompare(b.nomReseau, 'fr', { numeric: true }));
  const equipes = new Set(app ? store.state.installations.filter((i) => i.applicationId === app.id).map((i) => i.posteId) : []);
  const vises = mode === 'salle' ? postes : postes.filter((p) => p.id === poste);
  const on = vises.filter((p) => p.connecte).length;
  const off = vises.length - on;
  const deja = vises.filter((p) => equipes.has(p.id)).length;

  async function save() {
    if (!vises.length) throw Error(mode === 'poste' ? 'Choisissez le poste.' : 'Choisissez la salle.');
    await recordOperation(type, mode === 'salle' ? { salleId: salle } : { posteId: poste }, app ? { applicationId: app.id } : { image: IMAGE });
  }

  return <SheetForm id="intervention-form" onSave={save}>
    <div className="seg seg--wide" role="radiogroup" aria-label="Cible">
      {CIBLES.map(([id, label]) => <button key={id} type="button" role="radio" aria-checked={mode === id} className={`seg-btn ${mode === id ? 'is-on' : ''}`} onClick={() => setMode(id)}>{label}</button>)}
    </div>
    <label className="field"><span className="field-label">Salle</span>
      <select value={salle ?? ''} onChange={(e) => { setSalle(e.target.value); setPoste(null); }}>
        {[...new Set(salles.map((s) => s.batiment))].sort().map((b) => <optgroup key={b} label={batimentLabel(b)}>
          {salles.filter((s) => s.batiment === b).map((s) => <option key={s.id} value={s.id}>{s.nom} · {plural(scope().postes.filter((p) => p.salleId === s.id).length, 'poste')}</option>)}
        </optgroup>)}
      </select>
    </label>
    {mode === 'poste' && <div className="field">
      <span className="field-label" id="intervention-poste">Poste</span>
      <div className="pick-devices" role="radiogroup" aria-labelledby="intervention-poste">{postes.map((p) => {
        const chosen = p.id === poste;
        return <button key={p.id} type="button" role="radio" aria-checked={chosen} aria-label={p.nomReseau} className={`pick-device ${chosen ? 'is-on' : ''}`}
          data-tip={`${p.nomReseau}\n${p.connecte ? 'Connecté' : 'Éteint ou indisponible'}`} onClick={() => setPoste(p.id)}>
          <span className="pick-check"><Icon name="check" size={12} stroke={3} /></span>
          <span className="tile-wrap"><Tile name="desktop" color="var(--c1)" size="m" /><span className={`led led--${p.connecte ? 'ok' : 'wait'} tile-led`} /></span>
          <span className="pick-device-label">{p.nomReseau.split('-').pop()}</span>
          {equipes.has(p.id) && <small className="pick-device-note">{app.nom}</small>}
        </button>;
      })}</div>
    </div>}
    <ul className="ops-summary" aria-live="polite">
      {vises.length ? <>
        <li><Icon name="desktop" size={16} /><b>{mode === 'salle' ? `${plural(vises.length, 'poste visé', 'postes visés')}, toute la salle` : vises[0].nomReseau}</b></li>
        {on > 0 && <li><i className="led led--ok" />{mode === 'salle' ? plural(on, 'connecté', 'connectés') : 'Connecté'} : démarrage immédiat</li>}
        {off > 0 && <li><i className="led led--wait" />{mode === 'salle' ? plural(off, 'éteint ou indisponible', 'éteints ou indisponibles') : 'Éteint ou indisponible'} : en attente de {off > 1 ? 'leur' : 'son'} retour</li>}
        {app && <li><AppIcon name={app.nom} size={16} />{deja ? `${app.nom} installé sur ${mode === 'salle' ? plural(deja, 'poste') : 'ce poste'}` : `${app.nom} absent ${mode === 'salle' ? 'de ces postes' : 'de ce poste'}`}</li>}
      </> : <li><Icon name="desktop" size={16} />Choisissez le poste.</li>}
    </ul>
  </SheetForm>;
}
