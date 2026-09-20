package id.pyclass.ujian

/**
 * Alamat yang dipakai aplikasi. Keduanya publik — situs PyClass dan Web App
 * Apps Script — jadi tidak ada rahasia di berkas ini. Kode keluar TIDAK pernah
 * ada di sini: aplikasi hanya mengirim tebakan murid ke server dan menerima
 * jawaban cocok atau tidak.
 */
object Konfig {
    /** Halaman masuk ujian. Seluruh logika ujian tetap di situs, bukan di aplikasi. */
    const val URL_SITUS = "https://azizalassad23.github.io/PyClass/#/ujian"

    /** Host yang boleh dibuka di dalam aplikasi. Selain ini ditolak. */
    val HOST_DIIZINKAN = setOf("azizalassad23.github.io", "cdn.jsdelivr.net")

    /** Web App Apps Script milik guru. */
    const val URL_API =
        "https://script.google.com/macros/s/AKfycbxCBDewucqkEoVS39qCDNw7hLxDVtL8Knz44y-pDldV6YO3dki3eFDEgQWFXCAm6DVRaQ/exec"

    /** Salah kode keluar sebanyak ini membunyikan alarm. */
    const val BATAS_SALAH = 3

    /** Lama tombol keluar ditahan untuk jalur darurat, dalam milidetik. */
    const val TAHAN_DARURAT_MS = 10_000L

    /** Lama alarm berbunyi, dalam milidetik. */
    const val ALARM_MS = 6_000L
}
