/* Scanner plein écran, caméra arrière : codes (QR, Data Matrix, codes-barres) en continu, ou numéro de série
   par reconnaissance de caractères. Dans l'inventaire d'un lieu, les matériels sont constatés dans ce lieu. */
import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router';
import { Icon } from '../../workspace/ui/icons.tsx';
import { lireCodes } from '../core/lecteur.ts';
import { recon } from '../core/etat.ts';
import { choisirCode, lireEtiquette } from '#shared/recon.ts';
import { useRecon, useTitre } from '../hooks/use-recon.ts';
import { useTraiter } from '../hooks/use-traiter.ts';
import { lieuDe, nomLieu, parametreDe } from '../core/vue.ts';
import { Annonce } from '../ui/parts.tsx';
import { LectureSerie } from './scanner-serie.tsx';

/** Délai pendant lequel un code déjà traité doit avoir quitté l'objectif avant d'être accepté à nouveau */
const LIBERATION = 1500;
const INTERVALLE = 150;
/** Clé d'un code déjà traité : numéro de série d'une étiquette structurée, sinon le code (l'écran suivant ne connaît que le numéro) */
const cle = (valeur: string) => lireEtiquette(valeur)?.serie ?? valeur;

export function Scanner() {
  useTitre('Scanner');
  const { vue, etat } = useRecon();
  const navigate = useNavigate();
  const lieu = lieuDe(useSearchParams()[0].get('lieu'));
  const traiter = useTraiter(lieu);
  const ignorer = (useLocation().state as { ignorer?: string } | null)?.ignorer;
  const ignore = useRef<{ valeur: string; vuLe: number } | null>(ignorer ? { valeur: cle(ignorer), vuLe: Date.now() } : null);
  const video = useRef<HTMLVideoElement>(null);
  const [camera, setCamera] = useState<'ouverture' | 'active' | 'erreur'>('ouverture');
  const [erreur, setErreur] = useState('');
  const [essai, setEssai] = useState(0);
  const [mode, setMode] = useState<'code' | 'serie'>('code');
  const traiterRef = useRef(traiter);
  traiterRef.current = traiter;

  // Caméra : ouverte dès l'arrivée sur l'écran, libérée en le quittant
  useEffect(() => {
    let flux: MediaStream | null = null;
    let fini = false;
    setCamera('ouverture');
    navigator.mediaDevices?.getUserMedia({ audio: false, video: { facingMode: { ideal: 'environment' }, width: { ideal: 1920 }, height: { ideal: 1080 } } })
      .then(async (f) => {
        flux = f;
        if (fini || !video.current) return f.getTracks().forEach((t) => t.stop());
        video.current.srcObject = f;
        await video.current.play();
        setCamera('active');
      })
      .catch((e: Error) => {
        if (fini) return;
        setErreur(e?.name === 'NotAllowedError' ? 'Accès à la caméra refusé. Autorisez-le dans les réglages du navigateur.' : 'Caméra indisponible sur cet appareil.');
        setCamera('erreur');
      });
    if (!navigator.mediaDevices) { setErreur('Caméra indisponible : ouvrez l’application en HTTPS.'); setCamera('erreur'); }
    return () => { fini = true; flux?.getTracks().forEach((t) => t.stop()); };
  }, [essai]);

  // Lecture continue des codes, un code à la fois
  useEffect(() => {
    if (camera !== 'active' || mode !== 'code') return;
    let actif = true;
    let minuterie = 0;
    const boucle = async () => {
      if (!actif || !video.current) return;
      try {
        const codes = video.current.readyState >= 2 ? await lireCodes(video.current) : [];
        const valeur = choisirCode(codes, recon.etat.instantane ?? { salles: [], materiels: [] });
        const maintenant = Date.now();
        const ignore_ = ignore.current;
        if (ignore_ && maintenant - ignore_.vuLe > LIBERATION) ignore.current = null;
        if (valeur && actif) {
          if (ignore.current?.valeur === cle(valeur)) ignore.current.vuLe = maintenant; // encore devant l'objectif
          else {
            ignore.current = { valeur: cle(valeur), vuLe: maintenant };
            if (navigator.vibrate) navigator.vibrate(30);
            if (traiterRef.current(valeur)) return;
          }
        }
      } catch { /* image illisible : nouvel essai */ }
      if (actif) minuterie = window.setTimeout(boucle, INTERVALLE);
    };
    void boucle();
    return () => { actif = false; clearTimeout(minuterie); };
  }, [camera, mode]);

  const fermer = () => navigate(lieu === undefined ? '/' : `/salles/${encodeURIComponent(parametreDe(lieu))}`, { replace: true });

  return <section className="scanner" aria-label={lieu === undefined ? 'Scanner une salle ou un matériel' : `Inventaire · ${nomLieu(vue, lieu)}`}>
    <video ref={video} muted playsInline aria-label="Aperçu de la caméra" />
    <header className="scanner-haut">
      <button className="scanner-fermer" type="button" onClick={fermer}><Icon name="close" size={20} />Fermer</button>
      {lieu !== undefined && <span className="scanner-lieu">{nomLieu(vue, lieu)}</span>}
    </header>
    {camera !== 'active' && <div className="scanner-etat" role="status">
      {camera === 'erreur'
        ? <><p>{erreur}</p><button className="bouton bouton--principal" type="button" onClick={() => setEssai((n) => n + 1)}>Réessayer</button><button className="bouton" type="button" onClick={fermer}>Retour</button></>
        : <p>Ouverture de la caméra…</p>}
    </div>}
    {camera === 'active' && mode === 'serie' && <LectureSerie video={video} lieu={lieu} materiels={vue.materiels} traiter={traiter} />}
    {camera === 'active' && etat.appairage && <footer className="scanner-bas">
      <button className="scanner-mode" type="button" aria-pressed={mode === 'serie'} onClick={() => setMode(mode === 'code' ? 'serie' : 'code')}>
        <Icon name={mode === 'code' ? 'pencil' : 'recherche'} size={20} />{mode === 'code' ? 'Numéro de série' : 'Codes'}
      </button>
    </footer>}
    <Annonce />
  </section>;
}
