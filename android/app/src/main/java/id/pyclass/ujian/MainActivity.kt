package id.pyclass.ujian

import android.animation.Animator
import android.animation.AnimatorListenerAdapter
import android.animation.ValueAnimator
import android.annotation.SuppressLint
import android.app.Activity
import android.app.Dialog
import android.content.Context
import android.graphics.Bitmap
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.os.SystemClock
import android.view.HapticFeedbackConstants
import android.view.MotionEvent
import android.view.View
import android.view.ViewGroup
import android.view.animation.DecelerateInterpolator
import android.view.animation.LinearInterpolator
import android.webkit.WebChromeClient
import android.webkit.WebResourceError
import android.webkit.WebResourceRequest
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.ProgressBar
import android.widget.TextView
import android.widget.Toast
import org.json.JSONObject
import org.json.JSONTokener
import java.util.concurrent.Executors
import kotlin.math.ceil

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
    private lateinit var progresMuat: ProgressBar
    private lateinit var lapisanMuat: View
    private lateinit var lapisanOffline: View
    private lateinit var lapisanDarurat: View
    private lateinit var lembarDarurat: View
    private lateinit var progresDarurat: ProgressBar
    private lateinit var hitungDarurat: TextView

    private val tangan = Handler(Looper.getMainLooper())
    private val pekerja = Executors.newSingleThreadExecutor()

    /** Benar setelah guru memberi kode keluar atau murid memakai jalur darurat. */
    private var bolehKeluar = false
    private var salahBerturut = 0

    /** Benar saat aplikasi sendiri yang membuka layar pengaturan izin. */
    private var membukaPengaturan = false

    /** Benar bila ada ujian yang sedang dikerjakan; sebelum itu alarm tidak berbunyi. */
    private var ujianBerjalan = false

    private var dialogKeluar: Dialog? = null
    private var animasiDarurat: ValueAnimator? = null
    private var waktuTekan = 0L

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(simpanan: Bundle?) {
        super.onCreate(simpanan)
        penguncian = Penguncian(this)
        setContentView(R.layout.activity_utama)

        web = findViewById(R.id.web)
        labelStatus = findViewById(R.id.label_status)
        progresMuat = findViewById(R.id.progres_muat)
        lapisanMuat = findViewById(R.id.lapisan_muat)
        lapisanOffline = findViewById(R.id.lapisan_offline)
        lapisanDarurat = findViewById(R.id.lapisan_darurat)
        lembarDarurat = findViewById(R.id.lembar_darurat)
        progresDarurat = findViewById(R.id.progres_darurat)
        hitungDarurat = findViewById(R.id.hitung_darurat)

        siapkanWeb()
        siapkanTombolKeluar()
        findViewById<View>(R.id.tombol_coba_lagi).setOnClickListener { cobaLagi() }

        web.loadUrl(Konfig.URL_SITUS)
        penguncian.mulai()
        if (!penguncian.izinJanganGangguAda()) tawarkanIzinJanganGanggu()
        kirimCatatanTertunda()
        pantauIdentitas()
    }

    // ── WebView ─────────────────────────────────────────────────────────────

    @SuppressLint("SetJavaScriptEnabled")
    private fun siapkanWeb() {
        web.settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            mediaPlaybackRequiresUserGesture = false
            // Berkas lokal tidak pernah dibutuhkan; mematikannya menutup satu
            // jalan keluar dari WebView.
            allowFileAccess = false
            allowContentAccess = false
        }
        web.webChromeClient = object : WebChromeClient() {
            override fun onProgressChanged(tampilan: WebView, persen: Int) {
                progresMuat.progress = persen
                progresMuat.visibility = if (persen < 100) View.VISIBLE else View.INVISIBLE
            }
        }
        web.webViewClient = object : WebViewClient() {
            override fun shouldOverrideUrlLoading(tampilan: WebView, permintaan: WebResourceRequest): Boolean {
                val host = permintaan.url.host ?: return true
                // Tautan ke luar ditolak: murid tidak bisa berpindah ke situs lain
                // walaupun ada tautan di halaman.
                return host !in Konfig.HOST_DIIZINKAN
            }

            override fun onPageStarted(tampilan: WebView, url: String, ikon: Bitmap?) {
                lapisanOffline.visibility = View.GONE
            }

            override fun onPageFinished(tampilan: WebView, url: String) {
                if (lapisanOffline.visibility != View.VISIBLE) sembunyikan(lapisanMuat)
            }

            override fun onReceivedError(tampilan: WebView, permintaan: WebResourceRequest, galat: WebResourceError) {
                // Hanya halaman utama yang dianggap gagal; gambar atau skrip yang
                // gagal dimuat tidak boleh menutup layar ujian.
                if (permintaan.isForMainFrame) {
                    lapisanMuat.visibility = View.GONE
                    tampilkan(lapisanOffline)
                }
            }
        }
    }

    private fun cobaLagi() {
        lapisanOffline.visibility = View.GONE
        lapisanMuat.alpha = 1f
        lapisanMuat.visibility = View.VISIBLE
        web.reload()
    }

    private fun tampilkan(v: View) {
        v.alpha = 0f
        v.visibility = View.VISIBLE
        v.animate().alpha(1f).setDuration(180).setListener(null).start()
    }

    private fun sembunyikan(v: View) {
        if (v.visibility != View.VISIBLE) return
        v.animate().alpha(0f).setDuration(220).setListener(object : AnimatorListenerAdapter() {
            override fun onAnimationEnd(animasi: Animator) {
                v.visibility = View.GONE
                v.alpha = 1f
            }
        }).start()
    }

    // ── Tombol Keluar: ketuk = kode guru, tahan = darurat ────────────────────

    /**
     * Ketukan biasa membuka layar kode keluar. Menahan lebih dari
     * [AMBANG_TAHAN_MS] memunculkan lembar darurat dengan hitung mundur; melepas
     * sebelum habis membatalkannya.
     */
    @SuppressLint("ClickableViewAccessibility")
    private fun siapkanTombolKeluar() {
        val tombol = findViewById<View>(R.id.tombol_keluar)
        val mulaiDarurat = Runnable { mulaiHitungDarurat() }
        tombol.setOnClickListener { bukaKodeKeluar() }
        tombol.setOnTouchListener { v, kejadian ->
            when (kejadian.actionMasked) {
                MotionEvent.ACTION_DOWN -> {
                    v.isPressed = true
                    waktuTekan = SystemClock.uptimeMillis()
                    tangan.postDelayed(mulaiDarurat, AMBANG_TAHAN_MS)
                }
                MotionEvent.ACTION_UP -> {
                    v.isPressed = false
                    tangan.removeCallbacks(mulaiDarurat)
                    if (animasiDarurat != null) {
                        batalkanHitungDarurat()
                    } else if (SystemClock.uptimeMillis() - waktuTekan < AMBANG_TAHAN_MS) {
                        v.performClick()
                    }
                }
                MotionEvent.ACTION_CANCEL -> {
                    v.isPressed = false
                    tangan.removeCallbacks(mulaiDarurat)
                    batalkanHitungDarurat()
                }
            }
            true
        }
    }

    private fun mulaiHitungDarurat() {
        tombolBergetar()
        progresDarurat.progress = 0
        hitungDarurat.text = (Konfig.TAHAN_DARURAT_MS / 1000).toString()
        lapisanDarurat.alpha = 0f
        lapisanDarurat.visibility = View.VISIBLE
        lapisanDarurat.animate().alpha(1f).setDuration(160).setListener(null).start()
        lembarDarurat.translationY = 240f
        lembarDarurat.animate().translationY(0f).setInterpolator(DecelerateInterpolator()).setDuration(260).start()

        var dibatalkan = false
        animasiDarurat = ValueAnimator.ofInt(0, progresDarurat.max).apply {
            duration = Konfig.TAHAN_DARURAT_MS
            interpolator = LinearInterpolator()
            addUpdateListener {
                val nilai = it.animatedValue as Int
                progresDarurat.progress = nilai
                val sisa = ceil((1 - it.animatedFraction) * Konfig.TAHAN_DARURAT_MS / 1000.0).toInt()
                hitungDarurat.text = sisa.coerceAtLeast(0).toString()
            }
            addListener(object : AnimatorListenerAdapter() {
                override fun onAnimationCancel(animasi: Animator) { dibatalkan = true }
                override fun onAnimationEnd(animasi: Animator) {
                    if (!dibatalkan) jalankanDarurat()
                }
            })
            start()
        }
    }

    private fun batalkanHitungDarurat() {
        animasiDarurat?.cancel()
        animasiDarurat = null
        if (lapisanDarurat.visibility == View.VISIBLE) sembunyikan(lapisanDarurat)
    }

    private fun jalankanDarurat() {
        animasiDarurat = null
        tombolBergetar()
        penguncian.bunyikanAlarm()
        ambilIdentitas { sesi, nis ->
            if (sesi != null && nis != null) catatDarurat(sesi, nis)
            bolehKeluar = true
            penguncian.selesai()
            finish()
        }
    }

    private fun tombolBergetar() {
        findViewById<View>(R.id.tombol_keluar).performHapticFeedback(HapticFeedbackConstants.LONG_PRESS)
    }

    // ── Keluar dengan kode guru ─────────────────────────────────────────────

    private fun bukaKodeKeluar() {
        if (dialogKeluar?.isShowing == true) return
        ambilIdentitas { sesi, nis ->
            if (sesi == null || nis == null) {
                Toast.makeText(this, R.string.keluar_belum_masuk, Toast.LENGTH_LONG).show()
                return@ambilIdentitas
            }
            val dialog = DialogKodeKeluar(this, sesi, nis, object : DialogKodeKeluar.Pendengar {
                override fun periksa(kode: String, jawab: (Boolean, String) -> Unit) {
                    periksaKode(sesi, nis, kode, jawab)
                }

                override fun berhasil() {
                    bolehKeluar = true
                    dialogKeluar?.dismiss()
                    penguncian.selesai()
                    finish()
                }
            })
            dialogKeluar = dialog
            dialog.show()
        }
    }

    private fun periksaKode(sesi: String, nis: String, kode: String, jawab: (Boolean, String) -> Unit) {
        pekerja.execute {
            val hasil = Api.kodeKeluar(sesi, nis, kode)
            tangan.post {
                when {
                    hasil.ok -> {
                        salahBerturut = 0
                        jawab(true, "")
                    }
                    hasil.jaringan -> jawab(false, getString(R.string.keluar_tanpa_jaringan))
                    hasil.kodeSalah -> {
                        salahBerturut++
                        val sisa = Konfig.BATAS_SALAH - salahBerturut
                        if (sisa <= 0) {
                            salahBerturut = 0
                            penguncian.bunyikanAlarm()
                            jawab(false, getString(R.string.keluar_salah_alarm))
                        } else {
                            jawab(false, getString(R.string.keluar_salah_sisa, sisa))
                        }
                    }
                    // Sesi ditutup, sesi lama tanpa kode, dan sebagainya: pesan
                    // server sudah ditulis untuk dibaca manusia.
                    else -> jawab(false, hasil.pesan)
                }
            }
        }
    }

    // ── Izin Jangan Ganggu ──────────────────────────────────────────────────

    private fun tawarkanIzinJanganGanggu() {
        val dialog = Dialog(this, R.style.Tema_PyClass_Kartu)
        dialog.setContentView(R.layout.dialog_izin)
        dialog.setCancelable(false)
        dialog.window?.setLayout(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT)
        dialog.findViewById<View>(R.id.tombol_izin_buka).setOnClickListener {
            dialog.dismiss()
            // Membuka Pengaturan membuat aplikasi ini berhenti sesaat. Tanpa
            // penanda ini, alarm akan berbunyi padahal murid sedang menuruti
            // permintaan aplikasi sendiri.
            membukaPengaturan = true
            penguncian.mintaIzinJanganGanggu()
        }
        dialog.findViewById<View>(R.id.tombol_izin_nanti).setOnClickListener { dialog.dismiss() }
        dialog.show()
    }

    // ── Jalur darurat: catatan untuk guru ───────────────────────────────────

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

    // ── Identitas murid ─────────────────────────────────────────────────────

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

    /**
     * Menyalin sesi dan NIS ke penyimpanan aplikasi tiap 30 detik, dan
     * memperbarui chip status. PenerimaMati membutuhkan identitas itu saat HP
     * dimatikan, dan saat itu WebView sudah tidak bisa ditanya.
     */
    private fun pantauIdentitas() {
        ambilIdentitas { sesi, nis ->
            ujianBerjalan = sesi != null && nis != null
            labelStatus.setText(if (ujianBerjalan) R.string.status_berjalan else R.string.status_siap)
            if (sesi != null && nis != null) {
                getSharedPreferences("pyclass", Context.MODE_PRIVATE).edit()
                    .putString("sesi", sesi).putString("nis", nis).apply()
            }
        }
        tangan.postDelayed({ pantauIdentitas() }, 30_000)
    }

    // ── Daur hidup ──────────────────────────────────────────────────────────

    override fun onResume() {
        super.onResume()
        membukaPengaturan = false
        penguncian.hentikanAlarm()
        if (!bolehKeluar) penguncian.sematkanLayar()
    }

    /**
     * Murid melepas penyematan lalu berpindah aplikasi. Penyematan tidak bisa
     * ditahan pada HP pribadi, jadi yang dilakukan: alarm berbunyi. Papan pantau
     * sudah mendapat kabarnya lewat anti-cheat halaman web.
     */
    override fun onPause() {
        super.onPause()
        batalkanHitungDarurat()
        val sengaja = bolehKeluar || membukaPengaturan || isFinishing
        // Sebelum murid masuk ujian, keluar aplikasi bukan pelanggaran apa pun.
        if (!sengaja && ujianBerjalan) penguncian.bunyikanAlarm()
    }

    override fun onDestroy() {
        tangan.removeCallbacksAndMessages(null)
        dialogKeluar?.dismiss()
        penguncian.selesai()
        pekerja.shutdown()
        super.onDestroy()
    }

    /** Tombol kembali dimatikan selama ujian supaya WebView tidak bisa ditinggalkan. */
    @Suppress("DEPRECATION", "MissingSuperCall")
    override fun onBackPressed() {
        Toast.makeText(this, R.string.kembali_dimatikan, Toast.LENGTH_SHORT).show()
    }

    private companion object {
        /** Tekanan lebih lama dari ini dianggap menahan, bukan mengetuk. */
        const val AMBANG_TAHAN_MS = 600L
    }
}
