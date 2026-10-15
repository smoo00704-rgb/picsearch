/* PicSearch App service worker
 * - แคชตัวแอป (HTML/JS/ไอคอน) -> เปิดแอปได้แม้ไม่มีเน็ต
 * - รูปสินค้า (ข้ามโดเมน) ไม่แคชเอง ปล่อยเบราว์เซอร์จัดการตามปกติ
 * - แก้ไฟล์แอปเมื่อไร ให้เปลี่ยน CACHE (เช่น v2.1) เพื่อให้เครื่องผู้ใช้โหลดเวอร์ชันใหม่
 */
const CACHE = "picsearch-app-v2.2";
const SHELL = ["./", "./index.html", "./manifest.webmanifest",
  "./icons/icon-192.png", "./icons/icon-512.png", "./icons/maskable-512.png", "./icons/apple-touch-icon.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys()
    .then((keys) => Promise.all(keys.filter((k) => k.startsWith("picsearch-app-") && k !== CACHE).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});
// ไฟล์ของแอปเอง: network-first (ได้เวอร์ชันล่าสุดเมื่อมีเน็ต) -> ไม่มีเน็ตใช้จากแคช
self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== self.location.origin) return;
  e.respondWith(
    fetch(req).then((res) => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
      return res;
    }).catch(() => caches.match(req, { ignoreSearch: true }).then((r) => r || caches.match("./index.html")))
  );
});
