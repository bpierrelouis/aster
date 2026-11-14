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
  </main>
  <#-- Démonstrateur uniquement (présentation au client) : tableau des comptes en marge, retiré pour la mise en production -->
  <#if properties.comptesPresentation?? && properties.comptesPresentation == "true">
    <#assign comptes = [
      {"adresse": "camille.rousseau@gmail.com", "profil": "Super administrateur", "ecole": "Toutes"},
      {"adresse": "julien.mercier@outlook.fr", "profil": "Administrateur", "ecole": "Numérique"},
      {"adresse": "sophie.garnier@yahoo.fr", "profil": "Gestionnaire", "ecole": "Numérique"},
      {"adresse": "thomas.lefebvre@hotmail.fr", "profil": "Formateur", "ecole": "Numérique"},
      {"adresse": "nadia.benali@orange.fr", "profil": "Formateur", "ecole": "Numérique"},
      {"adresse": "hugo.fontaine@free.fr", "profil": "Formateur", "ecole": "Numérique"},
      {"adresse": "lea.chevalier@laposte.net", "profil": "Formateur", "ecole": "Numérique"},
      {"adresse": "antoine.girard@gmail.com", "profil": "Administrateur", "ecole": "Réseaux"},
      {"adresse": "manon.faure@outlook.com", "profil": "Gestionnaire", "ecole": "Réseaux"},
      {"adresse": "kevin.morel@yahoo.com", "profil": "Formateur", "ecole": "Réseaux"}
    ]>
    <aside class="demo-accounts" aria-labelledby="demo-accounts-title">
      <table>
        <caption id="demo-accounts-title">Comptes</caption>
        <thead><tr><th scope="col">Adresse</th><th scope="col">Profil</th><th scope="col">École</th><th scope="col"><span class="visually-hidden">Connexion</span></th></tr></thead>
        <tbody>
          <#list comptes as c>
            <tr><td>${c.adresse?keep_before("@")}<wbr>@${c.adresse?keep_after("@")}</td><td>${c.profil}</td><td>${c.ecole}</td><td><button type="button" class="demo-account-go" data-compte="${c.adresse}" aria-label="Se connecter avec ${c.adresse}" title="Se connecter"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M5 12h14M13 6l6 6-6 6"/></svg></button></td></tr>
          </#list>
        </tbody>
      </table>
    </aside>
  </#if>
  <dialog id="help-dialog" aria-labelledby="help-title">
    <h2 id="help-title">Aide à la connexion</h2>
    <p id="help-message"></p>
    <form method="dialog"><button class="create-button">Fermer</button></form>
  </dialog>
</body>
</html>
