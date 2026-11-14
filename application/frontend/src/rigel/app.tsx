/* Application de recensement : un écran par adresse ; sans appairage, seuls l'accueil (appairage), le scanner
   et la saisie manuelle sont accessibles. */
import { Navigate, Route, Routes } from 'react-router';
import type { ReactNode } from 'react';
import { OrionMark } from '../connexion/brand.tsx';
import { useRigel } from './hooks/use-rigel.ts';
import { Accueil } from './views/accueil.tsx';
import { Explorer } from './views/explorer.tsx';
import { Salle } from './views/salle.tsx';
import { Inventaire } from './views/inventaire.tsx';
import { Materiel } from './views/materiel.tsx';
import { Inconnu } from './views/inconnu.tsx';
import { Saisie } from './views/saisie.tsx';
import { Scanner } from './views/scanner.tsx';
import { Synchronisation } from './views/synchronisation.tsx';
import { Remplacer } from './views/remplacer.tsx';

export function App() {
  const { etat } = useRigel();
  if (!etat.pret) return <main className="chargement" role="status"><OrionMark size={56} /><p>Chargement…</p></main>;
  if (etat.proposition) return <Remplacer />;
  const appaire = (element: ReactNode) => (etat.appairage ? element : <Navigate to="/" replace />);
  return <Routes>
    <Route path="/" element={<Accueil />} />
    <Route path="/scanner" element={<Scanner />} />
    <Route path="/saisie" element={<Saisie />} />
    <Route path="/explorer" element={appaire(<Explorer />)} />
    <Route path="/salles/:id" element={appaire(<Salle />)} />
    <Route path="/salles/:id/inventaire" element={appaire(<Inventaire />)} />
    <Route path="/materiels/:id" element={appaire(<Materiel />)} />
    <Route path="/inconnu" element={appaire(<Inconnu />)} />
    <Route path="/synchronisation" element={appaire(<Synchronisation />)} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>;
}
