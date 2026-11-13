/* ==========================================================================
   Remontées · création : une salle, un ou plusieurs matériels, une
   description (RG-11). Ouvert depuis l'écran Remontées ou une salle.
   ========================================================================== */

import { Fragment, useEffect, useRef, useState } from 'react';
import { Icon, Tile } from '../../ui/icons.tsx';
import { Sheet, openSheet, notify } from '../../ui/overlays.tsx';
import { SheetForm } from '../../ui/forms.tsx';
import { matcher } from '../../core/search.ts';
import { uid } from '../../core/dom.ts';
import { store, me } from '../../core/store.ts';
import { useStore } from '../../hooks/use-store.ts';
import { can, why } from '../../core/permissions.ts';
import { num, plural } from '#shared/format.ts';
import { normalizeProblemLabel, PROBLEM_LABEL_HELP } from '#shared/problem-label.ts';
import { DEVICE_TYPES, PROBLEMS, deviceType } from '#shared/catalog.ts';
import { batiments, batimentLabel, sallesOf, materielsOf, index, traceProvisoire } from '../../core/selectors.ts';
import type { Id, Materiel, ProblemId } from '#shared/types.ts';

export function openNewRemontee({ salleId = null, materielIds = [] }: { salleId?: Id | null; materielIds?: Id[] } = {}) {
  if (!can('remontee.create')) { notify(why('remontee.create'), { icon: 'alertes', tone: 'warn' }); return; }
  openSheet(<NewRemonteeSheet salleId={salleId} materielIds={materielIds} />);
}

const STEPS = [['salles', 'Salle'], ['materiel', 'Matériels'], ['documents', 'Problème']];
const pickCount = (n: number) => (n ? plural(n, 'sélectionné') : 'Sélectionnez un ou plusieurs matériels');

function NewRemonteeSheet({ salleId: initialSalle, materielIds }: { salleId: Id | null; materielIds: Id[] }) {
  useStore();
  const ix = index();
  const [step, setStep] = useState(materielIds.length ? 3 : initialSalle ? 2 : 1);
  const [salleId, setSalleId] = useState(initialSalle ?? (materielIds[0] ? ix.materiel.get(materielIds[0])?.salleId : null));
  const [batiment, setBatiment] = useState(() => (salleId ? ix.salle.get(salleId)?.batiment : batiments()[0]));
  const [salleQuery, setSalleQuery] = useState('');
  const [selected, setSelected] = useState(() => new Set(materielIds));
  const [probleme, setProbleme] = useState<ProblemId | null>(null);
  const [problemeAutre, setProblemeAutre] = useState('');
  const [problemeAutreInfo, setProblemeAutreInfo] = useState('');
  const [description, setDescription] = useState('');
  const descRef = useRef<HTMLTextAreaElement>(null);
  const focusDesc = useRef(false);

  // Le passage par « Continuer » place le curseur dans la description
  useEffect(() => {
    if (step === 3 && focusDesc.current) { focusDesc.current = false; descRef.current?.focus(); }
  }, [step]);

  const maxStep = selected.size ? 3 : salleId ? 2 : 1;
  // Type de problème obligatoire (règle tenue par le serveur) : un type proposé, ou le libellé précisé pour « Autre »
  const typeProbleme = probleme === 'other' ? problemeAutre.trim() : probleme;
  const ready = Boolean(selected.size && typeProbleme && description.trim().length >= 3);

  const chooseSalle = (id: Id) => {
    if (salleId !== id) setSelected(new Set());
    setSalleId(id);
    setStep(2);
  };
  const toggle = (id: Id) => setSelected((prev) => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  // Enregistrée par le formulaire de l'étape 3 (Entrée ou « Transmettre la remontée »), qui se ferme ensuite
  const create = async () => {
    if (!ready) throw Error(typeProbleme ? 'Décrivez le problème.' : 'Choisissez le type de problème.');
    const created = createRemontee({ salleId, selected, probleme: typeProbleme!, description });
    await store.flush();
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

  const matchesSalle = matcher(salleQuery);
  const matchingRooms = (salleQuery.trim() ? sallesOf() : sallesOf(batiment)).filter((s) => matchesSalle(s.nom, batimentLabel(s.batiment)));
  const stepSalle = () => <>
    <label className="field field--search"><Icon name="recherche" size={18} />
      <input type="search" aria-label="Rechercher une salle" placeholder="Rechercher une salle, un bâtiment…" value={salleQuery} onChange={(e) => setSalleQuery(e.target.value)} />
    </label>
    {!salleQuery.trim() && <div className="seg seg--chips" role="tablist" aria-label="Bâtiments">
      {batiments().map((b) => (
        <button key={b} role="tab" className={`seg-btn ${b === batiment ? 'is-on' : ''}`} aria-selected={b === batiment} onClick={() => setBatiment(b)}>
          <span className="code-badge">{b}</span>{batimentLabel(b)}
        </button>
      ))}
    </div>}
    <button className="btn btn--glass" data-salle="stock" onClick={() => chooseSalle('stock')}><Icon name="stockage" size={18} />Stock</button>
    <div className="pick-grid pick-grid--salles">
      {matchingRooms.map((x) => (
        <button key={x.id} className={`pick-room ${x.id === salleId ? 'is-on' : ''}`} data-salle={x.id} onClick={() => chooseSalle(x.id)}>
          <Tile name="salles" color="var(--c3)" size="s" className="tile--tint" /><span>{x.nom}</span><small>{num(materielsOf(x.id).length)}</small>
        </button>
      ))}
    </div>
    {!matchingRooms.length && <p className="field-hint" role="status">Aucune salle ne correspond à votre recherche.</p>}
  </>;

  const stepMateriels = () => {
    const salle = ix.salle.get(salleId!);
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
    const mats = [...selected].map((id) => ix.materiel.get(id)).filter(Boolean) as Materiel[];
    return <SheetForm id="remontee-form" onSave={create}>
      <div className="pick-chips">{mats.map((m) => {
        const t = deviceType(m.type);
        return <span key={m.id} className="mat-chip"><Tile name={t.icon} color={t.color} size="s" /><span>{m.modele}</span><small>{m.idOrion}</small></span>;
      })}</div>
      <div className="problems" role="radiogroup" aria-label="Type de problème">
        {PROBLEMS.map((p) => (
          <button key={p.id} type="button" role="radio" aria-checked={probleme === p.id} className={`problem ${probleme === p.id ? 'is-on' : ''}`} onClick={() => setProbleme(p.id)}>
            <Icon name={p.icon} size={30} /><span>{p.label}</span>
          </button>
        ))}
      </div>
      {probleme === 'other' && <label className="field">
        <span className="field-label">Précisez le type de problème *</span>
        <input type="text" name="problemeAutre" maxLength={100} required autoFocus placeholder="Ex. : bruit inhabituel"
          aria-describedby="probleme-autre-info" value={problemeAutre} onChange={(e) => {
            const label = normalizeProblemLabel(e.target.value);
            setProblemeAutre(label.value);
            setProblemeAutreInfo(label.invalid ? 'Les caractères non autorisés ont été retirés. ' : '');
          }} />
        <span className="field-hint" id="probleme-autre-info" role="status">{problemeAutreInfo}{PROBLEM_LABEL_HELP}</span>
      </label>}
      <label className="field">
        <span className="field-label">Description du problème *</span>
        <textarea ref={descRef} rows={3} maxLength={500} placeholder="Ce que vous constatez, depuis quand…" required
          value={description} onChange={(e) => setDescription(e.target.value)} />
      </label>
    </SheetForm>;
  };

  return (
    <Sheet title="Signaler un problème" size="l" lead={<Tile name="alertes" color="var(--c2)" size="m" />}
      footer={<>
        <button className="btn btn--ghost" hidden={step === 1} onClick={() => setStep(Math.max(1, step - 1))}><Icon name="chevL" size={18} /><span>Retour</span></button>
        <span className="flex-1" />
        {step === 2 && <button className="btn btn--primary" disabled={!selected.size} onClick={() => { focusDesc.current = true; setStep(3); }}><Icon name="chevR" size={18} /><span>Continuer</span></button>}
        {step === 3 && <button className="btn btn--primary" type="submit" form="remontee-form" disabled={!ready}><Icon name="documents" size={18} /><span>Transmettre la remontée</span></button>}
      </>}>
      {stepper}
      <div className="step-body">{step === 1 ? stepSalle() : step === 2 ? stepMateriels() : stepProbleme()}</div>
    </Sheet>
  );
}

/**
 * Crée la remontée et renvoie de quoi la retrouver. Saisie : matériels, problème et description ; le serveur attribue le
 * numéro et fixe l'auteur, la date, le statut et l'historique : les valeurs provisoires ne servent qu'à l'afficher sans attendre.
 */
function createRemontee({ salleId, selected, probleme, description }: { salleId: Id | null | undefined; selected: Set<Id>; probleme: string; description: string }) {
  const materielIds = [...selected];
  const ecoleId = index().salle.get(salleId!)?.ecoleId ?? index().materiel.get(materielIds[0])!.ecoleId;
  const trace = traceProvisoire();
  store.update('data', (s) => {
    s.remontees.unshift({
      id: `tmp-${uid('r')}`, ecoleId, materielIds, probleme, description: description.trim(),
      auteur: trace.par, auteurId: me().id, createdAt: trace.at, statut: 'attente', historique: [{ statut: 'attente', ...trace }],
    });
  });
  return { description: description.trim() };
}

/** Numéro définitif d'une remontée créée, une fois enregistrée. */
const createdRemonteeId = ({ description }: { description: string }) => store.state.remontees.filter((r) => r.auteurId === me().id && r.description === description).sort((a, b) => b.createdAt - a.createdAt)[0]?.id ?? 'Remontée';
