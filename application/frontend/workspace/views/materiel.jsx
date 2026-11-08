/* ==========================================================================
   Fiche matériel : création et modification
   Champs confirmés (RG-03 à RG-09) : modèle*, marque, date de réception*,
   numéro de série, hors service* (non par défaut), affectation (salle ou stock).
   Type : classement visuel proposé. Fin de garantie : fonctionnalité bonus.
   ========================================================================== */

import { useEffect, useRef, useState } from 'react';
import { Tile } from '../ui/icons.jsx';
import { uid } from '../core/dom.js';
import { store, currentEcole } from '../core/store.js';
import { useStore } from '../core/useStore.js';
import { can } from '../core/permissions.js';
import { DEVICE_TYPES, deviceType } from '../core/catalog.js';
import { scope, batiments, batimentLabel, index } from '../core/selectors.js';
import { Sheet, openSheet, notify } from '../ui/overlays.jsx';
import { SheetForm, SheetFormActions } from '../ui/forms.jsx';

const toDate = (t) => (t ? new Date(t).toISOString().slice(0, 10) : '');
const fromDate = (v) => (v ? new Date(`${v}T12:00:00`).getTime() : null);

/** Options d'affectation : stock + salles regroupées par bâtiment (la sélection passe par le <select>) */
export function AffectationOptions({ ecoleId }) {
  const salles = scope().salles.filter((x) => !ecoleId || x.ecoleId === ecoleId);
  return <>
    <option value="">Stock (sans localisation)</option>
    {batiments().map((b) => {
      const list = salles.filter((x) => x.batiment === b);
      return list.length ? <optgroup key={b} label={batimentLabel(b)}>{list.map((x) => <option key={x.id} value={x.id}>{x.nom}</option>)}</optgroup> : null;
    })}
  </>;
}

export function openMaterielForm(materiel = null, { salleId = null } = {}) {
  const isNew = !materiel;
  if (!can(isNew ? 'materiel.create' : 'materiel.edit')) return;
  const ecoleId = materiel?.ecoleId ?? (currentEcole() !== 'all' ? currentEcole() : null) ?? index().salle.get(salleId)?.ecoleId ?? store.state.ecoles[0].id;
  openSheet(<MaterielForm materiel={materiel} salleId={salleId} ecoleId={ecoleId} />);
}

function MaterielForm({ materiel, salleId, ecoleId }) {
  useStore();
  const isNew = !materiel;
  const [type, setType] = useState(materiel?.type ?? 'uc');
  const [hs, setHs] = useState(materiel?.hs ?? false);
  const modeleRef = useRef(null);
  const t = deviceType(type);

  useEffect(() => {
    const timer = setTimeout(() => modeleRef.current?.focus(), 60);
    return () => clearTimeout(timer);
  }, []);

  async function save(form) {
    const modele = form.get('modele').trim();
    const reception = fromDate(form.get('reception'));
    if (!modele || !reception) throw Error('Renseignez le modèle et la date de réception.');
    const data = {
      type, modele, marque: form.get('marque').trim() || null, serie: form.get('serie').trim() || null,
      dateReception: reception, hs, salleId: form.get('salle') || null, garantieFin: fromDate(form.get('garantie')),
    };
    const newId = isNew ? uid('m') : null;
    store.update('data', (s) => {
      if (isNew) {
        s.materiels.push({ id: newId, ecoleId, idAster: 'MAT-0000', ...data }); // attribué par le serveur
      } else {
        Object.assign(s.materiels.find((m) => m.id === materiel.id), data);
      }
    });
    await store.flush();
    const idAster = isNew ? store.state.materiels.find((m) => m.id === newId)?.idAster ?? 'Matériel' : materiel.idAster;
    notify(isNew ? `${idAster} enregistré` : `${idAster} modifié`, { icon: t.icon });
  }

  return <Sheet title={isNew ? 'Ajouter un matériel' : `Modifier ${materiel.idAster}`} size="m" lead={<Tile name={t.icon} color={t.color} size="m" />}
    footer={<SheetFormActions form="materiel-form" icon="check" />}>
    <SheetForm id="materiel-form" onSave={save}>
      <div className="field"><span className="field-label">Type</span>
        <div className="type-picker type-picker--wide" role="radiogroup" aria-label="Type de matériel">
          {DEVICE_TYPES.map((d) => <button key={d.id} type="button" role="radio" aria-checked={d.id === type} className={d.id === type ? 'is-on' : ''}
            data-tip={d.label} onClick={() => setType(d.id)}><Tile name={d.icon} color={d.color} size="m" /></button>)}
        </div>
      </div>
      <div className="form-2">
        <label className="field"><span className="field-label">Modèle *</span><input ref={modeleRef} name="modele" required maxLength={60} defaultValue={materiel?.modele ?? ''} placeholder="Écran 24 pouces" autoComplete="off" /></label>
        <label className="field"><span className="field-label">Marque</span><input name="marque" maxLength={40} defaultValue={materiel?.marque ?? ''} placeholder="Facultative" autoComplete="off" /></label>
        <label className="field"><span className="field-label">Date de réception *</span><input name="reception" type="date" required defaultValue={toDate(materiel?.dateReception ?? Date.now())} /></label>
        <label className="field"><span className="field-label">Numéro de série</span><input name="serie" maxLength={40} defaultValue={materiel?.serie ?? ''} placeholder="Facultatif" autoComplete="off" /></label>
        <label className="field"><span className="field-label">Affectation</span><select name="salle" defaultValue={(materiel ? materiel.salleId : salleId) ?? ''}><AffectationOptions ecoleId={ecoleId} /></select>
          <span className="field-hint">Un matériel peut rester en stock sans salle.</span></label>
        <div className="field"><span className="field-label">Hors service *</span>
          <div className="seg seg--wide" role="radiogroup" aria-label="Hors service">
            <button type="button" role="radio" aria-checked={!hs} className={`seg-btn${!hs ? ' is-on' : ''}`} onClick={() => setHs(false)}><span className="led led--ok" />Non</button>
            <button type="button" role="radio" aria-checked={hs} className={`seg-btn${hs ? ' is-on' : ''}`} onClick={() => setHs(true)}><span className="led led--hs" />Oui</button>
          </div></div>
        <label className="field"><span className="field-label">Fin de garantie</span><input name="garantie" type="date" defaultValue={toDate(materiel?.garantieFin)} />
          <span className="field-hint">Facultative.</span></label>
        {materiel
          ? <div className="field"><span className="field-label">Identifiant ASTER</span><output className="id-aster">{materiel.idAster}</output></div>
          : <div className="field"><span className="field-label">Identifiant ASTER</span><output className="id-aster is-muted">Attribué à l’enregistrement</output></div>}
      </div>
    </SheetForm>
  </Sheet>;
}
