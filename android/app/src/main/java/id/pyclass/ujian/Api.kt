package id.pyclass.ujian

import org.json.JSONObject
import java.io.BufferedReader
import java.net.HttpURLConnection
import java.net.URL

/**
 * Pemanggil Apps Script. Sengaja memakai HttpURLConnection bawaan supaya
 * aplikasi tidak butuh pustaka pihak ketiga sama sekali.
 *
 * Badan permintaan dikirim sebagai text/plain, sama seperti situs PyClass:
 * Apps Script menolak preflight CORS, dan text/plain menghindarinya.
 */
object Api {

    /**
     * [jaringan] benar bila server tidak bisa dihubungi sama sekali, supaya
     * aplikasi tidak menghitungnya sebagai kode salah.
     */
    data class Hasil(val ok: Boolean, val pesan: String, val jaringan: Boolean = false) {
        /**
         * Cocok dengan pesan aksiKodeKeluar di Code.gs. Hanya kode yang benar-benar
         * salah yang dihitung menuju alarm; sesi ditutup dan sejenisnya tidak.
         */
        val kodeSalah: Boolean get() = !ok && !jaringan && pesan == "Kode keluar salah."
    }

    /** Guru memasukkan kode keluar di HP murid. Kode hanya dibandingkan di server. */
    fun kodeKeluar(sesi: String, nis: String, kode: String): Hasil =
        kirim("kodeKeluar", JSONObject().put("sesi", sesi).put("nis", nis).put("kode", kode))

    /** Jalur darurat: murid keluar tanpa kode. Ini catatan untuk guru, bukan izin. */
    fun keluarDarurat(sesi: String, nis: String, alasan: String): Hasil =
        kirim("keluarDarurat", JSONObject().put("sesi", sesi).put("nis", nis).put("alasan", alasan))

    private fun kirim(aksi: String, badan: JSONObject): Hasil {
        return try {
            val jawaban = postLaluIkutiPengalihan(Konfig.URL_API + "?action=" + aksi, badan.toString())
            val obj = JSONObject(jawaban)
            Hasil(obj.optBoolean("ok", false), obj.optString("pesan", ""))
        } catch (e: Exception) {
            Hasil(false, "Tidak bisa menghubungi server: " + (e.message ?: "jaringan bermasalah"), jaringan = true)
        }
    }

    /**
     * Apps Script menjawab POST dengan pengalihan 302 ke googleusercontent.com,
     * dan HttpURLConnection tidak mengikuti pengalihan lintas host untuk POST.
     * Karena itu pengalihannya diikuti sendiri dengan GET, paling banyak tiga kali.
     */
    private fun postLaluIkutiPengalihan(url: String, badan: String): String {
        var alamat = url
        var isi: String? = badan
        repeat(4) {
            val koneksi = (URL(alamat).openConnection() as HttpURLConnection).apply {
                connectTimeout = 15_000
                readTimeout = 20_000
                instanceFollowRedirects = false
            }
            if (isi != null) {
                koneksi.requestMethod = "POST"
                koneksi.doOutput = true
                koneksi.setRequestProperty("Content-Type", "text/plain;charset=UTF-8")
                koneksi.outputStream.use { it.write(isi!!.toByteArray(Charsets.UTF_8)) }
            } else {
                koneksi.requestMethod = "GET"
            }

            val kode = koneksi.responseCode
            if (kode in 301..303 || kode == 307 || kode == 308) {
                val tujuan = koneksi.getHeaderField("Location") ?: throw IllegalStateException("Pengalihan tanpa alamat")
                koneksi.disconnect()
                alamat = tujuan
                // 302 dan 303 dari Apps Script harus diambil dengan GET.
                isi = if (kode == 307 || kode == 308) badan else null
                return@repeat
            }

            val aliran = if (kode in 200..299) koneksi.inputStream else koneksi.errorStream
            val teks = aliran.bufferedReader().use(BufferedReader::readText)
            koneksi.disconnect()
            return teks
        }
        throw IllegalStateException("Terlalu banyak pengalihan")
    }
}
