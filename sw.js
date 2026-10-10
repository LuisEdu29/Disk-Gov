const CACHE_NAME = 'disk-gov-v4';

// Só precisamos garantir que a "casca" do app esteja disponível de imediato.
// Os arquivos JS/CSS gerados pelo Vite (com hash no nome) são cacheados
// automaticamente na primeira vez que forem carregados (ver 'fetch' abaixo).
const PRECACHE_URLS = [
  '/Disk-Gov/',
  '/Disk-Gov/index.html',
  '/Disk-Gov/manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(names =>
      Promise.all(
        names
          .filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  // Só lidamos com GET; outros métodos (POST, etc.) vão direto pra rede.
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Só cuidamos de arquivos do próprio app. Firebase (login e banco de dados) e outras
  // APIs externas vão direto para a rede, sem passar pelo cache.
  if (url.origin !== self.location.origin) return;

  // Páginas: tenta a rede primeiro (assim as atualizações do app chegam logo)
  // e usa o cache só quando estiver offline.
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(networkResponse => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then(cache => cache.put('/Disk-Gov/index.html', responseClone));
          }
          return networkResponse;
        })
        .catch(() => caches.match('/Disk-Gov/index.html'))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) return cachedResponse;

      return fetch(event.request)
        .then(networkResponse => {
          // Só guarda respostas válidas, do próprio site (evita cachear
          // erros ou respostas de APIs externas como a de geolocalização).
          if (
            networkResponse &&
            networkResponse.status === 200 &&
            networkResponse.type === 'basic'
          ) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // Offline e sem cache: se for navegação de página, devolve o
          // index.html cacheado como fallback (útil para rotas internas).
          if (event.request.mode === 'navigate') {
            return caches.match('/Disk-Gov/index.html');
          }
        });
    })
  );
});
