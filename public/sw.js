// Service Worker for 100% Offline PWA functionality
const CACHE_NAME = "autoestudio-v1";
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/src/css/variables.css",
  "/src/css/animations.css",
  "/src/css/responsive.css",
  "/src/css/darkmode.css"
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((k) => {
          if (k !== CACHE_NAME) return caches.delete(k);
        })
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  // Network first, fallback to cache for static assets
  if (e.request.method === "GET") {
    e.respondWith(
      fetch(e.request)
        .then((res) => {
          const resClone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(e.request, resClone));
          return res;
        })
        .catch(() => caches.match(e.request))
    );
  }
});
