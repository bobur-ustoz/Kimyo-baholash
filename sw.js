// Top Xodim — offline qobiq (app shell)
const CACHE = 'topxodim-v0.7.0';
const FILES = ['./', './index.html', './manifest.json', './css/app.css',
  './js/config.js', './js/data.js', './js/store.js', './js/store-firebase.js', './js/auth.js', './js/match.js', './js/ui.js', './js/pdf.js', './js/app.js',
  './icons/icon.svg', './icons/icon-192.png', './icons/icon-512.png'];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET' || !e.request.url.startsWith(self.location.origin)) return;
  e.respondWith(caches.match(e.request).then((r) => r || fetch(e.request).then((res) => { const cp = res.clone(); caches.open(CACHE).then((c) => c.put(e.request, cp)); return res; })));
});
