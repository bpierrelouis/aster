/* Fiche d'un matériel. Dans l'inventaire d'un lieu, où l'agent déclare se trouver (RG-96) : confirmer sa présence ;
   affecté ailleurs, l'accepter ici (ranger au stock) ou le ramener à son affectation ; sans lieu : consultation,
   puis choix du lieu constaté. */
import { Navigate, useLocation, useNavigate, useParams, useSearchParams } from 'react-router';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { annoncer, constater } from '../core/etat.ts';
import { useRigel } from '../hooks/use-rigel.ts';
import { lieuDe, nomLieu, parametreDe } from '../core/vue.ts';
import { Ecran, Pastille, TypeMateriel, logistiqueDe } from '../ui/parts.tsx';
import { deviceType } from '#shared/catalog.ts';
import type { MaterielVu, Vue } from '../core/vue.ts';
import type { Id } from '#shared/types.ts';

type Constat = 'vu' | 'releve' | 'retour';

export function Materiel() {
  const { vue } = useRigel();
  const navigate = useNavigate();
  const lieu = lieuDe(useSearchParams()[0].get('lieu'));
  const code: string | undefined = useLocation().state?.code;
  const m = vue.materiel.get(useParams().id ?? '');
  if (!m) return <Navigate to="/" replace />;
  const logistique = logistiqueDe(m);

  /** Constat enregistré : retour au scanner de l'inventaire, le code lu restant ignoré tant qu'il est devant l'objectif */
  async function constat(type: Constat, salleId: Id | null, message: string, ton: 'ok' | 'accent' | 'install' = 'ok') {
    await constater({ type, code: code ?? m!.idOrion, salleId, materielId: m!.id });
    annoncer(message, ton);
    navigate(`/scanner?lieu=${encodeURIComponent(parametreDe(salleId))}`, { replace: true, state: { ignorer: code } });
  }

  return <Ecran titre={m.modele}>
    <section className="carte fiche">
      <div className="fiche-titre">
        <TypeMateriel type={m.type} />
        <span><span className="surtitre">{deviceType(m.type).label}</span><strong>{m.idOrion}</strong></span>
      </div>
      <dl className="proprietes">
        <div><dt>Marque</dt><dd>{m.marque ?? '—'}</dd></div>
        <div><dt>Numéro de série</dt><dd>{m.serie ?? '—'}</dd></div>
        <div><dt>Affectation</dt><dd>{nomLieu(vue, m.salleId)}</dd></div>
        <div><dt>État</dt><dd className="etats">
          <Pastille ton={m.hs ? 'crit' : 'ok'} icone={m.hs ? 'power' : 'checkCircle'}>{m.hs ? 'Hors service' : 'En service'}</Pastille>
          <Pastille ton={m.enCours ? 'install' : logistique.tone === 'ok' ? 'ok' : 'stock'}>{logistique.label}</Pastille>
          {m.vuDans !== undefined && <Pastille ton="ok" icone="check">Vu : {nomLieu(vue, m.vuDans)}</Pastille>}
        </dd></div>
      </dl>
    </section>
    {lieu === undefined ? <ChoixLieu vue={vue} m={m} /> : <Actions vue={vue} m={m} lieu={lieu} constat={constat} />}
  </Ecran>;
}

function Actions({ vue, m, lieu, constat }: { vue: Vue; m: MaterielVu; lieu: Id | null; constat: (type: Constat, salleId: Id | null, message: string, ton?: 'ok' | 'accent' | 'install') => Promise<void> }) {
  const ici = nomLieu(vue, lieu);
  if (m.salleId === lieu) {
    return <div className="pile">
      <button className="bouton bouton--principal" type="button" onClick={() => void constat('vu', lieu, m.enCours ? `Installation confirmée · ${m.idOrion}` : `Présence confirmée · ${m.idOrion}`)}>
        {m.enCours ? 'Confirmer l’installation' : 'Confirmer la présence'}
      </button>
    </div>;
  }
  const bloque = m.hs && lieu !== null;
  const affectation = nomLieu(vue, m.salleId);
  return <>
    <p className="ecart" role="note"><span>Affecté : <strong>{affectation}</strong></span><span>Constaté : <strong>{ici}</strong></span></p>
    <div className="pile">
      <button className="bouton bouton--principal" type="button" disabled={bloque} aria-describedby={bloque ? 'hs-explication' : undefined}
        onClick={() => void constat('releve', lieu, lieu === null ? `Rangé au stock · ${m.idOrion}` : `Accepté dans ${ici} · ${m.idOrion}`, 'accent')}>
        {lieu === null ? 'Ranger au stock' : `Accepter dans ${ici}`}
      </button>
      {bloque && <p id="hs-explication" className="discret">Un matériel hors service ne peut aller qu’au stock.</p>}
      <button className="bouton" type="button" onClick={() => void constat('retour', lieu, `Retour lancé vers ${affectation} · ${m.idOrion}`, 'install')}>
        {m.salleId === null ? 'Ramener au stock' : `Ramener dans ${affectation}`}
      </button>
    </div>
  </>;
}

/** Sans inventaire en cours : choix du lieu où le matériel est constaté */
function ChoixLieu({ vue, m }: { vue: Vue; m: MaterielVu }) {
  const navigate = useNavigate();
  const [choix, setChoix] = useState(m.salleId ?? 'stock');
  const valider = (e: FormEvent) => { e.preventDefault(); navigate(`/materiels/${encodeURIComponent(m.id)}?lieu=${encodeURIComponent(choix)}`, { replace: true }); };
  return <form className="carte formulaire" onSubmit={valider}>
    <label className="champ"><span>Lieu constaté</span>
      <select value={choix} onChange={(e) => setChoix(e.target.value)}>
        <option value="stock">Stock</option>
        {vue.salles.map((s) => <option key={s.id} value={s.id}>{s.nom} · bâtiment {s.batiment}</option>)}
      </select>
    </label>
    <button className="bouton bouton--principal" type="submit">Constater ici</button>
  </form>;
}
