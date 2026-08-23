/**
 * F-E05 — terjemahan ringkas 10 error Python tersering ke bahasa Indonesia.
 * Pesan asli tetap ditampilkan di bawahnya; ini hanya lapisan bantuan.
 */

interface Aturan {
  cocok: RegExp;
  judul: string;
  saran: (m: RegExpMatchArray) => string;
}

const ATURAN: Aturan[] = [
  {
    cocok: /IndentationError: expected an indented block/,
    judul: 'Baris di dalam blok belum menjorok',
    saran: () =>
      'Setelah tanda titik dua (:) baris berikutnya harus masuk ke dalam — gunakan 4 spasi, konsisten.',
  },
  {
    cocok: /IndentationError|TabError/,
    judul: 'Jarak menjorok tidak konsisten',
    saran: () =>
      'Campuran spasi dan Tab membingungkan Python. Pakai 4 spasi untuk semua baris.',
  },
  {
    cocok: /NameError: name '([^']+)' is not defined/,
    judul: 'Nama belum dikenal',
    saran: (m) =>
      `Python belum pernah melihat "${m[1]}". Periksa ejaannya, atau pastikan variabel/fungsi itu dibuat sebelum dipakai.`,
  },
  {
    cocok: /SyntaxError: invalid syntax/,
    judul: 'Penulisan kode belum benar',
    saran: () =>
      'Sering karena titik dua (:) yang hilang di akhir if/for/while/def, kurung yang belum ditutup, atau tanda = dipakai untuk membandingkan (seharusnya ==).',
  },
  {
    cocok: /SyntaxError: '([^']+)' was never closed|SyntaxError: unexpected EOF/,
    judul: 'Ada kurung atau tanda kutip yang belum ditutup',
    saran: () => 'Periksa tanda (, [, {, " atau \' yang dibuka tetapi belum ditutup.',
  },
  {
    cocok: /TypeError: unsupported operand type\(s\) for [^:]+: '(\w+)' and '(\w+)'/,
    judul: 'Tipe data tidak bisa dioperasikan bersama',
    saran: (m) =>
      `Tidak bisa mengoperasikan ${m[1]} dengan ${m[2]}. Bila datanya dari input(), bungkus dengan int() atau float() lebih dulu.`,
  },
  {
    cocok: /TypeError: can only concatenate str/,
    judul: 'Teks dan angka tidak bisa langsung digabung',
    saran: () =>
      'Ubah angka menjadi teks dengan str(...) atau gunakan f-string: print(f"Nilai: {n}").',
  },
  {
    cocok: /ValueError: invalid literal for int\(\) with base 10: '([^']*)'/,
    judul: 'Masukan bukan bilangan bulat',
    saran: (m) =>
      `int() tidak bisa mengubah "${m[1]}" menjadi angka. Pastikan masukannya berupa bilangan, atau gunakan float() bila ada koma desimal.`,
  },
  {
    cocok: /ZeroDivisionError/,
    judul: 'Pembagian dengan nol',
    saran: () => 'Periksa pembaginya — nilainya nol. Tambahkan pemeriksaan sebelum membagi.',
  },
  {
    cocok: /IndexError: list index out of range/,
    judul: 'Nomor urut di luar jangkauan list',
    saran: () =>
      'Indeks pertama adalah 0 dan yang terakhir len(daftar) - 1. Periksa batas perulanganmu.',
  },
  {
    cocok: /KeyError: (.+)/,
    judul: 'Kunci tidak ada di dictionary',
    saran: (m) => `Dictionary tidak punya kunci ${m[1]}. Periksa ejaan kunci, atau gunakan .get().`,
  },
  {
    cocok: /AttributeError: '(\w+)' object has no attribute '([^']+)'/,
    judul: 'Method itu tidak dimiliki tipe data ini',
    saran: (m) => `Tipe ${m[1]} tidak punya "${m[2]}". Periksa ejaannya atau tipe variabelnya.`,
  },
  {
    cocok: /RecursionError|maximum recursion depth/,
    judul: 'Fungsi memanggil dirinya tanpa henti',
    saran: () => 'Pastikan ada kondisi berhenti (base case) pada fungsi rekursifmu.',
  },
];

export interface ErrorRamah {
  judul: string;
  saran: string;
  baris?: number;
}

export function terjemahkanError(pesanAsli: string): ErrorRamah | null {
  for (const a of ATURAN) {
    const m = pesanAsli.match(a.cocok);
    if (m) {
      const baris = pesanAsli.match(/File "<exec>", line (\d+)/);
      return {
        judul: a.judul,
        saran: a.saran(m),
        baris: baris ? Number(baris[1]) : undefined,
      };
    }
  }
  return null;
}

/** Buang bingkai traceback internal Pyodide agar murid melihat barisnya sendiri. */
export function rapikanTraceback(mentah: string): string {
  return mentah
    .split('\n')
    .filter((b) => !/File "\/lib\/python3|importlib\._bootstrap|pyodide\/_/.test(b))
    .join('\n')
    .replace(/File "<exec>"/g, 'Baris kodemu')
    .trim();
}
