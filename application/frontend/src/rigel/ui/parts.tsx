/* Éléments d'affichage communs aux écrans de l'application de recensement */
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import type { CSSProperties, ReactNode } from 'react';
import { Icon } from '../../espace/ui/icons.tsx';
import { OrionMark } from '../../connexion/brand.tsx';
import { deviceType, logistique } from '#shared/catalog.ts';
import { num, plural } from '#shared/format.ts';
import { useRigel, useTitre } from '../hooks/use-rigel.ts';
import type { Etat, Ton } from '../core/etat.ts';
import type { MaterielRigel } from '#shared/rigel.ts';
import type { Mouvement } from '#shared/types.ts';

/** Marque : étoile ORION et nom de l'application */
export function Marque() {
  return <span className="marque"><OrionMark size={26} count={8} /><span>Recensement</span></span>;
}

/** Écran : en-tête (retour, titre), contenu ; retour : adresse, sinon page précédente */
export function Ecran({ titre, retour, children, className = '' }: { titre: string; retour?: string | false; children: ReactNode; className?: string }) {
  useTitre(titre);
  const navigate = useNavigate();
  return <div className={`ecran ${className}`.trim()}>
    <header className="entete">
      {retour !== false && (retour
        ? <Link className="entete-retour" to={retour} aria-label="Retour"><Icon name="chevL" size={22} /></Link>
        : <button className="entete-retour" type="button" onClick={() => navigate(-1)} aria-label="Retour"><Icon name="chevL" size={22} /></button>)}
      <h1>{titre}</h1>
    </header>
    <main className="contenu">{children}</main>
    <Annonce />
  </div>;
}

/** Pastille : état coloré accompagné d'une icône et d'un libellé */
export function Pastille({ ton, icone, children }: { ton: Ton | 'neutre'; icone?: string; children: ReactNode }) {
  return <span className={`pastille pastille--${ton}`}>{icone && <Icon name={icone} size={16} />}{children}</span>;
}

/** Tuile du type de matériel : icône sur la couleur du type */
export function TypeMateriel({ type }: { type: string }) {
  const t = deviceType(type);
  return <span className="type" style={{ '--c': t.color } as CSSProperties} title={t.label}><Icon name={t.icon} size={22} /></span>;
}

const EN_COURS: Mouvement = { de: null, at: 0, par: '', parId: null };
/** État logistique (stock, installé, en cours d'installation, à rapatrier) d'un matériel */
export const logistiqueDe = (m: Pick<MaterielRigel, 'salleId' | 'enCours'>) => logistique({ salleId: m.salleId, deplacement: m.enCours ? EN_COURS : undefined });

/** Barre d'avancement : matériels vus sur attendus */
export function Avancement({ vus, attendus }: { vus: number; attendus: number }) {
  const part = attendus ? vus / attendus : 0;
  return <span className="avancement" role="img" aria-label={`${plural(vus, 'matériel vu', 'matériels vus')} sur ${num(attendus)}`}>
    <span className="avancement-barre"><span style={{ width: `${Math.round(part * 100)}%` }} /></span>
    <span className="avancement-texte">{num(vus)}/{num(attendus)}</span>
  </span>;
}

/** État de la synchronisation, en un libellé */
export function etatSynchro(etat: Etat): { texte: string; ton: Ton | 'neutre'; icone: string } {
  const attente = etat.file.filter((c) => c.etat === 'attente').length;
  const transmis = etat.file.length - attente;
  const refuses = etat.historique.filter((c) => c.resultat === 'refuse').length;
  if (etat.reseau.refuse) return { texte: 'Accès retiré', ton: 'crit', icone: 'shieldX' };
  const suffixe = refuses ? ` · ${plural(refuses, 'refusé')}` : '';
  if (etat.reseau.erreur) return { texte: `${etat.reseau.erreur.replace(/\.$/, '')}${attente ? ` · ${plural(attente, 'constat')} en attente` : ''}${suffixe}`, ton: 'install', icone: 'noNetwork' };
  if (attente || transmis) return { texte: `${plural(attente + transmis, 'constat')} à intégrer${suffixe}`, ton: 'accent', icone: 'refresh' };
  if (!etat.reseau.synchroLe) return { texte: 'Synchronisation…', ton: 'neutre', icone: 'refresh' };
  return { texte: `À jour${suffixe}`, ton: refuses ? 'install' : 'ok', icone: 'checkCircle' };
}

/** Retour bref de la dernière action (lecteurs d'écran compris), effacé après quelques secondes */
export function Annonce() {
  const { etat } = useRigel();
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!etat.annonce) return;
    setVisible(true);
    const t = setTimeout(() => setVisible(false), 2600);
    return () => clearTimeout(t);
  }, [etat.annonce]);
  return <p className={`annonce annonce--${etat.annonce?.ton ?? 'ok'}`} role="status" data-visible={visible || undefined}>{visible ? etat.annonce?.texte : ''}</p>;
}
