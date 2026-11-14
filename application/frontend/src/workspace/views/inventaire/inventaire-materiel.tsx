/* ==========================================================================
   Fiche matériel : création et modification ; refus de suppression d'un
   matériel affecté à une salle ou cité par une remontée (inventaire, salles)
   Champs confirmés (RG-03 à RG-09) : modèle*, marque, date de réception*,
   numéro de série, hors service* (non par défaut), affectation (salle ou stock).
   Type : classement visuel proposé. Fin de garantie : fonctionnalité bonus.
   ========================================================================== */

import { FilterSelect } from '../../ui/filter-select.tsx';
import { useEffect, useRef, useState } from 'react';
import { Tile } from '../../ui/icons.tsx';
import { uid } from '../../core/dom.ts';
import { store, currentEcole } from '../../core/store.ts';
import { useStore } from '../../hooks/use-store.ts';
import { can } from '../../core/permissions.ts';
import { adresseMac, DEVICE_TYPES, deviceType, materielCite } from '#shared/catalog.ts';
import { inputDate, fromInputDate } from '#shared/format.ts';
import { affectationOptions, index } from '../../core/selectors.ts';
import { Sheet, openSheet, notify } from '../../ui/overlays.tsx';
import { SheetForm, SheetFormActions } from '../../ui/forms.tsx';
import type { DeviceTypeId, Id, Materiel, WorkspaceView } from '#shared/types.ts';

/** Motif qui empêche de supprimer ce matériel, sinon '' (règles tenues par le serveur) : seul un matériel du stock,
 *  cité par aucune remontée, se supprime */
export function motifSuppression(m: Materiel) {
  if (m.salleId) return 'Seul un matériel du stock peut être supprimé : renvoyez-le d’abord au stock.';
  if (materielCite(store.state.remontees, m.id)) return 'Matériel lié à une remontée : sa fiche est conservée.';
  return '';
}

/** Signale le premier motif qui empêche la suppression de ces matériels ; true s'il y en a un */
export function suppressionRefusee(items: Materiel[]) {
  const motif = items.map(motifSuppression).find(Boolean);
  if (motif) notify(motif, { tone: 'info', icon: 'trash' });
  return Boolean(motif);
}

/** Options d'un nouveau matériel : salle, valeurs proposées (constat d'un recensement) et modification enregistrée avec lui (lier) */
export interface NouveauMateriel { salleId?: Id | null; valeurs?: Partial<Pick<Materiel, 'type' | 'modele' | 'marque' | 'serie' | 'garantieFin'>>; lier?: (s: WorkspaceView, materielId: Id) => void }

export function openMaterielForm(materiel: Materiel | null = null, { salleId = null, valeurs = {}, lier }: NouveauMateriel = {}) {
  const isNew = !materiel;
  if (!can(isNew ? 'materiel.create' : 'materiel.edit')) return;
  const ecoleId = materiel?.ecoleId ?? (currentEcole() !== 'all' ? currentEcole() as Id | null : null) ?? index().salle.get(salleId!)?.ecoleId ?? store.state.ecoles[0].id;
  openSheet(<MaterielForm materiel={materiel} salleId={salleId} ecoleId={ecoleId} valeurs={valeurs} lier={lier} />);
}

function MaterielForm({ materiel, salleId, ecoleId, valeurs, lier }: { materiel: Materiel | null; salleId: Id | null; ecoleId: Id } & Pick<NouveauMateriel, 'valeurs' | 'lier'>) {
  useStore();
  const isNew = !materiel;
  const [type, setType] = useState<DeviceTypeId>(materiel?.type ?? valeurs?.type ?? 'uc');
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
    const saisieMac = (form.get('mac') as string).trim(), mac = adresseMac(saisieMac);
    if (saisieMac && !mac) throw Error('Adresse MAC invalide : douze chiffres hexadécimaux attendus.');
    const data = {
      type, modele, marque: (form.get('marque') as string).trim() || null, serie: (form.get('serie') as string).trim() || null, mac,
      dateReception: reception, hs, salleId: (form.get('salle') as string) || null, garantieFin: fromInputDate(form.get('garantie') as string),
    };
    const newId = isNew ? uid('m') : null;
    store.update('data', (s) => {
      if (isNew) {
        s.materiels.push({ id: newId!, ecoleId, idOrion: '', ...data }); // identifiant ORION attribué par le serveur à l'enregistrement
        lier?.(s, newId!);
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
      <div className="field"><span className="field-label">Type <span className="field-value">{t.label}</span></span>
        <div className="type-picker type-picker--wide" role="radiogroup" aria-label="Type de matériel">
          {DEVICE_TYPES.map((d) => <button key={d.id} type="button" role="radio" aria-checked={d.id === type} className={d.id === type ? 'is-on' : ''}
            aria-label={d.label} data-tip={d.label} onClick={() => setType(d.id)}><Tile name={d.icon} color={d.color} size="m" /></button>)}
        </div>
      </div>
      <div className="form-2">
        <label className="field"><span className="field-label">Modèle *</span><input ref={modeleRef} name="modele" required maxLength={60} defaultValue={materiel?.modele ?? valeurs?.modele ?? ''} placeholder={t.exemple} autoComplete="off" /></label>
        <label className="field"><span className="field-label">Marque</span><input name="marque" maxLength={40} defaultValue={materiel?.marque ?? valeurs?.marque ?? ''} placeholder="Facultative" autoComplete="off" /></label>
        <label className="field"><span className="field-label">Date de réception *</span><input name="reception" type="date" required defaultValue={inputDate(materiel?.dateReception ?? Date.now())} /></label>
        <label className="field"><span className="field-label">Numéro de série</span><input name="serie" maxLength={40} defaultValue={materiel?.serie ?? valeurs?.serie ?? ''} placeholder="Facultatif" autoComplete="off" /></label>
        <label className="field"><span className="field-label">Adresse MAC</span><input name="mac" maxLength={17} defaultValue={materiel?.mac ?? ''} placeholder="Facultative" autoComplete="off" /></label>
        <div className="field"><span className="field-label">Affectation</span><FilterSelect aria-label="Affectation" name="salle" defaultValue={(materiel ? materiel.salleId : salleId) ?? ''} options={affectationOptions(ecoleId)} />
          <span className="field-hint">Un matériel peut rester en stock sans salle.</span></div>
        <div className="field"><span className="field-label">Hors service *</span>
          <div className="seg seg--wide" role="radiogroup" aria-label="Hors service">
            <button type="button" role="radio" aria-checked={!hs} className={`seg-btn${!hs ? ' is-on' : ''}`} onClick={() => setHs(false)}><span className="led led--ok" />Non</button>
            <button type="button" role="radio" aria-checked={hs} className={`seg-btn${hs ? ' is-on' : ''}`} onClick={() => setHs(true)}><span className="led led--hs" />Oui</button>
          </div></div>
        <label className="field"><span className="field-label">Fin de garantie</span><input name="garantie" type="date" defaultValue={inputDate(materiel ? materiel.garantieFin : valeurs?.garantieFin)} />
          <span className="field-hint">Facultative.</span></label>
        {materiel
          ? <div className="field"><span className="field-label">Identifiant ORION</span><output className="id-orion">{materiel.idOrion}</output></div>
          : <div className="field"><span className="field-label">Identifiant ORION</span><output className="id-orion is-muted">Attribué à l’enregistrement</output></div>}
      </div>
    </SheetForm>
  </Sheet>;
}
