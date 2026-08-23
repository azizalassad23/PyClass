---
unit: U3
urut: 2
judul: Percabangan elif
pertemuan: Pertemuan 8 · ±1 JP penjelasan + 1 JP latihan
intisari: Diperiksa dari atas ke bawah. Yang pertama benar, itu yang jalan.
poin:
  - elif boleh berapa pun
  - else selalu paling akhir
  - Begitu satu cabang cocok, sisanya tidak diperiksa
---

Kadang pilihannya lebih dari dua. **elif** (kependekan dari *else if*) dipakai untuk menguji kondisi berikutnya hanya jika kondisi sebelumnya bernilai `False`.

> **Analogi.** Seperti antrean loket: kalau loket 1 penuh, coba loket 2; kalau penuh juga, baru loket 3. Begitu satu loket menerima, sisanya tidak diperiksa lagi.

```python jalankan judul="Contoh 1 — rantai nilai"
nilai = int(input())
if nilai >= 75:
    print("Lulus")
elif nilai >= 60:
    print("Remedial")
else:
    print("Tidak Lulus")
```

- Urutan diperiksa dari atas ke bawah — yang pertama benar yang dijalankan.
- `else` menampung semua sisa kemungkinan dan ditulis paling akhir.
- Jumlah `elif` tidak dibatasi.

## Urutan syarat itu penting

Karena Python berhenti pada cabang pertama yang benar, syarat yang lebih longgar harus ditulis **belakangan**. Contoh berikut salah urutan, dan akibatnya nilai 95 pun tercetak "C".

```python jalankan judul="Contoh 2 — urutan yang keliru"
nilai = 95
if nilai >= 70:
    print("C")
elif nilai >= 80:
    print("B")
elif nilai >= 90:
    print("A")
```

Perbaikannya: mulai dari syarat paling ketat, yaitu `>= 90` lebih dulu.

## Kesalahan yang sering muncul

| Gejala | Penyebab |
| --- | --- |
| `IndentationError` | Baris di dalam `if` belum menjorok — gunakan 4 spasi, konsisten. |
| `SyntaxError` setelah `else` | `else` selalu terakhir. Menaruh `elif` sesudahnya tidak sah. |
| Cabang tidak pernah jalan | Syarat yang lebih longgar ditulis lebih dulu, seperti contoh 2 di atas. |

:::latihan
Tambahkan cabang untuk nilai 90 ke atas yang mencetak "Sangat Baik", lalu jalankan dengan masukan 95.

```python
nilai = int(input())
if nilai >= 75:
    print("Lulus")
elif nilai >= 60:
    print("Remedial")
else:
    print("Tidak Lulus")
```

petunjuk: Cabang baru harus diletakkan paling atas, sebelum nilai >= 75.
:::
