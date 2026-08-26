---
unit: U2
urut: 4
judul: Mencari Kesalahan dengan print()
pertemuan: Pertemuan 6 · ±1 JP · keterampilan yang dipakai seterusnya
intisari: Kalau program jalan tapi hasilnya salah, Python tidak akan memberi tahu apa pun. Kamu yang harus mengintip isinya.
poin:
  - Program tanpa error belum tentu benar
  - Cetak isi variabel di tengah jalan
  - Bandingkan yang kamu duga dengan yang sebenarnya
---

Di halaman sebelumnya kita belajar membaca error. Tapi ada masalah yang **jauh lebih licin**: program berjalan mulus, tidak ada tulisan merah sama sekali — hasilnya saja yang salah.

Python tidak akan menolongmu di sini. Ia menjalankan persis apa yang kamu tulis, bukan apa yang kamu maksudkan.

## Contoh: rata-rata yang salah

Program ini seharusnya mencetak rata-rata dari 80, 90, dan 70 — yaitu **80**. Jalankan dan lihat hasilnya.

```python jalankan judul="Kenapa hasilnya bukan 80?"
a = 80
b = 90
c = 70
rata = a + b + c / 3
print(rata)
```

Tidak ada error. Tapi hasilnya `193.33...`, bukan 80.

## Cara mencarinya: intip isi variabel

Alih-alih menebak-nebak, **cetak apa yang sebenarnya terjadi** di tengah program:

```python jalankan judul="Menambahkan print untuk mengintip"
a = 80
b = 90
c = 70

print("jumlah a+b+c =", a + b + c)
print("c dibagi 3   =", c / 3)

rata = a + b + c / 3
print("hasil rumus  =", rata)
```

Sekarang terlihat jelas: `c / 3` dihitung **lebih dulu**, lalu baru ditambahkan ke `a` dan `b`. Pembagian dikerjakan sebelum penjumlahan — persis aturan urutan operasi yang kita pelajari di halaman Operator Aritmetika.

Perbaikannya: beri tanda kurung.

```python jalankan judul="Setelah diperbaiki"
a = 80
b = 90
c = 70
rata = (a + b + c) / 3
print(rata)
```

## Aturan pakai

- **Cetak dengan label.** `print("nilai =", nilai)` jauh lebih berguna daripada `print(nilai)` saja — kalau ada lima print, kamu takkan bingung yang mana.
- **Taruh di titik yang kamu ragukan.** Sebelum perhitungan, sesudahnya, dan di dalam perulangan.
- **Cetak juga tipenya kalau curiga.** `print(type(umur))` sering langsung membongkar masalah, karena hasil `input()` selalu berupa teks.
- **Hapus setelah selesai.** `print` bantuan tidak boleh ikut terkirim saat ujian — keluaran tambahan membuat jawabanmu dianggap salah oleh sistem penilaian.

## Mengintip di dalam perulangan

Ini akan sangat berguna di Unit 4 nanti:

```python jalankan judul="Melihat apa yang terjadi tiap putaran"
total = 0
for i in range(1, 5):
    total = total + i
    print("i =", i, "| total sekarang =", total)
print("hasil akhir:", total)
```

Baris demi baris, kamu bisa melihat isi `total` berubah. Kalau suatu saat hasilnya tidak seperti dugaan, di sinilah kamu akan menemukan penyebabnya.

:::latihan
Program ini seharusnya mencetak `Genap` untuk 10, tetapi selalu mencetak `Ganjil`. Tambahkan `print` untuk mengintip nilai `sisa`, temukan sebabnya, lalu perbaiki.

```python
n = 10
sisa = n % 3
if sisa == 0:
    print("Genap")
else:
    print("Ganjil")
```

petunjuk: Cetak sisa sebelum if. Untuk memeriksa genap, pembaginya seharusnya 2, bukan 3.
:::
