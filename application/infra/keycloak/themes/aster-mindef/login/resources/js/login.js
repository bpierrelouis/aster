document.getElementById('show-password').addEventListener('change', (event) => {
  document.getElementById('password').type = event.target.checked ? 'text' : 'password';
});
document.getElementById('login-form').addEventListener('submit', () => {
  document.getElementById('login-button').disabled = true;
});
for (const button of document.querySelectorAll('[data-help]')) {
  button.addEventListener('click', () => {
    document.getElementById('help-message').textContent = button.dataset.help === 'password'
      ? 'Pour obtenir de l’aide concernant votre accès, contactez votre administrateur.'
      : 'Pour demander un accès à ASTER, contactez votre administrateur.';
    document.getElementById('help-dialog').showModal();
  });
}
