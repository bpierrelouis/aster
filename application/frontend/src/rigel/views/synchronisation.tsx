/* Synchronisation : constats en attente, résultats d'ORION, synchronisation à la demande et dissociation */
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { dissocier, synchroniser } from '../core/etat.ts';
import { useRigel } from '../hooks/use-rigel.ts';
import { nomLieu } from '../core/vue.ts';
import { Ecran, Pastille, etatSynchro } from '../ui/parts.tsx';
import { RESULTATS } from '#shared/rigel.ts';
import { clock, plural } from '#shared/format.ts';
import type { EvenementRigel } from '#shared/rigel.ts';
import type { Vue } from '../core/vue.ts';

const objet = (vue: Vue, e: EvenementRigel) => (e.materielId ? vue.materiel.get(e.materielId)?.idOrion ?? e.code : e.saisie?.modele ?? e.code);

export function Synchronisation() {
  const { etat, vue } = useRigel();
  const navigate = useNavigate();
  const [confirmer, setConfirmer] = useState(false);
  const synchro = etatSynchro(etat);
  return <Ecran titre="Synchronisation" retour="/">
    <section className="carte">
      <Pastille ton={synchro.ton} icone={synchro.icone}>{synchro.texte}</Pastille>
      {etat.reseau.synchroLe && <p className="discret">Dernière synchronisation à {clock(etat.reseau.synchroLe)}</p>}
      <button className="bouton bouton--principal" type="button" disabled={etat.reseau.enCours} onClick={() => void synchroniser()}>
        {etat.reseau.enCours ? 'Synchronisation…' : 'Synchroniser'}
      </button>
    </section>
    {etat.file.length > 0 && <section className="groupe">
      <h2>À intégrer par ORION · {plural(etat.file.length, 'constat')}</h2>
      <ul className="liste">{etat.file.map(({ evenement: e, etat: et }) => <li key={e.id} className="ligne">
        <span className="ligne-texte"><strong>{objet(vue, e)}</strong><small>{nomLieu(vue, e.salleId)} · {clock(e.observeLe)}</small></span>
        <Pastille ton={et === 'attente' ? 'install' : 'accent'}>{et === 'attente' ? 'En attente' : 'Transmis'}</Pastille>
      </li>)}</ul>
    </section>}
    {etat.historique.length > 0 && <section className="groupe">
      <h2>Intégrés</h2>
      <ul className="liste">{etat.historique.map(({ evenement: e, resultat, message }) => <li key={e.id} className="ligne">
        <span className="ligne-texte"><strong>{objet(vue, e)}</strong><small>{message ?? `${nomLieu(vue, e.salleId)} · ${clock(e.observeLe)}`}</small></span>
        <Pastille ton={RESULTATS[resultat].tone} icone={RESULTATS[resultat].icon}>{RESULTATS[resultat].label}</Pastille>
      </li>)}</ul>
    </section>}
    <section className="groupe">
      {confirmer
        ? <div className="pile">
          <p className="alerte" role="alert">Les données de l’appairage et les constats non intégrés seront effacés de ce téléphone.</p>
          <button className="bouton bouton--danger" type="button" onClick={() => void dissocier().then(() => navigate('/', { replace: true }))}>Confirmer la dissociation</button>
          <button className="bouton" type="button" onClick={() => setConfirmer(false)}>Annuler</button>
        </div>
        : <button className="bouton bouton--discret" type="button" onClick={() => setConfirmer(true)}>Dissocier ce téléphone</button>}
    </section>
  </Ecran>;
}
