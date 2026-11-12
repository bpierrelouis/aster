/* ==========================================================================
   ASTER · espace de travail (chargé après la connexion)
   ========================================================================== */

import { useEffect, useState } from 'react';
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
import { store, ready } from './core/store.js';
import { initGlass } from './core/glass.js';
import { applyAmbiance } from './core/theme.js';
import { initTooltips } from './ui/tooltips.js';
import { OverlayHost, notify } from './ui/overlays.jsx';
import { Shell } from './views/shell/shell.jsx';
import { Dashboard } from './views/dashboard/dashboard.jsx';
import { Salles } from './views/salles/salles.jsx';
import { Remontees } from './views/remontees/remontees.jsx';
import { Inventaire } from './views/inventaire/inventaire.jsx';
import { Supervision } from './views/supervision/supervision.jsx';
import { Administration } from './views/administration/administration.jsx';
import { Notifications } from './views/notifications/notifications.jsx';
import { Deplacements } from './views/salles/salles-deplacements.jsx';

window.aster = { store };

/* Un tableau de bord par onglet : changer d'onglet remonte l'écran */
function DashboardRoute() {
  const { board = 'perso' } = useParams();
  return <Dashboard key={board} />;
}

export default function Workspace({ loading }) {
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    ready.then(() => {
      applyAmbiance(store.state.prefs.ambiance, store.state.prefs.tone, store.state.prefs.accent);
      initGlass(store.state.prefs.glass);
      initTooltips();
      setStatus('ready');
    }, (error) => { if (error.status !== 401) setStatus('error'); }); // 401 : redirection vers la connexion en cours
    const onSaveError = (event) => notify((typeof event.detail === 'string' ? event.detail : event.detail?.message) || 'Enregistrement impossible. Veuillez réessayer.', { tone: 'warn', icon: 'alertes' });
    addEventListener('aster:save-error', onSaveError);
    return () => removeEventListener('aster:save-error', onSaveError);
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
