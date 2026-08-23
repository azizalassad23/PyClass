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

Tanpa konfigurasi tambahan aplikasi berjalan dalam **mode demo**: bank soal contoh
(36 soal) dipakai langsung dari browser, penilaian dihitung lokal, dan tidak ada
yang dikirim ke Google Sheets. Setiap halaman menandainya dengan lencana
“Mode demo”.

Untuk menyambungkan ke backend sungguhan, salin `.env.example` menjadi `.env` dan
isi `VITE_API_URL` dengan URL `/exec` milik Apps Script.

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

`src/lib/bankDemo.ts` berisi 36 soal untuk U1–U7, lengkap dengan 2 test contoh,
3 test tersembunyi, kunci jawaban, dan `kodeReferensi` (solusi guru). Kolomnya
sama persis dengan kolom sheet `_Bank` pada PRD §17.

**Berkas ini hanya untuk mode demo.** Pada arsitektur sungguhnya ia tidak ada di
repo: repo GitHub Pages bersifat publik, jadi soal, test tersembunyi, dan kunci
jawaban tinggal di sheet `_Bank` milik guru. Saat sesi dibuka, Apps Script hanya
mengirim deskripsi, test contoh, dan **input** test tersembunyi. Browser
menjalankan kode murid lalu mengirim balik **keluarannya**; pencocokan dan
perhitungan nilai terjadi di server.

Halaman guru menyediakan **Periksa Bank Soal**: setiap `kodeReferensi` dijalankan
di Pyodide terhadap seluruh test contoh dan test tersembunyi, lalu hasilnya
dibandingkan dengan kunci. Baris yang kuncinya tidak cocok dengan solusinya sendiri
ketahuan sebelum sesi dibuka, bukan saat 36 murid sudah duduk di depan komputer.
Seluruh 36 soal di repo ini sudah lolos pemeriksaan tersebut.

Tombol **Unduh untuk sheet _Bank (.csv)** di panel yang sama menuliskan bank demo
dalam susunan kolom `_Bank` sehingga bisa langsung diimpor ke spreadsheet guru.

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
