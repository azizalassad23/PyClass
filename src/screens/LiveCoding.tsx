import { useCallback, useEffect, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { Header, NavBeranda } from '../components/Header';
import { GAYA_ANIMASI, Konfeti } from '../components/Konfeti';
import { KonsolPython } from '../components/KonsolPython';
import { KotakContoh } from '../components/KotakContoh';
import { PanelEditor } from '../components/PanelEditor';
import { StatusPython } from '../components/StatusPython';
import { SOAL_KUIS_CEPAT, SOAL_LIVE_CODING, type SoalLiveCoding } from '../content/liveCoding';
import { halamanUnit } from '../content/loader';
import { normalisasiKeluaran } from '../lib/format';
import { acakUrutan } from '../lib/rng';
import { baca, hapus, tulis } from '../lib/storage';
import { bunyiBenar, bunyiSalah, siapkanSuara } from '../lib/suaraTantangan';
import { usePython } from '../python/PythonProvider';
import { useRunner, useRunnerBatch } from '../python/useRunner';

/**
 * Live Coding — soal cerita dari semua unit digabung menjadi kartu bernomor.
 * Murid memilih kartu, baru soalnya terlihat, lalu menulis program utuh dan
 * memeriksanya sendiri terhadap uji contoh dan uji tersembunyi. Semua berjalan
 * di browser; tidak ada yang dikirim ke server.
 */

interface Simpanan {
  kode: Record<string, string>;
  lulus: Record<string, boolean>;
}

interface HasilUji { input: string; harap: string; dapat: string; cocok: boolean; galat: string }
interface HasilPeriksa { contoh: HasilUji[]; tersembunyi: HasilUji[] }

const KUNCI = 'livecoding';
const KOSONG: Simpanan = { kode: {}, lulus: {} };

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

/** Alamat lama per unit (/tantangan/live-coding/u1) sebelum soal digabung. */
export function LiveCodingLama() {
  return <Navigate to="/tantangan/live-coding" replace />;
}

/** Quick quiz di modul materi: papan Live Coding berisi soal unit itu saja. */
export function KuisCepat() {
  const id = (useParams().unit ?? '').toUpperCase();
  const soal = SOAL_KUIS_CEPAT.filter((s) => s.unit === id);
  const modul = halamanUnit(id)[0];
  if (!soal.length || !modul) return <Navigate to="/materi" replace />;
  return (
    <LiveCoding
      key={id}
      soal={soal}
      kunci={`kuiscepat:${id}`}
      judul={`Quick Quiz ${id}`}
      kembali={{ ke: `/materi/${modul.slug}`, label: `Modul ${id}` }}
    />
  );
}

// ── Papan kartu ────────────────────────────────────────────────────────────

export function LiveCoding({
  soal = SOAL_LIVE_CODING, kunci = KUNCI, judul = 'Live Coding', kembali = { ke: '/tantangan', label: 'Tantangan Kilat' },
}: {
  soal?: SoalLiveCoding[];
  kunci?: string;
  judul?: string;
  kembali?: { ke: string; label: string };
}) {
  const jejak = `${kembali.label} · ${judul}`;
  // Urutan diacak setiap kali halaman dibuka dan setiap ganti murid. Kembali
  // dari kartu ke papan tidak mengacak, supaya nomor kartu tetap sama.
  const [urutan, setUrutan] = useState(() => acakUrutan(soal, Math.random));
  const [simpanan, setSimpanan] = useState<Simpanan>(() => baca(kunci, KOSONG));
  const [terbuka, setTerbuka] = useState<SoalLiveCoding | null>(null);
  const { panaskan } = usePython();

  useEffect(() => { panaskan(); }, [panaskan]);
  useEffect(() => { window.scrollTo(0, 0); }, [terbuka]);

  const simpan = useCallback((ubah: (s: Simpanan) => Simpanan) => {
    setSimpanan((lama) => {
      const baru = ubah(lama);
      tulis(kunci, baru);
      return baru;
    });
  }, [kunci]);

  const muridBerikutnya = () => {
    if (!window.confirm('Kosongkan semua kode dan tanda lulus untuk murid berikutnya?')) return;
    hapus(kunci);
    setSimpanan(KOSONG);
    setUrutan(acakUrutan(soal, Math.random));
  };

  const jumlahLulus = urutan.filter((s) => simpanan.lulus[s.id]).length;

  if (terbuka) {
    return (
      <RuangKerja
        key={terbuka.id}
        soal={terbuka}
        nomor={urutan.indexOf(terbuka) + 1}
        simpanan={simpanan}
        simpan={simpan}
        semuaLulus={jumlahLulus === urutan.length}
        jejak={jejak}
        onKembali={() => setTerbuka(null)}
      />
    );
  }

  return (
    <div style={{ background: 'var(--cream)', minHeight: '100vh' }}>
      <Header kanan={<NavBeranda />} jejak={jejak} />
      <main id="isi" className="shell" style={{ padding: 'clamp(22px, 4vw, 40px) clamp(16px, 3vw, 32px) 64px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, flexWrap: 'wrap', marginBottom: 14 }}>
          <div style={{ flex: '1 1 320px' }}>
            <Link to={kembali.ke} style={{ fontSize: 13, color: 'var(--muted-2)', textDecoration: 'none' }}>← {kembali.label}</Link>
            <h1 style={{ fontSize: 'clamp(28px, 4vw, 40px)', margin: '6px 0 0' }}>{judul}</h1>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <span className="pill pill--leaf">Lulus {jumlahLulus}</span>
            <span className="pill pill--quiet">Sisa {urutan.length - jumlahLulus}</span>
            <button type="button" className="btn btn--dark btn--sm" onClick={muridBerikutnya}>
              Murid berikutnya
            </button>
          </div>
        </div>
        <p style={{ fontSize: 15, lineHeight: 1.65, color: 'var(--muted)', maxWidth: 680, margin: '0 0 20px' }}>
          Pilih satu kartu untuk melihat soal ceritanya. Tulis programnya di editor, coba dengan Jalankan, lalu tekan
          Periksa. Tidak ada batas waktu, dan kartu boleh dibuka lagi sampai lulus.
        </p>

        <StatusPython akhiran="Kartu tetap bisa dibuka sambil menunggu." />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 14 }}>
          {urutan.map((s, i) => (
            <MukaKartu
              key={s.id}
              nomor={i + 1}
              lulus={Boolean(simpanan.lulus[s.id])}
              dicoba={Boolean(simpanan.kode[s.id]) && !simpanan.lulus[s.id]}
              onBuka={() => { siapkanSuara(); setTerbuka(s); }}
            />
          ))}
        </div>
      </main>
    </div>
  );
}

function MukaKartu({ nomor, lulus, dicoba, onBuka }: {
  nomor: number;
  lulus: boolean;
  dicoba: boolean;
  onBuka: () => void;
}) {
  const label = lulus ? '✓ Lulus' : dicoba ? 'Sudah dicoba' : null;
  return (
    <button
      type="button"
      onClick={onBuka}
      aria-label={`Kartu ${nomor}${label ? `, ${label}` : ''}`}
      style={{
        textAlign: 'center', cursor: 'pointer', font: 'inherit', color: 'inherit',
        background: lulus ? 'var(--leaf-wash)' : dicoba ? 'var(--brand-wash)' : 'var(--surface)',
        border: `2px solid ${lulus ? 'var(--leaf)' : dicoba ? 'var(--brand-line)' : 'var(--line)'}`,
        borderRadius: 'var(--r-lg)', padding: '16px 14px 14px', minHeight: 130,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8,
        transition: 'box-shadow .12s ease',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; }}
    >
      {/* Muka kartu hanya nomor: judul, unit, dan isi soal baru terlihat setelah dibuka. */}
      <span style={{ fontFamily: 'var(--display)', fontSize: 44, lineHeight: 1 }}>{nomor}</span>
      {label && (
        <span style={{ fontSize: 13, fontWeight: 700, color: lulus ? 'var(--leaf-deep)' : 'var(--brand-deep)' }}>
          {label}
        </span>
      )}
    </button>
  );
}

// ── Kartu yang sedang dikerjakan ───────────────────────────────────────────

function RuangKerja({ soal, nomor, simpanan, simpan, semuaLulus, jejak, onKembali }: {
  soal: SoalLiveCoding;
  nomor: number;
  simpanan: Simpanan;
  simpan: (ubah: (s: Simpanan) => Simpanan) => void;
  semuaLulus: boolean;
  jejak: string;
  onKembali: () => void;
}) {
  const [periksa, setPeriksa] = useState<HasilPeriksa | null>(null);
  const [memeriksa, setMemeriksa] = useState(false);
  const [rayakan, setRayakan] = useState(false);
  const { fase, sedangJalan } = usePython();
  const jalankanUji = useRunnerBatch();
  const { keadaan, mulai, balasInput, bersihkan } = useRunner();

  const kode = simpanan.kode[soal.id] ?? soal.kodeAwal;
  const setKode = (k: string) => simpan((s) => ({ ...s, kode: { ...s.kode, [soal.id]: k } }));
  const pythonSiap = fase === 'siap';
  const lulus = Boolean(simpanan.lulus[soal.id]);

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
    // Program yang tidak pernah berhenti cukup ditunggu sekali: uji sisanya
    // langsung dianggap gagal, bukan menunggu 10 detik lagi di setiap uji.
    let macet = '';
    const uji = async (u: { input: string; output: string }): Promise<HasilUji> => {
      if (macet) return { input: u.input, harap: u.output, dapat: '', cocok: false, galat: macet };
      const h = await ujiSatu(u);
      if (h.galat.includes('batas 10 detik')) macet = h.galat;
      return h;
    };
    for (const u of soal.contoh) hasil.contoh.push(await uji(u));
    for (const u of soal.uji) hasil.tersembunyi.push(await uji(u));
    setMemeriksa(false);
    setPeriksa(hasil);
    if ([...hasil.contoh, ...hasil.tersembunyi].every((h) => h.cocok)) {
      simpan((s) => ({ ...s, lulus: { ...s.lulus, [soal.id]: true } }));
      setRayakan(true);
      bunyiBenar();
    } else {
      bunyiSalah();
    }
  };

  const aturUlang = () => {
    if (!window.confirm('Kembalikan kode kartu ini ke kode awal?')) return;
    setKode(soal.kodeAwal);
    setPeriksa(null);
    bersihkan();
  };

  return (
    <div style={{ background: 'var(--cream)', minHeight: '100vh' }}>
      <Header kanan={<NavBeranda />} jejak={jejak} />
      <style>{GAYA_ANIMASI}</style>

      <div className="shell" style={{ padding: 'clamp(18px, 3vw, 28px) clamp(16px, 3vw, 32px) 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', marginBottom: 18 }}>
          <button type="button" className="btn btn--ghost btn--sm" onClick={onKembali}>← Kembali ke kartu</button>
          <span style={{ fontFamily: 'var(--display)', fontSize: 26 }}>Kartu {nomor}</span>
          {lulus && <span className="pill pill--leaf">✓ Lulus</span>}
        </div>

        <StatusPython akhiran="Kode bisa dijalankan setelah Python siap." />
      </div>

      <div className="shell livecoding" style={{ padding: '0 clamp(16px, 3vw, 32px) 56px' }}>
        <section className="livecoding__editor" aria-label="Editor kode">
          <PanelEditor
            sticky
            namaBerkas={`kartu_${nomor}.py`}
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
            sisipan={<RingkasanPeriksa hasil={periksa} />}
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
          <h2 id="judul-soal" style={{ fontSize: 'clamp(24px, 3vw, 30px)', margin: '0 0 14px', lineHeight: 1.15 }}>
            {soal.judul}
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
              border: '1px solid var(--line)', borderRadius: 'var(--r-sm)', padding: '12px 16px', margin: 0,
            }}
          >
            Periksa menjalankan kodemu dengan {soal.contoh.length} contoh di atas dan {soal.uji.length} uji tersembunyi.
            Setiap masukan dibaca dengan input(), satu baris untuk setiap input(). Teks di dalam input("…") tidak ikut
            dinilai.
          </p>
        </article>
      </div>

      {rayakan && (
        <Perayaan
          semuaLulus={semuaLulus}
          onKembali={onKembali}
          onTutup={() => setRayakan(false)}
        />
      )}
    </div>
  );
}

/**
 * Hasil Periksa. Untuk contoh, keluaran yang diharapkan boleh ditampilkan
 * (sudah tertulis di soal). Untuk uji tersembunyi hanya jumlah yang lulus —
 * masukan dan keluarannya tidak pernah diperlihatkan.
 */
function RingkasanPeriksa({ hasil }: { hasil: HasilPeriksa | null }) {
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

function Perayaan({ semuaLulus, onKembali, onTutup }: {
  semuaLulus: boolean;
  onKembali: () => void;
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
          {semuaLulus ? 'Semua kartu sudah lulus. Hebat!' : 'Programmu lulus semua uji, termasuk uji tersembunyi.'}
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button type="button" className="btn btn--primary" onClick={onKembali} autoFocus>Kembali ke kartu</button>
          <button type="button" className="btn btn--ghost" onClick={onTutup}>Tetap di sini</button>
        </div>
      </div>
    </div>
  );
}
