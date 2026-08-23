---
unit: U7
urut: 1
judul: Membuat Fungsi Sendiri
pertemuan: Pertemuan 24 · ±1 JP penjelasan + 1 JP latihan
intisari: def membungkus sekumpulan baris menjadi satu perintah bernama yang bisa dipanggil berulang.
poin:
  - Parameter adalah data yang masuk
  - return adalah hasil yang keluar
  - Variabel di dalam fungsi tidak terlihat dari luar
---

```python jalankan judul="Fungsi pertama"
def sapa(nama):
    print(f"Halo, {nama}!")

sapa("Ani")
sapa("Budi")
```

## return — mengembalikan hasil

`print()` menampilkan ke layar; `return` menyerahkan nilai kembali ke pemanggilnya sehingga bisa dihitung lagi. Keduanya berbeda, dan tertukarnya keduanya adalah kesalahan khas di unit ini.

```python jalankan judul="print versus return"
def luas(alas, tinggi):
    return alas * tinggi // 2

hasil = luas(10, 4)
print(hasil)
print(luas(7, 3) + luas(2, 2))
```

## Scope — jangkauan variabel

```python jalankan judul="Variabel lokal"
def hitung():
    angka = 99
    print("di dalam:", angka)

angka = 1
hitung()
print("di luar:", angka)
```

Variabel `angka` di dalam fungsi adalah variabel yang berbeda dari `angka` di luar. Fungsi tidak mengubah keadaan program di luarnya kecuali kita memintanya secara sengaja — inilah yang membuat fungsi aman dipakai ulang.

:::latihan
Buat fungsi `km_ke_meter(km)` yang mengembalikan jarak dalam meter, lalu cetak hasilnya untuk masukan pengguna.

```python
def km_ke_meter(km):
    pass
```

petunjuk: Ganti pass dengan return km * 1000, lalu panggil print(km_ke_meter(int(input()))).
:::
