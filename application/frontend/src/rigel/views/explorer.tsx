/* Explorer : salles de la campagne par bâtiment, avec leur avancement, et le stock */
import { Link } from 'react-router';
import { Icon } from '../../espace/ui/icons.tsx';
import { useRigel } from '../hooks/use-rigel.ts';
import { Avancement, Ecran } from '../ui/parts.tsx';
import type { SalleRigel } from '#shared/rigel.ts';

export function Explorer() {
  const { vue } = useRigel();
  const batiments = new Map<string, SalleRigel[]>();
  for (const s of vue.salles) (batiments.get(s.batiment) ?? batiments.set(s.batiment, []).get(s.batiment)!).push(s);
  const stock = vue.avancement(null);
  return <Ecran titre="Explorer" retour="/">
    <ul className="tuiles" aria-label="Stock">
      <li><Link className="tuile tuile--stock" to="/salles/stock">
        <span className="tuile-nom"><Icon name="stockage" size={20} />Stock</span>
        <Avancement vus={stock.vus} attendus={stock.attendus.length} />
      </Link></li>
    </ul>
    {[...batiments].map(([batiment, salles]) => <section key={batiment} className="groupe">
      <h2>Bâtiment {batiment}</h2>
      <ul className="tuiles">
        {salles.map((s) => {
          const a = vue.avancement(s.id);
          return <li key={s.id}><Link className="tuile" to={`/salles/${encodeURIComponent(s.id)}`} data-fini={a.attendus.length > 0 && a.vus === a.attendus.length || undefined}>
            <span className="tuile-nom">{s.nom}</span>
            <Avancement vus={a.vus} attendus={a.attendus.length} />
          </Link></li>;
        })}
      </ul>
    </section>)}
    {!vue.salles.length && <p className="vide">Aucune salle dans cette campagne.</p>}
  </Ecran>;
}
