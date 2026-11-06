import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Building2, CircleCheck, LogOut, ShieldCheck } from 'lucide-react';
import './styles.css';

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

function Login({ unavailable }) {
  const error = new URLSearchParams(window.location.search).get('error');
  return <main className="login-page">
    <div className="login-action">
      <a className="mindef-button" href="/auth/login">
        <MinDefSymbol />
        <span>S'identifier avec<br /><strong>MinDefConnect</strong></span>
      </a>
    </div>
    {(error || unavailable) && <p className="login-error" role="alert">{unavailable ? 'La connexion est momentanément indisponible. Veuillez réessayer dans quelques instants.' : error === 'session' ? 'La demande de connexion a expiré. Veuillez recommencer.' : 'La connexion a échoué. Veuillez réessayer ou contacter votre administrateur.'}</p>}
  </main>;
}

function Home({ user }) {
  useEffect(() => { document.title = 'Accueil — ASTER'; }, []);
  return <div className="app-shell">
    <header className="app-header">
      <a className="brand" href="/" aria-label="ASTER, accueil"><span className="brand-mark"><ShieldCheck size={24} /></span>ASTER</a>
      <form action="/auth/logout" method="post"><button className="logout" type="submit"><LogOut size={17} />Se déconnecter</button></form>
    </header>
    <main className="home">
      <p className="eyebrow">ADMINISTRATION · SUPERVISION · TRAÇABILITÉ</p>
      <h1>Bienvenue, {user.name}.</h1>
      <p className="home-intro">Votre espace ASTER est prêt.</p>
      <section className="identity-card" aria-labelledby="profile-title">
        <div className="identity-top"><span className="identity-icon"><ShieldCheck size={28} /></span><span className="connected"><CircleCheck size={15} />Connecté</span></div>
        <h2 id="profile-title">{user.profile}</h2>
        <p className="identity-email">{user.email}</p>
        <div className="scope"><Building2 size={19} /><span>{user.scope}</span></div>
      </section>
    </main>
    <footer className="app-footer">ASTER</footer>
  </div>;
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
  if (state.loading) return <main className="loading" role="status">Chargement de votre espace…</main>;
  return state.user ? <Home user={state.user} /> : <Login unavailable={state.unavailable} />;
}

createRoot(document.getElementById('root')).render(<App />);
