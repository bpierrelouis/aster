"use strict";
// Diaporama : → Espace révèlent le bloc suivant puis la diapositive suivante ; ← revient ; Début / Fin ; N orateur et minutage ;
// F plein écran ; adresse #n ou #n/k (diapositive n, k blocs révélés).
(() => {
  const slides = [...document.querySelectorAll(".slide")];
  const $ = (id) => document.getElementById(id);
  let index = 0;

  // Poussière d'étoiles de fond, tirage fixe.
  let graine = 11;
  const alea = () => ((graine = (graine * 16807) % 2147483647) / 2147483647);
  const dust = document.querySelector(".sky .dust");
  for (let i = 0; i < 140; i++) {
    const c = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    c.setAttribute("cx", (alea() * 210).toFixed(1)); c.setAttribute("cy", (alea() * 120).toFixed(1));
    c.setAttribute("r", (0.08 + alea() * 0.22).toFixed(2)); c.setAttribute("opacity", (0.15 + alea() * 0.5).toFixed(2));
    dust.append(c);
  }

  // --- Architecture animée --------------------------------------------------------------
  const archi = document.querySelector(".archi-slide");
  const viewport = $("viewport");
  const world = $("world");
  const TITRES = [
    "Tout commence dans le navigateur.", "Une seule porte : HAProxy, en HTTPS.", "Apache sert l’interface.", "Express porte l’API et toutes les règles.",
    "PostgreSQL garde les données, les sessions et le journal.", "L’identité reste à MindefConnect.", "Les postes Windows se présentent toutes les cinq secondes.",
    "RIGEL : le téléphone ne touche jamais ORION.", "Un front, un back, une base. Et trois portes bien gardées.",
  ];
  for (const wire of archi.querySelectorAll(".wire")) {
    const d = wire.querySelector("path").getAttribute("d");
    for (let k = 0; k < 2; k++) {
      const dot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      dot.setAttribute("class", "dot");
      dot.style.offsetPath = `path('${d}')`;
      wire.append(dot);
    }
  }
  function archiStep(step) {
    const boxes = [...archi.querySelectorAll(".box")];
    for (const b of boxes) b.classList.toggle("on", Number(b.dataset.step) <= step);
    for (const w of archi.querySelectorAll(".wire")) w.classList.toggle("on", step === 8 ? true : Number(w.dataset.step) === step);
    $("archi-title").textContent = TITRES[step];
    const FOCUS = [["nav"], ["nav", "haproxy"], ["haproxy", "apache"], ["haproxy", "apache", "express"], ["express", "pg"], ["nav", "mindef"], ["haproxy", "postes"], ["express", "connecteur", "relais", "tel"]];
    const visibles = step === 8 ? boxes : FOCUS[step].map((id) => $(`b-${id}`));
    const rect = (b) => ({ x: parseFloat(b.style.left), y: parseFloat(b.style.top), w: 320, h: 150 });
    const rs = visibles.map(rect);
    const x0 = Math.min(...rs.map((r) => r.x)) - 120, y0 = Math.min(...rs.map((r) => r.y)) - 120;
    const x1 = Math.max(...rs.map((r) => r.x + r.w)) + 120, y1 = Math.max(...rs.map((r) => r.y + r.h)) + 120;
    const vw = viewport.clientWidth, vh = viewport.clientHeight;
    const scale = Math.min(vw / (x1 - x0), vh / (y1 - y0), step === 0 ? .9 : 1.2);
    const tx = vw / 2 - (x0 + x1) / 2 * scale, ty = vh / 2 - (y0 + y1) / 2 * scale;
    world.style.transform = `translate(${tx}px, ${ty}px) scale(${scale})`;
  }

  // --- Fragments ---------------------------------------------------------------------------
  const fragments = (slide) => [...slide.querySelectorAll(".f")];
  const order = (f, i) => Number(f.dataset.f || i + 1); // data-f : ordre explicite d'apparition
  const steps = (slide) => (slide.dataset.steps ? Number(slide.dataset.steps) : Math.max(0, ...fragments(slide).map(order)));
  const current = new Map(); // diapositive → nombre de blocs révélés
  function reveal(slide, n) {
    current.set(slide, n);
    if (slide.dataset.steps) archiStep(n);
    else fragments(slide).forEach((f, i) => f.classList.toggle("on", order(f, i) <= n));
    history.replaceState(null, "", `#${slides.indexOf(slide) + 1}${n ? `/${n}` : ""}`);
  }

  function show(next, direction = 1, revealed = 0) {
    if (next < 0 || next >= slides.length) return;
    const previous = slides[index];
    if (next !== index) {
      previous.classList.remove("is-active");
      previous.classList.add("is-leaving");
      setTimeout(() => previous.classList.remove("is-leaving"), 550);
    }
    index = next;
    const slide = slides[index];
    slide.style.transform = direction < 0 ? "translateX(-6vw)" : "";
    requestAnimationFrame(() => { slide.style.transform = ""; slide.classList.add("is-active"); });
    $("section").textContent = slide.dataset.section;
    $("count").textContent = `${index + 1} / ${slides.length}`;
    $("fill").style.width = `${(index + 1) / slides.length * 100}%`;
    $("notes-speaker").textContent = slide.dataset.speaker;
    $("notes-time").textContent = slide.dataset.time;
    reveal(slide, Math.min(revealed, steps(slide)));
  }
  function forward() {
    const slide = slides[index];
    const n = current.get(slide) ?? 0;
    if (n < steps(slide)) reveal(slide, n + 1);
    else show(index + 1);
  }
  function backward() {
    const slide = slides[index];
    const n = current.get(slide) ?? 0;
    if (n > 0) reveal(slide, n - 1);
    else show(index - 1, -1, steps(slides[index - 1] ?? slide));
  }

  document.addEventListener("keydown", (event) => {
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    const actions = {
      ArrowRight: forward, ArrowDown: forward, PageDown: forward, " ": forward,
      ArrowLeft: backward, ArrowUp: backward, PageUp: backward,
      Home: () => show(0, -1), End: () => show(slides.length - 1, 1, 99),
      n: () => { $("notes").hidden = !$("notes").hidden; }, N: () => { $("notes").hidden = !$("notes").hidden; },
      f: () => (document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen()),
      F: () => (document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen()),
    };
    const action = actions[event.key];
    if (action) { event.preventDefault(); action(); }
  });
  document.addEventListener("click", (event) => {
    if (event.target.closest("a, button")) return;
    if (event.clientX < innerWidth * .15) backward(); else forward();
  });
  new ResizeObserver(() => { if (slides[index].dataset.steps) archiStep(current.get(slides[index]) ?? 0); }).observe(viewport);

  if (location.search.includes("static")) document.documentElement.classList.add("static");
  const [n, k] = location.hash.slice(1).split("/").map(Number);
  slides[0].classList.add("is-active");
  show(n >= 1 && n <= slides.length ? n - 1 : 0, 1, k || 0);
})();
