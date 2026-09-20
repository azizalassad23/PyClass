import { useCallback, useEffect, useRef, useState } from 'react';
import { ambilPantau, bukaBlokir, tambahWaktu } from '../lib/api';
import { mmss, sejakDetik } from '../lib/format';
import type { BarisPantau } from '../lib/types';

/** Denyut murid datang tiap 45 detik; menyegarkan lebih cepat tidak ada gunanya. */
const JEDA_SEGAR_MS = 20_000;
/**
 * Sesudah ini murid dianggap hilang, bukan sekadar belum berdenyut. Denyut
 * datang tiap 45 detik, jadi 75 detik berarti satu denyut benar-benar terlewat
 * dan bukan sekadar jaringan yang lambat sesaat.
 *
 * Inilah satu-satunya cara memantau murid yang mematikan HP-nya: aplikasi di
 * perangkat mana pun tidak bisa mencegah tombol power, tetapi denyut yang
 * berhenti selalu terlihat dari sini.
 */
const AMBANG_HILANG_DETIK = 75;
/** Hitungan waktu layar disegarkan sendiri supaya durasi "hilang" ikut berjalan. */
const JEDA_DETAK_MS = 5_000;

function lamaHilang(detik: number): string {
  if (detik < 60) return `${detik} detik`;
  return `${Math.floor(detik / 60)} menit ${detik % 60} detik`;
}

/**
 * Bunyi peringatan di meja guru. Dua nada pendek memakai WebAudio, jadi tidak
 * perlu berkas suara. Halaman guru selalu dibuka lewat klik (login PIN),
 * sehingga peramban mengizinkan audio berbunyi.
 */
function bunyikanPeringatan(): void {
  try {
    const Konteks = window.AudioContext ?? (window as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Konteks) return;
    const ctx = new Konteks();
    [0, 0.28].forEach((jeda) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.0001, ctx.currentTime + jeda);
      gain.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + jeda + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + jeda + 0.2);
      osc.connect(gain).connect(ctx.destination);
      osc.start(ctx.currentTime + jeda);
      osc.stop(ctx.currentTime + jeda + 0.22);
    });
    window.setTimeout(() => void ctx.close(), 1200);
  } catch {
    /* peramban menolak audio — peringatan visual tetap tampil */
  }
}

/**
 * Alasan seorang murid ditandai butuh bantuan. Ambangnya sengaja longgar:
 * lebih baik guru menghampiri satu murid yang ternyata baik-baik saja daripada
 * melewatkan yang diam-diam menyerah.
 */
/** Murid yang sudah tidak mengerjakan lagi: tidak dipantau dan tidak dibunyikan. */
function sudahBerhenti(b: BarisPantau): boolean {
  return b.status === 'mengirim' || b.status === 'keluar' || b.status === 'keluar-darurat';
}

function alasanBantuan(b: BarisPantau): string | null {
  if (sudahBerhenti(b) || b.status === 'diblokir') return null;
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
  const [bunyi, setBunyi] = useState(true);
  const [sekarang, setSekarang] = useState(() => Date.now());
  /** NIS yang sudah dibunyikan, supaya satu murid tidak berbunyi tiap penyegaran. */
  const sudahBunyi = useRef<Set<string>>(new Set());

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

  const jalankanAksi = async (nis: string, aksi: () => Promise<unknown>) => {
    setSibukNis(nis);
    try {
      await aksi();
      await muat();
    } catch (e) {
      setGalat((e as Error).message);
    } finally {
      setSibukNis(null);
    }
  };

  const beriWaktu = (nis: string, menit: number) =>
    jalankanAksi(nis, () => tambahWaktu(pin, sesi, nis, menit));

  const lepasBlokir = (b: BarisPantau) => {
    const setuju = window.confirm(
      `Buka blokir ${b.nama}?\n\nSesuai aturan, seluruh jawabannya tetap dikosongkan dan ia mulai lagi dari soal 1.`,
    );
    if (setuju) void jalankanAksi(b.nis, () => bukaBlokir(pin, sesi, b.nis));
  };

  useEffect(() => {
    const id = window.setInterval(() => setSekarang(Date.now()), JEDA_DETAK_MS);
    return () => window.clearInterval(id);
  }, []);

  const detikDiam = useCallback(
    (b: BarisPantau) => (b.diperbaruiPada ? Math.round((sekarang - b.diperbaruiPada) / 1000) : null),
    [sekarang],
  );
  /**
   * Murid yang sudah mengirim atau keluar dengan izin guru memang berhenti
   * berdenyut — itu bukan kehilangan.
   */
  const sedangHilang = useCallback(
    (b: BarisPantau) => {
      if (sudahBerhenti(b)) return false;
      const diam = detikDiam(b);
      return diam !== null && diam > AMBANG_HILANG_DETIK;
    },
    [detikDiam],
  );

  const butuhBantuan = baris.filter((b) => alasanBantuan(b) !== null);
  const sudahKirim = baris.filter((b) => b.status === 'mengirim').length;
  const diblokir = baris.filter((b) => b.status === 'diblokir').length;
  const hilang = baris.filter(sedangHilang);
  // Daftar NIS sebagai teks: isinya sama berarti tidak ada yang berubah, jadi
  // efek di bawah tidak berjalan ulang setiap kali komponen digambar.
  const kunciHilang = hilang.map((b) => b.nis).sort().join(',');

  // Bunyi sekali per murid. Murid yang denyutnya kembali dihapus dari daftar,
  // jadi ia berbunyi lagi bila menghilang untuk kedua kalinya.
  useEffect(() => {
    const nisHilang = new Set(kunciHilang === '' ? [] : kunciHilang.split(','));
    sudahBunyi.current.forEach((nis) => { if (!nisHilang.has(nis)) sudahBunyi.current.delete(nis); });
    const baru = [...nisHilang].filter((nis) => !sudahBunyi.current.has(nis));
    if (baru.length === 0) return;
    baru.forEach((nis) => sudahBunyi.current.add(nis));
    if (bunyi) bunyikanPeringatan();
  }, [kunciHilang, bunyi]);

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
          {baris.length} murid terpantau · {sudahKirim} sudah mengirim
          {diblokir > 0 && <b style={{ color: 'var(--brand-deep)' }}> · {diblokir} diblokir</b>}
          {hilang.length > 0 && <b style={{ color: 'var(--brand-deep)' }}> · {hilang.length} hilang</b>} · diperbarui{' '}
          {sejakDetik(dimuatPada)}
        </span>
        <span style={{ flex: 1 }} />
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, color: 'var(--muted)' }}>
          <input type="checkbox" checked={otomatis} onChange={(e) => setOtomatis(e.target.checked)} />
          Segarkan otomatis
        </label>
        <label
          style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, color: 'var(--muted)' }}
          title="Bunyi peringatan saat kabar seorang murid berhenti"
        >
          <input type="checkbox" checked={bunyi} onChange={(e) => setBunyi(e.target.checked)} />
          Bunyi peringatan
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
                const terblokir = b.status === 'diblokir';
                const diamDetik = detikDiam(b);
                const barisHilang = sedangHilang(b);
                const sisaBlokirMenit = b.diblokirSampai
                  ? Math.max(0, Math.ceil((b.diblokirSampai - sekarang) / 60_000))
                  : null;
                return (
                  <tr
                    key={b.nis}
                    style={{
                      background: barisHilang ? 'var(--brand-tint)' : alasan || terblokir ? 'var(--brand-wash)' : undefined,
                    }}
                  >
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
                    <td style={{ fontWeight: b.pindahTab > 1 ? 700 : 400, color: b.pindahTab > 1 ? 'var(--brand-deep)' : 'var(--muted-2)' }}>
                      {b.pindahTab}
                    </td>
                    <td>
                      {b.status === 'mengirim' ? (
                        <span className="pill pill--leaf">mengirim</span>
                      ) : b.status === 'keluar' ? (
                        <span className="pill pill--quiet" title="Guru mengetikkan kode keluar di HP murid">
                          keluar · izin guru
                        </span>
                      ) : b.status === 'keluar-darurat' ? (
                        <span className="pill pill--brand" title="Keluar tanpa kode: tombol darurat ditahan 10 detik">
                          keluar darurat
                        </span>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 6 }}>
                          {/* Kabar yang berhenti didahulukan: murid itu perlu dihampiri sekarang. */}
                          {barisHilang && (
                            <>
                              <span
                                className="pill pill--brand"
                                style={{ fontWeight: 700 }}
                                title="Denyut berhenti. Bisa berarti HP dimatikan, aplikasi ditutup, atau jaringan putus."
                              >
                                hilang {lamaHilang(diamDetik ?? 0)}
                              </span>
                              <span style={{ fontSize: 11, color: 'var(--brand-deep)', lineHeight: 1.4 }}>
                                HP mati, keluar aplikasi, atau jaringan putus
                              </span>
                            </>
                          )}
                          {terblokir && (
                            <>
                              <span className="pill pill--brand" title="Keluar dari halaman ujian lebih dari sekali">
                                diblokir{sisaBlokirMenit !== null ? ` · ${sisaBlokirMenit} m lagi` : ''}
                              </span>
                              <button
                                type="button"
                                className="btn btn--ghost btn--sm"
                                style={{ minHeight: 30, padding: '4px 10px', fontSize: 12 }}
                                onClick={() => lepasBlokir(b)}
                                disabled={sibukNis !== null}
                              >
                                Buka blokir
                              </button>
                            </>
                          )}
                          {!barisHilang && !terblokir && (
                            <span className="pill pill--quiet">{sejakDetik(b.diperbaruiPada)}</span>
                          )}
                        </div>
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
        Murid mengirim kabar tiap 45 detik (tiap 15 detik saat diblokir), jadi angka di sini bisa tertinggal
        sekitar satu menit. Kabar yang berhenti lebih dari {AMBANG_HILANG_DETIK} detik ditandai <b>hilang</b> dan
        berbunyi sekali: HP dimatikan, aplikasi ditutup, atau jaringan putus. Mematikan HP tidak bisa dicegah dari
        aplikasi mana pun, tetapi selalu terlihat di sini. Durasi sesi ini {durasiMenit} menit. Murid yang keluar dari halaman ujian lebih
        dari sekali diblokir — kuis unit 10 menit, lainnya 30 menit — dan jawabannya dikosongkan saat blokir
        berakhir, termasuk bila dibuka lebih awal oleh guru. Keluar lagi saat diblokir memulai ulang hitungannya.
      </p>
    </section>
  );
}
