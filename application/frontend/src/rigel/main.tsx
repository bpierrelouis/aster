import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import { App } from './app.tsx';
import { demarrer } from './core/etat.ts';
import '../connexion/connexion.css';
import './styles/rigel.css';

createRoot(document.getElementById('root')!).render(<BrowserRouter><App /></BrowserRouter>);
void demarrer();

// Service worker : application et ressources de lecture disponibles hors ligne (build uniquement)
if (import.meta.env.PROD && 'serviceWorker' in navigator) addEventListener('load', () => { void navigator.serviceWorker.register('/sw.js'); });
