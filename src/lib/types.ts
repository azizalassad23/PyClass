/** Bentuk data yang dipertukarkan dengan Apps Script (PRD §12). */

export type Kelas = 'XA' | 'XB' | 'XC' | 'XD';
export const KELAS_LIST: Kelas[] = ['XA', 'XB', 'XC', 'XD'];

/** `ujian` = UTS/UAS (10 soal / 90 menit). `kuis` = kuis unit (5 soal / 20 menit). */
export type JenisPenilaian = 'ujian' | 'kuis';

export interface TestContoh {
  input: string;
  output: string;
}

/**
 * Soal seperti yang diterima browser. Perhatikan: `outputKunci` TIDAK ADA —
 * server hanya mengirim input test tersembunyi (PRD §10, F-U06).
 */
export interface Soal {
  id: string;
  judul: string;
  unit: string;
  bobot: number;
  deskripsi: string;
  contoh: TestContoh[];
  inputTersembunyi: string[];
  kodeAwal?: string;
}

export interface PaketUjian {
  paket: string;
  judul: string;
  subjudul: string;
  jenis: JenisPenilaian;
  durasiMenit: number;
  soal: Soal[];
}

export interface Identitas {
  nama: string;
  nis: string;
  kelas: Kelas;
  sesi: string;
}

export interface JawabanTerkirim {
  soalId: string;
  /** Keluaran mentah dari menjalankan kode murid atas tiap input tersembunyi. */
  output: string[];
  kode: string;
}

export interface SubmitPayload extends Identitas {
  paket: string;
  jenis: JenisPenilaian;
  jawaban: JawabanTerkirim[];
  durasiMenit: number;
  pindahTab: number;
  status: 'selesai' | 'waktu-habis';
}

export interface HasilPenilaian {
  ok: true;
  nilai: number;
  testLulus: number;
  testTotal: number;
  perSoal: { soalId: string; judul: string; lulus: number; total: number; nilai: number }[];
  konfirmasi: string;
  /** Unit yang perlu diulang, dihitung server dari soal yang lemah. */
  perluDiulang?: string[];
}

export interface GagalResponse {
  ok: false;
  pesan: string;
}

export interface BarisRekap {
  nama: string;
  nis: string;
  nilai: number | null;
  testLulus: string;
  durasiMenit: number | null;
  pindahTab: number;
  status: string;
  konfirmasi: string;
  /** Diisi bila murid masih mengerjakan. */
  progres?: string;
}

export interface SesiInfo {
  kode: string;
  kelas: Kelas;
  paket: string;
  jenis: JenisPenilaian;
  judul: string;
  durasiMenit: number;
  dibukaPada: number;
  ditutupPada: number | null;
  status: 'berjalan' | 'ditutup';
}

/**
 * Satu baris sheet `_Bank` (PRD §17). Tipe ini dipakai bersama oleh bank demo
 * dan stub produksinya, karena itu tinggal di sini dan bukan di bankDemo.ts.
 */
export interface SoalBank extends Soal {
  /** Soal dalam grup yang sama saling menggantikan saat pengacakan (F-U04). */
  grup: string;
  tingkat: 'mudah' | 'sedang' | 'sulit';
  jenis: JenisPenilaian | 'keduanya';
  /** Tidak pernah dikirim ke browser pada arsitektur sungguhan. */
  outputKunci: string[];
  /** Solusi guru — dipakai "Periksa Bank Soal" untuk memvalidasi kunci. */
  kodeReferensi: string;
}
