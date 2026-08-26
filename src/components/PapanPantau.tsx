import { useCallback, useEffect, useState } from 'react';
import { ambilPantau, tambahWaktu } from '../lib/api';
import { mmss, sejakDetik } from '../lib/format';
import type { BarisPantau } from '../lib/types';

/** Denyut murid datang tiap 45 detik; menyegarkan lebih cepat tidak ada gunanya. */
const JEDA_SEGAR_MS = 20_000;
/** Sesudah ini murid dianggap terputus, bukan sekadar belum berdenyut. */
const AMBANG_HILANG_DETIK = 150;

/**
 * Alasan seorang murid ditandai butuh bantuan. Ambangnya sengaja longgar:
 * lebih baik guru menghampiri satu murid yang ternyata baik-baik saja daripada
 * melewatkan yang diam-diam menyerah.
 */
function alasanBantuan(b: BarisPantau): string | null {
  if (b.status === 'mengirim') return null;
  if (b.jalanSoalAktif >= 12 && b.detikSoalAktif >= 240) {
    return `menjalankan kode ${b.jalanSoalAktif}× di soal ${b.soalAktif} tanpa lolos contoh`;
  }
  if (b.detikSoalAktif >= 600) {
    return `sudah ${Math.round(b.detikSoalAktif / 60)} menit di soal ${b.soalAktif}`;
  }
  if (b.diisi === 0 && b.sisaDetik > 0 && b.detikSoalAktif >= 300) {
    return 'belum menulis apa pun setelah 5 menit';
  }
  return null;
}

export function PapanPantau({ pin, sesi, durasiMenit }: { pin: string; sesi: string; durasiMenit: number }) {
  const [baris, setBaris] = useState<BarisPantau[]>([]);
  const [dimuatPada, setDimuatPada] = useState<number | null>(null);
  const [galat, setGalat] = useState('');
  const [sibukNis, setSibukNis] = useState<string | null>(null);
  const [otomatis, setOtomatis] = useState(true);

  const muat = useCallback(async () => {
    try {
      setBaris(await ambilPantau(pin, sesi));
      setDimuatPada(Date.now());
      setGalat('');
    } catch (e) {
      setGalat((e as Error).message);
    }
  }, [pin, sesi]);

  useEffect(() => {
    void muat();
    if (!otomatis) return;
    const id = window.setInterval(() => void muat(), JEDA_SEGAR_MS);
    return () => window.clearInterval(id);
  }, [muat, otomatis]);

  const beriWaktu = async (nis: string, menit: number) => {
    setSibukNis(nis);
    try {
      await tambahWaktu(pin, sesi, nis, menit);
      await muat();
    } catch (e) {
      setGalat((e as Error).message);
    } finally {
      setSibukNis(null);
    }
  };

  const butuhBantuan = baris.filter((b) => alasanBantuan(b) !== null);
  const sudahKirim = baris.filter((b) => b.status === 'mengirim').length;
  const sekarang = Date.now();

  return (
    <section className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 24 }}>
      <div
        style={{
          padding: '16px 20px', borderBottom: '1px solid var(--line)',
          display: 'flex', gap: 12, alignItems: 'baseline', flexWrap: 'wrap',
        }}
      >
        <h2 style={{ fontSize: 19, margin: 0 }}>Papan pantau kelas</h2>
        <span style={{ fontSize: 12.5, color: 'var(--muted-2)' }}>
          {baris.length} murid terpantau · {sudahKirim} sudah mengirim · diperbarui {sejakDetik(dimuatPada)}
        </span>
        <span style={{ flex: 1 }} />
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, color: 'var(--muted)' }}>
          <input type="checkbox" checked={otomatis} onChange={(e) => setOtomatis(e.target.checked)} />
          Segarkan otomatis
        </label>
        <button type="button" className="btn btn--ghost btn--sm" onClick={() => void muat()}>
          Segarkan
        </button>
        <button
          type="button" className="btn btn--ghost btn--sm"
          onClick={() => void beriWaktu('SEMUA', 5)} disabled={sibukNis !== null || baris.length === 0}
        >
          +5 menit untuk semua
        </button>
      </div>

      {galat && (
        <p role="alert" style={{ margin: 0, padding: '12px 20px', fontSize: 13.5, color: 'var(--brand-deep)', background: 'var(--brand-wash)' }}>
          {galat}
        </p>
      )}

      {butuhBantuan.length > 0 && (
        <div style={{ padding: '14px 20px', background: 'var(--brand-wash)', borderBottom: '1px solid var(--brand-line)' }}>
          <div className="eyebrow" style={{ color: 'var(--brand-hover)', marginBottom: 8 }}>
            Sepertinya butuh dihampiri ({butuhBantuan.length})
          </div>
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13.5, lineHeight: 1.7, color: 'var(--body)' }}>
            {butuhBantuan.map((b) => (
              <li key={b.nis}>
                <b>{b.nama}</b> — {alasanBantuan(b)}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="tabel__gulir">
        <table className="tabel">
          <thead>
            <tr>
              <th>Nama</th><th>Soal</th><th>Diisi</th><th>Contoh lulus</th>
              <th>Di soal ini</th><th>Sisa waktu</th><th>Pindah tab</th><th>Kabar</th><th>Tambah waktu</th>
            </tr>
          </thead>
          <tbody>
            {baris.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ color: 'var(--muted-2)', padding: '20px 12px' }}>
                  Belum ada murid yang masuk. Nama mereka muncul beberapa detik setelah menekan Masuk Ujian.
                </td>
              </tr>
            ) : (
              baris.map((b) => {
                const alasan = alasanBantuan(b);
                const diamDetik = b.diperbaruiPada ? Math.round((sekarang - b.diperbaruiPada) / 1000) : null;
                const hilang = diamDetik !== null && diamDetik > AMBANG_HILANG_DETIK;
                return (
                  <tr key={b.nis} style={{ background: alasan ? 'var(--brand-wash)' : undefined }}>
                    <td>
                      <b>{b.nama}</b>
                      <div style={{ fontSize: 11.5, color: 'var(--muted-2)', fontFamily: 'var(--mono)' }}>{b.nis}</div>
                    </td>
                    <td style={{ fontFamily: 'var(--mono)' }}>{b.soalAktif}/{b.totalSoal}</td>
                    <td style={{ fontFamily: 'var(--mono)' }}>{b.diisi}</td>
                    <td style={{ fontFamily: 'var(--mono)', color: b.lulusContoh > 0 ? 'var(--leaf-deep)' : 'var(--muted-2)' }}>
                      {b.lulusContoh}
                    </td>
                    <td style={{ fontSize: 12.5, color: b.detikSoalAktif >= 600 ? 'var(--brand-deep)' : 'var(--muted)' }}>
                      {Math.round(b.detikSoalAktif / 60)} m · {b.jalanSoalAktif}× jalan
                    </td>
                    <td style={{ fontFamily: 'var(--mono)', fontWeight: 700, color: b.sisaDetik <= 300 ? 'var(--brand-deep)' : 'var(--ink)' }}>
                      {mmss(b.sisaDetik)}
                      {b.tambahanMenit > 0 && (
                        <span style={{ fontSize: 11, color: 'var(--leaf-deep)', display: 'block', fontFamily: 'var(--sans)' }}>
                          +{b.tambahanMenit} m
                        </span>
                      )}
                    </td>
                    <td style={{ fontWeight: b.pindahTab > 2 ? 700 : 400, color: b.pindahTab > 2 ? 'var(--brand-deep)' : 'var(--muted-2)' }}>
                      {b.pindahTab}
                    </td>
                    <td>
                      {b.status === 'mengirim' ? (
                        <span className="pill pill--leaf">mengirim</span>
                      ) : hilang ? (
                        <span className="pill pill--brand" title={`Kabar terakhir ${diamDetik} detik lalu`}>
                          terputus?
                        </span>
                      ) : (
                        <span className="pill pill--quiet">{sejakDetik(b.diperbaruiPada)}</span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {[5, 10].map((m) => (
                          <button
                            key={m}
                            type="button"
                            className="btn btn--ghost btn--sm"
                            style={{ minHeight: 34, padding: '6px 12px', fontSize: 12 }}
                            onClick={() => void beriWaktu(b.nis, m)}
                            disabled={sibukNis !== null}
                          >
                            +{m}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <p style={{ fontSize: 12.5, color: 'var(--muted-2)', padding: '14px 20px', margin: 0, borderTop: '1px solid var(--line)' }}>
        Murid mengirim kabar tiap 45 detik, jadi angka di sini bisa tertinggal sekitar satu menit. Durasi
        sesi ini {durasiMenit} menit; tambahan waktu sampai ke murid pada kabar berikutnya.
      </p>
    </section>
  );
}
