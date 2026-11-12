/* ==========================================================================
   Remontées · création : une salle, un ou plusieurs matériels, une
   description (RG-11). Ouvert depuis l'écran Remontées ou une salle.
   ========================================================================== */

import { Fragment, useEffect, useRef, useState } from 'react';
import { Icon, Tile } from '../../ui/icons.jsx';
import { Sheet, openSheet, notify } from '../../ui/overlays.jsx';
import { uid } from '../../core/dom.js';
import { store, me } from '../../core/store.js';
import { useStore } from '../../hooks/use-store.js';
import { can, why } from '../../core/permissions.js';
import { num } from '#shared/format.js';
import { DEVICE_TYPES, PROBLEMS, deviceType, problem, statut } from '#shared/catalog.js';
import { batiments, batimentLabel, sallesOf, materielsOf, index } from '../../core/selectors.js';

export function openNewRemontee({ salleId = null, materielIds = [] } = {}) {
  if (!can('remontee.create')) { notify(why('remontee.create'), { icon: 'alertes', tone: 'warn' }); return; }
  openSheet(<NewRemonteeSheet salleId={salleId} materielIds={materielIds} />);
}

const STEPS = [['salles', 'Salle'], ['materiel', 'Matériels'], ['documents', 'Problème']];
const pickCount = (n) => (n ? `${num(n)} sélectionné${n > 1 ? 's' : ''}` : 'Sélectionnez un ou plusieurs matériels');

function NewRemonteeSheet({ salleId: initialSalle, materielIds }) {
  useStore();
  const ix = index();
  const [step, setStep] = useState(materielIds.length ? 3 : initialSalle ? 2 : 1);
  const [salleId, setSalleId] = useState(initialSalle ?? (materielIds[0] ? ix.materiel.get(materielIds[0])?.salleId : null));
  const [batiment, setBatiment] = useState(() => (salleId ? ix.salle.get(salleId)?.batiment : batiments()[0]));
  const [selected, setSelected] = useState(() => new Set(materielIds));
  const [probleme, setProbleme] = useState(null);
  const [description, setDescription] = useState('');
  const [sending, setSending] = useState(false);
  const descRef = useRef(null);
  const focusDesc = useRef(false);

  // Le passage par « Continuer » place le curseur dans la description
  useEffect(() => {
    if (step === 3 && focusDesc.current) { focusDesc.current = false; descRef.current?.focus(); }
  }, [step]);

  const maxStep = selected.size ? 3 : salleId ? 2 : 1;
  const ready = selected.size && description.trim().length >= 3;

  const chooseSalle = (id) => {
    if (salleId !== id) setSelected(new Set());
    setSalleId(id);
    setStep(2);
  };
  const toggle = (id) => setSelected((prev) => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  const create = async (close) => {
    setSending(true);
    const created = createRemontee({ salleId, selected, probleme, description });
    try { await store.flush(); } catch { setSending(false); return; }
    close(true);
    notify(`${createdRemonteeId(created)} transmise, état des lieux disponible`, { icon: 'documents' });
  };

  const stepper = (
    <ol className="stepper" aria-label="Étapes">
      {STEPS.map(([ic, label], i) => (
        <Fragment key={label}>
          {i > 0 && <li className="stepper-line" aria-hidden="true" />}
          <li className={`stepper-item ${step === i + 1 ? 'is-current' : ''} ${step > i + 1 ? 'is-done' : ''}`}>
            <button type="button" disabled={i + 1 > maxStep} aria-label={label} onClick={() => setStep(i + 1)}>
              <Icon name={step > i + 1 ? 'check' : ic} size={18} />
            </button>
            <span>{label}</span>
          </li>
        </Fragment>
      ))}
    </ol>
  );

  const stepSalle = () => <>
    <div className="seg seg--chips" role="tablist" aria-label="Bâtiments">
      {batiments().map((b) => (
        <button key={b} role="tab" className={`seg-btn ${b === batiment ? 'is-on' : ''}`} aria-selected={b === batiment} onClick={() => setBatiment(b)}>
          <span className="code-badge">{b}</span>{batimentLabel(b)}
        </button>
      ))}
    </div>
    <button className="btn btn--glass" data-salle="stock" onClick={() => chooseSalle('stock')}><Icon name="stockage" size={18} />Stock</button>
    <div className="pick-grid pick-grid--salles">
      {sallesOf(batiment).map((x) => (
        <button key={x.id} className={`pick-room ${x.id === salleId ? 'is-on' : ''}`} data-salle={x.id} onClick={() => chooseSalle(x.id)}>
          <Tile name="salles" color="var(--c3)" size="s" className="tile--tint" /><span>{x.nom}</span><small>{num(materielsOf(x.id).length)}</small>
        </button>
      ))}
    </div>
  </>;

  const stepMateriels = () => {
    const salle = ix.salle.get(salleId);
    const list = materielsOf(salleId === 'stock' ? null : salleId);
    const groups = DEVICE_TYPES.map((t) => ({ t, list: list.filter((m) => m.type === t.id) })).filter((g) => g.list.length);
    return <>
      <div className="pick-context">
        <Tile name="salles" color="var(--c3)" size="m" /><b>{salle?.nom ?? 'Stock'}</b><span>{salle ? batimentLabel(salle.batiment) : 'Matériels non affectés'}</span>
        <span className="pick-count" aria-live="polite">{pickCount(selected.size)}</span>
      </div>
      {groups.length
        ? <div className="pick-groups">{groups.map(({ t, list: l }) => (
          <section key={t.id} className="pick-group">
            <header><Tile name={t.icon} color={t.color} size="s" /><span>{t.plural}</span><b>{num(l.length)}</b></header>
            <div className="pick-devices">{l.map((m) => (
              <button key={m.id} className={`pick-device ${selected.has(m.id) ? 'is-on' : ''}`} data-mat={m.id} aria-pressed={selected.has(m.id)} data-tip={`${m.modele}\n${m.idOrion}`} onClick={() => toggle(m.id)}>
                <span className="pick-check"><Icon name="check" size={12} stroke={3} /></span>
                <span className="tile-wrap"><Tile name={t.icon} color={t.color} size="m" /><span className={`led led--${m.hs ? 'hs' : 'ok'} tile-led`} /></span>
                <span className="pick-device-label">{m.idOrion.slice(4)}</span>
              </button>
            ))}</div>
          </section>
        ))}</div>
        : <div className="w-empty"><Icon name="materiel" size={28} /><span>Aucun matériel dans cette salle</span></div>}
    </>;
  };

  const stepProbleme = () => {
    const mats = [...selected].map((id) => ix.materiel.get(id)).filter(Boolean);
    return <>
      <div className="pick-chips">{mats.map((m) => {
        const t = deviceType(m.type);
        return <span key={m.id} className="mat-chip"><Tile name={t.icon} color={t.color} size="s" /><span>{m.modele}</span><small>{m.idOrion}</small></span>;
      })}</div>
      <div className="problems" role="radiogroup" aria-label="Type de problème">
        {PROBLEMS.map((p) => (
          <button key={p.id} role="radio" aria-checked={probleme === p.id} className={`problem ${probleme === p.id ? 'is-on' : ''}`} onClick={() => setProbleme(p.id)}>
            <Icon name={p.icon} size={30} /><span>{p.label}</span>
          </button>
        ))}
      </div>
      <label className="field">
        <span className="field-label">Description du problème *</span>
        <textarea ref={descRef} rows={3} maxLength={500} placeholder="Ce que vous constatez, depuis quand…" required
          value={description} onChange={(e) => setDescription(e.target.value)} />
      </label>
    </>;
  };

  return (
    <Sheet title="Signaler un problème" size="l" lead={<Tile name="alertes" color="var(--c2)" size="m" />}
      footer={(close) => <>
        <button className="btn btn--ghost" hidden={step === 1} onClick={() => setStep(Math.max(1, step - 1))}><Icon name="chevL" size={18} /><span>Retour</span></button>
        <span className="flex-1" />
        {step === 2 && <button className="btn btn--primary" disabled={!selected.size} onClick={() => { focusDesc.current = true; setStep(3); }}><Icon name="chevR" size={18} /><span>Continuer</span></button>}
        {step === 3 && <button className="btn btn--primary" disabled={!ready || sending} onClick={() => create(close)}><Icon name="documents" size={18} /><span>Transmettre la remontée</span></button>}
      </>}>
      {stepper}
      <div className="step-body">{step === 1 ? stepSalle() : step === 2 ? stepMateriels() : stepProbleme()}</div>
    </Sheet>
  );
}

/** Crée la remontée ; le numéro définitif est attribué par le serveur. Renvoie de quoi la retrouver. */
export function createRemontee({ salleId, selected, probleme, description }) {
  const salle = index().salle.get(salleId);
  const id = `tmp-${uid('r')}`;
  const now = Date.now();
  store.update('data', (s) => {
    s.remontees.unshift({
      id, ecoleId: salle?.ecoleId ?? index().materiel.get([...selected][0])?.ecoleId, auteur: me().nom, createdAt: now, materielIds: [...selected],
      probleme: probleme ?? 'other', description: description.trim(), statut: 'attente',
      historique: [{ statut: 'attente', at: now, par: me().nom }],
    });
  });
  return { description: description.trim() };
}

/** Numéro définitif d'une remontée créée, une fois enregistrée. */
export const createdRemonteeId = ({ description }) => store.state.remontees.filter((r) => r.auteurId === me().id && r.description === description).sort((a, b) => b.createdAt - a.createdAt)[0]?.id ?? 'Remontée';
