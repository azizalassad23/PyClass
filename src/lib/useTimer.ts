import { useCallback, useEffect, useRef, useState } from 'react';
import { baca, hapus, tulis } from './storage';

/**
 * F-U02 / F-U03 — timer ujian.
 *
 * Yang disimpan adalah WAKTU SELESAI (epoch ms), bukan sisa detik. Dengan
 * begitu me-refresh halaman, menutup tab, atau menidurkan perangkat tidak
 * menambah waktu: sisa waktu selalu dihitung ulang dari jam sekarang.
 */

export interface KeadaanTimer {
  sisaDetik: number;
  habis: boolean;
  /** true saat menyentuh 5 menit dan 1 menit terakhir. */
  peringatan: 5 | 1 | null;
}

/**
 * @param tambahanMenit Tambahan waktu dari guru (F-G06). Disimpan terpisah dari
 *   waktu selesai dasar supaya tetap akurat setelah refresh, dan supaya dua kali
 *   pemberian tambahan tidak saling menimpa.
 */
export function useTimer(
  kunci: string, durasiMenit: number, aktif: boolean, tambahanMenit = 0,
) {
  const kunciPenuh = `timer:${kunci}`;
  const [selesaiDasar] = useState<number>(() => {
    const tersimpan = baca<number | null>(kunciPenuh, null);
    if (tersimpan && tersimpan > 0) return tersimpan;
    const baru = Date.now() + durasiMenit * 60_000;
    tulis(kunciPenuh, baru);
    return baru;
  });

  const selesaiPada = selesaiDasar + tambahanMenit * 60_000;

  const hitung = useCallback(
    (): number => Math.max(0, Math.round((selesaiPada - Date.now()) / 1000)),
    [selesaiPada],
  );

  const [sisaDetik, setSisa] = useState(hitung);

  // Tambahan waktu bisa datang kapan saja lewat balasan denyut — sisa waktu
  // harus langsung ikut naik, tidak menunggu detik berikutnya.
  useEffect(() => { setSisa(hitung()); }, [hitung]);
  const peringatanTerkirim = useRef<Set<number>>(new Set());
  const [peringatan, setPeringatan] = useState<5 | 1 | null>(null);

  useEffect(() => {
    if (!aktif) return;
    const id = window.setInterval(() => {
      const sisa = hitung();
      setSisa(sisa);
      for (const menit of [5, 1] as const) {
        const ambang = menit * 60;
        if (sisa <= ambang && sisa > ambang - 2 && !peringatanTerkirim.current.has(menit)) {
          peringatanTerkirim.current.add(menit);
          setPeringatan(menit);
          window.setTimeout(() => setPeringatan(null), 8000);
        }
      }
    }, 1000);
    return () => window.clearInterval(id);
  }, [aktif, hitung]);

  const hapusTimer = useCallback(() => hapus(kunciPenuh), [kunciPenuh]);

  return {
    sisaDetik,
    habis: sisaDetik <= 0,
    peringatan,
    selesaiPada,
    /** Saat ujian dimulai — tetap tepat walau waktunya ditambah di tengah jalan. */
    mulaiPada: selesaiDasar - durasiMenit * 60_000,
    /** Dipanggil setelah submit agar sesi berikutnya mulai dari durasi penuh. */
    hapusTimer,
  } satisfies KeadaanTimer & { selesaiPada: number; mulaiPada: number; hapusTimer: () => void };
}

/**
 * Berapa menit sudah dipakai — dikirim ke Sheets sebagai kolom Durasi.
 * Dihitung dari waktu MULAI, bukan dari waktu selesai, supaya tambahan waktu
 * dari guru tidak menggeser angkanya.
 */
export function menitTerpakai(mulaiPada: number, batasMenit: number): number {
  return Math.max(0, Math.min(batasMenit, Math.round((Date.now() - mulaiPada) / 60_000)));
}
