/* ==========================================================================
   Administration · formulaires : comptes, écoles (bâtiment : salles-forms.tsx)
   et fiche d'un poste, d'où s'installe ou se désinstalle une application
   (demande d'intervention : administration-intervention-form.tsx).
   ========================================================================== */

import { FilterSelect } from '../../ui/filter-select.tsx';
import { useState } from 'react';
import { store, currentEcole, me } from '../../core/store.ts';
import { useStore } from '../../hooks/use-store.ts';
import { index, emplacement } from '../../core/selectors.ts';
import { PosteEtat } from '../../widgets/parts.tsx';
import { uid } from '../../core/dom.ts';
import { ROLES } from '#shared/catalog.ts';
import { Icon, Tile } from '../../ui/icons.tsx';
import { AppIcon } from '../../ui/app-icon.tsx';
import { Sheet, openSheet, notify } from '../../ui/overlays.tsx';
import { SheetForm, SheetFormActions } from '../../ui/forms.tsx';
import { openInterventionForm } from './administration-intervention-form.tsx';
import type { SheetClose } from '../../ui/overlays.tsx';
import type { Compte, Ecole, Id, InterventionType } from '#shared/types.ts';

/** Champs du formulaire d'un compte */
type CompteSaisi = Pick<Compte, 'nom' | 'email' | 'role' | 'ecoleId'>;

export function openAccountForm(account: Compte | null = null) {
  openSheet(<Sheet title={account ? 'Modifier le compte' : 'Créer un compte'} lead={<Tile name="users" color="var(--accent)" size="m" />} footer={<SheetFormActions form="account-form" />}>
    <AccountForm account={account} />
  </Sheet>);
}

function AccountForm({ account }: { account: Compte | null }) {
  const state = useStore();
  const school = account?.ecoleId || (currentEcole() !== 'all' ? currentEcole() : state.ecoles[0]?.id);

  async function save(form: FormData) {
    const data = Object.fromEntries(form) as CompteSaisi;
    data.nom = data.nom.trim();
    data.email = data.email.trim();
    if (data.role === 'superadmin') data.ecoleId = null;
    await store.update('data', (s) => {
      if (s.comptes.some((c) => c.id !== account?.id && c.email.toLowerCase() === data.email.toLowerCase())) throw Error('Cette adresse est déjà utilisée.');
      if (account) Object.assign(s.comptes.find((c) => c.id === account.id)!, data); else s.comptes.push({ id: uid('account'), ...data, actif: true });
    });
    await store.flush();
    notify('Compte enregistré', { icon: 'check' });
  }

  return <SheetForm id="account-form" onSave={save}>
    <label className="field"><span className="field-label">Nom *</span><input name="nom" required maxLength={100} defaultValue={account?.nom || ''} /></label>
    <label className="field"><span className="field-label">Adresse électronique *</span><input name="email" type="email" required maxLength={180} defaultValue={account?.email || ''} /></label>
    <div className="form-2">
      <div className="field"><span className="field-label">Profil</span>
        <FilterSelect aria-label="Profil" name="role" defaultValue={account?.role || 'formateur'} options={ROLES.filter((r) => me().role === 'superadmin' || r.id !== 'superadmin').map((r) => ({ value: r.id, label: r.label }))} />
      </div>
      {/* Un administrateur n'a qu'une école : les comptes qu'il gère y sont rattachés ; le super administrateur choisit */}
      {me().role === 'superadmin'
        ? <div className="field"><span className="field-label">École</span>
          <FilterSelect aria-label="École" name="ecoleId" defaultValue={school!} options={state.ecoles.map((e) => ({ value: e.id, label: e.nom }))} />
        </div>
        : <label className="field"><span className="field-label">École</span>
          <input readOnly value={index().ecole.get(me().ecoleId!)?.nom ?? ''} />
          <input type="hidden" name="ecoleId" value={me().ecoleId!} />
        </label>}
    </div>
  </SheetForm>;
}

export function openSchoolForm(school: Ecole | null = null) {
  async function save(form: FormData) {
    const nom = (form.get('nom') as string).trim();
    if (!nom) throw Error('Renseignez le nom.');
    await store.update('data', (s) => { if (school) s.ecoles.find((x) => x.id === school.id)!.nom = nom; else s.ecoles.push({ id: uid('e'), nom }); });
    await store.flush();
    notify('École enregistrée', { icon: 'check' });
  }
  openSheet(<Sheet title={school ? 'Modifier l’école' : 'Ajouter une école'} lead={<Tile name="school" color="var(--c3)" size="m" />} footer={<SheetFormActions form="school-form" />}>
    <SheetForm id="school-form" onSave={save}>
      <label className="field"><span className="field-label">Nom de l’école *</span><input name="nom" required maxLength={100} defaultValue={school?.nom || ''} /></label>
    </SheetForm>
  </Sheet>);
}

export function openPostDetail(id: Id) {
  if (!index().poste.get(id)) return;
  openSheet(<PostDetail id={id} />);
}

// Le sheet entier est un composant : la liste et le pied partagent l'application choisie
function PostDetail({ id }: { id: Id }) {
  const state = useStore();
  const p = index().poste.get(id);
  const materiel = index().materiel.get(p?.materielId!);
  const installed = new Set((state.installations || []).filter((i) => i.posteId === id).map((i) => i.applicationId));
  const others = state.applications.filter((a) => !installed.has(a.id));
  const [choice, setChoice] = useState(others[0]?.id);
  const request = (close: SheetClose, type: InterventionType, applicationId: Id) => { close(); openInterventionForm(type, { applicationId, posteId: id }); };
  return <Sheet title={p?.nomReseau!} lead={<Tile name="desktop" color="var(--accent)" size="m" />}
    footer={<>
      <button className="btn btn--ghost" type="button" data-sheet-close="">Fermer</button>
      <button className="btn btn--primary" type="submit" form="post-install" disabled={!others.length}><Icon name="download" size={18} /><span>Installer</span></button>
    </>}>
    {(close) => p && <>
      <p className="sheet-text">{emplacement(index().salle.get(p.salleId))}{materiel && ` · ${materiel.idOrion}, ${materiel.modele}`}</p>
      <p className="sheet-text"><PosteEtat p={p} />{p.adresseIp && ` · Adresse IP ${p.adresseIp}`}{p.os && ` · ${p.os}`}</p>
      <h3>Applications installées</h3>
      {installed.size
        ? <ul className="pop-list-plain">{state.applications.filter((a) => installed.has(a.id)).map((a) => <li key={a.id} className="ops-process">
          <AppIcon name={a.nom} />
          <div><strong>{a.nom}</strong><small>{a.version}</small></div>
          <button className="btn btn--danger-ghost" type="button" onClick={() => request(close, 'desinstallation', a.id)}><Icon name="trash" size={17} />Désinstaller</button>
        </li>)}</ul>
        : <p className="ops-muted">Aucune application inventoriée.</p>}
      <form id="post-install" className="form" onSubmit={(e) => { e.preventDefault(); if (choice) request(close, 'installation', choice); }}>
        <div className="field"><span className="field-label">Installer une application</span>
          <FilterSelect aria-label="Installer une application" value={choice} onChange={(e) => setChoice(e.target.value)} options={others.map((a) => ({ value: a.id, label: a.nom }))} />
        </div>
      </form>
    </>}
  </Sheet>;
}
