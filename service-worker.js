const CACHE_NAME = "sumoku-cache-v5";

const ASSETS = [
  "./",
  "./index.html",
  "./izy-sumoku_7x7-v5.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png"
];

// Install: cache core assets and activate immediately
self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

// Activate: remove old caches and take control immediately
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

// Fetch: cache-first for same-origin GET requests, network fallback
self.addEventListener("fetch", (event) => {
  const req = event.request;

  // Only handle GET
  if (req.method !== "GET") return;

  const url = new URL(req.url);

  // Only handle same-origin requests (your site files)
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req).then((fresh) => {
        // Optionally cache the fresh response for next time
        const copy = fresh.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
        return fresh;
      });
    })
  );
});
