import { useMemo } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { kodeCadangan } from '../lib/api';
import { UNIT_BY_ID } from '../content/units';
import { halamanUnit } from '../content/loader';
import { muatHasil, muatUjianAktif, tutupUjianAktif } from '../lib/sesiUjian';
import type { SubmitPayload } from '../lib/types';

/** W5 — mockup 1i: nilai, rincian per soal, kode konfirmasi, dan jalur gagal kirim. */
export function Hasil() {
  const keadaan = useMemo(() => muatUjianAktif(), []);
  const bukti = useMemo<SubmitPayload | null>(() => {
    const mentah = sessionStorage.getItem('pyclass:bukti');
    return mentah ? (JSON.parse(mentah) as SubmitPayload) : null;
  }, []);
  const hasil = useMemo(
    () => (keadaan ? muatHasil(keadaan.identitas.sesi, keadaan.identitas.nis) : null),
    [keadaan],
  );

  if (!keadaan) return <Navigate to="/ujian" replace />;

  const { identitas, paket } = keadaan;
  const gagalKirim = !hasil && Boolean(bukti);

  const unduhBukti = () => {
    if (!bukti) return;
    const berkas = new Blob([JSON.stringify(bukti, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(berkas);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pyclass-bukti-${identitas.nis}-${identitas.sesi}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ background: 'var(--cream)', minHeight: '100vh' }}>
      <Header ringkas jejak={paket.judul} />

      <main className="shell" style={{ padding: 'clamp(24px, 4vw, 44px) clamp(16px, 3vw, 32px) 56px' }}>
        {gagalKirim ? (
          <section
            style={{
              background: 'var(--brand-wash)', border: '1px solid var(--brand-line)',
              borderRadius: 'var(--r-xl)', padding: 'clamp(20px, 3vw, 28px)', marginBottom: 24,
            }}
          >
            <span className="pill pill--brand" style={{ marginBottom: 12 }}>Pengiriman gagal</span>
            <h1 style={{ fontSize: 'clamp(26px, 3.6vw, 34px)', margin: '0 0 10px' }}>
              Jawabanmu belum sampai ke guru
            </h1>
            <p style={{ fontSize: 15, lineHeight: 1.65, color: 'var(--body)', margin: '0 0 8px', maxWidth: 640 }}>
              Sistem sudah mencoba ulang 3× otomatis. Unduh berkas bukti di bawah ini dan serahkan ke guru
              bersama kode cadangan berikut — nilaimu tetap dihitung dari berkas itu.
            </p>
            <p style={{ fontFamily: 'var(--mono)', fontSize: 28, fontWeight: 700, color: 'var(--brand-deep)', margin: '0 0 16px' }}>
              {kodeCadangan(bukti!)}
            </p>
            <button type="button" className="btn btn--primary" onClick={unduhBukti}>
              Unduh Bukti (.json)
            </button>
          </section>
        ) : hasil ? (
          <>
            <span className="pill pill--leaf" style={{ marginBottom: 12, fontSize: 12.5, padding: '7px 14px' }}>
              ✓ Jawaban terkirim ke guru
            </span>
            <h1 style={{ fontSize: 'clamp(26px, 3.6vw, 34px)', margin: '0 0 6px' }}>{paket.judul} selesai</h1>
            <p style={{ fontSize: 14, color: 'var(--muted-2)', margin: '0 0 24px' }}>
              {identitas.nama} · {identitas.nis} · Kelas {identitas.kelas}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 16, marginBottom: 24 }}>
              <div className="card" style={{ background: 'var(--brand-wash)', border: '1px solid var(--brand-line)' }}>
                <div className="eyebrow" style={{ color: 'var(--brand-hover)', marginBottom: 6 }}>Nilai akhir</div>
                <div style={{ fontFamily: 'var(--display)', fontSize: 52, lineHeight: 1 }}>{hasil.nilai}</div>
                <p style={{ fontSize: 13, color: 'var(--muted-2)', margin: '8px 0 0' }}>
                  Rata-rata berbobot per soal
                </p>
              </div>
              <div className="card">
                <div className="eyebrow" style={{ marginBottom: 6 }}>Test lulus</div>
                <div style={{ fontFamily: 'var(--display)', fontSize: 34, lineHeight: 1 }}>
                  {hasil.testLulus} <span style={{ fontSize: 20, color: 'var(--muted-3)' }}>dari {hasil.testTotal}</span>
                </div>
              </div>
              <div className="card">
                <div className="eyebrow" style={{ marginBottom: 6 }}>Kode konfirmasi</div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 30, fontWeight: 700, letterSpacing: '.06em', color: 'var(--brand-deep)' }}>
                  {hasil.konfirmasi}
                </div>
                <p style={{ fontSize: 12.5, color: 'var(--muted-2)', margin: '8px 0 0' }}>
                  Tunjukkan kode ini bila guru meminta bukti pengiriman.
                </p>
              </div>
            </div>

            <section className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 24 }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--line)', display: 'flex', gap: 10, alignItems: 'baseline', flexWrap: 'wrap' }}>
                <h2 style={{ fontSize: 19, margin: 0 }}>Rincian per soal</h2>
                <span style={{ fontSize: 12.5, color: 'var(--muted-2)' }}>test lulus / total</span>
              </div>
              <div className="tabel__gulir">
                <table className="tabel">
                  <thead>
                    <tr><th>#</th><th>Judul</th><th>Test</th><th>Nilai</th></tr>
                  </thead>
                  <tbody>
                    {hasil.perSoal.map((s, i) => (
                      <tr key={s.soalId}>
                        <td style={{ fontFamily: 'var(--mono)', color: 'var(--muted-2)' }}>{i + 1}</td>
                        <td>{s.judul}</td>
                        <td style={{ fontFamily: 'var(--mono)', color: s.lulus === s.total ? 'var(--leaf-deep)' : 'var(--brand-deep)' }}>
                          {'✓'.repeat(s.lulus)}{'✗'.repeat(Math.max(0, s.total - s.lulus))} {s.lulus}/{s.total}
                        </td>
                        <td style={{ fontWeight: 700 }}>{s.nilai}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {hasil.perluDiulang && hasil.perluDiulang.length > 0 && (
              <section className="card" style={{ background: 'var(--leaf-wash)', border: '1px solid var(--leaf-line)' }}>
                <div className="eyebrow" style={{ color: 'var(--leaf-deep)', marginBottom: 8 }}>Materi yang perlu diulang</div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {hasil.perluDiulang.map((u) => {
                    const unit = UNIT_BY_ID.get(u);
                    const halaman = halamanUnit(u)[0];
                    const label = `${u} · ${unit?.judul ?? ''}`;
                    return halaman ? (
                      <Link
                        key={u} to={`/materi/${halaman.slug}`}
                        className="btn btn--ghost btn--sm"
                        onClick={tutupUjianAktif}
                      >
                        Ulangi {label}
                      </Link>
                    ) : (
                      <span key={u} className="pill pill--quiet">{label}</span>
                    );
                  })}
                </div>
              </section>
            )}
          </>
        ) : (
          <p>Hasil tidak ditemukan. Kembali ke <Link to="/ujian">halaman masuk ujian</Link>.</p>
        )}

        <div style={{ display: 'flex', gap: 12, marginTop: 28, flexWrap: 'wrap' }}>
          <Link className="btn btn--ghost" to="/" onClick={tutupUjianAktif}>Kembali ke beranda</Link>
          <Link className="btn btn--ghost" to="/materi" onClick={tutupUjianAktif}>Buka materi</Link>
        </div>
      </main>
    </div>
  );
}
