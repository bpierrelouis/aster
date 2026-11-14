/* Inventaire d'une salle (ou du stock) : matériels déclarés et leur état pendant la campagne,
   puis matériels vus ici mais affectés ailleurs */
import { Link, Navigate, useParams } from 'react-router';
import { useState } from 'react';
import { Icon } from '../../espace/ui/icons.tsx';
import { useRigel } from '../hooks/use-rigel.ts';
import { lieuDe, nomLieu, parametreDe } from '../core/vue.ts';
import { Ecran, Pastille, TypeMateriel } from '../ui/parts.tsx';
import { plural } from '#shared/format.ts';
import type { MaterielVu, Vue } from '../core/vue.ts';
import type { Id } from '#shared/types.ts';

export function Inventaire() {
  const { vue } = useRigel();
  const lieu = lieuDe(useParams().id);
  const [q, setQ] = useState('');
  if (lieu === undefined || (lieu !== null && !vue.salle.has(lieu))) return <Navigate to="/explorer" replace />;
  const filtre = (m: MaterielVu) => !q || `${m.idOrion} ${m.modele} ${m.marque ?? ''} ${m.serie ?? ''}`.toLocaleLowerCase('fr').includes(q.toLocaleLowerCase('fr'));
  const { attendus, vus } = vue.avancement(lieu);
  const ailleurs = vue.materiels.filter((m) => m.ecart === lieu && m.salleId !== lieu);
  const p = parametreDe(lieu);
  return <Ecran titre={`Inventaire · ${nomLieu(vue, lieu)}`} retour={`/salles/${encodeURIComponent(p)}`}>
    <label className="champ champ--recherche"><Icon name="search" size={18} /><input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Modèle, identifiant, série…" aria-label="Rechercher un matériel" /></label>
    <p className="discret">{plural(vus, 'matériel vu', 'matériels vus')} sur {plural(attendus.length, 'déclaré')}</p>
    <ul className="liste">{attendus.filter(filtre).map((m) => <Ligne key={m.id} m={m} lieu={lieu} vue={vue} />)}</ul>
    {!attendus.length && <p className="vide">Aucun matériel déclaré ici.</p>}
    {ailleurs.length > 0 && <section className="groupe">
      <h2>Vus ici, affectés ailleurs</h2>
      <ul className="liste">{ailleurs.filter(filtre).map((m) => <Ligne key={m.id} m={m} lieu={lieu} vue={vue} />)}</ul>
    </section>}
  </Ecran>;
}

function Ligne({ m, lieu, vue }: { m: MaterielVu; lieu: Id | null; vue: Vue }) {
  return <li><Link className="ligne" to={`/materiels/${encodeURIComponent(m.id)}?lieu=${encodeURIComponent(parametreDe(lieu))}`}>
    <TypeMateriel type={m.type} />
    <span className="ligne-texte"><strong>{m.modele}</strong><small>{m.idOrion}{m.serie ? ` · ${m.serie}` : ''}</small></span>
    <EtatLigne m={m} lieu={lieu} vue={vue} />
  </Link></li>;
}

/** État d'un matériel dans l'inventaire du lieu */
function EtatLigne({ m, lieu, vue }: { m: MaterielVu; lieu: Id | null; vue: Vue }) {
  if (m.salleId !== lieu) return <Pastille ton="install" icone="alert">Affecté : {nomLieu(vue, m.salleId)}</Pastille>;
  if (m.vuDans === lieu) return <Pastille ton="ok" icone="check">Vu</Pastille>;
  if (m.ecart !== undefined) return <Pastille ton="install" icone="alert">Vu : {nomLieu(vue, m.ecart)}</Pastille>;
  if (m.enCours) return <Pastille ton="install" icone="clock">En cours d’installation</Pastille>;
  return <Pastille ton="neutre">Non vu</Pastille>;
}
