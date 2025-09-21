// Play selected audio
function playAudio() {
  const file = document.getElementById("language").value;
  document.getElementById("audioPlayer").src = "audios/" + file;
  document.getElementById("audioPlayer").play();
}

// Register Service Worker (for offline mode)
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js')
    .then(() => console.log("Service Worker Registered"));
}
