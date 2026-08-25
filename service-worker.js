// Deliberately minimal. This app is live data — price feed, news search, the
// AI call — so a service worker that caches those would show you stale gold
// prices, which is worse than useless for trading. All it does is:
//  1. satisfy the install criteria so "Add to Home Screen" gives a real app
//  2. cache the app shell itself (the HTML/CSS/JS) so the icon opens instantly
//     and shows a message instead of a browser error if you're offline
// Nothing about prices, news, or analysis is ever cached.
const SHELL_CACHE = "gold-desk-shell-v1";
const SHELL_FILES = ["./", "./index.html", "./manifest.json"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(SHELL_CACHE).then(c => c.addAll(SHELL_FILES)));
  self.skipWaiting();
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== SHELL_CACHE).map(k => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  // Only ever intervene for the app's own shell files, on GET requests.
  // Everything else (Binance, xaus.com, TradingView, Anthropic, fonts) goes
  // straight to the network, untouched, every time.
  if (e.request.method !== "GET" || url.origin !== self.location.origin) return;
  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request).then(r => r || caches.match("./index.html")))
  );
});
