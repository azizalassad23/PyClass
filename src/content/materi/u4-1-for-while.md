---
unit: U4
urut: 1
judul: Perulangan for dan while
pertemuan: Pertemuan 12 · ±1 JP penjelasan + 1 JP latihan
intisari: for mengulang sebanyak yang sudah diketahui; while mengulang selama syaratnya masih benar.
poin:
  - range(a, b) berhenti sebelum b
  - while butuh sesuatu yang mengubah syaratnya
  - break keluar, continue lompat ke putaran berikut
---

```python jalankan judul="for dengan range()"
for i in range(1, 6):
    print(i)
```

`range(1, 6)` menghasilkan 1, 2, 3, 4, 5 — **berhenti sebelum** angka kedua. Ini sumber kebingungan nomor satu di unit ini.

## while — mengulang selama syaratnya benar

```python jalankan judul="while sederhana"
n = 5
while n > 0:
    print(n)
    n = n - 1
print("Selesai")
```

Baris `n = n - 1` itulah yang membuat perulangan berakhir. Bila lupa menulisnya, syarat `n > 0` selamanya benar dan program tidak pernah berhenti — di aplikasi ini program akan dihentikan otomatis setelah 10 detik dengan pesan ramah.

## break dan continue

```python jalankan judul="Menghentikan dan melompati"
for i in range(1, 11):
    if i == 8:
        break
    if i % 2 == 1:
        continue
    print(i)
```

:::latihan
Cetak tabel perkalian sebuah bilangan dari 1 sampai 10, satu baris per hasil.

```python
n = int(input())
```

petunjuk: Gunakan for i in range(1, 11) lalu print(f"{n} x {i} = {n * i}").
:::
