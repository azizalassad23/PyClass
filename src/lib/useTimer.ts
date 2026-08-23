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

export function useTimer(kunci: string, durasiMenit: number, aktif: boolean) {
  const kunciPenuh = `timer:${kunci}`;
  const [selesaiPada] = useState<number>(() => {
    const tersimpan = baca<number | null>(kunciPenuh, null);
    if (tersimpan && tersimpan > 0) return tersimpan;
    const baru = Date.now() + durasiMenit * 60_000;
    tulis(kunciPenuh, baru);
    return baru;
  });

  const hitung = useCallback(
    (): number => Math.max(0, Math.round((selesaiPada - Date.now()) / 1000)),
    [selesaiPada],
  );

  const [sisaDetik, setSisa] = useState(hitung);
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
    /** Dipanggil setelah submit agar sesi berikutnya mulai dari durasi penuh. */
    hapusTimer,
  } satisfies KeadaanTimer & { selesaiPada: number; hapusTimer: () => void };
}

/** Berapa menit sudah dipakai — dikirim ke Sheets sebagai kolom Durasi. */
export function menitTerpakai(selesaiPada: number, durasiMenit: number): number {
  const mulai = selesaiPada - durasiMenit * 60_000;
  return Math.max(0, Math.min(durasiMenit, Math.round((Date.now() - mulai) / 60_000)));
}
