/**
 * Soal Live Coding — murid menulis program utuh di editor, lalu memeriksanya
 * sendiri. Tidak ada yang dikirim ke server.
 *
 * BERKAS INI DIBUAT OTOMATIS. Setiap keluaran yang diharapkan dihitung dengan
 * menjalankan solusi referensi di Python 3.13 dan diperiksa ulang di Pyodide.
 * Setiap soal juga diuji dengan beberapa solusi lain yang sama-sama benar
 * (harus lulus semua uji) dan beberapa solusi keliru yang wajar (harus gagal
 * minimal satu uji). Solusi referensi tidak disertakan di sini.
 *
 * Uji memang ada di situs: ini latihan di kelas, bukan penilaian. Soal dan
 * kunci ujian tetap hanya di sheet _Bank.
 */

export interface ContohUji { input: string; output: string }

export interface SoalLiveCoding {
  id: string;
  unit: string;
  judul: string;
  /** Soal cerita; baris kosong memisahkan paragraf. */
  cerita: string;
  kodeAwal: string;
  /** Ditampilkan di soal. */
  contoh: ContohUji[];
  /** Tidak ditampilkan; hanya jumlah yang lulus yang diberitahukan. */
  uji: ContohUji[];
}

/** Unit yang sudah punya soal Live Coding. */
export const UNIT_LIVE_CODING = ["U1","U2","U3"];

export const SOAL_LIVE_CODING: SoalLiveCoding[] = [
  {
    "id": "lc-u1-01",
    "unit": "U1",
    "judul": "Sapaan Pagi",
    "cerita": "Setiap pagi, aplikasi absensi kelas menyapa murid yang baru datang.\n\nProgram membaca satu baris berisi nama murid, lalu mencetak sapaan dengan format persis:\n\nHalo, <nama>! Selamat pagi.",
    "kodeAwal": "nama = input()\n",
    "contoh": [
      {
        "input": "Budi",
        "output": "Halo, Budi! Selamat pagi."
      },
      {
        "input": "Siti Aminah",
        "output": "Halo, Siti Aminah! Selamat pagi."
      }
    ],
    "uji": [
      {
        "input": "Ayu",
        "output": "Halo, Ayu! Selamat pagi."
      },
      {
        "input": "Rizky Pratama",
        "output": "Halo, Rizky Pratama! Selamat pagi."
      },
      {
        "input": "X",
        "output": "Halo, X! Selamat pagi."
      }
    ]
  },
  {
    "id": "lc-u1-02",
    "unit": "U1",
    "judul": "Umur Tahun Depan",
    "cerita": "Dina ingin tahu berapa umurnya tahun depan.\n\nProgram membaca umur sekarang (bilangan bulat), lalu mencetak umur tahun depan — angkanya saja.\n\nIngat: hasil input() selalu berupa teks.",
    "kodeAwal": "umur = input()\n",
    "contoh": [
      {
        "input": "15",
        "output": "16"
      },
      {
        "input": "9",
        "output": "10"
      }
    ],
    "uji": [
      {
        "input": "0",
        "output": "1"
      },
      {
        "input": "16",
        "output": "17"
      },
      {
        "input": "99",
        "output": "100"
      },
      {
        "input": "100",
        "output": "101"
      }
    ]
  },
  {
    "id": "lc-u1-03",
    "unit": "U1",
    "judul": "Uang Jajan Seminggu",
    "cerita": "Rafi mendapat uang jajan yang sama besar setiap hari sekolah. Dalam seminggu ada 5 hari sekolah.\n\nProgram membaca uang jajan per hari (bilangan bulat), lalu mencetak total uang jajan Rafi dalam seminggu.",
    "kodeAwal": "jajan = int(input())\n",
    "contoh": [
      {
        "input": "10000",
        "output": "50000"
      },
      {
        "input": "15000",
        "output": "75000"
      }
    ],
    "uji": [
      {
        "input": "0",
        "output": "0"
      },
      {
        "input": "2500",
        "output": "12500"
      },
      {
        "input": "12345",
        "output": "61725"
      }
    ]
  },
  {
    "id": "lc-u1-04",
    "unit": "U1",
    "judul": "Keliling Lapangan",
    "cerita": "Pak guru olahraga meminta murid berlari mengelilingi lapangan berbentuk persegi panjang satu kali.\n\nProgram membaca panjang lalu lebar lapangan (bilangan bulat, dalam meter, masing-masing satu baris), lalu mencetak jarak satu putaran dalam meter.\n\nKeliling = 2 × (panjang + lebar)",
    "kodeAwal": "panjang = int(input())\nlebar = int(input())\n",
    "contoh": [
      {
        "input": "100\n50",
        "output": "300"
      },
      {
        "input": "20\n20",
        "output": "80"
      }
    ],
    "uji": [
      {
        "input": "1\n1",
        "output": "4"
      },
      {
        "input": "90\n45",
        "output": "270"
      },
      {
        "input": "7\n3",
        "output": "20"
      }
    ]
  },
  {
    "id": "lc-u1-05",
    "unit": "U1",
    "judul": "Total Nilai Rapor",
    "cerita": "Nilai akhir sebuah tugas proyek adalah jumlah nilai laporan dan nilai presentasi.\n\nProgram membaca nilai laporan lalu nilai presentasi (bilangan bulat, masing-masing satu baris), lalu mencetak:\n\nTotal nilai: <jumlah kedua nilai>",
    "kodeAwal": "laporan = input()\npresentasi = input()\n",
    "contoh": [
      {
        "input": "80\n90",
        "output": "Total nilai: 170"
      },
      {
        "input": "75\n60",
        "output": "Total nilai: 135"
      }
    ],
    "uji": [
      {
        "input": "0\n0",
        "output": "Total nilai: 0"
      },
      {
        "input": "100\n100",
        "output": "Total nilai: 200"
      },
      {
        "input": "45\n50",
        "output": "Total nilai: 95"
      }
    ]
  },
  {
    "id": "lc-u1-06",
    "unit": "U1",
    "judul": "Kelas Tahun Depan",
    "cerita": "Di akhir tahun ajaran, setiap murid naik satu tingkat tetapi tetap di rombel yang sama.\n\nProgram membaca tingkat sekarang (bilangan bulat, misalnya 10) lalu huruf rombel (misalnya A), lalu mencetak kelas tahun depan dengan format:\n\nKelas <tingkat baru>-<rombel>",
    "kodeAwal": "tingkat = int(input())\nrombel = input()\n",
    "contoh": [
      {
        "input": "10\nA",
        "output": "Kelas 11-A"
      },
      {
        "input": "11\nC",
        "output": "Kelas 12-C"
      }
    ],
    "uji": [
      {
        "input": "7\nB",
        "output": "Kelas 8-B"
      },
      {
        "input": "1\nF",
        "output": "Kelas 2-F"
      },
      {
        "input": "10\nE",
        "output": "Kelas 11-E"
      }
    ]
  },
  {
    "id": "lc-u1-07",
    "unit": "U1",
    "judul": "Rata-rata Dua Ulangan",
    "cerita": "Program membaca dua nilai ulangan (bilangan bulat, masing-masing satu baris), lalu mencetak rata-ratanya.\n\nRata-rata dihitung dengan pembagian biasa /, jadi hasilnya bertipe float — misalnya 80.0 atau 85.5.",
    "kodeAwal": "nilai1 = int(input())\nnilai2 = int(input())\n",
    "contoh": [
      {
        "input": "80\n80",
        "output": "80.0"
      },
      {
        "input": "90\n81",
        "output": "85.5"
      }
    ],
    "uji": [
      {
        "input": "0\n0",
        "output": "0.0"
      },
      {
        "input": "100\n99",
        "output": "99.5"
      },
      {
        "input": "73\n88",
        "output": "80.5"
      },
      {
        "input": "1\n2",
        "output": "1.5"
      }
    ]
  },
  {
    "id": "lc-u1-08",
    "unit": "U1",
    "judul": "Tinggi dalam Meter",
    "cerita": "Data kesehatan sekolah mencatat tinggi badan dalam sentimeter, padahal formulir lomba meminta satuan meter.\n\nProgram membaca tinggi badan dalam cm (bilangan bulat), lalu mencetak tingginya dalam meter.\n\n1 meter = 100 cm. Gunakan pembagian biasa /.",
    "kodeAwal": "cm = int(input())\n",
    "contoh": [
      {
        "input": "165",
        "output": "1.65"
      },
      {
        "input": "170",
        "output": "1.7"
      }
    ],
    "uji": [
      {
        "input": "158",
        "output": "1.58"
      },
      {
        "input": "149",
        "output": "1.49"
      },
      {
        "input": "200",
        "output": "2.0"
      },
      {
        "input": "183",
        "output": "1.83"
      }
    ]
  },
  {
    "id": "lc-u1-09",
    "unit": "U1",
    "judul": "Struk Belanja Koperasi",
    "cerita": "Koperasi sekolah mencetak struk sederhana untuk setiap pembelian.\n\nProgram membaca tiga baris: nama barang, harga satuan (bilangan bulat), dan jumlah yang dibeli (bilangan bulat). Lalu program mencetak dua baris:\n\n<jumlah> x <nama barang>\nTotal: <harga satuan × jumlah>",
    "kodeAwal": "barang = input()\nharga = input()\njumlah = input()\n",
    "contoh": [
      {
        "input": "Pensil\n2000\n3",
        "output": "3 x Pensil\nTotal: 6000"
      },
      {
        "input": "Buku Tulis\n5500\n2",
        "output": "2 x Buku Tulis\nTotal: 11000"
      }
    ],
    "uji": [
      {
        "input": "Penghapus\n1500\n1",
        "output": "1 x Penghapus\nTotal: 1500"
      },
      {
        "input": "Spidol\n8000\n12",
        "output": "12 x Spidol\nTotal: 96000"
      },
      {
        "input": "Penggaris\n3500\n4",
        "output": "4 x Penggaris\nTotal: 14000"
      }
    ]
  },
  {
    "id": "lc-u1-10",
    "unit": "U1",
    "judul": "Termometer Fahrenheit",
    "cerita": "Seorang teman dari Amerika bertanya suhu kota kita dalam derajat Fahrenheit.\n\nProgram membaca suhu dalam Celsius (bilangan bulat), lalu mencetak suhunya dalam Fahrenheit.\n\nF = C × 9 / 5 + 32\n\nKarena ada pembagian /, hasilnya bertipe float, misalnya 77.0.",
    "kodeAwal": "celsius = int(input())\n",
    "contoh": [
      {
        "input": "25",
        "output": "77.0"
      },
      {
        "input": "100",
        "output": "212.0"
      }
    ],
    "uji": [
      {
        "input": "0",
        "output": "32.0"
      },
      {
        "input": "-40",
        "output": "-40.0"
      },
      {
        "input": "30",
        "output": "86.0"
      },
      {
        "input": "-10",
        "output": "14.0"
      },
      {
        "input": "35",
        "output": "95.0"
      }
    ]
  },
  {
    "id": "lc-u2-01",
    "unit": "U2",
    "judul": "Bagi Permen",
    "cerita": "Bu Rina membawa sejumlah permen untuk dibagikan sama rata kepada beberapa anak. Permen yang tidak bisa dibagi rata disimpan kembali.\n\nProgram membaca jumlah permen lalu jumlah anak (bilangan bulat), lalu mencetak dua baris:\n\nTiap anak: <banyak permen untuk setiap anak>\nSisa: <permen yang tersisa>",
    "kodeAwal": "permen = int(input())\nanak = int(input())\n",
    "contoh": [
      {
        "input": "17\n5",
        "output": "Tiap anak: 3\nSisa: 2"
      },
      {
        "input": "20\n4",
        "output": "Tiap anak: 5\nSisa: 0"
      }
    ],
    "uji": [
      {
        "input": "3\n7",
        "output": "Tiap anak: 0\nSisa: 3"
      },
      {
        "input": "100\n9",
        "output": "Tiap anak: 11\nSisa: 1"
      },
      {
        "input": "1\n1",
        "output": "Tiap anak: 1\nSisa: 0"
      }
    ]
  },
  {
    "id": "lc-u2-02",
    "unit": "U2",
    "judul": "Cek Bilangan Genap",
    "cerita": "Program membaca sebuah bilangan bulat, lalu mencetak True bila bilangan itu genap dan False bila ganjil.\n\nCukup satu ekspresi perbandingan dengan operator % — tanpa if.",
    "kodeAwal": "n = int(input())\n",
    "contoh": [
      {
        "input": "8",
        "output": "True"
      },
      {
        "input": "7",
        "output": "False"
      }
    ],
    "uji": [
      {
        "input": "0",
        "output": "True"
      },
      {
        "input": "-3",
        "output": "False"
      },
      {
        "input": "1",
        "output": "False"
      },
      {
        "input": "1000",
        "output": "True"
      }
    ]
  },
  {
    "id": "lc-u2-03",
    "unit": "U2",
    "judul": "Volume Kardus Kubus",
    "cerita": "Gudang sekolah menyimpan buku di kardus berbentuk kubus.\n\nProgram membaca panjang sisi kardus (bilangan bulat, dalam cm), lalu mencetak volumenya dengan format:\n\nVolume: <sisi pangkat 3> cm3\n\nGunakan operator pangkat **.",
    "kodeAwal": "sisi = int(input())\n",
    "contoh": [
      {
        "input": "10",
        "output": "Volume: 1000 cm3"
      },
      {
        "input": "3",
        "output": "Volume: 27 cm3"
      }
    ],
    "uji": [
      {
        "input": "1",
        "output": "Volume: 1 cm3"
      },
      {
        "input": "25",
        "output": "Volume: 15625 cm3"
      },
      {
        "input": "40",
        "output": "Volume: 64000 cm3"
      }
    ]
  },
  {
    "id": "lc-u2-04",
    "unit": "U2",
    "judul": "Kartu Peserta Lomba",
    "cerita": "Panitia lomba coding membuat kartu peserta secara otomatis.\n\nProgram membaca nama peserta, kelas, lalu nomor urut (bilangan bulat), masing-masing satu baris. Cetak satu baris dengan format:\n\nPeserta <nomor>: <nama> (<kelas>)\n\nf-string memudahkan pekerjaan ini.",
    "kodeAwal": "nama = input()\nkelas = input()\nnomor = int(input())\n",
    "contoh": [
      {
        "input": "Budi\nX-A\n7",
        "output": "Peserta 7: Budi (X-A)"
      },
      {
        "input": "Siti Rahma\nXI-B\n12",
        "output": "Peserta 12: Siti Rahma (XI-B)"
      }
    ],
    "uji": [
      {
        "input": "Ayu\nX-E\n1",
        "output": "Peserta 1: Ayu (X-E)"
      },
      {
        "input": "Rizky\nXII-C\n100",
        "output": "Peserta 100: Rizky (XII-C)"
      }
    ]
  },
  {
    "id": "lc-u2-05",
    "unit": "U2",
    "judul": "Lama Menonton Film",
    "cerita": "Aplikasi streaming menulis durasi film dalam menit, padahal penonton lebih mudah membaca jam dan menit.\n\nProgram membaca durasi film dalam menit (bilangan bulat), lalu mencetak:\n\n<jam> jam <menit> menit",
    "kodeAwal": "durasi = int(input())\n",
    "contoh": [
      {
        "input": "135",
        "output": "2 jam 15 menit"
      },
      {
        "input": "60",
        "output": "1 jam 0 menit"
      }
    ],
    "uji": [
      {
        "input": "45",
        "output": "0 jam 45 menit"
      },
      {
        "input": "0",
        "output": "0 jam 0 menit"
      },
      {
        "input": "59",
        "output": "0 jam 59 menit"
      },
      {
        "input": "600",
        "output": "10 jam 0 menit"
      },
      {
        "input": "121",
        "output": "2 jam 1 menit"
      }
    ]
  },
  {
    "id": "lc-u2-06",
    "unit": "U2",
    "judul": "Tiket Wahana Remaja",
    "cerita": "Wahana Roller Coaster Mini hanya boleh dinaiki pengunjung berumur 13 sampai 17 tahun — umur 13 dan 17 termasuk.\n\nProgram membaca umur (bilangan bulat), lalu mencetak True bila boleh naik dan False bila tidak.\n\nGunakan perbandingan berantai atau and — tanpa if.",
    "kodeAwal": "umur = int(input())\n",
    "contoh": [
      {
        "input": "15",
        "output": "True"
      },
      {
        "input": "13",
        "output": "True"
      },
      {
        "input": "20",
        "output": "False"
      }
    ],
    "uji": [
      {
        "input": "17",
        "output": "True"
      },
      {
        "input": "12",
        "output": "False"
      },
      {
        "input": "18",
        "output": "False"
      },
      {
        "input": "0",
        "output": "False"
      }
    ]
  },
  {
    "id": "lc-u2-07",
    "unit": "U2",
    "judul": "Syarat Lulus Praktikum",
    "cerita": "Murid lulus praktikum bila nilai teori minimal 70 DAN nilai praktik minimal 75.\n\nProgram membaca nilai teori lalu nilai praktik (bilangan bulat, masing-masing satu baris), lalu mencetak True bila lulus dan False bila tidak.",
    "kodeAwal": "teori = int(input())\npraktik = int(input())\n",
    "contoh": [
      {
        "input": "80\n90",
        "output": "True"
      },
      {
        "input": "95\n60",
        "output": "False"
      }
    ],
    "uji": [
      {
        "input": "70\n75",
        "output": "True"
      },
      {
        "input": "69\n100",
        "output": "False"
      },
      {
        "input": "100\n74",
        "output": "False"
      },
      {
        "input": "50\n50",
        "output": "False"
      }
    ]
  },
  {
    "id": "lc-u2-08",
    "unit": "U2",
    "judul": "Jumlah Digit",
    "cerita": "Program membaca sebuah bilangan bulat tiga digit (100 sampai 999), lalu mencetak jumlah ketiga digitnya.\n\nContohnya 456 → 4 + 5 + 6 = 15.\n\nGunakan // dan %.",
    "kodeAwal": "n = int(input())\n",
    "contoh": [
      {
        "input": "456",
        "output": "15"
      },
      {
        "input": "100",
        "output": "1"
      }
    ],
    "uji": [
      {
        "input": "999",
        "output": "27"
      },
      {
        "input": "307",
        "output": "10"
      },
      {
        "input": "810",
        "output": "9"
      },
      {
        "input": "123",
        "output": "6"
      }
    ]
  },
  {
    "id": "lc-u2-09",
    "unit": "U2",
    "judul": "Tukar Uang Pecahan",
    "cerita": "Kasir kantin ingin menukar uang dengan lembar sesedikit mungkin, memakai pecahan 50000, 20000, dan 10000. Mulailah dari pecahan terbesar.\n\nProgram membaca jumlah uang (bilangan bulat), lalu mencetak empat baris:\n\n50000: <banyak lembar>\n20000: <banyak lembar>\n10000: <banyak lembar>\nSisa: <uang yang tidak bisa ditukar>",
    "kodeAwal": "uang = int(input())\n",
    "contoh": [
      {
        "input": "135000",
        "output": "50000: 2\n20000: 1\n10000: 1\nSisa: 5000"
      },
      {
        "input": "70000",
        "output": "50000: 1\n20000: 1\n10000: 0\nSisa: 0"
      }
    ],
    "uji": [
      {
        "input": "5000",
        "output": "50000: 0\n20000: 0\n10000: 0\nSisa: 5000"
      },
      {
        "input": "200000",
        "output": "50000: 4\n20000: 0\n10000: 0\nSisa: 0"
      },
      {
        "input": "99999",
        "output": "50000: 1\n20000: 2\n10000: 0\nSisa: 9999"
      },
      {
        "input": "30000",
        "output": "50000: 0\n20000: 1\n10000: 1\nSisa: 0"
      }
    ]
  },
  {
    "id": "lc-u2-10",
    "unit": "U2",
    "judul": "Ongkos Kirim per Kilogram",
    "cerita": "Jasa pengiriman memungut 9000 untuk setiap kilogram yang dimulai: 1 sampai 1000 gram dihitung 1 kg, 1001 sampai 2000 gram dihitung 2 kg, dan seterusnya.\n\nProgram membaca berat paket dalam gram (bilangan bulat, minimal 1), lalu mencetak:\n\nOngkir: <ongkos kirim>\n\nSelesaikan hanya dengan operator aritmetika — tanpa if.",
    "kodeAwal": "berat = int(input())\n",
    "contoh": [
      {
        "input": "2500",
        "output": "Ongkir: 27000"
      },
      {
        "input": "1000",
        "output": "Ongkir: 9000"
      }
    ],
    "uji": [
      {
        "input": "1",
        "output": "Ongkir: 9000"
      },
      {
        "input": "1001",
        "output": "Ongkir: 18000"
      },
      {
        "input": "2000",
        "output": "Ongkir: 18000"
      },
      {
        "input": "999",
        "output": "Ongkir: 9000"
      },
      {
        "input": "10000",
        "output": "Ongkir: 90000"
      }
    ]
  },
  {
    "id": "lc-u3-01",
    "unit": "U3",
    "judul": "Lulus atau Remedial",
    "cerita": "KKM mata pelajaran KKA adalah 75.\n\nProgram membaca nilai (bilangan bulat). Bila nilainya 75 atau lebih, cetak LULUS. Bila kurang dari 75, cetak REMEDIAL.",
    "kodeAwal": "nilai = int(input())\n",
    "contoh": [
      {
        "input": "80",
        "output": "LULUS"
      },
      {
        "input": "74",
        "output": "REMEDIAL"
      }
    ],
    "uji": [
      {
        "input": "75",
        "output": "LULUS"
      },
      {
        "input": "0",
        "output": "REMEDIAL"
      },
      {
        "input": "100",
        "output": "LULUS"
      },
      {
        "input": "60",
        "output": "REMEDIAL"
      }
    ]
  },
  {
    "id": "lc-u3-02",
    "unit": "U3",
    "judul": "Baris Kiri atau Kanan",
    "cerita": "Untuk praktik berpasangan, murid bernomor absen genap duduk di baris kiri, sedangkan murid bernomor absen ganjil duduk di baris kanan.\n\nProgram membaca nomor absen (bilangan bulat positif), lalu mencetak kiri atau kanan.",
    "kodeAwal": "absen = int(input())\n",
    "contoh": [
      {
        "input": "4",
        "output": "kiri"
      },
      {
        "input": "7",
        "output": "kanan"
      }
    ],
    "uji": [
      {
        "input": "1",
        "output": "kanan"
      },
      {
        "input": "2",
        "output": "kiri"
      },
      {
        "input": "36",
        "output": "kiri"
      },
      {
        "input": "35",
        "output": "kanan"
      }
    ]
  },
  {
    "id": "lc-u3-03",
    "unit": "U3",
    "judul": "Cek Suhu Badan",
    "cerita": "Petugas UKS memeriksa suhu badan murid di gerbang sekolah. Suhu 37.5 atau lebih dianggap demam.\n\nProgram membaca suhu badan (bilangan desimal, misalnya 36.8), lalu mencetak Demam atau Normal.",
    "kodeAwal": "suhu = float(input())\n",
    "contoh": [
      {
        "input": "36.8",
        "output": "Normal"
      },
      {
        "input": "38.2",
        "output": "Demam"
      }
    ],
    "uji": [
      {
        "input": "37.5",
        "output": "Demam"
      },
      {
        "input": "37.4",
        "output": "Normal"
      },
      {
        "input": "40",
        "output": "Demam"
      },
      {
        "input": "35",
        "output": "Normal"
      }
    ]
  },
  {
    "id": "lc-u3-04",
    "unit": "U3",
    "judul": "Harga Tiket Museum",
    "cerita": "Harga tiket museum ditentukan oleh umur pengunjung:\n• di bawah 5 tahun: 0 (gratis)\n• 5 sampai 12 tahun: 15000\n• 13 sampai 59 tahun: 25000\n• 60 tahun ke atas: 10000\n\nProgram membaca umur (bilangan bulat), lalu mencetak:\n\nHarga: <harga tiket>",
    "kodeAwal": "umur = int(input())\n",
    "contoh": [
      {
        "input": "8",
        "output": "Harga: 15000"
      },
      {
        "input": "30",
        "output": "Harga: 25000"
      },
      {
        "input": "3",
        "output": "Harga: 0"
      }
    ],
    "uji": [
      {
        "input": "4",
        "output": "Harga: 0"
      },
      {
        "input": "5",
        "output": "Harga: 15000"
      },
      {
        "input": "12",
        "output": "Harga: 15000"
      },
      {
        "input": "13",
        "output": "Harga: 25000"
      },
      {
        "input": "59",
        "output": "Harga: 25000"
      },
      {
        "input": "60",
        "output": "Harga: 10000"
      },
      {
        "input": "75",
        "output": "Harga: 10000"
      }
    ]
  },
  {
    "id": "lc-u3-05",
    "unit": "U3",
    "judul": "Promo Kantin",
    "cerita": "Kantin sedang promo: setiap belanja minimal 50000 mendapat potongan 5000. Belanja di bawah 50000 tidak mendapat potongan.\n\nProgram membaca total belanja (bilangan bulat), lalu mencetak dua baris:\n\nPotongan: <potongan>\nBayar: <total belanja setelah potongan>",
    "kodeAwal": "belanja = int(input())\n",
    "contoh": [
      {
        "input": "60000",
        "output": "Potongan: 5000\nBayar: 55000"
      },
      {
        "input": "20000",
        "output": "Potongan: 0\nBayar: 20000"
      }
    ],
    "uji": [
      {
        "input": "50000",
        "output": "Potongan: 5000\nBayar: 45000"
      },
      {
        "input": "49999",
        "output": "Potongan: 0\nBayar: 49999"
      },
      {
        "input": "0",
        "output": "Potongan: 0\nBayar: 0"
      },
      {
        "input": "125000",
        "output": "Potongan: 5000\nBayar: 120000"
      }
    ]
  },
  {
    "id": "lc-u3-06",
    "unit": "U3",
    "judul": "Jenis Segitiga",
    "cerita": "Program membaca panjang tiga sisi segitiga (bilangan bulat, masing-masing satu baris), lalu mencetak jenisnya:\n• sama sisi — bila ketiga sisinya sama panjang\n• sama kaki — bila tepat dua sisinya sama panjang (sisi mana pun)\n• sembarang — bila tidak ada sisi yang sama panjang",
    "kodeAwal": "a = int(input())\nb = int(input())\nc = int(input())\n",
    "contoh": [
      {
        "input": "5\n5\n5",
        "output": "sama sisi"
      },
      {
        "input": "4\n9\n4",
        "output": "sama kaki"
      },
      {
        "input": "3\n4\n5",
        "output": "sembarang"
      }
    ],
    "uji": [
      {
        "input": "5\n5\n8",
        "output": "sama kaki"
      },
      {
        "input": "2\n9\n9",
        "output": "sama kaki"
      },
      {
        "input": "10\n11\n12",
        "output": "sembarang"
      },
      {
        "input": "6\n6\n6",
        "output": "sama sisi"
      }
    ]
  },
  {
    "id": "lc-u3-07",
    "unit": "U3",
    "judul": "Letak Titik",
    "cerita": "Program membaca koordinat x lalu y sebuah titik (bilangan bulat, masing-masing satu baris), lalu mencetak letaknya:\n• Pusat — bila x dan y sama-sama 0\n• Sumbu — bila hanya salah satunya 0\n• Kuadran I — bila x > 0 dan y > 0\n• Kuadran II — bila x < 0 dan y > 0\n• Kuadran III — bila x < 0 dan y < 0\n• Kuadran IV — bila x > 0 dan y < 0",
    "kodeAwal": "x = int(input())\ny = int(input())\n",
    "contoh": [
      {
        "input": "3\n4",
        "output": "Kuadran I"
      },
      {
        "input": "-2\n-5",
        "output": "Kuadran III"
      },
      {
        "input": "0\n7",
        "output": "Sumbu"
      }
    ],
    "uji": [
      {
        "input": "-1\n1",
        "output": "Kuadran II"
      },
      {
        "input": "5\n-5",
        "output": "Kuadran IV"
      },
      {
        "input": "0\n0",
        "output": "Pusat"
      },
      {
        "input": "-3\n0",
        "output": "Sumbu"
      }
    ]
  },
  {
    "id": "lc-u3-08",
    "unit": "U3",
    "judul": "Login Aplikasi Kelas",
    "cerita": "Aplikasi kelas hanya punya satu akun: username admin dengan password kka2026. Huruf besar dan kecil dibedakan.\n\nProgram membaca username lalu password (masing-masing satu baris), lalu mencetak:\n• User tidak dikenal — bila username bukan admin\n• Selamat datang, admin! — bila username dan password benar\n• Password salah — bila username benar tetapi password salah",
    "kodeAwal": "username = input()\npassword = input()\n",
    "contoh": [
      {
        "input": "admin\nkka2026",
        "output": "Selamat datang, admin!"
      },
      {
        "input": "admin\n12345",
        "output": "Password salah"
      },
      {
        "input": "budi\nkka2026",
        "output": "User tidak dikenal"
      }
    ],
    "uji": [
      {
        "input": "Admin\nkka2026",
        "output": "User tidak dikenal"
      },
      {
        "input": "admin\nKKA2026",
        "output": "Password salah"
      },
      {
        "input": "guru\nsalah",
        "output": "User tidak dikenal"
      }
    ]
  },
  {
    "id": "lc-u3-09",
    "unit": "U3",
    "judul": "Tarif Ojek Daring",
    "cerita": "Tarif ojek daring dihitung seperti ini:\n• 2 km pertama: 8000 (jarak 1 atau 2 km tetap 8000)\n• setiap km setelah 2 km pertama: tambah 2500 per km\n• perjalanan malam — berangkat pukul 22 ke atas atau sebelum pukul 5 — kena tambahan 5000\n\nProgram membaca jarak (bilangan bulat, km, minimal 1) lalu jam berangkat (bilangan bulat 0 sampai 23), lalu mencetak:\n\nTarif: <total tarif>",
    "kodeAwal": "jarak = int(input())\njam = int(input())\n",
    "contoh": [
      {
        "input": "5\n10",
        "output": "Tarif: 15500"
      },
      {
        "input": "2\n23",
        "output": "Tarif: 13000"
      }
    ],
    "uji": [
      {
        "input": "1\n12",
        "output": "Tarif: 8000"
      },
      {
        "input": "3\n22",
        "output": "Tarif: 15500"
      },
      {
        "input": "10\n4",
        "output": "Tarif: 33000"
      },
      {
        "input": "10\n5",
        "output": "Tarif: 28000"
      },
      {
        "input": "4\n21",
        "output": "Tarif: 13000"
      },
      {
        "input": "2\n0",
        "output": "Tarif: 13000"
      }
    ]
  },
  {
    "id": "lc-u3-10",
    "unit": "U3",
    "judul": "Mesin Minuman",
    "cerita": "Mesin minuman sekolah menjual tiga pilihan:\n1 = Air mineral, 4000\n2 = Teh kotak, 6000\n3 = Susu, 8000\n\nProgram membaca nomor pilihan lalu uang yang dimasukkan (bilangan bulat, masing-masing satu baris), lalu mencetak:\n• Pilihan tidak ada — bila nomornya bukan 1, 2, atau 3\n• Uang kurang — bila uangnya tidak cukup\n• Kembalian: <sisa uang> — bila uangnya cukup (uang pas berarti kembaliannya 0)",
    "kodeAwal": "pilihan = int(input())\nuang = int(input())\n",
    "contoh": [
      {
        "input": "2\n10000",
        "output": "Kembalian: 4000"
      },
      {
        "input": "3\n5000",
        "output": "Uang kurang"
      },
      {
        "input": "7\n10000",
        "output": "Pilihan tidak ada"
      }
    ],
    "uji": [
      {
        "input": "1\n4000",
        "output": "Kembalian: 0"
      },
      {
        "input": "3\n7999",
        "output": "Uang kurang"
      },
      {
        "input": "0\n0",
        "output": "Pilihan tidak ada"
      },
      {
        "input": "2\n6000",
        "output": "Kembalian: 0"
      },
      {
        "input": "1\n20000",
        "output": "Kembalian: 16000"
      }
    ]
  }
];
