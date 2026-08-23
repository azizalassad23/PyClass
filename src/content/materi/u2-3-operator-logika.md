---
unit: U2
urut: 3
judul: Operator Perbandingan & Logika
pertemuan: Pertemuan 6 · ±1 JP penjelasan + 1 JP latihan · ditutup Kuis U2
intisari: Perbandingan menghasilkan True atau False; and, or, dan not menggabungkannya.
poin:
  - "== membandingkan, = mengisi — jangan tertukar"
  - and butuh keduanya benar, or cukup salah satu
  - Hasil perbandingan boleh disimpan di variabel
---

Perbandingan menghasilkan nilai `bool`, yaitu `True` atau `False`.

| Operator | Arti |
| --- | --- |
| `==` | sama dengan |
| `!=` | tidak sama dengan |
| `>` `<` | lebih besar / lebih kecil |
| `>=` `<=` | lebih besar / kecil atau sama dengan |

```python jalankan judul="Perbandingan menghasilkan bool"
nilai = 78
print(nilai >= 75)
print(nilai == 100)
print(nilai != 100)
```

> **Waspada.** `=` mengisi nilai, `==` membandingkan. Menulis `if nilai = 75:` menghasilkan `SyntaxError`. Ini kesalahan paling sering di pertemuan-pertemuan awal.

## Menggabungkan syarat

- `and` — benar hanya bila **kedua** sisi benar.
- `or` — benar bila **salah satu** sisi benar.
- `not` — membalik nilainya.

```python jalankan judul="and, or, not"
nilai = 82
hadir = True

print(nilai >= 75 and hadir)
print(nilai >= 90 or hadir)
print(not hadir)
```

## Rantai perbandingan

Python mengizinkan penulisan seperti di matematika, dan hasilnya persis seperti dugaan.

```python jalankan judul="Rentang nilai"
nilai = 68
print(60 <= nilai <= 74)
```

:::latihan
Baca sebuah nilai, lalu cetak True bila nilainya berada di rentang 60 sampai 74.

```python
nilai = int(input())
```

petunjuk: Gunakan rantai perbandingan 60 <= nilai <= 74 di dalam print().
:::
