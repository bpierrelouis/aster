import { lazy, Suspense, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import './styles.css';

// Espace de travail chargé seulement après la connexion : ses données exigent une session.
const Workspace = lazy(() => import('../workspace/Workspace.jsx'));

function MinDefSymbol() {
  const points = [[30, 10], [70, 10], [92, 50], [70, 90], [30, 90], [8, 50]];
  return <svg className="mindef-symbol" viewBox="0 0 100 100" aria-hidden="true">
    <path d="M30 10H70L92 50 70 90H30L8 50Z" fill="none" stroke="#00a5e7" strokeWidth="3" />
    <circle cx="50" cy="50" r="29" fill="#46ad45" />
    {points.map(([cx, cy]) => <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="6" fill="#00a5e7" stroke="#000091" strokeWidth="2" />)}
    <path d="M48 47a10 10 0 1 1 8 8l-18 18-7-7 5-5 4 2 3-3-2-4Z" fill="#00a5e7" stroke="#000091" strokeWidth="3" strokeLinejoin="round" />
    <circle cx="57" cy="44" r="3" fill="#000091" />
  </svg>;
}

/** Fleur ASTER : seize pétales iris et un cœur doré, comme la signature de la charte. */
function AsterFlower({ className }) {
  return <svg className={className} viewBox="0 0 128 128" aria-hidden="true">
    {Array.from({ length: 16 }, (_, i) => <g key={i} transform={`rotate(${i * 22.5} 64 64)`}>
      <path className="petal" style={{ '--i': i }} fill={['#6954C0', '#8670CD', '#A28ADC'][i % 3]} d="M64 50 C56 41 53 17 62 9 C71 8 75 30 67 46 Q65 50 64 50Z" />
    </g>)}
    <circle className="flower-heart" cx="64" cy="64" r="11" fill="#E8B84E" />
  </svg>;
}

function Login({ unavailable }) {
  const error = new URLSearchParams(window.location.search).get('error');
  const message = unavailable ? 'La connexion est momentanément indisponible. Veuillez réessayer dans quelques instants.'
    : error === 'session' ? 'La demande de connexion a expiré. Veuillez recommencer.'
      : error === 'compte' ? 'Votre identité est reconnue, mais aucun compte ASTER actif ne lui est associé. Contactez votre administrateur.'
        : error ? 'La connexion a échoué. Veuillez réessayer ou contacter votre administrateur.' : null;
  return <div className="public welcome">
    <AsterFlower className="welcome-watermark" />
    <main className="welcome-main">
      <AsterFlower className="welcome-flower" />
      <h1 className="welcome-title">ASTER</h1>
      <p className="welcome-signature">Gestion · Administration · Supervision</p>
      <p className="welcome-lead">Le parc informatique de votre école, ses salles et ses postes, au même endroit.</p>
      <a className="mindef-button" href="/auth/login">
        <MinDefSymbol />
        <span>S'identifier avec<br /><strong>MinDefConnect</strong></span>
      </a>
      {message && <p className="login-error" role="alert">{message}</p>}
    </main>
    <footer className="welcome-footer">Besoin d’un accès ? Contactez l’administrateur de votre école.</footer>
  </div>;
}

function Loading({ label }) {
  return <main className="public loading" role="status"><AsterFlower className="loading-flower" />{label}</main>;
}

function App() {
  const [state, setState] = useState({ loading: true, user: null, unavailable: false });
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

createRoot(document.getElementById('root')).render(<BrowserRouter><App /></BrowserRouter>);
