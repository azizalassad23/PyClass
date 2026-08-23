---
unit: U2
urut: 2
judul: Operator Aritmetika
pertemuan: Pertemuan 5 · ±1 JP penjelasan + 1 JP latihan
intisari: Selain +, -, *, dan /, Python punya // untuk bagi bulat, % untuk sisa, dan ** untuk pangkat.
poin:
  - / selalu menghasilkan float
  - // membuang bagian desimalnya
  - "% memberi sisa pembagian — kunci untuk ganjil-genap"
---

| Operator | Arti | Contoh | Hasil |
| --- | --- | --- | --- |
| `+` `-` `*` | tambah, kurang, kali | `7 * 3` | `21` |
| `/` | bagi (selalu desimal) | `7 / 2` | `3.5` |
| `//` | bagi bulat | `7 // 2` | `3` |
| `%` | sisa bagi | `7 % 2` | `1` |
| `**` | pangkat | `2 ** 5` | `32` |

```python jalankan judul="Membandingkan / dengan //"
print(7 / 2)
print(7 // 2)
print(7 % 2)
```

## % dipakai lebih sering daripada dugaan

Sisa bagi menjawab pertanyaan "habis dibagi berapa?". Bilangan genap adalah bilangan yang `n % 2` bernilai `0`. Kelipatan tiga adalah yang `n % 3` bernilai `0`.

```python jalankan judul="Sisa bagi untuk memecah waktu"
detik = 3661
print(detik // 3600, "jam")
print(detik % 3600 // 60, "menit")
print(detik % 60, "detik")
```

## Urutan pengerjaan

Sama seperti di matematika: pangkat lebih dulu, lalu kali/bagi, baru tambah/kurang. Bila ragu, pakai tanda kurung — kode yang jelas lebih berharga daripada kode yang pendek.

```python jalankan judul="Kurung mengubah hasil"
print(2 + 3 * 4)
print((2 + 3) * 4)
```

:::latihan
Baca sebuah bilangan detik, lalu cetak berapa menit dan berapa sisa detiknya.

```python
detik = int(input())
```

petunjuk: Menit adalah detik // 60, sisanya detik % 60.
:::
