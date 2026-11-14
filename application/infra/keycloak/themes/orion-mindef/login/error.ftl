<#-- Page d'erreur au style de la page de connexion. Cas particulier : session Keycloak déjà ouverte avec un autre compte
     (retour arrière vers une page de connexion déjà utilisée, deux onglets). Le lien ferme cette session puis relance
     la connexion à ORION ; le script le suit de lui-même quand un compte vient d'être choisi (login.js). -->
<#assign autreCompte = message?? && message.summary?starts_with(msg("orionAutreCompte"))>
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
      <#if autreCompte>
        <h2>${msg("orionChangerCompte")}</h2>
        <p class="notice" role="status">${message.summary}</p>
        <a class="submit-button link-button" id="changer-compte" href="${url.loginUrl?keep_before('/realms/')}/realms/${realm.name}/protocol/openid-connect/logout?client_id=${((client.clientId)!'orion-web')?url('UTF-8')}&post_logout_redirect_uri=${(properties.appUrl + '/auth/login')?url('UTF-8')}">${msg("orionChangerCompte")}</a>
      <#else>
        <h2>${msg("errorTitle")}</h2>
        <#if message?has_content><p class="error" role="alert">${kcSanitize(message.summary)?no_esc}</p></#if>
        <#if !skipLink?? && client?? && client.baseUrl?has_content>
          <a class="create-button link-button" href="${client.baseUrl}">${msg("backToApplication")}</a>
        </#if>
      </#if>
    </section>
  </main>
</body>
</html>
