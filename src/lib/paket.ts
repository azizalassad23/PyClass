import type { JenisPenilaian } from './types';

/**
 * Susunan paket penilaian. Setiap entri `posisi` menyebut *grup* soal, bukan
 * soal tertentu — soal sebenarnya dipilih acak dari grup itu dengan seed NIS
 * (F-U04), sehingga dua murid bisa mendapat varian berbeda tetapi setara.
 */
export interface DefinisiPaket {
  paket: string;
  judul: string;
  subjudul: string;
  jenis: JenisPenilaian;
  durasiMenit: number;
  posisi: string[];
}

export const PAKET: DefinisiPaket[] = [
  {
    paket: 'uts-ganjil',
    judul: 'Ujian Tengah Semester',
    subjudul: 'Unit 1–3 · Variabel, Operator, Percabangan',
    jenis: 'ujian',
    durasiMenit: 90,
    // Gradasi mudah → sulit (PRD §17).
    posisi: ['u1-p1', 'u1-p4', 'u2-p1', 'u2-p2', 'u1-p2', 'u2-p5', 'u3-p1', 'u3-p5', 'u3-p2', 'u3-p3'],
  },
  {
    paket: 'uas-genap',
    judul: 'Ujian Akhir Semester',
    subjudul: 'Unit 1–7 · seluruh materi semester',
    jenis: 'ujian',
    durasiMenit: 90,
    posisi: ['u1-p3', 'u2-p3', 'u3-p2', 'u4-p2', 'u4-p5', 'u5-p1', 'u6-p1', 'u6-p3', 'u7-p2', 'u7-p4'],
  },
  { paket: 'kuis-u1', judul: 'Kuis Unit 1', subjudul: 'Variabel & Tipe Data', jenis: 'kuis', durasiMenit: 20,
    posisi: ['u1-p1', 'u1-p2', 'u1-p3', 'u1-p4', 'u1-p5'] },
  { paket: 'kuis-u2', judul: 'Kuis Unit 2', subjudul: 'Operator & I/O', jenis: 'kuis', durasiMenit: 20,
    posisi: ['u2-p1', 'u2-p2', 'u2-p3', 'u2-p4', 'u2-p5'] },
  { paket: 'kuis-u3', judul: 'Kuis Unit 3', subjudul: 'Percabangan', jenis: 'kuis', durasiMenit: 20,
    posisi: ['u3-p1', 'u3-p2', 'u3-p3', 'u3-p4', 'u3-p5'] },
  { paket: 'kuis-u4', judul: 'Kuis Unit 4', subjudul: 'Perulangan', jenis: 'kuis', durasiMenit: 20,
    posisi: ['u4-p1', 'u4-p2', 'u4-p3', 'u4-p4', 'u4-p5'] },
  { paket: 'kuis-u5', judul: 'Kuis Unit 5', subjudul: 'Koleksi Data', jenis: 'kuis', durasiMenit: 20,
    posisi: ['u5-p1', 'u5-p2', 'u5-p3', 'u5-p4', 'u5-p5'] },
  { paket: 'kuis-u6', judul: 'Kuis Unit 6', subjudul: 'String', jenis: 'kuis', durasiMenit: 20,
    posisi: ['u6-p1', 'u6-p2', 'u6-p3', 'u6-p4', 'u6-p5'] },
  { paket: 'kuis-u7', judul: 'Kuis Unit 7', subjudul: 'Fungsi', jenis: 'kuis', durasiMenit: 20,
    posisi: ['u7-p1', 'u7-p2', 'u7-p3', 'u7-p4', 'u7-p5'] },
];

export const PAKET_BY_ID = new Map(PAKET.map((p) => [p.paket, p]));
