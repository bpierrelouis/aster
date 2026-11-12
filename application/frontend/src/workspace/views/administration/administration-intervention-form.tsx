/* ==========================================================================
   Administration · demande d'intervention : installer ou désinstaller une
   application (Applications, fiche d'un poste), réinitialiser Windows (Postes),
   sur une salle entière ou un seul poste. Le titre et le bouton reprennent
   l'intervention choisie ; le résumé indique les postes visés, ceux qui la
   commencent aussitôt (connectés) et ceux qui l'attendront (indisponibles).
   Le suivi est dans Administration › Interventions.
   ========================================================================== */

import { useState } from 'react';
import { store, me } from '../../core/store.ts';
import { useStore } from '../../hooks/use-store.ts';
import { scope, index, batimentLabel } from '../../core/selectors.ts';
import { titreIntervention, objetIntervention, cibleIntervention } from '../../core/interventions.ts';
import { uid } from '../../core/dom.ts';
import { intervention, etatPoste } from '#shared/catalog.ts';
import { plural } from '#shared/format.ts';
import { Icon, Tile } from '../../ui/icons.tsx';
import { AppIcon } from '../../ui/app-icon.tsx';
import { Sheet, openSheet, notify } from '../../ui/overlays.tsx';
import { SheetForm, SheetFormActions } from '../../ui/forms.tsx';
import type { Application, Id, InterventionType, Operation } from '#shared/types.ts';

const IMAGE = 'Windows — configuration de référence'; // image réappliquée par une réinitialisation
/** Cible d'une demande : salle entière ou postes choisis */
type Mode = 'salle' | 'postes';
const CIBLES: [Mode, string][] = [['salle', 'Salle entière'], ['postes', 'Postes']];

/** type : installation, desinstallation ou reinstallation ; salleId (salle filtrée dans la fenêtre principale) ou posteId :
    cible proposée ; sans elle, aucune salle n'est choisie d'avance */
export function openInterventionForm(type: InterventionType, { applicationId, salleId = '', posteId = null }: { applicationId?: Id; salleId?: Id | null; posteId?: Id | null } = {}) {
  const t = intervention(type)!;
  const app = store.state.applications.find((a) => a.id === applicationId);
  if (type !== 'reinstallation' && !app) return;
  openSheet(<Sheet title={`${t.verbe} ${objetIntervention({ type, applicationId })}`} lead={app ? <AppIcon name={app.nom} size={36} /> : <Tile name={t.icon} color="var(--accent)" size="m" />}
    footer={<SheetFormActions form="intervention-form" label={t.verbe} icon={t.icon} tone={type === 'installation' ? 'primary' : 'danger'} />}>
    <InterventionForm type={type} app={app} salleId={salleId} posteId={posteId} />
  </Sheet>);
}

/** Enregistre la demande (salle entière, ou postes d'une salle) ; le serveur fixe les postes d'une salle, l'auteur, la date et le suivi. */
async function recordOperation(type: InterventionType, target: { salleId?: Id; postes?: Id[] }, extra: { applicationId: Id } | { image: string }) {
  const cibles = target.salleId ? scope().postes.filter((p) => p.salleId === target.salleId).map((p) => p.id) : target.postes!;
  await store.update('data', (s) => { s.operations.push({ id: uid('op'), type, cibles, ...(target.salleId && { salleId: target.salleId }), ...extra, at: Date.now(), par: me().nom } as Operation); });
  await store.flush();
  notify(`${titreIntervention({ type, ...extra })} demandée pour ${cibleIntervention(target)}`, { icon: intervention(type)!.icon, tone: 'info' });
}

function InterventionForm({ type, app, salleId, posteId }: { type: InterventionType; app: Application | undefined; salleId: Id | null; posteId: Id | null }) {
  useStore();
  const salles = scope().salles.filter((s) => scope().postes.some((p) => p.salleId === s.id)); // salles équipées de postes
  const [mode, setMode] = useState<Mode>(posteId ? 'postes' : 'salle');
  const [salle, setSalle] = useState(() => index().poste.get(posteId!)?.salleId ?? (salles.some((s) => s.id === salleId) ? salleId! : ''));
  const [choisis, setChoisis] = useState(() => new Set<Id>(posteId ? [posteId] : []));
  const postes = scope().postes.filter((p) => p.salleId === salle).sort((a, b) => a.nomReseau.localeCompare(b.nomReseau, 'fr', { numeric: true }));
  const equipes = new Set(app ? store.state.installations.filter((i) => i.applicationId === app.id).map((i) => i.posteId) : []);
  const vises = mode === 'salle' ? postes : postes.filter((p) => choisis.has(p.id));
  const on = vises.filter((p) => p.allume).length;
  const off = vises.length - on;
  const deja = vises.filter((p) => equipes.has(p.id)).length;
  const un = mode === 'postes' && vises.length === 1;
  const basculer = (id: Id) => setChoisis((prev) => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next; });

  async function save() {
    if (!salle) throw Error('Choisissez la salle.');
    if (!vises.length) throw Error('Choisissez au moins un poste.');
    await recordOperation(type, mode === 'salle' ? { salleId: salle } : { postes: vises.map((p) => p.id) }, app ? { applicationId: app.id } : { image: IMAGE });
  }

  return <SheetForm id="intervention-form" onSave={save}>
    <div className="seg seg--wide" role="radiogroup" aria-label="Cible">
      {CIBLES.map(([id, label]) => <button key={id} type="button" role="radio" aria-checked={mode === id} className={`seg-btn ${mode === id ? 'is-on' : ''}`} onClick={() => setMode(id)}>{label}</button>)}
    </div>
    <label className="field"><span className="field-label">Salle</span>
      <select value={salle} required onChange={(e) => { setSalle(e.target.value); setChoisis(new Set()); }}>
        <option value="" disabled>Choisir une salle</option>
        {[...new Set(salles.map((s) => s.batiment))].sort().map((b) => <optgroup key={b} label={batimentLabel(b)}>
          {salles.filter((s) => s.batiment === b).map((s) => <option key={s.id} value={s.id}>{s.nom} · {plural(scope().postes.filter((p) => p.salleId === s.id).length, 'poste')}</option>)}
        </optgroup>)}
      </select>
    </label>
    {mode === 'postes' && salle && <div className="field">
      <span className="field-label" id="intervention-postes">Postes</span>
      <div className="pick-devices" role="group" aria-labelledby="intervention-postes">{postes.map((p) => {
        const chosen = choisis.has(p.id);
        const e = etatPoste(p, index().materiel.get(p.materielId!));
        return <button key={p.id} type="button" aria-pressed={chosen} aria-label={p.nomReseau} className={`pick-device ${chosen ? 'is-on' : ''}`}
          data-tip={`${p.nomReseau}\n${e.label}${p.session ? ` : ${p.session}` : ''}`} onClick={() => basculer(p.id)}>
          <span className="pick-check"><Icon name="check" size={12} stroke={3} /></span>
          <span className="tile-wrap"><Tile name="desktop" color="var(--c1)" size="m" /><span className={`led led--${e.led} tile-led`} /></span>
          <span className="pick-device-label">{p.nomReseau.split('-').pop()}</span>
          {equipes.has(p.id) && <small className="pick-device-note">{app!.nom}</small>}
        </button>;
      })}</div>
    </div>}
    <ul className="ops-summary" aria-live="polite">
      {vises.length ? <>
        <li><Icon name="desktop" size={16} /><b>{un ? vises[0].nomReseau : `${plural(vises.length, 'poste visé', 'postes visés')}${mode === 'salle' ? ', toute la salle' : ''}`}</b></li>
        {on > 0 && <li><i className="led led--ok" />{un ? 'Allumé' : plural(on, 'allumé', 'allumés')} : démarrage immédiat</li>}
        {off > 0 && <li><i className="led led--wait" />{un ? 'Éteint ou indisponible' : plural(off, 'éteint ou indisponible', 'éteints ou indisponibles')} : en attente de {off > 1 ? 'leur' : 'son'} retour</li>}
        {app && <li><AppIcon name={app.nom} size={16} />{deja ? `${app.nom} installé sur ${un ? 'ce poste' : plural(deja, 'poste')}` : `${app.nom} absent ${un ? 'de ce poste' : 'de ces postes'}`}</li>}
      </> : <li><Icon name="desktop" size={16} />{salle ? 'Choisissez au moins un poste.' : 'Choisissez la salle.'}</li>}
    </ul>
  </SheetForm>;
}
