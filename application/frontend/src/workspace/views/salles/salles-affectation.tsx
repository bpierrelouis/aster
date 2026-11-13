/* ==========================================================================
   Salles · affectation de matériels (RG-26, RG-27)
   - affecter() : une salle ou le stock, commun au glisser-déposer, à la fiche
     et à l'équipement d'une salle.
   - Équiper une salle : postes complets (unité centrale, écran et
     périphériques) et matériels secondaires, pris dans le stock en service
     de l'école, dans l'ordre des identifiants ORION. Le serveur valide
     chaque affectation (droits, école de la salle).
   ========================================================================== */

import { useState } from 'react';
import { Icon, Tile } from '../../ui/icons.tsx';
import { store } from '../../core/store.ts';
import { can } from '../../core/permissions.ts';
import { useStore } from '../../hooks/use-store.ts';
import { index } from '../../core/selectors.ts';
import { num, plural } from '#shared/format.ts';
import { DEVICE_TYPES, deviceType } from '#shared/catalog.ts';
import { Sheet, openSheet, notify } from '../../ui/overlays.tsx';
import { SheetForm, SheetFormActions } from '../../ui/forms.tsx';
import type { DeviceTypeId, Id, Materiel, Salle } from '#shared/types.ts';

/** Matériels du stock regroupés : composant d'un poste (type), ou matériel secondaire (modèle) */
interface StockGroup { key: string; type: DeviceTypeId; label: string; items: Materiel[] }

/** Affecte des matériels à une salle, ou au stock (salleId null). Renvoie false si la destination est refusée. */
export async function affecter(mats: Materiel[], salleId: Id | null) {
  const dest = salleId ? index().salle.get(salleId) : null;
  if (dest && mats.some((m) => m.ecoleId !== dest.ecoleId)) { notify('Destination dans une autre école', { icon: 'alertes', tone: 'warn' }); return false; }
  store.update('data', (s) => { for (const m of mats) s.materiels.find((x) => x.id === m.id)!.salleId = salleId ?? null; });
  await store.flush();
  const label = mats.length > 1 ? plural(mats.length, 'matériel') : mats[0].idOrion;
  notify(dest ? `${label} ${mats.length > 1 ? 'affectés' : 'affecté'} à ${dest.nom}, à installer` : `${label} remis en stock, à ranger`, { icon: 'deplacement' }); // déplacement physique à confirmer (Salles › Déplacements)
  return true;
}

export function openEquipSheet(salle: Salle) {
  if (!can('materiel.move')) return;
  openSheet(<EquipSheet salleId={salle.id} />);
}

// Composants d'un poste : unité centrale et écran (tous modèles), périphériques par modèle (clavier, souris…)
const POSTE_TYPES: DeviceTypeId[] = ['uc', 'ecran', 'peripherique'];
const SECONDARY_TYPES = DEVICE_TYPES.filter((t) => !POSTE_TYPES.includes(t.id));

/** Stock en service de l'école, regroupé : composants d'un poste et matériels secondaires par modèle.
    Les matériels déjà rangés passent avant ceux encore à rapatrier (toujours dans leur salle d'origine). */
function stockOf(materiels: Materiel[], ecoleId: Id | undefined) {
  const items = materiels.filter((m) => m.ecoleId === ecoleId && !m.salleId && !m.hs)
    .sort((a, b) => Number(Boolean(a.deplacement)) - Number(Boolean(b.deplacement)) || a.idOrion.localeCompare(b.idOrion, 'fr', { numeric: true }));
  const groups = new Map<string, StockGroup>();
  for (const m of items) {
    const key = m.type === 'uc' || m.type === 'ecran' ? m.type : `${m.type}|${m.modele}`;
    if (!groups.has(key)) groups.set(key, { key, type: m.type, label: key === m.type ? deviceType(m.type).label : m.modele, items: [] });
    groups.get(key)!.items.push(m);
  }
  const all = [...groups.values()];
  const order = (g: StockGroup) => POSTE_TYPES.indexOf(g.type);
  return {
    poste: all.filter((g) => POSTE_TYPES.includes(g.type)).sort((a, b) => order(a) - order(b) || a.label.localeCompare(b.label, 'fr')),
    secondary: SECONDARY_TYPES.map((t) => ({ t, rows: all.filter((g) => g.type === t.id).sort((a, b) => a.label.localeCompare(b.label, 'fr')) })),
  };
}

/** Quantité : saisie directe ou boutons moins et plus, bornée par le stock disponible. */
function Qty({ label, value, max, onChange }: { label: string; value: number; max: number; onChange: (value: number) => void }) {
  const set = (v: number) => onChange(Math.max(0, Math.min(max, Number.isFinite(v) ? Math.trunc(v) : 0)));
  return <span className="stepper-num">
    <button type="button" aria-label={`Un de moins : ${label}`} disabled={value <= 0} onClick={() => set(value - 1)}><Icon name="minus" size={16} /></button>
    <input type="number" inputMode="numeric" min="0" max={max} value={value} aria-label={label} onChange={(e) => set(e.target.valueAsNumber)} />
    <button type="button" aria-label={`Un de plus : ${label}`} disabled={value >= max} onClick={() => set(value + 1)}><Icon name="plus" size={16} /></button>
  </span>;
}

function EquipSheet({ salleId }: { salleId: Id }) {
  const state = useStore();
  const salle = index().salle.get(salleId);
  const { poste, secondary } = stockOf(state.materiels, salle?.ecoleId);
  const [excluded, setExcluded] = useState(() => new Set<string>()); // composants retirés de la composition d'un poste
  const [postes, setPostes] = useState(1);
  const [ecrans, setEcrans] = useState(1); // écrans par poste
  const [extra, setExtra] = useState<Record<string, number>>({}); // clé de modèle → quantité
  if (!salle) return null;

  const per = (g: StockGroup) => (g.key === 'ecran' ? ecrans : 1); // nombre de ce composant par poste
  const included = poste.filter((g) => !excluded.has(g.key));
  const maxPostes = included.length ? Math.min(...included.map((g) => Math.floor(g.items.length / per(g)))) : 0;
  const count = Math.min(postes, maxPostes); // le stock a pu diminuer depuis la saisie
  const rows = secondary.flatMap((s) => s.rows);
  const qty = (g: StockGroup) => Math.min(extra[g.key] ?? 0, g.items.length);
  const picks = [...included.flatMap((g) => g.items.slice(0, count * per(g))), ...rows.flatMap((g) => g.items.slice(0, qty(g)))];
  const hasEcran = poste.some((g) => g.key === 'ecran');
  const toggle = (key: string) => setExcluded((s) => { const next = new Set(s); if (next.has(key)) next.delete(key); else next.add(key); return next; });

  async function save() {
    if (!picks.length) throw Error('Choisissez au moins un matériel du stock.');
    if (!await affecter(picks, salle!.id)) throw Error('Destination dans une autre école.');
  }

  return <Sheet title={`Équiper ${salle.nom}`} size="m" lead={<Tile name="stack" color="var(--accent)" size="m" />}
    footer={<><span className="sheet-hint">{picks.length ? `${plural(picks.length, 'matériel')} du stock` : 'Aucun matériel choisi'}</span>
      <SheetFormActions form="equip-form" icon="deplacement" label={`Affecter à ${salle.nom}`} /></>}>
    <SheetForm id="equip-form" onSave={save}>
      <section className="equip-block" aria-labelledby="equip-postes">
        <header className="equip-head">
          <div><h3 id="equip-postes">Postes</h3><span>Unité centrale et périphériques, pris dans le stock</span></div>
          <Qty label="Nombre de postes" value={count} max={maxPostes} onChange={setPostes} />
        </header>
        {hasEcran && <div className="equip-option">
          <span id="equip-ecrans">Écrans par poste</span>
          <div className="seg" role="radiogroup" aria-labelledby="equip-ecrans">
            {[1, 2].map((n) => <button key={n} type="button" role="radio" aria-checked={ecrans === n} className={`seg-btn ${ecrans === n ? 'is-on' : ''}`}
              disabled={excluded.has('ecran')} onClick={() => setEcrans(n)}>{plural(n, 'écran')}</button>)}
          </div>
        </div>}
        {poste.length ? <ul className="equip-list">
          {poste.map((g) => {
            const t = deviceType(g.type);
            const on = !excluded.has(g.key);
            return <li key={g.key}><label className={`equip-row${on ? '' : ' is-off'}`}>
              <input className="ops-check" type="checkbox" checked={on} onChange={() => toggle(g.key)} />
              <Tile name={t.icon} color={t.color} size="s" />
              <span className="equip-name"><b>{g.label}</b><small>{num(g.items.length)} en stock</small></span>
              <b className="equip-need">{on ? num(count * per(g)) : '—'}</b>
            </label></li>;
          })}
        </ul> : <p className="equip-none">Aucune unité centrale ni aucun périphérique en stock.</p>}
        {poste.length > 0 && <p className="field-hint">{maxPostes ? `Le stock permet d’équiper ${plural(maxPostes, 'poste')} avec cette composition.` : 'Le stock ne permet pas d’équiper un poste complet avec cette composition.'}</p>}
      </section>
      <section className="equip-block" aria-labelledby="equip-secondaires">
        <header className="equip-head"><div><h3 id="equip-secondaires">Matériels secondaires</h3><span>Vidéoprojecteur, réseau, audio, impression</span></div></header>
        {secondary.map(({ t, rows: list }) => <div key={t.id} className="equip-group">
          <span className="equip-group-title"><Tile name={t.icon} color={t.color} size="s" />{t.plural}</span>
          {list.length ? <ul className="equip-list">
            {list.map((g) => <li key={g.key} className="equip-row">
              <span className="equip-name"><b>{g.label}</b><small>{num(g.items.length)} en stock</small></span>
              <Qty label={g.label} value={qty(g)} max={g.items.length} onChange={(v) => setExtra((e) => ({ ...e, [g.key]: v }))} />
            </li>)}
          </ul> : <p className="equip-none">Aucun en stock</p>}
        </div>)}
      </section>
    </SheetForm>
  </Sheet>;
}
