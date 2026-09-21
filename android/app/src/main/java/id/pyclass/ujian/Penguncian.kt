package id.pyclass.ujian

import android.app.Activity
import android.app.ActivityManager
import android.app.NotificationManager
import android.content.ActivityNotFoundException
import android.content.Context
import android.content.Intent
import android.media.AudioAttributes
import android.media.AudioManager
import android.media.Ringtone
import android.media.RingtoneManager
import android.os.Build
import android.os.Handler
import android.os.Looper
import android.provider.Settings
import android.view.View
import android.view.WindowInsets
import android.view.WindowInsetsController
import android.view.WindowManager

/**
 * Lapisan penguncian tingkat OS. Inilah satu-satunya bagian yang tidak bisa
 * dikerjakan halaman web: notifikasi, volume, tangkapan layar, dan penyematan
 * layar semuanya butuh izin aplikasi.
 *
 * Urutannya penting. Layar yang sudah disematkan tidak bisa membuka Pengaturan,
 * jadi SEMUA prasyarat (izin Jangan Ganggu, Jangan Ganggu aktif, volume alarm
 * penuh) dipenuhi lebih dulu, baru kemudian layar disematkan.
 *
 * Batas jujurnya: penyematan layar pada HP pribadi bisa dilepas murid dengan PIN
 * miliknya sendiri. Yang dijamin di sini bukan "tidak bisa keluar", melainkan
 * "keluar selalu berbunyi dan selalu terdeteksi".
 */
class Penguncian(private val kegiatan: Activity) {

    /** Keadaan tiga prasyarat mode ujian. */
    data class Prasyarat(val izinJanganGanggu: Boolean, val janganGangguAktif: Boolean, val volumePenuh: Boolean) {
        val terpenuhi: Boolean get() = izinJanganGanggu && janganGangguAktif && volumePenuh
    }

    private val audio = kegiatan.getSystemService(Context.AUDIO_SERVICE) as AudioManager
    private val notifikasi =
        kegiatan.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
    private val aktivitas = kegiatan.getSystemService(Context.ACTIVITY_SERVICE) as ActivityManager
    private val tangan = Handler(Looper.getMainLooper())

    // Keadaan HP sebelum mode ujian, dikembalikan saat murid keluar.
    private var volumeAlarmSemula: Int? = null
    private var saringanSemula: Int? = null
    private var deringan: Ringtone? = null

    /** Dipasang sejak aplikasi dibuka: layar tetap menyala, tangkapan layar hitam. */
    fun pasangPengamanDasar() {
        kegiatan.window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
        // Tangkapan layar dan rekam layar jadi hitam, termasuk lewat aplikasi lain.
        kegiatan.window.addFlags(WindowManager.LayoutParams.FLAG_SECURE)
    }

    // ── Prasyarat ───────────────────────────────────────────────────────────

    /**
     * Menyalakan Jangan Ganggu dan memenuhkan volume alarm sejauh yang
     * diizinkan HP, lalu melaporkan keadaan sebenarnya. Aman dipanggil
     * berulang-ulang: penjaga selama ujian memakainya untuk memulihkan
     * pengaturan yang diubah murid.
     */
    fun terapkanPrasyarat(): Prasyarat {
        val izin = notifikasi.isNotificationPolicyAccessGranted
        if (izin) {
            if (saringanSemula == null) saringanSemula = notifikasi.currentInterruptionFilter
            // Saringan ALARMS, bukan NONE: notifikasi diam, tetapi alarm aplikasi
            // ini tetap terdengar.
            if (notifikasi.currentInterruptionFilter != NotificationManager.INTERRUPTION_FILTER_ALARMS) {
                try {
                    notifikasi.setInterruptionFilter(NotificationManager.INTERRUPTION_FILTER_ALARMS)
                } catch (e: Exception) {
                    // HP tertentu menolak; keadaan sebenarnya dilaporkan di bawah.
                }
            }
        }

        val maks = audio.getStreamMaxVolume(AudioManager.STREAM_ALARM)
        if (volumeAlarmSemula == null) volumeAlarmSemula = audio.getStreamVolume(AudioManager.STREAM_ALARM)
        if (audio.getStreamVolume(AudioManager.STREAM_ALARM) < maks) {
            try {
                audio.setStreamVolume(AudioManager.STREAM_ALARM, maks, 0)
            } catch (e: SecurityException) {
                // Sebagian HP menolak mengubah volume dari aplikasi; murid menaikkannya sendiri.
            }
        }

        // Mode apa pun selain "semua notifikasi boleh" dihitung Jangan Ganggu aktif:
        // sebagian HP menerjemahkan ALARMS menjadi mode prioritas miliknya sendiri.
        val saringan = notifikasi.currentInterruptionFilter
        val dndAktif = izin &&
            saringan != NotificationManager.INTERRUPTION_FILTER_ALL &&
            saringan != NotificationManager.INTERRUPTION_FILTER_UNKNOWN
        return Prasyarat(
            izinJanganGanggu = izin,
            janganGangguAktif = dndAktif,
            volumePenuh = audio.getStreamVolume(AudioManager.STREAM_ALARM) >= maks,
        )
    }

    /**
     * Membuka halaman izin Jangan Ganggu. HP yang tidak punya halaman itu
     * (sebagian Android Go) dibawa ke Pengaturan umum; mengembalikan false
     * supaya aplikasi bisa menjelaskannya.
     */
    fun bukaIzinJanganGanggu(): Boolean {
        return try {
            kegiatan.startActivity(Intent(Settings.ACTION_NOTIFICATION_POLICY_ACCESS_SETTINGS))
            true
        } catch (e: ActivityNotFoundException) {
            kegiatan.startActivity(Intent(Settings.ACTION_SETTINGS))
            false
        }
    }

    /** Untuk HP yang menolak volume diubah aplikasi: tampilkan panel volume sistem. */
    fun bukaPengaturanVolume() {
        try {
            audio.setStreamVolume(
                AudioManager.STREAM_ALARM,
                audio.getStreamMaxVolume(AudioManager.STREAM_ALARM),
                AudioManager.FLAG_SHOW_UI,
            )
            return
        } catch (e: SecurityException) {
            // lanjut ke panel pengaturan
        }
        val maksud = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            Intent(Settings.Panel.ACTION_VOLUME)
        } else {
            Intent(Settings.ACTION_SOUND_SETTINGS)
        }
        try {
            kegiatan.startActivity(maksud)
        } catch (e: ActivityNotFoundException) {
            kegiatan.startActivity(Intent(Settings.ACTION_SETTINGS))
        }
    }

    // ── Sematan layar dan layar penuh ───────────────────────────────────────

    fun sematkan() {
        try {
            kegiatan.startLockTask()
        } catch (e: Exception) {
            // HP yang melarang penyematan: sedangTersemat() tetap false dan
            // aplikasi memberi tahu murid.
        }
    }

    /**
     * Apakah layar sedang tersemat. Melepas sematan TIDAK memicu onPause karena
     * aplikasi tetap di depan, jadi keadaannya harus ditanyakan berkala.
     */
    fun sedangTersemat(): Boolean =
        aktivitas.lockTaskModeState != ActivityManager.LOCK_TASK_MODE_NONE

    /** Menyembunyikan bilah status dan navigasi selama ujian. */
    @Suppress("DEPRECATION")
    fun layarPenuh(aktif: Boolean) {
        val jendela = kegiatan.window
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            val kendali = jendela.insetsController ?: return
            if (aktif) {
                kendali.hide(WindowInsets.Type.systemBars())
                kendali.systemBarsBehavior = WindowInsetsController.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
            } else {
                kendali.show(WindowInsets.Type.systemBars())
            }
        } else {
            jendela.decorView.systemUiVisibility = if (aktif) {
                View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY or
                    View.SYSTEM_UI_FLAG_FULLSCREEN or
                    View.SYSTEM_UI_FLAG_HIDE_NAVIGATION or
                    View.SYSTEM_UI_FLAG_LAYOUT_STABLE
            } else {
                View.SYSTEM_UI_FLAG_VISIBLE
            }
        }
    }

    // ── Selesai ─────────────────────────────────────────────────────────────

    /** Mengembalikan HP ke keadaan semula, lalu melepas penyematan layar. */
    fun selesai() {
        hentikanAlarm()
        saringanSemula?.let {
            // Bila aplikasi pernah tertutup paksa di tengah ujian, "keadaan semula"
            // yang tercatat bisa saja Jangan Ganggu buatan kita sendiri.
            val tujuan = if (it == NotificationManager.INTERRUPTION_FILTER_ALARMS) {
                NotificationManager.INTERRUPTION_FILTER_ALL
            } else {
                it
            }
            try {
                notifikasi.setInterruptionFilter(tujuan)
            } catch (e: Exception) {
                // izin sudah dicabut; tidak ada yang bisa dikembalikan
            }
        }
        saringanSemula = null
        volumeAlarmSemula?.let {
            try {
                audio.setStreamVolume(AudioManager.STREAM_ALARM, it, 0)
            } catch (e: SecurityException) {
                // biarkan volume apa adanya
            }
        }
        volumeAlarmSemula = null
        kegiatan.window.clearFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
        layarPenuh(false)
        try {
            kegiatan.stopLockTask()
        } catch (e: Exception) {
            // sudah tidak tersemat
        }
    }

    // ── Alarm ───────────────────────────────────────────────────────────────

    /** Alarm memakai nada alarm bawaan HP di jalur STREAM_ALARM. */
    fun bunyikanAlarm() {
        hentikanAlarm()
        val alamat = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_ALARM)
            ?: RingtoneManager.getDefaultUri(RingtoneManager.TYPE_RINGTONE)
            ?: return
        deringan = RingtoneManager.getRingtone(kegiatan, alamat)?.apply {
            audioAttributes = AudioAttributes.Builder()
                .setUsage(AudioAttributes.USAGE_ALARM)
                .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                .build()
            play()
        }
        tangan.postDelayed({ hentikanAlarm() }, Konfig.ALARM_MS)
    }

    fun hentikanAlarm() {
        tangan.removeCallbacksAndMessages(null)
        deringan?.let { if (it.isPlaying) it.stop() }
        deringan = null
    }
}
