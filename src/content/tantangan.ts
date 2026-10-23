/**
 * Kartu Tantangan Kilat — kuis langsung di depan kelas.
 *
 * BERKAS INI DIBUAT OTOMATIS. Setiap kunci dihitung dengan menjalankan kodenya
 * di Python 3.13 dan diperiksa ulang di Pyodide (mesin di browser murid):
 * - keluaran   : keluaran sebenarnya dari kode.
 * - lengkapi   : isian referensi menghasilkan `target`; isian keliru yang wajar
 *                dipastikan TIDAK menghasilkannya. Di aplikasi, isian murid
 *                dijalankan, jadi isian lain yang sama-sama benar ikut diterima.
 * - cari-salah : nomor baris dari galat Python yang sebenarnya.
 * - isian      : jawaban konsep yang diterima, ditulis tangan.
 *
 * Kunci memang ada di situs: ini latihan yang dikerjakan di depan guru, bukan
 * penilaian. Soal dan kunci ujian tetap hanya di sheet _Bank.
 */

export type TingkatKartu = 'mudah' | 'sedang' | 'sulit';
export type JenisKartu = 'keluaran' | 'lengkapi' | 'cari-salah' | 'isian';

export interface KartuTantangan {
  id: string;
  unit: string;
  tingkat: TingkatKartu;
  jenis: JenisKartu;
  /** Hanya untuk jenis isian; jenis lain memakai kalimat tanya bawaan. */
  tanya?: string;
  kode?: string;
  /** Jawaban yang diterima (untuk lengkapi: isian referensi, ditampilkan sebagai pembahasan). */
  terima: string[];
  /** Jenis lengkapi: keluaran yang harus dihasilkan kode setelah dilengkapi. */
  target?: string;
  /** Jenis cari-salah: nama galat Python yang muncul. */
  galat?: string;
}

/** Waktu per kartu, dalam detik. */
export const WAKTU_TINGKAT: Record<TingkatKartu, number> = { mudah: 60, sedang: 90, sulit: 120 };

/** Unit yang sudah punya kartu. Unit lain menyusul dengan format yang sama. */
export const UNIT_TANTANGAN = ['U1', 'U2', 'U3'];

export const KARTU: KartuTantangan[] = [
  { id: 'tk-u1-01', unit: 'U1', tingkat: 'mudah', jenis: 'keluaran', kode: 'a = 7\nb = 3\nprint(a + b)', terima: ['10'] },
  { id: 'tk-u1-02', unit: 'U1', tingkat: 'mudah', jenis: 'isian', tanya: 'Apa tipe data dari nilai 3.14?', terima: ['float'] },
  { id: 'tk-u1-03', unit: 'U1', tingkat: 'mudah', jenis: 'lengkapi', kode: 'angka = ___("25")\nprint(angka + 5)', terima: ['int'], target: '30' },
  { id: 'tk-u1-04', unit: 'U1', tingkat: 'mudah', jenis: 'keluaran', kode: 'x = "5"\ny = "3"\nprint(x + y)', terima: ['53'] },
  { id: 'tk-u1-05', unit: 'U1', tingkat: 'mudah', jenis: 'cari-salah', kode: 'nama = "Ani"\numur = 15\nprint(nama + umur)', terima: ['3'], galat: 'TypeError' },
  { id: 'tk-u1-06', unit: 'U1', tingkat: 'mudah', jenis: 'lengkapi', kode: 'nama = ___\nprint("Halo", nama)', terima: ['"Budi"'], target: 'Halo Budi' },
  { id: 'tk-u1-07', unit: 'U1', tingkat: 'mudah', jenis: 'keluaran', kode: 'print(str(7) + "7")', terima: ['77'] },
  { id: 'tk-u1-08', unit: 'U1', tingkat: 'mudah', jenis: 'isian', tanya: 'Apa tipe data dari nilai True?', terima: ['bool'] },
  { id: 'tk-u1-09', unit: 'U1', tingkat: 'mudah', jenis: 'lengkapi', kode: 'x = 10\nx = ___\nprint(x * 2)', terima: ['20'], target: '40' },
  { id: 'tk-u1-10', unit: 'U1', tingkat: 'mudah', jenis: 'keluaran', kode: 'a = 4\nb = a\na = 9\nprint(b)', terima: ['4'] },
  { id: 'tk-u1-11', unit: 'U1', tingkat: 'sedang', jenis: 'keluaran', kode: 'print(int(7.9))', terima: ['7'] },
  { id: 'tk-u1-12', unit: 'U1', tingkat: 'sedang', jenis: 'lengkapi', kode: 'harga = "1500"\njumlah = 3\nprint(___(harga) * jumlah)', terima: ['int'], target: '4500' },
  { id: 'tk-u1-13', unit: 'U1', tingkat: 'sedang', jenis: 'cari-salah', kode: 'x = "10"\ny = int(x)\nz = int("sepuluh")\nprint(y + z)', terima: ['3'], galat: 'ValueError' },
  { id: 'tk-u1-14', unit: 'U1', tingkat: 'sulit', jenis: 'keluaran', kode: 'print(bool(""), bool("0"))', terima: ['False True'] },
  { id: 'tk-u1-15', unit: 'U1', tingkat: 'sulit', jenis: 'lengkapi', kode: 'a = 3\nb = 5\na, b = ___\nprint(a, b)', terima: ['b, a'], target: '5 3' },
  { id: 'tk-u1-16', unit: 'U1', tingkat: 'mudah', jenis: 'keluaran', kode: 'x = 3\ny = x + 2\nprint(y * 2)', terima: ['10'] },
  { id: 'tk-u1-17', unit: 'U1', tingkat: 'mudah', jenis: 'lengkapi', kode: 'umur = "16"\nprint(___(umur) + 1)', terima: ['int'], target: '17' },
  { id: 'tk-u1-18', unit: 'U1', tingkat: 'mudah', jenis: 'lengkapi', kode: 'a = 5\nb = 2\nprint(a ___ b)', terima: ['+'], target: '7' },
  { id: 'tk-u1-19', unit: 'U1', tingkat: 'sedang', jenis: 'keluaran', kode: 'x = 5\nx = x + 1\nx = x * 2\nprint(x)', terima: ['12'] },
  { id: 'tk-u1-20', unit: 'U1', tingkat: 'sulit', jenis: 'lengkapi', kode: 'nilai = 85.7\nprint(___(nilai))', terima: ['int'], target: '85' },
  { id: 'tk-u2-01', unit: 'U2', tingkat: 'mudah', jenis: 'keluaran', kode: 'print(7 // 2)', terima: ['3'] },
  { id: 'tk-u2-02', unit: 'U2', tingkat: 'mudah', jenis: 'keluaran', kode: 'print(7 % 2)', terima: ['1'] },
  { id: 'tk-u2-03', unit: 'U2', tingkat: 'mudah', jenis: 'lengkapi', kode: 'print(2 ___ 3)', terima: ['**'], target: '8' },
  { id: 'tk-u2-04', unit: 'U2', tingkat: 'mudah', jenis: 'keluaran', kode: 'print(10 / 4)', terima: ['2.5'] },
  { id: 'tk-u2-05', unit: 'U2', tingkat: 'mudah', jenis: 'keluaran', kode: 'print(3 + 4 * 2)', terima: ['11'] },
  { id: 'tk-u2-06', unit: 'U2', tingkat: 'mudah', jenis: 'isian', tanya: 'Operator apa yang menghasilkan sisa hasil bagi?', terima: ['%'] },
  { id: 'tk-u2-07', unit: 'U2', tingkat: 'mudah', jenis: 'lengkapi', kode: 'print(17 ___ 5)', terima: ['//'], target: '3' },
  { id: 'tk-u2-08', unit: 'U2', tingkat: 'mudah', jenis: 'keluaran', kode: 'print("Halo", "Dunia")', terima: ['Halo Dunia'] },
  { id: 'tk-u2-09', unit: 'U2', tingkat: 'mudah', jenis: 'cari-salah', kode: 'a = 10\nb = 0\nprint(a / b)', terima: ['3'], galat: 'ZeroDivisionError' },
  { id: 'tk-u2-10', unit: 'U2', tingkat: 'mudah', jenis: 'isian', tanya: 'Fungsi apa yang dipakai untuk menampilkan teks ke layar?', terima: ['print', 'print()'] },
  { id: 'tk-u2-11', unit: 'U2', tingkat: 'sedang', jenis: 'keluaran', kode: 'print((3 + 4) * 2 ** 2)', terima: ['28'] },
  { id: 'tk-u2-12', unit: 'U2', tingkat: 'sedang', jenis: 'lengkapi', kode: 'x = 5\nx ___ 3\nprint(x)', terima: ['+='], target: '8' },
  { id: 'tk-u2-13', unit: 'U2', tingkat: 'sedang', jenis: 'keluaran', kode: 'print(5 > 3 and 2 > 4)', terima: ['False'] },
  { id: 'tk-u2-14', unit: 'U2', tingkat: 'sulit', jenis: 'lengkapi', kode: 'print("a", "b", "c", ___)', terima: ['sep="-"'], target: 'a-b-c' },
  { id: 'tk-u2-15', unit: 'U2', tingkat: 'sulit', jenis: 'cari-salah', kode: 'x = 5\ny = "3"\ntotal = x + int(y)\nhasil = total + y\nprint(hasil)', terima: ['4'], galat: 'TypeError' },
  { id: 'tk-u2-16', unit: 'U2', tingkat: 'mudah', jenis: 'keluaran', kode: 'print(9 % 4)', terima: ['1'] },
  { id: 'tk-u2-17', unit: 'U2', tingkat: 'mudah', jenis: 'lengkapi', kode: 'print(20 ___ 4)', terima: ['/'], target: '5.0' },
  { id: 'tk-u2-18', unit: 'U2', tingkat: 'mudah', jenis: 'keluaran', kode: 'print(2 + 3 * 4 - 1)', terima: ['13'] },
  { id: 'tk-u2-19', unit: 'U2', tingkat: 'sedang', jenis: 'lengkapi', kode: 'x = 10\nx ___ 4\nprint(x)', terima: ['-='], target: '6' },
  { id: 'tk-u2-20', unit: 'U2', tingkat: 'sulit', jenis: 'keluaran', kode: 'print(10 // 3 * 3 + 10 % 3)', terima: ['10'] },
  { id: 'tk-u3-01', unit: 'U3', tingkat: 'mudah', jenis: 'keluaran', kode: 'x = 8\nif x > 5:\n    print("Besar")\nelse:\n    print("Kecil")', terima: ['Besar'] },
  { id: 'tk-u3-02', unit: 'U3', tingkat: 'mudah', jenis: 'lengkapi', kode: 'nilai = 75\nif nilai ___ 75:\n    print("Lulus")\nelse:\n    print("Remedial")', terima: ['>='], target: 'Lulus' },
  { id: 'tk-u3-03', unit: 'U3', tingkat: 'mudah', jenis: 'isian', tanya: 'Kata kunci apa yang dipakai untuk cabang "selain itu" pada percabangan?', terima: ['else'] },
  { id: 'tk-u3-04', unit: 'U3', tingkat: 'mudah', jenis: 'keluaran', kode: 'x = 3\nif x % 2 == 0:\n    print("Genap")\nelse:\n    print("Ganjil")', terima: ['Ganjil'] },
  { id: 'tk-u3-05', unit: 'U3', tingkat: 'mudah', jenis: 'lengkapi', kode: 'x = -2\nif x ___ 0:\n    print("Negatif")\nelse:\n    print("Bukan negatif")', terima: ['<'], target: 'Negatif' },
  { id: 'tk-u3-06', unit: 'U3', tingkat: 'mudah', jenis: 'isian', tanya: 'Kata kunci apa yang dipakai untuk memeriksa kondisi tambahan setelah if?', terima: ['elif'] },
  { id: 'tk-u3-07', unit: 'U3', tingkat: 'mudah', jenis: 'keluaran', kode: 'suhu = 30\nif suhu > 35:\n    print("Panas")\nelif suhu > 25:\n    print("Hangat")\nelse:\n    print("Sejuk")', terima: ['Hangat'] },
  { id: 'tk-u3-08', unit: 'U3', tingkat: 'mudah', jenis: 'cari-salah', kode: 'x = 5\nif x > 3\n    print("Lebih")', terima: ['2'], galat: 'SyntaxError' },
  { id: 'tk-u3-09', unit: 'U3', tingkat: 'mudah', jenis: 'keluaran', kode: 'a = 4\nb = 9\nif a > b:\n    print(a)\nelse:\n    print(b)', terima: ['9'] },
  { id: 'tk-u3-10', unit: 'U3', tingkat: 'mudah', jenis: 'lengkapi', kode: 'umur = 17\n___ umur >= 17:\n    print("Boleh")', terima: ['if'], target: 'Boleh' },
  { id: 'tk-u3-11', unit: 'U3', tingkat: 'sedang', jenis: 'keluaran', kode: 'x = 0\nif x:\n    print("Ya")\nelse:\n    print("Tidak")', terima: ['Tidak'] },
  { id: 'tk-u3-12', unit: 'U3', tingkat: 'sedang', jenis: 'lengkapi', kode: 'n = 95\nif n >= 90:\n    print("A")\n___ n >= 80:\n    print("B")\nelse:\n    print("C")', terima: ['elif'], target: 'A' },
  { id: 'tk-u3-13', unit: 'U3', tingkat: 'sedang', jenis: 'cari-salah', kode: 'n = 7\nif n > 5:\nprint("Besar")', terima: ['3'], galat: 'IndentationError' },
  { id: 'tk-u3-14', unit: 'U3', tingkat: 'sulit', jenis: 'keluaran', kode: 'x = 15\nif x % 3 == 0:\n    if x % 5 == 0:\n        print("FizzBuzz")\n    else:\n        print("Fizz")\nelse:\n    print(x)', terima: ['FizzBuzz'] },
  { id: 'tk-u3-15', unit: 'U3', tingkat: 'sulit', jenis: 'keluaran', kode: 'x = 12\nhasil = ""\nif x > 10:\n    hasil = hasil + "A"\nif x > 5:\n    hasil = hasil + "B"\nelse:\n    hasil = hasil + "C"\nprint(hasil)', terima: ['AB'] },
  { id: 'tk-u3-16', unit: 'U3', tingkat: 'mudah', jenis: 'keluaran', kode: 'x = 4\nif x != 4:\n    print("Beda")\nelse:\n    print("Sama")', terima: ['Sama'] },
  { id: 'tk-u3-17', unit: 'U3', tingkat: 'mudah', jenis: 'lengkapi', kode: 'angka = 6\nif angka % 2 ___ 0:\n    print("Genap")\nelse:\n    print("Ganjil")', terima: ['=='], target: 'Genap' },
  { id: 'tk-u3-18', unit: 'U3', tingkat: 'mudah', jenis: 'lengkapi', kode: 'skor = 50\nif skor > 60:\n    print("Lolos")\n___:\n    print("Gagal")', terima: ['else'], target: 'Gagal' },
  { id: 'tk-u3-19', unit: 'U3', tingkat: 'sedang', jenis: 'keluaran', kode: 'a = 3\nb = 3\nif a > b:\n    print("A")\nelif a == b:\n    print("Seri")\nelse:\n    print("B")', terima: ['Seri'] },
  { id: 'tk-u3-20', unit: 'U3', tingkat: 'sulit', jenis: 'lengkapi', kode: 'x = 7\nif x > 5 ___ x % 2 == 0:\n    print("Ya")\nelse:\n    print("Tidak")', terima: ['and'], target: 'Tidak' },
];
