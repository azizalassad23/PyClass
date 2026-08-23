/**
 * Bank soal kanonik — SENGAJA KOSONG dan inilah yang ter-commit ke repo.
 *
 * Keputusan PRD §10: soal, test tersembunyi, dan kunci jawaban TIDAK BOLEH
 * berada di repo publik maupun di sisi murid. Karena itu berkas inilah yang
 * ter-commit, dan isinya kosong.
 *
 * Mode produksi  : soal datang dari sheet `_Bank` lewat Apps Script.
 * Mode demo lokal : bila ada `src/lib/bankDemo.ts` (di-gitignore), vite.config.ts
 *                   mengalihkan impor ke sana sehingga aplikasi bisa dicoba
 *                   tanpa backend. Berkas itu tidak pernah ikut ter-commit.
 */
import type { SoalBank } from './types';

export type { SoalBank };

export const BANK: SoalBank[] = [];

export const BANK_BY_ID = new Map<string, SoalBank>();

export function grupSoal(): Map<string, SoalBank[]> {
  return new Map();
}
