/* ==========================================================================
   Recensement · fenêtres : nouvelle campagne, appairage d'un téléphone (QR
   code de l'adresse d'appairage, qui porte la clé de la campagne), étiquettes
   des salles à imprimer, ajout au parc d'un code inconnu.
   ========================================================================== */

import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { Icon, Tile } from '../../ui/icons.tsx';
import { QrCode } from '../../ui/qr-code.tsx';
import { uid } from '../../core/dom.ts';
import { store, currentEcole } from '../../core/store.ts';
import { batimentLabel, index, scope, traceProvisoire } from '../../core/selectors.ts';
import { bilan } from '../../core/recensements.ts';
import { Sheet, openSheet, notify, printSheet } from '../../ui/overlays.tsx';
import { SheetForm, SheetFormActions } from '../../ui/forms.tsx';
import { Loader } from '../../widgets/parts.tsx';
import { openMaterielForm } from '../inventaire/inventaire-materiel.tsx';
import { etiquette } from '#shared/recon.ts';
import { dateFull, dateNum, plural } from '#shared/format.ts';
import type { Constat, Id, Recensement } from '#shared/types.ts';

/* ---------- Nouvelle campagne ---------- */

export function openCampagneForm() {
  openSheet(<CampagneSheet />);
}

function CampagneSheet() {
  const navigate = useNavigate();
  const [ecoleId] = useState(() => (currentEcole() !== 'all' ? currentEcole() as Id : store.state.ecoles[0].id));
  const salles = scope().salles.filter((s) => s.ecoleId === ecoleId);
  const batiments = [...new Set(salles.map((s) => s.batiment))].sort();
  const [toute, setToute] = useState(true);
  const [choix, setChoix] = useState(() => new Set<Id>());
  const nomRef = useRef<HTMLInputElement>(null);
  useEffect(() => { const t = setTimeout(() => nomRef.current?.focus(), 60); return () => clearTimeout(t); }, []);

  const basculer = (ids: Id[], on: boolean) => setChoix((prev) => {
    const next = new Set(prev);
    for (const id of ids) if (on) next.add(id); else next.delete(id);
    return next;
  });

  async function save(form: FormData) {
    const nom = (form.get('nom') as string).trim();
    if (!nom) throw Error('Donnez un nom à la campagne.');
    if (!toute && !choix.size) throw Error('Choisissez au moins une salle.');
    const avant = new Set(store.state.recensements.map((r) => r.id));
    store.update('data', (s) => {
      // Identifiant, auteur, dates et échéance attribués par le serveur
      s.recensements.push({ id: uid('rec'), ecoleId, nom, salleIds: toute ? [] : [...choix], at: Date.now(), par: '', parId: null, expireLe: 0 });
    });
    await store.flush();
    const cree = store.state.recensements.find((r) => !avant.has(r.id) && r.nom === nom);
    notify(`Campagne ${nom} ouverte`, { icon: 'clipboardCheck' });
    if (cree) navigate(`/materiels/recensement/${cree.id}`);
  }

  return <Sheet title="Nouvelle campagne" size="m" lead={<Tile name="clipboardCheck" color="var(--c5)" size="m" />}
    footer={<SheetFormActions form="campagne-form" icon="check" label="Ouvrir la campagne" />}>
    <SheetForm id="campagne-form" onSave={save} noValidate>
      <label className="field"><span className="field-label">Nom *</span>
        <input ref={nomRef} name="nom" required maxLength={120} defaultValue={`Recensement du ${dateNum(Date.now())}`} autoComplete="off" />
        <span className="field-hint">La campagne reste ouverte 14 jours, ou jusqu’à sa clôture.</span></label>
      <div className="field"><span className="field-label">Salles à recenser</span>
        <div className="seg seg--wide" role="radiogroup" aria-label="Salles à recenser">
          <button type="button" role="radio" aria-checked={toute} className={`seg-btn${toute ? ' is-on' : ''}`} onClick={() => setToute(true)}>Toute l’école</button>
          <button type="button" role="radio" aria-checked={!toute} className={`seg-btn${!toute ? ' is-on' : ''}`} onClick={() => setToute(false)}>Salles choisies</button>
        </div>
        <span className="field-hint">{toute ? plural(salles.length, 'salle') : `${plural(choix.size, 'salle choisie', 'salles choisies')} sur ${salles.length}`}</span>
      </div>
      {!toute && <div className="rec-salles">
        {batiments.map((b) => {
          const ids = salles.filter((s) => s.batiment === b).map((s) => s.id);
          const tout = ids.every((id) => choix.has(id));
          return <fieldset key={b} className="rec-batiment">
            <legend><label><input type="checkbox" checked={tout} onChange={(e) => basculer(ids, e.target.checked)} /><span className="code-badge">{b}</span>{batimentLabel(b)}</label></legend>
            <div className="rec-salles-grid">
              {salles.filter((s) => s.batiment === b).map((s) => <label key={s.id} className={`rec-salle${choix.has(s.id) ? ' is-on' : ''}`}>
                <input type="checkbox" checked={choix.has(s.id)} onChange={(e) => basculer([s.id], e.target.checked)} />{s.nom}
              </label>)}
            </div>
          </fieldset>;
        })}
      </div>}
    </SheetForm>
  </Sheet>;
}

/* ---------- Appairage d'un téléphone ---------- */

export function openAppairage(r: Recensement) {
  openSheet(<AppairageSheet r={r} />);
}

function AppairageSheet({ r }: { r: Recensement }) {
  const [etat, setEtat] = useState<{ url?: string; expireLe?: number; error?: string }>({});
  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/workspace/recensements/${encodeURIComponent(r.id)}/appairage`, { signal: controller.signal })
      .then(async (response) => {
        const body = await response.json().catch(() => ({}));
        if (response.status === 401) location.replace('/');
        setEtat(response.ok ? body : { error: body.error || 'Appairage momentanément indisponible.' });
      })
      .catch((error) => { if (error.name !== 'AbortError') setEtat({ error: 'Appairage momentanément indisponible.' }); });
    return () => controller.abort();
  }, [r.id]);

  async function copier() {
    try { await navigator.clipboard.writeText(etat.url!); notify('Lien d’appairage copié'); }
    catch { notify('Copie impossible : sélectionnez le lien.', { tone: 'info' }); }
  }

  return <Sheet title="Appairer un téléphone" size="m" lead={<Tile name="tablet" color="var(--c5)" size="m" />}
    footer={etat.url ? <button className="btn btn--ghost" type="button" onClick={copier}><Icon name="documents" size={18} />Copier le lien</button> : null}>
    {etat.url ? <div className="rec-appairage">
      <QrCode value={etat.url} label={`QR code d’appairage de la campagne ${r.nom}`} className="rec-qr" />
      <ol className="rec-etapes">
        <li>Ouvrez l’appareil photo du téléphone et visez ce code.</li>
        <li>Ouvrez le lien proposé : le recensement s’affiche, prêt à fonctionner hors connexion.</li>
        <li>Ajoutez-le à l’écran d’accueil pour le retrouver.</li>
      </ol>
      <p className="rec-note"><Icon name="shield" size={16} />Ce code donne accès aux données de la campagne jusqu’au {dateFull(etat.expireLe!)} : ne le montrez qu’aux agents du recensement.</p>
    </div> : etat.error ? <p className="form-error" role="alert">{etat.error}</p> : <Loader label="Préparation de l’appairage…" />}
  </Sheet>;
}

/* ---------- Étiquettes ---------- */

export function openEtiquettes(r: Recensement) {
  openSheet(<EtiquettesSheet r={r} />);
}

function EtiquettesSheet({ r }: { r: Recensement }) {
  const { salles } = bilan(r);
  const ecole = index().ecole.get(r.ecoleId)?.nom ?? '';
  return <Sheet title="Étiquettes des salles" size="l" lead={<Tile name="print" color="var(--c8)" size="m" />}
    footer={<button className="btn btn--primary" type="button" onClick={printSheet}><Icon name="print" size={18} />Imprimer</button>}>
    <p className="rec-note">À coller à l’entrée de chaque salle : le téléphone choisit la salle en scannant son code. Les matériels se reconnaissent à leur identifiant ORION ou à leur numéro de série.</p>
    <div className="rec-etiquettes">
      {salles.map((s) => <figure key={s.id} className="rec-etiquette">
        <QrCode value={etiquette.salle(s.id)} label={`QR code de la salle ${s.nom}`} />
        <figcaption><strong>{s.nom}</strong><span>{batimentLabel(s.batiment)} · {ecole}</span></figcaption>
      </figure>)}
      <figure className="rec-etiquette">
        <QrCode value={etiquette.stock(r.ecoleId)} label="QR code du stock" />
        <figcaption><strong>Stock</strong><span>{ecole}</span></figcaption>
      </figure>
    </div>
  </Sheet>;
}

/* ---------- Code inconnu ajouté au parc ---------- */

/** Fiche matériel préremplie avec la saisie du téléphone ; le constat est traité avec la création */
export function openAjoutParc(c: Constat) {
  const salleId = c.salleId && index().salle.has(c.salleId) ? c.salleId : null;
  openMaterielForm(null, {
    salleId,
    valeurs: { type: c.saisie?.type, modele: c.saisie?.modele, marque: c.saisie?.marque, serie: c.saisie?.serie ?? (c.code || null) },
    lier: (s) => { const x = s.constats.find((k) => k.id === c.id); if (x) x.traite = traceProvisoire(); },
  });
}
