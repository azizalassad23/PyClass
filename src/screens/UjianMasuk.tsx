import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LencanaDemo, Logo } from '../components/Header';
import { ambilPaket, cekSesi, daftarSesiDemo, MODE_DEMO } from '../lib/api';
import { KELAS_LIST, type Kelas } from '../lib/types';
import { simpanUjian } from '../lib/sesiUjian';
import { usePython } from '../python/PythonProvider';

/** W3 — mockup 1f: identifikasi murid + kode sesi. */
export function UjianMasuk() {
  const navigate = useNavigate();
  const { fase, panaskan } = usePython();

  const [nama, setNama] = useState('');
  const [nis, setNis] = useState('');
  const [kelas, setKelas] = useState<Kelas>('XA');
  const [digit, setDigit] = useState<string[]>(Array(6).fill(''));
  const [galat, setGalat] = useState<Record<string, string>>({});
  const [memuat, setMemuat] = useState(false);
  const [galatUmum, setGalatUmum] = useState('');
  const kotakDigit = useRef<(HTMLInputElement | null)[]>([]);
  // Dibaca sekali saat layar dibuka; sesi baru muncul setelah halaman disegarkan.
  const [sesiDemo] = useState(() => daftarSesiDemo());

  // F-E06 — Pyodide sudah diunduh sebelum timer mulai.
  useEffect(() => { panaskan(); }, [panaskan]);

  const kodeSesi = digit.join('');

  const isiDigit = (i: number, nilai: string) => {
    const bersih = nilai.replace(/\D/g, '');
    if (bersih.length > 1) {
      // Menempel/mengetik cepat beberapa angka sekaligus.
      const baru = [...digit];
      for (let k = 0; k < bersih.length && i + k < 6; k++) baru[i + k] = bersih[k];
      setDigit(baru);
      kotakDigit.current[Math.min(5, i + bersih.length)]?.focus();
      return;
    }
    const baru = [...digit];
    baru[i] = bersih;
    setDigit(baru);
    if (bersih && i < 5) kotakDigit.current[i + 1]?.focus();
  };

  const periksa = (): boolean => {
    const g: Record<string, string> = {};
    if (!nama.trim()) g.nama = 'Nama tidak boleh kosong.';
    if (!/^\d{4,10}$/.test(nis.trim())) g.nis = 'NIS harus berupa 4–10 angka.';
    if (!/^\d{6}$/.test(kodeSesi)) g.sesi = 'Kode sesi terdiri dari 6 angka.';
    setGalat(g);
    return Object.keys(g).length === 0;
  };

  const masuk = async (e: React.FormEvent) => {
    e.preventDefault();
    setGalatUmum('');
    if (!periksa()) return;
    setMemuat(true);
    try {
      const sesi = await cekSesi(kodeSesi);
      if (sesi.kelas !== kelas) {
        setGalatUmum(`Kode sesi ini dibuka untuk kelas ${sesi.kelas}, bukan ${kelas}. Periksa lagi pilihan kelasmu.`);
        return;
      }
      const paket = await ambilPaket(kodeSesi, nis.trim());
      simpanUjian({
        identitas: { nama: nama.trim(), nis: nis.trim(), kelas, sesi: kodeSesi },
        paket,
        jawaban: Object.fromEntries(paket.soal.map((s) => [s.id, s.kodeAwal ?? ''])),
        dimulaiPada: Date.now(),
      });
      navigate('/ujian/kerjakan');
    } catch (err) {
      setGalatUmum((err as Error).message);
    } finally {
      setMemuat(false);
    }
  };

  return (
    <div className="masuk" style={{ background: 'var(--cream)', position: 'relative', overflow: 'hidden' }}>
      <div
        aria-hidden="true"
        style={{ position: 'absolute', left: -160, top: -120, width: 460, height: 460, borderRadius: 999, background: 'var(--brand-wash)' }}
      />

      <section className="masuk__kiri" style={{ position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 26 }}>
          <Logo ukuran={36} />
          <span style={{ fontFamily: 'var(--display)', fontSize: 21 }}>PyClass</span>
          <LencanaDemo />
        </div>
        <span className="pill pill--brand" style={{ alignSelf: 'flex-start', marginBottom: 18, padding: '7px 16px', fontSize: 12.5 }}>
          Masukkan kode sesi dari guru
        </span>
        <h1 style={{ fontSize: 'clamp(32px, 4.6vw, 46px)', lineHeight: 1.08, margin: '0 0 14px', maxWidth: 440 }}>
          Ujian & Kuis
        </h1>
        <p style={{ fontSize: 16.5, lineHeight: 1.65, color: 'var(--muted)', margin: '0 0 30px', maxWidth: 420 }}>
          Paket soal dan durasinya ditentukan oleh sesi yang dibuka guru. Pastikan perangkatmu terhubung internet
          sebelum menekan Masuk.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 420 }}>
          <Fakta besar="10" judul="soal pemrograman" ket="diacak dari bank soal setara (kuis: 5 soal)" />
          <Fakta besar="90" judul="menit" ket="timer tetap jalan meski halaman di-refresh (kuis: 20 menit)" />
          <Fakta besar="✓" judul="jawaban tersimpan otomatis" ket="setiap 10 detik di perangkat ini" />
        </div>
      </section>

      <section className="masuk__kanan" style={{ position: 'relative' }}>
        <form
          onSubmit={masuk}
          noValidate
          style={{
            width: '100%', background: 'var(--surface)', borderRadius: 'var(--r-xl)',
            padding: 'clamp(24px, 3vw, 34px)', boxShadow: 'var(--shadow-lg)',
          }}
        >
          <h2 style={{ fontSize: 26, margin: '0 0 4px' }}>Masuk Ujian</h2>
          <p style={{ fontSize: 13.5, color: 'var(--muted-2)', margin: '0 0 22px' }}>Isi persis seperti di daftar hadir.</p>

          <label className="field">
            <span className="field__label">Nama Lengkap</span>
            <input
              className="input" value={nama} onChange={(e) => setNama(e.target.value)}
              autoComplete="name" aria-invalid={Boolean(galat.nama)}
              aria-describedby={galat.nama ? 'galat-nama' : undefined}
            />
            {galat.nama && <span className="field__error" id="galat-nama">{galat.nama}</span>}
          </label>

          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            <label className="field" style={{ flex: '1.2 1 160px' }}>
              <span className="field__label">NIS</span>
              <input
                className="input input--mono" value={nis} inputMode="numeric"
                onChange={(e) => setNis(e.target.value.replace(/\D/g, '').slice(0, 10))}
                aria-invalid={Boolean(galat.nis)}
                aria-describedby={galat.nis ? 'galat-nis' : undefined}
              />
              {galat.nis && <span className="field__error" id="galat-nis">{galat.nis}</span>}
            </label>
            <label className="field" style={{ flex: '1 1 120px' }}>
              <span className="field__label">Kelas</span>
              <select className="input" value={kelas} onChange={(e) => setKelas(e.target.value as Kelas)}>
                {KELAS_LIST.map((k) => <option key={k} value={k}>{k}</option>)}
              </select>
            </label>
          </div>

          {/* minWidth 0: fieldset bawaan browser memakai min-inline-size:min-content
              sehingga enam kotak digit menolak menyusut dan meluber keluar kartu. */}
          <fieldset style={{ border: 0, padding: 0, margin: '0 0 8px', minWidth: 0 }}>
            <legend className="field__label" style={{ padding: 0 }}>
              Kode Sesi <span className="field__hint">— ditulis guru di papan</span>
            </legend>
            <div style={{ display: 'flex', gap: 8 }}>
              {digit.map((d, i) => (
                <input
                  key={i}
                  ref={(el) => { kotakDigit.current[i] = el; }}
                  value={d}
                  onChange={(e) => isiDigit(i, e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Backspace' && !digit[i] && i > 0) kotakDigit.current[i - 1]?.focus();
                  }}
                  inputMode="numeric"
                  maxLength={6}
                  // size 1 menekan lebar intrinsik input (bawaannya ±20 karakter).
                  size={1}
                  aria-label={`Angka ke-${i + 1} kode sesi`}
                  style={{
                    flex: 1, minWidth: 0, height: 56, textAlign: 'center',
                    border: `${d ? 2 : 1}px solid ${d ? 'var(--brand)' : 'var(--line-strong)'}`,
                    background: d ? 'var(--brand-wash)' : 'var(--surface)',
                    borderRadius: 'var(--r-sm)', fontFamily: 'var(--mono)', fontSize: 22, color: 'var(--ink)',
                  }}
                />
              ))}
            </div>
            {galat.sesi && <span className="field__error">{galat.sesi}</span>}
          </fieldset>

          <p
            style={{
              display: 'flex', alignItems: 'center', gap: 8, margin: '16px 0 20px',
              fontSize: 12.5, borderRadius: 'var(--r-sm)', padding: '11px 16px',
              color: fase === 'siap' ? 'var(--leaf-muted)' : 'var(--muted)',
              background: fase === 'siap' ? 'var(--leaf-wash)' : 'var(--cream)',
            }}
          >
            {fase === 'siap'
              ? 'Python sudah tersimpan di perangkat ini — ujian dapat berjalan meski internet putus sesaat.'
              : 'Python sedang disiapkan di latar belakang. Kamu tetap bisa mengisi formulir ini.'}
          </p>

          {galatUmum && (
            <p
              role="alert"
              style={{
                margin: '0 0 16px', background: 'var(--brand-wash)', border: '1px solid var(--brand-line)',
                borderRadius: 'var(--r-sm)', padding: '12px 16px', fontSize: 13.5, color: 'var(--brand-deep)',
              }}
            >
              {galatUmum}
            </p>
          )}

          <button type="submit" className="btn btn--primary btn--block" style={{ fontSize: 17, padding: 16 }} disabled={memuat}>
            {memuat ? 'Memuat soal…' : 'Masuk Ujian'}
          </button>
          <p style={{ fontSize: 12, color: 'var(--muted-2)', margin: '14px 0 0', textAlign: 'center' }}>
            Menekan tombol ini memulai timer. Menyalin-tempel kode dinonaktifkan selama ujian.
          </p>

          {MODE_DEMO && (
            <div
              style={{
                marginTop: 16, borderTop: '1px solid var(--line)', paddingTop: 14,
                fontSize: 12, color: 'var(--muted-2)',
              }}
            >
              {sesiDemo.length === 0 ? (
                <p style={{ margin: 0, textAlign: 'center' }}>
                  Mode demo: belum ada sesi yang dibuka. Buka <a href="#/guru">Halaman Guru</a> lebih dulu
                  untuk membuat kode sesi.
                </p>
              ) : (
                <>
                  <p style={{ margin: '0 0 8px', textAlign: 'center' }}>
                    Mode demo — sesi yang sedang berjalan, klik untuk mengisi otomatis:
                  </p>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
                    {sesiDemo.map((s) => (
                      <button
                        key={s.kode}
                        type="button"
                        className="btn btn--ghost btn--sm"
                        onClick={() => {
                          setDigit(s.kode.split(''));
                          setKelas(s.kelas);
                          setGalatUmum('');
                        }}
                      >
                        <span style={{ fontFamily: 'var(--mono)' }}>{s.kode}</span> · {s.kelas} · {s.judul}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </form>
      </section>
    </div>
  );
}

function Fakta({ besar, judul, ket }: { besar: string; judul: string; ket: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, background: 'var(--surface)', borderRadius: 'var(--r-md)', padding: '16px 20px' }}>
      <span aria-hidden="true" style={{ fontFamily: 'var(--display)', fontSize: 24, color: 'var(--brand)', width: 40, flex: 'none' }}>
        {besar}
      </span>
      <span>
        <span style={{ display: 'block', fontSize: 14.5, fontWeight: 600 }}>{judul}</span>
        <span style={{ display: 'block', fontSize: 12.5, color: 'var(--muted-2)' }}>{ket}</span>
      </span>
    </div>
  );
}
