import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { Header, NavBeranda } from '../components/Header';
import {
  KARTU, UNIT_TANTANGAN, WAKTU_TINGKAT, type JenisKartu, type KartuTantangan,
} from '../content/tantangan';
import { UNIT_BY_ID } from '../content/units';
import { baca, hapus, tulis } from '../lib/storage';
import { bunyiBenar, bunyiDetak, bunyiSalah, siapkanSuara } from '../lib/suaraTantangan';
import { usePython } from '../python/PythonProvider';
import { useRunnerBatch } from '../python/useRunner';

/**
 * Tantangan Kilat — kuis langsung di depan kelas. Murid membuka satu kartu,
 * menjawab sebelum waktunya habis, dan guru mencatat sendiri hasilnya.
 * Tidak ada yang dikirim ke server.
 */

type Status = 'benar' | 'salah' | 'habis';
interface HasilKartu { status: Status; jawaban: string }

const LABEL_JENIS: Record<JenisKartu, string> = {
  keluaran: 'Tebak keluaran',
  lengkapi: 'Lengkapi kode',
  'cari-salah': 'Cari kesalahan',
  isian: 'Isian',
};

/**
 * Jawaban teks dibandingkan setelah dirapikan: spasi berlebih, tanda kutip
 * ganda/tunggal, dan spasi di sekitar koma atau kurung tidak dipersoalkan —
 * yang dinilai adalah pemahaman murid, bukan ketelitian mengetik spasi.
 */
export function rapikanJawaban(s: string): string {
  let t = s.trim().replace(/\s+/g, ' ').replace(/"/g, "'");
  t = t.replace(/\s*([,:])\s*/g, '$1 ').replace(/([[({])\s+/g, '$1').replace(/\s+([\])}])/g, '$1').trim();
  if (t.length >= 2 && t.startsWith("'") && t.endsWith("'") && !t.slice(1, -1).includes("'")) t = t.slice(1, -1);
  return t;
}

/** Fisher–Yates: setiap urutan sama mungkinnya. */
function acak<T>(daftar: T[]): T[] {
  const hasil = daftar.slice();
  for (let i = hasil.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [hasil[i], hasil[j]] = [hasil[j], hasil[i]];
  }
  return hasil;
}

function tanyaKartu(k: KartuTantangan): string {
  if (k.jenis === 'keluaran') return 'Apa keluaran kode ini?';
  if (k.jenis === 'lengkapi') return `Lengkapi bagian ___ agar keluarannya: ${k.target}`;
  if (k.jenis === 'cari-salah') return 'Kode ini error. Baris ke berapa yang menyebabkan error?';
  return k.tanya ?? '';
}

function petunjukJawab(k: KartuTantangan): string {
  if (k.jenis === 'lengkapi') return 'Ketik hanya bagian yang kosong';
  if (k.jenis === 'cari-salah') return 'Ketik nomor barisnya';
  if (k.jenis === 'keluaran') return 'Ketik keluarannya persis';
  return 'Ketik jawabanmu';
}

// ── Menu pilih unit ────────────────────────────────────────────────────────

export function TantanganMenu() {
  return (
    <div style={{ background: 'var(--cream)', minHeight: '100vh' }}>
      <Header kanan={<NavBeranda />} jejak="Tantangan Kilat" />
      <main id="isi" className="shell" style={{ padding: 'clamp(28px, 5vw, 56px) clamp(16px, 3vw, 32px) 64px' }}>
        <span className="pill pill--brand" style={{ marginBottom: 14 }}>Kuis langsung di kelas</span>
        <h1 style={{ fontSize: 'clamp(32px, 5vw, 48px)', margin: '0 0 10px' }}>Tantangan Kilat</h1>
        <p style={{ fontSize: 16, lineHeight: 1.65, color: 'var(--muted)', maxWidth: 640, margin: '0 0 30px' }}>
          Pilih unit, lalu buka kartu satu per satu. Setiap unit berisi 20 kartu dalam urutan acak, dengan waktu 60
          detik sampai 2 menit tergantung tingkat kesulitannya. Jawaban hanya bisa dikirim sekali per kartu.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
          {UNIT_TANTANGAN.map((id) => {
            const unit = UNIT_BY_ID.get(id);
            const hasil = baca<Record<string, HasilKartu>>(`tantangan:${id}`, {});
            const selesai = Object.keys(hasil).length;
            const jumlah = KARTU.filter((k) => k.unit === id).length;
            return (
              <Link
                key={id}
                to={`/tantangan/${id.toLowerCase()}`}
                className="card"
                style={{ textDecoration: 'none', color: 'inherit', display: 'block', padding: '22px 22px 20px' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span
                    style={{
                      width: 44, height: 44, borderRadius: 999, background: 'var(--brand)', color: '#fff',
                      fontFamily: 'var(--display)', fontSize: 17, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    {id}
                  </span>
                  <span className="pill pill--quiet">{selesai > 0 ? `${selesai}/${jumlah} terbuka` : `${jumlah} kartu`}</span>
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

// ── Papan kartu satu unit ──────────────────────────────────────────────────

export function TantanganUnit() {
  const { unit: param } = useParams();
  const unitId = (param ?? '').toUpperCase();
  const unit = UNIT_BY_ID.get(unitId);
  const semua = useMemo(() => KARTU.filter((k) => k.unit === unitId), [unitId]);
  // Urutan diacak setiap kali unit dibuka dan setiap ganti murid, supaya
  // murid yang menunggu giliran tidak bisa menghafal "kartu nomor 3".
  const [kartu, setKartu] = useState(() => acak(semua));
  useEffect(() => { setKartu(acak(semua)); }, [semua]);
  const kunci = `tantangan:${unitId}`;
  const [hasil, setHasil] = useState<Record<string, HasilKartu>>(() => baca(kunci, {}));
  const [terbuka, setTerbuka] = useState<KartuTantangan | null>(null);
  const { fase, pesanFase, panaskan } = usePython();

  useEffect(() => { panaskan(); }, [panaskan]);

  if (!unit || semua.length === 0) return <Navigate to="/tantangan" replace />;

  const simpan = (id: string, h: HasilKartu) => {
    const baru = { ...hasil, [id]: h };
    setHasil(baru);
    tulis(kunci, baru);
  };

  const muridBerikutnya = () => {
    if (!window.confirm('Kosongkan semua kartu untuk murid berikutnya?')) return;
    hapus(kunci);
    setHasil({});
    setKartu(acak(semua));
  };

  const hitung = (s: Status) => Object.values(hasil).filter((h) => h.status === s).length;
  const pythonSiap = fase === 'siap';

  return (
    <div style={{ background: 'var(--cream)', minHeight: '100vh' }}>
      <Header kanan={<NavBeranda />} jejak="Tantangan Kilat" />
      <main id="isi" className="shell" style={{ padding: 'clamp(22px, 4vw, 40px) clamp(16px, 3vw, 32px) 64px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, flexWrap: 'wrap', marginBottom: 20 }}>
          <div style={{ flex: '1 1 320px' }}>
            <Link to="/tantangan" style={{ fontSize: 13, color: 'var(--muted-2)', textDecoration: 'none' }}>← Pilih unit</Link>
            <h1 style={{ fontSize: 'clamp(28px, 4vw, 40px)', margin: '6px 0 0' }}>
              {unit.id} · {unit.judul}
            </h1>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <span className="pill pill--leaf">Benar {hitung('benar')}</span>
            <span className="pill pill--brand">Salah {hitung('salah')}</span>
            <span className="pill pill--quiet">Waktu habis {hitung('habis')}</span>
            <span className="pill pill--quiet">Sisa {kartu.length - Object.keys(hasil).length}</span>
            <button type="button" className="btn btn--dark btn--sm" onClick={muridBerikutnya}>
              Murid berikutnya
            </button>
          </div>
        </div>

        {!pythonSiap && (
          <p
            role="status"
            style={{
              margin: '0 0 18px', padding: '12px 16px', borderRadius: 'var(--r-sm)', fontSize: 13.5,
              background: fase === 'gagal' ? 'var(--brand-wash)' : 'var(--surface)', color: 'var(--muted)',
              border: '1px solid var(--line)',
            }}
          >
            {fase === 'gagal' ? pesanFase : `${pesanFase || 'Menyiapkan Python…'} Kartu bisa dibuka setelah Python siap.`}
          </p>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 14 }}>
          {kartu.map((k, i) => (
            <MukaKartu
              key={k.id}
              nomor={i + 1}
              kartu={k}
              hasil={hasil[k.id]}
              bisaDibuka={pythonSiap}
              onBuka={() => { siapkanSuara(); setTerbuka(k); }}
            />
          ))}
        </div>
      </main>

      {terbuka && (
        <KartuTerbuka
          kartu={terbuka}
          nomor={kartu.indexOf(terbuka) + 1}
          onSelesai={(h) => simpan(terbuka.id, h)}
          onTutup={() => setTerbuka(null)}
        />
      )}
    </div>
  );
}

function MukaKartu({ nomor, kartu, hasil, bisaDibuka, onBuka }: {
  nomor: number;
  kartu: KartuTantangan;
  hasil?: HasilKartu;
  bisaDibuka: boolean;
  onBuka: () => void;
}) {
  const latar = hasil?.status === 'benar' ? 'var(--leaf-wash)' : hasil ? 'var(--brand-wash)' : 'var(--surface)';
  const garis = hasil?.status === 'benar' ? 'var(--leaf)' : hasil ? 'var(--brand-line)' : 'var(--line)';
  const label = hasil?.status === 'benar' ? '✓ Benar' : hasil?.status === 'salah' ? '✗ Salah' : hasil ? '⏱ Waktu habis' : null;
  return (
    <button
      type="button"
      onClick={onBuka}
      disabled={Boolean(hasil) || !bisaDibuka}
      aria-label={`Kartu ${nomor}, ${LABEL_JENIS[kartu.jenis]}${label ? `, ${label}` : ''}`}
      style={{
        textAlign: 'left', cursor: hasil || !bisaDibuka ? 'default' : 'pointer', font: 'inherit', color: 'inherit',
        background: latar, border: `2px solid ${garis}`, borderRadius: 'var(--r-lg)', padding: '16px 16px 14px',
        minHeight: 150, display: 'flex', flexDirection: 'column', gap: 8,
        opacity: !hasil && !bisaDibuka ? 0.6 : 1, transition: 'transform .12s ease, box-shadow .12s ease',
      }}
      onMouseEnter={(e) => { if (!hasil && bisaDibuka) e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; }}
    >
      {/* Tingkat kesulitan dan lama waktunya sengaja tidak ditampilkan:
          60/90/120 detik pun langsung membocorkan tingkatnya. */}
      <span style={{ fontFamily: 'var(--display)', fontSize: 34, lineHeight: 1 }}>{nomor}</span>
      <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--body)' }}>{LABEL_JENIS[kartu.jenis]}</span>
      {label && (
        <span
          style={{
            marginTop: 'auto', fontSize: 13.5, fontWeight: 700,
            color: hasil?.status === 'benar' ? 'var(--leaf-deep)' : 'var(--brand-deep)',
          }}
        >
          {label}
        </span>
      )}
    </button>
  );
}

// ── Kartu yang sedang dikerjakan ───────────────────────────────────────────

function KartuTerbuka({ kartu, nomor, onSelesai, onTutup }: {
  kartu: KartuTantangan;
  nomor: number;
  onSelesai: (h: HasilKartu) => void;
  onTutup: () => void;
}) {
  const durasi = WAKTU_TINGKAT[kartu.tingkat];
  const [mulai] = useState(() => Date.now());
  const [sisa, setSisa] = useState(durasi);
  const [jawaban, setJawaban] = useState('');
  const [hasil, setHasil] = useState<HasilKartu | null>(null);
  const [memeriksa, setMemeriksa] = useState(false);
  const jalankan = useRunnerBatch();
  const selesaiRef = useRef(false);
  const detakTerakhir = useRef<number | null>(null);
  const isian = useRef<HTMLInputElement>(null);

  useEffect(() => { isian.current?.focus(); }, []);

  const akhiri = useCallback((h: HasilKartu) => {
    if (selesaiRef.current) return;
    selesaiRef.current = true;
    setHasil(h);
    onSelesai(h);
    if (h.status === 'benar') bunyiBenar();
    else bunyiSalah();
  }, [onSelesai]);

  // Hitung mundur dari jam dinding, bukan jumlah detak interval, supaya tetap
  // tepat walaupun tab sempat tersendat.
  useEffect(() => {
    const id = window.setInterval(() => {
      if (selesaiRef.current) return;
      const s = Math.max(0, durasi - Math.floor((Date.now() - mulai) / 1000));
      setSisa(s);
      if (s <= 5 && s > 0 && detakTerakhir.current !== s) {
        detakTerakhir.current = s;
        bunyiDetak();
      }
      if (s === 0) akhiri({ status: 'habis', jawaban: '' });
    }, 200);
    return () => window.clearInterval(id);
  }, [durasi, mulai, akhiri]);

  const kirim = async () => {
    if (selesaiRef.current || memeriksa) return;
    const j = jawaban.trim();
    if (!j) { isian.current?.focus(); return; }
    let benar = false;
    if (kartu.jenis === 'keluaran') {
      benar = kartu.terima.some((t) => rapikanJawaban(t) === rapikanJawaban(j));
    } else if (kartu.jenis === 'isian') {
      benar = kartu.terima.some((t) => rapikanJawaban(t).toLowerCase() === rapikanJawaban(j).toLowerCase());
    } else if (kartu.jenis === 'cari-salah') {
      benar = (j.match(/\d+/)?.[0] ?? '') === kartu.terima[0];
    } else {
      // Lengkapi kode: isian murid DIJALANKAN. Isian lain yang menghasilkan
      // keluaran yang sama juga benar.
      setMemeriksa(true);
      const kode = (kartu.kode ?? '').split('___').join(j);
      const { keluaran, galat } = await jalankan(kode, '');
      setMemeriksa(false);
      benar = !galat && keluaran.trim() === (kartu.target ?? '');
    }
    akhiri({ status: benar ? 'benar' : 'salah', jawaban: j });
  };

  const persen = (sisa / durasi) * 100;
  const kritis = sisa <= 10 && !hasil;
  const baris = (kartu.kode ?? '').split('\n');

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="judul-kartu"
      style={{
        position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(32, 30, 29, 0.72)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'clamp(10px, 3vw, 32px)',
      }}
    >
      <style>{GAYA_ANIMASI}</style>
      <div
        style={{
          position: 'relative', width: '100%', maxWidth: 860, maxHeight: '100%', overflow: 'auto',
          background: 'var(--surface)', borderRadius: 'var(--r-xl)', boxShadow: 'var(--shadow-lg)',
          padding: 'clamp(20px, 3.5vw, 36px)',
        }}
      >
        {hasil?.status === 'benar' && <Konfeti />}

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 14 }}>
          <span style={{ fontFamily: 'var(--display)', fontSize: 26 }}>Kartu {nomor}</span>
          <span className="pill pill--quiet">{LABEL_JENIS[kartu.jenis]}</span>
          <span style={{ flex: 1 }} />
          <span
            role="timer"
            aria-live="off"
            className={kritis ? 'tantangan-denyut' : undefined}
            style={{
              fontFamily: 'var(--mono)', fontSize: 34, fontWeight: 700,
              color: kritis ? 'var(--brand-deep)' : 'var(--ink)',
            }}
          >
            {Math.floor(sisa / 60)}:{String(sisa % 60).padStart(2, '0')}
          </span>
        </div>

        <div style={{ height: 8, borderRadius: 999, background: 'var(--line)', overflow: 'hidden', marginBottom: 20 }}>
          <div
            style={{
              width: `${persen}%`, height: '100%', transition: 'width .2s linear',
              background: kritis ? 'var(--brand-deep)' : 'var(--brand)',
            }}
          />
        </div>

        <h2 id="judul-kartu" style={{ fontSize: 'clamp(20px, 2.6vw, 26px)', lineHeight: 1.35, margin: '0 0 16px' }}>
          {tanyaKartu(kartu)}
        </h2>

        {kartu.kode && (
          <pre
            style={{
              margin: '0 0 20px', background: 'var(--ink-code)', color: '#f3ece2', borderRadius: 'var(--r-md)',
              padding: '18px 20px', fontSize: 'clamp(16px, 2.1vw, 21px)', lineHeight: 1.6, overflowX: 'auto',
            }}
          >
            {baris.map((b, i) => (
              <div key={i} style={{ display: 'flex', gap: 18 }}>
                <span aria-hidden="true" style={{ color: '#8a8173', minWidth: 18, textAlign: 'right', userSelect: 'none' }}>{i + 1}</span>
                <span>
                  {b.split('___').map((bagian, j, semua) => (
                    <span key={j}>
                      {bagian}
                      {j < semua.length - 1 && (
                        <span style={{ background: 'var(--brand)', color: '#fff', borderRadius: 6, padding: '0 6px' }}>___</span>
                      )}
                    </span>
                  ))}
                </span>
              </div>
            ))}
          </pre>
        )}

        {!hasil ? (
          <form
            onSubmit={(e) => { e.preventDefault(); void kirim(); }}
            style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'stretch' }}
          >
            <input
              ref={isian}
              className="input input--mono"
              value={jawaban}
              onChange={(e) => setJawaban(e.target.value)}
              placeholder={petunjukJawab(kartu)}
              aria-label="Jawaban"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
              disabled={memeriksa}
              style={{ flex: '1 1 280px', fontSize: 22, padding: '14px 18px' }}
            />
            <button type="submit" className="btn btn--primary" style={{ fontSize: 18, padding: '14px 28px' }} disabled={memeriksa}>
              {memeriksa ? 'Memeriksa…' : 'Jawab'}
            </button>
          </form>
        ) : (
          <HasilJawaban hasil={hasil} />
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 18 }}>
          {hasil ? (
            <button type="button" className="btn btn--dark" onClick={onTutup}>Kembali ke kartu</button>
          ) : (
            <button
              type="button"
              className="btn btn--ghost btn--sm"
              onClick={() => { selesaiRef.current = true; onTutup(); }}
              title="Kartu dikembalikan tanpa hasil, bisa dibuka lagi nanti"
            >
              Batalkan kartu
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Hasil satu kartu. Jawaban yang benar sengaja TIDAK ditampilkan: murid lain
 * yang sedang menunggu giliran tidak boleh melihatnya, karena kartu yang sama
 * akan muncul lagi untuk mereka.
 */
function HasilJawaban({ hasil }: { hasil: HasilKartu }) {
  const benar = hasil.status === 'benar';
  const judul = benar ? 'BENAR!' : hasil.status === 'salah' ? 'SALAH' : 'WAKTU HABIS';
  return (
    <div
      role="status"
      className="tantangan-muncul"
      style={{
        borderRadius: 'var(--r-md)', padding: '18px 22px', textAlign: 'center',
        background: benar ? 'var(--leaf-wash)' : 'var(--brand-wash)',
        border: `2px solid ${benar ? 'var(--leaf)' : 'var(--brand-line)'}`,
      }}
    >
      <div
        style={{
          fontFamily: 'var(--display)', fontSize: 'clamp(40px, 7vw, 64px)', lineHeight: 1.05,
          color: benar ? 'var(--leaf-deep)' : 'var(--brand-deep)',
        }}
      >
        {judul}
      </div>
      {hasil.jawaban && (
        <p style={{ margin: '10px 0 0', fontSize: 15, color: 'var(--muted)' }}>
          Jawabanmu: <b style={{ fontFamily: 'var(--mono)', color: 'var(--ink)' }}>{hasil.jawaban}</b>
        </p>
      )}
    </div>
  );
}

/** Hujan kertas warna-warni untuk jawaban benar. */
function Konfeti() {
  const potongan = useMemo(
    () => Array.from({ length: 36 }, (_, i) => ({
      kiri: Math.random() * 100,
      tunda: Math.random() * 0.4,
      lama: 1.4 + Math.random() * 1.2,
      warna: ['#c67139', '#aebf92', '#f6a06b', '#56633f', '#ffc6a5', '#201e1d'][i % 6],
      putar: Math.random() * 360,
    })),
    [],
  );
  return (
    <div aria-hidden="true" style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', borderRadius: 'var(--r-xl)' }}>
      {potongan.map((p, i) => (
        <span
          key={i}
          className="tantangan-konfeti"
          style={{
            left: `${p.kiri}%`, background: p.warna, animationDelay: `${p.tunda}s`,
            animationDuration: `${p.lama}s`, transform: `rotate(${p.putar}deg)`,
          }}
        />
      ))}
    </div>
  );
}

const GAYA_ANIMASI = `
.tantangan-konfeti { position: absolute; top: -14px; width: 9px; height: 14px; border-radius: 2px;
  animation-name: tantangan-jatuh; animation-timing-function: cubic-bezier(.3,.6,.5,1); animation-fill-mode: forwards; }
@keyframes tantangan-jatuh { to { transform: translateY(620px) rotate(540deg); opacity: 0; } }
.tantangan-muncul { animation: tantangan-muncul .35s cubic-bezier(.2,1.4,.4,1); }
@keyframes tantangan-muncul { from { transform: scale(.85); opacity: 0; } to { transform: scale(1); opacity: 1; } }
.tantangan-denyut { animation: tantangan-denyut 1s ease-in-out infinite; }
@keyframes tantangan-denyut { 50% { transform: scale(1.12); } }
@media (prefers-reduced-motion: reduce) {
  .tantangan-konfeti, .tantangan-muncul, .tantangan-denyut { animation: none !important; }
  .tantangan-konfeti { display: none; }
}
`;
