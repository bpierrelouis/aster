import { lazy, Suspense, useEffect, useState } from 'react';
import { Login, Loading } from './connexion/login.tsx';

// Espace de travail chargé seulement après la connexion : ses données exigent une session.
const Workspace = lazy(() => import('./espace/espace.tsx'));

/** Session : page de connexion, ou espace de travail du compte connecté. */
export function App() {
  // user : compte connecté (/api/me), seule sa présence est lue ici
  const [state, setState] = useState<{ loading: boolean; user: unknown; unavailable: boolean }>({ loading: true, user: null, unavailable: false });
  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/me', { signal: controller.signal }).then(async (response) => {
      if (response.status === 401) return { user: null };
      if (!response.ok) throw new Error('Serveur indisponible');
      return response.json();
    }).then(({ user }) => setState({ loading: false, user, unavailable: false }))
      .catch((error) => { if (error.name !== 'AbortError') setState({ loading: false, user: null, unavailable: true }); });
    return () => controller.abort();
  }, []);
  if (state.loading) return <Loading label="Chargement…" />;
  if (!state.user) return <Login unavailable={state.unavailable} />;
  const opening = <Loading label="Ouverture de votre espace…" />;
  return <Suspense fallback={opening}><Workspace loading={opening} /></Suspense>;
}
