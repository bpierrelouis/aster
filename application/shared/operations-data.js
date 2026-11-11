/** Référentiels de supervision et de déploiement : logiciels connus, applications et règles de processus de départ. */

/**
 * Logiciels connus des postes Windows : exécutables, nom de l'application, logo (assets/apps ; sans logo,
 * cercle barré) et classement de départ des exécutables (whitelist ou blacklist ; sans classement : non référencé).
 * Sert à l'icône d'un processus ou d'une application, à la recherche par nom d'application et aux règles de départ.
 */
export const LOGICIELS = [
  // Navigateurs
  { nom: 'Firefox', exe: ['firefox.exe'], logo: 'firefox', classement: 'whitelist' },
  { nom: 'Google Chrome', exe: ['chrome.exe'], logo: 'chrome', classement: 'whitelist' },
  { nom: 'Microsoft Edge', exe: ['msedge.exe'], logo: 'edge', classement: 'whitelist' },
  // Développement
  { nom: 'Visual Studio Code', exe: ['Code.exe'], logo: 'vscode', classement: 'whitelist' },
  { nom: 'Visual Studio', exe: ['devenv.exe'], logo: 'visualstudio', classement: 'whitelist' },
  { nom: 'IntelliJ IDEA', exe: ['idea64.exe'], logo: 'intellij', classement: 'whitelist' },
  { nom: 'PyCharm', exe: ['pycharm64.exe'], logo: 'pycharm', classement: 'whitelist' },
  { nom: 'Eclipse IDE', exe: ['eclipse.exe'], logo: 'eclipse', classement: 'whitelist' },
  { nom: 'Notepad++', exe: ['notepad++.exe'], logo: 'notepadplusplus', classement: 'whitelist' },
  { nom: 'Git', exe: ['git.exe', 'git-bash.exe'], logo: 'git', classement: 'whitelist' },
  { nom: 'Node.js', exe: ['node.exe'], logo: 'nodejs', classement: 'whitelist' },
  { nom: 'Python', exe: ['python.exe', 'pythonw.exe'], logo: 'python', classement: 'whitelist' },
  { nom: 'Docker Desktop', exe: ['Docker Desktop.exe'], logo: 'docker', classement: 'whitelist' },
  { nom: 'Postman', exe: ['Postman.exe'], logo: 'postman', classement: 'whitelist' },
  { nom: 'DBeaver', exe: ['dbeaver.exe'], classement: 'whitelist' },
  { nom: 'Terminal Windows', exe: ['WindowsTerminal.exe'], classement: 'whitelist' },
  { nom: 'PowerShell', exe: ['powershell.exe', 'pwsh.exe'], classement: 'whitelist' },
  { nom: 'PuTTY', exe: ['putty.exe'], logo: 'putty', classement: 'whitelist' },
  { nom: 'WinSCP', exe: ['WinSCP.exe'], classement: 'whitelist' },
  // Bureautique et communication
  { nom: 'LibreOffice', exe: ['soffice.exe', 'soffice.bin'], logo: 'libreoffice', classement: 'whitelist' },
  { nom: 'Microsoft Teams', exe: ['ms-teams.exe'], logo: 'teams', classement: 'whitelist' },
  // Loisirs, non référencés : détectés et historisés
  { nom: 'VLC', exe: ['vlc.exe'], logo: 'vlc' },
  { nom: 'Discord', exe: ['Discord.exe'], logo: 'discord' },
  { nom: 'Spotify', exe: ['Spotify.exe'], logo: 'spotify' },
  // Jeux et plateformes de jeux
  { nom: 'Steam', exe: ['steam.exe'], logo: 'steam', classement: 'blacklist' },
  { nom: 'Epic Games Launcher', exe: ['EpicGamesLauncher.exe'], classement: 'blacklist' },
  { nom: 'Riot Client', exe: ['RiotClientServices.exe', 'LeagueClient.exe'], logo: 'riotgames', classement: 'blacklist' },
  { nom: 'Battle.net', exe: ['Battle.net.exe'], logo: 'battlenet', classement: 'blacklist' },
  { nom: 'EA app', exe: ['EADesktop.exe'], classement: 'blacklist' },
  { nom: 'Roblox', exe: ['RobloxPlayerBeta.exe'], classement: 'blacklist' },
  { nom: 'Minecraft', exe: ['MinecraftLauncher.exe', 'Minecraft.Windows.exe'], classement: 'blacklist' },
  // Téléchargement pair à pair
  { nom: 'uTorrent', exe: ['uTorrent.exe'], logo: 'utorrent', classement: 'blacklist' },
  { nom: 'BitTorrent', exe: ['BitTorrent.exe'], classement: 'blacklist' },
  { nom: 'qBittorrent', exe: ['qbittorrent.exe'], logo: 'qbittorrent', classement: 'blacklist' },
  { nom: 'Transmission', exe: ['transmission-qt.exe'], classement: 'blacklist' },
  // Contournement du filtrage et prise de main à distance non autorisée
  { nom: 'Tor Browser', exe: ['tor.exe'], logo: 'tor', classement: 'blacklist' },
  { nom: 'NordVPN', exe: ['NordVPN.exe'], logo: 'nordvpn', classement: 'blacklist' },
  { nom: 'Proton VPN', exe: ['ProtonVPN.exe'], logo: 'protonvpn', classement: 'blacklist' },
  { nom: 'Psiphon', exe: ['psiphon3.exe'], classement: 'blacklist' },
  { nom: 'AnyDesk', exe: ['AnyDesk.exe'], logo: 'anydesk', classement: 'blacklist' },
  { nom: 'TeamViewer', exe: ['TeamViewer.exe'], classement: 'blacklist' },
  // Triche
  { nom: 'Cheat Engine', exe: ['cheatengine-x86_64.exe'], classement: 'blacklist' },
];

// Clé de recherche d'un exécutable ou d'une application : sans « .exe », casse ni ponctuation (« Code.exe » → code)
const keyOf = (name) => String(name ?? '').toLowerCase().replace(/\.exe$/, '').replace(/[^a-z0-9]/g, '');
const BY_KEY = new Map(LOGICIELS.flatMap((l) => [l.nom, ...l.exe].map((n) => [keyOf(n), l])));

/** Logiciel connu d'après un nom d'exécutable (« Code.exe ») ou d'application (« Visual Studio Code ») */
export const logiciel = (name) => BY_KEY.get(keyOf(name));

/** Référentiels des opérations : applications déployables et règles globales de départ (l'activité des postes part de zéro) */
export function initializeOperations(state) {
  state.applications ??= [
    { id: 'app-firefox', nom: 'Firefox', version: '128 ESR', editeur: 'Mozilla' },
    { id: 'app-vscode', nom: 'Visual Studio Code', version: '1.95', editeur: 'Microsoft' },
    { id: 'app-libreoffice', nom: 'LibreOffice', version: '24.8', editeur: 'The Document Foundation' },
    { id: 'app-putty', nom: 'PuTTY', version: '0.82', editeur: 'Simon Tatham' },
    { id: 'app-git', nom: 'Git', version: '2.47', editeur: 'Git for Windows' },
    { id: 'app-python', nom: 'Python', version: '3.13', editeur: 'Python Software Foundation' },
    { id: 'app-nodejs', nom: 'Node.js', version: '22 LTS', editeur: 'OpenJS Foundation' },
    { id: 'app-notepadpp', nom: 'Notepad++', version: '8.7', editeur: 'Don Ho' },
    { id: 'app-intellij', nom: 'IntelliJ IDEA', version: '2024.3', editeur: 'JetBrains' },
    { id: 'app-pycharm', nom: 'PyCharm', version: '2024.3', editeur: 'JetBrains' },
    { id: 'app-eclipse', nom: 'Eclipse IDE', version: '2024-12', editeur: 'Eclipse Foundation' },
    { id: 'app-docker', nom: 'Docker Desktop', version: '4.36', editeur: 'Docker' },
    { id: 'app-postman', nom: 'Postman', version: '11', editeur: 'Postman' },
    { id: 'app-dbeaver', nom: 'DBeaver', version: '24.3', editeur: 'DBeaver Corp' },
    { id: 'app-winscp', nom: 'WinSCP', version: '6.3', editeur: 'Martin Přikryl' },
  ];
  // Règles globales de départ : une par exécutable classé (rule-firefox, rule-code, rule-steam…)
  state.regles ??= LOGICIELS.filter((l) => l.classement).flatMap((l) => l.exe.map((nom) => ({
    id: `rule-${nom.toLowerCase().replace(/\.exe$/, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`,
    nom, classement: l.classement, portee: 'global', ecoleId: null,
  })));
  return state;
}
export function processClass(state, process) {
  const salle = state.salles.find(s => s.id === process.salleId);
  const rules = (state.regles || []).filter(r => r.nom.toLowerCase() === process.nom.toLowerCase() && (
    r.portee === 'global' || r.ecoleId === salle?.ecoleId && (r.portee === 'ecole' || r.portee === 'batiment' && r.batiment === salle?.batiment || r.portee === 'salle' && r.salleId === salle?.id)
  ));
  return rules.some(r => r.classement === 'blacklist') ? 'blacklist' : rules.some(r => r.classement === 'whitelist') ? 'whitelist' : 'nonref';
}
