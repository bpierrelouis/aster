const slides = [
  {
    className: "cover",
    title: "ASTER, proposition de cadrage",
    duration: 45,
    notes: "Introduire le support comme une proposition de cadrage. Le déroulé suit les priorités fonctionnelles : matériels, remontées, puis processus et applications.",
    html: `
      <img class="cover-logo" src="../../da/logos/aster-horizontal-inverse.svg" alt="ASTER">
      <div>
        <p class="eyebrow">Présentation client · 4 novembre 2026</p>
        <h1>ASTER, proposition de cadrage</h1>
        <p class="lead">Compréhension du besoin, priorité produit et premières orientations de conception</p>
      </div>
      <div class="flower" aria-hidden="true"></div>`
  },
  {
    className: "name-slide",
    title: "Le nom ASTER proposé",
    duration: 75,
    notes: "Présenter le nom et son acronyme. Vérifier qu'il correspond au vocabulaire du client et qu'il ne crée pas de confusion avec une dénomination existante.",
    html: `
      <h2>Le nom ASTER proposé</h2>
      <div class="name-logo-stage">
        <svg class="name-logo-animated" viewBox="0 0 440 112" role="img" aria-labelledby="animated-logo-title animated-logo-desc">
          <title id="animated-logo-title">ASTER</title>
          <desc id="animated-logo-desc">La fleur ASTER se forme par une explosion de huit pétales violets autour de son cœur doré.</desc>
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
          <text class="name-word" x="112" y="76" fill="#17243B" font-family="Arial, Helvetica, sans-serif" font-size="58" font-weight="700" letter-spacing="7">ASTER</text>
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
          <div class="signature-light"><img src="../../da/logos/aster-horizontal.svg" alt="Logo ASTER sur fond clair"></div>
          <div class="signature-dark"><img src="../../da/logos/aster-horizontal-inverse.svg" alt="Logo ASTER sur fond sombre"></div>
        </div>
        <div class="palette-line" aria-label="Palette de couleurs">
          <div style="--swatch:#17243B"><span></span><b>Encre</b><small>#17243B</small></div>
          <div style="--swatch:#6954C0"><span></span><b>Iris</b><small>#6954C0</small></div>
          <div style="--swatch:#B8A3EA"><span></span><b>Lilas</b><small>#B8A3EA</small></div>
          <div style="--swatch:#F6F4FB"><span></span><b>Brume</b><small>#F6F4FB</small></div>
          <div style="--swatch:#E8B84E"><span></span><b>Cœur</b><small>#E8B84E</small></div>
        </div>
        <div class="brand-icons">
          <div><img src="../../da/icons/materiel.svg" alt=""><span>Matériels</span></div>
          <div><img src="../../da/icons/documents.svg" alt=""><span>Remontées</span></div>
          <div><img src="../../da/icons/supervision.svg" alt=""><span>Processus</span></div>
          <div><img src="../../da/icons/administration.svg" alt=""><span>Applications</span></div>
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
          <img src="../../da/icons/materiel.svg" alt="">
          <h3>Gestion des matériels</h3>
          <p>Remplacer le suivi sous Excel par un inventaire centralisé et relié aux salles.</p>
        </div>
        <div>
          <b>02</b>
          <img src="../../da/icons/documents.svg" alt="">
          <h3>Remontées utilisateur</h3>
          <p>Déclarer un problème sur un ou plusieurs matériels et produire un état des lieux.</p>
        </div>
        <div>
          <b>03</b>
          <img src="../../da/icons/supervision.svg" alt="">
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
        <div><span>1</span><img src="../../da/icons/materiel.svg" alt=""><p>Enregistrer ou importer</p></div>
        <i aria-hidden="true"></i>
        <div><span>2</span><img src="../../da/icons/recherche.svg" alt=""><p>Rechercher et consulter</p></div>
        <i aria-hidden="true"></i>
        <div><span>3</span><img src="../../da/icons/salles.svg" alt=""><p>Affecter à une salle</p></div>
        <i aria-hidden="true"></i>
        <div><span>4</span><img src="../../da/icons/deplacement.svg" alt=""><p>Déplacer et suivre l'état</p></div>
      </div>`
  },
  {
    className: "ui-slide",
    title: "IHM proposée pour le parc",
    duration: 130,
    notes: "Les valeurs affichées sont fictives. Faire réagir le client sur les informations visibles, les filtres et l'action d'ajout.",
    html: `
      <div class="slide-heading"><h2>IHM proposée pour le parc</h2></div>
      <div class="app-window" aria-label="Maquette de la liste des matériels">
        <aside class="app-sidebar">
          <img src="../../da/logos/aster-horizontal-inverse.svg" alt="ASTER">
          <span class="active">Parc informatique</span>
          <span>Salles</span>
          <span>Remontées</span>
          <span>Administration</span>
        </aside>
        <div class="app-main">
          <div class="app-top"><div><small>Gestion du parc</small><h3>Matériels</h3></div><button>Ajouter un matériel</button></div>
          <div class="mock-stats"><div><small>Matériels</small><b>248</b></div><div><small>En stock</small><b>63</b></div><div><small>Hors service</small><b>14</b></div></div>
          <div class="mock-toolbar"><span>Rechercher un matériel</span><span>Toutes les salles</span><span>Tous les états</span></div>
          <div class="mock-table">
            <div class="table-head"><span>Matériel</span><span>N° de série</span><span>Localisation</span><span>État</span></div>
            <div><span>Écran 24 pouces</span><span>SN-00482</span><span>Salle B203</span><span class="status-ok">En service</span></div>
            <div><span>Clavier USB</span><span>Non renseigné</span><span>Stock</span><span class="status-ok">En service</span></div>
            <div><span>Câble Ethernet</span><span>Non renseigné</span><span>Salle A112</span><span class="status-off">Hors service</span></div>
          </div>
        </div>
      </div>`
  },
  {
    className: "ui-slide form-slide",
    title: "IHM proposée pour la fiche matériel",
    duration: 110,
    notes: "Faire valider les champs et leur caractère obligatoire. Le modèle, la date de réception et l'état sont obligatoires. Le numéro de série et la marque restent facultatifs.",
    html: `
      <div class="slide-heading"><h2>IHM proposée pour la fiche matériel</h2></div>
      <div class="form-mockup">
        <div class="form-title"><div><small>Matériel</small><h3>Ajouter un matériel</h3></div><img src="../../da/icons/materiel.svg" alt=""></div>
        <div class="mock-form">
          <label><span>Modèle *</span><b>Écran 24 pouces</b></label>
          <label><span>Marque</span><b>Facultative</b></label>
          <label><span>Date de réception *</span><b>04/11/2026</b></label>
          <label><span>Numéro de série</span><b>Facultatif</b></label>
          <label class="wide"><span>Affectation</span><b>Salle B203</b></label>
          <label><span>Hors service *</span><b>Non</b></label>
        </div>
        <div class="mock-actions"><button class="secondary">Annuler</button><button>Enregistrer</button></div>
      </div>`
  },
  {
    className: "remontee-slide",
    title: "Parcours proposé pour les remontées",
    duration: 100,
    notes: "Présenter un parcours court. Le formateur ou l'administrateur choisit les matériels, décrit le problème et transmet. ASTER produit le PDF. Le gestionnaire suit ensuite le traitement.",
    html: `
      <h2>Parcours proposé pour les remontées</h2>
      <div class="simple-flow">
        <div><b>01</b><img src="../../da/icons/materiel.svg" alt=""><h3>Matériels concernés</h3><p>Un ou plusieurs matériels</p></div>
        <i aria-hidden="true"></i>
        <div><b>02</b><img src="../../da/icons/alertes.svg" alt=""><h3>Problème décrit</h3><p>Type et description</p></div>
        <i aria-hidden="true"></i>
        <div><b>03</b><img src="../../da/icons/documents.svg" alt=""><h3>PDF généré</h3><p>État des lieux</p></div>
        <i aria-hidden="true"></i>
        <div><b>04</b><img src="../../da/icons/recherche.svg" alt=""><h3>Traitement suivi</h3><p>En attente, remplacé ou corrigé</p></div>
      </div>`
  },
  {
    className: "process-slide",
    title: "Gestion proposée des processus et applications",
    duration: 130,
    notes: "Distinguer les deux besoins. La supervision concerne les processus utilisateur. L'administration concerne les applications installées et la masterisation. ASTER pilote les actions sans agent propre.",
    html: `
      <h2>Gestion proposée des processus et applications</h2>
      <div class="process-columns">
        <div>
          <img src="../../da/icons/supervision.svg" alt="">
          <h3>Processus</h3>
          <p>Consulter les processus utilisateur d'une salle.</p>
          <p>Arrêter un processus autorisé manuellement ou appliquer une règle de blacklist.</p>
        </div>
        <div>
          <img src="../../da/icons/administration.svg" alt="">
          <h3>Applications</h3>
          <p>Consulter les applications installées sur un poste.</p>
          <p>Déclencher l'installation prévue ou la réapplication d'une image Windows.</p>
        </div>
      </div>
      <p class="process-foot">Les actions partent de l'application web ASTER et utilisent les mécanismes Windows, sans agent ASTER sur les postes.</p>`
  },
  {
    className: "mcd-review-slide",
    title: "MCD proposé",
    duration: 160,
    notes: "Le MCD n'est pas validé. Présenter les principaux choix et recueillir les corrections. Le système d'authentification reste ouvert, donc la représentation des identifiants devra suivre cette décision.",
    html: `
      <div class="mcd-visual">
        <img src="../../docs/05-MCD-MERISE.svg" alt="Proposition de modèle conceptuel de données ASTER">
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
    notes: "Présenter cette architecture comme un point de départ. Aucun agent ASTER ne peut être installé. Les services Windows, les flux et l'authentification restent à choisir avec le client.",
    html: `
      <div class="slide-heading"><h2>Architecture cible initiale</h2></div>
      <div class="target-map" aria-label="Architecture cible initiale ASTER">
        <div class="target-node browser-node"><img src="../../da/icons/recherche.svg" alt=""><h3>Utilisateurs</h3><p>Firefox sur le réseau interne NP</p></div>
        <span class="target-link" aria-hidden="true"></span>
        <div class="target-node app-node"><img src="../../da/logos/aster-horizontal.svg" alt="ASTER"><h3>Application web ASTER</h3><p>Fonctions métier et droits</p></div>
        <span class="target-link" aria-hidden="true"></span>
        <div class="target-node windows-node"><img src="../../da/icons/administration.svg" alt=""><h3>Services Windows</h3><p>Administration et déploiement</p></div>
        <span class="target-link" aria-hidden="true"></span>
        <div class="target-node posts-node"><img src="../../da/icons/salles.svg" alt=""><h3>Postes Windows</h3><p>Aucun agent ASTER</p></div>
        <div class="data-branch"><span aria-hidden="true"></span><div><h3>Base de données ASTER</h3><p>Parc, utilisateurs, remontées et historique</p></div></div>
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
