/* ==========================================================================
   Matériels · import JSON. Le fichier choisi ou le JSON collé est vérifié,
   puis ses numéros de série sont rapprochés de tout le parc par le serveur
   (le navigateur ne voit que son école ; règles dans
   backend/workspace/import.js). L'aperçu fait remonter les incohérences :
   - matériel d'une autre école : un interrupteur valide son transfert
     (échange entre écoles) ;
   - matériel déjà présent dans l'école, ou répété dans le fichier : non traité.
   L'import n'ajoute que les nouveaux matériels et les transferts validés ; le
   bouton montre l'import en cours puis une coche, et la liste reste affichée
   avec le résultat de chaque ligne (ajouté, transféré, non traité).
   ========================================================================== */

import { Fragment, useEffect, useMemo, useState } from 'react';
import { Icon, Tile } from '../../ui/icons.jsx';
import { uid } from '../../core/dom.js';
import { store, currentEcole } from '../../core/store.js';
import { useStore } from '../../hooks/use-store.js';
import { can } from '../../core/permissions.js';
import { index } from '../../core/selectors.js';
import { DEVICE_TYPES, deviceType, serieKey } from '#shared/catalog.js';
import { notify } from '../../ui/overlays.jsx';
import { Switch } from '../../ui/forms.jsx';
import { dateNum, num, plural } from '#shared/format.js';
import { Loader, OpsTable, Pagination, paginate } from '../../widgets/parts.jsx';

const PAGE_SIZE = 25;
const s = (n) => (n > 1 ? 's' : '');
// Ordre de l'aperçu : ce qui demande une décision, puis ce qui ne sera pas traité, puis les nouveaux
const ORDER = { ecole: 0, present: 1, double: 2, nouveau: 3 };
const ANALYSE_MIN = 900; // l'analyse reste affichée un instant, même quand le serveur répond aussitôt
const IMPORT_MIN = 700;  // de même pour l'import en cours
const DONE_SHOWN = 1600; // durée de la coche de réussite
const wait = (ms) => new Promise((resolve) => { setTimeout(resolve, ms); });

/** Matériels du JSON, vérifiés ligne à ligne ; la première erreur est levée avec un message lisible */
function validateImport(text, ecoleId, salles) {
  let rows;
  try { rows = JSON.parse(text); } catch { throw new Error('JSON invalide : vérifiez les virgules, guillemets et crochets.'); }
  if (!Array.isArray(rows) || !rows.length) throw new Error('Le fichier doit contenir un tableau non vide de matériels.');
  if (rows.length > 2000) throw new Error('Limitez chaque import à 2 000 matériels.');
  return rows.map((row, i) => {
    const fail = (message) => { throw new Error(`Matériel ${i + 1} : ${message}`); };
    if (!row || typeof row !== 'object' || Array.isArray(row)) fail('objet attendu.');
    if (typeof row.modele !== 'string' || !row.modele.trim() || row.modele.length > 60) fail('modèle obligatoire (60 caractères maximum).');
    const received = typeof row.dateReception === 'number' ? row.dateReception : Date.parse(row.dateReception);
    if (!Number.isFinite(received)) fail('dateReception obligatoire, au format AAAA-MM-JJ.');
    if (row.hs !== undefined && typeof row.hs !== 'boolean') fail('hs doit être true ou false.');
    if (row.type && !DEVICE_TYPES.some((t) => t.id === row.type)) fail('type inconnu.');
    if (row.salleId && !salles.some((s) => s.id === row.salleId && s.ecoleId === ecoleId)) fail('salle absente de l’école sélectionnée.');
    for (const key of ['marque', 'serie']) if (row[key] != null && (typeof row[key] !== 'string' || row[key].length > 40)) fail(`${key} : texte de 40 caractères maximum.`);
    const garantieFin = row.garantieFin ? typeof row.garantieFin === 'number' ? row.garantieFin : Date.parse(row.garantieFin) : null;
    if (garantieFin !== null && !Number.isFinite(garantieFin)) fail('date de garantie invalide.');
    return { id: uid('m'), ecoleId, type: row.type || 'autre', modele: row.modele.trim(), marque: row.marque?.trim() || null, serie: row.serie?.trim() || null, dateReception: received, garantieFin, hs: row.hs ?? false, salleId: row.salleId || null };
  });
}

/** Nature de chaque ligne d'après les correspondances du serveur : nouveau, d'une autre école, déjà présent, en double */
function classify(rows, matches, ecoleId) {
  const seen = new Set();
  return rows.map((m) => {
    const k = serieKey(m.serie);
    if (k && seen.has(k)) return { m, k, kind: 'double' };
    if (k) seen.add(k);
    const hit = k ? matches[k] : null;
    return { m, k, hit, kind: !hit ? 'nouveau' : hit.ecoleId === ecoleId ? 'present' : 'ecole' };
  });
}

/** État d'import d'une ligne : à venir (aperçu), ou résultat une fois l'import fait (done) */
function importState(x, on, done) {
  if (x.kind === 'nouveau') return { label: done ? 'Ajouté' : 'Prêt à être ajouté', ok: true };
  if (x.kind === 'ecole' && on) return { label: done ? 'Transféré' : 'Prêt à être transféré', ok: true };
  return { label: 'Non traité', ok: false };
}

function PreviewRow({ x, on, onToggle, done }) {
  const t = deviceType(x.m.type);
  const salle = x.m.salleId ? index().salle.get(x.m.salleId) : null;
  const flagged = x.kind !== 'nouveau';
  const state = importState(x, on, done);
  const chip = { nouveau: <span className="chip">Nouveau</span>,
    present: <span className="chip chip--warn" data-tip={x.hit?.modele}><Icon name="alertes" size={13} />Déjà présent · {x.hit?.idOrion}</span>,
    double: <span className="chip chip--warn"><Icon name="alertes" size={13} />En double dans le fichier</span>,
    ecole: <span className="chip chip--warn" data-tip={`${x.hit?.modele}, ${x.hit?.idOrion}`}><Icon name="school" size={13} />{x.hit?.ecole} · {x.hit?.idOrion}</span> }[x.kind];
  return <tr className={flagged && !on ? 'is-flagged' : ''}>
    <td>{chip}</td>
    <td><b>{x.m.modele}</b>{x.m.marque && <small className="inv-sub">{x.m.marque}</small>}</td>
    <td>{t.label}</td>
    <td>{x.m.serie ?? '—'}</td>
    <td>{dateNum(x.m.dateReception)}</td>
    <td>{salle ? salle.nom : 'Stock'}</td>
    <td>{x.kind === 'ecole' && !done
      ? <span className="inv-transfer"><Switch on={on} onChange={onToggle} disabled={Boolean(x.hit.bloque)} tip={x.hit.bloque ?? undefined} label={`Transférer ${x.hit.idOrion} depuis ${x.hit.ecole}`} /><span className={on ? 'inv-add' : ''}>{x.hit.bloque ? 'Bloqué' : on ? state.label : 'Transférer'}</span></span>
      : <span className={state.ok ? 'inv-add' : 'inv-skip'}>{state.label}</span>}</td>
  </tr>;
}

/** Aperçu : bilan, incohérences, matériels (ceux qui demandent une décision d'abord) ; une fois l'import fait (done), son résultat */
function ImportPreview({ items, transferts, onToggle, ecoleNom, done = false }) {
  const [page, setPage] = useState(1);
  const ordered = [...items].sort((a, b) => ORDER[a.kind] - ORDER[b.kind]);
  const { rows, pages, current } = paginate(ordered, page, PAGE_SIZE);
  const count = (kind) => items.filter((x) => x.kind === kind).length;
  const [nouveaux, ecoles, presents, doubles] = [count('nouveau'), count('ecole'), count('present'), count('double')];
  const transferes = items.filter((x) => x.kind === 'ecole' && transferts.has(x.k)).length;
  return <section className="inv-preview" aria-label={done ? 'Résultat de l’import' : 'Aperçu de l’import'}>
    <p className="inv-preview-lead">{done ? 'Import terminé dans' : 'Aperçu de l’import dans'} <b>{ecoleNom}</b></p>
    <ul className="inv-tally">
      <li className="is-ok"><b>{num(nouveaux)}</b><span>{done ? `matériel${s(nouveaux)} ajouté${s(nouveaux)}` : `nouveau${nouveaux > 1 ? 'x' : ''} matériel${s(nouveaux)}, prêt${s(nouveaux)} à être ajouté${s(nouveaux)}`}</span></li>
      {ecoles ? <li className="is-choice"><b>{num(ecoles)}</b><span>{done ? `d’une autre école : ${num(transferes)} transféré${s(transferes)}` : `d’une autre école, à accepter ou non${transferes ? ` · ${num(transferes)} accepté${s(transferes)}` : ''}`}</span></li> : null}
      {presents ? <li className="is-skip"><b>{num(presents)}</b><span>déjà présent{s(presents)} dans le parc, non traité{s(presents)}</span></li> : null}
      {doubles ? <li className="is-skip"><b>{num(doubles)}</b><span>en double dans le fichier, non traité{s(doubles)}</span></li> : null}
    </ul>
    {ecoles && !done ? <div className="hint hint--warn" role="alert"><Icon name="school" size={20} /><span>
      {plural(ecoles, 'matériel')} {ecoles > 1 ? 'appartiennent' : 'appartient'} à une autre école. S’il s’agit d’un échange, acceptez-le avec « Transférer » : le matériel rejoint {ecoleNom} avec son identifiant Orion. Sinon, il n’est pas traité.</span></div> : null}
    {presents + doubles && !done ? <div className="hint hint--warn" role="alert"><Icon name="alertes" size={20} /><span>
      {presents ? `${plural(presents, 'matériel')} ${presents > 1 ? 'sont' : 'est'} déjà ${presents > 1 ? 'présents' : 'présent'} dans l’inventaire (même numéro de série). ` : ''}
      {doubles ? `${plural(doubles, 'ligne')} ${doubles > 1 ? 'répètent' : 'répète'} un numéro de série du fichier. ` : ''}
      {presents + doubles > 1 ? 'Ils ne seront pas traités par l’import.' : 'Il ne sera pas traité par l’import.'}</span></div> : null}
    <OpsTable scroll={false} head={['Aperçu', 'Modèle', 'Type', 'Numéro de série', 'Réception', 'Destination', 'Import']}>
      {rows.map((x) => <PreviewRow key={x.m.id} x={x} done={done} on={x.k ? transferts.has(x.k) : false} onToggle={(v) => onToggle(x.k, v)} />)}
    </OpsTable>
    {pages > 1 && <Pagination current={current} pages={pages} onPage={setPage} />}
  </section>;
}

/** Import JSON : vérification, rapprochement par le serveur et aperçu, puis import par le serveur */
export function ImportPanel() {
  useStore();
  const ecole = currentEcole();
  const ecoles = store.state.ecoles.filter((e) => ecole === 'all' || e.id === ecole);
  const [ecoleId, setEcoleId] = useState(ecoles[0]?.id ?? '');
  const [text, setText] = useState('');
  const [rev, setRev] = useState(0); // chaque nouveau contenu repart de la première page de l'aperçu
  const [fileName, setFileName] = useState('');
  const [matches, setMatches] = useState(null); // { key, data } : correspondances du serveur pour un contenu
  const [transferts, setTransferts] = useState(() => new Set());
  const [result, setResult] = useState(null); // dernier import : lignes et transferts, présentés avec leur résultat
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [phase, setPhase] = useState('idle'); // bouton : idle, busy (import en cours), done (coche, un instant)
  const load = (value, name = '') => {
    setText(value); setFileName(name); setRev((r) => r + 1); setTransferts(new Set());
    if (value) setResult(null);
  };

  const checked = useMemo(() => {
    if (!text.trim()) return null;
    try { return { rows: validateImport(text, ecoleId, store.state.salles) }; } catch (e) { return { error: e.message }; }
  }, [text, ecoleId]);
  const key = `${rev}|${ecoleId}`;

  // Rapprochement des numéros de série avec tout le parc (serveur), peu après la dernière modification
  useEffect(() => {
    if (!checked?.rows) return undefined;
    const series = [...new Set(checked.rows.map((m) => m.serie).filter(Boolean))];
    let live = true;
    const timer = setTimeout(() => {
      Promise.all([store.call('/import/analyse', { ecoleId, series }), wait(ANALYSE_MIN)])
        .then(([data]) => { if (live) setMatches({ key, data }); })
        .catch((e) => { if (live) setError(e.message); });
    }, 250);
    return () => { live = false; clearTimeout(timer); };
  }, [checked, ecoleId, key]);

  const ready = checked?.rows && matches?.key === key;
  const items = ready ? classify(checked.rows, matches.data, ecoleId) : null;
  const toImport = items ? items.filter((x) => x.kind === 'nouveau' || (x.kind === 'ecole' && transferts.has(x.k) && !x.hit.bloque)).length : 0;
  const ecoleNom = ecoles.find((e) => e.id === ecoleId)?.nom ?? '';

  async function readFile(e) {
    const file = e.currentTarget.files[0];
    setError(''); setSuccess('');
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { setError('Le fichier dépasse 2 Mo.'); return; }
    load(await file.text(), file.name);
  }

  async function submit(e) {
    e.preventDefault();
    if (!can('materiel.import') || !toImport || phase !== 'idle') return;
    const form = e.currentTarget;
    setError(''); setSuccess(''); setPhase('busy');
    try {
      const [bilan] = await Promise.all([store.call('/import', { ecoleId, materiels: checked.rows, transferts: [...transferts] }), wait(IMPORT_MIN)]);
      setResult({ items, transferts, ecoleNom }); // la liste reste, avec le résultat de chaque ligne
      form.reset(); load(''); // plus de fichier sélectionné
      const summary = [bilan.ajoutes && `${plural(bilan.ajoutes, 'matériel')} ajouté${s(bilan.ajoutes)}`, bilan.transferes && `${num(bilan.transferes)} transféré${s(bilan.transferes)}`, bilan.ignores && `${num(bilan.ignores)} non traité${s(bilan.ignores)}`].filter(Boolean).join(', ');
      setSuccess(`${summary}. Retrouvez-les dans l’inventaire.`);
      notify(summary, { icon: 'importJson' });
      setPhase('done');
      setTimeout(() => setPhase('idle'), DONE_SHOWN);
    } catch (err) { setError(err.message); setPhase('idle'); }
  }

  const problem = error || checked?.error;
  const label = !checked?.rows ? 'Importer les matériels' : !ready ? 'Analyse du parc…' : toImport ? `Importer ${plural(toImport, 'matériel')}` : 'Aucun matériel à importer';
  return <div className="inv-import-view">
    <section className="inv-import glass">
      <div><Tile name="importJson" color="var(--accent)" size="l" /><h2>Votre inventaire, en une fois.</h2><p>Importez un tableau JSON. Chaque nouveau matériel reçoit un identifiant Orion. Le fichier est analysé dès qu’il est choisi : l’aperçu signale les matériels déjà présents, non traités, et ceux d’une autre école, à accepter s’il s’agit d’un échange.</p></div>
      <form className="form" onSubmit={submit}>
        <label className="field"><span className="field-label">École</span><select name="ecole" value={ecoleId} onChange={(e) => { setEcoleId(e.target.value); setTransferts(new Set()); }}>{ecoles.map((e) => <option key={e.id} value={e.id}>{e.nom}</option>)}</select></label>
        <label className="inv-drop field"><span className="field-label">Fichier JSON</span><input name="file" type="file" accept=".json,application/json" onChange={readFile} /><span className="field-hint">{fileName ? `${fileName}, analysé ci-dessous.` : '2 000 matériels maximum, 2 Mo maximum.'}</span></label>
        <details className="inv-paste"><summary>Ou coller le JSON</summary>
          <label className="field"><span className="field-label">JSON</span><textarea name="json" rows={8} spellCheck={false} value={text} onChange={(e) => { load(e.target.value); setSuccess(''); setError(''); }} placeholder='[{"modele":"Écran 24 pouces","dateReception":"2026-11-08","type":"ecran","hs":false}]' /></label>
        </details>
        <p className="form-error" role="alert" hidden={!problem}>{problem}</p>
        <p role="status" hidden={!success}>{success}</p>
        <button className={`btn btn--primary btn--status is-${phase}`} type="submit" disabled={phase === 'idle' && !toImport} aria-busy={phase === 'busy'}>
          {phase === 'busy' ? <><span className="btn-spinner" aria-hidden="true" /><span>Import en cours…</span></>
            : phase === 'done' ? <><svg className="btn-check" viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5" /></svg><span>Import terminé</span></>
              : <><Icon name="importJson" size={18} /><span>{label}</span></>}
        </button>
      </form>
      <details className="inv-help"><summary>Format attendu et exemple</summary>
        <p>Obligatoires : <code>modele</code> et <code>dateReception</code>. Facultatifs : <code>type</code>, <code>marque</code>, <code>serie</code>, <code>hs</code>, <code>salleId</code>, <code>garantieFin</code>. L’école est celle sélectionnée ci-dessus ; sans salle, le matériel entre en stock. Le numéro de série sert à reconnaître un matériel déjà connu.</p>
        <pre>{`[{
  "modele": "Écran 24 pouces",
  "type": "ecran",
  "dateReception": "2026-11-08",
  "hs": false,
  "marque": "Dell",
  "serie": "SN-12345",
  "garantieFin": "2029-11-08"
}]`}</pre>
        <p>Types : {DEVICE_TYPES.map((t, i) => <Fragment key={t.id}>{i ? ', ' : ''}<code>{t.id}</code></Fragment>)}.</p>
      </details>
    </section>
    {checked?.rows && !ready && <Loader label="Analyse du fichier…" />}
    {items ? <ImportPreview key={key} items={items} transferts={transferts} ecoleNom={ecoleNom}
      onToggle={(k, v) => setTransferts((set) => { const n = new Set(set); if (v) n.add(k); else n.delete(k); return n; })} />
      : result && <ImportPreview key="resultat" done items={result.items} transferts={result.transferts} ecoleNom={result.ecoleNom} />}
  </div>;
}
