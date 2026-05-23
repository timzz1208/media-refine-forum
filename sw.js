// 最小 service worker — 讓論壇可以被當成 PWA 安裝，並出現在 Android 系統的分享選單
// 目前不做離線快取，純粹是 PWA 安裝的必要條件
const CACHE_NAME = 'mrf-shell-v1';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', event => {
  // 全部直接走網路，等需要離線再做
  // 必須有 fetch handler 才會被 Chrome 視為可安裝的 PWA
});
