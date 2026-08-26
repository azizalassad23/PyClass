---
unit: U1
urut: 4
judul: Membaca Pesan Error
pertemuan: Pertemuan 3 · ±1 JP · dipakai seterusnya sampai akhir semester
intisari: Error bukan tanda kamu gagal. Itu Python sedang memberi tahu letak masalahnya.
poin:
  - Baca baris paling bawah lebih dulu
  - Cari nomor barisnya
  - Namanya sudah menyebut jenis masalahnya
---

Semua orang yang menulis program bertemu error — termasuk programmer yang sudah bekerja bertahun-tahun. Bedanya, mereka **membaca** pesannya; pemula sering langsung panik dan menghapus semuanya.

> **Ubah cara pandangnya.** Tulisan merah itu bukan hukuman. Itu Python berkata: "Saya berhenti di sini, dan ini alasannya." Hampir selalu, pesannya sudah memberi tahu apa yang harus diperbaiki.

## Anatomi sebuah error

Jalankan kode di bawah ini. Kode ini **sengaja salah** — perhatikan pesan yang muncul.

```python jalankan judul="Sengaja salah — perhatikan pesannya"
nilai = 10
print(nilai + teks)
```

Ada dua hal yang selalu perlu kamu cari:

1. **Baris paling bawah** — memuat *jenis* error dan penjelasan singkatnya. Pada contoh di atas: `NameError: name 'teks' is not defined`.
2. **Nomor baris** — memberi tahu *di mana* Python berhenti. Cari tulisan `line 2`.

Jadi terjemahannya: "di baris 2, ada nama `teks` yang belum pernah saya lihat."

Di aplikasi ini, setiap error juga diterjemahkan ke bahasa Indonesia dengan saran perbaikan. Pesan asli Python tetap bisa dibuka lewat **Pesan asli dari Python** — biasakan sesekali membacanya, karena di dunia nyata itulah satu-satunya yang akan kamu temui.

## Lima error yang paling sering muncul

| Tulisan Python | Artinya | Yang biasanya perlu diperbaiki |
| --- | --- | --- |
| `SyntaxError` | Cara penulisannya belum benar | Titik dua yang hilang, kurung belum ditutup, `=` dipakai untuk membandingkan |
| `NameError` | Nama belum dikenal | Salah ketik nama variabel, atau dipakai sebelum dibuat |
| `TypeError` | Tipe data tidak cocok | Menjumlahkan teks dengan angka tanpa `int()` |
| `ValueError` | Nilainya tidak masuk akal untuk operasi itu | `int("dua")` — teks itu bukan tulisan angka |
| `IndentationError` | Jarak menjorok salah | Baris di dalam `if` belum masuk 4 spasi |

Perhatikan pola namanya: **Syntax** soal penulisan, **Name** soal nama, **Type** soal tipe, **Value** soal nilai. Namanya sendiri sudah setengah jawaban.

## Coba satu lagi

```python jalankan judul="Error yang lain — tebak dulu sebelum menjalankan"
umur = input("Umur: ")
print(umur + 1)
```

Sebelum menekan Jalankan, tebak: menurutmu apa yang akan terjadi? Setelah itu jalankan dan cocokkan tebakanmu dengan pesannya.

## Tiga langkah saat bertemu error

1. **Jangan hapus apa pun dulu.** Baca baris paling bawah.
2. **Buka baris yang disebut.** Masalahnya ada di sana, atau tepat di baris sebelumnya.
3. **Perbaiki satu hal, lalu jalankan lagi.** Jangan mengubah lima tempat sekaligus — kalau muncul error baru, kamu tidak akan tahu penyebabnya yang mana.

:::latihan
Perbaiki program di bawah supaya mencetak `15`. Ada satu kesalahan. Jalankan dulu, baca pesannya, baru perbaiki.

```python
a = "10"
b = 5
print(a + b)
```

petunjuk: Pesannya menyebut TypeError. Ubah a menjadi bilangan dengan int(a) sebelum dijumlahkan.
:::
