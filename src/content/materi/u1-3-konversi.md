---
unit: U1
urut: 3
judul: Konversi Tipe Data
pertemuan: Pertemuan 3 · ±1 JP penjelasan + 1 JP latihan · ditutup Kuis U1
intisari: int(), float(), dan str() mengubah nilai dari satu tipe ke tipe lain.
poin:
  - Hasil input() selalu berupa teks
  - int() dan float() mengubah teks menjadi bilangan
  - str() mengubah bilangan menjadi teks
---

Sering kita punya data bertipe A tetapi butuh tipe B. Python menyediakan fungsi konversi: `int()`, `float()`, dan `str()`.

```python jalankan judul="Tiga fungsi konversi"
teks = "42"
angka = int(teks)
print(angka + 8)

pecahan = float("3.5")
print(pecahan * 2)

print("Nilai: " + str(90))
```

## Kesalahan paling sering di kelas

Segala sesuatu yang datang dari `input()` **selalu bertipe `str`**, walaupun murid mengetik angka. Menjumlahkannya tanpa konversi menghasilkan penyambungan teks, bukan penjumlahan.

```python jalankan judul="Lupa mengubah tipe"
a = "10"
b = "5"
print(a + b)
print(int(a) + int(b))
```

Baris pertama mencetak `105` — dua teks disambung. Baris kedua barulah menghitung `15`.

## Konversi yang tidak mungkin

`int("dua")` gagal, karena `"dua"` bukan tulisan angka. Python menghentikan program dengan `ValueError`. Ini wajar dan bukan tanda komputer rusak — pesannya justru memberi tahu bagian mana yang bermasalah.

:::latihan
Ubah teks `"2024"` menjadi bilangan, tambahkan 1, lalu cetak hasilnya.

```python
tahun = "2024"
```

petunjuk: Bungkus tahun dengan int() sebelum menambahkannya dengan 1.
:::
