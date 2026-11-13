import { useNavigate } from 'react-router';
import { annoncer, proposer, recon } from '../core/etat.ts';
import { parametreDe } from '../core/vue.ts';
import { resoudre } from '#shared/recon.ts';
import type { Lieu } from '../core/vue.ts';

/**
 * Traitement d'une valeur lue ou saisie, dans le contexte d'un lieu (inventaire d'une salle ou du stock) :
 * appairage, salle, stock, matériel ou code inconnu. Renvoie false si la valeur n'a pas pu être traitée.
 */
export function useTraiter(lieu: Lieu) {
  const navigate = useNavigate();
  const contexte = lieu === undefined ? '' : `lieu=${encodeURIComponent(parametreDe(lieu))}`;
  return (valeur: string, serie?: string) => {
    const { instantane, appairage } = recon.etat;
    const cible = resoudre(valeur, instantane ?? { salles: [], materiels: [] });
    if (cible.type === 'appairage') { void proposer(cible.appairage); navigate('/'); return true; }
    if (!appairage) { annoncer('Scannez d’abord le QR d’appairage affiché dans ORION.', 'install'); return false; }
    if (!instantane) { annoncer('Campagne en cours de chargement : réessayez dans un instant.', 'install'); return false; }
    if (cible.type === 'salle') navigate(`/salles/${encodeURIComponent(cible.salle.id)}`);
    else if (cible.type === 'stock') navigate('/salles/stock');
    else if (cible.type === 'materiel') navigate(`/materiels/${encodeURIComponent(cible.materiel.id)}${contexte && `?${contexte}`}`, { state: { code: valeur } });
    else navigate(`/inconnu?${new URLSearchParams({ code: cible.code, ...(serie && { serie }), ...(lieu !== undefined && { lieu: parametreDe(lieu) }) })}`);
    return true;
  };
}
