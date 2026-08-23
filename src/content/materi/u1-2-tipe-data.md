---
unit: U1
urut: 2
judul: Tipe Data Dasar
pertemuan: Pertemuan 2 · ±1 JP penjelasan + 1 JP latihan
intisari: Setiap nilai punya tipe, dan tipenya menentukan operasi apa saja yang boleh dilakukan.
poin:
  - int untuk bilangan bulat, float untuk desimal
  - str untuk teks, bool untuk benar/salah
  - type() memberi tahu tipe sebuah nilai
---

Python membedakan jenis data yang disimpan. Empat tipe yang dipakai sepanjang semester ini:

| Tipe | Untuk apa | Contoh |
| --- | --- | --- |
| `int` | bilangan bulat | `15`, `-3`, `0` |
| `float` | bilangan desimal | `3.14`, `-0.5` |
| `str` | teks | `"Ani"`, `'X'` |
| `bool` | benar atau salah | `True`, `False` |

```python jalankan judul="Memeriksa tipe dengan type()"
print(type(15))
print(type(3.14))
print(type("Ani"))
print(type(True))
```

## Tipe menentukan arti operator

Operator yang sama bisa berarti lain tergantung tipenya. `+` menjumlahkan bilangan, tetapi **menyambung** teks.

```python jalankan judul="Satu operator, dua arti"
print(3 + 4)
print("3" + "4")
```

Karena itu menggabungkan teks dengan bilangan langsung akan gagal — Python tidak menebak maksud kita. Cara menyatukannya dibahas di halaman berikutnya.

## Teks dengan kutip satu atau dua

`"Ani"` dan `'Ani'` sama saja. Yang penting: pembuka dan penutupnya sejenis. Kutip yang berbeda berguna saat teksnya sendiri mengandung tanda kutip.

```python jalankan judul="Memilih tanda kutip"
print("Kata dia: 'selamat pagi'")
print('Judulnya "Pemrograman Dasar"')
```

:::latihan
Cetak tipe dari nilai `7`, `7.0`, dan `"7"` sehingga terlihat bedanya.

```python
print(type(7))
```

petunjuk: Panggil type() tiga kali dengan nilai yang berbeda, masing-masing di dalam print().
:::
