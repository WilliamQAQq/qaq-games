/* QAQ 游戏中心 · Service Worker：游戏离线可玩（iPad 添加到主屏幕后断网也能玩） */
const CACHE = 'qaq-games-v7';
const ASSETS = [
  './', './index.html', './style.css?v=7',
  './js/games.js?v=7', './js/app.js?v=7',
  './manifest.webmanifest', './icon-192.png', './icon-512.png',
];
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())
  );
});
self.addEventListener('fetch', (e) => {
  const u = new URL(e.request.url);
  // 代理流量不缓存，直接放行
  if (u.searchParams.has('url') || e.request.url.includes('/proxy')) return;
  // 导航请求：离线回退到首页
  if (e.request.mode === 'navigate') {
    e.respondWith(fetch(e.request).catch(() => caches.match('./index.html')));
    return;
  }
  // 自家 JS/CSS：网络优先，保证更新即时生效；断网才读缓存
  if (u.origin === self.location.origin && /\.(js|css)$/.test(u.pathname)) {
    e.respondWith(
      fetch(e.request).then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copy)).catch(() => {});
        return res;
      }).catch(() => caches.match(e.request))
    );
    return;
  }
  e.respondWith(
    caches.match(e.request).then((hit) => hit || fetch(e.request).then((res) => {
      const copy = res.clone();
      caches.open(CACHE).then((c) => c.put(e.request, copy)).catch(() => {});
      return res;
    }).catch(() => caches.match('./index.html')))
  );
});
