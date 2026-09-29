/**
 * TERM QUIZ 1 2026/2027 — penilaian yang dibuka dari menu beranda tanpa kode
 * sesi. Murid cukup mengisi nama, kelas, dan NIS.
 *
 * Nilai-nilai ini HARUS sama dengan TERM_KHUSUS di apps-script/Code.gs.
 *
 * Jam buka di sini hanya untuk tampilan (menu terkunci dan hitung mundur). Yang
 * menentukan adalah server: Apps Script menolak memberi soal sebelum jam buka
 * menurut jam Google, jadi mengubah jam HP tidak membuka soal lebih awal.
 */
export const TERM_QUIZ = {
  kode: 'TQ1-2627',
  paket: 'term-1-2627',
  judul: 'TERM QUIZ 1 2026/2027',
  durasiMenit: 75,
  jumlahSoal: 15,
  komposisi: { mudah: 7, sedang: 5, sulit: 3 },
  bukaPada: Date.parse('2026-09-29T11:14:00+07:00'),
  labelBuka: 'Selasa, 29 September 2026 pukul 11.14 WIB',
} as const;

export function termQuizTerbuka(sekarang = Date.now()): boolean {
  return sekarang >= TERM_QUIZ.bukaPada;
}

/** "3 jam 12 menit" / "4 menit 05 detik" — hitung mundur menuju jam buka. */
export function sisaMenujuBuka(sekarang = Date.now()): string {
  const detik = Math.max(0, Math.ceil((TERM_QUIZ.bukaPada - sekarang) / 1000));
  const jam = Math.floor(detik / 3600);
  const menit = Math.floor((detik % 3600) / 60);
  if (jam > 0) return `${jam} jam ${menit} menit`;
  return `${menit} menit ${String(detik % 60).padStart(2, '0')} detik`;
}
