/* ==========================================================================
   ORION · espace de travail (chargé après la connexion)
   ========================================================================== */

import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { Navigate, Route, Routes, useParams } from 'react-router';
import './styles/tokens.css';
import './styles/glass.css';
import './styles/base.css';
import './styles/shell.css';
import './styles/dashboard.css';
import './styles/widgets.css';
import './styles/diagrams.css';
import './styles/salles.css';
import './styles/remontees.css';
import './styles/overlays.css';
import './styles/inventaire.css';
import './styles/operations.css';
import './styles/chart-finish.css';
import { store, ready } from './core/store.ts';
import type { RequestError } from './core/store.ts';
import { initGlass } from './core/glass.ts';
import { applyAmbiance } from './core/theme.ts';
import { initTooltips } from './ui/tooltips.ts';
import { OverlayHost, notify } from './ui/overlays.tsx';
import { Shell } from './views/shell/shell.tsx';
import { Dashboard } from './views/dashboard/dashboard.tsx';
import { Salles } from './views/salles/salles.tsx';
import { Remontees } from './views/remontees/remontees.tsx';
import { Inventaire } from './views/inventaire/inventaire.tsx';
import { Supervision } from './views/supervision/supervision.tsx';
import { Administration } from './views/administration/administration.tsx';
import { Notifications } from './views/notifications/notifications.tsx';
import { Deplacements } from './views/salles/salles-deplacements.tsx';

declare global {
  interface Window { orion: { store: typeof store } }
}

window.orion = { store };

/* Un tableau de bord par onglet : changer d'onglet remonte l'écran */
function DashboardRoute() {
  const { board = 'perso' } = useParams();
  return <Dashboard key={board} />;
}

export default function Workspace({ loading }: { loading: ReactNode }) {
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');

  useEffect(() => {
    ready.then(() => {
      applyAmbiance(store.state.prefs.ambiance, store.state.prefs.tone, store.state.prefs.accent);
      initGlass(store.state.prefs.glass);
      initTooltips();
      setStatus('ready');
    }, (error: RequestError) => { if (error.status !== 401) setStatus('error'); }); // 401 : redirection vers la connexion en cours
    const onSaveError = (event: WindowEventMap['orion:save-error']) => notify((typeof event.detail === 'string' ? event.detail : event.detail?.message) || 'Enregistrement impossible. Veuillez réessayer.', { tone: 'warn', icon: 'alertes' });
    addEventListener('orion:save-error', onSaveError);
    return () => removeEventListener('orion:save-error', onSaveError);
  }, []);

  if (status === 'loading') return loading;
  if (status === 'error') {
    return <main className="public loading" role="status">
      <p>Votre espace est momentanément indisponible.</p>
      <button type="button" onClick={() => location.reload()}>Réessayer</button>
    </main>;
  }
  return <>
    <Routes>
      <Route element={<Shell />}>
        <Route path="accueil" element={<DashboardRoute />} />
        <Route path="accueil/:board" element={<DashboardRoute />} />
        <Route path="salles" element={<Salles />} />
        <Route path="salles/deplacements" element={<Deplacements />} />
        <Route path="salles/:mode" element={<Salles />} />
        <Route path="salles/:mode/:id" element={<Salles />} />
        <Route path="remontees" element={<Remontees />} />
        <Route path="remontees/:tab" element={<Remontees />} />
        <Route path="remontees/:tab/:id" element={<Remontees />} />
        <Route path="materiels/affectation" element={<Navigate to="/materiels/inventaire" replace />} />
        <Route path="materiels/:tab" element={<Inventaire />} />
        <Route path="supervision/:tab" element={<Supervision />} />
        <Route path="administration/:tab" element={<Administration />} />
        <Route path="administration/:tab/:id" element={<Administration />} />
        <Route path="notifications" element={<Notifications />} />
      </Route>
      <Route path="*" element={<Navigate to="/accueil" replace />} />
    </Routes>
    <OverlayHost />
  </>;
}
