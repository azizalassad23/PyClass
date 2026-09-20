package id.pyclass.ujian

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent

/**
 * Android mengirim ACTION_SHUTDOWN saat HP dimatikan secara normal. Waktu yang
 * tersisa terlalu pendek untuk permintaan jaringan yang andal, jadi kejadiannya
 * hanya disimpan; MainActivity mengirimkannya saat aplikasi dibuka lagi.
 *
 * Mematikan paksa (tahan tombol power) tidak mengirim apa pun. Kejadian itu
 * tetap terlihat guru dari denyut yang berhenti di papan pantau.
 */
class PenerimaMati : BroadcastReceiver() {
    override fun onReceive(konteks: Context, maksud: Intent) {
        val simpanan = konteks.getSharedPreferences("pyclass", Context.MODE_PRIVATE)
        // Identitas terakhir ditulis MainActivity; tanpa itu tidak ada yang bisa dilaporkan.
        val sesi = simpanan.getString("sesi", null) ?: return
        val nis = simpanan.getString("nis", null) ?: return
        simpanan.edit().putString("tertunda", "$sesi|$nis|HP dimatikan saat ujian").apply()
    }
}
