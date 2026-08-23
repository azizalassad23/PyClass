import {
  createContext, useCallback, useContext, useMemo, useRef, useState,
  type ReactNode,
} from 'react';
import type { PesanDariWorker, PesanKeWorker } from './worker';

/** F-E04 — batas eksekusi kode murid. Dihitung sejak kode BENAR-BENAR jalan. */
const BATAS_EKSEKUSI_MS = 10_000;
/** Batas longgar untuk mengunduh & menyiapkan Pyodide pada kunjungan pertama. */
const BATAS_SIAP_MS = 120_000;

export type FasePython = 'idle' | 'mengunduh' | 'menyiapkan' | 'siap' | 'gagal';

export interface HasilJalan {
  status: 'ok' | 'error' | 'butuh-input' | 'timeout';
  stdout: string;
  stderr: string;
  durasiMs: number;
  ajakan: string;
}

interface Ctx {
  fase: FasePython;
  pesanFase: string;
  sedangJalan: boolean;
  /** Muat Pyodide lebih awal (dipanggil saat halaman materi/ujian dibuka). */
  panaskan: () => void;
  jalankan: (kode: string, stdin?: string[]) => Promise<HasilJalan>;
  /** Hentikan paksa program yang sedang berjalan. */
  hentikan: () => void;
}

const PythonCtx = createContext<Ctx | null>(null);

interface Tugas {
  selesaikan: (h: HasilJalan) => void;
  timer: number | null;
}

export function PythonProvider({ children }: { children: ReactNode }) {
  const workerRef = useRef<Worker | null>(null);
  const idRef = useRef(0);
  const tugasRef = useRef<Map<number, Tugas>>(new Map());
  const [fase, setFase] = useState<FasePython>('idle');
  const [pesanFase, setPesanFase] = useState('Python belum dimuat');
  const [sedangJalan, setSedangJalan] = useState(false);

  const batalkanTimer = (t: Tugas | undefined) => {
    if (t?.timer) window.clearTimeout(t.timer);
  };

  /** Matikan worker yang macet; yang berikutnya memakai Pyodide dari cache. */
  const bunuhWorker = useCallback(() => {
    workerRef.current?.terminate();
    workerRef.current = null;
    for (const [, t] of tugasRef.current) batalkanTimer(t);
    tugasRef.current.clear();
    setSedangJalan(false);
    setFase('idle');
    setPesanFase('Python dimuat ulang');
  }, []);

  const buatWorker = useCallback(() => {
    const w = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' });
    w.onmessage = (ev: MessageEvent<PesanDariWorker>) => {
      const p = ev.data;

      if (p.jenis === 'status') {
        setFase(p.fase);
        setPesanFase(p.pesan);
        return;
      }

      if (p.jenis === 'mulai') {
        // Pyodide siap; baru sekarang batas 10 detik mulai dihitung.
        const t = tugasRef.current.get(p.id);
        if (!t) return;
        batalkanTimer(t);
        t.timer = window.setTimeout(() => {
          tugasRef.current.delete(p.id);
          bunuhWorker();
          t.selesaikan({ status: 'timeout', stdout: '', stderr: '', durasiMs: BATAS_EKSEKUSI_MS, ajakan: '' });
        }, BATAS_EKSEKUSI_MS);
        return;
      }

      const t = tugasRef.current.get(p.id);
      if (!t) return;
      batalkanTimer(t);
      tugasRef.current.delete(p.id);
      if (tugasRef.current.size === 0) setSedangJalan(false);
      t.selesaikan({
        status: p.status, stdout: p.stdout, stderr: p.stderr,
        durasiMs: p.durasiMs, ajakan: p.ajakan,
      });
    };
    workerRef.current = w;
    return w;
  }, [bunuhWorker]);

  const kirim = useCallback(
    (p: PesanKeWorker) => { (workerRef.current ?? buatWorker()).postMessage(p); },
    [buatWorker],
  );

  const panaskan = useCallback(() => {
    // Juga dipanggil ulang bila worker sempat dimatikan (mis. setelah timeout),
    // sehingga halaman tidak pernah terjebak tanpa Python.
    if (!workerRef.current || fase === 'idle' || fase === 'gagal') kirim({ jenis: 'init' });
  }, [fase, kirim]);

  const hentikan = useCallback(() => {
    for (const [, t] of tugasRef.current) {
      t.selesaikan({ status: 'timeout', stdout: '', stderr: '', durasiMs: 0, ajakan: '' });
    }
    bunuhWorker();
  }, [bunuhWorker]);

  const jalankan = useCallback(
    (kode: string, stdin: string[] = []): Promise<HasilJalan> => {
      const id = ++idRef.current;
      setSedangJalan(true);
      return new Promise<HasilJalan>((resolve) => {
        const tugas: Tugas = { selesaikan: resolve, timer: null };
        // Sampai worker mengabarkan 'mulai', yang berlaku adalah batas longgar
        // untuk mengunduh Pyodide — bukan batas eksekusi.
        tugas.timer = window.setTimeout(() => {
          tugasRef.current.delete(id);
          bunuhWorker();
          resolve({
            status: 'timeout', stdout: '',
            stderr: 'Python tidak selesai dimuat. Periksa koneksi internet lalu coba lagi.',
            durasiMs: BATAS_SIAP_MS, ajakan: '',
          });
        }, BATAS_SIAP_MS);
        tugasRef.current.set(id, tugas);
        kirim({ jenis: 'jalankan', id, kode, stdin });
      });
    },
    [kirim, bunuhWorker],
  );

  // Worker sengaja TIDAK dimatikan saat provider di-unmount: provider hidup
  // selama aplikasi hidup, dan di StrictMode (dev) unmount tiruan akan
  // membunuh worker yang baru saja dibuat sehingga Python tak pernah siap.

  const nilai = useMemo<Ctx>(
    () => ({ fase, pesanFase, sedangJalan, panaskan, jalankan, hentikan }),
    [fase, pesanFase, sedangJalan, panaskan, jalankan, hentikan],
  );

  return <PythonCtx.Provider value={nilai}>{children}</PythonCtx.Provider>;
}

export function usePython(): Ctx {
  const c = useContext(PythonCtx);
  if (!c) throw new Error('usePython harus dipakai di dalam <PythonProvider>');
  return c;
}
