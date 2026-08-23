---
unit: U3
urut: 3
judul: Percabangan Bersarang
pertemuan: Pertemuan 9 · ±1 JP penjelasan + 1 JP latihan
intisari: Sebuah if boleh berada di dalam if lain untuk memeriksa syarat bertingkat.
poin:
  - Setiap tingkat menambah 4 spasi
  - Sering bisa diganti and agar lebih ringkas
  - Pilih bentuk yang paling mudah dibaca
---

Bila sebuah keputusan baru masuk akal setelah keputusan lain diambil, `if` boleh ditaruh di dalam `if`.

```python jalankan judul="if di dalam if"
nilai = 82
hadir = True

if hadir:
    if nilai >= 75:
        print("Lulus")
    else:
        print("Remedial")
else:
    print("Tidak memenuhi kehadiran")
```

Perhatikan jaraknya: cabang tingkat pertama menjorok 4 spasi, tingkat kedua 8 spasi. Salah hitung spasi adalah penyebab `IndentationError` yang paling sering.

## Kapan sebaiknya diganti and

Bila cabang dalam tidak punya `else` sendiri, dua tingkat `if` biasanya bisa digabung menjadi satu dengan `and` — dan hasilnya lebih mudah dibaca.

```python jalankan judul="Dua tingkat dipadatkan dengan and"
nilai = 82
hadir = True

if hadir and nilai >= 75:
    print("Lulus")
```

Sebaliknya, bila setiap tingkat punya penanganan sendiri seperti contoh pertama, bentuk bersarang justru lebih jelas. Pilih yang paling mudah dibaca orang lain.

:::latihan
Baca umur dan tinggi badan. Cetak "Boleh naik" hanya bila umur minimal 12 tahun dan tinggi minimal 140 cm; selain itu cetak alasan mana yang tidak terpenuhi.

```python
umur = int(input())
tinggi = int(input())
```

petunjuk: Periksa umur lebih dulu dengan if, lalu periksa tinggi di dalamnya.
:::
