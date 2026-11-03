/* 우체국 FC 문제은행 service worker
 * - 정적 자산(/_next/static, /icons): cache-first
 * - 페이지 이동: network-first, 오프라인이면 캐시된 화면
 * - 도우미는 기기 안에서 동작하므로 서버 API가 없습니다
 */
const VERSION = "v6";
const STATIC_CACHE = `fcqb-static-${VERSION}`;
const PAGE_CACHE = `fcqb-pages-${VERSION}`;
const PRECACHE = ["/", "/quiz/1", "/quiz/2", "/quiz/3"];
const ASSET_PATTERN = /\/_next\/static\/[^"'\s)\\]+/g;

/** Cache each page plus every JS/CSS chunk its HTML references, so pages hydrate offline. */
async function precache() {
  const pages = await caches.open(PAGE_CACHE);
  const statics = await caches.open(STATIC_CACHE);
  const assets = new Set();
  for (const path of PRECACHE) {
    try {
      const res = await fetch(path, { cache: "no-store" });
      if (!res.ok || res.redirected) continue; // 로그인 전이면 저장하지 않음
      const html = await res.clone().text();
      await pages.put(path, res);
      for (const m of html.matchAll(ASSET_PATTERN)) assets.add(m[0]);
    } catch {
      /* offline during install — runtime caching will fill in */
    }
  }
  await Promise.all([...assets].map((a) => statics.add(a).catch(() => undefined)));
}

self.addEventListener("install", (event) => {
  event.waitUntil(precache().then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k.startsWith("fcqb-") && ![STATIC_CACHE, PAGE_CACHE].includes(k)).map((k) => caches.delete(k))),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || url.pathname.startsWith("/api/")) return;

  if (url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/icons/")) {
    event.respondWith(
      caches.open(STATIC_CACHE).then(async (cache) => {
        const hit = await cache.match(request);
        if (hit) return hit;
        const res = await fetch(request);
        if (res.ok) cache.put(request, res.clone());
        return res;
      }),
    );
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((res) => {
          if (res.ok && !res.redirected) caches.open(PAGE_CACHE).then((cache) => cache.put(request, res.clone()));
          return res;
        })
        .catch(async () => (await caches.match(request)) || (await caches.match("/")) || Response.error()),
    );
  }
});
