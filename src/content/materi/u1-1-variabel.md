---
unit: U1
urut: 1
judul: Variabel — Wadah untuk Data
pertemuan: Pertemuan 1 · ±1 JP penjelasan + 1 JP latihan
intisari: Variabel adalah nama yang kita tempelkan pada sebuah nilai supaya bisa dipakai lagi nanti.
poin:
  - Nama di kiri, nilai di kanan, tanda = di tengah
  - Isinya boleh diganti kapan saja
  - Nama yang baik menjelaskan isinya
---

Program menyimpan data supaya bisa dipakai berulang kali. Tempat menyimpannya disebut **variabel**. Membuat variabel di Python cukup dengan menuliskan nama, tanda sama dengan, lalu nilainya.

> **Analogi.** Variabel seperti kotak yang ditempeli label. Labelnya adalah nama variabel; isi kotaknya adalah nilainya. Kita menyebut labelnya, Python mengambilkan isinya.

```python jalankan judul="Membuat dan memakai variabel"
nama = "Ani"
umur = 15
print(nama)
print(umur)
```

## Isinya boleh diganti

Tanda `=` di Python bukan "sama dengan" seperti di matematika, melainkan **"isikan"**. Karena itu baris seperti `n = n + 1` masuk akal: ambil isi `n`, tambah satu, lalu isikan kembali ke `n`.

```python jalankan judul="Nilai variabel bisa berubah"
skor = 10
print(skor)

skor = skor + 5
print(skor)
```

## Aturan penamaan

- Boleh huruf, angka, dan garis bawah — tetapi **tidak boleh diawali angka**.
- Huruf besar dan kecil dibedakan: `nilai` dan `Nilai` adalah dua variabel berbeda.
- Tidak boleh memakai kata yang sudah menjadi milik Python, seperti `if`, `for`, atau `print`.
- Pakailah nama yang menjelaskan isinya: `nilai_ujian` jauh lebih terbaca daripada `x`.

| Nama | Boleh? | Alasan |
| --- | --- | --- |
| `nilai_ujian` | ya | jelas dan sah |
| `2nilai` | tidak | diawali angka |
| `nilai ujian` | tidak | mengandung spasi |
| `nilaiUjian` | ya | sah, walaupun gaya Python lebih suka garis bawah |

:::latihan
Buat dua variabel `panjang` dan `lebar`, isi dengan angka bebas, lalu cetak hasil perkaliannya.

```python
panjang = 
lebar = 
```

petunjuk: Isi kedua variabel dengan bilangan, lalu gunakan print(panjang * lebar).
:::
