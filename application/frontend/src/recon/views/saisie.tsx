/* Saisie manuelle, solution de secours du scanner : mêmes contenus (étiquette, identifiant ORION, numéro de série,
   lien d'appairage) */
import { useSearchParams } from 'react-router';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { useRecon } from '../hooks/use-recon.ts';
import { useTraiter } from '../hooks/use-traiter.ts';
import { lieuDe } from '../core/vue.ts';
import { Ecran } from '../ui/parts.tsx';

export function Saisie() {
  const { etat } = useRecon();
  const lieu = lieuDe(useSearchParams()[0].get('lieu'));
  const traiter = useTraiter(lieu);
  const [valeur, setValeur] = useState('');
  const valider = (e: FormEvent) => { e.preventDefault(); if (valeur.trim()) traiter(valeur.trim()); };
  return <Ecran titre="Saisie manuelle">
    <form className="carte formulaire" onSubmit={valider}>
      <label className="champ"><span>{etat.appairage ? 'Identifiant ORION, numéro de série ou code' : 'Lien d’appairage'}</span>
        <input autoFocus required value={valeur} onChange={(e) => setValeur(e.target.value)} autoComplete="off" autoCapitalize={etat.appairage ? 'characters' : 'off'} spellCheck={false} />
      </label>
      <button className="bouton bouton--principal" type="submit">Rechercher</button>
    </form>
  </Ecran>;
}
