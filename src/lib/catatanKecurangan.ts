import { kirimKecurangan } from './api';
import { baca, tulis } from './storage';
import type { Identitas, KejadianKecurangan } from './types';

/**
 * Catatan kejadian mencurigakan selama ujian, dikirim ke sheet `_Kecurangan`.
 *
 * Setiap kejadian masuk antrean di perangkat lebih dulu, lalu dikirim. Bila
 * jaringan putus — atau Apps Script sedang sibuk — antrean dikirim ulang pada
 * kejadian berikutnya dan pada setiap denyut, jadi tidak ada catatan yang hilang
 * hanya karena sinyal jelek. Waktu kejadian diambil dari perangkat; server
 * menambahkan waktu diterima sebagai pembanding.
 */

const kunciAntre = (i: Identitas) => `kecurangan:${i.sesi}:${i.nis}`;
const BATAS_SEKALI_KIRIM = 40;

let sedangMengirim = false;

/** Ringkasan perangkat untuk kolom Perangkat, tanpa data pribadi. */
function ringkasPerangkat(): string {
  const ua = navigator.userAgent;
  const os = /Android [\d.]+/.exec(ua)?.[0] ?? (/iPhone|iPad/.test(ua) ? 'iOS' : /Windows NT [\d.]+/.exec(ua)?.[0] ?? (/Mac OS X/.test(ua) ? 'macOS' : /CrOS/.test(ua) ? 'ChromeOS' : 'lainnya'));
  const peramban = /Edg\/[\d]+/.exec(ua)?.[0] ?? /Chrome\/[\d]+/.exec(ua)?.[0] ?? /Firefox\/[\d]+/.exec(ua)?.[0] ?? /Version\/[\d.]+ .*Safari/.exec(ua)?.[0] ?? 'lainnya';
  return `${os} · ${peramban}`.slice(0, 100);
}

export function catatKejadian(identitas: Identitas, jenis: string, keterangan: string, ke = 0): void {
  const antre = baca<KejadianKecurangan[]>(kunciAntre(identitas), []);
  antre.push({ ts: Date.now(), jenis, ke, keterangan });
  tulis(kunciAntre(identitas), antre);
  void kirimAntrean(identitas);
}

/** Mengirim isi antrean. Aman dipanggil berulang; hanya satu pengiriman berjalan. */
export async function kirimAntrean(identitas: Identitas): Promise<void> {
  if (sedangMengirim) return;
  const antre = baca<KejadianKecurangan[]>(kunciAntre(identitas), []);
  if (antre.length === 0) return;
  const kiriman = antre.slice(0, BATAS_SEKALI_KIRIM);
  sedangMengirim = true;
  try {
    await kirimKecurangan({
      sesi: identitas.sesi,
      kelas: identitas.kelas,
      nis: identitas.nis,
      nama: identitas.nama,
      perangkat: ringkasPerangkat(),
      kejadian: kiriman,
    });
    // Kejadian baru bisa masuk selama pengiriman; hanya yang terkirim dibuang.
    const sisa = baca<KejadianKecurangan[]>(kunciAntre(identitas), []).slice(kiriman.length);
    tulis(kunciAntre(identitas), sisa);
    if (sisa.length > 0) window.setTimeout(() => void kirimAntrean(identitas), 500);
  } catch {
    /* dicoba lagi pada kejadian atau denyut berikutnya */
  } finally {
    sedangMengirim = false;
  }
}
