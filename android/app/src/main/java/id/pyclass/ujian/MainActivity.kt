package id.pyclass.ujian

import android.annotation.SuppressLint
import android.app.Activity
import android.app.AlertDialog
import android.content.Context
import android.graphics.Color
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.text.InputType
import android.view.Gravity
import android.view.MotionEvent
import android.view.View
import android.view.ViewGroup
import android.webkit.WebResourceRequest
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.Button
import android.widget.EditText
import android.widget.LinearLayout
import android.widget.TextView
import android.widget.Toast
import org.json.JSONObject
import org.json.JSONTokener
import java.util.concurrent.Executors

/**
 * Cangkang ujian PyClass.
 *
 * Aplikasi ini TIDAK memuat soal, penilaian, atau anti-cheat web apa pun. Semua
 * itu tetap di situs PyClass yang dimuat WebView, jadi ganti soal atau perbaiki
 * kunci cukup di spreadsheet: aplikasi tidak perlu diperbarui.
 *
 * Yang ditambahkan aplikasi hanya lapisan OS: penyematan layar, Jangan Ganggu,
 * volume alarm, blokir tangkapan layar, dan alarm saat murid keluar.
 */
class MainActivity : Activity() {

    private lateinit var web: WebView
    private lateinit var penguncian: Penguncian
    private lateinit var labelStatus: TextView
    private val tangan = Handler(Looper.getMainLooper())
    private val pekerja = Executors.newSingleThreadExecutor()

    /** Benar setelah guru memberi kode keluar atau murid memakai jalur darurat. */
    private var bolehKeluar = false
    private var salahBerturut = 0
    private var tahanDarurat: Runnable? = null

    @SuppressLint("SetJavaScriptEnabled", "ClickableViewAccessibility")
    override fun onCreate(simpanan: Bundle?) {
        super.onCreate(simpanan)
        penguncian = Penguncian(this)
        setContentView(susunTampilan())

        web.settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            mediaPlaybackRequiresUserGesture = false
            // Berkas lokal tidak pernah dibutuhkan; mematikannya menutup satu
            // jalan keluar dari WebView.
            allowFileAccess = false
            allowContentAccess = false
        }
        web.webViewClient = object : WebViewClient() {
            override fun shouldOverrideUrlLoading(tampilan: WebView, permintaan: WebResourceRequest): Boolean {
                val host = permintaan.url.host ?: return true
                // Tautan ke luar ditolak: murid tidak bisa berpindah ke situs lain
                // walaupun ada tautan di halaman.
                return host !in Konfig.HOST_DIIZINKAN
            }
        }
        web.loadUrl(Konfig.URL_SITUS)

        penguncian.mulai()
        if (!penguncian.izinJanganGangguAda()) tawarkanIzinJanganGanggu()
        kirimCatatanTertunda()
        pantauIdentitas()
    }

    /**
     * Menyalin sesi dan NIS ke penyimpanan aplikasi tiap 30 detik. PenerimaMati
     * membutuhkannya saat HP dimatikan, dan saat itu WebView sudah tidak bisa ditanya.
     */
    private fun pantauIdentitas() {
        ambilIdentitas { sesi, nis ->
            if (sesi != null && nis != null) {
                getSharedPreferences("pyclass", Context.MODE_PRIVATE).edit()
                    .putString("sesi", sesi).putString("nis", nis).apply()
            }
        }
        tangan.postDelayed({ pantauIdentitas() }, 30_000)
    }

    // ── Tampilan ────────────────────────────────────────────────────────────

    private fun susunTampilan(): View {
        val akar = LinearLayout(this).apply { orientation = LinearLayout.VERTICAL }

        val bilah = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER_VERTICAL
            setBackgroundColor(Color.parseColor("#1F1B16"))
            setPadding(32, 16, 16, 16)
        }
        labelStatus = TextView(this).apply {
            text = getString(R.string.status_terkunci)
            setTextColor(Color.parseColor("#E8DDD0"))
            textSize = 13f
            layoutParams = LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1f)
        }
        val tombolKeluar = Button(this).apply {
            text = getString(R.string.tombol_keluar)
            setOnClickListener { tanyaKodeKeluar() }
            // Tahan lama = jalur darurat saat jaringan mati.
            setOnTouchListener { _, kejadian ->
                when (kejadian.action) {
                    MotionEvent.ACTION_DOWN -> mulaiHitungDarurat()
                    MotionEvent.ACTION_UP, MotionEvent.ACTION_CANCEL -> batalkanHitungDarurat()
                }
                // false: ketukan biasa tetap diteruskan ke setOnClickListener.
                false
            }
        }
        bilah.addView(labelStatus)
        bilah.addView(tombolKeluar)

        web = WebView(this).apply {
            layoutParams = LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT, 0, 1f,
            )
        }
        akar.addView(bilah, LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT))
        akar.addView(web)
        return akar
    }

    private fun tawarkanIzinJanganGanggu() {
        AlertDialog.Builder(this)
            .setTitle(R.string.izin_judul)
            .setMessage(R.string.izin_pesan)
            .setPositiveButton(R.string.izin_buka) { _, _ -> penguncian.mintaIzinJanganGanggu() }
            .setNegativeButton(R.string.izin_nanti, null)
            .setCancelable(false)
            .show()
    }

    // ── Keluar dengan kode guru ─────────────────────────────────────────────

    private fun tanyaKodeKeluar() {
        val isian = EditText(this).apply {
            inputType = InputType.TYPE_CLASS_NUMBER
            hint = getString(R.string.keluar_petunjuk)
        }
        AlertDialog.Builder(this)
            .setTitle(R.string.keluar_judul)
            .setMessage(R.string.keluar_pesan)
            .setView(isian)
            .setPositiveButton(R.string.keluar_periksa) { _, _ -> periksaKode(isian.text.toString().trim()) }
            .setNegativeButton(R.string.keluar_batal, null)
            .show()
    }

    private fun periksaKode(kode: String) {
        if (kode.length != 6) {
            Toast.makeText(this, R.string.keluar_enam_digit, Toast.LENGTH_SHORT).show()
            return
        }
        ambilIdentitas { sesi, nis ->
            if (sesi == null || nis == null) {
                Toast.makeText(this, R.string.keluar_belum_masuk, Toast.LENGTH_LONG).show()
                return@ambilIdentitas
            }
            labelStatus.setText(R.string.status_memeriksa)
            pekerja.execute {
                val hasil = Api.kodeKeluar(sesi, nis, kode)
                tangan.post {
                    if (hasil.ok) {
                        bolehKeluar = true
                        labelStatus.setText(R.string.status_terbuka)
                        penguncian.selesai()
                        finish()
                    } else {
                        salahBerturut++
                        labelStatus.setText(R.string.status_terkunci)
                        Toast.makeText(this, hasil.pesan, Toast.LENGTH_LONG).show()
                        if (salahBerturut >= Konfig.BATAS_SALAH) {
                            salahBerturut = 0
                            penguncian.bunyikanAlarm()
                        }
                    }
                }
            }
        }
    }

    // ── Jalur darurat ───────────────────────────────────────────────────────

    private fun mulaiHitungDarurat() {
        batalkanHitungDarurat()
        val tugas = Runnable {
            penguncian.bunyikanAlarm()
            ambilIdentitas { sesi, nis ->
                if (sesi != null && nis != null) catatDarurat(sesi, nis)
                bolehKeluar = true
                penguncian.selesai()
                finish()
            }
        }
        tahanDarurat = tugas
        tangan.postDelayed(tugas, Konfig.TAHAN_DARURAT_MS)
    }

    private fun batalkanHitungDarurat() {
        tahanDarurat?.let { tangan.removeCallbacks(it) }
        tahanDarurat = null
    }

    /**
     * Kejadian darurat disimpan dulu, lalu dikirim. Kalau jaringan mati —
     * justru alasan jalur ini ada — catatannya menunggu sampai aplikasi dibuka lagi.
     */
    private fun catatDarurat(sesi: String, nis: String, alasan: String = "keluar darurat tanpa jaringan") {
        val simpanan = getSharedPreferences("pyclass", Context.MODE_PRIVATE)
        simpanan.edit().putString("tertunda", "$sesi|$nis|$alasan").apply()
        pekerja.execute {
            val hasil = Api.keluarDarurat(sesi, nis, alasan)
            if (hasil.ok) simpanan.edit().remove("tertunda").apply()
        }
    }

    private fun kirimCatatanTertunda() {
        val simpanan = getSharedPreferences("pyclass", Context.MODE_PRIVATE)
        val tertunda = simpanan.getString("tertunda", null) ?: return
        val bagian = tertunda.split("|")
        if (bagian.size < 3) {
            simpanan.edit().remove("tertunda").apply()
            return
        }
        pekerja.execute {
            val hasil = Api.keluarDarurat(bagian[0], bagian[1], bagian[2])
            if (hasil.ok) simpanan.edit().remove("tertunda").apply()
        }
    }

    /**
     * Identitas diambil dari penyimpanan situs, bukan ditanyakan lagi ke murid:
     * satu sumber data, dan tidak mungkin salah ketik NIS.
     */
    private fun ambilIdentitas(lanjut: (String?, String?) -> Unit) {
        web.evaluateJavascript("localStorage.getItem('pyclass:ujian-aktif')") { mentah ->
            try {
                if (mentah == null || mentah == "null") {
                    lanjut(null, null)
                    return@evaluateJavascript
                }
                // evaluateJavascript mengembalikan teks JSON, jadi isinya dibuka dua kali.
                val teks = JSONTokener(mentah).nextValue()
                val obj = JSONObject(if (teks is String) teks else mentah)
                lanjut(obj.optString("sesi", null), obj.optString("nis", null))
            } catch (e: Exception) {
                lanjut(null, null)
            }
        }
    }

    // ── Daur hidup ──────────────────────────────────────────────────────────

    override fun onResume() {
        super.onResume()
        if (!bolehKeluar) penguncian.sematkanLayar()
    }

    /**
     * Murid melepas penyematan lalu berpindah aplikasi. Penyematan tidak bisa
     * ditahan pada HP pribadi, jadi yang dilakukan: alarm berbunyi. Papan pantau
     * sudah mendapat kabarnya lewat anti-cheat halaman web.
     */
    override fun onPause() {
        super.onPause()
        if (!bolehKeluar && !isFinishing) penguncian.bunyikanAlarm()
    }

    override fun onDestroy() {
        penguncian.selesai()
        pekerja.shutdown()
        super.onDestroy()
    }

    /** Tombol kembali dimatikan selama ujian supaya WebView tidak bisa ditinggalkan. */
    @Suppress("DEPRECATION", "MissingSuperCall")
    override fun onBackPressed() {
        Toast.makeText(this, R.string.kembali_dimatikan, Toast.LENGTH_SHORT).show()
    }
}
