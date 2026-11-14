/* ==========================================================================
   RIGEL · fenêtres : nouvelle campagne de recensement, appairage d'un
   téléphone (QR code de l'adresse d'appairage, qui porte la clé de
   l'opération), étiquettes des salles à imprimer, installation d'une salle
   (appairage, étiquettes de la salle et du stock, clôture), ajout au parc d'un
   ancien code inconnu.
   ========================================================================== */

import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { Icon, Tile } from '../../ui/icons.tsx';
import { QrCode } from '../../ui/qr-code.tsx';
import { uid } from '../../core/dom.ts';
import { store, currentEcole } from '../../core/store.ts';
import { batimentLabel, index, scope, traceProvisoire } from '../../core/selectors.ts';
import { bilan } from '../../core/recensements.ts';
import { Sheet, confirmSheet, openSheet, notify, printSheet } from '../../ui/overlays.tsx';
import { SheetForm, SheetFormActions } from '../../ui/forms.tsx';
import { Loader } from '../../widgets/parts.tsx';
import { openMaterielForm } from '../inventaire/inventaire-materiel.tsx';
import { etiquette, parSerie } from '#shared/rigel.ts';
import { dateFull, dateNum, plural } from '#shared/format.ts';
import type { Id, Recensement, Salle, WorkspaceView } from '#shared/types.ts';
import type { ATraiter } from '../../core/recensements.ts';

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
      s.recensements.push({ id: uid('rec'), ecoleId, nom, mode: 'recensement', salleIds: toute ? [] : [...choix], at: Date.now(), par: '', parId: null, expireLe: 0 });
    });
    await store.flush();
    const cree = store.state.recensements.find((r) => !avant.has(r.id) && r.nom === nom);
    notify(`Recensement ${nom} ouvert`, { icon: 'clipboardCheck' });
    if (cree) navigate(`/materiels/recensement/${cree.id}`);
  }

  return <Sheet title="Nouveau recensement" size="m" lead={<Tile name="clipboardCheck" color="var(--c5)" size="m" />}
    footer={<SheetFormActions form="campagne-form" icon="check" label="Ouvrir le recensement" />}>
    <SheetForm id="campagne-form" onSave={save} noValidate>
      <label className="field"><span className="field-label">Nom *</span>
        <input ref={nomRef} name="nom" required maxLength={120} defaultValue={`Recensement du ${dateNum(Date.now())}`} autoComplete="off" />
        <span className="field-hint">Le recensement reste ouvert 14 jours, ou jusqu’à sa clôture.</span></label>
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

/** Accès d'un téléphone à une opération : adresse d'appairage et échéance, ou erreur ; id : opération (installation) */
interface Acces { id?: Id; url?: string; expireLe?: number; error?: string }

/** Accès chargé une fois par opération (cle) */
function useAcces(charger: () => Promise<Acces>, cle: string) {
  const [acces, setAcces] = useState<Acces>({});
  useEffect(() => {
    let actif = true;
    charger().then((a) => { if (actif) setAcces(a); }, (error: Error) => { if (actif) setAcces({ error: error.message || 'Appairage momentanément indisponible.' }); });
    return () => { actif = false; };
  }, [cle]);
  return acces;
}

async function accesCampagne(id: Id): Promise<Acces> {
  const response = await fetch(`/api/workspace/recensements/${encodeURIComponent(id)}/appairage`);
  const body = await response.json().catch(() => ({}));
  if (response.status === 401) location.replace('/');
  if (!response.ok) throw Error(body.error || 'Appairage momentanément indisponible.');
  return body;
}

function CopierLien({ url }: { url: string }) {
  async function copier() {
    try { await navigator.clipboard.writeText(url); notify('Lien d’appairage copié'); }
    catch { notify('Copie impossible : sélectionnez le lien.', { tone: 'info' }); }
  }
  return <button className="btn btn--ghost" type="button" onClick={copier}><Icon name="documents" size={18} />Copier le lien</button>;
}

/** QR code d'appairage et consignes ; nom : opération désignée dans les libellés */
function Appairage({ acces, nom }: { acces: Acces; nom: string }) {
  if (acces.error) return <p className="form-error" role="alert">{acces.error}</p>;
  if (!acces.url) return <Loader label="Préparation de l’appairage…" />;
  return <div className="rec-appairage">
    <QrCode value={acces.url} label={`QR code d’appairage de ${nom}`} className="rec-qr" />
    <ol className="rec-etapes">
      <li>Ouvrez l’appareil photo du téléphone et visez ce code.</li>
      <li>Ouvrez le lien proposé : l’application s’affiche, prête à fonctionner hors connexion.</li>
      <li>Ajoutez-la à l’écran d’accueil pour la retrouver.</li>
    </ol>
    <p className="rec-note"><Icon name="shield" size={16} />Ce code donne accès aux données de {nom} jusqu’au {dateFull(acces.expireLe!)} : ne le montrez qu’aux agents concernés.</p>
  </div>;
}

export function openAppairage(r: Recensement) {
  openSheet(<AppairageSheet r={r} />);
}

function AppairageSheet({ r }: { r: Recensement }) {
  const acces = useAcces(() => accesCampagne(r.id), r.id);
  return <Sheet title="Appairer un téléphone" size="m" lead={<Tile name="tablet" color="var(--c5)" size="m" />}
    footer={acces.url ? <CopierLien url={acces.url} /> : null}>
    <Appairage acces={acces} nom={`le recensement ${r.nom}`} />
  </Sheet>;
}

/* ---------- Étiquettes ---------- */

/** Étiquette d'un lieu à coller à son entrée : QR code de la salle, ou du stock (salle absente) */
function Etiquette({ salle, ecoleId }: { salle?: Salle; ecoleId: Id }) {
  const ecole = index().ecole.get(ecoleId)?.nom ?? '';
  return <figure className="rec-etiquette">
    <QrCode value={salle ? etiquette.salle(salle.id) : etiquette.stock(ecoleId)} label={salle ? `QR code de la salle ${salle.nom}` : 'QR code du stock'} />
    <figcaption><strong>{salle ? salle.nom : 'Stock'}</strong><span>{salle ? `${batimentLabel(salle.batiment)} · ${ecole}` : ecole}</span></figcaption>
  </figure>;
}

export function openEtiquettes(r: Recensement) {
  openSheet(<EtiquettesSheet r={r} />);
}

function EtiquettesSheet({ r }: { r: Recensement }) {
  const { salles } = bilan(r);
  return <Sheet title="Étiquettes des salles" size="l" lead={<Tile name="print" color="var(--c8)" size="m" />}
    footer={<button className="btn btn--primary" type="button" onClick={printSheet}><Icon name="print" size={18} />Imprimer</button>}>
    <p className="rec-note">À coller à l’entrée de chaque salle : le téléphone choisit la salle en scannant son code. Les matériels se reconnaissent à leur identifiant ORION ou à leur numéro de série.</p>
    <div className="rec-etiquettes">
      {salles.map((s) => <Etiquette key={s.id} salle={s} ecoleId={r.ecoleId} />)}
      <Etiquette ecoleId={r.ecoleId} />
    </div>
  </Sheet>;
}

/* ---------- Installation d'une salle ---------- */

/** Installation d'une salle avec un téléphone : lancée (ou reprise) par le serveur à l'ouverture, gestionnaire seul */
export function openInstallation(salle: Salle) {
  openSheet(<InstallationSheet salle={salle} />);
}

function InstallationSheet({ salle }: { salle: Salle }) {
  const acces = useAcces(() => store.call<Acces>(`/salles/${encodeURIComponent(salle.id)}/installation`, {}), salle.id);
  async function clore(close: () => void) {
    if (!await confirmSheet({ title: 'Clore l’installation', message: `Les téléphones appairés à l’installation de ${salle.nom} ne pourront plus envoyer de constats. Les déplacements restants se confirment ici.`, confirm: 'Clore', iconName: 'check' })) return;
    try {
      store.update('data', (s) => { const r = s.recensements.find((x) => x.id === acces.id); if (r) r.close = traceProvisoire(); });
      await store.flush();
      notify('Installation close', { icon: 'check' });
      close();
    } catch (error) { notify((error as Error).message, { tone: 'danger' }); }
  }
  return <Sheet title={`Installer ${salle.nom}`} size="l" lead={<Tile name="tablet" color="var(--c5)" size="m" />}
    footer={(close) => <>
      {acces.id && <button className="btn btn--ghost" type="button" onClick={() => clore(close)}><Icon name="check" size={18} />Clore l’installation</button>}
      <span className="flex-1" />
      {acces.url && <CopierLien url={acces.url} />}
    </>}>
    <Appairage acces={acces} nom={`l’installation de ${salle.nom}`} />
    <div className="rec-etiquettes">
      <Etiquette salle={salle} ecoleId={salle.ecoleId} />
      <Etiquette ecoleId={salle.ecoleId} />
    </div>
  </Sheet>;
}

/* ---------- Code inconnu ajouté au parc ---------- */

/**
 * Fiche matériel préremplie avec la saisie du téléphone ; les constats du même code sont traités avec la création.
 * Un numéro de série déjà présent dans l'école ne crée pas de doublon : les constats sont seulement marqués traités.
 */
export async function openAjoutParc(g: ATraiter) {
  const c = g.constat;
  const ids = new Set(g.constats.map((k) => k.id));
  const traiter = (s: WorkspaceView) => { for (const k of s.constats) if (ids.has(k.id)) k.traite = { ...traceProvisoire(), action: 'ajoute' }; };
  const serie = c.saisie?.serie ?? (c.code || null);
  const existant = serie ? parSerie(store.state.materiels.filter((m) => m.ecoleId === c.ecoleId), serie) : undefined;
  if (existant) {
    const ou = existant.salleId ? index().salle.get(existant.salleId)?.nom ?? 'une salle retirée' : 'le stock';
    if (!await confirmSheet({ title: 'Matériel déjà au parc', message: `Le numéro de série ${serie} est celui de ${existant.idOrion} (${existant.modele}, ${ou}). Marquer ${g.constats.length > 1 ? 'ces constats traités' : 'ce constat traité'} sans créer de doublon ?`, confirm: 'Marquer traité', tone: 'primary', iconName: 'check' })) return;
    store.update('data', traiter);
    notify('Constat traité', { icon: 'check' });
    return;
  }
  openMaterielForm(null, {
    salleId: c.salleId && index().salle.has(c.salleId) ? c.salleId : null,
    valeurs: { type: c.saisie?.type, modele: c.saisie?.modele, marque: c.saisie?.marque, serie, garantieFin: c.saisie?.garantieFin },
    lier: traiter,
  });
}
