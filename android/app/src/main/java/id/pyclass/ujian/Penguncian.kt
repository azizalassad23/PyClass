package id.pyclass.ujian

import android.app.Activity
import android.app.NotificationManager
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
import android.view.WindowManager

/**
 * Lapisan penguncian tingkat OS. Inilah satu-satunya bagian yang tidak bisa
 * dikerjakan halaman web: notifikasi, volume, tangkapan layar, dan penyematan
 * layar semuanya butuh izin aplikasi.
 *
 * Batas jujurnya: penyematan layar pada HP pribadi bisa dilepas murid dengan PIN
 * miliknya sendiri. Yang dijamin di sini bukan "tidak bisa keluar", melainkan
 * "keluar selalu berbunyi dan selalu tercatat".
 */
class Penguncian(private val kegiatan: Activity) {

    private val audio = kegiatan.getSystemService(Context.AUDIO_SERVICE) as AudioManager
    private val notifikasi =
        kegiatan.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
    private val tangan = Handler(Looper.getMainLooper())

    private var volumeAlarmSemula: Int? = null
    private var saringanSemula: Int? = null
    private var deringan: Ringtone? = null

    /** Apakah izin Jangan Ganggu sudah diberikan murid. */
    fun izinJanganGangguAda(): Boolean = notifikasi.isNotificationPolicyAccessGranted

    /** Membuka layar pengaturan Jangan Ganggu. Murid memberi izin sekali saja. */
    fun mintaIzinJanganGanggu() {
        kegiatan.startActivity(Intent(Settings.ACTION_NOTIFICATION_POLICY_ACCESS_SETTINGS))
    }

    fun mulai() {
        kegiatan.window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
        // Tangkapan layar dan rekam layar jadi hitam, termasuk lewat aplikasi lain.
        kegiatan.window.addFlags(WindowManager.LayoutParams.FLAG_SECURE)

        // Volume alarm dipenuhkan supaya peringatan terdengar guru dari depan kelas.
        volumeAlarmSemula = audio.getStreamVolume(AudioManager.STREAM_ALARM)
        try {
            audio.setStreamVolume(
                AudioManager.STREAM_ALARM,
                audio.getStreamMaxVolume(AudioManager.STREAM_ALARM),
                0,
            )
        } catch (e: SecurityException) {
            // Sebagian HP menolak saat Jangan Ganggu aktif. Alarm tetap berbunyi.
        }

        // Saringan ALARMS, bukan NONE: notifikasi diam, tetapi alarm aplikasi ini
        // tetap terdengar.
        if (izinJanganGangguAda()) {
            saringanSemula = notifikasi.currentInterruptionFilter
            notifikasi.setInterruptionFilter(NotificationManager.INTERRUPTION_FILTER_ALARMS)
        }

        sematkanLayar()
    }

    fun sematkanLayar() {
        try {
            kegiatan.startLockTask()
        } catch (e: Exception) {
            // HP yang melarang penyematan: ujian tetap berjalan, pengawasan
            // bergantung pada denyut dan alarm.
        }
    }

    /** Mengembalikan HP ke keadaan semula, lalu melepas penyematan layar. */
    fun selesai() {
        hentikanAlarm()
        saringanSemula?.let {
            try {
                notifikasi.setInterruptionFilter(it)
            } catch (e: Exception) {
                notifikasi.setInterruptionFilter(NotificationManager.INTERRUPTION_FILTER_ALL)
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
        try {
            kegiatan.stopLockTask()
        } catch (e: Exception) {
            // sudah tidak tersemat
        }
    }

    /** Alarm memakai nada alarm bawaan HP di jalur STREAM_ALARM. */
    fun bunyikanAlarm() {
        hentikanAlarm()
        val alamat = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_ALARM)
            ?: RingtoneManager.getDefaultUri(RingtoneManager.TYPE_RINGTONE)
            ?: return
        deringan = RingtoneManager.getRingtone(kegiatan, alamat)?.apply {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                audioAttributes = AudioAttributes.Builder()
                    .setUsage(AudioAttributes.USAGE_ALARM)
                    .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                    .build()
            }
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
