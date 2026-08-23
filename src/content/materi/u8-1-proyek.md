---
unit: U8
urut: 1
judul: Proyek Mini — Panduan & Rubrik
pertemuan: Pertemuan 27–29 · dinilai dengan rubrik, bukan test case
intisari: Satu program utuh yang menggabungkan seluruh materi semester ini.
poin:
  - Pilih satu dari tiga judul
  - Dikerjakan tiga pertemuan
  - Dinilai rubrik, bukan test otomatis
---

Berbeda dari unit sebelumnya, Unit 8 **tidak memiliki kuis ber-auto-grading**. Penilaiannya memakai rubrik karena yang dinilai adalah rancangan programnya, bukan kecocokan keluaran.

## Pilih satu judul

1. **Kalkulator sederhana** — menu operasi, membaca dua bilangan, mengulang sampai pengguna memilih keluar.
2. **Rekap nilai kelas** — memasukkan nama dan nilai beberapa murid, lalu menampilkan rata-rata, tertinggi, dan terendah.
3. **Tebak angka** — komputer memilih bilangan, pengguna menebak, program memberi petunjuk "terlalu besar" atau "terlalu kecil".

## Rubrik penilaian

| Aspek | Bobot | Yang dinilai |
| --- | --- | --- |
| Program berjalan | 30 | Tidak error saat dijalankan dari awal sampai selesai |
| Kelengkapan fitur | 25 | Semua yang diminta pada judul terpenuhi |
| Penggunaan materi | 20 | Memakai percabangan, perulangan, koleksi data, dan fungsi |
| Keterbacaan | 15 | Nama variabel jelas, ada komentar seperlunya, indentasi rapi |
| Penanganan masukan keliru | 10 | Program tidak berhenti mendadak saat masukan tidak sesuai |

## Ketentuan pengumpulan

Kode dikumpulkan dalam bentuk berkas `.py` melalui tautan yang dibagikan guru pada pertemuan 27. Perkenalkan programmu dalam 3 menit di pertemuan 29.

```python jalankan judul="Kerangka menu kalkulator"
print("1. Tambah")
print("2. Kurang")
pilihan = input("Pilih menu: ")
a = int(input("Bilangan pertama: "))
b = int(input("Bilangan kedua: "))
if pilihan == "1":
    print(a + b)
elif pilihan == "2":
    print(a - b)
else:
    print("Menu tidak dikenal")
```
