/* ==========================================================================
   Supervision › Règles de processus (whitelist / blacklist) : liste
   filtrable et paginée, formulaire d'ajout et de modification. Une règle
   globale n'est modifiable que par le super administrateur (RG-50) ; le
   serveur contrôle nom, classement et portée (RG-47).
   ========================================================================== */

import { useState } from 'react';
import { FilterSelect } from '../../ui/filter-select.tsx';
import { store, currentEcole, me } from '../../core/store.ts';
import { useStore } from '../../hooks/use-store.ts';
import { scope, index, optionsSalles, batiments, batimentLabel } from '../../core/selectors.ts';
import { uid } from '../../core/dom.ts';
import { matcher } from '../../core/search.ts';
import { CLASSEMENTS } from '#shared/catalog.ts';
import { Tile, Icon } from '../../ui/icons.tsx';
import { AppIcon } from '../../ui/app-icon.tsx';
import { Sheet, openSheet, confirmSheet, notify } from '../../ui/overlays.tsx';
import { SheetForm, SheetFormActions } from '../../ui/forms.tsx';
import { DataPanel, Pagination, SearchField } from '../../widgets/parts.tsx';
import { usePagination } from '../../hooks/use-pagination.ts';
import { plural } from '#shared/format.ts';
import { Status, processText } from './supervision-parts.tsx';
import type { Id, Portee, Regle } from '#shared/types.ts';

const PORTEES: Record<Portee, string> = { global: 'Globale', ecole: 'École', batiment: 'Bâtiment', salle: 'Salle' };
const CLASSES = [{ value: '', label: 'Tous les classements' }, ...(['whitelist', 'blacklist'] as const).map((c) => ({ value: c, label: CLASSEMENTS[c].label }))];

const scopeLabel = (r: Regle) => (r.portee === 'global' ? 'Toutes les écoles' : r.portee === 'ecole' ? index().ecole.get(r.ecoleId!)?.nom : r.portee === 'batiment' ? batimentLabel(r.batiment!) : index().salle.get(r.salleId!)?.nom);
// Règle globale : réservée au super administrateur
const editable = (r: Regle) => r.portee !== 'global' || me().role === 'superadmin';

async function deleteRule(id: Id) {
  try {
    if (!await confirmSheet({ title: 'Supprimer cette règle ?', message: 'Les autres règles applicables restent actives.' })) return;
    await store.update('data', (s) => { s.regles = s.regles.filter((r) => r.id !== id); });
    await store.flush();
    notify('Règle supprimée', { icon: 'check' });
  } catch (error) { notify((error as Error).message, { tone: 'danger' }); }
}

/** Règles visibles dans l'école affichée, par nom de processus */
export function Rules() {
  useStore();
  const [query, setQuery] = useState('');
  const [classement, setClassement] = useState('');
  const e = currentEcole();
  const matches = matcher(query);
  const rules = (store.state.regles || []).filter((r) => (r.portee === 'global' || e === 'all' || r.ecoleId === e) && (!classement || r.classement === classement)
    && matches(processText(r.nom), CLASSEMENTS[r.classement]?.label, scopeLabel(r)))
    .sort((a, b) => a.nom.localeCompare(b.nom, 'fr', { sensitivity: 'base' }));
  const { rows, pager } = usePagination(rules, `${query}|${classement}`);
  const actions = rules.some(editable); // sans règle modifiable, pas de colonne Actions
  return <>
    <p className="ops-muted" style={{ marginBottom: 20 }}>Les règles se cumulent. Une interdiction reste prioritaire sur une autorisation.</p>
    <DataPanel
      filters={<>
        <SearchField value={query} onChange={setQuery} placeholder="Processus ou application…" label="Rechercher" />
        <FilterSelect aria-label="Filtrer par classement" value={classement} onChange={(ev) => setClassement(ev.target.value)} options={CLASSES} />
      </>}
      head={<><th>Processus</th><th>Classement</th><th>Portée</th>{actions && <th><span className="sr-only">Actions</span></th>}</>}
      footer={<Pagination {...pager} total={plural(rules.length, 'règle')} />}>
      {rows.length ? rows.map((r) => <tr key={r.id}>
        <td><span className="app-cell"><AppIcon name={r.nom} /><strong>{r.nom}</strong></span></td>
        <td><Status c={r.classement} /></td>
        <td>{scopeLabel(r)}</td>
        {actions && <td>{editable(r) && <>
          <button className="icon-btn" onClick={() => openRuleForm(r)} aria-label={`Modifier ${r.nom}`}><Icon name="pencil" size={17} /></button>
          <button className="icon-btn" onClick={() => deleteRule(r.id)} aria-label={`Supprimer ${r.nom}`}><Icon name="trash" size={17} /></button>
        </>}</td>}
      </tr>) : <tr><td colSpan={actions ? 4 : 3}><div className="w-empty w-empty--l">Aucune règle ne correspond à cette recherche.</div></td></tr>}
    </DataPanel>
  </>;
}

/** Champs saisis d'une règle ; école absente si la salle choisie est introuvable */
type RegleSaisie = Omit<Regle, 'id' | 'ecoleId'> & { ecoleId?: Id | null };

export function openRuleForm(rule: Regle | null = null) {
  openSheet(<Sheet title={rule ? 'Modifier la règle' : 'Ajouter une règle'} lead={<Tile name="shield" color="var(--accent)" size="m" />}
    footer={<SheetFormActions form="rule-form" />}>
    <RuleForm rule={rule} />
  </Sheet>);
}

function RuleForm({ rule }: { rule: Regle | null }) {
  const state = useStore();
  const ecole = currentEcole() === 'all' ? state.ecoles[0]?.id : currentEcole();

  async function save(form: FormData) {
    const values = Object.fromEntries(form) as RegleSaisie;
    values.nom = values.nom.trim();
    const room = scope().salles.find((s) => s.id === values.salleId);
    if (values.portee === 'salle') values.ecoleId = room?.ecoleId;
    if (values.portee === 'global') values.ecoleId = null;
    await store.update('data', (s) => {
      const item = { id: rule?.id || uid('rule'), ...values } as Regle;
      if (rule) s.regles.splice(s.regles.findIndex((r) => r.id === rule.id), 1, item); else s.regles.push(item);
    });
    await store.flush();
    notify('Règle enregistrée', { icon: 'shield', tone: 'info' });
  }

  return <SheetForm id="rule-form" onSave={save}>
    <label className="field"><span className="field-label">Nom du processus *</span><input name="nom" defaultValue={rule?.nom || ''} required maxLength={100} placeholder="application.exe" /></label>
    <div className="form-2">
      <div className="field"><span className="field-label">Classement</span>
        <FilterSelect aria-label="Classement" name="classement" defaultValue={rule?.classement} options={[{ value: 'whitelist', label: 'Autorisé (whitelist)' }, { value: 'blacklist', label: 'Interdit (blacklist)' }]} />
      </div>
      <div className="field"><span className="field-label">Portée</span>
        <FilterSelect aria-label="Portée" name="portee" defaultValue={rule?.portee}
          options={((me().role === 'superadmin' ? ['global', 'ecole', 'batiment', 'salle'] : ['ecole', 'batiment', 'salle']) as Portee[]).map((p) => ({ value: p, label: PORTEES[p] }))} />
      </div>
      <div className="field"><span className="field-label">École</span>
        <FilterSelect aria-label="École" name="ecoleId" defaultValue={(rule?.ecoleId || ecole) ?? undefined} options={state.ecoles.map((e) => ({ value: e.id, label: e.nom }))} />
      </div>
      <div className="field"><span className="field-label">Bâtiment</span>
        <FilterSelect aria-label="Bâtiment" name="batiment" defaultValue={rule?.batiment} options={batiments().map((b) => ({ value: b, label: b }))} />
      </div>
      <div className="field"><span className="field-label">Salle</span>
        <FilterSelect aria-label="Salle" name="salleId" defaultValue={rule?.salleId} options={optionsSalles()} />
      </div>
    </div>
  </SheetForm>;
}
