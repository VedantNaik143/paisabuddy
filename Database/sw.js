self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open("paisabuddy-cache").then((cache) => {
      return cache.addAll([
        "/",
        "/index.html",
        "/style.css",
        "/script.js",
        "/audios/hindi.mp3",
        "/audios/tamil.mp3",
        "/audios/telugu.mp3"
      ]);
    })
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
