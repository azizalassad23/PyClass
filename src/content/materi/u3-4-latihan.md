---
unit: U3
urut: 4
judul: Latihan Mandiri Unit 3
pertemuan: Pertemuan 10 · latihan penuh · ditutup Kuis U3
intisari: Empat soal untuk memantapkan if, elif, else, dan percabangan bersarang.
poin:
  - Tidak dinilai dan tidak dikirim ke mana pun
  - Kerjakan berurutan, jangan lompat
  - Kuis U3 memakai bentuk soal yang mirip
---

Halaman ini berisi latihan bebas. **Tidak ada nilainya dan tidak ada yang dikirim ke guru** — silakan salah sebanyak yang diperlukan.

## 1. Predikat nilai

Baca satu nilai, lalu cetak predikatnya: `A` untuk 90 ke atas, `B` untuk 80–89, `C` untuk 70–79, `D` untuk 60–69, dan `E` untuk di bawah 60.

```python jalankan judul="Kerangka predikat nilai"
nilai = int(input())
if nilai >= 90:
    print("A")
```

## 2. Tahun kabisat

Sebuah tahun disebut kabisat bila habis dibagi 4, kecuali habis dibagi 100 tetapi tidak habis dibagi 400. Uji dengan 2024, 1900, dan 2000.

```python jalankan judul="Kerangka tahun kabisat"
tahun = int(input())
```

## 3. Tarif parkir bertingkat

Jam pertama Rp 3000, setiap jam berikutnya Rp 2000, dan totalnya tidak pernah melebihi Rp 15000.

```python jalankan judul="Kerangka tarif parkir"
jam = int(input())
```

## 4. Bilangan terbesar tanpa max()

Baca tiga bilangan, lalu cetak yang terbesar — tanpa memakai fungsi `max()`.

```python jalankan judul="Kerangka bilangan terbesar"
a = int(input())
b = int(input())
c = int(input())
besar = a
```

:::latihan
Kerjakan keempat soal di atas satu per satu di editor. Bila keempatnya sudah benar, kamu siap mengikuti Kuis U3.

```python
# Salin soal yang ingin dikerjakan ke sini.
```

petunjuk: Mulai dari soal 1. Untuk soal 4, bandingkan besar dengan b lalu dengan c.
:::
