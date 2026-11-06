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
  <main class="login-panel">
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
  </main>
  <dialog id="help-dialog" aria-labelledby="help-title">
    <h2 id="help-title">Aide à la connexion</h2>
    <p id="help-message"></p>
    <form method="dialog"><button class="create-button">Fermer</button></form>
  </dialog>
</body>
</html>
