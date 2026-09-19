const VERSION = "0.2.0";
const CACHE_PREFIX = "triple-panel-shell-";
const CACHE_NAME = `${CACHE_PREFIX}${VERSION}`;
const APP_SHELL = [
  "/",
  "/offline.html",
  "/manifest.webmanifest",
  "/favicon.svg",
  "/icon-192.png",
  "/icon-512.png",
  "/triplepanel-qr.png",
  "/status.html",
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
});

function canCache(request, response) {
  if (!response || !response.ok || response.type !== "basic") return false;
  if (request.method !== "GET" || new URL(request.url).origin !== self.location.origin) return false;
  const control = response.headers.get("cache-control") ?? "";
  return !response.headers.has("set-cookie") && !/no-store|private/i.test(control);
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin) return;
  if (/^\/(api|callback|signin|signout)(\/|$)/.test(url.pathname)) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (canCache(request, response)) caches.open(CACHE_NAME).then((cache) => cache.put("/", response.clone()));
          return response;
        })
        .catch(async () => (await caches.match(request)) ?? (await caches.match("/")) ?? caches.match("/offline.html")),
    );
    return;
  }

  if (["script", "style", "image", "font", "manifest"].includes(request.destination)) {
    event.respondWith(
      caches.match(request).then(async (cached) => {
        if (cached) return cached;
        const response = await fetch(request);
        if (canCache(request, response)) (await caches.open(CACHE_NAME)).put(request, response.clone());
        return response;
      }),
    );
  }
});
