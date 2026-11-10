/** Référentiels de supervision et de déploiement : applications et règles de processus de départ. */
export function initializeOperations(state) {
  state.applications ??= [
    { id: 'app-firefox', nom: 'Firefox', version: '128 ESR', editeur: 'Mozilla' },
    { id: 'app-vscode', nom: 'Visual Studio Code', version: '1.95', editeur: 'Microsoft' },
    { id: 'app-libreoffice', nom: 'LibreOffice', version: '24.8', editeur: 'The Document Foundation' },
    { id: 'app-putty', nom: 'PuTTY', version: '0.82', editeur: 'Simon Tatham' },
  ];
  state.installations ??= state.postes.flatMap((p, i) => state.applications.slice(0, i % 3 + 1).map(a => ({ id: `${p.id}-${a.id}`, posteId: p.id, salleId: p.salleId, ecoleId: state.salles.find(s => s.id === p.salleId)?.ecoleId, applicationId: a.id })));
  state.processus ??= state.postes.filter(p => p.connecte).flatMap((p, i) => ['firefox.exe', 'Code.exe', ...(i % 4 === 0 ? ['putty.exe'] : [])].map((nom, j) => ({ id: `exec-${p.id}-${j}`, posteId: p.id, salleId: p.salleId, ecoleId: state.salles.find(s => s.id === p.salleId)?.ecoleId, nom, compte: `stagiaire.${String(i % 40 + 1).padStart(2, '0')}`, startedAt: Date.now() - (i + 10) * 60000, stoppedAt: null })));
  state.regles ??= [
    { id: 'rule-firefox', nom: 'firefox.exe', classement: 'whitelist', portee: 'global', ecoleId: null },
    { id: 'rule-code', nom: 'Code.exe', classement: 'whitelist', portee: 'global', ecoleId: null },
    { id: 'rule-steam', nom: 'steam.exe', classement: 'blacklist', portee: 'global', ecoleId: null },
  ];
  state.operations ??= [];
  return state;
}
export function processClass(state, process) {
  const salle = state.salles.find(s => s.id === process.salleId);
  const rules = (state.regles || []).filter(r => r.nom.toLowerCase() === process.nom.toLowerCase() && (
    r.portee === 'global' || r.ecoleId === salle?.ecoleId && (r.portee === 'ecole' || r.portee === 'batiment' && r.batiment === salle?.batiment || r.portee === 'salle' && r.salleId === salle?.id)
  ));
  return rules.some(r => r.classement === 'blacklist') ? 'blacklist' : rules.some(r => r.classement === 'whitelist') ? 'whitelist' : 'nonref';
}
