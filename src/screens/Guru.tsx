import { useCallback, useEffect, useState } from 'react';
import { Header } from '../components/Header';
import { PapanPantau } from '../components/PapanPantau';
import { PeriksaBankSoal } from '../components/PeriksaBankSoal';
import {
  ambilRekap, bukaSesi, MODE_DEMO, sesiKelas, tutupSesi, verifikasiPin,
} from '../lib/api';
import { angkaId, jam, sejakDetik, tanggalPanjang } from '../lib/format';
import { PAKET } from '../lib/paket';
import { KELAS_LIST, type BarisRekap, type Kelas, type SesiInfo } from '../lib/types';
import { baca, tulis } from '../lib/storage';

/** W6 — mockup 1j: kendali sesi + rekap kelas. */
export function Guru() {
  const [pin, setPin] = useState('');
  const [masuk, setMasuk] = useState(false);
  const [galatPin, setGalatPin] = useState('');
  const [memeriksa, setMemeriksa] = useState(false);

  const cek = async (e: React.FormEvent) => {
    e.preventDefault();
    setMemeriksa(true);
    setGalatPin('');
    const ok = await verifikasiPin(pin);
    setMemeriksa(false);
    if (ok) setMasuk(true);
    else setGalatPin('PIN tidak cocok. PIN disimpan di Apps Script, bukan di aplikasi ini.');
  };

  if (!masuk) {
    return (
      <div style={{ background: 'var(--cream)', minHeight: '100vh' }}>
        <Header ringkas jejak="Halaman Guru" />
        <main
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'clamp(32px, 8vw, 80px) 20px' }}
        >
          <form
            onSubmit={cek}
            style={{
              width: '100%', maxWidth: 400, background: 'var(--surface)',
              borderRadius: 'var(--r-xl)', padding: 'clamp(24px, 4vw, 32px)', boxShadow: 'var(--shadow-lg)',
            }}
          >
            <span className="pill pill--quiet" style={{ marginBottom: 12 }}>Terkunci PIN</span>
            <h1 style={{ fontSize: 26, margin: '0 0 6px' }}>Halaman Guru</h1>
            <p style={{ fontSize: 13.5, color: 'var(--muted-2)', margin: '0 0 20px' }}>
              F-G01 — PIN diverifikasi di Apps Script dan tidak pernah disimpan di kode front-end.
            </p>
            <label className="field">
              <span className="field__label">PIN</span>
              <input
                className="input input--mono" type="password" value={pin}
                onChange={(e) => setPin(e.target.value)} autoComplete="off"
                aria-invalid={Boolean(galatPin)}
              />
              {galatPin && <span className="field__error">{galatPin}</span>}
            </label>
            <button type="submit" className="btn btn--primary btn--block" disabled={memeriksa}>
              {memeriksa ? 'Memeriksa…' : 'Masuk'}
            </button>
            {MODE_DEMO && (
              <p style={{ fontSize: 12, color: 'var(--muted-2)', margin: '14px 0 0', textAlign: 'center' }}>
                Mode demo: PIN apa pun sepanjang minimal 4 karakter diterima.
              </p>
            )}
          </form>
        </main>
      </div>
    );
  }

  return (
    <PapanGuru
      pin={pin}
      onKeluar={() => {
        // PIN dibuang dari memori, bukan sekadar menyembunyikan papan — supaya
        // meninggalkan perangkat di kelas tidak berarti meninggalkan sesi guru
        // yang masih terbuka.
        setPin('');
        setMasuk(false);
      }}
    />
  );
}

function PapanGuru({ pin, onKeluar }: { pin: string; onKeluar: () => void }) {
  const [kelas, setKelas] = useState<Kelas>(() => baca<Kelas>('guru:kelas', 'XA'));
  const [sesi, setSesi] = useState<SesiInfo | null>(null);
  const [rekap, setRekap] = useState<BarisRekap[]>([]);
  const [dimuatPada, setDimuatPada] = useState<number | null>(null);
  const [sibuk, setSibuk] = useState(false);
  const [galat, setGalat] = useState('');
  const [panelPeriksa, setPanelPeriksa] = useState(false);
  const [konfirmasiTutup, setKonfirmasiTutup] = useState(false);

  const [paketBaru, setPaketBaru] = useState(PAKET[0].paket);
  const [durasiBaru, setDurasiBaru] = useState(PAKET[0].durasiMenit);

  useEffect(() => { tulis('guru:kelas', kelas); }, [kelas]);

  const muat = useCallback(async () => {
    setSibuk(true);
    setGalat('');
    try {
      const s = await sesiKelas(pin, kelas);
      setSesi(s);
      setRekap(s ? await ambilRekap(pin, kelas, s.jenis, s.kode) : []);
      setDimuatPada(Date.now());
    } catch (e) {
      setGalat((e as Error).message);
    } finally {
      setSibuk(false);
    }
  }, [pin, kelas]);

  useEffect(() => { void muat(); }, [muat]);

  const buka = async () => {
    setSibuk(true);
    setGalat('');
    try {
      const s = await bukaSesi(pin, kelas, paketBaru, durasiBaru);
      setSesi(s);
      setRekap([]);
      setDimuatPada(Date.now());
    } catch (e) {
      setGalat((e as Error).message);
    } finally {
      setSibuk(false);
    }
  };

  const tutup = async () => {
    if (!sesi) return;
    setSibuk(true);
    try {
      await tutupSesi(pin, sesi.kode);
      await muat();
    } finally {
      setSibuk(false);
    }
  };

  const sudahKirim = rekap.filter((b) => b.nilai !== null).length;
  const rataRata =
    sudahKirim === 0 ? 0 : rekap.reduce((t, b) => t + (b.nilai ?? 0), 0) / sudahKirim;

  return (
    <div style={{ background: 'var(--cream)', minHeight: '100vh' }}>
      <Header
        ringkas
        jejak="Halaman Guru"
        kanan={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span className="pill pill--quiet">Terkunci PIN</span>
            <button type="button" className="btn btn--ghost btn--sm" onClick={onKeluar}>
              Keluar
            </button>
          </div>
        }
      />

      <div className="guru">
        <nav className="guru__sisi" aria-label="Navigasi guru">
          <div className="eyebrow" style={{ marginBottom: 10 }}>Kelas</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 22 }}>
            {KELAS_LIST.map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => setKelas(k)}
                aria-current={k === kelas ? 'true' : undefined}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 14px', borderRadius: 'var(--r-pill)', border: 0, cursor: 'pointer',
                  fontSize: 14, fontWeight: k === kelas ? 700 : 500,
                  background: k === kelas ? 'var(--brand-tint)' : 'transparent',
                  color: k === kelas ? 'var(--brand-deep)' : 'var(--muted)',
                }}
              >
                <span>{k}</span>
              </button>
            ))}
          </div>

          <div className="eyebrow" style={{ marginBottom: 10 }}>Alat</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button type="button" className="btn btn--ghost btn--sm" onClick={() => setPanelPeriksa((v) => !v)}>
              {panelPeriksa ? 'Tutup pemeriksa' : 'Periksa Bank Soal'}
            </button>
            <a
              className="btn btn--ghost btn--sm"
              href="https://docs.google.com/spreadsheets/"
              target="_blank"
              rel="noreferrer noopener"
            >
              Buka Google Sheets
            </a>
          </div>
        </nav>

        <main className="guru__isi">
          {galat && (
            <p role="alert" style={{ background: 'var(--brand-wash)', border: '1px solid var(--brand-line)', borderRadius: 'var(--r-sm)', padding: '12px 16px', fontSize: 13.5, color: 'var(--brand-deep)' }}>
              {galat}
            </p>
          )}

          {panelPeriksa && <PeriksaBankSoal onTutup={() => setPanelPeriksa(false)} />}

          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, flexWrap: 'wrap', marginBottom: 18 }}>
            <h1 style={{ fontSize: 'clamp(24px, 3vw, 30px)', margin: 0 }}>Kelas {kelas}</h1>
            <span style={{ fontSize: 13.5, color: 'var(--muted-2)' }}>
              {sesi ? `${sesi.judul} · ${tanggalPanjang(sesi.dibukaPada)}` : 'Belum ada sesi berjalan'}
            </span>
            <span style={{ flex: 1 }} />
            <button type="button" className="btn btn--ghost btn--sm" onClick={() => void muat()} disabled={sibuk}>
              {sibuk ? 'Memuat…' : 'Muat ulang rekap'}
            </button>
            {/* Menutup sesi mematikan kode yang sudah ditulis di papan, dan
                tombolnya bersebelahan dengan "Muat ulang rekap" — karena itu
                selalu minta konfirmasi lebih dulu. */}
            {sesi && !konfirmasiTutup && (
              <button
                type="button" className="btn btn--ghost btn--sm"
                onClick={() => setKonfirmasiTutup(true)} disabled={sibuk}
              >
                Tutup sesi
              </button>
            )}
            {sesi && konfirmasiTutup && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 13, color: 'var(--brand-deep)', fontWeight: 600 }}>
                  Tutup sesi {sesi.kode}? Murid tidak bisa masuk lagi.
                </span>
                <button
                  type="button" className="btn btn--primary btn--sm"
                  onClick={() => { setKonfirmasiTutup(false); void tutup(); }} disabled={sibuk}
                >
                  Ya, tutup
                </button>
                <button type="button" className="btn btn--ghost btn--sm" onClick={() => setKonfirmasiTutup(false)}>
                  Batal
                </button>
              </span>
            )}
          </div>

          {sesi ? (
            <section
              style={{
                display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: 16, marginBottom: 24,
              }}
            >
              <div className="card" style={{ background: 'var(--brand-wash)', border: '1px solid var(--brand-line)' }}>
                <div className="eyebrow" style={{ color: 'var(--brand-hover)', marginBottom: 6 }}>
                  Kode sesi — tulis di papan
                </div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 40, fontWeight: 700, letterSpacing: '.08em', color: 'var(--brand-deep)' }}>
                  {sesi.kode}
                </div>
              </div>
              <div className="card">
                <div className="eyebrow" style={{ marginBottom: 6 }}>Sesi</div>
                <p style={{ margin: 0, fontSize: 14, lineHeight: 1.7, color: 'var(--body)' }}>
                  Durasi {sesi.durasiMenit} menit
                  <br />
                  Dibuka {jam(sesi.dibukaPada)} · tutup otomatis {jam(sesi.dibukaPada + sesi.durasiMenit * 60_000)}
                  <br />
                  <span className={sesi.status === 'berjalan' ? 'pill pill--leaf' : 'pill pill--quiet'}>
                    {sesi.status === 'berjalan' ? 'Sesi berjalan' : 'Sesi ditutup'}
                  </span>
                </p>
              </div>
              <div className="card">
                <div className="eyebrow" style={{ marginBottom: 6 }}>Sudah mengirim</div>
                <div style={{ fontFamily: 'var(--display)', fontSize: 36, lineHeight: 1 }}>{sudahKirim}</div>
                <p style={{ fontSize: 13, color: 'var(--muted-2)', margin: '6px 0 0' }}>
                  Rata-rata kelas {sudahKirim ? angkaId(rataRata) : '—'}
                </p>
              </div>
            </section>
          ) : (
            <section className="card" style={{ marginBottom: 24 }}>
              <h2 style={{ fontSize: 19, margin: '0 0 12px' }}>Buka sesi baru</h2>
              <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'flex-end' }}>
                <label className="field" style={{ flex: '2 1 260px', marginBottom: 0 }}>
                  <span className="field__label">Paket</span>
                  <select
                    className="input"
                    value={paketBaru}
                    onChange={(e) => {
                      setPaketBaru(e.target.value);
                      const p = PAKET.find((x) => x.paket === e.target.value);
                      if (p) setDurasiBaru(p.durasiMenit);
                    }}
                  >
                    {PAKET.map((p) => (
                      <option key={p.paket} value={p.paket}>{p.judul} — {p.subjudul}</option>
                    ))}
                  </select>
                </label>
                <label className="field" style={{ flex: '1 1 140px', marginBottom: 0 }}>
                  <span className="field__label">Durasi (menit)</span>
                  <input
                    className="input input--mono" type="number" min={5} max={180}
                    value={durasiBaru}
                    onChange={(e) => setDurasiBaru(Number(e.target.value))}
                  />
                </label>
                <button type="button" className="btn btn--primary" onClick={() => void buka()} disabled={sibuk}>
                  Buka sesi
                </button>
              </div>
            </section>
          )}

          {sesi && sesi.status === 'berjalan' && (
            <PapanPantau pin={pin} sesi={sesi.kode} durasiMenit={sesi.durasiMenit} />
          )}

          <section className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--line)', display: 'flex', gap: 10, alignItems: 'baseline', flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: 19, margin: 0 }}>Rekap nilai</h2>
              <span style={{ fontSize: 12.5, color: 'var(--muted-2)' }}>
                dimuat dari sheet <b>{kelas} — {sesi?.jenis === 'kuis' ? 'Kuis' : 'Ujian'}</b> · diperbarui {sejakDetik(dimuatPada)}
              </span>
            </div>
            <div className="tabel__gulir">
              <table className="tabel">
                <thead>
                  <tr>
                    <th>Nama</th><th>NIS</th><th>Nilai</th><th>Test lulus</th>
                    <th>Durasi</th><th>Pindah tab</th><th>Status</th><th>Kode</th>
                  </tr>
                </thead>
                <tbody>
                  {rekap.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ color: 'var(--muted-2)', padding: '20px 12px' }}>
                        Belum ada submisi untuk sesi ini.
                      </td>
                    </tr>
                  ) : (
                    rekap.map((b) => (
                      <tr key={b.nis}>
                        <td>{b.nama}</td>
                        <td style={{ fontFamily: 'var(--mono)' }}>{b.nis}</td>
                        <td style={{ fontWeight: 700 }}>{b.nilai ?? '—'}</td>
                        <td style={{ fontFamily: 'var(--mono)' }}>{b.testLulus}</td>
                        <td>{b.durasiMenit !== null ? `${b.durasiMenit} m` : '—'}</td>
                        <td style={{ color: b.pindahTab > 2 ? 'var(--brand-deep)' : 'var(--muted-2)', fontWeight: b.pindahTab > 2 ? 700 : 400 }}>
                          {b.pindahTab}
                        </td>
                        <td>
                          <span className={b.status === 'selesai' ? 'pill pill--leaf' : 'pill pill--brand'}>{b.status}</span>
                        </td>
                        <td style={{ fontFamily: 'var(--mono)' }}>{b.konfirmasi}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <p style={{ fontSize: 12.5, color: 'var(--muted-2)', padding: '14px 20px', margin: 0, borderTop: '1px solid var(--line)' }}>
              Kolom kode jawaban lengkap tersedia di spreadsheet untuk memeriksa kemiripan antar murid (F-A04).
            </p>
          </section>
        </main>
      </div>
    </div>
  );
}
