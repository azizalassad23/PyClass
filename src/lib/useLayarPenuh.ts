import { useCallback, useEffect, useRef, useState } from 'react';
import { matikanSirene, siapkanAudio } from './alarm';
import { baca, tulis } from './storage';

/**
 * Layar penuh wajib selama ujian di peramban.
 *
 * - Soal hanya terlihat dalam layar penuh; di luar itu layar ujian menutup soal
 *   dengan tirai (lihat Ujian.tsx).
 * - Keluar dari layar penuh menambah hitungan (untuk papan pantau). Pelanggaran,
 *   sirene, dan blokirnya diatur useAntiCheat, yang menerima `penuh` dari sini.
 * - Di Chrome komputer, tombol Esc dikunci (Keyboard Lock API): keluar harus
 *   dengan menahan Esc, jadi tidak terjadi karena salah pencet.
 *
 * Batas jujurnya: iPhone (Safari maupun Chrome, keduanya WebKit) tidak
 * mengizinkan layar penuh untuk halaman web. Di perangkat itu tirai tidak
 * dipasang — murid tetap bisa mengerjakan — dan kejadiannya dicatat sekali.
 */

type ElemenLayarPenuh = HTMLElement & { webkitRequestFullscreen?: () => void };
type DokumenLayarPenuh = Document & {
  webkitFullscreenElement?: Element | null;
  webkitExitFullscreen?: () => void;
};

export function layarPenuhDidukung(): boolean {
  const el = document.documentElement as ElemenLayarPenuh;
  return typeof el.requestFullscreen === 'function' || typeof el.webkitRequestFullscreen === 'function';
}

export function sedangLayarPenuh(): boolean {
  const d = document as DokumenLayarPenuh;
  return Boolean(d.fullscreenElement ?? d.webkitFullscreenElement);
}

function kunciEsc(): void {
  const papanKetik = (navigator as Navigator & { keyboard?: { lock?: (k: string[]) => Promise<void> } }).keyboard;
  papanKetik?.lock?.(['Escape']).catch(() => undefined);
}

/**
 * Masuk layar penuh. HARUS dipanggil langsung di dalam klik (sebelum `await`
 * apa pun): peramban menolak permintaan layar penuh di luar interaksi pengguna.
 */
export function masukLayarPenuh(): void {
  siapkanAudio();
  const el = document.documentElement as ElemenLayarPenuh;
  try {
    if (el.requestFullscreen) {
      el.requestFullscreen({ navigationUI: 'hide' }).then(kunciEsc).catch(() => undefined);
    } else {
      el.webkitRequestFullscreen?.();
    }
  } catch {
    /* ditolak peramban — tirai tetap menunggu klik berikutnya */
  }
}

export function keluarLayarPenuh(): void {
  const d = document as DokumenLayarPenuh;
  try {
    if (d.exitFullscreen && d.fullscreenElement) void d.exitFullscreen().catch(() => undefined);
    else if (d.webkitFullscreenElement) d.webkitExitFullscreen?.();
  } catch {
    /* sudah tidak layar penuh */
  }
}

interface OpsiLayarPenuh {
  /** `<kode sesi>:<NIS>` — hitungan disimpan per murid per sesi, tahan refresh. */
  kunci: string;
  aktif: boolean;
}

export function useLayarPenuh({ kunci, aktif }: OpsiLayarPenuh) {
  const kHitung = `layarpenuh:${kunci}`;
  const [didukung] = useState(layarPenuhDidukung);
  const [penuh, setPenuh] = useState(sedangLayarPenuh);
  const [jumlahKeluar, setJumlahKeluar] = useState(() => baca<number>(kHitung, 0));

  // Halaman yang baru dimuat ulang memang tidak dalam layar penuh; itu bukan
  // "keluar". Hitungan baru bertambah setelah pernah masuk di halaman ini.
  const pernahPenuh = useRef(sedangLayarPenuh());
  const aktifRef = useRef(aktif);
  const hitungRef = useRef(jumlahKeluar);
  aktifRef.current = aktif;

  useEffect(() => {
    const berubah = () => {
      const sekarang = sedangLayarPenuh();
      setPenuh(sekarang);
      if (!aktifRef.current) return;

      if (sekarang) {
        pernahPenuh.current = true;
        kunciEsc();
        return;
      }

      if (!pernahPenuh.current) return;
      const ke = hitungRef.current + 1;
      hitungRef.current = ke;
      tulis(kHitung, ke);
      setJumlahKeluar(ke);
    };
    document.addEventListener('fullscreenchange', berubah);
    document.addEventListener('webkitfullscreenchange', berubah);
    return () => {
      document.removeEventListener('fullscreenchange', berubah);
      document.removeEventListener('webkitfullscreenchange', berubah);
    };
  }, [kHitung]);

  /** Mengakhiri pengawasan (setelah mengirim), lalu keluar layar penuh tanpa alarm. */
  const lepas = useCallback(() => {
    aktifRef.current = false;
    matikanSirene();
    keluarLayarPenuh();
  }, []);

  return { didukung, penuh, jumlahKeluar, masuk: masukLayarPenuh, lepas };
}
