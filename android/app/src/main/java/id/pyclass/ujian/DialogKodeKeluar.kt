package id.pyclass.ujian

import android.animation.ObjectAnimator
import android.app.Dialog
import android.content.Context
import android.graphics.Typeface
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.util.TypedValue
import android.view.Gravity
import android.view.HapticFeedbackConstants
import android.view.View
import android.view.ViewGroup
import android.view.WindowManager
import android.widget.FrameLayout
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.ProgressBar
import android.widget.TextView

/**
 * Layar penuh untuk kode keluar.
 *
 * Kode diperiksa otomatis begitu angka keenam diketik, jadi guru cukup
 * mengetik enam angka tanpa mencari tombol. Keypad dibuat sendiri, bukan
 * keyboard sistem: keyboard pihak ketiga tidak pernah terbuka selama ujian.
 */
class DialogKodeKeluar(
    konteks: Context,
    private val sesi: String,
    private val nis: String,
    private val pendengar: Pendengar,
) : Dialog(konteks, R.style.Tema_PyClass_LayarPenuh) {

    interface Pendengar {
        /** Kirim kode ke server; panggil [jawab] di utas utama dengan hasilnya. */
        fun periksa(kode: String, jawab: (berhasil: Boolean, pesan: String) -> Unit)

        /** Kode diterima dan layar "Kunci dilepas" sudah tampil. */
        fun berhasil()
    }

    private val tangan = Handler(Looper.getMainLooper())
    private val kode = StringBuilder()
    private val kotak = mutableListOf<TextView>()
    private val tombolAngka = mutableListOf<View>()
    private var sedangMemeriksa = false

    private lateinit var barisDigit: LinearLayout
    private lateinit var pesan: TextView
    private lateinit var memeriksa: ProgressBar

    override fun onCreate(simpanan: Bundle?) {
        super.onCreate(simpanan)
        setContentView(R.layout.dialog_kode_keluar)
        // Dialog juga harus menolak tangkapan layar, sama seperti layar ujian.
        window?.addFlags(WindowManager.LayoutParams.FLAG_SECURE)
        window?.setLayout(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT)

        barisDigit = findViewById(R.id.baris_digit)
        pesan = findViewById(R.id.pesan)
        memeriksa = findViewById(R.id.memeriksa)
        findViewById<TextView>(R.id.label_identitas).text =
            context.getString(R.string.keluar_identitas, sesi, nis)
        findViewById<View>(R.id.tombol_tutup).setOnClickListener { if (!sedangMemeriksa) dismiss() }

        susunKotakDigit()
        susunKeypad()
        segarkanKotak()
    }

    // ── Susunan ─────────────────────────────────────────────────────────────

    private fun dp(nilai: Float): Int =
        TypedValue.applyDimension(TypedValue.COMPLEX_UNIT_DIP, nilai, context.resources.displayMetrics).toInt()

    private fun susunKotakDigit() {
        repeat(6) { i ->
            val t = TextView(context).apply {
                gravity = Gravity.CENTER
                typeface = Typeface.create("monospace", Typeface.BOLD)
                setTextSize(TypedValue.COMPLEX_UNIT_SP, 26f)
                setTextColor(context.getColor(R.color.tinta))
                layoutParams = LinearLayout.LayoutParams(dp(46f), dp(58f)).apply {
                    marginStart = if (i == 0) 0 else dp(if (i == 3) 14f else 8f) // jeda di tengah: 3 + 3
                }
            }
            kotak += t
            barisDigit.addView(t)
        }
    }

    private fun susunKeypad() {
        val papan = findViewById<LinearLayout>(R.id.papan_angka)
        // Keypad tidak melebar berlebihan di tablet.
        val lebarMaks = dp(360f)
        papan.post {
            if (papan.width > lebarMaks) {
                papan.layoutParams = papan.layoutParams.apply { width = lebarMaks }
            }
        }

        val baris = listOf(listOf("1", "2", "3"), listOf("4", "5", "6"), listOf("7", "8", "9"), listOf("", "0", "⌫"))
        baris.forEachIndexed { r, isi ->
            val barisView = LinearLayout(context).apply {
                orientation = LinearLayout.HORIZONTAL
                layoutParams = LinearLayout.LayoutParams(
                    ViewGroup.LayoutParams.MATCH_PARENT, dp(58f),
                ).apply { if (r > 0) topMargin = dp(10f) }
            }
            isi.forEachIndexed { k, label ->
                val sel = buatTombol(label).apply {
                    layoutParams = LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.MATCH_PARENT, 1f).apply {
                        if (k > 0) marginStart = dp(10f)
                    }
                }
                barisView.addView(sel)
            }
            papan.addView(barisView)
        }
    }

    private fun buatTombol(label: String): View = when (label) {
        // Sel kosong menjaga 0 tetap di tengah seperti keypad telepon.
        "" -> View(context)
        "⌫" -> FrameLayout(context).apply {
            setBackgroundResource(R.drawable.bg_tombol_angka)
            contentDescription = context.getString(R.string.keluar_hapus)
            isClickable = true
            addView(
                ImageView(context).apply {
                    setImageResource(R.drawable.ic_hapus)
                    setColorFilter(context.getColor(R.color.redup))
                },
                FrameLayout.LayoutParams(dp(26f), dp(26f), Gravity.CENTER),
            )
            setOnClickListener { ketuk(it); hapus() }
            // Tahan untuk mengosongkan semua angka.
            setOnLongClickListener { ketuk(it); kosongkan(); true }
            tombolAngka += this
        }
        else -> TextView(context).apply {
            text = label
            gravity = Gravity.CENTER
            typeface = Typeface.create("sans-serif-medium", Typeface.NORMAL)
            setTextSize(TypedValue.COMPLEX_UNIT_SP, 24f)
            setTextColor(context.getColor(R.color.tinta))
            setBackgroundResource(R.drawable.bg_tombol_angka)
            isClickable = true
            setOnClickListener { ketuk(it); tambah(label) }
            tombolAngka += this
        }
    }

    // ── Masukan ─────────────────────────────────────────────────────────────

    private fun ketuk(v: View) {
        v.performHapticFeedback(HapticFeedbackConstants.KEYBOARD_TAP)
    }

    private fun tambah(angka: String) {
        if (sedangMemeriksa || kode.length >= 6) return
        if (pesan.text.isNotEmpty()) pesan.text = ""
        kode.append(angka)
        segarkanKotak()
        if (kode.length == 6) kirim()
    }

    private fun hapus() {
        if (sedangMemeriksa || kode.isEmpty()) return
        kode.deleteCharAt(kode.length - 1)
        segarkanKotak()
    }

    private fun kosongkan() {
        if (sedangMemeriksa) return
        kode.clear()
        segarkanKotak()
    }

    private fun segarkanKotak(galat: Boolean = false) {
        kotak.forEachIndexed { i, t ->
            t.text = if (i < kode.length) kode[i].toString() else ""
            t.setBackgroundResource(
                when {
                    galat -> R.drawable.bg_kotak_digit_galat
                    i == kode.length -> R.drawable.bg_kotak_digit_aktif
                    else -> R.drawable.bg_kotak_digit
                },
            )
        }
    }

    // ── Pemeriksaan ─────────────────────────────────────────────────────────

    private fun kirim() {
        aturSibuk(true)
        pendengar.periksa(kode.toString()) { berhasil, isiPesan ->
            aturSibuk(false)
            if (berhasil) tampilkanBerhasil() else tampilkanGagal(isiPesan)
        }
    }

    private fun aturSibuk(sibuk: Boolean) {
        sedangMemeriksa = sibuk
        memeriksa.visibility = if (sibuk) View.VISIBLE else View.GONE
        pesan.visibility = if (sibuk) View.INVISIBLE else View.VISIBLE
        tombolAngka.forEach { it.alpha = if (sibuk) 0.45f else 1f }
    }

    private fun tampilkanGagal(isiPesan: String) {
        pesan.text = isiPesan
        segarkanKotak(galat = true)
        barisDigit.performHapticFeedback(HapticFeedbackConstants.LONG_PRESS)
        ObjectAnimator.ofFloat(barisDigit, View.TRANSLATION_X, 0f, 22f, -22f, 14f, -14f, 6f, -6f, 0f).apply {
            duration = 420
            start()
        }
        // Kotak merah sebentar, lalu kosong lagi dan siap diketik ulang.
        tangan.postDelayed({
            kode.clear()
            segarkanKotak()
        }, 700)
    }

    private fun tampilkanBerhasil() {
        findViewById<View>(R.id.lingkaran_ikon).setBackgroundResource(R.drawable.bg_lingkaran_berhasil)
        findViewById<ImageView>(R.id.ikon).apply {
            setImageResource(R.drawable.ic_gembok_terbuka)
            setColorFilter(context.getColor(R.color.daun_tua))
        }
        findViewById<TextView>(R.id.judul).setText(R.string.keluar_berhasil_judul)
        findViewById<TextView>(R.id.subjudul).setText(R.string.keluar_berhasil_pesan)
        barisDigit.animate().alpha(0f).setDuration(200).start()
        findViewById<View>(R.id.papan_angka).animate().alpha(0f).setDuration(200).start()
        pesan.text = ""
        findViewById<View>(R.id.tombol_tutup).visibility = View.INVISIBLE
        tangan.postDelayed({ pendengar.berhasil() }, 1100)
    }

    override fun onStop() {
        tangan.removeCallbacksAndMessages(null)
        super.onStop()
    }
}
