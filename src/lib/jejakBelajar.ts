import { HALAMAN } from '../content/loader';
import { baca, tulis } from './storage';

/** F-M01 — penanda halaman terakhir dibaca, disimpan di localStorage. */
export interface TerakhirDibaca {
  slug: string;
  unit: string;
  judul: string;
  ts: number;
}

const K_TERAKHIR = 'terakhir-dibaca';
const K_DIBACA = 'halaman-dibaca';

export function catatDibaca(slug: string, unit: string, judul: string): void {
  tulis(K_TERAKHIR, { slug, unit, judul, ts: Date.now() } satisfies TerakhirDibaca);
  const dibaca = baca<string[]>(K_DIBACA, []);
  if (!dibaca.includes(slug)) tulis(K_DIBACA, [...dibaca, slug]);
}

export function sudahDibaca(): Set<string> {
  return new Set(baca<string[]>(K_DIBACA, []));
}

/**
 * Sebuah unit dianggap selesai bila seluruh halamannya pernah dibuka. Ini
 * penanda kemajuan sederhana untuk kartu di beranda, bukan penilaian.
 */
export function unitSelesai(): Set<string> {
  const dibaca = sudahDibaca();
  const perUnit = new Map<string, string[]>();
  for (const h of HALAMAN) {
    perUnit.set(h.unit, [...(perUnit.get(h.unit) ?? []), h.slug]);
  }
  const hasil = new Set<string>();
  for (const [unit, slugs] of perUnit) {
    if (slugs.length > 0 && slugs.every((s) => dibaca.has(s))) hasil.add(unit);
  }
  return hasil;
}
