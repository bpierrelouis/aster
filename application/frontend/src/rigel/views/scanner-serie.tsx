/* Lecture d'un numéro de série (OCR) dans le scanner : bande de cadrage, lecture sur appui, puis matériels
   correspondants aux confusions courantes près. Le texte reste corrigeable : la lecture ne valide jamais seule. */
import { useState } from 'react';
import { useNavigate } from 'react-router';
import type { FormEvent, RefObject } from 'react';
import { Icon } from '../../espace/ui/icons.tsx';
import { lireTexte } from '../core/ocr.ts';
import { parametreDe } from '../core/vue.ts';
import { TypeMateriel } from '../ui/parts.tsx';
import { rapprocherSerie, serieLue } from '#shared/rigel.ts';
import type { Lieu, MaterielVu } from '../core/vue.ts';

type Lecture = { etat: 'pret' } | { etat: 'lecture' } | { etat: 'erreur' } | { etat: 'lu'; candidats: MaterielVu[] };

export function LectureSerie({ video, lieu, materiels, traiter }: { video: RefObject<HTMLVideoElement | null>; lieu: Lieu; materiels: MaterielVu[]; traiter: (valeur: string, serie?: string) => boolean }) {
  const navigate = useNavigate();
  const [lecture, setLecture] = useState<Lecture>({ etat: 'pret' });
  const [texte, setTexte] = useState('');

  async function lire() {
    if (!video.current) return;
    setLecture({ etat: 'lecture' });
    try {
      const brut = await lireTexte(video.current);
      const candidats = rapprocherSerie(brut, materiels) as MaterielVu[];
      setTexte(serieLue(brut));
      setLecture({ etat: 'lu', candidats });
    } catch { setLecture({ etat: 'erreur' }); }
  }

  const ouvrir = (m: MaterielVu) => navigate(`/materiels/${encodeURIComponent(m.id)}${lieu === undefined ? '' : `?lieu=${encodeURIComponent(parametreDe(lieu))}`}`, { state: { code: m.serie } });
  const rechercher = (e: FormEvent) => { e.preventDefault(); if (texte.trim()) traiter(texte.trim(), texte.trim()); };

  return <>
    <div className="cadrage" aria-hidden="true"><span /></div>
    <div className="feuille" role="region" aria-label="Numéro de série">
      {lecture.etat === 'lu'
        ? <>
          {lecture.candidats.length > 0 && <ul className="liste" aria-label="Matériels correspondants">
            {lecture.candidats.map((m) => <li key={m.id}><button className="ligne" type="button" onClick={() => ouvrir(m)}>
              <TypeMateriel type={m.type} />
              <span className="ligne-texte"><strong>{m.serie}</strong><small>{m.idOrion} · {m.modele}</small></span>
              <Icon name="chevR" size={18} />
            </button></li>)}
          </ul>}
          <form className="formulaire" onSubmit={rechercher}>
            <label className="champ"><span>{lecture.candidats.length ? 'Ou corrigez le numéro lu' : 'Numéro lu, à vérifier'}</span>
              <input value={texte} onChange={(e) => setTexte(e.target.value.toUpperCase())} autoComplete="off" autoCapitalize="characters" spellCheck={false} />
            </label>
            <div className="rangee">
              <button className="bouton" type="button" onClick={() => setLecture({ etat: 'pret' })}>Relire</button>
              <button className="bouton bouton--principal" type="submit" disabled={!texte.trim()}>Rechercher</button>
            </div>
          </form>
        </>
        : <>
          <p>{lecture.etat === 'erreur' ? 'Lecture impossible. Rapprochez le téléphone et réessayez.' : 'Placez le numéro de série dans le cadre.'}</p>
          <button className="bouton bouton--principal" type="button" disabled={lecture.etat === 'lecture'} onClick={() => void lire()}>
            {lecture.etat === 'lecture' ? 'Lecture…' : 'Lire le numéro'}
          </button>
        </>}
    </div>
  </>;
}
