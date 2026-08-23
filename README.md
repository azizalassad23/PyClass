# PyClass

Modul ajar digital & ujian Python berbasis web untuk Pemrograman Dasar SMA Kelas X.
Materi, editor Python, dan ujian ber-auto-grading dalam satu tautan — tanpa instalasi
apa pun di perangkat murid.

Implementasi dari berkas rancangan Claude Design `PyKelas Mockups.dc.html`
mengikuti **PRD — PyClass v1.0**. (Nama produk kini **PyClass**; berkas rancangan
dan PRD aslinya masih memakai nama lama "PyKelas".)

---

## Menjalankan

```bash
npm install
```

```bash
npm run dev
```

Untuk **pengembangan lokal**, salin `.env.example` menjadi `.env`:

- dibiarkan kosong → **mode demo**, memakai bank soal lokal `src/lib/bankDemo.ts`
  (tidak ikut ter-commit) dan menilai di browser. Setiap halaman ditandai lencana
  “Mode demo”. Hanya untuk mencoba — bukan untuk ujian yang dinilai, karena
  seluruh kunci jawaban ada di perangkat murid.
- diisi URL `/exec` Apps Script → memakai backend sungguhan.

Untuk **build produksi**, URL-nya diambil dari `.env.production` yang ter-commit,
sehingga rilis tidak bisa gagal hanya karena satu setelan lupa diisi.

---

## Peta layar

Kedelapan layar inti pada mockup terwujud sebagai rute berikut:

| Mockup | Rute | Berkas |
| --- | --- | --- |
| 1a — Beranda (peta 8 unit) | `#/` | `src/screens/Beranda.tsx` |
| 1c — Materi (editor menetap di kanan) | `#/materi/:slug` | `src/screens/Materi.tsx` |
| 1e — Mode presentasi | tombol di halaman materi | `src/screens/Presentasi.tsx` |
| 1f — Masuk ujian | `#/ujian` | `src/screens/UjianMasuk.tsx` |
| 1g — Ujian (soal kiri, editor kanan) | `#/ujian/kerjakan` | `src/screens/Ujian.tsx` |
| 1i — Hasil murid | `#/ujian/hasil` | `src/screens/Hasil.tsx` |
| 1j — Halaman guru | `#/guru` | `src/screens/Guru.tsx` |
| 1k — Kuis unit | `#/ujian/kerjakan` (paket `kuis-*`) | `src/screens/Ujian.tsx` |

Tiga varian alternatif pada mockup — **1b** (beranda rel 30 pertemuan),
**1d** (materi satu kolom), dan **1h** (ujian editor-dominan) — sengaja *tidak*
diimplementasikan: ketiganya adalah tawaran pengganti untuk layar yang sama,
bukan layar tambahan. Token warna, huruf, dan radiusnya sudah ada di
`src/styles/tokens.css` bila salah satunya ingin dipakai nanti.

Rute memakai **HashRouter**. GitHub Pages menyajikan berkas statis dan tidak bisa
mengarahkan `/ujian/kerjakan` ke `index.html`; dengan hash, me-refresh di tengah
ujian tidak menghasilkan 404.

---

## Menjalankan Python di browser

Pyodide (CPython → WASM) dimuat di Web Worker sehingga UI tidak membeku
(`src/python/worker.ts`).

**Batas 10 detik (F-E04).** Tanpa `SharedArrayBuffer` — GitHub Pages tidak bisa
mengirim header COOP/COEP — Pyodide tidak dapat diinterupsi dari luar. Karena itu
worker yang melewati batas dimatikan lalu diganti; Pyodide berikutnya diambil dari
cache. Hitungan 10 detik baru dimulai setelah worker mengabarkan bahwa kode
benar-benar dieksekusi, jadi unduhan pertama (±10 MB) tidak ikut terhitung.

**`input()` interaktif (F-E03).** Juga tanpa `SharedArrayBuffer`, stdin sinkron
tidak tersedia. Solusinya: worker menyimpan antrean baris masukan; saat program
meminta masukan yang belum ada, stdin mengembalikan `null` sehingga Python
melempar `EOFError` — di sini artinya “butuh satu baris lagi”. UI meminta baris itu
lalu **menjalankan ulang program dari awal** dengan antrean yang bertambah.
Keluaran lari sebelumnya selalu menjadi awalan keluaran berikutnya, jadi
selisihnya disambung menjadi transkrip yang terbaca seperti terminal sungguhan.

Konsekuensinya: teknik ini tepat untuk program deterministik tanpa efek samping —
yaitu seluruh materi V1. Program yang memakai `random` tanpa seed atau waktu
berjalan akan berbeda antar lari.

`stdout` dipasang dengan `write`, bukan `batched`, karena ajakan seperti
`input("Nama: ")` tidak diakhiri baris baru dan takkan pernah muncul di layar
dalam mode batched.

---

## Materi

Halaman materi adalah berkas Markdown di `src/content/materi/` (F-M05). Menambah
halaman cukup menaruh berkas baru — tidak ada kode yang perlu diubah.

```markdown
---
unit: U3
urut: 2
judul: Percabangan elif
pertemuan: Pertemuan 8
intisari: Satu kalimat untuk slide presentasi.
poin:
  - Butir besar untuk slide
---

Paragraf biasa.

```python jalankan judul="Contoh 1"
print("kode ini bisa dijalankan murid")
```

:::latihan
Instruksi latihan mandiri.

```python
kerangka = "kode awal"
```

petunjuk: Terbuka setelah dua kali percobaan.
:::
```

Yang sudah ditulis: **U1–U3 lengkap (10 halaman, pertemuan 1–10 sampai UTS)**, dan
satu halaman wakil untuk masing-masing U4–U8. Sisanya menyusul pada tahap M5 sesuai
rencana rilis PRD §14 — kartu unit di beranda menandai unit yang materinya belum ada.

---

## Bank soal & penilaian

Keputusan PRD §10 dijaga secara mekanis: **soal, test tersembunyi, dan kunci
jawaban tidak pernah ada di repo maupun di bundel yang diterima murid.**

- `src/lib/bankSoal.ts` — modul kanonik, **sengaja kosong**, inilah yang ter-commit.
- `src/lib/bankDemo.ts` — bank lengkap untuk mencoba tanpa backend. Masuk
  `.gitignore`; `vite.config.ts` mengalihkan impor ke sini **hanya** bila
  berkasnya ada DAN `VITE_API_URL` kosong.
- Mode produksi — soal datang dari sheet `_Bank` lewat Apps Script.

Build produksi diperiksa agar tidak ada satu pun id soal, `outputKunci`, atau
`kodeReferensi` yang tersisa di bundel. `vite.config.ts` juga membatalkan build
bila `VITE_API_URL` kosong sekaligus bank lokal tidak ada — situs tanpa soal
lebih baik gagal terbit daripada baru ketahuan saat kelas sudah dimulai.

Susunan kolom `_Bank` mengikuti PRD §17. Beberapa test dalam satu sel dipisah
tanda `|`, jadi jangan memakai karakter itu di dalam isi soal.

Saat sesi dibuka, Apps Script hanya mengirim deskripsi, test contoh, dan
**input** test tersembunyi. Browser menjalankan kode murid lalu mengirim balik
**keluarannya**; pencocokan dan perhitungan nilai terjadi di server.

Di mode demo, halaman guru menyediakan **Periksa Bank Soal**: setiap
`kodeReferensi` dijalankan di Pyodide terhadap seluruh test, lalu hasilnya
dibandingkan dengan kunci — sehingga baris yang kuncinya keliru ketahuan sebelum
sesi dibuka. Pada mode produksi pemeriksaan setara dijalankan lewat fungsi
`periksaBankSoal()` di editor Apps Script.

---

## Backend Apps Script

`apps-script/Code.gs` mengimplementasikan kontrak API PRD §12 dan rancangan sheet §11.

1. Buka spreadsheet guru → **Extensions → Apps Script**, tempel `Code.gs`.
2. Jalankan `siapkanSpreadsheet()` sekali — membuat 8 sheet nilai (4 kelas × ujian/kuis),
   `_Bank`, `_Sesi`, `_Rekap`, dan `_Log`.
3. **Project Settings → Script Properties** → tambahkan `PIN_GURU` (F-G01: PIN tidak
   pernah ada di kode front-end).
4. **Deploy → New deployment → Web app** — *Execute as: Me*, *Who has access: Anyone*.
5. Salin URL `/exec` ke `VITE_API_URL`.

POST dikirim sebagai `text/plain` agar tergolong *simple request* dan tidak memicu
preflight CORS, yang tidak dijawab Apps Script. Penulisan baris memakai
`LockService` agar 40 submisi dalam satu menit tidak saling menimpa, dan submisi
ulang dengan NIS + paket + sesi yang sama **menimpa** baris lama, bukan menambah.

---

## Anti-cheat

`src/lib/useAntiCheat.ts` menjalankan F-A01 sampai F-A04: tempel, klik kanan, dan
seleksi teks soal diblokir selama ujian; perpindahan tab dihitung lewat
`visibilitychange` + `blur` dengan peringatan pada kejadian ke-1 dan ke-2; durasi
per soal dan jumlah kali kode dijalankan dicatat; kode jawaban lengkap ikut dikirim
ke Sheets.

Sesuai catatan PRD §8.4: karena seluruh aplikasi berjalan di browser murid, ini
bersifat **penghalang, bukan pengaman**. Murid yang paham DevTools bisa
melewatinya. Pengawasan langsung di kelas tetap lapisan utamanya.

---

## Deploy ke GitHub Pages

```bash
BASE_PATH=/nama-repo/ npm run build
```

Alur `.github/workflows/deploy.yml` menjalankannya otomatis pada setiap push ke
`main` dan menerbitkan `dist/`. Untuk domain sendiri, kosongkan `BASE_PATH`.

---

## Struktur

```
src/
  components/   Editor CodeMirror, konsol Python, panel editor, header
  content/      Markdown materi + loader + peta 30 pertemuan
  lib/          API Apps Script, bank demo, timer, anti-cheat, penyimpanan
  python/       Web Worker Pyodide + hook penjalan
  screens/      Delapan layar inti dari mockup
  styles/       Token desain dari mockup + tata letak responsif
apps-script/    Backend Google Apps Script
```

## Catatan atas PRD

- §6 menyebut Unit 8 dinilai **rubrik proyek**, sementara §17 menghitung kuis untuk
  8 unit (8 × 10 soal). Yang diikuti di sini adalah §6: kuis otomatis tersedia untuk
  U1–U7, dan U8 memakai halaman rubrik. Bila memang diinginkan kuis U8, tinggal
  menambahkan grup `u8-p1`…`u8-p5` di `_Bank`.
- §17 merencanakan ±160 soal dalam dua tahap. Repo ini memuat 36 soal — varian
  tunggal untuk tiap posisi, ditambah satu contoh varian kedua (`u1-01` / `u1-01b`)
  yang mendemonstrasikan pengacakan antar murid.
