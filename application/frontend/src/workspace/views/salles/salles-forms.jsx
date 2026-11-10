/* ==========================================================================
   Salles · formulaire de salle (création, modification). L'étage est celui
   indiqué sur la salle : les étages d'un bâtiment sont ceux de ses salles.
   Renommage d'un bâtiment (vue du bâtiment et Administration › Bâtiments).
   ========================================================================== */

import { useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { useNavigate } from 'react-router';
import { Icon, Tile } from '../../ui/icons.jsx';
import { uid } from '../../core/dom.js';
import { store, currentEcole } from '../../core/store.js';
import { can } from '../../core/permissions.js';
import { batimentLabel } from '../../core/selectors.js';
import { batimentCode, renameBuilding } from '#shared/buildings.js';
import { Sheet, openSheet, notify } from '../../ui/overlays.jsx';
import { SheetForm, SheetFormActions } from '../../ui/forms.jsx';

export function openSalleForm(salle = null, defaults = {}) {
  if (!can('salle.manage')) return;
  openSheet(<SalleSheet salle={salle} defaults={defaults} />);
}

function SalleSheet({ salle, defaults }) {
  const isNew = !salle;
  const navigate = useNavigate();
  const [ecoleId] = useState(() => salle?.ecoleId ?? (currentEcole() !== 'all' ? currentEcole() : store.state.ecoles[0].id));
  const [bats] = useState(() => [...new Set(store.state.salles.filter((x) => x.ecoleId === ecoleId).map((x) => x.batiment))].sort());
  const [bat, setBat] = useState(() => (bats.length ? salle?.batiment ?? defaults.batiment ?? bats[0] : null)); // null : autre bâtiment
  const nomRef = useRef(null);
  const batRef = useRef(null);

  useEffect(() => { const t = setTimeout(() => nomRef.current?.focus(), 60); return () => clearTimeout(t); }, []);

  const pick = (b) => {
    flushSync(() => setBat(b));
    if (b === null) batRef.current.focus();
  };

  async function save(form) {
    const nom = form.get('nom').trim();
    const etage = Number(form.get('etage'));
    const batiment = bat === null ? batimentCode(form.get('batiment')) : bat;
    if (!nom || !batiment || !Number.isInteger(etage) || etage < -5 || etage > 30) throw Error('Renseignez le nom, le bâtiment et un étage entre −5 et 30.');
    const clash = store.state.salles.find((x) => x.ecoleId === ecoleId && x.nom.toLowerCase() === nom.toLowerCase() && x.id !== salle?.id);
    if (clash) throw Error(`La salle ${clash.nom} existe déjà dans cette école.`);
    const id = salle?.id ?? uid('s');
    store.update('data', (s) => {
      if (isNew) s.salles.push({ id, ecoleId, batiment, nom, etage });
      else Object.assign(s.salles.find((x) => x.id === id), { nom, batiment, etage });
    });
    await store.flush();
    notify(isNew ? `Salle ${nom} créée` : `Salle ${nom} enregistrée`, { icon: 'salles' });
    navigate(`/salles/salle/${id}`);
  }

  return <Sheet title={isNew ? 'Nouvelle salle' : `Modifier ${salle.nom}`} size="s" lead={<Tile name="salles" color="var(--c3)" size="m" />}
    footer={<SheetFormActions form="salle-form" icon="check" label={isNew ? 'Créer la salle' : 'Enregistrer'} />}>
    {/* Validation par les messages du formulaire, plus précis que ceux du navigateur */}
    <SheetForm id="salle-form" onSave={save} noValidate>
      <label className="field"><span className="field-label">Nom de la salle *</span><input ref={nomRef} name="nom" required maxLength={30} defaultValue={salle?.nom ?? ''} placeholder="Ex. B206" autoComplete="off" />
      </label>
      <label className="field"><span className="field-label">Étage *</span><input name="etage" type="number" min="-5" max="30" step="1" required defaultValue={salle?.etage ?? defaults.etage ?? 0} /><span className="field-hint">0 pour le rez-de-chaussée, −1 pour le premier sous-sol.</span></label>
      <div className="field"><span className="field-label">Bâtiment *</span>
        <div className="seg seg--wrap" role="radiogroup" aria-label="Bâtiment">
          {bats.map((b) => <button key={b} type="button" role="radio" className={`seg-btn ${bat === b ? 'is-on' : ''}`} aria-checked={bat === b} onClick={() => pick(b)}><span className="code-badge">{b}</span>{batimentLabel(b)}</button>)}
          <button type="button" role="radio" className={`seg-btn ${bat === null ? 'is-on' : ''}`} aria-checked={bat === null} onClick={() => pick(null)}><Icon name="plus" size={16} />Autre</button>
        </div>
        <input ref={batRef} name="batiment" maxLength={12} placeholder="Bâtiment (ex. C)" hidden={bat !== null} autoComplete="off" />
      </div>
    </SheetForm>
  </Sheet>;
}

/**
 * Renommage d'un bâtiment d'une école : ses salles, étages et règles suivent (shared/buildings.js).
 * onRenamed(nom) : appelé après l'enregistrement (la vue du bâtiment suit son nouveau nom).
 */
export function openBuildingForm(building, { onRenamed } = {}) {
  const { batiment } = building;
  async function save(form) {
    const nom = batimentCode(form.get('batiment'));
    if (nom === batiment) return;
    await store.update('data', (s) => renameBuilding(s, building, nom));
    await store.flush();
    notify(`${batimentLabel(batiment)} renommé ${batimentLabel(nom)}`, { icon: 'building' });
    onRenamed?.(nom);
  }
  openSheet(<Sheet title={`Renommer le bâtiment ${batiment}`} size="s" lead={<Tile name="building" color="var(--c3)" size="m" />}
    footer={<SheetFormActions form="building-form" label="Renommer" />}>
    <SheetForm id="building-form" onSave={save}>
      <label className="field"><span className="field-label">Nom du bâtiment *</span>
        <input className="input-code" name="batiment" required maxLength={12} defaultValue={batiment} autoComplete="off" />
        <span className="field-hint">Code court affiché sur les salles (ex. C). Les salles, les étages et les règles du bâtiment prennent ce nom.</span>
      </label>
    </SheetForm>
  </Sheet>);
}
