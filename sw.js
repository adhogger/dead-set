// SLASH TV service worker — NETWORK-FIRST so a deploy is never stale:
// every request tries the network and refreshes the cache; the cache only
// answers when you're offline (aeroplane-mode play still works).
var CACHE = 'slashtv-v1';
var CORE = ['.', 'index.html', 'style.css', 'icon.png', 'icon-192.png', 'icon-512.png',
            'js/util.js', 'js/input.js', 'js/audio.js', 'js/effects.js', 'js/broadcast.js',
            'js/bullets.js', 'js/enemies.js', 'js/player.js', 'js/bot.js', 'js/rooms.js',
            'js/procgen.js', 'js/hazards.js', 'js/combat.js', 'js/boss.js', 'js/powerups.js',
            'js/leaderboard.js', 'js/main.js', 'js/net.js'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(CORE); })
    .then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== CACHE; })
      .map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(
    fetch(e.request).then(function (res) {
      var copy = res.clone();
      caches.open(CACHE).then(function (c) { c.put(e.request, copy); });
      return res;
    }).catch(function () { return caches.match(e.request); })
  );
});
