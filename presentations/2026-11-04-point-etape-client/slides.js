const slides = [
  {
    className: "cover",
    title: "ORION, proposition de cadrage",
    duration: 45,
    notes: "Introduire le support comme une proposition de cadrage. Le déroulé suit les priorités fonctionnelles : matériels, remontées, puis processus et applications.",
    html: `
      <img class="cover-logo" src="../../design/assets/logos/orion-horizontal-inverse.svg" alt="ORION">
      <div>
        <p class="eyebrow">Présentation client · 4 novembre 2026</p>
        <h1>ORION, proposition de cadrage</h1>
        <p class="lead">Compréhension du besoin, priorité produit et premières orientations de conception</p>
      </div>
      <div class="flower" aria-hidden="true"></div>`
  },
  {
    className: "name-slide",
    title: "Le nom ORION proposé",
    duration: 75,
    notes: "Présenter le nom et son acronyme. Vérifier qu'il correspond au vocabulaire du client et qu'il ne crée pas de confusion avec une dénomination existante.",
    html: `
      <h2>Le nom ORION proposé</h2>
      <div class="name-logo-stage">
        <svg class="name-logo-animated" viewBox="0 0 440 112" role="img" aria-labelledby="animated-logo-title animated-logo-desc">
          <title id="animated-logo-title">ORION</title>
          <desc id="animated-logo-desc">La fleur ORION se forme par une explosion de huit pétales violets autour de son cœur doré.</desc>
          <g fill="#6954C0">
            <ellipse class="name-petal" style="--rotation:0deg;--delay:0ms" cx="56" cy="24" rx="7" ry="19"/>
            <ellipse class="name-petal" style="--rotation:45deg;--delay:45ms" cx="56" cy="24" rx="7" ry="19"/>
            <ellipse class="name-petal" style="--rotation:90deg;--delay:90ms" cx="56" cy="24" rx="7" ry="19"/>
            <ellipse class="name-petal" style="--rotation:135deg;--delay:135ms" cx="56" cy="24" rx="7" ry="19"/>
            <ellipse class="name-petal" style="--rotation:180deg;--delay:180ms" cx="56" cy="24" rx="7" ry="19"/>
            <ellipse class="name-petal" style="--rotation:225deg;--delay:225ms" cx="56" cy="24" rx="7" ry="19"/>
            <ellipse class="name-petal" style="--rotation:270deg;--delay:270ms" cx="56" cy="24" rx="7" ry="19"/>
            <ellipse class="name-petal" style="--rotation:315deg;--delay:315ms" cx="56" cy="24" rx="7" ry="19"/>
          </g>
          <circle class="name-heart" cx="56" cy="56" r="10" fill="#E8B84E"/>
          <text class="name-word" x="112" y="76" fill="#17243B" font-family="Arial, Helvetica, sans-serif" font-size="58" font-weight="700" letter-spacing="7">ORION</text>
        </svg>
      </div>
      <p class="name-acronym"><b>A</b>dministration, <b>S</b>upervision et <b>T</b>raçabilité des <b>É</b>quipements et <b>R</b>essources</p>`
  },
  {
    className: "brand-slide",
    title: "Direction artistique proposée",
    duration: 80,
    notes: "Présenter simplement le logo, les couleurs et les quatre familles d'icônes. La fleur sert de repère visuel sans reprendre de symbole institutionnel.",
    html: `
      <h2>Direction artistique proposée</h2>
      <div class="brand-layout">
        <div class="brand-signatures">
          <div class="signature-light"><img src="../../design/assets/logos/orion-horizontal.svg" alt="Logo ORION sur fond clair"></div>
          <div class="signature-dark"><img src="../../design/assets/logos/orion-horizontal-inverse.svg" alt="Logo ORION sur fond sombre"></div>
        </div>
        <div class="palette-line" aria-label="Palette de couleurs">
          <div style="--swatch:#17243B"><span></span><b>Encre</b><small>#17243B</small></div>
          <div style="--swatch:#6954C0"><span></span><b>Iris</b><small>#6954C0</small></div>
          <div style="--swatch:#B8A3EA"><span></span><b>Lilas</b><small>#B8A3EA</small></div>
          <div style="--swatch:#F6F4FB"><span></span><b>Brume</b><small>#F6F4FB</small></div>
          <div style="--swatch:#E8B84E"><span></span><b>Cœur</b><small>#E8B84E</small></div>
        </div>
        <div class="brand-icons">
          <div><img src="../../design/assets/icons/materiel.svg" alt=""><span>Matériels</span></div>
          <div><img src="../../design/assets/icons/documents.svg" alt=""><span>Remontées</span></div>
          <div><img src="../../design/assets/icons/supervision.svg" alt=""><span>Processus</span></div>
          <div><img src="../../design/assets/icons/administration.svg" alt=""><span>Applications</span></div>
        </div>
      </div>`
  },
  {
    className: "understanding-slide",
    title: "Notre compréhension du projet",
    duration: 110,
    notes: "Faire confirmer l'ordre des besoins. La gestion des matériels répond au problème immédiat. Les remontées viennent ensuite. La gestion des processus et des applications complète le périmètre.",
    html: `
      <h2>Notre compréhension du projet</h2>
      <div class="understanding-sequence">
        <div>
          <b>01</b>
          <img src="../../design/assets/icons/materiel.svg" alt="">
          <h3>Gestion des matériels</h3>
          <p>Remplacer le suivi sous Excel par un inventaire centralisé et relié aux salles.</p>
        </div>
        <div>
          <b>02</b>
          <img src="../../design/assets/icons/documents.svg" alt="">
          <h3>Remontées utilisateur</h3>
          <p>Déclarer un problème sur un ou plusieurs matériels et produire un état des lieux.</p>
        </div>
        <div>
          <b>03</b>
          <img src="../../design/assets/icons/supervision.svg" alt="">
          <h3>Processus et applications</h3>
          <p>Superviser l'utilisation des postes et déclencher les opérations d'administration.</p>
        </div>
      </div>`
  },
  {
    className: "objectives-slide",
    title: "Objectifs de la première version",
    duration: 90,
    notes: "Présenter les résultats attendus et non un état de réalisation. La gestion des processus reste simulée pour la démonstration.",
    html: `
      <h2>Objectifs de la première version</h2>
      <div class="objective-list">
        <div><b>01</b><p>Connaître les matériels, leur état et leur localisation.</p></div>
        <div><b>02</b><p>Centraliser les problèmes signalés et générer les PDF d'état des lieux.</p></div>
        <div><b>03</b><p>Préparer la supervision des processus et l'administration des applications Windows.</p></div>
      </div>
      <p class="scope-note">La démonstration porte sur une école. La supervision des processus sera simulée.</p>`
  },
  {
    className: "mvp-slide",
    title: "La gestion des matériels comme MVP",
    duration: 120,
    notes: "Le premier incrément utile couvre la création, la recherche, l'affectation et le suivi d'un matériel. Demander au client quel scénario concret permettra de vérifier ce socle.",
    html: `
      <div>
        <h2>La gestion des matériels comme MVP</h2>
        <p class="lead">Le premier incrément utile couvre le cycle quotidien d'un matériel, de son arrivée à son affectation.</p>
      </div>
      <div class="mvp-path">
        <div><span>1</span><img src="../../design/assets/icons/materiel.svg" alt=""><p>Enregistrer ou importer</p></div>
        <i aria-hidden="true"></i>
        <div><span>2</span><img src="../../design/assets/icons/recherche.svg" alt=""><p>Rechercher et consulter</p></div>
        <i aria-hidden="true"></i>
        <div><span>3</span><img src="../../design/assets/icons/salles.svg" alt=""><p>Affecter à une salle</p></div>
        <i aria-hidden="true"></i>
        <div><span>4</span><img src="../../design/assets/icons/deplacement.svg" alt=""><p>Déplacer et suivre l'état</p></div>
      </div>`
  },
  {
    className: "ui-slide",
    title: "Tableau de bord du parc",
    duration: 100,
    notes: "Les valeurs affichées sont fictives. Demander si les indicateurs donnent une vue suffisante de l'état du parc et des matériels à traiter.",
    html: `
      <div class="slide-heading"><h2>Tableau de bord du parc</h2></div>
      <div class="ui-embed" aria-label="Interface ORION, tableau de bord du parc">
        <iframe src="../../design/maquettes/gestion-materiels.html?screen=dashboard" title="Tableau de bord du parc dans ORION" tabindex="-1"></iframe>
      </div>`
  },
  {
    className: "ui-slide",
    title: "Liste des matériels",
    duration: 130,
    notes: "Les valeurs affichées sont fictives. Faire réagir le client sur les informations visibles, les filtres et l'action d'ajout.",
    html: `
      <div class="slide-heading"><h2>Liste des matériels</h2></div>
      <div class="ui-embed" aria-label="Interface ORION, liste des matériels">
        <iframe src="../../design/maquettes/gestion-materiels.html?screen=materiels" title="Liste des matériels dans ORION" tabindex="-1"></iframe>
      </div>`
  },
  {
    className: "ui-slide form-slide",
    title: "Ajout d'un matériel",
    duration: 110,
    notes: "Faire valider les champs et leur caractère obligatoire. Le modèle, la date de réception et l'état sont obligatoires. Le numéro de série et la marque restent facultatifs.",
    html: `
      <div class="slide-heading"><h2>Ajout d'un matériel</h2></div>
      <div class="ui-embed" aria-label="Interface ORION, ajout d'un matériel">
        <iframe src="../../design/maquettes/gestion-materiels.html?screen=ajouter" title="Ajout d'un matériel dans ORION" tabindex="-1"></iframe>
      </div>`
  },
  {
    className: "ui-slide",
    title: "Fiche matériel",
    duration: 90,
    notes: "Présenter les informations conservées sur un matériel et les deux actions disponibles : modifier la fiche ou changer son affectation.",
    html: `
      <div class="slide-heading"><h2>Fiche matériel</h2></div>
      <div class="ui-embed" aria-label="Interface ORION, fiche d'un matériel">
        <iframe src="../../design/maquettes/gestion-materiels.html?screen=fiche" title="Fiche d'un matériel dans ORION" tabindex="-1"></iframe>
      </div>`
  },
  {
    className: "ui-slide",
    title: "Affectation des matériels",
    duration: 100,
    notes: "Présenter la sélection par ligne et l'affectation immédiate de plusieurs matériels vers une salle ou le stock.",
    html: `
      <div class="slide-heading"><h2>Affectation des matériels</h2></div>
      <div class="ui-embed" aria-label="Interface ORION, affectation des matériels">
        <iframe src="../../design/maquettes/gestion-materiels.html?screen=groupe" title="Affectation des matériels dans ORION" tabindex="-1"></iframe>
      </div>`
  },
  {
    className: "remontee-slide",
    title: "Parcours proposé pour les remontées",
    duration: 100,
    notes: "Présenter un parcours court. Le formateur ou l'administrateur choisit les matériels, décrit le problème et transmet. ORION produit le PDF. Le gestionnaire suit ensuite le traitement.",
    html: `
      <h2>Parcours proposé pour les remontées</h2>
      <div class="simple-flow">
        <div><b>01</b><img src="../../design/assets/icons/materiel.svg" alt=""><h3>Matériels concernés</h3><p>Un ou plusieurs matériels</p></div>
        <i aria-hidden="true"></i>
        <div><b>02</b><img src="../../design/assets/icons/alertes.svg" alt=""><h3>Problème décrit</h3><p>Type et description</p></div>
        <i aria-hidden="true"></i>
        <div><b>03</b><img src="../../design/assets/icons/documents.svg" alt=""><h3>PDF généré</h3><p>État des lieux</p></div>
        <i aria-hidden="true"></i>
        <div><b>04</b><img src="../../design/assets/icons/recherche.svg" alt=""><h3>Traitement suivi</h3><p>En attente, remplacé ou corrigé</p></div>
      </div>`
  },
  {
    className: "process-slide",
    title: "Gestion proposée des processus et applications",
    duration: 130,
    notes: "Distinguer les deux besoins. La supervision concerne les processus utilisateur. L'administration concerne les applications installées et la masterisation. ORION pilote les actions sans agent propre.",
    html: `
      <h2>Gestion proposée des processus et applications</h2>
      <div class="process-columns">
        <div>
          <img src="../../design/assets/icons/supervision.svg" alt="">
          <h3>Processus</h3>
          <p>Consulter les processus utilisateur d'une salle.</p>
          <p>Arrêter un processus autorisé manuellement ou appliquer une règle de blacklist.</p>
        </div>
        <div>
          <img src="../../design/assets/icons/administration.svg" alt="">
          <h3>Applications</h3>
          <p>Consulter les applications installées sur un poste.</p>
          <p>Déclencher l'installation prévue ou la réapplication d'une image Windows.</p>
        </div>
      </div>
      <p class="process-foot">Les actions partent de l'application web ORION et utilisent les mécanismes Windows, sans agent ORION sur les postes.</p>`
  },
  {
    className: "mcd-review-slide",
    title: "MCD proposé",
    duration: 160,
    notes: "Le MCD n'est pas validé. Présenter les principaux choix et recueillir les corrections. La connexion s'appuie sur Keycloak relié à LDAP ; la représentation des comptes dans le MCD reste à articuler avec cette architecture.",
    html: `
      <div class="mcd-visual">
        <img src="../../docs/05-MCD-MERISE.svg" alt="Proposition de modèle conceptuel de données ORION">
      </div>
      <div class="mcd-copy">
        <h2>MCD proposé</h2>
        <div class="review-points">
          <div><b>01</b><p>Vocabulaire et entités métier</p></div>
          <div><b>02</b><p>Séparation entre matériel et poste supervisé</p></div>
          <div><b>03</b><p>Cardinalités et données obligatoires</p></div>
          <div><b>04</b><p>Représentation de l'authentification</p></div>
        </div>
      </div>`
  },
  {
    className: "target-architecture-slide",
    title: "Architecture cible initiale",
    duration: 150,
    notes: "Distinguer serveur front (interface) et serveur back (API, métier et droits). La connexion passe par Keycloak relié à LDAP ; Keycloak est prévu dans tous les cas, mais sa présence sur le réseau cible reste à vérifier. Le back utilise la base de données, le stockage S3 des PDF et les services Windows. Aucun agent ORION sur les postes. Les services Windows, les flux, les hébergements et les modalités d'intégration restent à préciser.",
    html: `
      <div class="slide-heading"><h2>Architecture cible initiale</h2></div>
      <div class="target-map" aria-label="Architecture ORION : serveurs front et back distincts, Keycloak relié à LDAP, base de données, stockage S3 des PDF et services Windows">
        <div class="target-node auth-node"><h3>Keycloak</h3><p>Connexion des utilisateurs</p><small>Existant ou à mettre en place</small></div>
        <span class="target-link directory-link" aria-hidden="true"></span>
        <div class="target-node directory-node"><h3>LDAP</h3><p>Annuaire des utilisateurs</p></div>
        <span class="auth-branch" aria-hidden="true"></span>
        <div class="target-node browser-node"><img src="../../design/assets/icons/recherche.svg" alt=""><h3>Utilisateurs</h3><p>Firefox · réseau interne NP</p></div>
        <span class="target-link browser-link" aria-hidden="true"></span>
        <div class="target-node front-node"><img src="../../design/assets/logos/orion-horizontal.svg" alt="ORION"><h3>Serveur front</h3><p>Interface web</p></div>
        <span class="target-link front-link" aria-hidden="true"></span>
        <div class="target-node back-node"><h3>Serveur back</h3><p>API, fonctions métier et droits</p></div>
        <span class="target-link back-link" aria-hidden="true"></span>
        <div class="target-node windows-node"><img src="../../design/assets/icons/administration.svg" alt=""><h3>Services Windows</h3><p>Administration et déploiement</p></div>
        <span class="target-link posts-link" aria-hidden="true"></span>
        <div class="target-node posts-node"><img src="../../design/assets/icons/salles.svg" alt=""><h3>Postes Windows</h3><p>Aucun agent ORION</p></div>
        <span class="storage-branch" aria-hidden="true"></span>
        <div class="target-stores">
          <div class="target-store"><h3>Base de données ORION</h3><p>Parc, profils et remontées</p></div>
          <div class="target-store"><h3>Stockage S3</h3><p>PDF d’état des lieux</p></div>
        </div>
      </div>`
  }
];

const slidesRoot = document.getElementById("slides");
const counter = document.getElementById("counter");
const progressBar = document.getElementById("progress-bar");
const previousButton = document.getElementById("previous");
const nextButton = document.getElementById("next");
const fullscreenButton = document.getElementById("fullscreen");
const notesButton = document.getElementById("notes-toggle");
const notesPanel = document.getElementById("speaker-notes");
const notesTitle = document.getElementById("notes-title");
const notesContent = document.getElementById("notes-content");
const slideDuration = document.getElementById("slide-duration");
const help = document.getElementById("help");

let current = 0;
let touchStartX = null;

function escapeText(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function renderSlides() {
  slidesRoot.innerHTML = slides.map((slide, index) => `
    <section
      class="slide ${slide.className}"
      data-number="${String(index + 1).padStart(2, "0")}"
      data-index="${index}"
      aria-label="${escapeText(slide.title)}"
      aria-hidden="true"
    >${slide.html}</section>`).join("");
}

function formatDuration(seconds) {
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return rest ? `${minutes} min ${rest} s` : `${minutes} min`;
}

function showSlide(index, updateHash = true) {
  current = Math.max(0, Math.min(index, slides.length - 1));
  document.querySelectorAll(".slide").forEach((element, position) => {
    const active = position === current;
    element.classList.toggle("is-current", active);
    element.setAttribute("aria-hidden", String(!active));
  });

  const slide = slides[current];
  counter.textContent = `${current + 1} / ${slides.length}`;
  progressBar.style.width = `${((current + 1) / slides.length) * 100}%`;
  previousButton.disabled = current === 0;
  nextButton.disabled = current === slides.length - 1;
  notesTitle.textContent = slide.title;
  notesContent.textContent = slide.notes;
  slideDuration.textContent = `Temps conseillé : ${formatDuration(slide.duration)}`;
  document.title = `${current + 1}/${slides.length} — ${slide.title}`;

  if (updateHash) history.replaceState(null, "", `#${current + 1}`);
}

function move(delta) {
  showSlide(current + delta);
}

function toggleNotes() {
  const opening = notesPanel.hidden;
  notesPanel.hidden = !opening;
  notesButton.setAttribute("aria-pressed", String(opening));
}

async function toggleFullscreen() {
  if (!document.fullscreenElement) {
    await document.documentElement.requestFullscreen?.();
  } else {
    await document.exitFullscreen?.();
  }
}

function toggleHelp() {
  help.hidden = !help.hidden;
}

previousButton.addEventListener("click", () => move(-1));
nextButton.addEventListener("click", () => move(1));
notesButton.addEventListener("click", toggleNotes);
fullscreenButton.addEventListener("click", toggleFullscreen);

document.addEventListener("keydown", event => {
  if (["ArrowRight", "PageDown", " "].includes(event.key)) {
    event.preventDefault();
    move(1);
  } else if (["ArrowLeft", "PageUp"].includes(event.key)) {
    event.preventDefault();
    move(-1);
  } else if (event.key === "Home") {
    showSlide(0);
  } else if (event.key === "End") {
    showSlide(slides.length - 1);
  } else if (event.key.toLowerCase() === "f") {
    toggleFullscreen();
  } else if (event.key.toLowerCase() === "n") {
    toggleNotes();
  } else if (event.key === "?") {
    toggleHelp();
  } else if (event.key === "Escape" && !help.hidden) {
    help.hidden = true;
  }
});

document.addEventListener("touchstart", event => {
  touchStartX = event.changedTouches[0].clientX;
}, { passive: true });

document.addEventListener("touchend", event => {
  if (touchStartX === null) return;
  const delta = event.changedTouches[0].clientX - touchStartX;
  if (Math.abs(delta) > 60) move(delta < 0 ? 1 : -1);
  touchStartX = null;
}, { passive: true });

window.addEventListener("hashchange", () => {
  const requested = Number.parseInt(location.hash.slice(1), 10);
  if (Number.isFinite(requested)) showSlide(requested - 1, false);
});

renderSlides();
const requestedSlide = Number.parseInt(location.hash.slice(1), 10);
showSlide(Number.isFinite(requestedSlide) ? requestedSlide - 1 : 0, false);
