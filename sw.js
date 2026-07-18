/* ============================================================
   TATAMBA — sw.js (Service Worker)
   ------------------------------------------------------------
   Menjamin microsite tetap terbuka ketika perangkat tidak memiliki
   koneksi internet — prasyarat klaim aksesibilitas 3T pada proposal.

   Strategi:
   - Aset inti (HTML, CSS, JS, font)  → cache-first. Jarang berubah,
     dan harus tersedia meski jaringan mati total.
   - Berkas data (data/*.json)        → network-first dengan cadangan
     cache. Guru yang memperbarui konten ingin perubahannya langsung
     terlihat saat daring; saat luring, versi terakhir tetap dipakai.

   Menaikkan VERSI akan membuang cache lama dan memaksa pemuatan ulang.
   ============================================================ */

const VERSI = 'tatamba-v2';

const ASET_INTI = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './manifest.json',
  './vendor/favicon-32.png',
  './vendor/fonts/lexend-latin-400-normal.woff2',
  './vendor/fonts/lexend-latin-500-normal.woff2',
  './vendor/fonts/lexend-latin-700-normal.woff2',
  './vendor/fonts/baloo-2-latin-500-normal.woff2',
  './vendor/fonts/baloo-2-latin-700-normal.woff2',
  './vendor/fonts/baloo-2-latin-800-normal.woff2',
  './data/tanaman.json',
  './data/video.json',
  './data/istilah.json',
  './data/tim.json',
  './data/asesmen.json'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(VERSI)
      .then(c => c.addAll(ASET_INTI))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(kunci => Promise.all(kunci.filter(k => k !== VERSI).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const permintaan = e.request;
  if (permintaan.method !== 'GET') return;

  const url = new URL(permintaan.url);
  if (url.origin !== location.origin) return;   // biarkan sematan luar (mis. YouTube) apa adanya

  // data/*.json → jaringan dulu, cache sebagai cadangan
  if (url.pathname.includes('/data/')) {
    e.respondWith(
      fetch(permintaan)
        .then(r => {
          const salinan = r.clone();
          caches.open(VERSI).then(c => c.put(permintaan, salinan));
          return r;
        })
        .catch(() => caches.match(permintaan))
    );
    return;
  }

  // aset lain → cache dulu
  e.respondWith(
    caches.match(permintaan).then(tersimpan => tersimpan || fetch(permintaan).then(r => {
      if (r.ok && r.type === 'basic') {
        const salinan = r.clone();
        caches.open(VERSI).then(c => c.put(permintaan, salinan));
      }
      return r;
    }))
  );
});
