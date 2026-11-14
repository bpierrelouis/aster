<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>MindefConnect — Connexion</title>
  <link rel="stylesheet" href="${url.resourcesPath}/css/login.css">
  <script defer src="${url.resourcesPath}/js/login.js"></script>
</head>
<body>
  <main>
    <section class="login-panel" aria-label="Connexion MindefConnect">
      <h1>MindefConnect</h1>
      <h2>Se connecter avec son compte</h2>
      <form action="${url.loginAction}" method="post" id="login-form">
        <#if message?has_content && message.type = 'error'>
          <p class="error" role="alert">${kcSanitize(message.summary)?no_esc}</p>
        </#if>
        <label for="username">email</label>
        <input id="username" name="username" type="text" autocomplete="username" value="${(login.username!'')}" placeholder="Veuillez entrer votre adresse courriel personnelle." required autofocus <#if messagesPerField.existsError('username')>aria-invalid="true"</#if>>
        <label for="password">Mot de passe</label>
        <input id="password" type="password" autocomplete="off" placeholder="Veuillez indiquer votre mot de passe." readonly>
        <label class="show-password"><input id="show-password" type="checkbox">Afficher</label>
        <button class="text-button" type="button" data-help="password">Mot de passe oublié?</button>
        <button class="submit-button" id="login-button" type="submit">Se connecter</button>
      </form>
      <div class="separator"><span>Ou</span></div>
      <h2 class="no-account">Vous n’avez pas de compte ?</h2>
      <button class="create-button" type="button" data-help="register">Créer un compte</button>
    </section>
    <#-- Démonstrateur uniquement (présentation au client) : retiré pour la mise en production -->
    <#if properties.comptesPresentation?? && properties.comptesPresentation == "true">
      <section class="demo-access" aria-labelledby="demo-access-title">
        <p class="demo-access-title" id="demo-access-title">Accès de présentation</p>
        <div class="demo-access-tokens">
          <button type="button" class="demo-token" data-compte="julien.mercier@outlook.fr" title="julien.mercier@outlook.fr"><span class="demo-token-badge"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z"/><path d="m9 12 2 2 4-4"/></svg></span><span>Administrateur</span></button>
          <button type="button" class="demo-token" data-compte="sophie.garnier@yahoo.fr" title="sophie.garnier@yahoo.fr"><span class="demo-token-badge"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect width="14" height="18" x="5" y="4" rx="2"/><rect width="8" height="4" x="8" y="2" rx="1"/><path d="M9 12h6M9 16h6"/></svg></span><span>Gestionnaire</span></button>
          <button type="button" class="demo-token" data-compte="thomas.lefebvre@hotmail.fr" title="thomas.lefebvre@hotmail.fr"><span class="demo-token-badge"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m2 10 10-5 10 5-10 5-10-5ZM6 12v5c3 3 9 3 12 0v-5M22 10v6"/></svg></span><span>Formateur</span></button>
        </div>
      </section>
    </#if>
  </main>
  <dialog id="help-dialog" aria-labelledby="help-title">
    <h2 id="help-title">Aide à la connexion</h2>
    <p id="help-message"></p>
    <form method="dialog"><button class="create-button">Fermer</button></form>
  </dialog>
</body>
</html>
