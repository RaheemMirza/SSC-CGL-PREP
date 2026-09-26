// Minimal hand-written service worker (no build plugin needed).
// Caches the app shell so previously-visited pages, learning notes,
// formulas, and your locally-stored progress remain available offline.
// Note: this is intentionally simple. If you want richer offline
// behaviour (background sync, precise cache invalidation per release),
// swap this for `vite-plugin-pwa` — see README "PWA & Offline".
//
// All URLs below are relative to this file's own location (self.location),
// which is what makes this work unmodified whether the app is served from
// a domain root or a subpath like GitHub Pages' /<repo-name>/ — resolving
// "./index.html" always means "index.html next to sw.js", never a fixed
// absolute path.

const CACHE_NAME = "ssc-cgl-prep-shell-v1";
const APP_SHELL = ["./", "./index.html", "./manifest.json"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// Network-first for navigation/API-like requests, cache-first for
// static assets (JS/CSS/fonts/icons) so the shell works offline.
self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  const isStaticAsset = /\.(js|css|png|svg|woff2?|ico)$/.test(url.pathname);

  if (isStaticAsset) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((res) => {
            const clone = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
            return res;
          })
      )
    );
  } else {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return res;
        })
        .catch(() => caches.match(request).then((c) => c || caches.match("./index.html")))
    );
  }
});
