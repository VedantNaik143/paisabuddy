self.addEventListener("install", event => {
  event.waitUntil(
    caches.open("paisabuddy-cache").then(cache => {
      return cache.addAll([
        "/",
        "/index.html",
        "/style.css",
        "/script.js",
        "/lessons/budgeting.pdf",
        "/lessons/investing.pdf"
      ]);
    })
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
