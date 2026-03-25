const CACHE_NAME = 'latih-cache-v3';

const ASSETS = [
  './',
  './index.html',
  './admin/',
  './app/',
  './manifest.json',
  './assets/img/icon.svg',
  './assets/css/bootstrap.min.css',
  './assets/css/latih.css?v=2',
  './assets/css/themes.css',
  './assets/js/bootstrap.bundle.min.js',
  './assets/js/marked.min.js',
  './assets/js/mermaid.min.js',
  './assets/js/chart.min.js',
  './assets/js/latih.js',
  './assets/img/avatars/robot_blue.png',
  './assets/img/avatars/space_cat.png',
  './assets/img/avatars/astro_boy.png',
  './assets/img/avatars/astro_girl.png',
  './assets/img/avatars/holo_ai.png',
  './assets/img/avatars/alien_green.png',
  './modules/auth.js',
  './modules/paper-editor.js',
  './modules/paper-engine.js',
  './modules/leaderboard.js',
  './modules/grade-chart.js',
  './modules/kanban.js',
  './modules/reminders.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached version if found, otherwise hit network
        return response || fetch(event.request).catch(() => {
          // If offline and request fails (and we don't have cache), fail gracefully
          // Optional: Return a custom offline HTML here if needed, but we cache the core files.
        });
      })
  );
});
