/* ==========================================================================
   ORION · Jeu d'icônes (grille 24, trait 2, extrémités rondes)
   Les icônes métier de la charte ORION (grille 28) sont intégrées telles quelles,
   avec une couche « verre » pour le style duotone.
   - class "d" : couche « verre » (remplissage translucide)
   - class "f" : remplissage plein (points)
   Rendues par les composants Icon et Tile (ui/icons.tsx)
   ========================================================================== */

/* Icônes métier de la charte ORION (design/assets/icons), grille 28 */
export const A = {
  materiel: '<rect class="d" x="3.5" y="4.5" width="21" height="15" rx="2"/><path d="M9 23.5h10M12 19.5v4M16 19.5v4"/>',
  salles: '<path class="d" d="M4 24V5.5A1.5 1.5 0 0 1 5.5 4h12A1.5 1.5 0 0 1 19 5.5V24"/><path d="M19 10h3.5A1.5 1.5 0 0 1 24 11.5V24M2.5 24h23"/><path d="M8 8h2M13 8h2M8 12h2M13 12h2M8 16h2M13 16h2"/>',
  administration: '<circle class="d" cx="14" cy="14" r="4"/><path d="M14 3.5v3M14 21.5v3M3.5 14h3M21.5 14h3M6.6 6.6l2.1 2.1M19.3 19.3l2.1 2.1M21.4 6.6l-2.1 2.1M8.7 19.3l-2.1 2.1"/>',
  supervision: '<path class="d" d="M2.8 14s4.2-6.5 11.2-6.5S25.2 14 25.2 14 21 20.5 14 20.5 2.8 14 2.8 14Z"/><circle cx="14" cy="14" r="3.2"/>',
  alertes: '<path class="d" d="M14 3.5 25 23H3L14 3.5Z"/><path d="M14 10v6M14 20h.01"/>',
  documents: '<path class="d" d="M7 3.5h9l5 5V24.5H7Z"/><path d="M16 3.5v5h5M10.5 13h7M10.5 17h7M10.5 21h4.5"/>',
  recherche: '<circle class="d" cx="12.5" cy="12.5" r="7.5"/><path d="m18 18 6 6"/>',
  deplacement: '<path d="M14 3v22M3 14h22M10 7l4-4 4 4M10 21l4 4 4-4M7 10l-4 4 4 4M21 10l4 4-4 4"/>',
};

export const P = {
  /* Navigation */
  home: '<rect class="d" x="3" y="3" width="8" height="8" rx="2.5"/><rect x="13" y="3" width="8" height="5" rx="2"/><rect x="13" y="10.5" width="8" height="10.5" rx="2.5"/><rect x="3" y="13.5" width="8" height="7.5" rx="2.5"/>',
  building: '<path class="d" d="M4.5 20.5V7.3a1.5 1.5 0 0 1 1-1.4l6.6-2.4a1 1 0 0 1 1.4.9v16.1"/><path d="M13.5 9.5H18a1.5 1.5 0 0 1 1.5 1.5v9.5"/><path d="M2.5 20.5h19"/><path d="M8 9h2M8 12.5h2M8 16h2M16 13.5h.5M16 17h.5"/>',
  devices: '<rect class="d" x="2.5" y="4.5" width="12" height="9" rx="1.8"/><path d="M1.5 17.5h11"/><rect x="16" y="8.5" width="6" height="11.5" rx="1.6"/><path d="M18.5 17.5h1"/>',
  ticket: '<path class="d" d="M3.5 7A1.5 1.5 0 0 1 5 5.5h14A1.5 1.5 0 0 1 20.5 7v2.3a2.7 2.7 0 0 0 0 5.4V17a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 17v-2.3a2.7 2.7 0 0 0 0-5.4Z"/><path d="M14.5 8v1.2M14.5 11.4v1.2M14.5 14.8V16"/>',
  process: '<circle class="d" cx="6" cy="6" r="2.75"/><rect x="15" y="3.25" width="6" height="5.5" rx="1.6"/><circle cx="18" cy="18" r="2.75"/><path d="M8.75 6H15M18 8.75v6.5M15.25 18H9a3 3 0 0 1-3-3V8.75"/>',
  sliders: '<path d="M4 7h8M18 7h2M4 17h2M12 17h8"/><circle class="d" cx="15" cy="7" r="2.75"/><circle class="d" cx="9" cy="17" r="2.75"/>',
  crystal: '<path class="d" d="M12 2.5 19.5 8 12 21.5 4.5 8Z"/><path d="M4.5 8h15M9 8l3-5.5L15 8l-3 13.5Z"/>',
  gear: '<path class="d" d="M10.14 5.05 10.51 2.62H13.49L13.86 5.05A7.2 7.2 0 0 1 15.6 5.76L17.58 4.31 19.69 6.42 18.24 8.4A7.2 7.2 0 0 1 18.95 10.14L21.38 10.51V13.49L18.95 13.86A7.2 7.2 0 0 1 18.24 15.6L19.69 17.58 17.58 19.69 15.6 18.24A7.2 7.2 0 0 1 13.86 18.95L13.49 21.38H10.51L10.14 18.95A7.2 7.2 0 0 1 8.4 18.24L6.42 19.69 4.31 17.58 5.76 15.6A7.2 7.2 0 0 1 5.05 13.86L2.62 13.49V10.51L5.05 10.14A7.2 7.2 0 0 1 5.76 8.4L4.31 6.42 6.42 4.31 8.4 5.76A7.2 7.2 0 0 1 10.14 5.05Z"/><circle cx="12" cy="12" r="3"/>',

  /* Actions */
  plus: '<path d="M12 5v14M5 12h14"/>',
  minus: '<path d="M6 12h12"/>',
  close: '<path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/>',
  check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
  pencil: '<path class="d" d="M15.6 4.4a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z"/><path d="m13.6 6.4 3 3"/>',
  trash: '<path d="M4 7h16M9.5 7V5.2A1.2 1.2 0 0 1 10.7 4h2.6a1.2 1.2 0 0 1 1.2 1.2V7"/><path class="d" d="m6 7 .9 12.1a2 2 0 0 0 2 1.9h6.2a2 2 0 0 0 2-1.9L18 7"/><path d="M10 11v6M14 11v6"/>',
  search: '<circle class="d" cx="10.5" cy="10.5" r="6.5"/><path d="m15.5 15.5 5 5"/>',
  bell: '<path class="d" d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 2h-15Z"/><path d="M10 21.2h4"/>',
  sun: '<circle class="d" cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4"/>',
  moon: '<path class="d" d="M20 14.6A8.5 8.5 0 0 1 9.4 4 8.5 8.5 0 1 0 20 14.6Z"/>',
  chevL: '<path d="m14.5 5.5-6.5 6.5 6.5 6.5"/>',
  chevR: '<path d="m9.5 5.5 6.5 6.5-6.5 6.5"/>',
  chevD: '<path d="m5.5 9.5 6.5 6.5 6.5-6.5"/>',
  grip: '<circle class="f" cx="9" cy="6" r="1.4"/><circle class="f" cx="15" cy="6" r="1.4"/><circle class="f" cx="9" cy="12" r="1.4"/><circle class="f" cx="15" cy="12" r="1.4"/><circle class="f" cx="9" cy="18" r="1.4"/><circle class="f" cx="15" cy="18" r="1.4"/>',
  more: '<circle class="f" cx="5.5" cy="12" r="1.7"/><circle class="f" cx="12" cy="12" r="1.7"/><circle class="f" cx="18.5" cy="12" r="1.7"/>',
  move: '<path d="M12 3v18M3 12h18M9.2 5.8 12 3l2.8 2.8M9.2 18.2 12 21l2.8-2.8M5.8 9.2 3 12l2.8 2.8M18.2 9.2 21 12l-2.8 2.8"/>',
  resize: '<path d="M14 20.5h6.5V14M10 3.5H3.5V10M20.5 20.5 14 14M3.5 3.5 10 10"/>',
  eye: '<path class="d" d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z"/><circle cx="12" cy="12" r="3"/>',
  widgets: '<rect class="d" x="3" y="3" width="8" height="8" rx="2.5"/><rect x="13" y="3" width="8" height="8" rx="2.5"/><rect x="3" y="13" width="8" height="8" rx="2.5"/><path d="M17 14v6M14 17h6"/>',
  refresh: '<path d="M20 11a8 8 0 0 0-14.3-4.6L4 8.5M4 13a8 8 0 0 0 14.3 4.6L20 15.5"/><path d="M4 4v4.5h4.5M20 20v-4.5h-4.5"/>',
  layers: '<path class="d" d="m12 3.5 8.5 4.5-8.5 4.5L3.5 8Z"/><path d="m3.5 12 8.5 4.5 8.5-4.5M3.5 16l8.5 4.5 8.5-4.5"/>',
  draw: '<rect class="d" x="4" y="4" width="16" height="16" rx="2" stroke-dasharray="3 3"/><path d="M12 9v6M9 12h6"/>',

  /* Entités & métadonnées */
  door: '<path class="d" d="M6 21V4.6a1 1 0 0 1 1-1.1h10a1 1 0 0 1 1 1.1V21"/><path d="M3.5 21h17M14.5 12.5v.6"/>',
  users: '<circle class="d" cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.6a3.5 3.5 0 0 1 0 6.8M18.5 14.2a6.5 6.5 0 0 1 3 5.8"/>',
  user: '<circle class="d" cx="12" cy="8" r="4"/><path d="M4.5 20.5a7.5 7.5 0 0 1 15 0"/>',
  shield: '<path class="d" d="M12 3 4.5 6v5.5c0 4.6 3.2 8.2 7.5 9.5 4.3-1.3 7.5-4.9 7.5-9.5V6Z"/><path d="m9 12 2 2 4-4"/>',
  key: '<circle class="d" cx="8" cy="15.5" r="4.5"/><path d="m11.2 12.3 8.8-8.8M16.8 6.7l2.6 2.6M14.3 9.2l2 2"/>',
  wrench: '<path class="d" d="M14.7 3.7a5 5 0 0 0-4.8 6.6l-6.1 6.1a2.3 2.3 0 0 0 3.3 3.3l6.1-6.1a5 5 0 0 0 6.6-4.8l-3.1 3.1-3.1-.6-.6-3.1Z"/>',
  power: '<path d="M12 3v8"/><path d="M7.1 6.3a7.5 7.5 0 1 0 9.8 0"/>',
  checkCircle: '<circle class="d" cx="12" cy="12" r="9"/><path d="m8 12.3 2.8 2.8L16.2 9.5"/>',
  alert: '<path class="d" d="M10.3 4.2 2.8 17.5a2 2 0 0 0 1.7 3h15a2 2 0 0 0 1.7-3L13.7 4.2a2 2 0 0 0-3.4 0Z"/><path d="M12 9.5v4M12 17h.01"/>',
  clock: '<circle class="d" cx="12" cy="12" r="9"/><path d="M12 7.5V12l3 2"/>',
  pin: '<path class="d" d="M12 21s7-6.2 7-11.5a7 7 0 0 0-14 0C5 14.8 12 21 12 21Z"/><circle cx="12" cy="9.5" r="2.5"/>',
  calendar: '<rect class="d" x="3.5" y="5" width="17" height="15.5" rx="3"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
  hand: '<path class="d" d="M8 12.5V5.8a1.5 1.5 0 0 1 3 0V11V4.3a1.5 1.5 0 0 1 3 0V11V5.8a1.5 1.5 0 0 1 3 0v8.4a6.8 6.8 0 0 1-6.8 6.8h-.4a6 6 0 0 1-4.9-2.6L3.6 14a1.6 1.6 0 0 1 2.5-2Z"/>',
  auto: '<path d="M13 2.5 5 13.5h6l-1 8 8-11h-6Z" class="d"/>',
  inbox: '<path class="d" d="M3.5 13.5 6 5.5h12l2.5 8V18a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2Z"/><path d="M3.5 13.5H8l1.5 2.5h5l1.5-2.5h4.5"/>',
  pause: '<circle class="d" cx="12" cy="12" r="9"/><path d="M10 9v6M14 9v6"/>',
  flag: '<path class="d" d="M5 3.5v17M5 4h11l-2.2 4L16 12H5"/>',
  clipboardCheck: '<rect class="d" x="4.5" y="4.5" width="15" height="17" rx="2.5"/><path d="M9 3h6v3H9Z"/><path d="m8.8 13.6 2.3 2.3 4.4-4.6"/>',

  /* Graphiques */
  chartLine: '<path d="M3.5 3.5v17h17"/><path d="m7 15 4-5 3.5 3L20 6.5"/>',
  chartBar: '<path d="M3.5 20.5h17"/><rect class="d" x="5" y="11" width="3.5" height="9.5" rx="1"/><rect class="d" x="10.25" y="5" width="3.5" height="15.5" rx="1"/><rect class="d" x="15.5" y="8.5" width="3.5" height="12" rx="1"/>',
  list: '<path d="M9.5 6.5h11M9.5 12h11M9.5 17.5h11"/><circle class="f" cx="4.75" cy="6.5" r="1.4"/><circle class="f" cx="4.75" cy="12" r="1.4"/><circle class="f" cx="4.75" cy="17.5" r="1.4"/>',
  gauge: '<path class="d" d="M3.5 16.5a8.5 8.5 0 1 1 17 0Z"/><path d="m12 16.5 4.2-5"/><circle class="f" cx="12" cy="16.5" r="1.7"/>',
  ring: '<circle cx="12" cy="12" r="8.5" stroke-opacity=".3"/><path d="M12 3.5a8.5 8.5 0 1 1-8.1 11.1"/>',
  stack: '<rect class="d" x="3" y="4.5" width="18" height="4" rx="1.5"/><rect x="3" y="10" width="12" height="4" rx="1.5"/><rect x="3" y="15.5" width="7" height="4" rx="1.5"/>',

  /* Équipements */
  laptop: '<rect class="d" x="4" y="4.5" width="16" height="11" rx="1.8"/><path d="M4 15.5 2 19.5h20l-2-4"/>',
  desktop: '<rect class="d" x="2.5" y="4" width="13" height="10" rx="1.8"/><path d="M9 14v3.8M5.8 19.5h6.4"/><rect x="18" y="4" width="3.5" height="15.5" rx="1.2"/><path d="M19.75 7.5h.01"/>',
  monitor: '<rect class="d" x="2.5" y="3.5" width="19" height="13" rx="2"/><path d="M12 16.5v3.8M8 20.5h8"/>',
  projector: '<rect class="d" x="2.5" y="8.5" width="19" height="8.5" rx="2.5"/><circle cx="15.5" cy="12.75" r="2.4"/><path d="M6 12.75h3.5M6 17v2.2M18 17v2.2M15.5 4v2M12 5l1 1.5M19 5l-1 1.5"/>',
  printer: '<path d="M7 8.5V3.5h10v5"/><rect class="d" x="2.5" y="8.5" width="19" height="8.5" rx="2"/><rect x="7" y="14" width="10" height="6.5" rx="1"/><path d="M17.5 11.5h.01"/>',
  network: '<path d="M2.5 9a14 14 0 0 1 19 0M5.6 12.4a9.5 9.5 0 0 1 12.8 0M8.7 15.8a5 5 0 0 1 6.6 0"/><circle class="f" cx="12" cy="19.2" r="1.6"/>',
  tablet: '<rect class="d" x="4.5" y="2.5" width="15" height="19" rx="2.5"/><path d="M10.5 18.5h3"/>',
  server: '<rect class="d" x="3.5" y="3.5" width="17" height="7" rx="2"/><rect x="3.5" y="13.5" width="17" height="7" rx="2"/><path d="M7 7h.01M7 17h.01M11 7h6M11 17h6"/>',
  periph: '<rect class="d" x="2.5" y="10.5" width="13" height="9" rx="1.8"/><path d="M5.5 13.5h.01M8.5 13.5h.01M11.5 13.5h.01M6 16.5h6"/><rect x="17.5" y="7.5" width="4.5" height="12" rx="2.25"/><path d="M19.75 9.8v2"/>',

  /* Types de salles */
  formation: '<rect class="d" x="3" y="3.5" width="18" height="11.5" rx="1.8"/><path d="M8.5 20.5 10.3 15M15.5 20.5 13.7 15M7 11l3-3 2.5 2 4.5-4"/>',
  reunion: '<rect class="d" x="4" y="8.5" width="16" height="7" rx="3.5"/><path d="M6.5 4.8h3M14.5 4.8h3M6.5 19.2h3M14.5 19.2h3"/>',
  bureau: '<rect class="d" x="7" y="3.5" width="10" height="6.5" rx="1.2"/><path d="M12 10v2.5M3 12.5h18M5 12.5v8M19 12.5v8"/>',
  technique: '<rect class="d" x="5" y="2.5" width="14" height="19" rx="2"/><path d="M8.5 6.5h7M8.5 10h7M8.5 13.5h7M8.5 17.5h.01M11.5 17.5h.01"/>',
  stockage: '<path class="d" d="M3.5 7.5 12 3l8.5 4.5v9L12 21l-8.5-4.5Z"/><path d="M3.5 7.5 12 12l8.5-4.5M12 12v9"/>',

  /* ORION : entités et actions */
  tower: '<rect class="d" x="6.5" y="2.5" width="11" height="19" rx="2"/><path d="M9.5 6.5h5M9.5 9.5h5M12 16.5h.01"/>',
  switch: '<rect class="d" x="2.5" y="9" width="19" height="7.5" rx="2"/><path d="M6 12.75h.01M9 12.75h.01M12 12.75h.01M15 12.75h.01M18 12.75h.01M7 9V6.5h10V9"/>',
  speaker: '<rect class="d" x="5.5" y="2.5" width="13" height="19" rx="2.5"/><circle cx="12" cy="14.5" r="3.5"/><path d="M12 7h.01"/>',
  school: '<path class="d" d="M2.5 9 12 4.5 21.5 9 12 13.5Z"/><path d="M6.5 11v4.5c0 1.5 2.5 3 5.5 3s5.5-1.5 5.5-3V11M21.5 9v5"/>',
  swap: '<path d="M4 8h15l-3.5-3.5M20 16H5l3.5 3.5"/>',
  broken: '<rect class="d" x="3.5" y="3.5" width="17" height="17" rx="3"/><path d="M12.5 3.5 10 9l4 3-3 4 1 4.5"/>',
  malfunction: '<circle class="d" cx="12" cy="12" r="9"/><path d="M12 7v5.5M12 16.5h.01"/>',
  importJson: '<path d="M12 3.5v11M7.5 10l4.5 4.5 4.5-4.5"/><path class="d" d="M3.5 14.5v4a2 2 0 0 0 2 2h13a2 2 0 0 0 2-2v-4"/>',
  download: '<path d="M12 4v10.5M7.5 10.5 12 15l4.5-4.5"/><path d="M4.5 19.5h15"/>',
  print: '<path d="M7 8.5V3.5h10v5"/><rect class="d" x="2.5" y="8.5" width="19" height="8.5" rx="2"/><rect x="7" y="14" width="10" height="6.5" rx="1"/>',
  shieldX: '<path class="d" d="M12 3 4.5 6v5.5c0 4.6 3.2 8.2 7.5 9.5 4.3-1.3 7.5-4.9 7.5-9.5V6Z"/><path d="m9.5 9.5 5 5M14.5 9.5l-5 5"/>',
  hourglass: '<path d="M6.5 3.5h11M6.5 20.5h11"/><path class="d" d="M7.5 3.5c0 4 4.5 5.5 4.5 8.5s-4.5 4.5-4.5 8.5h9c0-4-4.5-5.5-4.5-8.5s4.5-4.5 4.5-8.5Z"/>',
  calendarWarn: '<rect class="d" x="3.5" y="5" width="17" height="15.5" rx="3"/><path d="M3.5 10h17M8 3v4M16 3v4M12 13v3M12 18.2h.01"/>',

  /* Problèmes (remontées) */
  noPower: '<path d="M9 2.5v4M15 2.5v4"/><path class="d" d="M6.5 6.5h11v4a5.5 5.5 0 0 1-11 0Z"/><path d="M12 16v5.5"/>',
  noDisplay: '<rect class="d" x="2.5" y="3.5" width="19" height="13" rx="2"/><path d="M12 16.5v3.8M8 20.5h8M9.5 7.5l5 5M14.5 7.5l-5 5"/>',
  noNetwork: '<path d="M2.5 9a14 14 0 0 1 4.2-2.6M10.4 5.6A14 14 0 0 1 21.5 9M5.6 12.4a9.5 9.5 0 0 1 3.6-2M14.6 10.8a9.5 9.5 0 0 1 3.8 1.6M8.7 15.8a5 5 0 0 1 6.6 0"/><circle class="f" cx="12" cy="19.2" r="1.6"/><path d="M3.5 3.5l17 17"/>',
  software: '<rect class="d" x="2.5" y="4" width="19" height="16" rx="2.5"/><path d="M2.5 8.5h19M6 6.25h.01M8.5 6.25h.01M9 13l-2 1.8L9 16.6M15 13l2 1.8-2 1.8M13 12l-2 5.5"/>',
  other: '<circle class="d" cx="12" cy="12" r="9"/><circle class="f" cx="8" cy="12" r="1.3"/><circle class="f" cx="12" cy="12" r="1.3"/><circle class="f" cx="16" cy="12" r="1.3"/>',
};
