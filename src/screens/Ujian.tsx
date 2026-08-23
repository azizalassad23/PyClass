import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { LencanaDemo } from '../components/Header';
import { KonsolPython } from '../components/KonsolPython';
import { PanelEditor } from '../components/PanelEditor';
import { kirimDenganUlangan } from '../lib/api';
import { mmss, normalisasiKeluaran, sejakDetik } from '../lib/format';
import { useAntiCheat, useJejakSoal } from '../lib/useAntiCheat';
import { menitTerpakai, useTimer } from '../lib/useTimer';
import {
  muatHasil, muatUjianAktif, simpanHasil, simpanJawaban, type KeadaanUjian,
} from '../lib/sesiUjian';
import type { JawabanTerkirim, SubmitPayload } from '../lib/types';
import { useRunner, useRunnerBatch } from '../python/useRunner';
import { usePython } from '../python/PythonProvider';

type HasilTest = { input: string; harap: string; dapat: string; cocok: boolean; galat: string };

/** W4 — mockup 1g (ujian) dan 1k (kuis, versi ringkas dari alur yang sama). */
export function Ujian() {
  const awal = useMemo(() => muatUjianAktif(), []);
  if (!awal) return <Navigate to="/ujian" replace />;
  // Sudah dikirim dan dinilai: memuat ulang alamat ini tidak boleh membuka
  // kembali soal dengan timer baru — kembalikan murid ke halaman hasil.
  if (muatHasil(awal.identitas.sesi, awal.identitas.nis)) {
    return <Navigate to="/ujian/hasil" replace />;
  }
  return <UjianAktif keadaanAwal={awal} />;
}

function UjianAktif({ keadaanAwal }: { keadaanAwal: KeadaanUjian }) {
  const navigate = useNavigate();
  const { identitas, paket } = keadaanAwal;
  const kuis = paket.jenis === 'kuis';
  const kunciSesi = `${identitas.sesi}:${identitas.nis}`;

  const [jawaban, setJawaban] = useState<Record<string, string>>(keadaanAwal.jawaban);
  const [indeks, setIndeks] = useState(0);
  const [hasilTest, setHasilTest] = useState<Record<string, HasilTest[]>>({});
  const [tersimpanPada, setTersimpanPada] = useState<number | null>(null);
  const [mengirim, setMengirim] = useState(false);
  const [progresKirim, setProgresKirim] = useState('');
  const [galatKirim, setGalatKirim] = useState('');
  const [konfirmasiKirim, setKonfirmasiKirim] = useState(false);

  const soal = paket.soal[indeks];
  const jalankanTest = useRunnerBatch();
  // Runner interaktif: murid boleh menjalankan kodenya sendiri sesering yang
  // dimau, dengan masukan bebas — ini tidak dinilai dan tidak dikirim ke mana pun.
  const { keadaan: keadaanBebas, mulai: mulaiBebas, balasInput, bersihkan: bersihkanKonsol } = useRunner();
  const { fase, panaskan, sedangJalan } = usePython();
  const { pindahTab, peringatan, tutupPeringatan } = useAntiCheat(kunciSesi, !mengirim);
  const { jejak, masukSoal, catatJalan } = useJejakSoal(kunciSesi);
  const { sisaDetik, habis, peringatan: peringatanWaktu, selesaiPada, hapusTimer } =
    useTimer(kunciSesi, paket.durasiMenit, !mengirim);

  const kirimRef = useRef<(status: 'selesai' | 'waktu-habis') => void>(() => undefined);

  useEffect(() => { panaskan(); }, [panaskan]);
  useEffect(() => { masukSoal(soal.id); }, [soal.id, masukSoal]);

  // F-U07 — simpan otomatis setiap 10 detik.
  useEffect(() => {
    const id = window.setInterval(() => {
      simpanJawaban(identitas.sesi, identitas.nis, jawaban);
      setTersimpanPada(Date.now());
    }, 10_000);
    return () => window.clearInterval(id);
  }, [jawaban, identitas.sesi, identitas.nis]);

  // F-U02 — auto-submit saat waktu habis.
  useEffect(() => {
    if (habis && !mengirim) kirimRef.current('waktu-habis');
  }, [habis, mengirim]);

  // Konsol dikosongkan saat pindah soal agar keluaran soal lain tidak tertinggal.
  useEffect(() => { bersihkanKonsol(); }, [soal.id, bersihkanKonsol]);

  const setKode = (kode: string) => setJawaban((j) => ({ ...j, [soal.id]: kode }));

  /** Jalankan kode apa adanya; input() ditanyakan ke murid lewat konsol. */
  const jalankanBebas = useCallback(async () => {
    catatJalan(soal.id);
    await mulaiBebas(jawaban[soal.id] ?? '');
  }, [catatJalan, mulaiBebas, jawaban, soal.id]);

  const uji = useCallback(async () => {
    catatJalan(soal.id);
    const kode = jawaban[soal.id] ?? '';
    const hasil: HasilTest[] = [];
    for (const contoh of soal.contoh) {
      const { keluaran, galat } = await jalankanTest(kode, contoh.input);
      hasil.push({
        input: contoh.input,
        harap: contoh.output,
        dapat: keluaran,
        cocok: !galat && normalisasiKeluaran(keluaran) === normalisasiKeluaran(contoh.output),
        galat,
      });
    }
    setHasilTest((h) => ({ ...h, [soal.id]: hasil }));
  }, [catatJalan, jalankanTest, jawaban, soal]);

  const simpanSekarang = () => {
    simpanJawaban(identitas.sesi, identitas.nis, jawaban);
    setTersimpanPada(Date.now());
  };

  const kirim = useCallback(
    async (status: 'selesai' | 'waktu-habis') => {
      setMengirim(true);
      setGalatKirim('');
      simpanJawaban(identitas.sesi, identitas.nis, jawaban);

      // F-U05 — browser hanya menghasilkan KELUARAN; pencocokan dengan kunci
      // dilakukan di Apps Script. Kunci tidak pernah ada di perangkat murid.
      const terkirim: JawabanTerkirim[] = [];
      for (let i = 0; i < paket.soal.length; i++) {
        const s = paket.soal[i];
        setProgresKirim(`Menjalankan kode untuk soal ${i + 1} dari ${paket.soal.length}…`);
        const kode = jawaban[s.id] ?? '';
        const keluaran: string[] = [];
        for (const input of s.inputTersembunyi) {
          const { keluaran: out } = await jalankanTest(kode, input);
          keluaran.push(out);
        }
        terkirim.push({ soalId: s.id, output: keluaran, kode });
      }

      const payload: SubmitPayload = {
        ...identitas,
        paket: paket.paket,
        jenis: paket.jenis,
        jawaban: terkirim,
        durasiMenit: menitTerpakai(selesaiPada, paket.durasiMenit),
        pindahTab,
        status,
      };

      setProgresKirim('Mengirim ke guru…');
      const { hasil, galat } = await kirimDenganUlangan(payload, (ke) =>
        setProgresKirim(ke === 1 ? 'Mengirim ke guru…' : `Mencoba ulang pengiriman (${ke} dari 3)…`),
      );

      if (hasil) {
        simpanHasil(identitas.sesi, identitas.nis, hasil);
        hapusTimer();
        navigate('/ujian/hasil');
        return;
      }

      // F-U09 — gagal total: simpan payload untuk diunduh sebagai bukti.
      setGalatKirim(galat ?? 'Pengiriman gagal.');
      sessionStorage.setItem('pyclass:bukti', JSON.stringify(payload));
      hapusTimer();
      navigate('/ujian/hasil');
    },
    [identitas, jawaban, paket, jalankanTest, selesaiPada, pindahTab, hapusTimer, navigate],
  );
  kirimRef.current = (status) => void kirim(status);

  const belumDiisi = paket.soal.filter((s) => !(jawaban[s.id] ?? '').trim()).length;

  if (mengirim) {
    return (
      <main
        style={{
          minHeight: '100vh', background: 'var(--cream)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', padding: 24, textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: 420 }}>
          <h1 style={{ fontSize: 30, margin: '0 0 12px' }}>Mengumpulkan jawabanmu</h1>
          <p role="status" style={{ fontSize: 15.5, color: 'var(--muted)', margin: '0 0 8px' }}>{progresKirim}</p>
          <p style={{ fontSize: 13, color: 'var(--muted-2)' }}>
            Jangan tutup halaman ini. Kode dijalankan sekali lagi terhadap uji tersembunyi sebelum dikirim.
          </p>
          {galatKirim && <p style={{ color: 'var(--brand-deep)', fontSize: 13.5 }}>{galatKirim}</p>}
        </div>
      </main>
    );
  }

  return (
    <div data-ujian style={{ background: 'var(--cream)', minHeight: '100vh' }}>
      <header
        style={{
          display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap',
          padding: '10px clamp(16px, 2.5vw, 24px)', minHeight: 64,
          background: 'var(--surface)', borderBottom: '1px solid var(--line)',
          position: 'sticky', top: 0, zIndex: 20,
        }}
      >
        <span style={{ fontFamily: 'var(--display)', fontSize: 18 }}>
          {kuis ? `${paket.judul} · ` : ''}Soal {indeks + 1} <span style={{ color: 'var(--muted-3)' }}>/ {paket.soal.length}</span>
        </span>
        <span aria-hidden="true" style={{ width: 1, height: 22, background: 'var(--line)' }} />
        <span style={{ fontSize: 13.5, color: 'var(--muted)' }}>
          {identitas.nama} · <span style={{ fontFamily: 'var(--mono)' }}>{identitas.nis}</span> · {identitas.kelas}
        </span>
        <LencanaDemo />
        <span style={{ flex: 1 }} />
        <span style={{ fontSize: 12, color: 'var(--muted-2)' }}>tersimpan {sejakDetik(tersimpanPada)}</span>
        <span
          role="timer"
          aria-live="off"
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: sisaDetik <= 300 ? '#ffe1d0' : 'var(--brand-wash)',
            border: '1px solid var(--brand-line)', borderRadius: 'var(--r-pill)', padding: '8px 18px',
          }}
        >
          <span style={{ fontFamily: 'var(--mono)', fontSize: 19, fontWeight: 700, color: 'var(--brand-deep)' }}>
            {mmss(sisaDetik)}
          </span>
        </span>
        {/* Mengirim adalah aksi sekali jalan, jadi tempatnya di header — jauh
            dari tombol-tombol yang dipakai terus-menerus saat mengerjakan. */}
        <button
          type="button"
          className="btn btn--dark btn--sm"
          onClick={() => setKonfirmasiKirim(true)}
          disabled={konfirmasiKirim}
        >
          Selesai &amp; Kirim
        </button>
      </header>

      {konfirmasiKirim && (
        <div
          role="alertdialog"
          aria-label="Konfirmasi pengiriman"
          style={{
            background: 'var(--ink)', color: 'var(--cream)',
            padding: '14px clamp(16px, 2.5vw, 24px)', display: 'flex',
            alignItems: 'center', gap: 14, flexWrap: 'wrap', fontSize: 14,
          }}
        >
          <strong style={{ fontFamily: 'var(--display)', fontSize: 16 }}>Kirim jawabanmu sekarang?</strong>
          <span style={{ color: 'var(--muted-4)' }}>
            {belumDiisi > 0
              ? `${belumDiisi} dari ${paket.soal.length} soal masih kosong. `
              : `Seluruh ${paket.soal.length} soal sudah diisi. `}
            Setelah dikirim kamu tidak bisa mengubah jawaban lagi.
          </span>
          <span style={{ flex: 1 }} />
          <button type="button" className="btn btn--primary btn--sm" onClick={() => void kirim('selesai')}>
            Ya, kirim sekarang
          </button>
          <button type="button" className="btn btn--onDark btn--sm" onClick={() => setKonfirmasiKirim(false)}>
            Belum, lanjut mengerjakan
          </button>
        </div>
      )}

      {(peringatan || peringatanWaktu) && (
        <div
          role="alert"
          style={{
            background: 'var(--brand-tint)', borderBottom: '1px solid var(--brand-line)',
            padding: '12px clamp(16px, 2.5vw, 24px)', display: 'flex', alignItems: 'center', gap: 12,
            fontSize: 13.5, color: 'var(--brand-deep)',
          }}
        >
          <strong aria-hidden="true">!</strong>
          <span style={{ flex: 1 }}>
            {peringatanWaktu
              ? `Sisa waktu ${peringatanWaktu} menit. Pastikan jawabanmu sudah tersimpan.`
              : peringatan}
          </span>
          {peringatan && (
            <button type="button" className="btn btn--ghost btn--sm" onClick={tutupPeringatan}>Mengerti</button>
          )}
        </div>
      )}

      <div className="ujian">
        <nav className="ujian__peta" aria-label="Peta soal">
          <span className="eyebrow" style={{ fontSize: 10, marginBottom: 4 }}>Peta</span>
          {paket.soal.map((s, i) => {
            const hasil = hasilTest[s.id];
            const semuaLulus = hasil && hasil.every((h) => h.cocok);
            const dicoba = Boolean((jawaban[s.id] ?? '').trim());
            const aktif = i === indeks;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setIndeks(i)}
                aria-label={`Soal ${i + 1}${semuaLulus ? ', contoh lulus' : dicoba ? ', sudah dicoba' : ', belum diisi'}`}
                aria-current={aktif ? 'true' : undefined}
                style={{
                  width: 44, height: 44, borderRadius: 999, border: 0, cursor: 'pointer',
                  fontFamily: 'var(--mono)', fontSize: 15, fontWeight: 700,
                  background: aktif ? 'var(--brand)' : semuaLulus ? 'var(--leaf)' : dicoba ? 'var(--brand-tint)' : 'var(--cream)',
                  color: aktif ? '#fff' : semuaLulus ? 'var(--leaf-dark)' : dicoba ? 'var(--brand-deep)' : 'var(--muted-2)',
                  boxShadow: aktif ? 'var(--shadow-sm)' : undefined,
                }}
              >
                {i + 1}
              </button>
            );
          })}
          <span style={{ fontSize: 10, color: 'var(--muted-3)', textAlign: 'center', marginTop: 6, lineHeight: 1.4 }}>
            hijau: contoh lulus
            <br />
            oranye muda: dicoba
          </span>
        </nav>

        <main className="ujian__soal">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
            <span className="eyebrow" style={{ color: 'var(--brand-hover)' }}>
              Unit {soal.unit.replace('U', '')} · bobot {soal.bobot}
            </span>
            {jejak[soal.id]?.jalan ? (
              <span className="pill pill--quiet">dijalankan {jejak[soal.id].jalan}×</span>
            ) : null}
          </div>
          <h1 style={{ fontSize: 'clamp(24px, 3vw, 30px)', margin: '0 0 14px', lineHeight: 1.15 }}>{soal.judul}</h1>
          <p style={{ fontSize: 15.5, lineHeight: 1.7, color: 'var(--body)', whiteSpace: 'pre-wrap', margin: '0 0 20px' }}>
            {soal.deskripsi}
          </p>

          <div style={{ display: 'grid', gap: 12, marginBottom: 18 }}>
            {soal.contoh.map((k, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <KotakContoh label="Contoh masukan" isi={k.input} />
                <KotakContoh label="Contoh keluaran" isi={k.output} />
              </div>
            ))}
          </div>

          <p
            style={{
              fontSize: 12.5, lineHeight: 1.6, color: 'var(--muted-2)', background: 'var(--surface)',
              border: '1px solid var(--line)', borderRadius: 'var(--r-sm)', padding: '12px 16px', margin: 0,
            }}
          >
            Ada {soal.inputTersembunyi.length} uji tersembunyi. Keluaranmu dikirim ke server untuk dicocokkan —
            kunci jawaban tidak pernah ada di perangkat ini.
          </p>

        </main>

        <aside className="ujian__editor" aria-label="Editor jawaban">
          <PanelEditor
            sticky
            namaBerkas={`jawaban_soal_${indeks + 1}.py`}
            kode={jawaban[soal.id] ?? ''}
            onKode={setKode}
            onJalankan={() => void jalankanBebas()}
            sedangJalan={sedangJalan}
            labelJalankan="Jalankan"
            blokirTempel
            catatanJudul={
              <span style={{ fontSize: 10.5, color: 'var(--muted-2)', fontFamily: 'var(--sans)' }}>
                Tempel dinonaktifkan
              </span>
            }
            aksiTambahan={
              <>
                <button type="button" className="btn btn--onDark btn--sm" onClick={() => void uji()} disabled={sedangJalan}>
                  Uji contoh
                </button>
                <button type="button" className="btn btn--onDark btn--sm" onClick={simpanSekarang}>
                  Simpan
                </button>
              </>
            }
            minHeight={240}
            sisipan={<HasilTestContoh hasil={hasilTest[soal.id]} siap={fase === 'siap'} />}
            konsol={
              <KonsolPython
                keadaan={keadaanBebas}
                sedangJalan={sedangJalan}
                onKirimInput={(baris) => void balasInput(jawaban[soal.id] ?? '', baris)}
                kosongPesan="Tekan Jalankan untuk mencoba kodemu dengan masukanmu sendiri — sebanyak yang kamu mau, tidak dinilai."
              />
            }
          />

          {/* Navigasi soal menempati tempat yang dulu dipakai tombol kirim, supaya
              aksi yang sering dipakai ada di sini dan aksi sekali-jalan di header. */}
          <nav
            aria-label="Pindah soal"
            style={{
              marginTop: 16, background: 'var(--surface)', border: '1px solid var(--line)',
              borderRadius: 'var(--r-lg)', padding: '14px 16px',
              display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
            }}
          >
            <button
              type="button" className="btn btn--ghost btn--sm"
              onClick={() => setIndeks((i) => Math.max(0, i - 1))} disabled={indeks === 0}
            >
              ← {indeks > 0 ? `Soal ${indeks}` : 'Sebelumnya'}
            </button>
            <span style={{ flex: 1, textAlign: 'center', fontSize: 12.5, color: 'var(--muted-2)' }}>
              Soal {indeks + 1} dari {paket.soal.length}
              {belumDiisi > 0 && ` · ${belumDiisi} belum diisi`}
            </span>
            <button
              type="button"
              className={indeks < paket.soal.length - 1 ? 'btn btn--primary btn--sm' : 'btn btn--ghost btn--sm'}
              onClick={() => setIndeks((i) => Math.min(paket.soal.length - 1, i + 1))}
              disabled={indeks === paket.soal.length - 1}
            >
              {indeks < paket.soal.length - 1 ? `Soal ${indeks + 2}` : 'Soal terakhir'} →
            </button>
          </nav>
        </aside>
      </div>
    </div>
  );
}

function KotakContoh({ label, isi }: { label: string; isi: string }) {
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--r-sm)', padding: '10px 14px' }}>
      <div className="eyebrow" style={{ fontSize: 10, marginBottom: 4 }}>{label}</div>
      <pre
        data-boleh-salin
        style={{ margin: 0, fontSize: 13.5, whiteSpace: 'pre-wrap', color: 'var(--ink)' }}
      >
        {isi === '' ? '(kosong)' : isi}
      </pre>
    </div>
  );
}

function HasilTestContoh({ hasil, siap }: { hasil: HasilTest[] | undefined; siap: boolean }) {
  if (!hasil) {
    return (
      <div style={{ padding: '12px 16px', background: 'var(--ink)', fontSize: 12.5, color: 'var(--muted-3)', fontFamily: 'var(--sans)' }}>
        {siap
          ? 'Tekan Uji contoh untuk mencocokkan keluaranmu dengan contoh di soal.'
          : 'Python sedang disiapkan…'}
      </div>
    );
  }
  const lulus = hasil.filter((h) => h.cocok).length;
  return (
    <div style={{ padding: '12px 16px 14px', background: 'var(--ink)', fontFamily: 'var(--sans)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
        <span className="eyebrow" style={{ color: 'var(--muted-2)' }}>Test contoh</span>
        {hasil.map((h, i) => (
          <span key={i} style={{ fontSize: 12.5, fontWeight: 700, color: h.cocok ? 'var(--leaf)' : 'var(--brand-lit)' }}>
            {h.cocok ? '✓' : '✗'} {i + 1}
          </span>
        ))}
        <span style={{ fontSize: 12, color: 'var(--muted-3)' }}>{lulus} dari {hasil.length} lulus</span>
      </div>
      {hasil.filter((h) => !h.cocok).map((h, i) => (
        <div key={i} style={{ fontSize: 12.5, color: '#e8ddd0', lineHeight: 1.6, fontFamily: 'var(--mono)' }}>
          masukan <b>{h.input.replace(/\n/g, ' ⏎ ')}</b> → diharapkan{' '}
          <b style={{ color: 'var(--leaf)' }}>{h.harap.replace(/\n/g, ' ⏎ ') || '(kosong)'}</b> · keluaranmu{' '}
          <b style={{ color: 'var(--brand-lit)' }}>
            {h.galat ? 'error' : h.dapat.trim().replace(/\n/g, ' ⏎ ') || '(kosong)'}
          </b>
        </div>
      ))}
    </div>
  );
}
