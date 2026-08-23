---
unit: U3
urut: 1
judul: Percabangan if
pertemuan: Pertemuan 7 · ±1 JP penjelasan + 1 JP latihan
intisari: if menjalankan sekelompok baris hanya bila syaratnya bernilai True.
poin:
  - Titik dua wajib di akhir baris if
  - Baris di dalamnya menjorok 4 spasi
  - else menampung semua sisa kemungkinan
---

Sampai sekarang program kita berjalan lurus dari atas ke bawah. `if` memberi program kemampuan memilih.

```python jalankan judul="Percabangan paling sederhana"
nilai = 80
if nilai >= 75:
    print("Lulus")
```

Dua hal yang wajib diperhatikan:

1. Baris `if` **selalu** diakhiri titik dua `:`.
2. Baris yang mau dijalankan bila syarat benar ditulis **menjorok** — 4 spasi, konsisten.

Menjorok bukan sekadar kerapian: di Python, jarak menjoroklah yang menentukan baris mana yang termasuk ke dalam `if`.

```python jalankan judul="Menjorok menentukan cakupan"
nilai = 50
if nilai >= 75:
    print("Selamat!")
    print("Kamu lulus.")
print("Program selesai.")
```

Baris terakhir tidak menjorok, jadi ia selalu dijalankan — berapa pun nilainya.

## else — kemungkinan sisanya

```python jalankan judul="if dengan else"
nilai = 50
if nilai >= 75:
    print("Lulus")
else:
    print("Tidak Lulus")
```

Tepat satu di antara kedua cabang itu pasti dijalankan. Tidak pernah keduanya, tidak pernah nol.

:::latihan
Baca sebuah nilai, lalu cetak "Lulus" bila 75 ke atas dan "Tidak Lulus" bila di bawahnya.

```python
nilai = int(input())
```

petunjuk: Susun if nilai >= 75: ... else: ... dan jangan lupa titik dua serta 4 spasi.
:::
