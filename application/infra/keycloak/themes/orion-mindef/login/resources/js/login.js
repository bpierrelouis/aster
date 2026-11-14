// Script commun aux pages du thème (connexion, erreur, confirmation de déconnexion) : chaque bloc vérifie ses éléments.
const loginForm = document.getElementById('login-form');
const username = document.getElementById('username');

document.getElementById('show-password')?.addEventListener('change', (event) => {
  document.getElementById('password').type = event.target.checked ? 'text' : 'password';
});
for (const button of document.querySelectorAll('[data-help]')) {
  button.addEventListener('click', () => {
    document.getElementById('help-message').textContent = button.dataset.help === 'password'
      ? 'Pour obtenir de l’aide concernant votre accès, contactez votre administrateur.'
      : 'Pour demander un accès à Orion, contactez votre administrateur.';
    document.getElementById('help-dialog').showModal();
  });
}

/* Changement de compte. Une page de connexion déjà utilisée (retour arrière, autre onglet) envoie le formulaire alors que
   la session Keycloak est ouverte avec un autre compte : Keycloak refuse (page d'erreur). Le compte choisi est gardé le
   temps de fermer cette session (page d'erreur, puis confirmation de déconnexion) ; ORION relance la connexion et la page
   de connexion le reprend : envoyée d'elle-même pour un compte choisi par un jeton, sinon seulement préremplie (mot de passe). */
const CLE = 'orion.compte-choisi';
const lire = () => { try { return JSON.parse(sessionStorage.getItem(CLE)); } catch { return null; } };
const garder = (valeur) => { try { sessionStorage.setItem(CLE, JSON.stringify(valeur)); } catch { /* stockage indisponible */ } };
const oublier = () => { try { sessionStorage.removeItem(CLE); } catch { /* stockage indisponible */ } };
const recent = (choix) => choix && Date.now() - choix.at < 2 * 60 * 1000;

let presentation = false;
loginForm?.addEventListener('submit', () => {
  document.getElementById('login-button').disabled = true;
  garder({ compte: username.value, presentation, at: Date.now() });
});
// Démonstrateur (présentation au client) : un jeton « Accès de présentation » remplit l'adresse et lance la connexion
for (const token of document.querySelectorAll('[data-compte]')) {
  token.addEventListener('click', () => {
    username.value = token.dataset.compte;
    presentation = true;
    loginForm.requestSubmit();
  });
}

const choix = lire();
const changer = document.getElementById('changer-compte');
const deconnexion = document.getElementById('logout-form');
if (changer) {
  // Page d'erreur « session ouverte avec un autre compte » : un compte vient d'être choisi, on enchaîne (une seule fois)
  if (recent(choix) && !choix.relance) { garder({ ...choix, relance: true }); location.replace(changer.href); }
} else if (deconnexion) {
  if (recent(choix) && choix.relance) deconnexion.requestSubmit();
} else if (loginForm && recent(choix) && choix.relance && !document.querySelector('.error')) {
  // Session précédente fermée : la connexion reprend avec le compte choisi
  oublier();
  username.value = choix.compte;
  if (choix.presentation) {
    presentation = true;
    loginForm.requestSubmit();
  }
} else if (loginForm) {
  oublier();
}
