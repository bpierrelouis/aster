/* Salle (ou stock) : avancement, puis « Faire l'inventaire » (scanner) et « Voir l'inventaire » (liste) */
import { Link, Navigate, useParams } from 'react-router';
import { Icon } from '../../workspace/ui/icons.tsx';
import { useRecon } from '../hooks/use-recon.ts';
import { lieuDe, nomLieu, parametreDe } from '../core/vue.ts';
import { Avancement, Ecran } from '../ui/parts.tsx';

export function Salle() {
  const { vue } = useRecon();
  const lieu = lieuDe(useParams().id);
  if (lieu === undefined || (lieu !== null && !vue.salle.has(lieu))) return <Navigate to="/explorer" replace />;
  const salle = lieu === null ? null : vue.salle.get(lieu)!;
  const a = vue.avancement(lieu);
  const p = parametreDe(lieu);
  return <Ecran titre={nomLieu(vue, lieu)} retour="/explorer">
    <section className="carte salle">
      <p className="surtitre">{salle ? `Bâtiment ${salle.batiment}${salle.etage != null ? ` · ${salle.etage === 0 ? 'rez-de-chaussée' : `étage ${salle.etage}`}` : ''}` : 'Matériels sans salle'}</p>
      <Avancement vus={a.vus} attendus={a.attendus.length} />
    </section>
    <nav className="actions" aria-label="Inventaire">
      <Link className="action action--principale" to={`/scanner?lieu=${encodeURIComponent(p)}`}>
        <Icon name="recherche" size={30} /><span><strong>Faire l’inventaire</strong><small>Scanner les matériels présents</small></span>
      </Link>
      <Link className="action" to={`/salles/${encodeURIComponent(p)}/inventaire`}>
        <Icon name="list" size={30} /><span><strong>Voir l’inventaire</strong><small>Matériels déclarés</small></span>
      </Link>
    </nav>
  </Ecran>;
}
