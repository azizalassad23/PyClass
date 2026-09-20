# PyClass Ujian — aplikasi Android

Cangkang ujian untuk PyClass. Aplikasi ini memuat situs PyClass di dalam WebView
dan menambahkan penguncian tingkat OS yang tidak bisa dilakukan halaman web.

Soal, penilaian, timer, dan anti-cheat web tetap berada di situs. Mengganti soal
atau memperbaiki kunci cukup dilakukan di spreadsheet; aplikasi tidak perlu
dibangun ulang.

## Yang dikunci aplikasi

| Kemampuan | Cara |
|---|---|
| Layar penuh terkunci | Screen pinning (`startLockTask`) |
| Notifikasi diam | Jangan Ganggu, saringan `INTERRUPTION_FILTER_ALARMS` |
| Volume alarm penuh | `STREAM_ALARM` disetel maksimum |
| Tangkapan & rekam layar hitam | `FLAG_SECURE` |
| Layar tidak mati | `FLAG_KEEP_SCREEN_ON` |
| Tombol kembali mati | `onBackPressed` dikosongkan |
| Pindah situs ditolak | `shouldOverrideUrlLoading` hanya mengizinkan host PyClass |
| Alarm saat murid keluar | `onPause` saat ujian masih berjalan |
| HP dimatikan tercatat | `ACTION_SHUTDOWN`, dikirim saat aplikasi dibuka lagi |

## Keluar dari aplikasi

1. Selesai mengirim jawaban: kunci lepas sendiri.
2. Keluar lebih awal: murid menekan **Keluar**, lalu guru mengetikkan **kode
   keluar** sesi itu. Kode tampil di halaman guru, berbeda dari kode sesi, dan
   hanya dibandingkan di server. Kode tidak pernah dikirim ke HP murid.
3. Jaringan mati: tahan tombol **Keluar** selama 10 detik. Alarm berbunyi, kunci
   lepas, dan kejadiannya dikirim ke guru begitu jaringan pulih. Tanpa jalur ini
   murid bisa terkunci permanen saat internet putus.

Tiga keadaan itu dibedakan di papan pantau guru: `keluar · izin guru`,
`keluar darurat`, dan `hilang` (denyut berhenti).

## Batas jujurnya

Screen pinning pada HP pribadi dapat dilepas murid dengan PIN miliknya sendiri.
Penguncian mutlak hanya mungkin pada perangkat milik sekolah yang didaftarkan
sebagai Device Owner. Yang dijamin aplikasi ini bukan "tidak bisa keluar",
melainkan **"setiap keluar berbunyi dan tercatat di papan pantau guru"**.

## Membangun APK

APK dibangun otomatis oleh GitHub Actions (`.github/workflows/apk.yml`) setiap
kali berkas di `android/` berubah. Hasilnya tersedia di rilis **apk-terbaru**,
dengan tautan yang tidak berubah sehingga QR yang sudah dicetak tetap berlaku.

Membangun sendiri (perlu JDK 17, Android SDK, Gradle 8.7):

```bash
cd android
gradle assembleRelease
```

APK memakai tanda tangan debug karena dibagikan lewat tautan, bukan Play Store.

## Memasang di HP murid

Lakukan **satu pertemuan sebelum ujian**, jangan di hari ujian.

1. Buka tautan rilis `apk-terbaru`, unduh `PyClass-Ujian.apk`.
2. Android meminta izin "instal aplikasi tidak dikenal" untuk peramban. Izinkan.
3. Buka aplikasi sekali, lalu berikan izin **Jangan Ganggu** saat diminta.
4. Coba satu kuis unit singkat untuk memastikan Python berjalan di HP itu.
