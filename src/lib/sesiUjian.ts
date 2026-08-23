import { baca, hapus, tulis } from './storage';
import type { HasilPenilaian, Identitas, PaketUjian } from './types';

/**
 * F-U07 — jawaban disimpan otomatis ke localStorage. Kunci penyimpanan memuat
 * kode sesi + NIS supaya dua murid yang memakai perangkat sama tidak bertukar
 * jawaban, dan supaya sesi lama tidak terbawa ke sesi berikutnya.
 */

export interface KeadaanUjian {
  identitas: Identitas;
  paket: PaketUjian;
  /** soalId → kode jawaban. */
  jawaban: Record<string, string>;
  dimulaiPada: number;
}

const kunciUjian = (sesi: string, nis: string) => `ujian:${sesi}:${nis}`;
const kunciHasil = (sesi: string, nis: string) => `hasil:${sesi}:${nis}`;
const K_AKTIF = 'ujian-aktif';

export interface Penunjuk { sesi: string; nis: string }

export function simpanUjian(k: KeadaanUjian): void {
  tulis(kunciUjian(k.identitas.sesi, k.identitas.nis), k);
  tulis(K_AKTIF, { sesi: k.identitas.sesi, nis: k.identitas.nis } satisfies Penunjuk);
}

export function muatUjianAktif(): KeadaanUjian | null {
  const p = baca<Penunjuk | null>(K_AKTIF, null);
  if (!p) return null;
  return baca<KeadaanUjian | null>(kunciUjian(p.sesi, p.nis), null);
}

export function simpanJawaban(sesi: string, nis: string, jawaban: Record<string, string>): void {
  const k = baca<KeadaanUjian | null>(kunciUjian(sesi, nis), null);
  if (!k) return;
  tulis(kunciUjian(sesi, nis), { ...k, jawaban });
}

export function simpanHasil(sesi: string, nis: string, hasil: HasilPenilaian): void {
  tulis(kunciHasil(sesi, nis), hasil);
}

export function muatHasil(sesi: string, nis: string): HasilPenilaian | null {
  return baca<HasilPenilaian | null>(kunciHasil(sesi, nis), null);
}

/** Dipanggil setelah hasil ditampilkan agar sesi berikutnya mulai bersih. */
export function tutupUjianAktif(): void {
  hapus(K_AKTIF);
}
