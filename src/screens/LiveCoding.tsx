import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { Header, NavBeranda } from '../components/Header';
import { GAYA_ANIMASI, Konfeti } from '../components/Konfeti';
import { KonsolPython } from '../components/KonsolPython';
import { PanelEditor } from '../components/PanelEditor';
import { SOAL_LIVE_CODING, UNIT_LIVE_CODING, type SoalLiveCoding } from '../content/liveCoding';
import { UNIT_BY_ID } from '../content/units';
import { normalisasiKeluaran } from '../lib/format';
import { baca, hapus, tulis } from '../lib/storage';
import { bunyiBenar, bunyiSalah, siapkanSuara } from '../lib/suaraTantangan';
import { usePython } from '../python/PythonProvider';
import { useRunner, useRunnerBatch } from '../python/useRunner';

/**
 * Live Coding — murid menulis program utuh untuk soal cerita, lalu memeriksanya
 * sendiri terhadap uji contoh dan uji tersembunyi. Semua berjalan di browser;
 * tidak ada yang dikirim ke server.
 */

interface Simpanan {
  kode: Record<string, string>;
  lulus: Record<string, boolean>;
}

interface HasilUji { input: string; harap: string; dapat: string; cocok: boolean; galat: string }
interface HasilPeriksa { contoh: HasilUji[]; tersembunyi: HasilUji[] }

/**
 * Teks ajakan di input("Nama: ") ikut tercetak ke keluaran dan akan membuat
 * keluaran tidak cocok. Saat memeriksa, input() diganti versi tanpa ajakan —
 * hanya di namespace program ini, jadi tombol Jalankan tetap menampilkannya.
 * Satu baris, jadi nomor baris di pesan error cukup dikurangi satu.
 */
const TANPA_AJAKAN = "input = (lambda f: lambda p='': f())(input)\n";

function rapikanGalat(galat: string): string {
  const baris = galat.trim().split('\n');
  const terakhir = baris[baris.length - 1] ?? '';
  const nomor = galat.match(/line (\d+)/g)?.pop()?.match(/\d+/)?.[0];
  return nomor && Number(nomor) > 1 ? `Baris ${Number(nomor) - 1}: ${terakhir}` : terakhir;
}

// ── Pilih unit ─────────────────────────────────────────────────────────────

export function LiveCodingMenu() {
  return (
    <div style={{ background: 'var(--cream)', minHeight: '100vh' }}>
      <Header kanan={<NavBeranda />} jejak="Tantangan Kilat" />
      <main id="isi" className="shell" style={{ padding: 'clamp(28px, 5vw, 56px) clamp(16px, 3vw, 32px) 64px' }}>
        <Link to="/tantangan" style={{ fontSize: 13, color: 'var(--muted-2)', textDecoration: 'none' }}>← Tantangan Kilat</Link>
        <h1 style={{ fontSize: 'clamp(32px, 5vw, 48px)', margin: '10px 0 10px' }}>Live Coding</h1>
        <p style={{ fontSize: 16, lineHeight: 1.65, color: 'var(--muted)', maxWidth: 660, margin: '0 0 30px' }}>
          Pilih unit. Setiap unit berisi 10 soal cerita. Tulis programnya di editor, coba dengan tombol Jalankan, lalu
          tekan Periksa. Kodemu diuji dengan contoh di soal dan beberapa uji tersembunyi — semuanya di perangkat ini,
          tanpa batas waktu, dan tidak dikirim ke guru.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
          {UNIT_LIVE_CODING.map((id) => {
            const unit = UNIT_BY_ID.get(id);
            const { lulus } = baca<Simpanan>(`livecoding:${id}`, { kode: {}, lulus: {} });
            const jumlah = SOAL_LIVE_CODING.filter((s) => s.unit === id).length;
            const selesai = SOAL_LIVE_CODING.filter((s) => s.unit === id && lulus[s.id]).length;
            return (
              <Link
                key={id}
                to={`/tantangan/live-coding/${id.toLowerCase()}`}
                className="card"
                style={{ textDecoration: 'none', color: 'inherit', display: 'block', padding: '22px 22px 20px' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span
                    style={{
                      width: 44, height: 44, borderRadius: 999, background: 'var(--ink)', color: '#fff',
                      fontFamily: 'var(--display)', fontSize: 17, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    {id}
                  </span>
                  <span className={selesai > 0 ? 'pill pill--leaf' : 'pill pill--quiet'}>
                    {selesai > 0 ? `${selesai}/${jumlah} lulus` : `${jumlah} soal`}
                  </span>
                </div>
                <h2 style={{ fontSize: 20, margin: '0 0 6px' }}>{unit?.judul}</h2>
                <p style={{ fontSize: 13, color: 'var(--muted-2)', margin: 0 }}>{unit?.ringkas}</p>
              </Link>
            );
          })}
        </div>
        <p style={{ fontSize: 13, color: 'var(--muted-2)', margin: '22px 0 0' }}>Unit 4–7 menyusul.</p>
      </main>
    </div>
  );
}

// ── Ruang kerja satu unit ──────────────────────────────────────────────────

export function LiveCodingUnit() {
  const { unit: param } = useParams();
  const unitId = (param ?? '').toUpperCase();
  const unit = UNIT_BY_ID.get(unitId);
  const soalUnit = useMemo(() => SOAL_LIVE_CODING.filter((s) => s.unit === unitId), [unitId]);
  const kunci = `livecoding:${unitId}`;
  const [simpanan, setSimpanan] = useState<Simpanan>(() => baca(kunci, { kode: {}, lulus: {} }));
  const [indeks, setIndeks] = useState(0);
  const [periksa, setPeriksa] = useState<Record<string, HasilPeriksa>>({});
  const [memeriksa, setMemeriksa] = useState(false);
  const [rayakan, setRayakan] = useState(false);

  const { fase, pesanFase, panaskan, sedangJalan } = usePython();
  const jalankanUji = useRunnerBatch();
  const { keadaan, mulai, balasInput, bersihkan } = useRunner();

  useEffect(() => { panaskan(); }, [panaskan]);
  useEffect(() => {
    setSimpanan(baca(kunci, { kode: {}, lulus: {} }));
    setIndeks(0);
    setPeriksa({});
  }, [kunci]);

  const soal: SoalLiveCoding | undefined = soalUnit[indeks];
  // Konsol dikosongkan saat pindah soal agar keluaran soal lain tidak tertinggal.
  useEffect(() => { bersihkan(); }, [soal?.id, bersihkan]);

  const simpan = useCallback((ubah: (s: Simpanan) => Simpanan) => {
    setSimpanan((lama) => {
      const baru = ubah(lama);
      tulis(kunci, baru);
      return baru;
    });
  }, [kunci]);

  if (!unit || !soal) return <Navigate to="/tantangan/live-coding" replace />;

  const kode = simpanan.kode[soal.id] ?? soal.kodeAwal;
  const setKode = (k: string) => simpan((s) => ({ ...s, kode: { ...s.kode, [soal.id]: k } }));
  const pythonSiap = fase === 'siap';
  const jumlahLulus = soalUnit.filter((s) => simpanan.lulus[s.id]).length;

  const ujiSatu = async (u: { input: string; output: string }): Promise<HasilUji> => {
    const { keluaran, galat } = await jalankanUji(TANPA_AJAKAN + kode, u.input);
    return {
      input: u.input, harap: u.output, dapat: keluaran, galat: galat ? rapikanGalat(galat) : '',
      cocok: !galat && normalisasiKeluaran(keluaran) === normalisasiKeluaran(u.output),
    };
  };

  const jalankanPeriksa = async () => {
    if (memeriksa || !pythonSiap) return;
    siapkanSuara();
    setMemeriksa(true);
    const hasil: HasilPeriksa = { contoh: [], tersembunyi: [] };
    for (const u of soal.contoh) hasil.contoh.push(await ujiSatu(u));
    for (const u of soal.uji) hasil.tersembunyi.push(await ujiSatu(u));
    setMemeriksa(false);
    setPeriksa((p) => ({ ...p, [soal.id]: hasil }));
    const lulus = [...hasil.contoh, ...hasil.tersembunyi].every((h) => h.cocok);
    if (lulus) {
      simpan((s) => ({ ...s, lulus: { ...s.lulus, [soal.id]: true } }));
      setRayakan(true);
      bunyiBenar();
    } else {
      bunyiSalah();
    }
  };

  const muridBerikutnya = () => {
    if (!window.confirm('Kosongkan semua kode dan tanda lulus di unit ini untuk murid berikutnya?')) return;
    hapus(kunci);
    setSimpanan({ kode: {}, lulus: {} });
    setPeriksa({});
    setIndeks(0);
    bersihkan();
  };

  const aturUlang = () => {
    if (!window.confirm('Kembalikan kode soal ini ke kode awal?')) return;
    setKode(soal.kodeAwal);
    setPeriksa(({ [soal.id]: _, ...sisa }) => sisa);
    bersihkan();
  };

  return (
    <div style={{ background: 'var(--cream)', minHeight: '100vh' }}>
      <Header kanan={<NavBeranda />} jejak="Tantangan Kilat · Live Coding" />
      <style>{GAYA_ANIMASI}</style>

      <div className="shell" style={{ padding: 'clamp(18px, 3vw, 28px) clamp(16px, 3vw, 32px) 0' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, flexWrap: 'wrap', marginBottom: 16 }}>
          <div style={{ flex: '1 1 320px' }}>
            <Link to="/tantangan/live-coding" style={{ fontSize: 13, color: 'var(--muted-2)', textDecoration: 'none' }}>← Pilih unit</Link>
            <h1 style={{ fontSize: 'clamp(26px, 3.6vw, 36px)', margin: '6px 0 0' }}>
              {unit.id} · {unit.judul}
            </h1>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <span className="pill pill--leaf">Lulus {jumlahLulus}/{soalUnit.length}</span>
            <button type="button" className="btn btn--dark btn--sm" onClick={muridBerikutnya}>
              Murid berikutnya
            </button>
          </div>
        </div>

        <nav aria-label="Pilih soal" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>
          {soalUnit.map((s, i) => {
            const aktif = i === indeks;
            const lulus = simpanan.lulus[s.id];
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setIndeks(i)}
                aria-label={`Soal ${i + 1}${lulus ? ', lulus' : ''}`}
                aria-current={aktif ? 'true' : undefined}
                style={{
                  width: 44, height: 44, borderRadius: 999, cursor: 'pointer',
                  fontFamily: 'var(--mono)', fontSize: 15, fontWeight: 700,
                  border: lulus && !aktif ? '2px solid var(--leaf)' : '2px solid transparent',
                  background: aktif ? 'var(--brand)' : lulus ? 'var(--leaf-wash)' : 'var(--surface)',
                  color: aktif ? '#fff' : lulus ? 'var(--leaf-deep)' : 'var(--muted-2)',
                  boxShadow: aktif ? 'var(--shadow-sm)' : undefined,
                }}
              >
                {lulus && !aktif ? '✓' : i + 1}
              </button>
            );
          })}
        </nav>

        {!pythonSiap && (
          <p
            role="status"
            style={{
              margin: '0 0 16px', padding: '12px 16px', borderRadius: 'var(--r-sm)', fontSize: 13.5,
              background: fase === 'gagal' ? 'var(--brand-wash)' : 'var(--surface)', color: 'var(--muted)',
              border: '1px solid var(--line)',
            }}
          >
            {fase === 'gagal' ? pesanFase : `${pesanFase || 'Menyiapkan Python…'} Kode bisa dijalankan setelah Python siap.`}
          </p>
        )}
      </div>

      <div className="shell livecoding" style={{ padding: '0 clamp(16px, 3vw, 32px) 56px' }}>
        <section className="livecoding__editor" aria-label="Editor kode">
          <PanelEditor
            sticky
            namaBerkas={`soal_${indeks + 1}.py`}
            kode={kode}
            onKode={setKode}
            onJalankan={() => void mulai(kode)}
            sedangJalan={sedangJalan}
            onAturUlang={aturUlang}
            aksiTambahan={
              <button
                type="button"
                className="btn btn--onDark btn--sm"
                onClick={() => void jalankanPeriksa()}
                disabled={!pythonSiap || memeriksa || sedangJalan}
              >
                {memeriksa ? 'Memeriksa…' : 'Periksa'}
              </button>
            }
            minHeight={300}
            sisipan={<RingkasanPeriksa hasil={periksa[soal.id]} />}
            konsol={
              <KonsolPython
                keadaan={keadaan}
                sedangJalan={sedangJalan}
                onKirimInput={(baris) => void balasInput(kode, baris)}
                kosongPesan="Tekan Jalankan untuk mencoba kodemu dengan masukan yang kamu ketik sendiri."
              />
            }
          />
        </section>

        <article className="livecoding__soal" aria-labelledby="judul-soal">
          <span className="eyebrow" style={{ color: 'var(--brand-hover)' }}>
            Soal {indeks + 1} dari {soalUnit.length}
          </span>
          <h2 id="judul-soal" style={{ fontSize: 'clamp(24px, 3vw, 30px)', margin: '8px 0 14px', lineHeight: 1.15 }}>
            {soal.judul}
            {simpanan.lulus[soal.id] && (
              <span className="pill pill--leaf" style={{ marginLeft: 10, verticalAlign: 'middle' }}>✓ Lulus</span>
            )}
          </h2>
          <div style={{ fontSize: 16, lineHeight: 1.7, color: 'var(--body)', marginBottom: 20 }}>
            {soal.cerita.split('\n\n').map((p, i) => (
              // Paragraf berisi <isian> tanpa butir adalah format keluaran: tampilkan seperti kode.
              /<[^>]+>/.test(p) && !/^•/m.test(p) ? (
                <pre
                  key={i}
                  style={{
                    margin: '0 0 12px', padding: '10px 14px', background: 'var(--cream)', borderRadius: 'var(--r-sm)',
                    border: '1px solid var(--line)', fontSize: 14, whiteSpace: 'pre-wrap', color: 'var(--ink)',
                  }}
                >
                  {p}
                </pre>
              ) : (
                <p key={i} style={{ margin: '0 0 12px', whiteSpace: 'pre-wrap' }}>{p}</p>
              )
            ))}
          </div>

          <div style={{ display: 'grid', gap: 12, marginBottom: 18 }}>
            {soal.contoh.map((k, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <KotakContoh label={`Contoh masukan ${i + 1}`} isi={k.input} />
                <KotakContoh label={`Contoh keluaran ${i + 1}`} isi={k.output} />
              </div>
            ))}
          </div>

          <p
            style={{
              fontSize: 13, lineHeight: 1.6, color: 'var(--muted-2)', background: 'var(--surface)',
              border: '1px solid var(--line)', borderRadius: 'var(--r-sm)', padding: '12px 16px', margin: '0 0 18px',
            }}
          >
            Periksa menjalankan kodemu dengan {soal.contoh.length} contoh di atas dan {soal.uji.length} uji tersembunyi.
            Setiap masukan dibaca dengan input(), satu baris untuk setiap input(). Teks di dalam input("…") tidak ikut
            dinilai.
          </p>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'space-between' }}>
            <button
              type="button" className="btn btn--ghost btn--sm"
              onClick={() => setIndeks((i) => Math.max(0, i - 1))} disabled={indeks === 0}
            >
              ← Soal {indeks > 0 ? indeks : ''}
            </button>
            <button
              type="button" className="btn btn--ghost btn--sm"
              onClick={() => setIndeks((i) => Math.min(soalUnit.length - 1, i + 1))} disabled={indeks === soalUnit.length - 1}
            >
              Soal {indeks < soalUnit.length - 1 ? indeks + 2 : ''} →
            </button>
          </div>
        </article>
      </div>

      {rayakan && (
        <Perayaan
          adaBerikutnya={indeks < soalUnit.length - 1}
          semuaLulus={jumlahLulus === soalUnit.length}
          onBerikutnya={() => { setRayakan(false); setIndeks((i) => i + 1); }}
          onTutup={() => setRayakan(false)}
        />
      )}
    </div>
  );
}

function KotakContoh({ label, isi }: { label: string; isi: string }) {
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--r-sm)', padding: '10px 14px' }}>
      <div className="eyebrow" style={{ fontSize: 10, marginBottom: 4 }}>{label}</div>
      <pre style={{ margin: 0, fontSize: 14, whiteSpace: 'pre-wrap', color: 'var(--ink)' }}>
        {isi === '' ? '(kosong)' : isi}
      </pre>
    </div>
  );
}

/**
 * Hasil Periksa. Untuk contoh, keluaran yang diharapkan boleh ditampilkan
 * (sudah tertulis di soal). Untuk uji tersembunyi hanya jumlah yang lulus —
 * masukan dan keluarannya tidak pernah diperlihatkan.
 */
function RingkasanPeriksa({ hasil }: { hasil?: HasilPeriksa }) {
  if (!hasil) {
    return (
      <div style={{ padding: '12px 16px', background: 'var(--ink)', fontSize: 12.5, color: 'var(--muted-3)', fontFamily: 'var(--sans)' }}>
        Tekan Periksa bila programmu sudah siap dinilai.
      </div>
    );
  }
  const lulusContoh = hasil.contoh.filter((h) => h.cocok).length;
  const lulusTersembunyi = hasil.tersembunyi.filter((h) => h.cocok).length;
  const semua = lulusContoh === hasil.contoh.length && lulusTersembunyi === hasil.tersembunyi.length;
  const galatPertama = [...hasil.contoh, ...hasil.tersembunyi].find((h) => h.galat)?.galat;
  return (
    <div role="status" style={{ padding: '12px 16px 14px', background: 'var(--ink)', fontFamily: 'var(--sans)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 13.5, fontWeight: 700, color: semua ? 'var(--leaf)' : 'var(--brand-lit)' }}>
          {semua ? '✓ Semua uji lulus' : '✗ Belum tepat'}
        </span>
        <span style={{ fontSize: 12.5, color: 'var(--muted-3)' }}>
          contoh {lulusContoh}/{hasil.contoh.length} · tersembunyi {lulusTersembunyi}/{hasil.tersembunyi.length}
        </span>
      </div>
      {galatPertama && (
        <div style={{ fontSize: 12.5, color: 'var(--brand-lit)', lineHeight: 1.6, fontFamily: 'var(--mono)', marginBottom: 4 }}>
          Program error — {galatPertama}. Tekan Jalankan untuk melihat penjelasannya.
        </div>
      )}
      {hasil.contoh.map((h, i) => (h.cocok || h.galat ? null : (
        <div key={i} style={{ fontSize: 12.5, color: '#e8ddd0', lineHeight: 1.6, fontFamily: 'var(--mono)' }}>
          contoh {i + 1}: diharapkan <b style={{ color: 'var(--leaf)' }}>{h.harap.replace(/\n/g, ' ⏎ ') || '(kosong)'}</b>
          {' '}· keluaranmu <b style={{ color: 'var(--brand-lit)' }}>{h.dapat.trim().replace(/\n/g, ' ⏎ ') || '(kosong)'}</b>
        </div>
      )))}
      {!semua && lulusContoh === hasil.contoh.length && (
        <div style={{ fontSize: 12.5, color: '#e8ddd0', lineHeight: 1.6 }}>
          Contoh sudah lulus, tetapi ada uji tersembunyi yang gagal. Baca lagi soalnya — perhatikan batas seperti
          "minimal", "lebih dari", atau nilai 0.
        </div>
      )}
    </div>
  );
}

function Perayaan({ adaBerikutnya, semuaLulus, onBerikutnya, onTutup }: {
  adaBerikutnya: boolean;
  semuaLulus: boolean;
  onBerikutnya: () => void;
  onTutup: () => void;
}) {
  useEffect(() => {
    const tutup = (e: KeyboardEvent) => { if (e.key === 'Escape') onTutup(); };
    window.addEventListener('keydown', tutup);
    return () => window.removeEventListener('keydown', tutup);
  }, [onTutup]);
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="judul-perayaan"
      style={{
        position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(32, 30, 29, 0.6)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
      }}
    >
      <div
        className="tantangan-muncul"
        style={{
          position: 'relative', width: '100%', maxWidth: 520, background: 'var(--surface)',
          borderRadius: 'var(--r-xl)', boxShadow: 'var(--shadow-lg)', padding: '34px 28px 26px', textAlign: 'center',
          border: '2px solid var(--leaf)',
        }}
      >
        <Konfeti />
        <div id="judul-perayaan" style={{ fontFamily: 'var(--display)', fontSize: 'clamp(44px, 9vw, 68px)', lineHeight: 1.05, color: 'var(--leaf-deep)' }}>
          BENAR!
        </div>
        <p style={{ fontSize: 15.5, color: 'var(--muted)', margin: '10px 0 22px' }}>
          {semuaLulus ? 'Semua soal di unit ini sudah lulus. Hebat!' : 'Programmu lulus semua uji, termasuk uji tersembunyi.'}
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          {adaBerikutnya && (
            <button type="button" className="btn btn--primary" onClick={onBerikutnya} autoFocus>Soal berikutnya →</button>
          )}
          <button type="button" className="btn btn--ghost" onClick={onTutup} autoFocus={!adaBerikutnya}>Tutup</button>
        </div>
      </div>
    </div>
  );
}
