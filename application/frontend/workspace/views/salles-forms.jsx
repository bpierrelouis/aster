/* ==========================================================================
   Salles · formulaires : salle (création, modification) et étage.
   ========================================================================== */

import { useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { useNavigate } from 'react-router';
import { Icon, Tile } from '../ui/icons.jsx';
import { uid } from '../core/dom.js';
import { store, currentEcole } from '../core/store.js';
import { can } from '../core/permissions.js';
import { scope, batimentLabel } from '../core/selectors.js';
import { Sheet, openSheet, notify, useSheetClose } from '../ui/overlays.jsx';
import { SheetForm, SheetFormActions } from '../ui/forms.jsx';
import { floorLevel, floorsOf } from './salles-scene.jsx';

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
    const batiment = bat === null ? form.get('batiment').trim().toUpperCase() : bat;
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

/** Un étage reste visible même avant l'ajout de sa première salle. */
export function openFloorForm(batiment, previous = null) {
  if (!can('salle.manage') || !batiment) return;
  const ecoleId = currentEcole() === 'all' ? scope().salles.find((s) => s.batiment === batiment)?.ecoleId : currentEcole();
  if (!ecoleId) return;
  openSheet(<FloorSheet batiment={batiment} previous={previous} ecoleId={ecoleId} />);
}

const sameFloor = (ecoleId, batiment, niveau) => (f) => f.ecoleId === ecoleId && f.batiment === batiment && f.niveau === niveau;

function FloorSheet({ batiment, previous, ecoleId }) {
  const navigate = useNavigate();
  const [levels] = useState(() => floorsOf(batiment));
  const [empty] = useState(() => previous !== null && !scope().salles.some((r) => r.ecoleId === ecoleId && r.batiment === batiment && floorLevel(r) === previous));

  async function save(form) {
    const value = form.get('niveau');
    const niveau = Number(value);
    if (!value || !Number.isInteger(niveau) || niveau < -5 || niveau > 30 || (niveau !== previous && levels.includes(niveau))) throw Error('Choisissez un étage libre entre −5 et 30.');
    store.update('data', (state) => {
      state.etages ??= [];
      const old = state.etages.find(sameFloor(ecoleId, batiment, previous));
      if (old) old.niveau = niveau;
      else state.etages.push({ id: uid('etage'), ecoleId, batiment, niveau });
      if (previous !== null) state.salles.filter((r) => r.ecoleId === ecoleId && r.batiment === batiment && floorLevel(r) === previous).forEach((r) => { r.etage = niveau; });
    });
    await store.flush();
    navigate(`/salles/batiment/${encodeURIComponent(batiment)}?etage=${niveau}`);
    notify('Étage enregistré', { icon: 'layers' });
  }

  return <Sheet title={previous === null ? 'Ajouter un étage' : 'Modifier l’étage'} size="s" lead={<Tile name="layers" color="var(--iris)" size="m" />}
    footer={<>
      {empty && <RemoveFloorButton batiment={batiment} ecoleId={ecoleId} previous={previous} />}
      <SheetFormActions form="floor-form" />
    </>}>
    <SheetForm id="floor-form" onSave={save}>
      <p>{batimentLabel(batiment)}</p>
      <label className="field"><span className="field-label">Numéro de l’étage</span><input name="niveau" type="number" min="-5" max="30" step="1" defaultValue={previous ?? Math.max(0, ...levels) + 1} required /><span className="field-hint">0 : rez-de-chaussée. Les salles conservent leur ordre alphabétique.</span></label>
    </SheetForm>
  </Sheet>;
}

/** Suppression d'un étage sans salle : action distincte de l'enregistrement. */
function RemoveFloorButton({ batiment, ecoleId, previous }) {
  const close = useSheetClose();
  const navigate = useNavigate();
  const [pending, setPending] = useState(false);
  async function remove() {
    setPending(true);
    try {
      store.update('data', (state) => { state.etages = (state.etages ?? []).filter((f) => !sameFloor(ecoleId, batiment, previous)(f)); });
      await store.flush();
      close();
      navigate(`/salles/batiment/${encodeURIComponent(batiment)}`);
      notify('Étage supprimé', { icon: 'layers' });
    } catch (error) {
      notify(error.message, { tone: 'danger' });
      setPending(false);
    }
  }
  return <button className="btn btn--ghost" type="button" disabled={pending} onClick={remove}>Supprimer l’étage vide</button>;
}
