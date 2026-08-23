import { useCallback, useRef, useState } from 'react';
import { usePython } from './PythonProvider';
import { rapikanTraceback, terjemahkanError, type ErrorRamah } from '../lib/pyErrors';

export type BagianTranskrip =
  | { jenis: 'keluaran'; teks: string }
  | { jenis: 'masukan'; teks: string };

export interface KeadaanJalan {
  transkrip: BagianTranskrip[];
  menungguInput: boolean;
  ajakan: string;
  selesai: boolean;
  durasiMs: number;
  galatMentah: string;
  galatRamah: ErrorRamah | null;
  timeout: boolean;
}

const KOSONG: KeadaanJalan = {
  transkrip: [], menungguInput: false, ajakan: '', selesai: false,
  durasiMs: 0, galatMentah: '', galatRamah: null, timeout: false,
};

/**
 * Menjalankan satu program secara "interaktif".
 *
 * Karena stdin sinkron tidak tersedia tanpa SharedArrayBuffer, setiap kali
 * program meminta input() program dijalankan ULANG dari awal dengan antrean
 * masukan yang bertambah. Keluaran hasil lari sebelumnya selalu menjadi awalan
 * keluaran lari berikutnya (program pengajaran bersifat deterministik), jadi
 * selisihnya bisa disambung menjadi transkrip yang terlihat seperti terminal.
 */
export function useRunner() {
  const { jalankan: jalankanPy, sedangJalan } = usePython();
  const [keadaan, setKeadaan] = useState<KeadaanJalan>(KOSONG);
  const stdinRef = useRef<string[]>([]);
  const stdoutSebelumnya = useRef('');
  const transkripRef = useRef<BagianTranskrip[]>([]);

  const proses = useCallback(async (kode: string) => {
    const hasil = await jalankanPy(kode, stdinRef.current);

    if (hasil.status === 'timeout') {
      setKeadaan({
        ...KOSONG,
        transkrip: transkripRef.current,
        timeout: true,
        selesai: true,
        galatRamah: {
          judul: 'Program dihentikan setelah 10 detik',
          saran:
            'Biasanya ini tanda perulangan yang tidak pernah berhenti. Periksa apakah ada baris yang mengubah syarat while, atau apakah range() sudah benar.',
        },
        galatMentah: '',
      });
      return;
    }

    const tambahan = hasil.stdout.startsWith(stdoutSebelumnya.current)
      ? hasil.stdout.slice(stdoutSebelumnya.current.length)
      : hasil.stdout;
    if (tambahan) transkripRef.current = [...transkripRef.current, { jenis: 'keluaran', teks: tambahan }];
    stdoutSebelumnya.current = hasil.stdout;

    const mentah = hasil.stderr ? rapikanTraceback(hasil.stderr) : '';
    setKeadaan({
      transkrip: transkripRef.current,
      menungguInput: hasil.status === 'butuh-input',
      ajakan: hasil.ajakan,
      selesai: hasil.status !== 'butuh-input',
      durasiMs: hasil.durasiMs,
      galatMentah: mentah,
      galatRamah: mentah ? terjemahkanError(hasil.stderr) : null,
      timeout: false,
    });
  }, [jalankanPy]);

  const mulai = useCallback(
    async (kode: string) => {
      stdinRef.current = [];
      stdoutSebelumnya.current = '';
      transkripRef.current = [];
      setKeadaan(KOSONG);
      await proses(kode);
    },
    [proses],
  );

  const balasInput = useCallback(
    async (kode: string, baris: string) => {
      stdinRef.current = [...stdinRef.current, baris];
      transkripRef.current = [...transkripRef.current, { jenis: 'masukan', teks: baris }];
      stdoutSebelumnya.current = '';
      // Jalankan ulang dari nol: transkrip lama dipertahankan, keluaran baru
      // disambungkan dari selisih terhadap keluaran lari sebelumnya.
      const sebelum = transkripRef.current;
      const hasil = await jalankanPy(kode, stdinRef.current);
      const sudahTampil = sebelum
        .filter((b) => b.jenis === 'keluaran')
        .map((b) => b.teks)
        .join('');
      stdoutSebelumnya.current = sudahTampil;
      const tambahan = hasil.stdout.startsWith(sudahTampil)
        ? hasil.stdout.slice(sudahTampil.length)
        : hasil.stdout;
      if (tambahan) transkripRef.current = [...sebelum, { jenis: 'keluaran', teks: tambahan }];
      stdoutSebelumnya.current = hasil.stdout;

      const mentah = hasil.stderr ? rapikanTraceback(hasil.stderr) : '';
      setKeadaan({
        transkrip: transkripRef.current,
        menungguInput: hasil.status === 'butuh-input',
        ajakan: hasil.ajakan,
        selesai: hasil.status !== 'butuh-input',
        durasiMs: hasil.durasiMs,
        galatMentah: mentah,
        galatRamah: mentah ? terjemahkanError(hasil.stderr) : null,
        timeout: hasil.status === 'timeout',
      });
    },
    [jalankanPy],
  );

  const bersihkan = useCallback(() => {
    stdinRef.current = [];
    stdoutSebelumnya.current = '';
    transkripRef.current = [];
    setKeadaan(KOSONG);
  }, []);

  return { keadaan, mulai, balasInput, bersihkan, sedangJalan };
}

/**
 * Menjalankan kode sekali dengan masukan yang sudah lengkap (dipakai untuk test
 * case: tidak ada interaksi, cukup ambil keluarannya).
 */
export function useRunnerBatch() {
  const { jalankan } = usePython();
  return useCallback(
    async (kode: string, input: string): Promise<{ keluaran: string; galat: string }> => {
      const baris = input === '' ? [] : input.split('\n');
      const hasil = await jalankan(kode, baris);
      if (hasil.status === 'timeout') {
        return { keluaran: '', galat: 'Program melebihi batas 10 detik' };
      }
      if (hasil.status === 'error') {
        return { keluaran: hasil.stdout, galat: rapikanTraceback(hasil.stderr) };
      }
      // Status 'butuh-input' berarti program meminta lebih banyak baris daripada
      // yang disediakan test — keluarannya tetap dikirim apa adanya untuk dinilai.
      return { keluaran: hasil.stdout, galat: '' };
    },
    [jalankan],
  );
}
