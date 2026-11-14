/* Nouvel appairage lu pendant qu'une autre campagne est en cours : confirmation du remplacement */
import { appairer, ecarterProposition } from '../core/etat.ts';
import { useRigel } from '../hooks/use-rigel.ts';
import { Ecran } from '../ui/parts.tsx';
import { plural } from '#shared/format.ts';

export function Remplacer() {
  const { etat } = useRigel();
  const attente = etat.file.length;
  return <Ecran titre="Nouvel appairage" retour={false}>
    <section className="carte">
      <p>Ce téléphone est associé à <strong>{etat.instantane?.campagne.nom ?? 'en cours'}</strong>. Le remplacer par le nouvel appairage efface ses données locales.</p>
      {attente > 0 && <p className="alerte" role="alert">{plural(attente, 'constat')} pas encore intégré{attente > 1 ? 's' : ''} par ORION sera perdu{attente > 1 ? 's' : ''}.</p>}
    </section>
    <div className="pile">
      <button className="bouton bouton--principal" type="button" onClick={() => void appairer(etat.proposition!)}>Remplacer</button>
      <button className="bouton" type="button" onClick={ecarterProposition}>Garder l’appairage actuel</button>
    </div>
  </Ecran>;
}
