/* ==========================================================================
   Fiche matériel : création et modification ; refus de suppression d'un
   matériel cité par une remontée (inventaire, salles)
   Champs confirmés (RG-03 à RG-09) : modèle*, marque, date de réception*,
   numéro de série, hors service* (non par défaut), affectation (salle ou stock).
   Type : classement visuel proposé. Fin de garantie : fonctionnalité bonus.
   ========================================================================== */

import { useEffect, useRef, useState } from 'react';
import { Tile } from '../../ui/icons.tsx';
import { uid } from '../../core/dom.ts';
import { store, currentEcole } from '../../core/store.ts';
import { useStore } from '../../hooks/use-store.ts';
import { can } from '../../core/permissions.ts';
import { DEVICE_TYPES, deviceType, materielCite } from '#shared/catalog.ts';
import { inputDate, fromInputDate } from '#shared/format.ts';
import { scope, batiments, batimentLabel, index } from '../../core/selectors.ts';
import { Sheet, openSheet, notify } from '../../ui/overlays.tsx';
import { SheetForm, SheetFormActions } from '../../ui/forms.tsx';
import type { DeviceTypeId, Id, Materiel } from '#shared/types.ts';

/** Options d'affectation : stock + salles regroupées par bâtiment (la sélection passe par le <select>) */
export function AffectationOptions({ ecoleId }: { ecoleId: Id | null }) {
  const salles = scope().salles.filter((x) => !ecoleId || x.ecoleId === ecoleId);
  return <>
    <option value="">Stock (sans localisation)</option>
    {batiments().map((b) => {
      const list = salles.filter((x) => x.batiment === b);
      return list.length ? <optgroup key={b} label={batimentLabel(b)}>{list.map((x) => <option key={x.id} value={x.id}>{x.nom}</option>)}</optgroup> : null;
    })}
  </>;
}

/** Un matériel cité par une remontée est conservé (règle tenue par le serveur) : le signale ; true si l'un des matériels l'est */
export function suppressionRefusee(items: Materiel[]) {
  const refus = items.some((m) => materielCite(store.state.remontees, m.id));
  if (refus) notify('Un matériel est lié à une remontée : sa fiche doit être conservée.', { tone: 'info', icon: 'ticket' });
  return refus;
}

export function openMaterielForm(materiel: Materiel | null = null, { salleId = null }: { salleId?: Id | null } = {}) {
  const isNew = !materiel;
  if (!can(isNew ? 'materiel.create' : 'materiel.edit')) return;
  const ecoleId = materiel?.ecoleId ?? (currentEcole() !== 'all' ? currentEcole() as Id | null : null) ?? index().salle.get(salleId!)?.ecoleId ?? store.state.ecoles[0].id;
  openSheet(<MaterielForm materiel={materiel} salleId={salleId} ecoleId={ecoleId} />);
}

function MaterielForm({ materiel, salleId, ecoleId }: { materiel: Materiel | null; salleId: Id | null; ecoleId: Id }) {
  useStore();
  const isNew = !materiel;
  const [type, setType] = useState<DeviceTypeId>(materiel?.type ?? 'uc');
  const [hs, setHs] = useState(materiel?.hs ?? false);
  const modeleRef = useRef<HTMLInputElement>(null);
  const t = deviceType(type);

  useEffect(() => {
    const timer = setTimeout(() => modeleRef.current?.focus(), 60);
    return () => clearTimeout(timer);
  }, []);

  async function save(form: FormData) {
    const modele = (form.get('modele') as string).trim();
    const reception = fromInputDate(form.get('reception') as string);
    if (!modele || !reception) throw Error('Renseignez le modèle et la date de réception.');
    const data = {
      type, modele, marque: (form.get('marque') as string).trim() || null, serie: (form.get('serie') as string).trim() || null,
      dateReception: reception, hs, salleId: (form.get('salle') as string) || null, garantieFin: fromInputDate(form.get('garantie') as string),
    };
    const newId = isNew ? uid('m') : null;
    store.update('data', (s) => {
      if (isNew) {
        s.materiels.push({ id: newId!, ecoleId, idOrion: '', ...data }); // identifiant Orion attribué par le serveur à l'enregistrement
      } else {
        Object.assign(s.materiels.find((m) => m.id === materiel!.id)!, data);
      }
    });
    await store.flush();
    const idOrion = isNew ? store.state.materiels.find((m) => m.id === newId)?.idOrion ?? 'Matériel' : materiel!.idOrion;
    notify(isNew ? `${idOrion} enregistré` : `${idOrion} modifié`, { icon: t.icon });
  }

  return <Sheet title={isNew ? 'Ajouter un matériel' : `Modifier ${materiel!.idOrion}`} size="m" lead={<Tile name={t.icon} color={t.color} size="m" />}
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
        <label className="field"><span className="field-label">Date de réception *</span><input name="reception" type="date" required defaultValue={inputDate(materiel?.dateReception ?? Date.now())} /></label>
        <label className="field"><span className="field-label">Numéro de série</span><input name="serie" maxLength={40} defaultValue={materiel?.serie ?? ''} placeholder="Facultatif" autoComplete="off" /></label>
        <label className="field"><span className="field-label">Affectation</span><select name="salle" defaultValue={(materiel ? materiel.salleId : salleId) ?? ''}><AffectationOptions ecoleId={ecoleId} /></select>
          <span className="field-hint">Un matériel peut rester en stock sans salle.</span></label>
        <div className="field"><span className="field-label">Hors service *</span>
          <div className="seg seg--wide" role="radiogroup" aria-label="Hors service">
            <button type="button" role="radio" aria-checked={!hs} className={`seg-btn${!hs ? ' is-on' : ''}`} onClick={() => setHs(false)}><span className="led led--ok" />Non</button>
            <button type="button" role="radio" aria-checked={hs} className={`seg-btn${hs ? ' is-on' : ''}`} onClick={() => setHs(true)}><span className="led led--hs" />Oui</button>
          </div></div>
        <label className="field"><span className="field-label">Fin de garantie</span><input name="garantie" type="date" defaultValue={inputDate(materiel?.garantieFin)} />
          <span className="field-hint">Facultative.</span></label>
        {materiel
          ? <div className="field"><span className="field-label">Identifiant Orion</span><output className="id-orion">{materiel.idOrion}</output></div>
          : <div className="field"><span className="field-label">Identifiant Orion</span><output className="id-orion is-muted">Attribué à l’enregistrement</output></div>}
      </div>
    </SheetForm>
  </Sheet>;
}
