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
import android.view.LayoutInflater
import android.view.MotionEvent
import android.view.View
import android.view.animation.DecelerateInterpolator
import android.view.animation.LinearInterpolator
import android.webkit.WebChromeClient
import android.webkit.WebResourceError
import android.webkit.WebResourceRequest
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.FrameLayout
import android.widget.ImageView
import android.widget.LinearLayout
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
 * Alurnya bertahap:
 *   PERSIAPAN        — layar persiapan menutup situs; murid memenuhi tiga syarat.
 *                      Layar BELUM disematkan, jadi Pengaturan masih bisa dibuka.
 *   MENUNGGU_SEMATAN — murid menekan Mulai; Android menanyakan penyematan.
 *   UJIAN            — tersemat, layar penuh, penjaga memeriksa tiap 2 detik.
 *   TERLEPAS         — sematan dilepas di tengah ujian; alarm, soal ditutup lagi.
 */
class MainActivity : Activity() {

    private enum class Tahap { PERSIAPAN, MENUNGGU_SEMATAN, UJIAN, TERLEPAS }

    private lateinit var web: WebView
    private lateinit var penguncian: Penguncian
    private lateinit var labelStatus: TextView
    private lateinit var progresMuat: ProgressBar
    private lateinit var lapisanMuat: View
    private lateinit var lapisanOffline: View
    private lateinit var lapisanPersiapan: View
    private lateinit var lapisanDarurat: View
    private lateinit var lembarDarurat: View
    private lateinit var progresDarurat: ProgressBar
    private lateinit var hitungDarurat: TextView
    private lateinit var tombolMulai: TextView
    private lateinit var persiapanGalat: TextView

    private lateinit var barisIzin: View
    private lateinit var barisDnd: View
    private lateinit var barisVolume: View

    private val tangan = Handler(Looper.getMainLooper())
    private val pekerja = Executors.newSingleThreadExecutor()

    private var tahap = Tahap.PERSIAPAN

    /**
     * Benar sejak mode ujian pertama kali berhasil dimasuki. Menentukan ke
     * mana murid kembali bila penyematan ulang ditolak: ke TERLEPAS (tetap
     * butuh kode keluar), bukan ke PERSIAPAN yang boleh ditutup bebas.
     */
    private var pernahMasukUjian = false

    /** Benar setelah guru memberi kode keluar atau murid memakai jalur darurat. */
    private var bolehKeluar = false
    private var salahBerturut = 0

    /** Benar bila ada ujian yang sedang dikerjakan di situs. */
    private var ujianBerjalan = false

    private var dialogKeluar: Dialog? = null
    private var animasiDarurat: ValueAnimator? = null
    private var waktuTekan = 0L
    private var batasTungguSematan = 0L

    private val penjaga = object : Runnable {
        override fun run() {
            jagaUjian()
            // Dijadwalkan ulang hanya selama masih ujian: sematan yang terlepas
            // atau murid yang keluar menghentikan penjaga.
            if (tahap == Tahap.UJIAN && !bolehKeluar) tangan.postDelayed(this, JEDA_PENJAGA_MS)
        }
    }

    private val tungguSematan = object : Runnable {
        override fun run() {
            when {
                penguncian.sedangTersemat() -> masukModeUjian()
                SystemClock.uptimeMillis() > batasTungguSematan -> sematanGagal()
                else -> tangan.postDelayed(this, 400)
            }
        }
    }

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
        lapisanPersiapan = findViewById(R.id.lapisan_persiapan)
        lapisanDarurat = findViewById(R.id.lapisan_darurat)
        lembarDarurat = findViewById(R.id.lembar_darurat)
        progresDarurat = findViewById(R.id.progres_darurat)
        hitungDarurat = findViewById(R.id.hitung_darurat)
        tombolMulai = findViewById(R.id.tombol_mulai)
        persiapanGalat = findViewById(R.id.persiapan_galat)

        siapkanWeb()
        siapkanTombolKeluar()
        siapkanPersiapan()
        findViewById<View>(R.id.tombol_coba_lagi).setOnClickListener { cobaLagi() }

        // Tangkapan layar diblokir sejak awal, tetapi layar BELUM disematkan:
        // murid masih perlu membuka Pengaturan untuk memenuhi syarat.
        penguncian.pasangPengamanDasar()
        web.loadUrl(Konfig.URL_SITUS)
        kirimCatatanTertunda()
        pantauIdentitas()
    }

    // ── Layar persiapan ─────────────────────────────────────────────────────

    private fun siapkanPersiapan() {
        val daftar = findViewById<LinearLayout>(R.id.daftar_prasyarat)
        val inflater = LayoutInflater.from(this)
        fun baris(ikon: Int, judul: Int, ket: Int, tombol: Int, aksi: () -> Unit): View {
            val v = inflater.inflate(R.layout.baris_prasyarat, daftar, false)
            v.findViewById<ImageView>(R.id.ikon).setImageResource(ikon)
            v.findViewById<TextView>(R.id.judul).setText(judul)
            v.findViewById<TextView>(R.id.keterangan).setText(ket)
            v.findViewById<TextView>(R.id.tombol).apply {
                setText(tombol)
                setOnClickListener { aksi() }
            }
            daftar.addView(v)
            return v
        }

        barisIzin = baris(
            R.drawable.ic_lonceng_mati, R.string.syarat_izin_judul, R.string.syarat_izin_ket,
            R.string.syarat_izin_tombol,
        ) {
            if (!penguncian.bukaIzinJanganGanggu()) tampilkanGalatPersiapan(getString(R.string.persiapan_tanpa_halaman_izin))
        }
        barisDnd = baris(
            R.drawable.ic_senyap, R.string.syarat_dnd_judul, R.string.syarat_dnd_ket,
            R.string.syarat_dnd_tombol,
        ) {
            // Tanpa izin, Jangan Ganggu tidak bisa dinyalakan aplikasi.
            if (!penguncian.terapkanPrasyarat().izinJanganGanggu) penguncian.bukaIzinJanganGanggu()
            segarkanPersiapan()
        }
        barisVolume = baris(
            R.drawable.ic_volume, R.string.syarat_volume_judul, R.string.syarat_volume_ket,
            R.string.syarat_volume_tombol,
        ) {
            penguncian.bukaPengaturanVolume()
            tangan.postDelayed({ segarkanPersiapan() }, 600)
        }

        tombolMulai.setOnClickListener { mulaiModeUjian() }
    }

    /** Menerapkan ulang prasyarat dan memperbarui tampilan. Dipanggil tiap kembali ke aplikasi. */
    private fun segarkanPersiapan(): Penguncian.Prasyarat {
        val status = penguncian.terapkanPrasyarat()
        tandaiBaris(barisIzin, status.izinJanganGanggu)
        tandaiBaris(barisDnd, status.janganGangguAktif)
        tandaiBaris(barisVolume, status.volumePenuh)
        // Tombol tetap bisa ditekan walau tampak redup, supaya murid mendapat
        // penjelasan syarat mana yang kurang, bukan tombol yang diam saja.
        tombolMulai.alpha = if (status.terpenuhi) 1f else 0.4f
        if (status.terpenuhi && persiapanGalat.text.toString() == getString(R.string.persiapan_belum_lengkap)) {
            persiapanGalat.visibility = View.GONE
        }
        return status
    }

    private fun tandaiBaris(baris: View, ok: Boolean) {
        baris.findViewById<FrameLayout>(R.id.lingkaran)
            .setBackgroundResource(if (ok) R.drawable.bg_lingkaran_berhasil else R.drawable.bg_lingkaran_ikon)
        baris.findViewById<ImageView>(R.id.ikon)
            .setColorFilter(getColor(if (ok) R.color.daun_tua else R.color.jingga))
        baris.findViewById<View>(R.id.tombol).visibility = if (ok) View.GONE else View.VISIBLE
        baris.findViewById<View>(R.id.tanda_ok).visibility = if (ok) View.VISIBLE else View.GONE
    }

    private fun tampilkanGalatPersiapan(teks: String) {
        persiapanGalat.text = teks
        persiapanGalat.visibility = View.VISIBLE
    }

    private fun tampilkanPersiapan(terlepas: Boolean) {
        findViewById<TextView>(R.id.persiapan_judul)
            .setText(if (terlepas) R.string.terlepas_judul else R.string.persiapan_judul)
        findViewById<TextView>(R.id.persiapan_pesan)
            .setText(if (terlepas) R.string.terlepas_pesan else R.string.persiapan_pesan)
        tombolMulai.setText(if (terlepas) R.string.terlepas_mulai else R.string.persiapan_mulai)
        findViewById<ImageView>(R.id.persiapan_ikon)
            .setImageResource(if (terlepas) R.drawable.ic_alarm else R.drawable.ic_gembok)
        persiapanGalat.visibility = View.GONE
        aturMenunggu(false)
        penguncian.layarPenuh(false)
        if (lapisanPersiapan.visibility != View.VISIBLE) tampilkan(lapisanPersiapan)
        segarkanPersiapan()
    }

    private fun aturMenunggu(menunggu: Boolean) {
        findViewById<View>(R.id.persiapan_menunggu).visibility = if (menunggu) View.VISIBLE else View.GONE
        tombolMulai.text = if (menunggu) "" else getString(
            if (tahap == Tahap.TERLEPAS) R.string.terlepas_mulai else R.string.persiapan_mulai,
        )
    }

    // ── Masuk dan menjaga mode ujian ────────────────────────────────────────

    private fun mulaiModeUjian() {
        if (tahap == Tahap.MENUNGGU_SEMATAN) return
        // Syarat diperiksa lagi tepat sebelum mengunci; bisa saja berubah sejak
        // tampilan terakhir diperbarui.
        if (!segarkanPersiapan().terpenuhi) {
            tampilkanGalatPersiapan(getString(R.string.persiapan_belum_lengkap))
            return
        }
        persiapanGalat.visibility = View.GONE
        tahap = Tahap.MENUNGGU_SEMATAN
        aturMenunggu(true)
        penguncian.sematkan()
        // Dialog "Sematkan aplikasi?" dari Android ditunggu paling lama 20 detik.
        batasTungguSematan = SystemClock.uptimeMillis() + 20_000
        tangan.removeCallbacks(tungguSematan)
        tangan.post(tungguSematan)
    }

    private fun sematanGagal() {
        tahap = if (pernahMasukUjian) Tahap.TERLEPAS else Tahap.PERSIAPAN
        aturMenunggu(false)
        tampilkanGalatPersiapan(getString(R.string.persiapan_sematan_ditolak))
    }

    private fun masukModeUjian() {
        tahap = Tahap.UJIAN
        pernahMasukUjian = true
        aturMenunggu(false)
        penguncian.hentikanAlarm()
        sembunyikan(lapisanPersiapan)
        penguncian.layarPenuh(true)
        tangan.removeCallbacks(penjaga)
        tangan.postDelayed(penjaga, JEDA_PENJAGA_MS)
    }

    /**
     * Berjalan tiap 2 detik selama ujian. Jangan Ganggu yang dimatikan atau
     * volume yang diturunkan dipulihkan diam-diam. Sematan yang terlepas tidak
     * bisa dipulihkan tanpa murid, jadi alarm berbunyi dan soal ditutup.
     */
    private fun jagaUjian() {
        if (tahap != Tahap.UJIAN || bolehKeluar) return
        if (!penguncian.sedangTersemat()) {
            tahap = Tahap.TERLEPAS
            if (ujianBerjalan) penguncian.bunyikanAlarm()
            tampilkanPersiapan(terlepas = true)
            return
        }
        penguncian.terapkanPrasyarat()
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
        v.animate().cancel()
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
     * Sebelum mode ujian, aplikasi belum mengunci apa pun, jadi Keluar langsung
     * menutup aplikasi. Selama ujian, ketukan membuka layar kode keluar dan
     * menahan lebih dari [AMBANG_TAHAN_MS] memunculkan hitung mundur darurat.
     */
    @SuppressLint("ClickableViewAccessibility")
    private fun siapkanTombolKeluar() {
        val tombol = findViewById<View>(R.id.tombol_keluar)
        val mulaiDarurat = Runnable { if (sedangTerkunci()) mulaiHitungDarurat() }
        tombol.setOnClickListener {
            if (sedangTerkunci()) bukaKodeKeluar() else keluarTanpaKunci()
        }
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

    /** Mode ujian sudah pernah dimulai (termasuk bila sematan sempat terlepas). */
    private fun sedangTerkunci(): Boolean =
        pernahMasukUjian || tahap == Tahap.UJIAN || tahap == Tahap.TERLEPAS

    private fun keluarTanpaKunci() {
        bolehKeluar = true
        penguncian.selesai()
        finish()
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
                progresDarurat.progress = it.animatedValue as Int
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
                // Mode ujian aktif tetapi murid belum masuk ujian: tidak ada yang
                // perlu diawasi, jadi aplikasi boleh ditutup.
                keluarTanpaKunci()
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

    /**
     * Setiap kali murid kembali — misalnya dari Pengaturan — semua syarat
     * diperiksa ulang, supaya centangnya selalu mencerminkan keadaan HP sekarang.
     */
    override fun onResume() {
        super.onResume()
        when (tahap) {
            Tahap.PERSIAPAN, Tahap.TERLEPAS -> segarkanPersiapan()
            Tahap.UJIAN -> {
                penguncian.hentikanAlarm()
                penguncian.layarPenuh(true)
                jagaUjian()
            }
            Tahap.MENUNGGU_SEMATAN -> Unit
        }
    }

    override fun onWindowFocusChanged(fokus: Boolean) {
        super.onWindowFocusChanged(fokus)
        // Sistem memunculkan bilah lagi setelah dialog atau usapan; sembunyikan lagi.
        if (fokus && tahap == Tahap.UJIAN) penguncian.layarPenuh(true)
    }

    /**
     * Murid meninggalkan aplikasi selama ujian (setelah melepas sematan).
     * Sebelum mode ujian, membuka Pengaturan adalah hal yang diminta aplikasi
     * sendiri, jadi tidak berbunyi.
     */
    override fun onPause() {
        super.onPause()
        batalkanHitungDarurat()
        val sengaja = bolehKeluar || isFinishing
        if (!sengaja && sedangTerkunci() && ujianBerjalan) penguncian.bunyikanAlarm()
    }

    override fun onDestroy() {
        tangan.removeCallbacksAndMessages(null)
        dialogKeluar?.dismiss()
        penguncian.selesai()
        pekerja.shutdown()
        super.onDestroy()
    }

    /**
     * Sebelum mode ujian, tombol kembali menutup aplikasi seperti biasa. Selama
     * ujian, tombol itu dimatikan supaya WebView tidak bisa ditinggalkan.
     */
    @Suppress("DEPRECATION", "MissingSuperCall")
    override fun onBackPressed() {
        if (sedangTerkunci() || tahap == Tahap.MENUNGGU_SEMATAN) {
            Toast.makeText(this, R.string.kembali_dimatikan, Toast.LENGTH_SHORT).show()
        } else {
            keluarTanpaKunci()
        }
    }

    private companion object {
        /** Tekanan lebih lama dari ini dianggap menahan, bukan mengetuk. */
        const val AMBANG_TAHAN_MS = 600L

        /** Jeda pemeriksaan penjaga selama ujian. */
        const val JEDA_PENJAGA_MS = 2_000L
    }
}
