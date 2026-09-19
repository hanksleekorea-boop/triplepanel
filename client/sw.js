const CACHE_PREFIX = "triple-panel-shell-";
const CACHE_NAME = `${CACHE_PREFIX}1.4.0`;
const SHELL = ["/", "/help", "/privacy", "/terms", "/support", "/status", "/app.css", "/app.js", "/domain.mjs", "/storage-contract.mjs", "/stage-two.mjs", "/stage-two-ui.mjs", "/stage-two-controller.mjs", "/stage-three.mjs", "/stage-three-ui.mjs", "/stage-three-controller.mjs", "/guides.mjs", "/ads-config.mjs", "/ads-runtime.mjs", "/manifest.webmanifest", "/icon-192.png", "/icon-512.png", "/offline.html"];
SHELL.push("/localization.mjs", "/locale-en.mjs");

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL)));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME).map((key) => caches.delete(key)))).then(() => self.clients.claim()));
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || /api|callback|signin|signout/i.test(url.pathname)) return;
  event.respondWith(fetch(request).then((response) => {
    const control = response.headers.get("cache-control") ?? "";
    if (response.ok && !response.headers.has("set-cookie") && !/no-store|private/i.test(control) && !url.hash) {
      const copy = response.clone(); caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
    }
    return response;
  }).catch(async () => (await caches.match(request)) ?? (request.mode === "navigate" ? (await caches.match("/")) ?? caches.match("/offline.html") : Response.error())));
});
