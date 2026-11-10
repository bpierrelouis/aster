import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import { App } from './app.jsx';
import './connexion/connexion.css';

createRoot(document.getElementById('root')).render(<BrowserRouter><App /></BrowserRouter>);
