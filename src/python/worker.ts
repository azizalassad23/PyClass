/// <reference lib="webworker" />
/**
 * F-E02 — Pyodide berjalan di Web Worker agar UI tidak membeku.
 *
 * Catatan tentang input():
 * GitHub Pages tidak dapat mengirim header COOP/COEP, jadi SharedArrayBuffer
 * (dan karenanya stdin sinkron sejati) tidak tersedia. Solusinya: worker
 * menyimpan antrean baris masukan. Bila kode memanggil input() sementara
 * antrean habis, stdin mengembalikan null sehingga Python melempar EOFError —
 * di sini artinya "butuh satu baris lagi". UI meminta baris itu ke murid lalu
 * MENJALANKAN ULANG program dari awal dengan antrean yang sudah bertambah.
 * Untuk program pengajaran (deterministik, tanpa efek samping) hasilnya identik
 * dengan stdin sungguhan.
 */

const PYODIDE_VERSION = '0.26.2';
const PYODIDE_URL = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`;


type PyodideAPI = {
  runPythonAsync: (kode: string, opsi?: { globals?: unknown }) => Promise<unknown>;
  setStdout: (o: { write: (b: Uint8Array) => number }) => void;
  setStderr: (o: { write: (b: Uint8Array) => number }) => void;
  setStdin: (o: { stdin: () => string | null }) => void;
  toPy: (o: unknown) => { destroy: () => void; set: (k: string, v: unknown) => void };
};

export type PesanKeWorker =
  | { jenis: 'init' }
  | { jenis: 'jalankan'; id: number; kode: string; stdin: string[] };

export type PesanDariWorker =
  | { jenis: 'status'; fase: 'mengunduh' | 'menyiapkan' | 'siap' | 'gagal'; pesan: string }
  /** Dikirim tepat sebelum kode murid dieksekusi, agar batas 10 detik di main
   *  thread tidak ikut menghitung waktu mengunduh Pyodide. */
  | { jenis: 'mulai'; id: number }
  | {
      jenis: 'hasil';
      id: number;
      status: 'ok' | 'error' | 'butuh-input';
      stdout: string;
      stderr: string;
      durasiMs: number;
      /** Teks yang dicetak program sebelum meminta input (mis. "Nama: "). */
      ajakan: string;
    };

const dekoder = new TextDecoder();
let pyodide: PyodideAPI | null = null;
let keluaran: string[] = [];
let galat: string[] = [];
let antrean: string[] = [];
let posisi = 0;
let mintaInput = false;

const kirim = (p: PesanDariWorker) => (self as DedicatedWorkerGlobalScope).postMessage(p);

async function siapkan(): Promise<void> {
  if (pyodide) return;
  kirim({ jenis: 'status', fase: 'mengunduh', pesan: 'Mengunduh Python (±10 MB, sekali saja)…' });
  try {
    const mod = (await import(/* @vite-ignore */ `${PYODIDE_URL}pyodide.mjs`)) as {
      loadPyodide: (o: { indexURL: string }) => Promise<PyodideAPI>;
    };
    kirim({ jenis: 'status', fase: 'menyiapkan', pesan: 'Menyiapkan juru bahasa Python…' });
    pyodide = await mod.loadPyodide({ indexURL: PYODIDE_URL });

    // 'write' dipakai, bukan 'batched': ajakan input() seperti "Nama: " tidak
    // diakhiri baris baru, sehingga mode batched akan menahannya sampai baris
    // berikutnya — murid tidak akan pernah melihat pertanyaannya.
    pyodide.setStdout({ write: (b) => { keluaran.push(dekoder.decode(b)); return b.length; } });
    pyodide.setStderr({ write: (b) => { galat.push(dekoder.decode(b)); return b.length; } });
    pyodide.setStdin({
      stdin: () => {
        if (posisi < antrean.length) return antrean[posisi++] + '\n';
        // null = akhir masukan; Python melempar EOFError. Di sini artinya
        // "program butuh satu baris lagi", bukan kesalahan murid.
        mintaInput = true;
        return null;
      },
    });

    kirim({ jenis: 'status', fase: 'siap', pesan: 'Python siap' });
  } catch (e) {
    kirim({
      jenis: 'status',
      fase: 'gagal',
      pesan: `Gagal memuat Python: ${(e as Error).message}. Periksa koneksi internet lalu muat ulang halaman.`,
    });
  }
}

async function jalankan(id: number, kode: string, stdin: string[]): Promise<void> {
  await siapkan();
  if (!pyodide) return;

  keluaran = [];
  galat = [];
  antrean = stdin;
  posisi = 0;
  mintaInput = false;

  kirim({ jenis: 'mulai', id });
  const mulai = performance.now();
  let status: 'ok' | 'error' | 'butuh-input' = 'ok';

  const ns = pyodide.toPy({});
  ns.set('__name__', '__main__');
  try {
    await pyodide.runPythonAsync(kode, { globals: ns });
  } catch (e) {
    const pesan = String((e as Error)?.message ?? e);
    if (mintaInput && /EOFError/.test(pesan)) {
      status = 'butuh-input';
    } else {
      status = 'error';
      galat.push(pesan);
    }
  } finally {
    ns.destroy();
  }

  const stdout = keluaran.join('');
  // Saat butuh-input, ekor stdout adalah ajakan yang dicetak input(...).
  const ajakan = status === 'butuh-input' ? (stdout.split('\n').pop() ?? '') : '';

  kirim({
    jenis: 'hasil',
    id,
    status,
    stdout,
    stderr: galat.join(''),
    durasiMs: Math.round(performance.now() - mulai),
    ajakan,
  });
}

self.onmessage = (ev: MessageEvent<PesanKeWorker>) => {
  const p = ev.data;
  if (p.jenis === 'init') void siapkan();
  else if (p.jenis === 'jalankan') void jalankan(p.id, p.kode, p.stdin);
};
