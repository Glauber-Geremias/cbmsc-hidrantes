const CACHE_NAME = 'hidrantes-cbmsc-v5';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Gravações (login, cadastro de hidrantes) nunca passam pelo cache.
  if (request.method !== 'GET') return;

  // API do Supabase: sempre rede; o app guarda a última lista por conta própria.
  if (url.hostname.endsWith('.supabase.co')) return;

  // Dados dos hidrantes: sempre tenta a rede primeiro (pega atualizações),
  // cai para o cache se estiver offline.
  if (url.pathname.endsWith('hidrantes.csv')) {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          return res;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // App shell (mesma origem): cache primeiro, atualiza em segundo plano.
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const fetchPromise = fetch(request)
          .then((res) => {
            const copy = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
            return res;
          })
          .catch(() => cached);
        return cached || fetchPromise;
      })
    );
    return;
  }

  // Bibliotecas (Leaflet, Supabase) com versão fixa: guarda no cache para uso offline.
  if (url.hostname === 'unpkg.com' || url.hostname === 'cdn.jsdelivr.net') {
    event.respondWith(
      caches.match(request).then((cached) => cached || fetch(request).then((res) => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        return res;
      }))
    );
    return;
  }

  // Demais recursos externos (tiles do mapa): tenta rede, sem forçar cache.
  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  );
});
