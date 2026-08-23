---
unit: U6
urut: 1
judul: Mengolah String
pertemuan: Pertemuan 21 · ±1 JP penjelasan + 1 JP latihan
intisari: Teks bisa diambil sebagian, dibalik, dipecah, dan diubah bentuk hurufnya.
poin:
  - Potongan teks[a:b] berhenti sebelum b
  - Akhiran [::-1] membalik teks
  - Method split() memecah kalimat menjadi daftar kata
---

```python jalankan judul="Indexing dan slicing"
teks = "Informatika"
print(teks[0])
print(teks[-1])
print(teks[:5])
print(teks[5:])
print(teks[::-1])
```

Aturannya sama dengan `range()`: batas kedua **tidak ikut**. `teks[:5]` mengambil karakter ke-0 sampai ke-4.

## Method yang paling sering dipakai

```python jalankan judul="Method umum"
nama = "  budi santoso  "
print(nama.strip())
print(nama.strip().title())
print(nama.upper().strip())
print("saya suka python".split())
print("-".join(["a", "b", "c"]))
```

## f-string sekali lagi

```python jalankan judul="Merapikan keluaran"
nama = "Ani"
nilai = 88
print(f"{nama:<10}|{nilai:>5}")
```

:::latihan
Baca satu kata, lalu cetak "Palindrom" bila kata itu sama saja dibaca dari depan maupun belakang.

```python
kata = input()
```

petunjuk: Bandingkan kata dengan kata[::-1] memakai if.
:::
