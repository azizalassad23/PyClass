import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { Header, StatusPython } from '../components/Header';
import { PanelEditor } from '../components/PanelEditor';
import { KonsolPython } from '../components/KonsolPython';
import { RenderMateri } from '../components/RenderMateri';
import { Presentasi } from './Presentasi';
import { HALAMAN, cariHalaman, halamanUnit } from '../content/loader';
import { UNIT_BY_ID } from '../content/units';
import { catatDibaca } from '../lib/jejakBelajar';
import { usePython } from '../python/PythonProvider';
import { useRunner } from '../python/useRunner';

/** W2 — mockup 1c: daftar isi kiri, bacaan tengah, editor menetap di kanan. */
export function Materi() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { panaskan } = usePython();
  const [presentasi, setPresentasi] = useState(false);

  const halaman = slug ? cariHalaman(slug) : HALAMAN[0];

  // F-E06 — mulai unduh Pyodide begitu halaman materi dibuka.
  useEffect(() => { panaskan(); }, [panaskan]);

  useEffect(() => {
    if (halaman) catatDibaca(halaman.slug, halaman.unit, halaman.judul);
  }, [halaman]);

  // F-M02 — navigasi keyboard di mode presentasi ditangani di komponennya.
  if (!slug) return <Navigate to={`/materi/${HALAMAN[0].slug}`} replace />;
  if (!halaman) return <Navigate to="/materi" replace />;

  const unit = UNIT_BY_ID.get(halaman.unit);
  const saudara = halamanUnit(halaman.unit);
  const posisi = saudara.findIndex((h) => h.slug === halaman.slug);
  const sebelum = saudara[posisi - 1];
  const sesudah = saudara[posisi + 1];

  if (presentasi) {
    return (
      <Presentasi
        halaman={halaman}
        onKeluar={() => setPresentasi(false)}
        onPindah={(arah) => {
          const tujuan = arah === 'maju' ? sesudah : sebelum;
          if (tujuan) navigate(`/materi/${tujuan.slug}`);
        }}
        bisaMundur={Boolean(sebelum)}
        bisaMaju={Boolean(sesudah)}
        nomor={posisi + 1}
        total={saudara.length}
      />
    );
  }

  return (
    <div style={{ background: 'var(--cream)', minHeight: '100vh' }}>
      <Header
        ringkas
        jejak={`${halaman.unit} ${unit?.judul ?? ''}`}
        kanan={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <StatusPython />
            <button type="button" className="btn btn--dark btn--sm" onClick={() => setPresentasi(true)}>
              Mode Presentasi
            </button>
          </div>
        }
      />

      <div className="materi">
        <nav className="materi__daftar" aria-label="Daftar isi unit">
          <div className="eyebrow" style={{ marginBottom: 12 }}>Daftar isi</div>
          <div className="materi__daftar-list" style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {saudara.map((h) => {
              const aktif = h.slug === halaman.slug;
              return (
                <Link
                  key={h.slug}
                  to={`/materi/${h.slug}`}
                  aria-current={aktif ? 'page' : undefined}
                  style={{
                    padding: '9px 14px', borderRadius: 'var(--r-pill)', fontSize: 13.5,
                    textDecoration: 'none',
                    background: aktif ? 'var(--brand-tint)' : 'transparent',
                    color: aktif ? 'var(--brand-deep)' : 'var(--muted)',
                    fontWeight: aktif ? 700 : 400,
                  }}
                >
                  {h.judul}
                </Link>
              );
            })}
          </div>

          <div style={{ height: 1, background: 'var(--line)', margin: '18px 0' }} />

          <div style={{ background: 'var(--leaf-wash)', borderRadius: 'var(--r-md)', padding: 16 }}>
            <div className="eyebrow" style={{ color: 'var(--leaf-deep)', marginBottom: 6 }}>Penutup unit</div>
            {unit?.kuis ? (
              <>
                <div style={{ fontSize: 13, color: 'var(--leaf-ink)', lineHeight: 1.5, marginBottom: 12 }}>
                  Kuis {halaman.unit} — 5 soal, 20 menit
                </div>
                <Link
                  to="/ujian"
                  style={{
                    display: 'block', textAlign: 'center', background: 'var(--surface)',
                    color: 'var(--leaf-ink)', fontFamily: 'var(--display)', fontSize: 13,
                    padding: '10px 12px', borderRadius: 'var(--r-pill)', textDecoration: 'none',
                  }}
                >
                  Buka kuis
                </Link>
              </>
            ) : (
              <div style={{ fontSize: 13, color: 'var(--leaf-ink)', lineHeight: 1.5 }}>
                Unit ini dinilai dengan rubrik proyek, bukan kuis otomatis.
              </div>
            )}
          </div>

          <div style={{ marginTop: 18 }}>
            <div className="eyebrow" style={{ marginBottom: 8 }}>Unit lain</div>
            <Link to="/" style={{ fontSize: 13, color: 'var(--muted)', textDecoration: 'none' }}>
              ← Semua unit
            </Link>
          </div>
        </nav>

        <main className="materi__isi" id="isi">
          <div className="eyebrow" style={{ color: 'var(--brand-hover)', marginBottom: 8 }}>
            Unit {unit?.nomor ?? ''} · Halaman {posisi + 1} dari {saudara.length}
          </div>
          <h1 style={{ fontSize: 'clamp(28px, 4vw, 38px)', lineHeight: 1.1, margin: '0 0 6px' }}>
            {halaman.judul}
          </h1>
          <p style={{ fontSize: 13.5, color: 'var(--muted-2)', margin: '0 0 24px' }}>{halaman.pertemuan}</p>

          <MateriDenganEditor halaman={halaman} />

          <nav
            style={{
              display: 'flex', justifyContent: 'space-between', gap: 12,
              marginTop: 32, fontSize: 13.5, flexWrap: 'wrap',
            }}
          >
            {sebelum ? (
              <Link to={`/materi/${sebelum.slug}`} style={{ color: 'var(--muted-2)', textDecoration: 'none' }}>
                ← {sebelum.judul}
              </Link>
            ) : (
              <span />
            )}
            {sesudah && (
              <Link
                to={`/materi/${sesudah.slug}`}
                style={{ color: 'var(--brand-deep)', fontWeight: 700, textDecoration: 'none' }}
              >
                {sesudah.judul} →
              </Link>
            )}
          </nav>
        </main>

        <EditorSamping />
      </div>
    </div>
  );
}

/**
 * Bacaan + kartu latihan mandiri (F-M04). Editor sampingnya dikendalikan lewat
 * event kustom sederhana supaya kedua kolom tidak perlu saling mengoper props
 * melalui seluruh pohon.
 */
function MateriDenganEditor({ halaman }: { halaman: ReturnType<typeof cariHalaman> }) {
  const [percobaan, setPercobaan] = useState(0);
  const [petunjukTampil, setPetunjukTampil] = useState(false);

  useEffect(() => {
    setPercobaan(0);
    setPetunjukTampil(false);
  }, [halaman?.slug]);

  if (!halaman) return null;

  const kirimKeEditor = (kode: string) => {
    window.dispatchEvent(new CustomEvent('pyclass:editor', { detail: kode }));
    document.getElementById('editor-samping')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  return (
    <>
      <RenderMateri halaman={halaman} onKirimKeEditor={kirimKeEditor} />

      {halaman.latihan && (
        <section className="card" style={{ borderRadius: 'var(--r-lg)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
            <span
              aria-hidden="true"
              style={{
                width: 22, height: 22, borderRadius: 999, background: 'var(--brand)', color: '#fff',
                fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              ?
            </span>
            <span style={{ fontFamily: 'var(--display)', fontSize: 17 }}>Latihan mandiri</span>
            <span className="pill pill--quiet">tidak dinilai · tidak dikirim ke mana pun</span>
          </div>
          <p style={{ fontSize: 14.5, lineHeight: 1.6, color: 'var(--body)', margin: '0 0 14px' }}>
            {halaman.latihan.instruksi}
          </p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn--primary btn--sm"
              onClick={() => {
                kirimKeEditor(halaman.latihan!.kodeAwal);
                setPercobaan((n) => n + 1);
              }}
            >
              {percobaan === 0 ? 'Buka di editor' : 'Muat ulang kerangka'}
            </button>
            <button
              type="button"
              className="btn btn--ghost btn--sm"
              onClick={() => setPetunjukTampil(true)}
              disabled={percobaan < 2 && !petunjukTampil}
              title={percobaan < 2 ? 'Petunjuk terbuka setelah dua kali percobaan' : undefined}
            >
              {percobaan < 2 && !petunjukTampil ? `Petunjuk (setelah ${2 - percobaan} percobaan lagi)` : 'Lihat petunjuk'}
            </button>
          </div>
          {petunjukTampil && (
            <p
              style={{
                margin: '14px 0 0', background: 'var(--brand-wash)', borderRadius: 'var(--r-sm)',
                padding: '12px 16px', fontSize: 14, lineHeight: 1.6, color: 'var(--body)',
              }}
            >
              {halaman.latihan.petunjuk}
            </p>
          )}
        </section>
      )}
    </>
  );
}

/** Editor menetap di kolom kanan — mockup 1c. */
function EditorSamping() {
  const [kode, setKode] = useState('print("Halo, PyClass!")\n');
  const awal = useMemo(() => kode, []); // untuk tombol "Atur ulang"
  const { keadaan, mulai, balasInput, bersihkan, sedangJalan } = useRunner();

  useEffect(() => {
    const onMuat = (e: Event) => {
      const detail = (e as CustomEvent<string>).detail;
      setKode(detail);
      bersihkan();
    };
    window.addEventListener('pyclass:editor', onMuat);
    return () => window.removeEventListener('pyclass:editor', onMuat);
  }, [bersihkan]);

  return (
    <aside className="materi__editor" id="editor-samping" aria-label="Editor Python">
      <PanelEditor
        sticky
        namaBerkas="latihan.py"
        kode={kode}
        onKode={setKode}
        onJalankan={() => void mulai(kode)}
        sedangJalan={sedangJalan}
        onAturUlang={() => { setKode(awal); bersihkan(); }}
        minHeight={200}
        konsol={
          <KonsolPython
            keadaan={keadaan}
            sedangJalan={sedangJalan}
            onKirimInput={(baris) => void balasInput(kode, baris)}
            kosongPesan="Tulis kode di atas lalu tekan Jalankan (atau Ctrl + Enter)."
          />
        }
      />
    </aside>
  );
}
