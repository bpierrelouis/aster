<#-- Confirmation de déconnexion, au style de la page de connexion. Elle n'apparaît que pour une déconnexion demandée
     sans jeton d'identité : changement de compte depuis la page d'erreur (envoyée d'elle-même par login.js). -->
<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>MindefConnect — Déconnexion</title>
  <link rel="stylesheet" href="${url.resourcesPath}/css/login.css">
  <script defer src="${url.resourcesPath}/js/login.js"></script>
</head>
<body>
  <main>
    <section class="login-panel" aria-label="Déconnexion MindefConnect">
      <h1>MindefConnect</h1>
      <h2>${msg("orionDeconnexionQuestion")}</h2>
      <form action="${url.logoutConfirmAction}" method="post" id="logout-form">
        <input type="hidden" name="session_code" value="${logoutConfirm.code}">
        <input type="hidden" name="confirmLogout" value="true">
        <button class="submit-button" id="logout-button" type="submit">${msg("orionDeconnexion")}</button>
      </form>
    </section>
  </main>
</body>
</html>
