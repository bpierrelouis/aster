<#-- Deuxième étape de la connexion : mot de passe du compte dont l'adresse vient d'être saisie. Le mot de passe tapé
     sur la première page y est repris et envoyé de lui-même (login.js) : l'utilisateur ne voit qu'une page. -->
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
      <form action="${url.loginAction}" method="post" id="password-form">
        <#if message?has_content && message.type = 'error'>
          <p class="error" role="alert">${kcSanitize(message.summary)?no_esc}</p>
        </#if>
        <label for="compte">email</label>
        <input id="compte" type="text" value="${(auth.attemptedUsername!'')}" readonly>
        <label for="password">Mot de passe</label>
        <input id="password" name="password" type="password" autocomplete="current-password" placeholder="Veuillez indiquer votre mot de passe." required autofocus <#if messagesPerField.existsError('password')>aria-invalid="true"</#if>>
        <label class="show-password"><input id="show-password" type="checkbox">Afficher</label>
        <a class="text-button" href="${url.loginRestartFlowUrl}">Changer d’adresse</a>
        <button class="submit-button" id="login-button" type="submit">Se connecter</button>
      </form>
    </section>
  </main>
</body>
</html>
