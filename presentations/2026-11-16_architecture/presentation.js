"use strict";

(() => {
  const { boards, steps } = window.ORION_ARCHITECTURE;
  const $ = (id) => document.getElementById(id);
  const svgNS = "http://www.w3.org/2000/svg";
  const world = $("world");
  const viewport = $("viewport");
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  const nodes = new Map();
  const wires = new Map();
  let index = 0;
  let camera = { x: 0, y: 0, scale: 1 };
  let cameraAnimation = null;
  let autoplayTimer = null;
  let playing = false;
  let motion = !reducedMotion.matches;
  let drag = null;

  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function svgElement(tag, attributes = {}) {
    const node = document.createElementNS(svgNS, tag);
    for (const [name, value] of Object.entries(attributes)) node.setAttribute(name, value);
    return node;
  }

  function icon(name) {
    const svg = svgElement("svg", { "aria-hidden": "true" });
    svg.append(svgElement("use", { href: `#i-${name}` }));
    return svg;
  }

  function logo(name) {
    const img = element("img", ["haproxy", "openldap"].includes(name) ? "wide-logo" : "");
    img.src = `assets/logos/${name}.svg`;
    img.alt = "";
    img.draggable = false;
    return img;
  }

  function buildNode(data, board) {
    const node = element("button", `node type-${data.type || "manager"} ${data.className || ""}`);
    node.type = "button";
    node.style.left = `${data.x}px`;
    node.style.top = `${data.y}px`;
    node.style.width = `${data.w}px`;
    node.style.height = `${data.h}px`;
    node.setAttribute("aria-label", `${data.title} : ${data.role}. Explorer.`);
    const heading = element("span", "node-heading");
    heading.append(element("span", "node-title", data.title));
    if (data.badge) heading.append(element("span", "node-badge", data.badge));
    node.append(heading, element("span", "node-role", data.role));
    for (const service of data.services || []) {
      const row = element("span", "service");
      row.append(service.logo ? logo(service.logo) : icon(service.icon || "server"));
      const text = element("span", "service-text");
      text.append(element("span", "service-name", service.name));
      if (service.meta) text.append(element("span", "service-meta", service.meta));
      row.append(text);
      node.append(row);
    }
    if (data.note) node.append(element("span", "node-note", data.note));
    if (data.address) node.append(element("span", "node-address", data.address));
    node.addEventListener("click", () => {
      if (drag?.moved) return;
      const candidates = steps.map((step, stepIndex) => ({ step, stepIndex }))
        .filter(({ step }) => step.board === board.id && step.nodes?.includes(data.id));
      const dedicated = candidates.find(({ step }) => step.nodes.length === 1 || step.kicker.startsWith(data.title));
      if (dedicated || candidates[0]) go((dedicated || candidates[0]).stepIndex, { manual: true });
    });
    nodes.set(`${board.id}/${data.id}`, node);
    return node;
  }

  function buildWires(board) {
    const svg = svgElement("svg", { class: "wires", viewBox: "0 0 2400 1540", "aria-hidden": "true" });
    const defs = svgElement("defs");
    for (const edge of board.edges) {
      const markerID = `${board.id}-${edge.id}-arrow`;
      const marker = svgElement("marker", { id: markerID, viewBox: "0 0 10 10", refX: 9, refY: 5, markerWidth: 17, markerHeight: 17, orient: "auto", markerUnits: "userSpaceOnUse" });
      marker.append(svgElement("path", { d: "M0 0 10 5 0 10Z", fill: "#a7b5ca" }));
      defs.append(marker);
      const group = svgElement("g", { class: `wire${edge.scenario ? " is-scenario" : ""}` });
      const path = svgElement("path", { class: "wire-line", d: edge.d, "marker-end": `url(#${markerID})` });
      group.append(path);
      const label = svgElement("text", { class: "wire-label", x: edge.lx, y: edge.ly });
      label.textContent = edge.label;
      group.append(label);
      for (let packet = 0; packet < 2; packet++) {
        const particle = svgElement("circle", { class: "wire-particle", r: 7 });
        particle.style.offsetPath = `path('${edge.d}')`;
        particle.style.offsetDistance = packet === 0 ? "28%" : "72%";
        group.append(particle);
      }
      svg.append(group);
      wires.set(`${board.id}/${edge.id}`, { group, marker });
    }
    svg.prepend(defs);
    return svg;
  }

  for (const board of boards) {
    const layer = element("section", "board");
    layer.style.left = `${board.x}px`;
    layer.setAttribute("aria-label", board.title);
    const heading = element("div", "board-heading", board.title);
    heading.append(element("small", "", board.subtitle));
    const zone = element("div", "zone");
    const [x, y, w, h] = board.zone;
    Object.assign(zone.style, { left: `${x}px`, top: `${y}px`, width: `${w}px`, height: `${h}px` });
    const zoneLabel = element("span", "zone-label");
    zoneLabel.append(board.zoneLogo ? logo(board.zoneLogo) : icon(board.zoneIcon), document.createTextNode(board.zoneLabel));
    zone.append(zoneLabel);
    layer.append(heading, zone, buildWires(board));
    for (const node of board.nodes) layer.append(buildNode(node, board));
    world.append(layer);
  }

  function transform(view) {
    return `translate(${view.x}px, ${view.y}px) scale(${view.scale})`;
  }

  function currentCamera() {
    const matrix = new DOMMatrixReadOnly(getComputedStyle(world).transform);
    return { x: matrix.e, y: matrix.f, scale: matrix.a };
  }

  function fit(box, board) {
    const [x, y, w, h] = box;
    const padding = viewport.clientWidth < 500 ? 12 : 28;
    const scale = Math.min((viewport.clientWidth - padding * 2) / w, (viewport.clientHeight - padding * 2) / h, 1.8);
    return { x: viewport.clientWidth / 2 - (board.x + x + w / 2) * scale, y: viewport.clientHeight / 2 - (y + h / 2) * scale, scale };
  }

  function moveCamera(destination, animate = true) {
    const start = currentCamera();
    cameraAnimation?.cancel();
    camera = destination;
    world.style.transform = transform(destination);
    const shouldAnimate = animate && motion && !reducedMotion.matches;
    if (shouldAnimate) {
      const distance = Math.hypot(destination.x / destination.scale - start.x / start.scale, destination.y / destination.scale - start.y / start.scale);
      const frames = [{ transform: transform(start) }];
      if (distance > 1150) {
        const scale = Math.min(start.scale, destination.scale) * .66;
        const centerX = ((viewport.clientWidth / 2 - start.x) / start.scale + (viewport.clientWidth / 2 - destination.x) / destination.scale) / 2;
        const centerY = ((viewport.clientHeight / 2 - start.y) / start.scale + (viewport.clientHeight / 2 - destination.y) / destination.scale) / 2;
        frames.push({ transform: transform({ x: viewport.clientWidth / 2 - centerX * scale, y: viewport.clientHeight / 2 - centerY * scale, scale }), offset: .48 });
      }
      frames.push({ transform: transform(destination) });
      cameraAnimation = world.animate(frames, { duration: distance > 1150 ? 1600 : 1100, easing: "cubic-bezier(.25,.1,.2,1)" });
    }
    $("zoom-level").textContent = `${Math.round(destination.scale * 100)} %`;
    drawMinimap();
  }

  function drawMinimap() {
    const board = boards.find((item) => item.id === steps[index].board);
    const mini = $("minimap");
    mini.replaceChildren();
    for (const node of board.nodes) mini.append(svgElement("rect", { class: "minimap-node", x: node.x, y: node.y, width: node.w, height: node.h, rx: 18 }));
    mini.append(svgElement("rect", { class: "minimap-view", x: -camera.x / camera.scale - board.x, y: -camera.y / camera.scale, width: viewport.clientWidth / camera.scale, height: viewport.clientHeight / camera.scale, rx: 15 }));
    document.querySelector(".scene-index").classList.toggle("is-visible", camera.scale > fit(board.bounds, board).scale * 1.25);
  }

  function renderStep() {
    const step = steps[index];
    $("chapter").textContent = step.chapter.toLocaleUpperCase("fr");
    $("step-number").textContent = String(index + 1).padStart(2, "0");
    $("kicker").textContent = step.kicker.toLocaleUpperCase("fr");
    $("story-title").replaceChildren();
    step.title.split("\n").forEach((line, lineIndex) => {
      if (lineIndex) $("story-title").append(document.createElement("br"));
      $("story-title").append(document.createTextNode(line));
    });
    $("description").textContent = step.description;
    $("takeaway").textContent = step.takeaway || "";
    $("facts").replaceChildren();
    for (const [label, value] of step.facts) {
      const row = element("div");
      row.append(element("dt", "", label), element("dd", "", value));
      $("facts").append(row);
    }
    const copy = $("story-copy");
    copy.classList.remove("is-entering");
    copy.scrollTop = 0;
    requestAnimationFrame(() => copy.classList.add("is-entering"));
    $("context-label").textContent = step.board === "reel" ? "Déploiement sur VM · Debian 13" : "Cible C1NP · gabarit d’essai à qualifier";
    $("map-title").replaceChildren(document.createTextNode(step.board === "reel" ? "ARCHITECTURE RÉELLE" : "ARCHITECTURE CIBLE"), element("span", "", "/"), document.createTextNode(step.nodes ? "EXPLORATION" : "VUE D’ENSEMBLE"));
    const caption = element("span", "flow-caption");
    caption.append(icon(step.edges?.length ? "arrow" : "network"), document.createTextNode(step.caption));
    $("map-caption").replaceChildren(caption);
    $("show-real").setAttribute("aria-pressed", String(step.board === "reel"));
    $("show-target").setAttribute("aria-pressed", String(step.board === "cible"));
    $("previous").disabled = index === 0;
    $("next").disabled = index === steps.length - 1;
    $("progress").setAttribute("aria-valuemax", steps.length);
    $("progress").setAttribute("aria-valuenow", index + 1);
    $("progress-fill").style.width = `${(index + 1) / steps.length * 100}%`;
    $("progress-text").replaceChildren(document.createTextNode(String(index + 1).padStart(2, "0")), element("span", "", `/ ${steps.length}`));
    $("announcement").textContent = `Étape ${index + 1} sur ${steps.length}. ${step.title.replace("\n", " ")}`;
    for (const [key, node] of nodes) {
      const active = step.nodes?.some((id) => key === `${step.board}/${id}`);
      node.classList.toggle("is-active", Boolean(active));
      node.classList.toggle("is-dim", Boolean(step.nodes && !active && key.startsWith(`${step.board}/`)));
      node.classList.toggle("is-failed", Boolean(step.failed?.some((id) => key === `${step.board}/${id}`)));
      node.classList.toggle("is-recovering", key === `${step.board}/${step.recover}`);
    }
    for (const [key, { group, marker }] of wires) {
      const active = Boolean(step.edges?.some((id) => key === `${step.board}/${id}`));
      group.classList.toggle("is-active", active);
      marker.firstChild.setAttribute("fill", active ? "#2563eb" : "#a7b5ca");
    }
    for (const button of document.querySelectorAll(".contents-grid button")) {
      if (Number(button.value) === index) button.setAttribute("aria-current", "step");
      else button.removeAttribute("aria-current");
    }
    for (const layer of world.children) {
      const visible = layer.getAttribute("aria-label") === boards.find((board) => board.id === step.board).title;
      layer.inert = !visible;
    }
  }

  function go(nextIndex, { animate = true, manual = false, updateURL = true } = {}) {
    if (nextIndex < 0 || nextIndex >= steps.length) return;
    if (manual) setPlaying(false);
    index = nextIndex;
    const step = steps[index];
    const board = boards.find((item) => item.id === step.board);
    renderStep();
    moveCamera(fit(step.focus || board.bounds, board), animate);
    if (updateURL && location.hash !== `#${step.id}`) history.replaceState(null, "", `#${step.id}`);
    if (playing) scheduleNext();
  }

  function scheduleNext() {
    clearTimeout(autoplayTimer);
    if (!playing) return;
    autoplayTimer = setTimeout(() => {
      if (index < steps.length - 1) go(index + 1);
      else setPlaying(false);
    }, 10500);
  }

  function setPlaying(value) {
    playing = value;
    clearTimeout(autoplayTimer);
    if (playing && index === steps.length - 1) go(0);
    $("autoplay").replaceChildren(icon(playing ? "pause" : "play"), element("span", "", playing ? "Suspendre le parcours" : "Lire le parcours"));
    if (playing) scheduleNext();
  }

  function syncMotion() {
    const enabled = motion && !reducedMotion.matches;
    document.body.classList.toggle("motion-off", !enabled);
    $("motion").setAttribute("aria-pressed", String(enabled));
    $("motion").title = reducedMotion.matches ? "Animations réduites selon la préférence système" : enabled ? "Suspendre les animations" : "Activer les animations";
    if (!enabled) {
      cameraAnimation?.finish();
      setPlaying(false);
    }
  }

  function zoom(factor, point = { x: viewport.clientWidth / 2, y: viewport.clientHeight / 2 }) {
    setPlaying(false);
    const start = currentCamera();
    const scale = Math.min(2.5, Math.max(.09, start.scale * factor));
    moveCamera({ x: point.x - (point.x - start.x) * scale / start.scale, y: point.y - (point.y - start.y) * scale / start.scale, scale }, false);
  }

  function overview() {
    setPlaying(false);
    const board = boards.find((item) => item.id === steps[index].board);
    moveCamera(fit(board.bounds, board));
  }

  function showDialog(id) {
    setPlaying(false);
    $(id).showModal();
  }

  for (const board of boards) {
    const column = element("section");
    column.append(element("h3", "", board.id === "reel" ? "01 — Architecture réelle" : "02 — Architecture cible"));
    const list = element("ol");
    steps.forEach((step, stepIndex) => {
      if (step.board !== board.id) return;
      const row = element("li");
      const button = element("button");
      button.type = "button";
      button.value = stepIndex;
      button.append(element("span", "", String(stepIndex + 1).padStart(2, "0")), document.createTextNode(step.menu));
      button.addEventListener("click", () => {
        $("contents-dialog").close();
        go(stepIndex, { manual: true });
      });
      row.append(button);
      list.append(row);
    });
    column.append(list);
    $("contents-list").append(column);
  }

  $("show-real").addEventListener("click", () => go(0, { manual: true }));
  $("show-target").addEventListener("click", () => go(steps.findIndex((step) => step.board === "cible"), { manual: true }));
  $("previous").addEventListener("click", () => go(index - 1, { manual: true }));
  $("next").addEventListener("click", () => go(index + 1, { manual: true }));
  $("autoplay").addEventListener("click", () => setPlaying(!playing));
  $("motion").addEventListener("click", () => { motion = !motion; syncMotion(); });
  $("overview").addEventListener("click", overview);
  $("zoom-in").addEventListener("click", () => zoom(1.25));
  $("zoom-out").addEventListener("click", () => zoom(.8));
  $("contents").addEventListener("click", () => showDialog("contents-dialog"));
  $("help").addEventListener("click", () => showDialog("help-dialog"));
  $("fullscreen").addEventListener("click", async () => {
    if (!document.fullscreenElement) await document.documentElement.requestFullscreen?.();
    else await document.exitFullscreen?.();
  });
  for (const button of document.querySelectorAll("[data-close]")) button.addEventListener("click", () => button.closest("dialog").close());
  for (const dialog of document.querySelectorAll("dialog")) dialog.addEventListener("click", (event) => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
  });

  viewport.addEventListener("wheel", (event) => {
    if (event.ctrlKey) return;
    event.preventDefault();
    const bounds = viewport.getBoundingClientRect();
    zoom(Math.exp(-event.deltaY * .0015), { x: event.clientX - bounds.left, y: event.clientY - bounds.top });
  }, { passive: false });
  viewport.addEventListener("pointerdown", (event) => {
    if (event.target.closest("button") || !event.isPrimary || event.button !== 0) return;
    setPlaying(false);
    const start = currentCamera();
    cameraAnimation?.cancel();
    camera = start;
    world.style.transform = transform(camera);
    drag = { x: event.clientX, y: event.clientY, camera: start, moved: false };
    viewport.setPointerCapture(event.pointerId);
  });
  viewport.addEventListener("pointermove", (event) => {
    if (!drag) return;
    const dx = event.clientX - drag.x;
    const dy = event.clientY - drag.y;
    drag.moved = Math.hypot(dx, dy) > 3;
    moveCamera({ x: drag.camera.x + dx, y: drag.camera.y + dy, scale: drag.camera.scale }, false);
  });
  const endDrag = () => { drag = null; };
  viewport.addEventListener("pointerup", endDrag);
  viewport.addEventListener("pointercancel", endDrag);

  document.addEventListener("keydown", (event) => {
    if (document.querySelector("dialog[open]") || event.ctrlKey || event.metaKey || event.altKey) return;
    if (event.target.closest("input, select, textarea") || (event.code === "Space" && event.target.closest("button, a"))) return;
    const action = {
      ArrowRight: () => go(index + 1, { manual: true }),
      ArrowLeft: () => go(index - 1, { manual: true }),
      " ": () => setPlaying(!playing),
      o: overview,
      O: overview,
      f: () => $("fullscreen").click(),
      F: () => $("fullscreen").click(),
      "+": () => zoom(1.25),
      "=": () => zoom(1.25),
      "-": () => zoom(.8),
      "?": () => showDialog("help-dialog")
    }[event.key];
    if (action) { event.preventDefault(); action(); }
  });
  document.addEventListener("visibilitychange", () => { if (document.hidden) setPlaying(false); });
  window.addEventListener("hashchange", () => {
    const target = steps.findIndex((step) => `#${step.id}` === location.hash);
    if (target >= 0) go(target, { manual: true, updateURL: false });
  });
  new ResizeObserver(() => {
    const step = steps[index];
    const board = boards.find((item) => item.id === step.board);
    moveCamera(fit(step.focus || board.bounds, board), false);
  }).observe(viewport);
  reducedMotion.addEventListener("change", syncMotion);
  syncMotion();
  const initial = steps.findIndex((step) => `#${step.id}` === location.hash);
  go(initial < 0 ? 0 : initial, { animate: false });
})();
