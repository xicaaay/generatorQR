/*
 * Service worker de QR Generator: permite usar la app sin conexión.
 * - Páginas: red primero; si no hay conexión, la versión guardada.
 * - Recursos con hash (/_next/static, /icons): caché primero.
 * - Payloads RSC de Next: siempre a la red (no se guardan para evitar
 *   mezclar versiones tras un deploy).
 * Cambia VERSION para invalidar la caché en un deploy con cambios incompatibles.
 */
const VERSION = "qr-v1";
const PAGES = ["/", "/qr-whatsapp", "/qr-wifi", "/qr-email", "/qr-contacto", "/qr-texto"];
const PRECACHE = [...PAGES, "/manifest.webmanifest", "/icon.svg", "/icons/icon-192.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(VERSION)
      // allSettled: un recurso que falle no debe impedir instalar el SW.
      .then((cache) => Promise.allSettled(PRECACHE.map((url) => cache.add(url))))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== VERSION).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

async function networkFirst(request) {
  const cache = await caches.open(VERSION);
  try {
    const response = await fetch(request);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch {
    return (await cache.match(request, { ignoreSearch: true })) ?? (await cache.match("/")) ?? Response.error();
  }
}

async function cacheFirst(request) {
  const cache = await caches.open(VERSION);
  const cached = await cache.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) cache.put(request, response.clone());
  return response;
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== "GET" || url.origin !== self.location.origin) return;
  if (request.headers.has("RSC") || url.searchParams.has("_rsc")) return;

  if (request.mode === "navigate") {
    event.respondWith(networkFirst(request));
  } else if (url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/icons/")) {
    event.respondWith(cacheFirst(request));
  } else {
    event.respondWith(networkFirst(request));
  }
});
