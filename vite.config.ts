import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // loadEnv perlu dipakai: berkas .env TIDAK otomatis masuk ke process.env di
  // dalam vite.config.ts. Prefix '' agar BASE_PATH (dari GitHub Actions) ikut
  // terbaca bersama VITE_API_URL.
  const env = { ...loadEnv(mode, process.cwd(), ''), ...process.env } as Record<string, string>;

  // `base` menyesuaikan GitHub Pages (https://user.github.io/PyClass/) atau
  // domain sendiri.
  const basePath = env.BASE_PATH ?? '/';

  // Mode demo = VITE_API_URL kosong.
  //
  // Bank soal (soal + test tersembunyi + kunci) TIDAK PERNAH ada di repo, sesuai
  // keputusan PRD §10: repo GitHub Pages bersifat publik. Yang ter-commit adalah
  // bankSoal.ts yang kosong. Untuk mencoba aplikasi tanpa backend, taruh bank
  // lengkap di src/lib/bankDemo.ts (di-gitignore) — hanya kalau berkas itu ada
  // DAN sedang mode demo, impornya dialihkan ke sana.
  const modeDemo = (env.VITE_API_URL ?? '').trim() === '';
  const bankLokal = fileURLToPath(new URL('./src/lib/bankDemo.ts', import.meta.url));
  const pakaiBankLokal = modeDemo && existsSync(bankLokal);

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
