/** Peta 30 pertemuan → 8 unit (PRD §6). */

export interface Unit {
  id: string;
  nomor: number;
  judul: string;
  ringkas: string;
  pertemuan: [number, number];
  /** Paket kuis penutup unit; null bila unit dinilai dengan rubrik. */
  kuis: string | null;
}

export const UNITS: Unit[] = [
  { id: 'U1', nomor: 1, judul: 'Variabel & Tipe Data', ringkas: 'konversi tipe', pertemuan: [1, 3], kuis: 'kuis-u1' },
  { id: 'U2', nomor: 2, judul: 'Operator & I/O', ringkas: 'input() & print()', pertemuan: [4, 6], kuis: 'kuis-u2' },
  { id: 'U3', nomor: 3, judul: 'Percabangan', ringkas: 'if / elif / else', pertemuan: [7, 10], kuis: 'kuis-u3' },
  { id: 'U4', nomor: 4, judul: 'Perulangan', ringkas: 'for, while', pertemuan: [12, 16], kuis: 'kuis-u4' },
  { id: 'U5', nomor: 5, judul: 'Koleksi Data', ringkas: 'list, dict, set', pertemuan: [17, 20], kuis: 'kuis-u5' },
  { id: 'U6', nomor: 6, judul: 'String', ringkas: 'slicing, f-string', pertemuan: [21, 23], kuis: 'kuis-u6' },
  { id: 'U7', nomor: 7, judul: 'Fungsi', ringkas: 'def, return, scope', pertemuan: [24, 26], kuis: 'kuis-u7' },
  { id: 'U8', nomor: 8, judul: 'Proyek Mini', ringkas: 'dinilai rubrik', pertemuan: [27, 29], kuis: null },
];

export const UNIT_BY_ID = new Map(UNITS.map((u) => [u.id, u]));

/** Ujian formal menyela rel pertemuan (PRD §6). */
export const UJIAN_RELL = [
  { setelah: 'U3', pertemuan: 11, paket: 'uts-ganjil', label: 'UTS' },
  { setelah: 'U8', pertemuan: 30, paket: 'uas-genap', label: 'UAS' },
];
