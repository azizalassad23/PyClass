import { useState } from 'react';
import { MODE_DEMO } from '../lib/api';
import { BANK } from '../lib/bankSoal';
import { normalisasiKeluaran } from '../lib/format';
import { periksaStruktur, semuaTestUntukPeriksa } from '../lib/mockBackend';
import { useRunnerBatch } from '../python/useRunner';

interface Temuan {
  id: string;
  judul: string;
  masalah: string[];
}

/**
 * Mitigasi PRD §15 — "Periksa Bank Soal" sebelum sesi dibuka.
 *
 * Selain memeriksa struktur baris, tombol ini menjalankan `kodeReferensi` milik
 * guru terhadap SETIAP test case dan membandingkan hasilnya dengan kunci. Baris
 * yang kuncinya tidak cocok dengan solusi gurunya sendiri akan ketahuan di sini,
 * bukan saat 36 murid sudah duduk di depan komputer.
 */
export function PeriksaBankSoal({ onTutup }: { onTutup: () => void }) {
  const jalankan = useRunnerBatch();
  const [berjalan, setBerjalan] = useState(false);
  const [progres, setProgres] = useState('');
  const [temuan, setTemuan] = useState<Temuan[] | null>(null);
  const [jumlahSoal, setJumlahSoal] = useState(0);

  const periksa = async () => {
    setBerjalan(true);
    setTemuan(null);

    const struktur = periksaStruktur();
    const peta = new Map(struktur.map((s) => [s.id, [...s.masalah]]));

    const daftar = semuaTestUntukPeriksa();
    setJumlahSoal(daftar.length);

    for (let i = 0; i < daftar.length; i++) {
      const soal = daftar[i];
      setProgres(`Menjalankan solusi guru: ${soal.id} (${i + 1}/${daftar.length})`);
      for (let k = 0; k < soal.kasus.length; k++) {
        const kasus = soal.kasus[k];
        const { keluaran, galat } = await jalankan(soal.kodeReferensi, kasus.input);
        const daftarMasalah = peta.get(soal.id) ?? [];
        if (galat) {
          daftarMasalah.push(`test ${k + 1}: solusi guru error — ${galat.split('\n').pop()}`);
        } else if (normalisasiKeluaran(keluaran) !== normalisasiKeluaran(kasus.harap)) {
          daftarMasalah.push(
            `test ${k + 1}: kunci "${ringkas(kasus.harap)}" tetapi solusi guru menghasilkan "${ringkas(keluaran)}"`,
          );
        }
        peta.set(soal.id, daftarMasalah);
      }
    }

    setTemuan(
      daftar
        .map((s) => ({ id: s.id, judul: s.judul, masalah: peta.get(s.id) ?? [] }))
        .filter((t) => t.masalah.length > 0),
    );
    setProgres('');
    setBerjalan(false);
  };

  return (
    <section className="card" style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, flexWrap: 'wrap', marginBottom: 10 }}>
        <h2 style={{ fontSize: 19, margin: 0 }}>Periksa Bank Soal</h2>
        <span style={{ flex: 1 }} />
        <button type="button" className="btn btn--primary btn--sm" onClick={() => void periksa()} disabled={berjalan || !MODE_DEMO}>
          {berjalan ? 'Memeriksa…' : 'Jalankan pemeriksaan'}
        </button>
        {MODE_DEMO && (
          <button type="button" className="btn btn--ghost btn--sm" onClick={unduhCsv}>
            Unduh untuk sheet _Bank (.csv)
          </button>
        )}
        <button type="button" className="btn btn--ghost btn--sm" onClick={onTutup}>Tutup</button>
      </div>

      {MODE_DEMO ? (
        <p style={{ fontSize: 13.5, lineHeight: 1.6, color: 'var(--muted)', margin: '0 0 12px' }}>
          Setiap baris dijalankan memakai kolom <code>kodeReferensi</code> (solusi guru) terhadap seluruh test
          contoh dan test tersembunyi. Baris yang kuncinya tidak cocok dengan solusinya sendiri akan dilaporkan
          di bawah.
        </p>
      ) : (
        <p
          style={{
            fontSize: 13.5, lineHeight: 1.6, color: 'var(--body)', margin: '0 0 12px',
            background: 'var(--brand-wash)', border: '1px solid var(--brand-line)',
            borderRadius: 'var(--r-sm)', padding: '12px 16px',
          }}
        >
          Aplikasi tersambung ke Apps Script, jadi bank soal ada di sheet <code>_Bank</code> — bukan di
          peramban ini. Kunci jawaban memang sengaja tidak pernah dikirim ke sini (PRD §10), sehingga
          pemeriksaan tidak bisa dijalankan dari halaman ini.
          <br />
          <br />
          Jalankan fungsi <code>periksaBankSoal()</code> dari editor Apps Script untuk memeriksa struktur
          setiap baris (id ganda, jumlah kunci vs test, deskripsi kosong).
        </p>
      )}

      {berjalan && <p role="status" style={{ fontSize: 13, color: 'var(--muted-2)' }}>{progres}</p>}

      {temuan !== null && (
        temuan.length === 0 ? (
          <p
            style={{
              margin: 0, background: 'var(--leaf-wash)', border: '1px solid var(--leaf-line)',
              borderRadius: 'var(--r-sm)', padding: '12px 16px', fontSize: 14, color: 'var(--leaf-ink)',
            }}
          >
            ✓ {jumlahSoal} soal diperiksa, seluruh kunci cocok dengan solusi guru. Bank soal siap dipakai.
          </p>
        ) : (
          <div>
            <p style={{ fontSize: 14, color: 'var(--brand-deep)', fontWeight: 700, margin: '0 0 10px' }}>
              {temuan.length} dari {jumlahSoal} soal bermasalah — perbaiki sebelum membuka sesi.
            </p>
            <ul style={{ margin: 0, paddingLeft: 20, fontSize: 13.5, lineHeight: 1.6 }}>
              {temuan.map((t) => (
                <li key={t.id} style={{ marginBottom: 8 }}>
                  <b style={{ fontFamily: 'var(--mono)' }}>{t.id}</b> — {t.judul}
                  <ul style={{ margin: '4px 0 0', paddingLeft: 18, color: 'var(--muted)' }}>
                    {t.masalah.map((m, i) => <li key={i}>{m}</li>)}
                  </ul>
                </li>
              ))}
            </ul>
          </div>
        )
      )}
    </section>
  );
}

/**
 * Menuliskan bank demo dalam susunan kolom sheet `_Bank` (PRD §17) agar guru
 * bisa menempelkannya ke spreadsheet dan langsung memakai backend sungguhan.
 */
function unduhCsv() {
  const kepala = [
    'id', 'unit', 'jenis', 'grup', 'tingkat', 'bobot', 'judul', 'deskripsi',
    'contohInput', 'contohOutput', 'inputTersembunyi', 'outputKunci', 'kodeReferensi', 'kodeAwal',
  ];
  // CSV, bukan TSV: deskripsi, kode referensi, dan sebagian masukan test memuat
  // baris baru, jadi setiap sel harus dikutip agar barisnya tidak terpotong.
  const sel = (v: string) => `"${v.replace(/"/g, '""')}"`;
  const baris = BANK.map((s) =>
    [
      s.id, s.unit, s.jenis, s.grup, s.tingkat, String(s.bobot), s.judul, s.deskripsi,
      s.contoh.map((c) => c.input).join('|'),
      s.contoh.map((c) => c.output).join('|'),
      s.inputTersembunyi.join('|'),
      s.outputKunci.join('|'),
      s.kodeReferensi,
      s.kodeAwal ?? '',
    ]
      .map(sel)
      .join(','),
  );
  const isi = ['﻿' + kepala.map(sel).join(','), ...baris].join('\r\n');
  const url = URL.createObjectURL(new Blob([isi], { type: 'text/csv;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = 'pyclass-bank.csv';
  a.click();
  URL.revokeObjectURL(url);
}

const ringkas = (s: string) => {
  const satu = s.replace(/\n/g, ' ⏎ ').trim();
  return satu.length > 60 ? `${satu.slice(0, 60)}…` : satu || '(kosong)';
};
