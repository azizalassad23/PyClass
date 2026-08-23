---
unit: U2
urut: 1
judul: input() dan print()
pertemuan: Pertemuan 4 · ±1 JP penjelasan + 1 JP latihan
intisari: print() mengeluarkan data ke layar, input() memasukkan data dari pengguna.
poin:
  - input() selalu mengembalikan teks
  - print() bisa menerima beberapa nilai sekaligus
  - f-string menyatukan teks dan variabel dengan rapi
---

Sebuah program menjadi berguna ketika bisa menerima data dari luar dan menampilkan hasilnya. Dua fungsi ini yang mengurusnya.

```python jalankan judul="Meminta nama lalu menyapa"
nama = input("Siapa namamu? ")
print("Halo,", nama)
```

Jalankan contoh di atas — panel keluaran akan meminta satu baris masukan. Ketik nama, tekan Enter, dan program melanjutkan.

## print() menerima banyak nilai

Nilai yang dipisahkan koma dicetak berurutan dengan satu spasi di antaranya.

```python jalankan judul="Beberapa nilai dalam satu print"
nama = "Ani"
umur = 15
print(nama, "berumur", umur, "tahun")
```

## f-string — cara paling rapi

Menaruh huruf `f` sebelum tanda kutip membuat Python mengganti isi `{...}` dengan nilai variabelnya. Ini jauh lebih terbaca daripada menyambung dengan `+`, dan tidak memerlukan `str()`.

```python jalankan judul="Menyusun kalimat dengan f-string"
nama = "Budi"
nilai = 88
print(f"{nama} memperoleh nilai {nilai}.")
```

## Membaca angka

Karena `input()` menghasilkan teks, bungkuslah dengan `int()` bila yang diminta adalah bilangan.

```python jalankan judul="Membaca bilangan dari pengguna"
umur = int(input("Umur: "))
print(f"Tahun depan umurmu {umur + 1}.")
```

:::latihan
Minta dua bilangan dari pengguna, lalu cetak hasil penjumlahannya dengan f-string.

```python
a = int(input())
b = 
```

petunjuk: Baca b dengan cara yang sama seperti a, lalu print(f"{a} + {b} = {a + b}").
:::
