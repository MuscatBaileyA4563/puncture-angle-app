const CACHE_NAME = "puncture-angle-app-v3"; // v3: opencv.js を自前ホストして事前キャッシュ
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icon-192.png",
  "./icon-512.png",
  "./opencv.js"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)).catch(() => null)
  );
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(key => key !== CACHE_NAME ? caches.delete(key) : null))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // 同一オリジンのアセットはネットワーク成功時にもキャッシュを更新しておく
        // （opencv.js を後から差し替えた場合などに追従できるように）
        if (response && response.ok && event.request.url.startsWith(self.location.origin)) {
          const cloned = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, cloned)).catch(() => null);
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
