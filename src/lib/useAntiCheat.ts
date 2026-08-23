import { useCallback, useEffect, useRef, useState } from 'react';
import { baca, tulis } from './storage';

/**
 * §8.4 — anti-cheat dasar.
 *
 * Batasan jujur (PRD): aplikasi berjalan sepenuhnya di browser murid, jadi ini
 * PENGHALANG, bukan pengaman. Murid yang paham DevTools bisa melewatinya.
 * Pengawasan langsung di kelas tetap lapisan utamanya.
 */

export interface AntiCheat {
  /** F-A02 — jumlah perpindahan tab/jendela, ikut dikirim ke Sheets. */
  pindahTab: number;
  /** Peringatan yang sedang tampil (kejadian ke-1 dan ke-2). */
  peringatan: string | null;
  tutupPeringatan: () => void;
}

export function useAntiCheat(kunci: string, aktif: boolean): AntiCheat {
  const kunciPenuh = `pindahtab:${kunci}`;
  const [pindahTab, setPindahTab] = useState(() => baca<number>(kunciPenuh, 0));
  const [peringatan, setPeringatan] = useState<string | null>(null);
  const terakhir = useRef(0);

  const catat = useCallback(() => {
    // Redam kejadian ganda: blur + visibilitychange sering menyala bersamaan.
    const sekarang = Date.now();
    if (sekarang - terakhir.current < 800) return;
    terakhir.current = sekarang;

    setPindahTab((n) => {
      const baru = n + 1;
      tulis(kunciPenuh, baru);
      if (baru === 1) {
        setPeringatan(
          'Kamu keluar dari halaman ujian. Kejadian ini tercatat dan dilaporkan ke guru. Tetaplah di halaman ini sampai selesai.',
        );
      } else if (baru === 2) {
        setPeringatan(
          'Ini kali kedua kamu keluar dari halaman ujian. Guru akan melihat jumlahnya pada rekap nilai.',
        );
      }
      return baru;
    });
  }, [kunciPenuh]);

  useEffect(() => {
    if (!aktif) return;

    const onVisibility = () => { if (document.hidden) catat(); };
    const onBlur = () => catat();

    // F-A01 — blokir tempel, klik kanan, dan seleksi teks soal.
    const blokir = (e: Event) => {
      const el = e.target as HTMLElement | null;
      if (el?.closest('[data-boleh-salin]')) return;
      e.preventDefault();
    };

    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('blur', onBlur);
    document.addEventListener('contextmenu', blokir);
    document.addEventListener('copy', blokir);
    document.addEventListener('cut', blokir);
    document.addEventListener('paste', blokir);

    const gaya = document.createElement('style');
    gaya.textContent =
      '[data-ujian] { -webkit-user-select: none; user-select: none; } ' +
      '[data-ujian] input, [data-ujian] textarea, [data-ujian] .cm-content { -webkit-user-select: text; user-select: text; }';
    document.head.appendChild(gaya);

    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('blur', onBlur);
      document.removeEventListener('contextmenu', blokir);
      document.removeEventListener('copy', blokir);
      document.removeEventListener('cut', blokir);
      document.removeEventListener('paste', blokir);
      gaya.remove();
    };
  }, [aktif, catat]);

  return { pindahTab, peringatan, tutupPeringatan: () => setPeringatan(null) };
}

/** F-A03 — sinyal tambahan: lama pengerjaan dan berapa kali kode dijalankan. */
export function useJejakSoal(kunci: string) {
  const kunciPenuh = `jejak:${kunci}`;
  const [jejak, setJejak] = useState<Record<string, { detik: number; jalan: number }>>(
    () => baca(kunciPenuh, {}),
  );
  const aktifSejak = useRef<{ id: string; ts: number } | null>(null);

  const simpan = useCallback(
    (data: Record<string, { detik: number; jalan: number }>) => {
      setJejak(data);
      tulis(kunciPenuh, data);
    },
    [kunciPenuh],
  );

  const masukSoal = useCallback(
    (soalId: string) => {
      const sebelum = aktifSejak.current;
      if (sebelum && sebelum.id !== soalId) {
        const detik = Math.round((Date.now() - sebelum.ts) / 1000);
        const lama = jejak[sebelum.id] ?? { detik: 0, jalan: 0 };
        simpan({ ...jejak, [sebelum.id]: { ...lama, detik: lama.detik + detik } });
      }
      aktifSejak.current = { id: soalId, ts: Date.now() };
    },
    [jejak, simpan],
  );

  const catatJalan = useCallback(
    (soalId: string) => {
      const lama = jejak[soalId] ?? { detik: 0, jalan: 0 };
      simpan({ ...jejak, [soalId]: { ...lama, jalan: lama.jalan + 1 } });
    },
    [jejak, simpan],
  );

  return { jejak, masukSoal, catatJalan };
}
