/* ============================================================
   TATAMBA — script.js  (JavaScript Vanilla ES6, tanpa framework)
   ------------------------------------------------------------
   Urutan modul:
    1. Simpanan (mock database / localStorage + fallback)
    2. Toast notification
    3. Aset SVG (maskot + ilustrasi tanaman)
    4. Data (TANAMAN, VIDEO, ISTILAH, TIM)
    5. Aksesibilitas (skala font, tema gelap, kontras, Mode Tenang)
    6. Navigasi antarhalaman
    7. Beranda (counter)
    8. Galeri tanaman + modal detail
    9. Video + progress tracker
   10. Chatbot
   11. Glosarium 3 bahasa
   12. Tim
   13. Admin (CRUD)
   14. Loading screen

   Catatan: animasi visual seluruhnya ditangani CSS (@keyframes).
   JavaScript hanya menambah/menghapus kelas dan merender data.
   ============================================================ */

/* ========== 1. SIMPANAN — mock database ==========
   localStorage dipakai sebagai basis data sementara. Sebagian peramban
   memblokirnya (mode privat, iframe sandbox), jadi semua akses dibungkus
   try/catch dan jatuh ke memori — progressive enhancement: fitur tetap
   jalan, hanya kehilangan kemampuan mengingat setelah refresh.          */
const Simpanan = (() => {
  const kunci = 'tatamba:';
  const cadangan = new Map();
  let adaLS = false;
  try { localStorage.setItem(kunci+'tes','1'); localStorage.removeItem(kunci+'tes'); adaLS = true; }
  catch (e) { console.info('localStorage tidak tersedia — memakai memori sementara.'); }

  return {
    tersedia: adaLS,
    ambil(nama, bawaan) {
      try {
        const isi = adaLS ? localStorage.getItem(kunci+nama) : cadangan.get(nama);
        return isi ? JSON.parse(isi) : bawaan;
      } catch (e) { return bawaan; }
    },
    simpan(nama, nilai) {
      try {
        const isi = JSON.stringify(nilai);
        adaLS ? localStorage.setItem(kunci+nama, isi) : cadangan.set(nama, isi);
        return true;
      } catch (e) { return false; }
    },
    bersihkan() {
      try {
        if (adaLS) Object.keys(localStorage).filter(k => k.startsWith(kunci)).forEach(k => localStorage.removeItem(k));
        else cadangan.clear();
      } catch (e) {}
    }
  };
})();

/* ========== 2. TOAST NOTIFICATION ========== */
const IKON_TOAST = { sukses:'check-circle-fill', info:'info-circle-fill', hati:'heart-fill' };
function toast(pesan, jenis = 'sukses') {
  const el = document.createElement('div');
  el.className = 'toast ' + jenis;
  el.setAttribute('role', 'status');
  el.innerHTML = `<svg class="bi" aria-hidden="true"><use href="#i-${IKON_TOAST[jenis]}"/></svg><span></span>`;
  el.querySelector('span').textContent = pesan;   // textContent = aman dari HTML injeksi
  document.getElementById('toaster').appendChild(el);
  setTimeout(() => el.remove(), 3800);            // sinkron dengan animasi CSS
}

/* ========== 3. ASET SVG ==========
   Maskot: kuncup daun berwajah. Dipakai di loading screen, header,
   avatar chatbot, dan footer.                                          */
function maskot(label = 'Maskot TATAMBA, kuncup daun yang tersenyum') {
  return `<svg viewBox="0 0 100 110" role="img" aria-label="${label}">
    <path d="M50 104V62" stroke="#1F7A4C" stroke-width="6" stroke-linecap="round"/>
    <path d="M50 78c-14 0-22-8-22-16 14-3 22 6 22 16z" fill="#5FBF7E" stroke="#15301F" stroke-width="3"/>
    <path d="M50 70c14 0 22-8 22-16-14-3-22 6-22 16z" fill="#5FBF7E" stroke="#15301F" stroke-width="3"/>
    <path d="M50 66C22 62 12 40 20 22 28 4 42 12 50 22c8-10 22-18 30 0 8 18-2 40-30 44z" fill="#7BD196" stroke="#15301F" stroke-width="3.5"/>
    <circle cx="38" cy="34" r="5.5" fill="#15301F"/>
    <circle cx="62" cy="34" r="5.5" fill="#15301F"/>
    <circle cx="40" cy="32" r="1.8" fill="#fff"/>
    <circle cx="64" cy="32" r="1.8" fill="#fff"/>
    <path d="M40 46q10 9 20 0" stroke="#15301F" stroke-width="3.5" fill="none" stroke-linecap="round"/>
    <ellipse cx="28" cy="44" rx="5" ry="3.5" fill="#FF7A2F" opacity=".55"/>
    <ellipse cx="72" cy="44" rx="5" ry="3.5" fill="#FF7A2F" opacity=".55"/>
  </svg>`;
}

/* Ilustrasi bagian tanaman. Emoji dipakai sebagai penanda cepat di sudut
   kartu; SVG memberi bentuk yang lebih jelas untuk dikenali anak.       */
const BENTUK_SVG = {
  daun:(a,b)=>`<path d="M35 84V40" stroke="${b}" stroke-width="5" stroke-linecap="round"/><path d="M35 42C10 42 8 12 35 6c27 6 25 36 0 36z" fill="${a}" stroke="#15301F" stroke-width="3"/><path d="M35 8v34" stroke="#15301F" stroke-width="2.5"/><path d="M35 20l10-6M35 30l10-6M35 20l-10-6M35 30l-10-6" stroke="#15301F" stroke-width="2"/>`,
  umbi:(a,b)=>`<path d="M35 44c-6-14-2-30 0-38 4 10 8 24 0 38z" fill="${b}" stroke="#15301F" stroke-width="3"/><ellipse cx="35" cy="62" rx="20" ry="22" fill="${a}" stroke="#15301F" stroke-width="3"/><path d="M28 46c2 24 2 24 0 32M42 46c-2 24-2 24 0 32" stroke="#15301F" stroke-width="2"/>`,
  akar:(a,b)=>`<path d="M35 4v40" stroke="${b}" stroke-width="5" stroke-linecap="round"/><path d="M22 12h26M26 22h18" stroke="${b}" stroke-width="4" stroke-linecap="round"/><path d="M35 44c-14 8-18 22-16 38M35 44c14 8 18 22 16 38M35 44v40" fill="none" stroke="${a}" stroke-width="6" stroke-linecap="round"/>`,
  batang:(a,b)=>`<rect x="27" y="16" width="16" height="68" rx="6" fill="${a}" stroke="#15301F" stroke-width="3"/><path d="M27 34h16M27 52h16M27 70h16" stroke="#15301F" stroke-width="2.5"/><path d="M35 18c-14-2-18-10-18-10 12-4 18 4 18 10zM35 18c14-2 18-10 18-10-12-4-18 4-18 10z" fill="${b}" stroke="#15301F" stroke-width="3"/>`,
  rimpang:(a,b)=>`<path d="M35 40V16M35 26l10-8M35 32l-10-8" stroke="${b}" stroke-width="4.5" stroke-linecap="round"/><path d="M20 62c0-10 6-16 15-16s15 6 15 16-6 16-15 16-15-6-15-16z" fill="${a}" stroke="#15301F" stroke-width="3"/><path d="M18 52c-8-4-14 2-12 9 2 6 10 6 14 1M52 52c8-4 14 2 12 9-2 6-10 6-14 1M35 78c-4 8 2 12 8 9" fill="${a}" stroke="#15301F" stroke-width="3"/><path d="M30 54c3 6 3 10 0 16M40 54c-3 6-3 10 0 16" stroke="#15301F" stroke-width="2"/>`,
  hati:(a,b)=>`<path d="M35 84V52" stroke="${b}" stroke-width="5" stroke-linecap="round"/><path d="M35 54C14 44 8 26 16 14c8-12 19 0 19 0s11-12 19 0c8 12 2 30-19 40z" fill="${a}" stroke="#15301F" stroke-width="3"/><path d="M35 14v40M35 26L20 20M35 26l15-6M35 38L22 32M35 38l13-6" stroke="#15301F" stroke-width="2"/>`,
  buah:(a,b)=>`<path d="M35 26V10" stroke="#5A3A22" stroke-width="4" stroke-linecap="round"/><path d="M35 16c8-8 16-8 20-6-4 8-12 10-20 6z" fill="${b}" stroke="#15301F" stroke-width="3"/><ellipse cx="35" cy="54" rx="23" ry="28" fill="${a}" stroke="#15301F" stroke-width="3"/><circle cx="27" cy="46" r="3" fill="#15301F" opacity=".5"/><circle cx="41" cy="52" r="3" fill="#15301F" opacity=".5"/><circle cx="30" cy="62" r="3" fill="#15301F" opacity=".5"/><circle cx="44" cy="66" r="3" fill="#15301F" opacity=".5"/>`,
  bunga:(a,b)=>`<path d="M35 84V44" stroke="${b}" stroke-width="5" stroke-linecap="round"/><path d="M35 66c-10 0-16-6-16-12 10-2 16 4 16 12z" fill="${b}" stroke="#15301F" stroke-width="2.5"/><g fill="${a}" stroke="#15301F" stroke-width="3"><ellipse cx="35" cy="18" rx="9" ry="13"/><ellipse cx="35" cy="46" rx="9" ry="13"/><ellipse cx="21" cy="32" rx="13" ry="9"/><ellipse cx="49" cy="32" rx="13" ry="9"/></g><circle cx="35" cy="32" r="8" fill="#FFC530" stroke="#15301F" stroke-width="3"/>`
};
/* alt text: setiap ilustrasi diberi role="img" + aria-label */
function ilustrasi(bentuk, a, b, label) {
  return `<svg viewBox="0 0 70 88" role="img" aria-label="${label || 'Ilustrasi ' + bentuk + ' tanaman'}">${BENTUK_SVG[bentuk](a, b)}</svg>`;
}

/* ========== 4. DATA ==========
   kategori: Daun | Akar | Buah | Bunga   ·   bentuk = ilustrasi SVG    */
/* ========== 4. DATA ==========
   Seluruh konten berada di folder data/ sebagai berkas JSON, TERPISAH dari
   kode program. Guru atau sekolah lain dapat menggantinya tanpa menyentuh
   pemrograman — lihat CARA_GANTI_KONTEN.md.

   Urutan prioritas pemuatan:
     1. Simpanan lokal (hasil suntingan panel pengelola)  — bila ada
     2. Berkas data/*.json                                 — sumber bawaan
   Bila keduanya gagal, aplikasi berhenti dengan pesan yang dapat dibaca,
   bukan halaman kosong.                                                   */

let TANAMAN_AWAL = [], VIDEO_AWAL = [], ISTILAH = [], TIM = [];
let TANAMAN = [], VIDEO = [];
let ASESMEN = { konsep: [], butir: [] }, AMBANG = 65;
let dipelajari = new Set(), ditonton = new Set();


async function ambilJSON(nama) {
  const r = await fetch(`data/${nama}.json`, { cache: 'no-cache' });
  if (!r.ok) throw new Error(`data/${nama}.json → HTTP ${r.status}`);
  return r.json();
}

async function muatData() {
  const [tn, vd, ist, tm, ase] = await Promise.all(
    ['tanaman', 'video', 'istilah', 'tim', 'asesmen'].map(ambilJSON));
  TANAMAN_AWAL = tn; VIDEO_AWAL = vd; ISTILAH = ist; TIM = tm;
  ASESMEN = ase; AMBANG = ase._ambang || 65;

  // suntingan pengelola menimpa data bawaan
  TANAMAN = Simpanan.ambil('tanaman', null) || structuredClone(TANAMAN_AWAL);
  VIDEO   = Simpanan.ambil('video',   null) || structuredClone(VIDEO_AWAL);
  dipelajari = new Set(Simpanan.ambil('dipelajari', []));
  ditonton   = new Set(Simpanan.ambil('ditonton', []));
}

function gagalMuat(e) {
  console.error('Pemuatan data gagal:', e);
  const pesan = location.protocol === 'file:'
    ? 'Microsite dibuka langsung dari berkas (file://), sehingga peramban memblokir pemuatan data. Jalankan lewat server lokal: buka terminal di folder ini lalu ketik <code>python3 -m http.server 8000</code>, kemudian buka <code>http://localhost:8000</code>. Lihat README.md.'
    : `Data pembelajaran gagal dimuat (${e.message}). Periksa folder <code>data/</code> masih berisi keempat berkas JSON.`;
  document.body.innerHTML = `<div style="max-width:640px;margin:60px auto;padding:28px;font-family:system-ui,sans-serif;line-height:1.6;border:3px solid #1F7A4C;border-radius:20px">
    <h1 style="color:#1F7A4C;margin-bottom:12px">TATAMBA belum dapat dimuat</h1>
    <p>${pesan}</p></div>`;
}


/* ========== 5. AKSESIBILITAS ========== */
const setelan = Simpanan.ambil('setelan', { skala:1, tema:'terang', kontras:'normal', tenang:false });

function terapkanSetelan() {
  document.documentElement.style.setProperty('--skala', setelan.skala);
  document.documentElement.dataset.tema = setelan.tema;
  document.documentElement.dataset.kontras = setelan.kontras;
  document.body.classList.toggle('tenang-on', setelan.tenang);

  const tTema = document.getElementById('tombolTema');
  tTema.setAttribute('aria-pressed', setelan.tema === 'gelap');
  tTema.querySelector('use').setAttribute('href', setelan.tema === 'gelap' ? '#i-sun-fill' : '#i-moon-stars-fill');
  tTema.setAttribute('aria-label', setelan.tema === 'gelap' ? 'Mode terang' : 'Mode gelap');

  const tK = document.getElementById('tombolKontras');
  tK.setAttribute('aria-pressed', setelan.kontras === 'tinggi');

  const tT = document.getElementById('tombolTenang');
  tT.setAttribute('aria-pressed', setelan.tenang);
  tT.querySelector('span').textContent = setelan.tenang ? 'Mode Ceria' : 'Mode Tenang';

  document.getElementById('kecilkan').disabled = setelan.skala <= 0.9;
  document.getElementById('besarkan').disabled = setelan.skala >= 1.5;
  Simpanan.simpan('setelan', setelan);
}
function ubahSkala(delta) {
  setelan.skala = Math.min(1.5, Math.max(0.9, Math.round((setelan.skala + delta) * 10) / 10));
  terapkanSetelan();
  toast('Ukuran teks: ' + Math.round(setelan.skala * 100) + '%', 'info');
}
document.getElementById('besarkan').onclick = () => ubahSkala(0.1);
document.getElementById('kecilkan').onclick = () => ubahSkala(-0.1);
document.getElementById('tombolTema').onclick = () => {
  setelan.tema = setelan.tema === 'gelap' ? 'terang' : 'gelap';
  terapkanSetelan();
  toast(setelan.tema === 'gelap' ? '🌙 Mode gelap menyala' : '☀️ Mode terang menyala', 'info');
};
document.getElementById('tombolKontras').onclick = () => {
  setelan.kontras = setelan.kontras === 'tinggi' ? 'normal' : 'tinggi';
  terapkanSetelan();
  toast(setelan.kontras === 'tinggi' ? '◐ Kontras tinggi menyala' : 'Kontras kembali normal', 'info');
};
document.getElementById('tombolTenang').onclick = () => {
  setelan.tenang = !setelan.tenang;
  terapkanSetelan();
  toast(setelan.tenang ? '🕊️ Mode Tenang menyala — animasi dihentikan' : '🎉 Mode Ceria kembali', 'info');
};
/* Ikuti preferensi tema sistem bila pengguna belum pernah memilih */
if (!Simpanan.ambil('setelan', null) && window.matchMedia('(prefers-color-scheme: dark)').matches) setelan.tema = 'gelap';
terapkanSetelan();

/* ========== 6. NAVIGASI ========== */
function pindah(id) {
  document.querySelectorAll('.halaman').forEach(h => h.classList.toggle('aktif', h.id === id));
  document.querySelectorAll('.tab').forEach(t => t.setAttribute('aria-current', t.dataset.ke === id ? 'page' : 'false'));
  window.scrollTo({ top: 0, behavior: 'smooth' });
  if (id === 'beranda') jalankanCounter();
}
document.addEventListener('click', e => {
  const t = e.target.closest('[data-ke]');
  if (t) { e.preventDefault(); pindah(t.dataset.ke); }
});

/* ========== 7. BERANDA ========== */
document.getElementById('kebun').innerHTML =
  [['rimpang','#FF9A1F','#5FBF7E','Ilustrasi rimpang kunyit'],
   ['hati','#4FA85F','#1F7A4C','Ilustrasi daun sirih'],
   ['rimpang','#E0B06A','#5FBF7E','Ilustrasi rimpang jahe'],
   ['bunga','#4A6BE0','#1F7A4C','Ilustrasi bunga telang'],
   ['buah','#DCE8A8','#5FBF7E','Ilustrasi buah mengkudu']]
  .map(([b, a, c, l]) => ilustrasi(b, a, c, l)).join('');

let sudahHitung = false;
function jalankanCounter() {
  if (sudahHitung) return;
  sudahHitung = true;
  document.querySelectorAll('[data-hitung]').forEach(el => {
    const target = +el.dataset.hitung, langkah = Math.max(1, Math.round(target / 45));
    let n = 0;
    const jam = setInterval(() => {
      n += langkah;
      if (n >= target) { n = target; clearInterval(jam); }
      el.textContent = n.toLocaleString('id-ID');
    }, 30);
  });
}

/* ========== 8. GALERI TANAMAN ========== */
let filter = 'semua', kunci = '', terpilih = null;

function gambarGaleri() {
  const g = document.getElementById('galeri');
  const hasil = TANAMAN.filter(t =>
    (filter === 'semua' || t.kategori === filter) &&
    (t.nama + ' ' + t.latin + ' ' + t.banjar).toLowerCase().includes(kunci));

  if (!hasil.length) {
    g.innerHTML = `<p style="grid-column:1/-1;padding:20px;background:var(--kertas-2);border:3px dashed var(--garis);border-radius:18px">Tanaman itu belum ada di kebun kita. Coba kata lain, misalnya <b>kelakai</b>.</p>`;
    return;
  }
  g.innerHTML = hasil.map(t => `
    <button class="tanaman ${dipelajari.has(t.id) ? 'sudah' : ''}" data-id="${t.id}" aria-label="Buka detail ${t.nama}">
      <span class="gambar" style="background:${t.w1}22">
        ${ilustrasi(t.bentuk, t.w1, t.w2, 'Ilustrasi ' + t.nama)}
        <span class="emoji" aria-hidden="true">${t.emoji || '🌿'}</span>
      </span>
      <span class="isi">
        ${dipelajari.has(t.id) ? '<span class="centang" aria-hidden="true">✅</span>' : ''}
        ${t.utama ? '<span class="tag utama">⭐ Tanaman utama</span>' : ''}
        <span class="nama-kartu">${t.nama}</span>
        <span class="banjar">Bahasa Banjar: <b>${t.banjar}</b></span>
        <span class="latin">${t.latin}</span>
        <span class="singkat">${t.singkat}</span>
        <span class="khasiat"><b>💚 Manfaat:</b> ${t.manfaat}</span>
        <span class="tag">Tanaman ${t.kategori}</span>
      </span>
    </button>`).join('');
  g.querySelectorAll('.tanaman').forEach(b => b.onclick = () => bukaDetail(b.dataset.id));
}
document.getElementById('cari').oninput = e => { kunci = e.target.value.toLowerCase().trim(); gambarGaleri(); };
document.querySelectorAll('#tanaman .chip').forEach(c => c.onclick = () => {
  filter = c.dataset.filter;
  document.querySelectorAll('#tanaman .chip').forEach(x => x.setAttribute('aria-pressed', x === c));
  gambarGaleri();
});

/* --- modal detail --- */
const tirai = document.getElementById('tirai');
let fokusSebelumnya = null;

function bukaDetail(id) {
  const t = TANAMAN.find(x => x.id === id);
  terpilih = t;
  fokusSebelumnya = document.activeElement;
  document.getElementById('kepalaDetail').innerHTML =
    `${ilustrasi(t.bentuk, t.w1, t.w2, 'Ilustrasi ' + t.nama)}
     <div><h3 id="judulDetail">${t.nama}</h3>
     <p class="banjar">Bahasa Banjar: <b>${t.banjar}</b></p>
     <p class="latin">${t.latin}</p><span class="tag">Tanaman ${t.kategori}</span></div>`;
  document.getElementById('badanDetail').innerHTML = `
    <div class="blok"><h4>🔍 Ciri-cirinya</h4><p>${t.ciri}</p></div>
    <div class="blok k"><h4>💚 Manfaatnya</h4><p>${t.manfaat}</p></div>
    <div class="blok o"><h4>🫖 Cara memakainya</h4><p>${t.cara}</p></div>
    <div class="blok u"><h4>✨ Tahukah kamu?</h4><p>${t.tahu}</p></div>
    <p style="font-size:.8rem;color:var(--tinta-2)">Selalu minta bantuan orang dewasa sebelum mencoba tanaman obat.</p>`;
  document.getElementById('tandai').textContent = dipelajari.has(id) ? '↩️ Batalkan tanda' : '✅ Sudah kupelajari';
  tirai.classList.add('buka');
  document.getElementById('tutup').focus();
}
function tutupDetail() {
  tirai.classList.remove('buka');
  fokusSebelumnya?.focus();
}
document.getElementById('tutup').onclick = tutupDetail;
tirai.onclick = e => { if (e.target === tirai) tutupDetail(); };
addEventListener('keydown', e => { if (e.key === 'Escape' && tirai.classList.contains('buka')) tutupDetail(); });

document.getElementById('tandai').onclick = () => {
  const baru = !dipelajari.has(terpilih.id);
  baru ? dipelajari.add(terpilih.id) : dipelajari.delete(terpilih.id);
  simpanProgres();
  document.getElementById('nDipelajari').textContent = dipelajari.size;
  toast(baru ? `Hebat! ${terpilih.nama} sudah kamu pelajari 🌱` : `Tanda pada ${terpilih.nama} dihapus.`, baru ? 'sukses' : 'info');
  tutupDetail();
  gambarGaleri();
};

/* ========== 9. VIDEO + PROGRESS TRACKER ========== */
let topik = 'semua';

function gambarVideo() {
  const wadah = document.getElementById('daftarVideo');
  const hasil = VIDEO.filter(v => topik === 'semua' || v.topik === topik);
  wadah.innerHTML = hasil.map(v => `
    <article class="video ${ditonton.has(v.id) ? 'selesai' : ''}" data-id="${v.id}">
      <div class="layar" style="background:${v.w1}33">
        ${ilustrasi(v.bentuk, v.w1, v.w2, 'Ilustrasi untuk video ' + v.j)}
        <!-- Ganti seluruh .layar ini dengan:
             <iframe src="https://www.youtube.com/embed/KODE" title="${v.j}" allowfullscreen></iframe> -->
        <span class="main" aria-hidden="true"><svg class="bi" aria-hidden="true"><use href="#i-play-fill"/></svg></span>
        <span class="durasi">⏱ ${v.t}</span>
      </div>
      <div class="isi">
        <p class="topik">${v.topik}</p>
        <h3>${v.j}</h3>
        <p>${v.d}</p>
        <button class="tonton" aria-pressed="${ditonton.has(v.id)}">${ditonton.has(v.id) ? '✅ Sudah ditonton' : '⭕ Tandai sudah ditonton'}</button>
      </div>
    </article>`).join('');
  wadah.querySelectorAll('.tonton').forEach(b => b.onclick = () => {
    const kartu = b.closest('.video'), id = kartu.dataset.id;
    const baru = !ditonton.has(id);
    baru ? ditonton.add(id) : ditonton.delete(id);
    simpanProgres(); gambarVideo(); perbaruiProgres();
    const v = VIDEO.find(x => x.id === id);
    if (baru) toast(ditonton.size === VIDEO.length ? '🏆 Luar biasa! Semua video selesai!' : `"${v.j}" ditandai selesai 🎬`, 'sukses');
  });
}
function perbaruiProgres() {
  const n = ditonton.size, total = VIDEO.length, persen = total ? Math.round(n / total * 100) : 0;
  document.getElementById('relIsi').style.width = persen + '%';
  const bar = document.getElementById('relBar');
  bar.setAttribute('aria-valuenow', n);
  bar.setAttribute('aria-valuemax', total);
  const teks = document.getElementById('pialaTeks');
  if (n === 0) teks.textContent = 'Belum ada video ditonton — ayo mulai dari yang pertama!';
  else if (n === total) teks.textContent = `🏆 Hebat! Semua ${total} video sudah kamu tonton.`;
  else teks.textContent = `${n} dari ${total} video selesai (${persen}%) · sisa ${total - n} lagi`;

  /* Hasil asesmen ikut masuk ke penanda kemajuan yang sama dengan galeri
     dan video — inilah yang menopang klaim UDL 6.4 untuk Lapis 3. */
  const el = document.getElementById('nAsesmen');
  if (el) {
    const h = Simpanan.ambil('hasilAsesmen', []);
    el.textContent = h.length ? h[0].persen + '%' : '—';
    el.dataset.hitung = h.length ? h[0].persen : 0;
  }
}
document.querySelectorAll('#belajar .chip').forEach(c => c.onclick = () => {
  topik = c.dataset.topik;
  document.querySelectorAll('#belajar .chip').forEach(x => x.setAttribute('aria-pressed', x === c));
  gambarVideo();
});

/* ========== 10. CHATBOT ==========
   Tahap ini memakai jawaban statis (rule-based) supaya microsite tetap
   jalan tanpa server. Tahap backend: ganti isi setTimeout di kirimPesan()
   dengan fetch() ke API AI, dan pertahankan jawab() sebagai cadangan
   saat koneksi gagal.                                                   */
const riwayat = document.getElementById('riwayat');

function bicara(teks, siapa = 'bot') {
  const d = document.createElement('div');
  d.className = 'gelembung ' + siapa;
  d.textContent = teks;
  riwayat.appendChild(d);
  riwayat.scrollTop = riwayat.scrollHeight;
}
function jawab(q) {
  const s = q.toLowerCase();
  const t = TANAMAN.find(x =>
    s.includes(x.nama.toLowerCase().split(' ')[0]) || s.includes(x.banjar.toLowerCase().split(' ')[0]));
  if (t) {
    if (/(manfaat|guna|khasiat)/.test(s)) return `${t.nama}: ${t.manfaat} Ia termasuk kelompok tanaman ${t.kategori.toLowerCase()}.`;
    if (/(cara|pakai|olah|masak|buat)/.test(s)) return `Cara memakai ${t.nama}: ${t.cara} Minta bantuan orang dewasa, ya!`;
    if (/(ciri|bentuk|seperti apa)/.test(s)) return `${t.nama} (${t.latin}) — ${t.ciri}`;
    return `${t.nama} disebut "${t.banjar}" dalam bahasa Banjar. ${t.ciri} ${t.manfaat}`;
  }
  if (/(halo|hai|assalam)/.test(s)) return 'Halo! Aku TATAMBA 🌿 Mau tahu tanaman herbal yang mana? Coba ketik "kunyit" atau "kelakai".';
  if (/(tatamba|siapa kamu|kamu apa)/.test(s)) return 'Namaku TATAMBA — singkatan dari Teknologi Aktif & Tanaman Obat Melalui Belajar Adaptif. Dalam bahasa Banjar, "tatamba" berarti mengobati atau menyembuhkan. Aku mengumpulkan tanaman obat Kalimantan Selatan supaya kamu bisa mengenalnya sambil bermain: ada galeri untuk dijelajahi, video pendek untuk ditonton, dan aku di sini untuk ditanyai kapan saja 🌿';
  if (/(utama|unggulan)/.test(s)) return 'Tiga tanaman utama TATAMBA adalah Kunyit (janar), Jahe (lai), dan Daun Sirih. Ketiganya mudah ditemukan di halaman rumah!';
  if (/(masuk angin|mual|dingin|hangat)/.test(s)) return 'Jahe! Digeprek lalu direbus jadi wedang jahe, badan langsung hangat.';
  if (s.includes('mimisan')) return 'Daun sirih digulung lalu diselipkan di hidung — cara lama yang masih dipakai sampai sekarang.';
  if (/(perut|kembung)/.test(s)) return 'Kunyit (janar) diparut dan diperas jadi jamu kunyit asam bisa membantu meredakan perut kembung.';
  if (s.includes('demam')) return 'Untuk demam, orang Banjar biasanya menyeduh pucuk Sungkai atau akar Pasak Bumi. Tapi kalau demam tinggi, tetap ke puskesmas ya!';
  if (s.includes('luka')) return 'Daun Karamunting muda sering ditumbuk lalu ditempel pada luka gores kecil.';
  if (/(darah|zat besi)/.test(s)) return 'Kelakai! Sayur pakis rawa ini kaya zat besi dan enak ditumis.';
  if (/(sasirangan|warna)/.test(s)) return 'Akar Kuning menghasilkan warna kuning terang yang dulu dipakai mewarnai kain. Karamunting memberi warna ungu.';
  if (/(berapa|daftar|apa saja)/.test(s)) return `Ada ${TANAMAN.length} tanaman di kebun kita: ` + TANAMAN.map(x => x.nama).join(', ') + '. Ketik salah satu namanya!';
  if (/(terima kasih|makasih)/.test(s)) return 'Sama-sama! Jangan lupa tandai tanaman yang sudah kamu pelajari 🌱';
  return 'Aku belum tahu jawabannya. Coba tanya tentang salah satu tanaman ini: ' + TANAMAN.slice(0, 4).map(x => x.nama).join(', ') + '.';
}
let sedangJawab = false;
function tampilkanMengetik() {
  const d = document.createElement('div');
  d.className = 'mengetik'; d.id = 'indikator';
  d.setAttribute('aria-label', 'TATAMBA sedang mengetik');
  d.innerHTML = '<i></i><i></i><i></i>';
  riwayat.appendChild(d);
  riwayat.scrollTop = riwayat.scrollHeight;
}
function kirimPesan(teks) {
  if (sedangJawab) return;
  const q = (teks || document.getElementById('pesan').value).trim();
  if (!q) return;
  bicara(q, 'aku');
  document.getElementById('pesan').value = '';
  sedangJawab = true;
  document.getElementById('kirim').disabled = true;
  tampilkanMengetik();

  /* >>> TAHAP BACKEND: ganti blok setTimeout ini dengan fetch() ke API AI <<< */
  setTimeout(() => {
    document.getElementById('indikator')?.remove();
    bicara(jawab(q));
    sedangJawab = false;
    document.getElementById('kirim').disabled = false;
  }, 900);
}
document.getElementById('kirim').onclick = () => kirimPesan();
document.getElementById('pesan').addEventListener('keydown', e => { if (e.key === 'Enter') kirimPesan(); });
['Apa itu kunyit?', 'Bagaimana cara membuat jahe?', 'Apa manfaat daun sirih?', 'Ceritakan tentang TATAMBA!', 'Ada tanaman apa saja?']
  .forEach(s => {
    const b = document.createElement('button');
    b.textContent = s;
    b.onclick = () => kirimPesan(s);
    document.getElementById('saran').appendChild(b);
  });
bicara('Halo, teman! Aku TATAMBA 🌿 Aku tahu banyak tentang tanaman obat Kalimantan Selatan. Ketuk salah satu pertanyaan di bawah, atau ketik sendiri pertanyaanmu!');


/* ================= JURNAL PILIHAN KESEHATAN =================
   Instrumen karakter Lapis 2 (proposal §4.4). Tiga butir refleksi
   memetakan tiga dimensi karakter pola hidup sehat:
     Langkah 1 → kepedulian diri
     Langkah 2 → kebersihan
     Langkah 3 → disiplin
     Langkah 4 → Smileyometer (Read & MacFarlane) untuk perasaan belajar
   UDL: 9.3 (refleksi diri), 5.1 (ragam ekspresi — anak boleh memilih
   kartu jawaban alih-alih menulis), 6.2 (fungsi eksekutif — langkah
   bernomor dengan penanda kemajuan).
   Data disimpan lokal saja; tidak ada pengiriman ke server.       */

const PILIHAN_BERSIH = [
  '🧼 Mencuci tangan sebelum memegang',
  '💧 Mencuci bahan dengan air bersih mengalir',
  '🫙 Memakai wadah dan alat yang bersih',
  '🌿 Memilih daun yang segar, bukan yang layu',
  '🧑‍🦱 Meminta bantuan orang dewasa',
  '🏥 Tahu kapan harus ke puskesmas'
];
const PILIHAN_KEPUTUSAN = [
  '🥤 Minum air putih lebih banyak',
  '🧼 Cuci tangan sebelum makan',
  '🌱 Menanam satu tanaman herbal di rumah',
  '😴 Tidur lebih awal',
  '🥬 Makan sayur setiap hari',
  '🏃 Bergerak aktif setiap hari'
];
const SMILEY = [
  { e:'😖', t:'Tidak suka' }, { e:'🙁', t:'Kurang suka' }, { e:'😐', t:'Biasa saja' },
  { e:'🙂', t:'Suka' },       { e:'😄', t:'Sangat suka' }
];

let jurnal = Simpanan.ambil('jurnal', []);
const draf = { tanaman:'', manfaat:'', bersih:[], keputusan:[], rasa:null, nama:'' };

/* --- isi kontrol --- */
function isiPilihanJurnal() {
  const sel = document.getElementById('jTanaman');
  sel.innerHTML = '<option value="">— pilih satu —</option>' +
    TANAMAN.map(t => `<option value="${t.id}">${t.emoji || '🌿'} ${t.nama} (${t.banjar})</option>`).join('');

  const buatPilihan = (wadahId, daftar, kunciDraf, tunggal = false) => {
    const wadah = document.getElementById(wadahId);
    wadah.innerHTML = daftar.map(p => `<button type="button" aria-pressed="false">${p}</button>`).join('');
    wadah.querySelectorAll('button').forEach(b => b.onclick = () => {
      const aktif = b.getAttribute('aria-pressed') === 'true';
      if (tunggal) wadah.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', 'false'));
      b.setAttribute('aria-pressed', !aktif);
      draf[kunciDraf] = [...wadah.querySelectorAll('[aria-pressed="true"]')].map(x => x.textContent);
      perbaruiMaju();
    });
  };
  buatPilihan('jBersih', PILIHAN_BERSIH, 'bersih');
  buatPilihan('jKeputusan', PILIHAN_KEPUTUSAN, 'keputusan', true);

  const rasa = document.getElementById('jRasa');
  rasa.innerHTML = SMILEY.map((s, i) =>
    `<button type="button" role="radio" aria-checked="false" data-nilai="${i + 1}" aria-label="${s.t}">
       <span aria-hidden="true">${s.e}</span><small>${s.t}</small></button>`).join('');
  rasa.querySelectorAll('button').forEach(b => b.onclick = () => {
    rasa.querySelectorAll('button').forEach(x => x.setAttribute('aria-checked', 'false'));
    b.setAttribute('aria-checked', 'true');
    draf.rasa = +b.dataset.nilai;
    perbaruiMaju();
  });
}

/* --- saat tanaman dipilih, tawarkan manfaat dari kartunya (scaffold) --- */
document.getElementById('jTanaman').onchange = e => {
  draf.tanaman = e.target.value;
  const t = TANAMAN.find(x => x.id === draf.tanaman);
  const chip = document.getElementById('jManfaatChip');
  if (!t) { chip.innerHTML = ''; perbaruiMaju(); return; }
  const opsi = [t.manfaat, `Bagian yang dipakai: ${t.kategori.toLowerCase()}. ${t.ciri}`, t.cara];
  chip.innerHTML = opsi.map(o => `<button type="button" aria-pressed="false">${o}</button>`).join('');
  chip.querySelectorAll('button').forEach(b => b.onclick = () => {
    const aktif = b.getAttribute('aria-pressed') === 'true';
    b.setAttribute('aria-pressed', !aktif);
    const ta = document.getElementById('jManfaat');
    const terpilih = [...chip.querySelectorAll('[aria-pressed="true"]')].map(x => x.textContent);
    ta.value = terpilih.join(' ');
    draf.manfaat = ta.value;
    perbaruiMaju();
  });
  perbaruiMaju();
};
document.getElementById('jManfaat').oninput = e => { draf.manfaat = e.target.value; perbaruiMaju(); };
document.getElementById('jNama').oninput = e => { draf.nama = e.target.value; };

/* --- penanda kemajuan --- */
function perbaruiMaju() {
  const lengkap = [
    !!draf.tanaman && !!(draf.manfaat || document.getElementById('jManfaat').value).trim(),
    draf.bersih.length > 0 || !!document.getElementById('jBersihLain').value.trim(),
    draf.keputusan.length > 0 || !!document.getElementById('jKeputusanLain').value.trim(),
    draf.rasa !== null
  ];
  lengkap.forEach((ok, i) => {
    const bulat = document.getElementById('b' + (i + 1));
    bulat.classList.toggle('selesai', ok);
    bulat.classList.toggle('aktif', !ok && lengkap.slice(0, i).every(Boolean));
    document.getElementById('L' + (i + 1)).classList.toggle('lengkap', ok);
  });
  return lengkap;
}
['jBersihLain', 'jKeputusanLain'].forEach(id => document.getElementById(id).oninput = perbaruiMaju);

/* --- simpan --- */
document.getElementById('simpanJurnal').onclick = () => {
  const lengkap = perbaruiMaju();
  if (!lengkap[0]) { toast('Pilih dulu tanaman yang kamu pelajari hari ini 🌿', 'info'); document.getElementById('jTanaman').focus(); return; }
  if (!lengkap[2]) { toast('Pilih satu keputusan sehat untuk minggu ini ⏰', 'info'); document.getElementById('jKeputusan').scrollIntoView({ block:'center' }); return; }

  const t = TANAMAN.find(x => x.id === draf.tanaman);
  const bersihLain = document.getElementById('jBersihLain').value.trim();
  const keputusanLain = document.getElementById('jKeputusanLain').value.trim();
  jurnal.unshift({
    id: 'j' + Date.now(),
    tanggal: new Date().toISOString(),
    nama: draf.nama.trim(),
    tanaman: t ? `${t.nama} (${t.banjar})` : '-',
    manfaat: document.getElementById('jManfaat').value.trim(),
    bersih: [...draf.bersih, ...(bersihLain ? [bersihLain] : [])],
    keputusan: [...draf.keputusan, ...(keputusanLain ? [keputusanLain] : [])],
    rasa: draf.rasa
  });
  Simpanan.simpan('jurnal', jurnal);
  gambarJurnal();
  kosongkanJurnal();
  toast('Jurnalmu tersimpan! Sampai jumpa minggu depan 📔', 'hati');
  document.getElementById('daftarJurnal').scrollIntoView({ behavior:'smooth', block:'start' });
};

function kosongkanJurnal() {
  document.getElementById('borangJurnal').reset();
  document.getElementById('jManfaatChip').innerHTML = '';
  document.querySelectorAll('#jurnal .pilihan button, #jurnal .smiley button')
    .forEach(b => { b.setAttribute('aria-pressed', 'false'); b.setAttribute('aria-checked', 'false'); });
  Object.assign(draf, { tanaman:'', manfaat:'', bersih:[], keputusan:[], rasa:null, nama:'' });
  perbaruiMaju();
}
document.getElementById('kosongkanJurnal').onclick = () => { kosongkanJurnal(); toast('Jurnal dikosongkan.', 'info'); };

/* --- daftar entri --- */
function gambarJurnal() {
  const wadah = document.getElementById('daftarJurnal');
  if (!jurnal.length) {
    wadah.innerHTML = '<p class="kosong">Belum ada jurnal. Isi langkah 1–4 di atas, lalu ketuk <b>Simpan jurnalku</b>.</p>';
    return;
  }
  wadah.innerHTML = jurnal.map(e => {
    const tgl = new Date(e.tanggal).toLocaleDateString('id-ID', { weekday:'long', day:'numeric', month:'long', year:'numeric' });
    const s = e.rasa ? SMILEY[e.rasa - 1] : null;
    return `<article class="entri">
      <div class="kepala-entri">
        <div><h3>${e.tanaman}</h3><p class="tanggal">${tgl}${e.nama ? ' · ' + e.nama : ''}</p></div>
        ${s ? `<span class="rasa-besar" title="${s.t}" aria-label="Perasaan: ${s.t}">${s.e}</span>` : ''}
      </div>
      <dl>
        <div><dt>💚 Kepedulian diri — manfaat yang kupelajari</dt><dd>${e.manfaat || '—'}</dd></div>
        <div><dt>🧼 Kebersihan — agar aman dipakai</dt><dd>${e.bersih.length ? e.bersih.join(' · ') : '—'}</dd></div>
        <div><dt>⏰ Disiplin — keputusan sehatku</dt><dd>${e.keputusan.length ? e.keputusan.join(' · ') : '—'}</dd></div>
      </dl>
      <div class="jurnal-aksi" style="margin-top:12px"><button class="mini hapus" data-hapus-j="${e.id}">Hapus entri ini</button></div>
    </article>`;
  }).join('');
  wadah.querySelectorAll('[data-hapus-j]').forEach(b => b.onclick = () => {
    if (!confirm('Hapus entri jurnal ini?')) return;
    jurnal = jurnal.filter(x => x.id !== b.dataset.hapusJ);
    Simpanan.simpan('jurnal', jurnal);
    gambarJurnal();
    toast('Entri dihapus.', 'info');
  });
}

/* --- cetak & ekspor untuk penilaian rubrik guru --- */
document.getElementById('cetakJurnal').onclick = () => {
  if (!jurnal.length) { toast('Belum ada jurnal untuk dicetak.', 'info'); return; }
  document.body.classList.add('cetak-jurnal');
  window.print();
  setTimeout(() => document.body.classList.remove('cetak-jurnal'), 500);
};
document.getElementById('unduhJurnal').onclick = () => {
  if (!jurnal.length) { toast('Belum ada jurnal untuk diunduh.', 'info'); return; }
  const kolom = ['tanggal', 'nama', 'tanaman', 'manfaat_kepedulian_diri', 'kebersihan', 'keputusan_disiplin', 'smileyometer_1_5'];
  const aman = v => '"' + String(v ?? '').replace(/"/g, '""') + '"';
  const baris = jurnal.map(e => [
    new Date(e.tanggal).toLocaleString('id-ID'), e.nama, e.tanaman,
    e.manfaat, e.bersih.join('; '), e.keputusan.join('; '), e.rasa ?? ''
  ].map(aman).join(','));
  const csv = '\ufeff' + kolom.join(',') + '\n' + baris.join('\n');
  const url = URL.createObjectURL(new Blob([csv], { type:'text/csv;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url; a.download = 'jurnal-pilihan-kesehatan.csv';
  a.click(); URL.revokeObjectURL(url);
  toast('CSV diunduh — siap dinilai dengan rubrik.', 'sukses');
};

/* dipanggil dari mulai() setelah data termuat */


/* ================= 12b. ASESMEN ADAPTIF TERTANAM (Lapis 3) =================
   Berjalan sepenuhnya di dalam peramban: tidak memanggil layanan luar,
   tidak memerlukan koneksi, dan tidak mengirim jawaban siswa ke mana pun.

   Yang membedakannya dari kuis biasa ada pada atribut `konsep` di tiap
   butir. Sistem tidak berhenti pada skor total, melainkan memetakan
   konsep mana yang belum dikuasai, lalu meremediasi konsep itu saja dan
   mengujinya ulang. Inilah alasan modul ini dibangun sendiri alih-alih
   memakai layanan formulir daring, yang percabangannya hanya bekerja
   pada tingkat seksi.

   Bahan remediasi tidak ditulis ulang: ia diambil langsung dari data
   tanaman yang sama dengan galeri, sehingga tidak pernah bisa
   bertentangan dengannya.

   UDL 3.0: 8.2 optimize challenge and support · 8.5 offer action-oriented
   feedback · 6.4 enhance capacity for monitoring progress · 9.3 promote
   individual and collective reflection.                                  */

let sesi = null;   // status pengerjaan saat ini

const wadahAs = () => document.getElementById('wadahAsesmen');
const konsepById = id => ASESMEN.konsep.find(k => k.id === id) || { nama: id, ikon: '•' };
const acak = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

function mulaiAsesmen(hanyaKonsep = null) {
  const kolam = hanyaKonsep
    ? ASESMEN.butir.filter(b => b.ulang && hanyaKonsep.includes(b.konsep))
    : ASESMEN.butir.filter(b => !b.ulang);
  sesi = { butir: acak([...kolam]), ke: 0, jawaban: {}, fase: hanyaKonsep ? 'ulang' : 'utama',
           konsepDiulang: hanyaKonsep, mulai: Date.now() };
  gambarButir();
}

function gambarPembukaAsesmen() {
  if (!wadahAs()) return;
  const n = ASESMEN.butir.filter(b => !b.ulang).length;
  const terakhir = Simpanan.ambil('hasilAsesmen', [])[0];
  wadahAs().innerHTML = `
    <div class="as-kartu as-pembuka">
      <div class="as-maskot">${maskot('Maskot TATAMBA')}</div>
      <h3>Siap menguji pemahamanmu?</h3>
      <p>Ada <b>${n} pertanyaan</b> tentang tanaman tatamba. Tidak ada batas waktu — santai saja.</p>
      <p class="as-jelas">Kalau ada bagian yang belum kamu kuasai, TATAMBA akan menjelaskannya lagi, lalu memberimu kesempatan mencoba ulang. Jadi salah itu tidak apa-apa — justru itu gunanya.</p>
      ${terakhir ? `<p class="as-lalu">Terakhir kamu mengerjakan: <b>${new Date(terakhir.tanggal).toLocaleDateString('id-ID', { day:'numeric', month:'long' })}</b> — skor ${terakhir.persen}%</p>` : ''}
      <button class="tombol" id="asMulai"><svg class="bi" aria-hidden="true"><use href="#i-arrow-right-circle-fill"/></svg> Mulai</button>
    </div>`;
  document.getElementById('asMulai').onclick = () => mulaiAsesmen();
}

/* Satu butir per layar — menampilkan dua belas pertanyaan sekaligus
   membebani siswa dengan hambatan atensi. */
function gambarButir() {
  const b = sesi.butir[sesi.ke];
  const k = konsepById(b.konsep);
  const persen = Math.round(sesi.ke / sesi.butir.length * 100);
  wadahAs().innerHTML = `
    <div class="as-atas">
      <span class="as-nomor">Pertanyaan ${sesi.ke + 1} dari ${sesi.butir.length}</span>
      <span class="as-konsep">${k.ikon} ${k.nama}</span>
    </div>
    <div class="rel" role="progressbar" aria-valuenow="${sesi.ke}" aria-valuemin="0" aria-valuemax="${sesi.butir.length}"><i style="width:${persen}%"></i></div>
    <div class="as-kartu">
      <p class="as-tanya">${b.tanya}</p>
      <div class="as-opsi" role="group" aria-label="Pilihan jawaban">
        ${b.opsi.map((o, i) => `<button type="button" data-i="${i}">${o}</button>`).join('')}
      </div>
      <div id="asUmpan"></div>
    </div>`;
  wadahAs().querySelectorAll('.as-opsi button').forEach(t => t.onclick = () => pilihJawaban(+t.dataset.i));
}

/* Umpan balik seketika — UDL 8.5 */
function pilihJawaban(i) {
  const b = sesi.butir[sesi.ke];
  if (sesi.jawaban[b.id] !== undefined) return;
  const benar = i === b.jawab;
  sesi.jawaban[b.id] = { pilih: i, benar, konsep: b.konsep, kunci: !!b.kunci };
  wadahAs().querySelectorAll('.as-opsi button').forEach((t, idx) => {
    t.disabled = true;
    if (idx === b.jawab) t.classList.add('benar');
    else if (idx === i) t.classList.add('salah');
  });
  const akhir = sesi.ke === sesi.butir.length - 1;
  document.getElementById('asUmpan').innerHTML = `
    <div class="as-umpan ${benar ? 'ya' : 'tidak'}">
      <svg class="bi" aria-hidden="true"><use href="#i-${benar ? 'check-lg' : 'lightbulb-fill'}"/></svg>
      <p>${benar ? b.umpan : 'Belum tepat. ' + b.umpan}</p>
    </div>
    <button class="tombol" id="asLanjut">${akhir ? 'Lihat hasil' : 'Lanjut'} →</button>`;
  document.getElementById('asLanjut').onclick = () => {
    if (akhir) selesaikanAsesmen();
    else { sesi.ke++; gambarButir(); }
  };
  document.getElementById('asLanjut').focus();
}

/* Diagnosis per konsep — bukan sekadar skor total */
function hitungDiagnosis() {
  const per = {};
  ASESMEN.konsep.forEach(k => per[k.id] = { benar: 0, total: 0 });
  Object.values(sesi.jawaban).forEach(j => {
    if (!per[j.konsep]) per[j.konsep] = { benar: 0, total: 0 };
    per[j.konsep].total++;
    if (j.benar) per[j.konsep].benar++;
  });
  Object.values(per).forEach(p => p.persen = p.total ? Math.round(p.benar / p.total * 100) : null);
  const semua = Object.values(sesi.jawaban);
  const persen = semua.length ? Math.round(semua.filter(j => j.benar).length / semua.length * 100) : 0;

  /* Agregat dihitung dari butir kunci. Pada fase uji ulang, kolam butir
     tidak memuat butir kunci — maka agregat jatuh ke skor keseluruhan.
     Tanpa cadangan ini, siswa yang menjawab uji ulang 100% benar tetap
     akan diarahkan remedial karena agregatnya terbaca 0%. */
  const kunci = semua.filter(j => j.kunci);
  const agregat = kunci.length
    ? Math.round(kunci.filter(j => j.benar).length / kunci.length * 100)
    : persen;
  const lemah = Object.entries(per).filter(([, p]) => p.total && p.persen < AMBANG).map(([id]) => id);
  return { per, agregat, persen, lemah };
}

function selesaikanAsesmen() {
  const d = hitungDiagnosis();
  simpanHasil(d);
  const peta = ASESMEN.konsep.map(k => {
    const p = d.per[k.id];
    if (!p || !p.total) return '';
    const st = p.persen >= AMBANG ? 'kuat' : 'lemah';
    return `<div class="as-bar ${st}">
      <div class="as-bar-label"><span>${k.ikon} ${k.nama}</span><b>${p.benar}/${p.total}</b></div>
      <div class="as-bar-rel"><i style="width:${p.persen}%"></i></div>
    </div>`;
  }).join('');
  const remedial = d.agregat < AMBANG || d.lemah.length > 0;
  wadahAs().innerHTML = `
    <div class="as-kartu">
      <div class="as-skor ${remedial ? 'perlu' : 'lulus'}">
        <span class="as-angka">${d.persen}%</span>
        <span class="as-teks">${remedial ? 'Ada yang perlu kita tengok lagi' : 'Kamu sudah menguasainya!'}</span>
      </div>
      <h4 class="as-judul-peta">Peta pemahamanmu</h4>
      <p class="as-jelas">Ini bukan nilai rapor. Ini peta — supaya kamu tahu bagian mana yang perlu dibaca ulang.</p>
      ${peta}
    </div>
    ${remedial ? `
      <div class="as-kartu as-ajak">
        <p><b>${d.lemah.length} bagian</b> perlu kita pelajari lagi. TATAMBA akan menjelaskannya, lalu kamu boleh mencoba ulang bagian itu saja — bukan semuanya.</p>
        <button class="tombol" id="asRemedial"><svg class="bi" aria-hidden="true"><use href="#i-lightbulb-fill"/></svg> Pelajari lagi</button>
      </div>`
    : `
      <div class="as-kartu as-ajak">
        <p>Semua bagian sudah kamu kuasai. Mau tantangan tambahan?</p>
        <div class="jurnal-aksi">
          <button class="tombol" id="asPengayaan"><svg class="bi" aria-hidden="true"><use href="#i-trophy-fill"/></svg> Pengayaan</button>
          <button class="tombol putih" id="asUlangSemua"><svg class="bi" aria-hidden="true"><use href="#i-arrow-repeat"/></svg> Ulangi kuis</button>
        </div>
      </div>`}`;
  if (remedial) document.getElementById('asRemedial').onclick = () => gambarRemedial(d.lemah);
  else {
    document.getElementById('asPengayaan').onclick = () => gambarPengayaan();
    document.getElementById('asUlangSemua').onclick = () => mulaiAsesmen();
  }
}

/* Remediasi per konsep. Bahan diambil dari data tanaman yang sama dengan
   galeri — bukan ditulis ulang — sehingga tidak mungkin bertentangan. */
function gambarRemedial(lemah) {
  const kartu = lemah.map(id => {
    const k = konsepById(id);
    const salah = sesi.butir.filter(b => b.konsep === id && sesi.jawaban[b.id] && !sesi.jawaban[b.id].benar);
    const contoh = salah.map(b => {
      const t = TANAMAN.find(x => x.id === b.tanaman);
      if (!t) return `<div class="as-contoh"><div><p>${b.umpan}</p></div></div>`;
      const isi = { ciri: t.ciri, manfaat: t.manfaat, cara: t.cara, budaya: t.tahu }[id] || t.singkat;
      return `<div class="as-contoh">
        <div class="as-contoh-gambar" style="background:${t.w1}22">${ilustrasi(t.bentuk, t.w1, t.w2, 'Ilustrasi ' + t.nama)}</div>
        <div><b>${t.nama}</b> <span class="latin">${t.latin}</span><p>${isi}</p></div></div>`;
    }).join('');
    const video = VIDEO.filter(v => v.topik === k.topikVideo).slice(0, 2);
    return `<div class="as-kartu as-remedial">
      <h4>${k.ikon} ${k.nama}</h4>
      <p class="as-jelas">${k.ringkas}</p>
      ${contoh || '<p>Baca ulang kartu tanaman di galeri, ya.</p>'}
      ${video.length ? `<p class="as-tonton">🎬 Video yang membahas ini: ${video.map(v => `<b>${v.j}</b>`).join(', ')} — ada di halaman <a href="#" data-ke="belajar">Belajar Seru</a>.</p>` : ''}
    </div>`;
  }).join('');
  wadahAs().innerHTML = kartu + `
    <div class="as-kartu as-ajak">
      <p>Sudah dibaca? Sekarang coba lagi — <b>hanya bagian yang tadi belum tepat</b>.</p>
      <button class="tombol" id="asUji"><svg class="bi" aria-hidden="true"><use href="#i-arrow-right-circle-fill"/></svg> Coba lagi bagian ini</button>
    </div>`;
  document.getElementById('asUji').onclick = () => mulaiAsesmen(lemah);
}

function gambarPengayaan() {
  const t = TANAMAN[Math.floor(Math.random() * TANAMAN.length)];
  wadahAs().innerHTML = `
    <div class="as-kartu as-pengayaan">
      <h3>🏆 Tantangan Tabib Cilik</h3>
      <p>Kamu sudah menguasai dasarnya. Sekarang tantangan yang sesungguhnya:</p>
      <div class="as-contoh">
        <div class="as-contoh-gambar" style="background:${t.w1}22">${ilustrasi(t.bentuk, t.w1, t.w2, 'Ilustrasi ' + t.nama)}</div>
        <div><b>${t.nama}</b> <span class="latin">${t.latin}</span><p>${t.singkat}</p></div>
      </div>
      <p><b>Coba ceritakan kepada temanmu:</b> apa ciri tanaman ini, untuk apa orang Banjar secara tradisional memakainya, dan bagaimana cara menyiapkannya dengan bersih. Jangan lupa satu hal terpenting — kapan kita harus bertanya kepada orang dewasa.</p>
      <p class="as-jelas">Kalau kamu bisa menjelaskannya tanpa melihat layar, kamu benar-benar sudah paham.</p>
      <div class="jurnal-aksi">
        <button class="tombol putih" id="asLagi">Tanaman lain</button>
        <button class="tombol putih" data-ke="jurnal">Tulis di jurnal →</button>
      </div>
    </div>`;
  document.getElementById('asLagi').onclick = () => gambarPengayaan();
}

/* Simpan hasil + sambungkan ke penanda kemajuan — UDL 6.4 */
function simpanHasil(d) {
  const hasil = Simpanan.ambil('hasilAsesmen', []);
  hasil.unshift({
    tanggal: new Date().toISOString(), fase: sesi.fase, persen: d.persen,
    agregatKunci: d.agregat,
    perKonsep: Object.fromEntries(Object.entries(d.per).filter(([, p]) => p.total).map(([k, p]) => [k, p.persen])),
    konsepLemah: d.lemah, durasiDetik: Math.round((Date.now() - sesi.mulai) / 1000)
  });
  Simpanan.simpan('hasilAsesmen', hasil.slice(0, 50));
  perbaruiProgres();
}

function eksporHasilAsesmen() {
  const hasil = Simpanan.ambil('hasilAsesmen', []);
  if (!hasil.length) { toast('Belum ada hasil asesmen untuk diunduh.', 'info'); return; }
  const kolom = ['tanggal', 'fase', 'skor_persen', 'agregat_butir_kunci', ...ASESMEN.konsep.map(k => 'konsep_' + k.id), 'konsep_lemah', 'durasi_detik'];
  const aman = v => '"' + String(v ?? '').replace(/"/g, '""') + '"';
  const baris = hasil.map(h => [
    new Date(h.tanggal).toLocaleString('id-ID'), h.fase, h.persen, h.agregatKunci,
    ...ASESMEN.konsep.map(k => h.perKonsep[k.id] ?? ''),
    (h.konsepLemah || []).join('; '), h.durasiDetik
  ].map(aman).join(','));
  const url = URL.createObjectURL(new Blob(['\ufeff' + kolom.join(',') + '\n' + baris.join('\n')], { type: 'text/csv;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url; a.download = 'hasil-asesmen-tatamba.csv';
  a.click(); URL.revokeObjectURL(url);
  toast('CSV diunduh — berisi diagnosis per konsep, bukan hanya skor.', 'sukses');
}

/* ========== 11. GLOSARIUM 3 BAHASA ========== */
let jenisKata = 'semua', hurufKata = 'semua', kunciKata = '';

const semuaKata = () =>
  TANAMAN.map(t => ({ banjar:t.banjar, nama:t.nama, latin:t.latin, singkat:t.singkat, jenis:'Tanaman' }))
    .concat(ISTILAH.map(i => ({ ...i, jenis:'Istilah' })))
    .sort((a, b) => a.banjar.localeCompare(b.banjar, 'id'));

function gambarAbjad() {
  const ada = new Set(semuaKata().map(k => k.banjar[0].toUpperCase()));
  const huruf = ['semua', ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'];
  document.getElementById('abjad').innerHTML = huruf.map(h => {
    const aktif = h === 'semua' || ada.has(h);
    return `<button class="huruf" data-huruf="${h}" ${aktif ? '' : 'disabled'}
      aria-pressed="${hurufKata === h}" aria-label="${h === 'semua' ? 'Tampilkan semua kata' : 'Kata berawalan huruf ' + h}"
      style="${h === 'semua' ? 'padding:0 14px' : ''}">${h === 'semua' ? 'Semua' : h}</button>`;
  }).join('');
  document.querySelectorAll('.huruf').forEach(b => b.onclick = () => { hurufKata = b.dataset.huruf; gambarAbjad(); gambarKata(); });
}
function gambarKata() {
  const hasil = semuaKata().filter(k =>
    (jenisKata === 'semua' || k.jenis === jenisKata) &&
    (hurufKata === 'semua' || k.banjar[0].toUpperCase() === hurufKata) &&
    (k.banjar + ' ' + k.nama + ' ' + k.latin).toLowerCase().includes(kunciKata));
  const wadah = document.getElementById('daftarKata');
  if (!hasil.length) {
    wadah.innerHTML = '<p style="grid-column:1/-1;padding:20px;background:var(--kertas-2);border:3px dashed var(--garis);border-radius:18px">Tidak ada kata yang cocok. Coba huruf lain atau ketuk "Semua".</p>';
    return;
  }
  wadah.innerHTML = hasil.map(k => `
    <article class="kata">
      <div class="atas">
        <div>
          <p class="kata-banjar">${k.banjar}</p>
          <p class="kata-arti">${k.nama}</p>
          ${k.latin ? `<p class="latin">${k.latin}</p>` : ''}
        </div>
        <button class="suara" data-ucap="${k.banjar}" aria-label="Dengarkan cara mengucapkan ${k.banjar}"><svg class="bi" aria-hidden="true"><use href="#i-volume-up-fill"/></svg></button>
      </div>
      <p>${k.singkat}</p>
      <span class="label-jenis ${k.jenis === 'Istilah' ? 'istilah' : ''}">${k.jenis === 'Istilah' ? 'Istilah Banjar' : 'Nama tanaman'}</span>
    </article>`).join('');
  wadah.querySelectorAll('.suara').forEach(b => b.onclick = () => ucapkan(b));
}
/* Placeholder pengucapan: memakai suara bawaan peramban (id-ID).
   Tahap berikutnya: ganti dengan rekaman penutur asli Banjar,
   mis. new Audio('audio/banjar/janar.mp3').play()                       */
function ucapkan(tombol) {
  const teks = tombol.dataset.ucap;
  tombol.classList.add('bunyi');
  setTimeout(() => tombol.classList.remove('bunyi'), 1000);
  if (!('speechSynthesis' in window)) { toast('Peramban ini belum mendukung audio pengucapan.', 'info'); return; }
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(teks);
  u.lang = 'id-ID'; u.rate = 0.8;
  speechSynthesis.speak(u);
}
document.getElementById('cariKata').oninput = e => { kunciKata = e.target.value.toLowerCase().trim(); gambarKata(); };
document.querySelectorAll('#glosarium .chip').forEach(c => c.onclick = () => {
  jenisKata = c.dataset.jenis;
  document.querySelectorAll('#glosarium .chip').forEach(x => x.setAttribute('aria-pressed', x === c));
  gambarKata();
});

/* ========== 12. TIM ========== */
function gambarTim() {
document.getElementById('tim').innerHTML = TIM.map(o => `
  <article class="orang">
    <!-- Ganti isi .foto dengan <img src="img/nama.jpg" alt="Foto ${o.nama}"> -->
    <div class="foto" style="background:${o.w}" aria-hidden="true">${o.e}</div>
    <b>${o.nama}</b>
    <p class="peran">${o.peran}</p>
    <small>${o.tugas}<br>${o.prodi}</small>
  </article>`).join('');
}

/* ========== 13. ADMIN (CRUD, mock database) ========== */
const SANDI_DEMO = 'tatamba2026';

function masuk() {
  const v = document.getElementById('sandi').value;
  if (v === SANDI_DEMO) {
    document.getElementById('gerbang').style.display = 'none';
    document.getElementById('dasbor').classList.add('masuk');
    document.getElementById('galat').textContent = '';
    document.getElementById('sandi').value = '';
    segarkanAdmin();
    toast('Selamat datang, pengelola 👋', 'sukses');
  } else {
    document.getElementById('galat').textContent = 'Kata sandi belum cocok. Untuk demo, ketik: tatamba2026';
  }
}
document.getElementById('tombolMasuk').onclick = masuk;
document.getElementById('sandi').addEventListener('keydown', e => { if (e.key === 'Enter') masuk(); });
document.getElementById('keluar').onclick = () => {
  document.getElementById('dasbor').classList.remove('masuk');
  document.getElementById('gerbang').style.display = '';
  toast('Kamu sudah keluar dari dasbor.', 'info');
};
document.getElementById('setelUlang').onclick = () => {
  if (!confirm('Kembalikan seluruh data tanaman dan video ke keadaan awal? Perubahanmu akan hilang.')) return;
  TANAMAN = structuredClone(TANAMAN_AWAL);
  VIDEO = structuredClone(VIDEO_AWAL);
  dipelajari.clear(); ditonton.clear();
  Simpanan.bersihkan(); simpanData(); simpanProgres();
  segarkanSemua(); gambarPembukaAsesmen();
  toast('Data dikembalikan ke keadaan awal.', 'info');
};

function segarkanAdmin() {
  document.getElementById('sTanaman').textContent = TANAMAN.length;
  document.getElementById('sVideo').textContent = VIDEO.length;
  document.getElementById('sKata').textContent = TANAMAN.length + ISTILAH.length;

  document.getElementById('barisTanaman').innerHTML = TANAMAN.map((t, i) => `
    <tr><td><b>${t.nama}</b><br><small style="color:var(--tinta-2)">${t.latin}</small></td>
    <td>${t.banjar}</td><td>${t.kategori}</td>
    <td><div class="aksi"><button class="mini" data-edit-t="${i}">Ubah</button><button class="mini hapus" data-hapus-t="${i}">Hapus</button></div></td></tr>`).join('');
  document.getElementById('barisVideo').innerHTML = VIDEO.map((v, i) => `
    <tr><td><b>${v.j}</b></td><td>${v.topik}</td><td>${v.t}</td>
    <td><div class="aksi"><button class="mini" data-edit-v="${i}">Ubah</button><button class="mini hapus" data-hapus-v="${i}">Hapus</button></div></td></tr>`).join('');

  document.querySelectorAll('[data-hapus-t]').forEach(b => b.onclick = () => {
    const i = +b.dataset.hapusT, nama = TANAMAN[i].nama;
    if (!confirm(`Hapus "${nama}" dari galeri dan glosarium?`)) return;
    dipelajari.delete(TANAMAN[i].id);
    TANAMAN.splice(i, 1);
    simpanData(); simpanProgres(); segarkanSemua();
    toast(`"${nama}" dihapus.`, 'info');
  });
  document.querySelectorAll('[data-hapus-v]').forEach(b => b.onclick = () => {
    const i = +b.dataset.hapusV, judul = VIDEO[i].j;
    if (!confirm(`Hapus video "${judul}"?`)) return;
    ditonton.delete(VIDEO[i].id);
    VIDEO.splice(i, 1);
    simpanData(); simpanProgres(); segarkanSemua();
    toast(`Video "${judul}" dihapus.`, 'info');
  });
  const barisAs = document.getElementById('barisAsesmen');
  if (barisAs) barisAs.innerHTML = ASESMEN.butir.map(b => `
    <tr><td>${b.tanya}</td><td>${konsepById(b.konsep).ikon} ${konsepById(b.konsep).nama}</td>
    <td>${b.ulang ? 'Uji ulang' : (b.kunci ? 'Butir kunci' : 'Pendukung')}</td></tr>`).join('');

  document.querySelectorAll('[data-edit-t]').forEach(b => b.onclick = () => borangTanaman(+b.dataset.editT));
  document.querySelectorAll('[data-edit-v]').forEach(b => b.onclick = () => borangVideo(+b.dataset.editV));
}
function segarkanSemua() {
  segarkanAdmin(); gambarGaleri(); gambarVideo(); perbaruiProgres(); gambarAbjad(); gambarKata(); isiPilihanJurnal();
  document.getElementById('nDipelajari').textContent = dipelajari.size;
}

const WARNA = [['#5FBF7E','Hijau daun'],['#FF9A1F','Oranye kunyit'],['#FFC530','Kuning gambir'],['#4A6BE0','Biru telang'],['#B75FD1','Ungu karamunting'],['#E2467A','Merah bawang dayak'],['#A8703C','Coklat akar']];
const BENTUK = [['daun','Daun lonjong'],['hati','Daun bentuk hati'],['rimpang','Rimpang'],['umbi','Umbi'],['akar','Akar'],['batang','Batang / liana'],['buah','Buah'],['bunga','Bunga']];
const EMOJI = ['🌿','🍃','🌱','🌾','🍀','🌸','🍈'];

function borangTanaman(i) {
  const t = i >= 0 ? TANAMAN[i] : { id:'', nama:'', latin:'', banjar:'', kategori:'Daun', bentuk:'daun', emoji:'🌿', w1:'#5FBF7E', w2:'#1F7A4C', singkat:'', manfaat:'', ciri:'', cara:'', tahu:'' };
  document.getElementById('borangTanaman').innerHTML = `
    <div class="borang">
      <h4 class="lebar" style="font-size:1.25rem">${i >= 0 ? 'Ubah tanaman' : 'Tambah tanaman baru'}</h4>
      <div><label for="fNama">Nama Indonesia</label><input id="fNama" value="${t.nama}"></div>
      <div><label for="fBanjar">Nama Banjar</label><input id="fBanjar" value="${t.banjar}"></div>
      <div><label for="fLatin">Nama ilmiah</label><input id="fLatin" value="${t.latin}"></div>
      <div><label for="fKategori">Kategori</label><select id="fKategori">${['Daun','Akar','Buah','Bunga'].map(k => `<option ${t.kategori === k ? 'selected' : ''}>${k}</option>`).join('')}</select></div>
      <div><label for="fBentuk">Ilustrasi</label><select id="fBentuk">${BENTUK.map(([v, n]) => `<option value="${v}" ${t.bentuk === v ? 'selected' : ''}>${n}</option>`).join('')}</select></div>
      <div><label for="fWarna">Warna kartu</label><select id="fWarna">${WARNA.map(([v, n]) => `<option value="${v}" ${t.w1 === v ? 'selected' : ''}>${n}</option>`).join('')}</select></div>
      <div><label for="fEmoji">Emoji penanda</label><select id="fEmoji">${EMOJI.map(e => `<option ${t.emoji === e ? 'selected' : ''}>${e}</option>`).join('')}</select></div>
      <div class="lebar"><label for="fSingkat">Deskripsi singkat (tampil di kartu)</label><input id="fSingkat" value="${t.singkat}"></div>
      <div class="lebar"><label for="fManfaat">Manfaat kesehatan</label><textarea id="fManfaat">${t.manfaat}</textarea></div>
      <div class="lebar"><label for="fCiri">Ciri-ciri</label><textarea id="fCiri">${t.ciri}</textarea></div>
      <div class="lebar"><label for="fCara">Cara memakai</label><textarea id="fCara">${t.cara}</textarea></div>
      <div class="lebar"><label for="fTahu">Tahukah kamu?</label><textarea id="fTahu">${t.tahu}</textarea></div>
      <div class="lebar" style="display:flex;gap:10px;flex-wrap:wrap">
        <button class="tombol" id="simpanT">💾 Simpan</button>
        <button class="tombol putih" id="batalT">Batal</button>
      </div>
    </div>`;
  document.getElementById('batalT').onclick = () => document.getElementById('borangTanaman').innerHTML = '';
  document.getElementById('simpanT').onclick = () => {
    const nilai = id => document.getElementById(id).value.trim();
    if (!nilai('fNama') || !nilai('fBanjar')) { toast('Nama Indonesia dan nama Banjar wajib diisi.', 'info'); return; }
    const baru = {
      id: i >= 0 ? t.id : 'x' + Date.now(),
      nama: nilai('fNama'), latin: nilai('fLatin'), banjar: nilai('fBanjar'),
      kategori: nilai('fKategori'), bentuk: nilai('fBentuk'),
      emoji: nilai('fEmoji'), w1: nilai('fWarna'), w2: '#1F7A4C',
      singkat: nilai('fSingkat') || 'Belum ada deskripsi.',
      manfaat: nilai('fManfaat') || 'Belum ada catatan manfaat.',
      ciri: nilai('fCiri') || '-', cara: nilai('fCara') || '-', tahu: nilai('fTahu') || '-',
      utama: i >= 0 ? t.utama : 0
    };
    if (i >= 0) TANAMAN[i] = baru; else TANAMAN.push(baru);
    document.getElementById('borangTanaman').innerHTML = '';
    simpanData(); segarkanSemua();
    toast(i >= 0 ? `"${baru.nama}" berhasil diperbarui!` : `Berhasil menambahkan ${baru.nama}! 🌿`, 'sukses');
  };
  document.getElementById('fNama').focus();
}
function borangVideo(i) {
  const v = i >= 0 ? VIDEO[i] : { id:'', j:'', d:'', t:'', topik:'Pengenalan Tanaman', bentuk:'daun', w1:'#5FBF7E', w2:'#1F7A4C' };
  document.getElementById('borangVideo').innerHTML = `
    <div class="borang">
      <h4 class="lebar" style="font-size:1.25rem">${i >= 0 ? 'Ubah video' : 'Tambah video baru'}</h4>
      <div class="lebar"><label for="gJudul">Judul video</label><input id="gJudul" value="${v.j}"></div>
      <div><label for="gTopik">Topik</label><select id="gTopik">${['Pengenalan Tanaman','Manfaat Herbal','Cara Mengolah','Kearifan Lokal'].map(k => `<option ${v.topik === k ? 'selected' : ''}>${k}</option>`).join('')}</select></div>
      <div><label for="gDurasi">Durasi (mis. 4:12)</label><input id="gDurasi" value="${v.t}"></div>
      <div><label for="gBentuk">Ilustrasi thumbnail</label><select id="gBentuk">${BENTUK.map(([b, n]) => `<option value="${b}" ${v.bentuk === b ? 'selected' : ''}>${n}</option>`).join('')}</select></div>
      <div><label for="gWarna">Warna thumbnail</label><select id="gWarna">${WARNA.map(([c, n]) => `<option value="${c}" ${v.w1 === c ? 'selected' : ''}>${n}</option>`).join('')}</select></div>
      <div class="lebar"><label for="gDesk">Deskripsi singkat</label><textarea id="gDesk">${v.d}</textarea></div>
      <div class="lebar" style="display:flex;gap:10px;flex-wrap:wrap">
        <button class="tombol" id="simpanV">💾 Simpan</button>
        <button class="tombol putih" id="batalV">Batal</button>
      </div>
    </div>`;
  document.getElementById('batalV').onclick = () => document.getElementById('borangVideo').innerHTML = '';
  document.getElementById('simpanV').onclick = () => {
    const nilai = id => document.getElementById(id).value.trim();
    if (!nilai('gJudul')) { toast('Judul video wajib diisi.', 'info'); return; }
    const baru = {
      id: i >= 0 ? v.id : 'v' + Date.now(),
      topik: nilai('gTopik'), j: nilai('gJudul'), d: nilai('gDesk') || 'Belum ada deskripsi.',
      t: nilai('gDurasi') || '0:00', bentuk: nilai('gBentuk'), w1: nilai('gWarna'), w2: '#1F7A4C'
    };
    if (i >= 0) VIDEO[i] = baru; else VIDEO.push(baru);
    document.getElementById('borangVideo').innerHTML = '';
    simpanData(); segarkanSemua();
    toast(i >= 0 ? `Video "${baru.j}" diperbarui!` : `Berhasil menambahkan video "${baru.j}"! 🎬`, 'sukses');
  };
  document.getElementById('gJudul').focus();
}
/* ---------- Impor & ekspor berkas data ----------
   Inilah yang membuat klaim "sekolah lain dapat mengganti konten tanpa
   menyentuh kode" dapat didemonstrasikan, bukan sekadar dijanjikan.
   Memakai FileReader (bukan fetch), sehingga berjalan di mana pun.        */

function unduhJSON(nama, isi) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(isi, null, 2)], { type: 'application/json' }));
  const a = document.createElement('a');
  a.href = url; a.download = nama;
  a.click(); URL.revokeObjectURL(url);
}

/* Pemeriksaan struktur sebelum data diterima — mencegah berkas keliru
   merusak galeri tanpa penjelasan. */
function periksaTanaman(d) {
  if (!Array.isArray(d) || !d.length) return 'Berkas tidak berisi daftar tanaman.';
  const wajib = ['id', 'nama', 'banjar', 'latin', 'kategori', 'bentuk'];
  for (const [i, t] of d.entries()) {
    const kurang = wajib.filter(k => !t[k]);
    if (kurang.length) return `Tanaman ke-${i + 1} kekurangan kolom: ${kurang.join(', ')}.`;
    if (!BENTUK.some(([v]) => v === t.bentuk)) return `Tanaman "${t.nama}" memakai bentuk "${t.bentuk}" yang tidak dikenal. Pilihan: ${BENTUK.map(([v]) => v).join(', ')}.`;
    if (!['Daun', 'Akar', 'Buah', 'Bunga'].includes(t.kategori)) return `Tanaman "${t.nama}" memakai kategori "${t.kategori}" yang tidak dikenal.`;
  }
  return null;
}
function periksaVideo(d) {
  if (!Array.isArray(d) || !d.length) return 'Berkas tidak berisi daftar video.';
  const topik = ['Pengenalan Tanaman', 'Manfaat Herbal', 'Cara Mengolah', 'Kearifan Lokal'];
  for (const [i, v] of d.entries()) {
    if (!v.id || !v.j) return `Video ke-${i + 1} kekurangan kolom id atau judul.`;
    if (!topik.includes(v.topik)) return `Video "${v.j}" memakai topik "${v.topik}" yang tidak dikenal.`;
  }
  return null;
}

function imporBerkas(jenis) {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json,application/json';
  input.onchange = () => {
    const berkas = input.files[0];
    if (!berkas) return;
    const pembaca = new FileReader();
    pembaca.onload = () => {
      let data;
      try {
        data = JSON.parse(pembaca.result);
      } catch (e) {
        toast('Berkas bukan JSON yang sah. Periksa tanda kutip dan koma.', 'info');
        return;
      }
      const galat = jenis === 'tanaman' ? periksaTanaman(data) : periksaVideo(data);
      if (galat) { toast(galat, 'info'); return; }
      if (!confirm(`Ganti seluruh data ${jenis} dengan ${data.length} entri dari berkas ini? Data yang ada sekarang akan ditimpa.`)) return;

      if (jenis === 'tanaman') { TANAMAN = data; dipelajari.clear(); }
      else { VIDEO = data; ditonton.clear(); }
      simpanData(); simpanProgres(); segarkanSemua();
      toast(`Berhasil mengimpor ${data.length} ${jenis}. 🌿`, 'sukses');
    };
    pembaca.readAsText(berkas);
  };
  input.click();
}

function periksaAsesmen(d) {
  if (!d || !Array.isArray(d.butir) || !d.butir.length) return 'Berkas tidak berisi daftar butir.';
  if (!Array.isArray(d.konsep) || !d.konsep.length) return 'Berkas tidak berisi daftar konsep.';
  const idKonsep = d.konsep.map(k => k.id);
  for (const [i, b] of d.butir.entries()) {
    if (!b.id || !b.tanya) return `Butir ke-${i + 1} kekurangan kolom id atau tanya.`;
    if (!b.konsep) return `Butir "${b.id}" tidak memiliki kolom "konsep". Kolom ini wajib — tanpanya sistem tidak dapat mendiagnosis bagian mana yang belum dikuasai siswa.`;
    if (!idKonsep.includes(b.konsep)) return `Butir "${b.id}" memakai konsep "${b.konsep}" yang tidak terdaftar. Pilihan: ${idKonsep.join(', ')}.`;
    if (!Array.isArray(b.opsi) || b.opsi.length < 2) return `Butir "${b.id}" harus memiliki minimal 2 pilihan jawaban.`;
    if (typeof b.jawab !== 'number' || b.jawab < 0 || b.jawab >= b.opsi.length) return `Butir "${b.id}" memiliki kunci jawaban di luar jangkauan pilihan.`;
  }
  return null;
}

document.getElementById('imporAsesmen').onclick = () => {
  const input = document.createElement('input');
  input.type = 'file'; input.accept = '.json,application/json';
  input.onchange = () => {
    const f = input.files[0]; if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      let d; try { d = JSON.parse(r.result); } catch { toast('Berkas bukan JSON yang sah.', 'info'); return; }
      const galat = periksaAsesmen(d);
      if (galat) { toast(galat, 'info'); return; }
      if (!confirm(`Ganti butir asesmen dengan ${d.butir.length} butir dari berkas ini?`)) return;
      ASESMEN = d; AMBANG = d._ambang || 65;
      Simpanan.simpan('asesmen', d);
      segarkanAdmin(); gambarPembukaAsesmen();
      toast(`${d.butir.length} butir asesmen diimpor.`, 'sukses');
    };
    r.readAsText(f);
  };
  input.click();
};
document.getElementById('eksporAsesmen').onclick = () => { unduhJSON('asesmen.json', ASESMEN); toast('asesmen.json diunduh.', 'sukses'); };
document.getElementById('eksporHasil').onclick = eksporHasilAsesmen;

document.getElementById('imporTanaman').onclick = () => imporBerkas('tanaman');
document.getElementById('eksporTanaman').onclick = () => { unduhJSON('tanaman.json', TANAMAN); toast('tanaman.json diunduh — sunting, lalu impor kembali.', 'sukses'); };
document.getElementById('imporVideo').onclick = () => imporBerkas('video');
document.getElementById('eksporVideo').onclick = () => { unduhJSON('video.json', VIDEO); toast('video.json diunduh.', 'sukses'); };

document.getElementById('tambahTanaman').onclick = () => borangTanaman(-1);
document.getElementById('tambahVideo').onclick = () => borangVideo(-1);

/* ========== 14. RENDER AWAL & LOADING SCREEN ========== */
document.getElementById('slotLogo').innerHTML = maskot('Maskot TATAMBA');
document.getElementById('avatarBot').innerHTML = maskot('Avatar TATAMBA');
document.getElementById('maskotPemuat').innerHTML = maskot('Maskot TATAMBA sedang melompat');
document.getElementById('maskotKaki').innerHTML = maskot('Maskot TATAMBA');

/* Loading screen dilepas setelah data dan aset selesai dimuat.
   Fallback 6 detik agar tak pernah tersangkut bila ada aset gagal. */
let sudahLepas = false;
function sembunyikanPemuat() {
  if (sudahLepas) return;
  sudahLepas = true;
  document.getElementById('pemuat').classList.add('pergi');
  jalankanCounter();
  if (!Simpanan.tersedia) {
    setTimeout(() => toast('Peramban ini memblokir penyimpanan — progresmu tidak akan tersimpan setelah halaman ditutup.', 'info'), 1200);
  } else if (dipelajari.size || ditonton.size) {
    setTimeout(() => toast(`Selamat datang kembali! ${dipelajari.size} tanaman & ${ditonton.size} video sudah kamu selesaikan 🌱`, 'hati'), 1200);
  }
}

/* Titik masuk aplikasi: data dimuat lebih dulu, baru seluruh tampilan digambar. */
async function mulai() {
  try {
    await muatData();
  } catch (e) {
    gagalMuat(e);
    return;
  }

  gambarGaleri();
  gambarVideo();
  perbaruiProgres();
  gambarAbjad();
  gambarKata();
  gambarTim();
  gambarPembukaAsesmen();
  isiPilihanJurnal();
  gambarJurnal();
  perbaruiMaju();

  document.getElementById('nDipelajari').dataset.hitung = Math.max(dipelajari.size, TANAMAN.length);
  document.getElementById('nVideo').dataset.hitung = VIDEO.length;

  sembunyikanPemuat();
}

mulai();
setTimeout(sembunyikanPemuat, 6000);

/* Service worker: menjamin microsite tetap terbuka tanpa koneksi.
   Hanya aktif pada http/https (GitHub Pages), tidak pada file://. */
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(e => console.info('Service worker tidak terdaftar:', e.message));
  });
}
