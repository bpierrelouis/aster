/* Service worker de l'application de recensement ; VERSION et FICHIERS le précèdent, ajoutés au build (vite.recon.config.ts) :
   - installation : précache de l'application et des ressources de lecture (ZXing, Tesseract, langue) ;
   - activation : suppression des caches des versions précédentes ;
   - navigation : réseau, sinon l'application en cache ; /api/* : jamais en cache (données chiffrées du relais). */
const CACHE = `recensement-${VERSION}`;

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(FICHIERS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys()
    .then((noms) => Promise.all(noms.filter((nom) => nom.startsWith('recensement-') && nom !== CACHE).map((nom) => caches.delete(nom))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin || url.pathname.startsWith('/api/')) return;
  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).catch(() => caches.match('/', { cacheName: CACHE })));
    return;
  }
  event.respondWith(caches.match(request, { cacheName: CACHE }).then((trouve) => trouve || fetch(request)));
});
