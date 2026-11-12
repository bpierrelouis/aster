import { MinDefSymbol, OrionLogo, OrionMark, OrionStar } from './brand.jsx';

const ERRORS = {
  session: 'La demande de connexion a expiré. Veuillez recommencer.',
  compte: 'Votre identité est reconnue, mais aucun compte Orion actif ne lui est associé. Contactez votre administrateur.',
};

/** Page de connexion : accès par MindefConnect et message d'échec éventuel. */
export function Login({ unavailable }) {
  const error = new URLSearchParams(window.location.search).get('error');
  const message = unavailable ? 'La connexion est momentanément indisponible. Veuillez réessayer dans quelques instants.'
    : error ? ERRORS[error] ?? 'La connexion a échoué. Veuillez réessayer ou contacter votre administrateur.' : null;
  return <div className="public welcome">
    <OrionStar className="welcome-watermark" />
    <main className="welcome-main">
      <h1 className="welcome-title"><OrionLogo animated /></h1>
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

/** Page d'attente : chargement de la session ou de l'espace. */
export function Loading({ label }) {
  return <main className="public loading" role="status"><OrionMark className="loading-mark" />{label}</main>;
}
