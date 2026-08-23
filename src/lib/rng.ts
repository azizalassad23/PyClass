/**
 * Acak berbasis seed (F-U04): urutan & varian soal harus tetap sama bila murid
 * me-refresh halaman, jadi seed diambil dari NIS + kode sesi, bukan Math.random.
 */

export function hashSeed(...parts: string[]): number {
  let h = 2166136261 >>> 0;
  const s = parts.join('|');
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0;
}

/** mulberry32 — kecil, cepat, cukup untuk pengacakan soal. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function pilihAcak<T>(arr: readonly T[], rand: () => number): T {
  return arr[Math.floor(rand() * arr.length)];
}

export function acakUrutan<T>(arr: readonly T[], rand: () => number): T[] {
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Kode 6 karakter tanpa huruf yang mudah tertukar (0/O, 1/I). */
export function kodeKonfirmasi(rand: () => number): string {
  const abjad = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let s = '';
  for (let i = 0; i < 6; i++) s += abjad[Math.floor(rand() * abjad.length)];
  return s;
}
