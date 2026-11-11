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
  },
  {
    "id": "lc-u2-11",
    "unit": "U2",
    "judul": "Selisih Umur Kakak Adik",
    "cerita": "Raka ingin tahu berapa tahun selisih umurnya dengan adiknya.\n\nProgram membaca umur kakak lalu umur adik (bilangan bulat, masing-masing satu baris; umur kakak selalu lebih besar), lalu mencetak:\n\nSelisih umur: <selisih> tahun",
    "kodeAwal": "kakak = int(input())\nadik = int(input())\n",
    "contoh": [
      {
        "input": "17\n12",
        "output": "Selisih umur: 5 tahun"
      },
      {
        "input": "9\n8",
        "output": "Selisih umur: 1 tahun"
      }
    ],
    "uji": [
      {
        "input": "30\n1",
        "output": "Selisih umur: 29 tahun"
      },
      {
        "input": "15\n5",
        "output": "Selisih umur: 10 tahun"
      },
      {
        "input": "12\n0",
        "output": "Selisih umur: 12 tahun"
      }
    ]
  },
  {
    "id": "lc-u2-12",
    "unit": "U2",
    "judul": "Luas dan Keliling Taman",
    "cerita": "Sekolah membuat taman berbentuk persegi.\n\nProgram membaca panjang sisi taman (bilangan bulat, dalam meter), lalu mencetak dua baris:\n\nLuas: <sisi pangkat 2>\nKeliling: <4 × sisi>",
    "kodeAwal": "sisi = int(input())\n",
    "contoh": [
      {
        "input": "5",
        "output": "Luas: 25\nKeliling: 20"
      },
      {
        "input": "12",
        "output": "Luas: 144\nKeliling: 48"
      }
    ],
    "uji": [
      {
        "input": "1",
        "output": "Luas: 1\nKeliling: 4"
      },
      {
        "input": "7",
        "output": "Luas: 49\nKeliling: 28"
      },
      {
        "input": "30",
        "output": "Luas: 900\nKeliling: 120"
      }
    ]
  },
  {
    "id": "lc-u2-13",
    "unit": "U2",
    "judul": "Libur Sekolah",
    "cerita": "Libur kenaikan kelas tahun ini cukup panjang. Dinda ingin menyatakannya dalam minggu dan hari.\n\nProgram membaca lama libur dalam hari (bilangan bulat), lalu mencetak:\n\n<minggu> minggu <hari> hari",
    "kodeAwal": "libur = int(input())\n",
    "contoh": [
      {
        "input": "17",
        "output": "2 minggu 3 hari"
      },
      {
        "input": "14",
        "output": "2 minggu 0 hari"
      }
    ],
    "uji": [
      {
        "input": "3",
        "output": "0 minggu 3 hari"
      },
      {
        "input": "0",
        "output": "0 minggu 0 hari"
      },
      {
        "input": "29",
        "output": "4 minggu 1 hari"
      },
      {
        "input": "100",
        "output": "14 minggu 2 hari"
      }
    ]
  },
  {
    "id": "lc-u2-14",
    "unit": "U2",
    "judul": "Kelipatan 3 atau 5",
    "cerita": "Dalam permainan hitung di kelas, murid harus bertepuk tangan bila bilangannya kelipatan 3 atau kelipatan 5.\n\nProgram membaca sebuah bilangan bulat positif, lalu mencetak True bila bilangan itu kelipatan 3 atau kelipatan 5 (atau keduanya), dan False bila bukan.\n\nGunakan % dan or — tanpa if.",
    "kodeAwal": "n = int(input())\n",
    "contoh": [
      {
        "input": "9",
        "output": "True"
      },
      {
        "input": "7",
        "output": "False"
      },
      {
        "input": "10",
        "output": "True"
      }
    ],
    "uji": [
      {
        "input": "15",
        "output": "True"
      },
      {
        "input": "1",
        "output": "False"
      },
      {
        "input": "30",
        "output": "True"
      },
      {
        "input": "22",
        "output": "False"
      },
      {
        "input": "3",
        "output": "True"
      }
    ]
  },
  {
    "id": "lc-u2-15",
    "unit": "U2",
    "judul": "Diskon Persen",
    "cerita": "Toko buku memberi diskon dalam persen. Potongan dihitung dengan harga × persen // 100 (dibulatkan ke bawah).\n\nProgram membaca harga (bilangan bulat) lalu besar diskon dalam persen (bilangan bulat), lalu mencetak dua baris:\n\nPotongan: <potongan>\nBayar: <harga − potongan>",
    "kodeAwal": "harga = int(input())\npersen = int(input())\n",
    "contoh": [
      {
        "input": "50000\n10",
        "output": "Potongan: 5000\nBayar: 45000"
      },
      {
        "input": "35000\n25",
        "output": "Potongan: 8750\nBayar: 26250"
      }
    ],
    "uji": [
      {
        "input": "10000\n0",
        "output": "Potongan: 0\nBayar: 10000"
      },
      {
        "input": "99999\n50",
        "output": "Potongan: 49999\nBayar: 50000"
      },
      {
        "input": "12345\n15",
        "output": "Potongan: 1851\nBayar: 10494"
      },
      {
        "input": "80000\n100",
        "output": "Potongan: 80000\nBayar: 0"
      }
    ]
  },
  {
    "id": "lc-u2-16",
    "unit": "U2",
    "judul": "Poin Klasemen",
    "cerita": "Dalam liga futsal sekolah, menang bernilai 3 poin, seri 1 poin, dan kalah 0 poin.\n\nProgram membaca jumlah menang, jumlah seri, lalu jumlah kalah (bilangan bulat, masing-masing satu baris), lalu mencetak:\n\nPoin: <total poin>",
    "kodeAwal": "menang = int(input())\nseri = int(input())\nkalah = int(input())\n",
    "contoh": [
      {
        "input": "4\n2\n1",
        "output": "Poin: 14"
      },
      {
        "input": "0\n3\n5",
        "output": "Poin: 3"
      }
    ],
    "uji": [
      {
        "input": "0\n0\n0",
        "output": "Poin: 0"
      },
      {
        "input": "10\n0\n0",
        "output": "Poin: 30"
      },
      {
        "input": "2\n5\n3",
        "output": "Poin: 11"
      }
    ]
  },
  {
    "id": "lc-u2-17",
    "unit": "U2",
    "judul": "Ubin Lantai Kelas",
    "cerita": "Lantai kelas berbentuk persegi akan dipasangi ubin berukuran 50 cm × 50 cm. Setiap 1 meter panjang muat 2 ubin.\n\nProgram membaca panjang sisi lantai dalam meter (bilangan bulat), lalu mencetak:\n\nUbin: <banyak ubin yang dibutuhkan>\n\nPetunjuk: banyak ubin satu baris adalah sisi × 2, dan lantainya persegi.",
    "kodeAwal": "sisi = int(input())\n",
    "contoh": [
      {
        "input": "8",
        "output": "Ubin: 256"
      },
      {
        "input": "1",
        "output": "Ubin: 4"
      }
    ],
    "uji": [
      {
        "input": "5",
        "output": "Ubin: 100"
      },
      {
        "input": "10",
        "output": "Ubin: 400"
      },
      {
        "input": "3",
        "output": "Ubin: 36"
      }
    ]
  },
  {
    "id": "lc-u2-18",
    "unit": "U2",
    "judul": "Syarat Beasiswa",
    "cerita": "Murid mendapat beasiswa bila nilai rata-ratanya minimal 90, ATAU bila ia pernah memenangkan setidaknya 1 lomba.\n\nProgram membaca nilai rata-rata (bilangan bulat) lalu jumlah lomba yang pernah dimenangkan (bilangan bulat), lalu mencetak True bila mendapat beasiswa dan False bila tidak.",
    "kodeAwal": "nilai = int(input())\nlomba = int(input())\n",
    "contoh": [
      {
        "input": "92\n0",
        "output": "True"
      },
      {
        "input": "80\n2",
        "output": "True"
      },
      {
        "input": "85\n0",
        "output": "False"
      }
    ],
    "uji": [
      {
        "input": "90\n0",
        "output": "True"
      },
      {
        "input": "89\n1",
        "output": "True"
      },
      {
        "input": "89\n0",
        "output": "False"
      },
      {
        "input": "100\n5",
        "output": "True"
      }
    ]
  },
  {
    "id": "lc-u2-19",
    "unit": "U2",
    "judul": "Target Tabungan",
    "cerita": "Nisa menabung jumlah yang sama setiap hari untuk membeli sepatu.\n\nProgram membaca tabungan per hari, lama menabung dalam hari, lalu harga sepatu (bilangan bulat, masing-masing satu baris). Cetak dua baris:\n\nTotal: <total tabungan>\nCukup: <True bila total minimal sama dengan harga sepatu, False bila kurang>",
    "kodeAwal": "per_hari = int(input())\nhari = int(input())\nharga = int(input())\n",
    "contoh": [
      {
        "input": "5000\n30\n120000",
        "output": "Total: 150000\nCukup: True"
      },
      {
        "input": "2000\n10\n50000",
        "output": "Total: 20000\nCukup: False"
      }
    ],
    "uji": [
      {
        "input": "10000\n10\n100000",
        "output": "Total: 100000\nCukup: True"
      },
      {
        "input": "1000\n99\n100000",
        "output": "Total: 99000\nCukup: False"
      },
      {
        "input": "0\n5\n0",
        "output": "Total: 0\nCukup: True"
      }
    ]
  },
  {
    "id": "lc-u2-20",
    "unit": "U2",
    "judul": "Jam Pulang Sekolah",
    "cerita": "Sekolah dimulai tepat pada jam tertentu (menit ke-0), dan lama belajar ditulis dalam menit.\n\nProgram membaca jam masuk (bilangan bulat, misalnya 7) lalu lama belajar dalam menit (bilangan bulat), lalu mencetak:\n\nPulang pukul <jam> lewat <menit> menit\n\nAnggap sekolah selalu selesai sebelum tengah malam.",
    "kodeAwal": "jam_masuk = int(input())\nlama = int(input())\n",
    "contoh": [
      {
        "input": "7\n450",
        "output": "Pulang pukul 14 lewat 30 menit"
      },
      {
        "input": "13\n120",
        "output": "Pulang pukul 15 lewat 0 menit"
      }
    ],
    "uji": [
      {
        "input": "7\n0",
        "output": "Pulang pukul 7 lewat 0 menit"
      },
      {
        "input": "6\n59",
        "output": "Pulang pukul 6 lewat 59 menit"
      },
      {
        "input": "8\n61",
        "output": "Pulang pukul 9 lewat 1 menit"
      },
      {
        "input": "10\n600",
        "output": "Pulang pukul 20 lewat 0 menit"
      }
    ]
  },
  {
    "id": "lc-u3-11",
    "unit": "U3",
    "judul": "Wujud Air",
    "cerita": "Di laboratorium IPA, wujud air ditentukan oleh suhunya:\n• beku — bila suhunya 0 atau kurang\n• cair — bila suhunya di atas 0 tetapi kurang dari 100\n• uap — bila suhunya 100 atau lebih\n\nProgram membaca suhu (bilangan bulat), lalu mencetak beku, cair, atau uap.",
    "kodeAwal": "suhu = int(input())\n",
    "contoh": [
      {
        "input": "25",
        "output": "cair"
      },
      {
        "input": "-5",
        "output": "beku"
      },
      {
        "input": "120",
        "output": "uap"
      }
    ],
    "uji": [
      {
        "input": "0",
        "output": "beku"
      },
      {
        "input": "1",
        "output": "cair"
      },
      {
        "input": "99",
        "output": "cair"
      },
      {
        "input": "100",
        "output": "uap"
      }
    ]
  },
  {
    "id": "lc-u3-12",
    "unit": "U3",
    "judul": "Boleh Membuat SIM",
    "cerita": "SIM motor baru boleh dibuat pada umur 17 tahun atau lebih.\n\nProgram membaca umur (bilangan bulat). Bila umurnya 17 atau lebih, cetak:\n\nBoleh membuat SIM\n\nBila belum, cetak berapa tahun lagi yang harus ditunggu:\n\nTunggu <17 − umur> tahun lagi",
    "kodeAwal": "umur = int(input())\n",
    "contoh": [
      {
        "input": "18",
        "output": "Boleh membuat SIM"
      },
      {
        "input": "15",
        "output": "Tunggu 2 tahun lagi"
      }
    ],
    "uji": [
      {
        "input": "17",
        "output": "Boleh membuat SIM"
      },
      {
        "input": "16",
        "output": "Tunggu 1 tahun lagi"
      },
      {
        "input": "5",
        "output": "Tunggu 12 tahun lagi"
      },
      {
        "input": "40",
        "output": "Boleh membuat SIM"
      }
    ]
  },
  {
    "id": "lc-u3-13",
    "unit": "U3",
    "judul": "Pemenang Lomba Lari",
    "cerita": "Dua pelari bertanding. Yang waktunya lebih kecil adalah pemenangnya.\n\nProgram membaca waktu pelari 1 lalu waktu pelari 2 (bilangan bulat, dalam detik), lalu mencetak:\n• Pelari 1 menang — bila waktu pelari 1 lebih kecil\n• Pelari 2 menang — bila waktu pelari 2 lebih kecil\n• Seri — bila waktunya sama",
    "kodeAwal": "waktu1 = int(input())\nwaktu2 = int(input())\n",
    "contoh": [
      {
        "input": "12\n14",
        "output": "Pelari 1 menang"
      },
      {
        "input": "15\n11",
        "output": "Pelari 2 menang"
      }
    ],
    "uji": [
      {
        "input": "13\n13",
        "output": "Seri"
      },
      {
        "input": "9\n10",
        "output": "Pelari 1 menang"
      },
      {
        "input": "20\n19",
        "output": "Pelari 2 menang"
      }
    ]
  },
  {
    "id": "lc-u3-14",
    "unit": "U3",
    "judul": "Status Baterai HP",
    "cerita": "Aplikasi kelas menampilkan status baterai HP:\n• Lemah — bila baterai 20% atau kurang\n• Sedang — bila baterai 21% sampai 79%\n• Penuh — bila baterai 80% atau lebih\n\nProgram membaca persentase baterai (bilangan bulat 0 sampai 100), lalu mencetak Lemah, Sedang, atau Penuh.",
    "kodeAwal": "baterai = int(input())\n",
    "contoh": [
      {
        "input": "15",
        "output": "Lemah"
      },
      {
        "input": "50",
        "output": "Sedang"
      },
      {
        "input": "95",
        "output": "Penuh"
      }
    ],
    "uji": [
      {
        "input": "20",
        "output": "Lemah"
      },
      {
        "input": "21",
        "output": "Sedang"
      },
      {
        "input": "79",
        "output": "Sedang"
      },
      {
        "input": "80",
        "output": "Penuh"
      },
      {
        "input": "0",
        "output": "Lemah"
      },
      {
        "input": "100",
        "output": "Penuh"
      }
    ]
  },
  {
    "id": "lc-u3-15",
    "unit": "U3",
    "judul": "Hari Sekolah atau Libur",
    "cerita": "Hari diberi nomor: 1 = Senin, 2 = Selasa, … 5 = Jumat, 6 = Sabtu, 7 = Minggu. Sekolah masuk Senin sampai Jumat.\n\nProgram membaca nomor hari (bilangan bulat), lalu mencetak:\n• Sekolah — untuk nomor 1 sampai 5\n• Libur — untuk nomor 6 atau 7\n• Hari tidak valid — untuk nomor lainnya",
    "kodeAwal": "hari = int(input())\n",
    "contoh": [
      {
        "input": "3",
        "output": "Sekolah"
      },
      {
        "input": "7",
        "output": "Libur"
      },
      {
        "input": "9",
        "output": "Hari tidak valid"
      }
    ],
    "uji": [
      {
        "input": "1",
        "output": "Sekolah"
      },
      {
        "input": "5",
        "output": "Sekolah"
      },
      {
        "input": "6",
        "output": "Libur"
      },
      {
        "input": "0",
        "output": "Hari tidak valid"
      },
      {
        "input": "-2",
        "output": "Hari tidak valid"
      }
    ]
  },
  {
    "id": "lc-u3-16",
    "unit": "U3",
    "judul": "Gratis Ongkir",
    "cerita": "Toko daring menggratiskan ongkos kirim untuk belanja minimal 100000. Belanja di bawah itu dikenai ongkir 15000.\n\nProgram membaca total belanja (bilangan bulat), lalu mencetak dua baris:\n\nOngkir: <ongkos kirim>\nTotal bayar: <belanja + ongkir>",
    "kodeAwal": "belanja = int(input())\n",
    "contoh": [
      {
        "input": "120000",
        "output": "Ongkir: 0\nTotal bayar: 120000"
      },
      {
        "input": "40000",
        "output": "Ongkir: 15000\nTotal bayar: 55000"
      }
    ],
    "uji": [
      {
        "input": "100000",
        "output": "Ongkir: 0\nTotal bayar: 100000"
      },
      {
        "input": "99999",
        "output": "Ongkir: 15000\nTotal bayar: 114999"
      },
      {
        "input": "0",
        "output": "Ongkir: 15000\nTotal bayar: 15000"
      }
    ]
  },
  {
    "id": "lc-u3-17",
    "unit": "U3",
    "judul": "Fizz Buzz",
    "cerita": "Permainan Fizz Buzz di kelas: setiap murid menyebut satu bilangan, tetapi:\n• kelipatan 3 dan 5 sekaligus diganti FizzBuzz\n• kelipatan 3 saja diganti Fizz\n• kelipatan 5 saja diganti Buzz\n• bilangan lain disebut apa adanya\n\nProgram membaca sebuah bilangan bulat positif, lalu mencetak apa yang harus disebut.",
    "kodeAwal": "n = int(input())\n",
    "contoh": [
      {
        "input": "9",
        "output": "Fizz"
      },
      {
        "input": "10",
        "output": "Buzz"
      },
      {
        "input": "15",
        "output": "FizzBuzz"
      },
      {
        "input": "7",
        "output": "7"
      }
    ],
    "uji": [
      {
        "input": "30",
        "output": "FizzBuzz"
      },
      {
        "input": "3",
        "output": "Fizz"
      },
      {
        "input": "5",
        "output": "Buzz"
      },
      {
        "input": "1",
        "output": "1"
      },
      {
        "input": "45",
        "output": "FizzBuzz"
      },
      {
        "input": "22",
        "output": "22"
      }
    ]
  },
  {
    "id": "lc-u3-18",
    "unit": "U3",
    "judul": "Tuntas atau Remedial",
    "cerita": "Nilai ujian yang sah adalah 0 sampai 100. Nilai 75 ke atas dinyatakan tuntas.\n\nProgram membaca nilai (bilangan bulat), lalu mencetak:\n• Nilai tidak valid — bila nilainya di bawah 0 atau di atas 100\n• Tuntas — bila nilainya 75 sampai 100\n• Remedial, kurang <75 − nilai> poin — bila nilainya 0 sampai 74",
    "kodeAwal": "nilai = int(input())\n",
    "contoh": [
      {
        "input": "88",
        "output": "Tuntas"
      },
      {
        "input": "70",
        "output": "Remedial, kurang 5 poin"
      },
      {
        "input": "120",
        "output": "Nilai tidak valid"
      }
    ],
    "uji": [
      {
        "input": "75",
        "output": "Tuntas"
      },
      {
        "input": "74",
        "output": "Remedial, kurang 1 poin"
      },
      {
        "input": "0",
        "output": "Remedial, kurang 75 poin"
      },
      {
        "input": "100",
        "output": "Tuntas"
      },
      {
        "input": "-1",
        "output": "Nilai tidak valid"
      },
      {
        "input": "101",
        "output": "Nilai tidak valid"
      }
    ]
  },
  {
    "id": "lc-u3-19",
    "unit": "U3",
    "judul": "Denda Perpustakaan",
    "cerita": "Perpustakaan sekolah menghitung denda keterlambatan mengembalikan buku:\n• tidak terlambat (0 hari): tidak ada denda\n• terlambat 1 sampai 7 hari: 1000 per hari\n• terlambat lebih dari 7 hari: 7000 untuk 7 hari pertama, ditambah 2000 untuk setiap hari setelahnya\n\nProgram membaca lama keterlambatan dalam hari (bilangan bulat, minimal 0), lalu mencetak:\n\nDenda: <besar denda>",
    "kodeAwal": "terlambat = int(input())\n",
    "contoh": [
      {
        "input": "3",
        "output": "Denda: 3000"
      },
      {
        "input": "10",
        "output": "Denda: 13000"
      }
    ],
    "uji": [
      {
        "input": "0",
        "output": "Denda: 0"
      },
      {
        "input": "1",
        "output": "Denda: 1000"
      },
      {
        "input": "7",
        "output": "Denda: 7000"
      },
      {
        "input": "8",
        "output": "Denda: 9000"
      },
      {
        "input": "30",
        "output": "Denda: 53000"
      }
    ]
  },
  {
    "id": "lc-u3-20",
    "unit": "U3",
    "judul": "Segitiga Siku-siku",
    "cerita": "Sebuah segitiga siku-siku bila kuadrat sisi terpanjang sama dengan jumlah kuadrat dua sisi lainnya (teorema Pythagoras).\n\nProgram membaca tiga sisi segitiga a, b, lalu c (bilangan bulat, masing-masing satu baris). Sisi c selalu yang terpanjang. Cetak siku-siku bila a² + b² = c², dan bukan siku-siku bila tidak.",
    "kodeAwal": "a = int(input())\nb = int(input())\nc = int(input())\n",
    "contoh": [
      {
        "input": "3\n4\n5",
        "output": "siku-siku"
      },
      {
        "input": "4\n5\n6",
        "output": "bukan siku-siku"
      }
    ],
    "uji": [
      {
        "input": "6\n8\n10",
        "output": "siku-siku"
      },
      {
        "input": "5\n12\n13",
        "output": "siku-siku"
      },
      {
        "input": "2\n2\n3",
        "output": "bukan siku-siku"
      },
      {
        "input": "1\n1\n1",
        "output": "bukan siku-siku"
      }
    ]
  }
];

/** Quick quiz di modul materi (tombol di bawah "Buka kuis"), terpisah dari papan Live Coding. */
export const SOAL_KUIS_CEPAT: SoalLiveCoding[] = [
  {
    "id": "kc-u4-01",
    "unit": "U4",
    "judul": "Hitung Mundur Roket",
    "cerita": "Klub sains meluncurkan roket air. Sebelum meluncur, semua menghitung mundur.\n\nProgram membaca sebuah bilangan bulat n (n ≥ 1), lalu mencetak n, n − 1, … sampai 1, satu bilangan per baris. Setelah itu cetak:\n\nMeluncur!",
    "kodeAwal": "n = int(input())\n",
    "contoh": [
      {
        "input": "3",
        "output": "3\n2\n1\nMeluncur!"
      },
      {
        "input": "1",
        "output": "1\nMeluncur!"
      }
    ],
    "uji": [
      {
        "input": "5",
        "output": "5\n4\n3\n2\n1\nMeluncur!"
      },
      {
        "input": "2",
        "output": "2\n1\nMeluncur!"
      },
      {
        "input": "10",
        "output": "10\n9\n8\n7\n6\n5\n4\n3\n2\n1\nMeluncur!"
      }
    ]
  },
  {
    "id": "kc-u4-02",
    "unit": "U4",
    "judul": "Kelipatan Lima",
    "cerita": "Dalam permainan hitung, murid hanya boleh menyebut kelipatan 5.\n\nProgram membaca sebuah bilangan bulat n (n ≥ 5), lalu mencetak semua kelipatan 5 mulai dari 5 sampai n (n termasuk bila n kelipatan 5), satu bilangan per baris.",
    "kodeAwal": "n = int(input())\n",
    "contoh": [
      {
        "input": "20",
        "output": "5\n10\n15\n20"
      },
      {
        "input": "12",
        "output": "5\n10"
      }
    ],
    "uji": [
      {
        "input": "5",
        "output": "5"
      },
      {
        "input": "9",
        "output": "5"
      },
      {
        "input": "35",
        "output": "5\n10\n15\n20\n25\n30\n35"
      }
    ]
  },
  {
    "id": "kc-u4-03",
    "unit": "U4",
    "judul": "Total Belanja Koperasi",
    "cerita": "Kasir koperasi mencatat harga setiap barang yang dibeli satu per satu.\n\nProgram membaca banyak barang n pada baris pertama, lalu n baris berikutnya masing-masing berisi harga satu barang (bilangan bulat). Cetak:\n\nTotal: <jumlah semua harga>",
    "kodeAwal": "n = int(input())\n",
    "contoh": [
      {
        "input": "3\n2000\n3500\n1500",
        "output": "Total: 7000"
      },
      {
        "input": "1\n12000",
        "output": "Total: 12000"
      }
    ],
    "uji": [
      {
        "input": "4\n1000\n1000\n1000\n1000",
        "output": "Total: 4000"
      },
      {
        "input": "2\n0\n5000",
        "output": "Total: 5000"
      },
      {
        "input": "5\n2500\n7000\n1500\n3000\n500",
        "output": "Total: 14500"
      }
    ]
  },
  {
    "id": "kc-u4-04",
    "unit": "U4",
    "judul": "Tebak Angka",
    "cerita": "Komputer menyimpan angka rahasia 7. Murid menebak berkali-kali sampai benar.\n\nProgram terus membaca tebakan (bilangan bulat, satu per baris). Untuk setiap tebakan:\n• cetak Terlalu kecil — bila tebakan lebih kecil dari 7\n• cetak Terlalu besar — bila tebakan lebih besar dari 7\n• bila tebakan sama dengan 7, cetak Benar! Tebakan ke-<urutan tebakan> lalu berhenti",
    "kodeAwal": "rahasia = 7\n",
    "contoh": [
      {
        "input": "3\n9\n7",
        "output": "Terlalu kecil\nTerlalu besar\nBenar! Tebakan ke-3"
      },
      {
        "input": "7",
        "output": "Benar! Tebakan ke-1"
      }
    ],
    "uji": [
      {
        "input": "1\n2\n3\n7",
        "output": "Terlalu kecil\nTerlalu kecil\nTerlalu kecil\nBenar! Tebakan ke-4"
      },
      {
        "input": "10\n8\n7",
        "output": "Terlalu besar\nTerlalu besar\nBenar! Tebakan ke-3"
      },
      {
        "input": "6\n8\n7",
        "output": "Terlalu kecil\nTerlalu besar\nBenar! Tebakan ke-3"
      }
    ]
  },
  {
    "id": "kc-u4-05",
    "unit": "U4",
    "judul": "Banyak Digit",
    "cerita": "Program membaca sebuah bilangan bulat positif n (n ≥ 1), lalu mencetak banyak digitnya:\n\nDigit: <banyak digit>\n\nGunakan while: bagi n dengan 10 (pakai //) berulang-ulang sampai habis, dan hitung berapa kali pembagian dilakukan.",
    "kodeAwal": "n = int(input())\n",
    "contoh": [
      {
        "input": "2026",
        "output": "Digit: 4"
      },
      {
        "input": "7",
        "output": "Digit: 1"
      }
    ],
    "uji": [
      {
        "input": "10",
        "output": "Digit: 2"
      },
      {
        "input": "99",
        "output": "Digit: 2"
      },
      {
        "input": "100000",
        "output": "Digit: 6"
      },
      {
        "input": "1",
        "output": "Digit: 1"
      }
    ]
  }
];
