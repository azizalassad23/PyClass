# PyClass Ujian — aplikasi Android

Cangkang ujian untuk PyClass. Aplikasi ini memuat situs PyClass di dalam WebView
dan menambahkan penguncian tingkat OS yang tidak bisa dilakukan halaman web.

Soal, penilaian, timer, dan anti-cheat web tetap berada di situs. Mengganti soal
atau memperbaiki kunci cukup dilakukan di spreadsheet; aplikasi tidak perlu
dibangun ulang.

## Alur saat aplikasi dibuka

1. **Layar persiapan** menutup situs. Layar belum disematkan, jadi Pengaturan
   masih bisa dibuka. Ada tiga syarat, diperiksa ulang setiap kali murid kembali
   ke aplikasi:
   - izin Jangan Ganggu diberikan (tombol **Beri izin** membuka Pengaturan);
   - mode Jangan Ganggu aktif (dinyalakan aplikasi sendiri begitu izin ada);
   - volume alarm penuh (dinaikkan aplikasi; HP yang menolak diberi tombol
     **Naikkan** yang membuka panel volume).
2. **Mulai mode ujian** baru jalan setelah ketiganya tercentang. Aplikasi
   meminta penyematan layar dan menunggu murid menyetujui dialog Android.
3. **Mode ujian**: layar tersemat dan penuh (bilah status dan navigasi
   disembunyikan). Penjaga memeriksa tiap 2 detik: Jangan Ganggu atau volume yang
   diubah murid dipulihkan diam-diam; sematan yang dilepas membunyikan alarm dan
   menutup soal dengan layar **Kunci layar terlepas** sampai dikunci kembali.

Melepas sematan tidak memicu onPause karena aplikasi tetap di depan. Itu sebabnya
keadaannya ditanyakan berkala, bukan ditunggu lewat daur hidup Activity.

## Yang dikunci aplikasi

| Kemampuan | Cara |
|---|---|
| Layar penuh terkunci | Screen pinning (`startLockTask`), diperiksa lewat `lockTaskModeState` |
| Bilah sistem tersembunyi | `WindowInsetsController` / mode imersif |
| Notifikasi diam | Jangan Ganggu, saringan `INTERRUPTION_FILTER_ALARMS` |
| Volume alarm penuh | `STREAM_ALARM` disetel maksimum dan dijaga |
| Tangkapan & rekam layar hitam | `FLAG_SECURE` |
| Tombol kembali mati | `onBackPressed` dikosongkan selama ujian |
| Pindah situs ditolak | `shouldOverrideUrlLoading` hanya mengizinkan host PyClass |
| Alarm saat murid keluar | `onPause` dan penjaga sematan |
| HP dimatikan tercatat | `ACTION_SHUTDOWN`, dikirim saat aplikasi dibuka lagi |

## Keluar dari aplikasi

1. Belum masuk ujian atau sudah mengirim jawaban: tombol **Keluar** langsung
   menutup aplikasi tanpa kode.
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
3. Buka aplikasi sekali dan penuhi tiga syarat di layar persiapan.
4. Coba satu kuis unit singkat untuk memastikan Python berjalan di HP itu.
