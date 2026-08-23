---
unit: U5
urut: 1
judul: List, Tuple, Dictionary, dan Set
pertemuan: Pertemuan 17 · ±1 JP penjelasan + 1 JP latihan
intisari: Empat cara menyimpan banyak nilai sekaligus, masing-masing untuk keperluan berbeda.
poin:
  - List berurutan dan bisa diubah
  - Dictionary menyimpan pasangan kunci-nilai
  - Set membuang data kembar
---

| Bentuk | Ditulis | Sifat |
| --- | --- | --- |
| list | `[80, 95, 70]` | berurutan, bisa diubah |
| tuple | `(80, 95)` | berurutan, tidak bisa diubah |
| dictionary | `{"Ani": 80}` | pasangan kunci–nilai |
| set | `{80, 95}` | tanpa kembar, tanpa urutan |

```python jalankan judul="List dan indeksnya"
nilai = [80, 95, 70, 88]
print(nilai[0])
print(nilai[-1])
print(len(nilai))
print(max(nilai), min(nilai))
```

Indeks pertama adalah **0**, dan yang terakhir `len(daftar) - 1`. Indeks negatif menghitung dari belakang.

## Dictionary — mencari berdasarkan nama

```python jalankan judul="Menyimpan nilai per murid"
nilai = {"Ani": 80, "Budi": 90}
nilai["Citra"] = 75

print(nilai["Budi"])
for nama in nilai:
    print(nama, nilai[nama])
```

## Set — membuang yang kembar

```python jalankan judul="Menghitung kata unik"
kata = "ada ada saja".split()
print(len(kata))
print(len(set(kata)))
```

:::latihan
Baca sebaris angka yang dipisahkan spasi, lalu cetak nilai tertinggi dan terendahnya.

```python
angka = [int(x) for x in input().split()]
```

petunjuk: Gunakan max(angka) dan min(angka), masing-masing di baris print sendiri.
:::
