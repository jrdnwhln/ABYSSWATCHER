const CACHE_NAME = "abyss-watchers-shell-v5";
const APP_SHELL = [
  "./",
  "./index.html",
  "./index.html?v=20260526a",
  "./crypto.html",
  "./research.html",
  "./radio.html",
  "./styles.css",
  "./styles.css?v=20260526a",
  "./app.js",
  "./app.js?v=20260526a",
  "./manifest.json",
  "./manifest.json?v=20260526a",
  "./assets/abyss-watchers-logo.PNG",
  "./assets/luna.jpeg"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  const isShellRequest =
    event.request.mode === "navigate" ||
    APP_SHELL.some((asset) => event.request.url.includes(asset.replace("./", "")));

  if (isShellRequest) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const cloned = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, cloned));
          return response;
        })
        .catch(() => caches.match(event.request).then((cached) => cached || caches.match("./index.html")))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) {
        return cached;
      }

      return fetch(event.request).then((response) => {
        const cloned = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, cloned));
        return response;
      });
    })
  );
});
