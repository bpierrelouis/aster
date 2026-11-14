/* Accueil : appairage du téléphone, puis Scanner (salle ou matériel), Explorer et saisie manuelle */
import { Link } from 'react-router';
import { Icon } from '../../workspace/ui/icons.tsx';
import { useRigel, useTitre } from '../hooks/use-rigel.ts';
import { Annonce, Marque, Pastille, etatSynchro } from '../ui/parts.tsx';
import { dateShort } from '#shared/format.ts';

export function Accueil() {
  const { etat } = useRigel();
  useTitre(etat.appairage ? 'Accueil' : 'Appairage');
  if (!etat.appairage) return <Appairage />;
  const campagne = etat.instantane?.campagne;
  const synchro = etatSynchro(etat);
  return <div className="ecran ecran--accueil">
    <header className="accueil-entete"><Marque /></header>
    <main className="contenu">
      <section className="carte campagne" aria-label="Campagne">
        <p className="surtitre">{campagne ? `${campagne.mode === 'installation' ? 'Installation' : 'Recensement'} · ${campagne.ecole}` : 'Campagne RIGEL'}</p>
        <h1>{campagne?.nom ?? 'Chargement de la campagne…'}</h1>
        {campagne && <p className="discret">Jusqu’au {dateShort(campagne.expireLe)}</p>}
        <Link className="synchro" to="/synchronisation" aria-label={`Synchronisation : ${synchro.texte}`}>
          <Pastille ton={synchro.ton} icone={synchro.icone}>{synchro.texte}</Pastille>
          <Icon name="chevR" size={18} />
        </Link>
      </section>
      {etat.reseau.refuse && <p className="alerte" role="alert">{etat.reseau.erreur} <Link to="/synchronisation">Dissocier ce téléphone</Link></p>}
      <nav className="actions" aria-label="Actions">
        <Link className="action action--principale" to="/scanner">
          <Icon name="recherche" size={30} />
          <span><strong>Scanner</strong><small>Salle ou matériel</small></span>
        </Link>
        <Link className="action" to="/explorer">
          <Icon name="salles" size={30} />
          <span><strong>Explorer</strong><small>Salles et stock</small></span>
        </Link>
      </nav>
      <Link className="lien-discret" to="/saisie">Saisie manuelle</Link>
    </main>
    <Annonce />
  </div>;
}

/** Téléphone sans campagne : appairage par le QR affiché dans ORION */
function Appairage() {
  return <div className="ecran ecran--appairage">
    <main className="contenu appairage">
      <Marque />
      <section className="carte">
        <h1>Associer ce téléphone</h1>
        <p>Scannez le QR d’appairage affiché dans ORION, rubrique <strong>Matériels › Recensement</strong>.</p>
        <p className="discret">Les données de la campagne restent chiffrées : seul ce téléphone et ORION peuvent les lire.</p>
      </section>
      <Link className="action action--principale" to="/scanner">
        <Icon name="recherche" size={30} />
        <span><strong>Scanner</strong><small>QR d’appairage</small></span>
      </Link>
      <Link className="lien-discret" to="/saisie">Saisir le lien d’appairage</Link>
    </main>
    <Annonce />
  </div>;
}
