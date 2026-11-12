/* ==========================================================================
   Accueil · tableaux de bord personnalisés
   Chaque compte peut ajouter ses propres tableaux au sous-menu de l'accueil.
   Ils sont enregistrés avec les dispositions du compte : la liste ordonnée
   (layouts[profil].tableaux = [{ id, nom }]) et les widgets de chacun
   (layouts[profil][id]), comme les tableaux prédéfinis.
   ========================================================================== */

import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { Tile } from '../../ui/icons.tsx';
import { store } from '../../core/store.ts';
import { uid } from '../../core/dom.ts';
import { Sheet, openSheet, confirmSheet, notify } from '../../ui/overlays.tsx';
import { SheetForm, SheetFormActions } from '../../ui/forms.tsx';
import type { TableauPerso } from '#shared/types.ts';

/** Tableaux personnalisés du compte connecté, dans l'ordre de création. */
export const customBoards = () => store.state.layouts[store.state.role]?.tableaux ?? [];

/** Création (board absent) ou renommage d'un tableau personnalisé. */
export function openBoardForm(board: TableauPerso | null = null) {
  openSheet(<BoardSheet board={board} />);
}

function BoardSheet({ board }: { board: TableauPerso | null }) {
  const navigate = useNavigate();
  const nameRef = useRef<HTMLInputElement>(null);
  useEffect(() => { const t = setTimeout(() => nameRef.current?.focus(), 60); return () => clearTimeout(t); }, []);

  async function save(form: FormData) {
    const nom = (form.get('nom') as string).trim();
    if (!nom) throw Error('Donnez un nom au tableau de bord.');
    const id = board?.id ?? uid('tb');
    store.update('layout', (s) => {
      const layouts = s.layouts[s.role]!;
      layouts.tableaux ??= [];
      if (board) layouts.tableaux.find((b) => b.id === id)!.nom = nom;
      else { layouts.tableaux.push({ id, nom }); layouts[id] = []; }
    });
    await store.flush();
    notify(board ? 'Tableau de bord renommé' : `Tableau de bord « ${nom} » créé`, { icon: 'gauge' });
    if (!board) navigate(`/accueil/${id}`);
  }

  return <Sheet title={board ? 'Renommer le tableau de bord' : 'Nouveau tableau de bord'} size="s" lead={<Tile name="gauge" color="var(--accent)" size="m" />}
    footer={<SheetFormActions form="board-form" icon="check" label={board ? 'Renommer' : 'Créer'} />}>
    <SheetForm id="board-form" onSave={save}>
      <label className="field"><span className="field-label">Nom</span>
        <input ref={nameRef} name="nom" required maxLength={40} defaultValue={board?.nom ?? ''} placeholder="Ex. Rentrée de janvier" autoComplete="off" />
      </label>
    </SheetForm>
  </Sheet>;
}

/** Suppression d'un tableau personnalisé et de ses widgets ; résout true si elle a eu lieu. */
export async function deleteBoard(board: TableauPerso) {
  const ok = await confirmSheet({ title: `Supprimer « ${board.nom} » ?`, message: 'Le tableau de bord et ses widgets seront retirés. Les autres tableaux ne changent pas.' });
  if (!ok) return false;
  store.update('layout', (s) => {
    const layouts = s.layouts[s.role]!;
    layouts.tableaux = (layouts.tableaux ?? []).filter((b) => b.id !== board.id);
    delete layouts[board.id];
  });
  try { await store.flush(); } catch { return false; }
  notify('Tableau de bord supprimé', { icon: 'trash', tone: 'danger' });
  return true;
}
