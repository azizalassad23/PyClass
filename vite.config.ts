import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ command, mode }) => {
  // loadEnv perlu dipakai: berkas .env TIDAK otomatis masuk ke process.env di
  // dalam vite.config.ts. Prefix '' agar BASE_PATH (dari GitHub Actions) ikut
  // terbaca bersama VITE_API_URL.
  const berkasEnv = loadEnv(mode, process.cwd(), '');
  // process.env (dari GitHub Actions) menang HANYA bila benar-benar berisi.
  // Tanpa syarat ini, "VITE_API_URL: ${{ vars.VITE_API_URL }}" yang kosong akan
  // menimpa nilai di .env.production dan diam-diam menerbitkan situs mode demo
  // — situs hidup, tapi tanpa bank soal sama sekali.
  const ambil = (k: string) =>
    (process.env[k] ?? '').trim() || (berkasEnv[k] ?? '').trim();

  // `base` menyesuaikan GitHub Pages (https://user.github.io/PyClass/) atau
  // domain sendiri.
  const basePath = ambil('BASE_PATH') || '/';

  // Mode demo = VITE_API_URL kosong.
  //
  // Bank soal (soal + test tersembunyi + kunci) TIDAK PERNAH ada di repo, sesuai
  // keputusan PRD §10: repo GitHub Pages bersifat publik. Yang ter-commit adalah
  // bankSoal.ts yang kosong. Untuk mencoba aplikasi tanpa backend, taruh bank
  // lengkap di src/lib/bankDemo.ts (di-gitignore) — hanya kalau berkas itu ada
  // DAN sedang mode demo, impornya dialihkan ke sana.
  const modeDemo = ambil('VITE_API_URL') === '';
  const bankLokal = fileURLToPath(new URL('./src/lib/bankDemo.ts', import.meta.url));
  const pakaiBankLokal = modeDemo && existsSync(bankLokal);

  // Jaring pengaman rilis: tanpa backend DAN tanpa bank lokal, situsnya hidup
  // tetapi sama sekali tidak punya soal. Lebih baik build gagal keras di CI
  // daripada hal itu baru ketahuan saat sekelas murid sudah duduk menunggu.
  if (command === 'build' && modeDemo && !pakaiBankLokal) {
    throw new Error(
      'Build dibatalkan: VITE_API_URL kosong dan src/lib/bankDemo.ts tidak ada, ' +
        'sehingga aplikasi akan terbit tanpa satu pun soal. Isi VITE_API_URL di ' +
        '.env.production dengan URL /exec Apps Script.',
    );
  }

  return {
    base: basePath,
    plugins: [react()],
    resolve: {
      // Pola harus mencocokkan SELURUH specifier ('./bankSoal',
      // '../lib/bankSoal'); pola sebagian membuat replacement disambung ke
      // sisa jalur dan berujung path ngawur.
      alias: pakaiBankLokal ? [{ find: /^.*\/bankSoal$/, replacement: bankLokal }] : [],
    },
    build: { target: 'es2022', chunkSizeWarningLimit: 900 },
    worker: { format: 'es' },
  };
});
