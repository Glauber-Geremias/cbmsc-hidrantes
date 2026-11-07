// A versão vem do index.html (APP_VERSION), no endereço de registro deste arquivo.
const APP_VERSION = new URL(self.location.href).searchParams.get('v') || 'sem-versao';
const CACHE_NAME = 'atalho-operacional-' + APP_VERSION;
const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png'
];

const NETWORK_TIMEOUT_MS = 4000;

function networkFirst(request) {
  // "no-cache" revalida com o servidor em vez de usar o cache HTTP do
  // GitHub Pages (até 10 min). Requisições de navegação não aceitam
  // opções, por isso o fetch é feito pela URL.
  const network = fetch(request.url, { cache: 'no-cache', credentials: 'same-origin' })
    .then((res) => {
      if (res.ok) {
        const copy = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
      }
      return res;
    });
  network.catch(() => {});
  const timeout = new Promise((resolve) => setTimeout(resolve, NETWORK_TIMEOUT_MS))
    .then(() => caches.match(request));
  return Promise.race([network, timeout])
    .then((res) => res || network)
    .catch(() => caches.match(request));
}

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

  // App shell (mesma origem): rede primeiro, para a versão nova aparecer já
  // na primeira abertura; sem rede (ou rede lenta), usa o cache.
  if (url.origin === self.location.origin) {
    event.respondWith(networkFirst(request));
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
