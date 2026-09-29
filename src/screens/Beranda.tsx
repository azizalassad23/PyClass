import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Header, NavBeranda } from '../components/Header';
import { UNITS, type Unit } from '../content/units';
import { halamanUnit } from '../content/loader';
import { baca } from '../lib/storage';
import type { TerakhirDibaca } from '../lib/jejakBelajar';
import { unitSelesai } from '../lib/jejakBelajar';
import { sisaMenujuBuka, TERM_QUIZ, termQuizTerbuka } from '../lib/termQuiz';

/** W1 — mockup 1a: beranda dengan peta 8 unit sebagai kartu. */
export function Beranda() {
  const terakhir = baca<TerakhirDibaca | null>('terakhir-dibaca', null);
  const selesai = unitSelesai();

  return (
    <div style={{ background: 'var(--cream)', minHeight: '100vh' }}>
      <Header kanan={<NavBeranda />} />

      <section style={{ position: 'relative', overflow: 'hidden', padding: 'clamp(36px, 6vw, 52px) clamp(16px, 3vw, 32px) 44px' }}>
        <div aria-hidden="true" style={{ position: 'absolute', right: -90, top: -70, width: 340, height: 340, borderRadius: 999, background: 'var(--brand-tint)' }} />
        <div aria-hidden="true" style={{ position: 'absolute', right: 170, top: 190, width: 140, height: 140, borderRadius: 999, background: 'var(--leaf-wash)' }} />

        <div className="shell" style={{ position: 'relative' }}>
          <div style={{ maxWidth: 720 }}>
            <span
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 7, background: 'var(--surface)',
                border: '1px solid var(--line)', borderRadius: 'var(--r-pill)', padding: '6px 14px',
                fontSize: 12, fontWeight: 600, color: 'var(--muted)', marginBottom: 18,
              }}
            >
              Kelas X · 30 pertemuan · 2 JP
            </span>
            <h1 style={{ fontSize: 'clamp(34px, 5.2vw, 54px)', lineHeight: 1.06, letterSpacing: '-.02em', margin: '0 0 14px' }}>
              Belajar Python tanpa instal apa pun.
            </h1>
            <p style={{ fontSize: 17, lineHeight: 1.6, color: 'var(--muted)', margin: '0 0 28px', maxWidth: 560 }}>
              Materi, editor Python, dan ujian ber-auto-grading dalam satu tautan. Jalan di PC lab, laptop, maupun HP.
            </p>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
              <Link className="btn btn--primary" to={terakhir ? `/materi/${terakhir.slug}` : '/materi'}>
                Mulai Belajar
              </Link>
              <Link className="btn btn--ghost" to="/ujian">Mulai Ujian</Link>
              {terakhir && (
                <span style={{ fontSize: 12.5, color: 'var(--muted-2)', marginLeft: 6 }}>
                  Terakhir dibaca:{' '}
                  <strong style={{ color: 'var(--brand-deep)' }}>
                    {terakhir.unit} · {terakhir.judul}
                  </strong>
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="shell" style={{ padding: '0 clamp(16px, 3vw, 32px) 56px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
          <h2 style={{ fontSize: 26, margin: 0 }}>Delapan unit</h2>
          <span style={{ fontSize: 12.5, color: 'var(--muted-2)' }}>
            Setiap unit ditutup kuis 5 soal · 20 menit
          </span>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
            gap: 16,
          }}
        >
          {UNITS.map((u) => (
            <KartuUnit key={u.id} unit={u} selesai={selesai.has(u.id)} sedang={terakhir?.unit === u.id} />
          ))}
        </div>

        <KartuTermQuiz />
      </section>

      <footer style={{ borderTop: '1px solid var(--line)', padding: '24px clamp(16px, 3vw, 32px) 40px' }}>
        {/* Tautan ke halaman guru sengaja tidak dipasang di sini — lihat catatan
            pada NavBeranda di components/Header.tsx. */}
        <div
          className="shell"
          style={{ fontSize: 13, color: 'var(--muted-2)', textAlign: 'center' }}
        >
          PyClass - M. Aziz Al Assad, S.T., Gr. | 2026
        </div>
      </footer>
    </div>
  );
}

/**
 * Menu TERM QUIZ di bawah daftar unit. Sebelum jam buka, kartunya terkunci dan
 * menampilkan hitung mundur. Jam perangkat hanya dipakai untuk tampilan; server
 * yang menentukan kapan soal boleh diberikan.
 */
function KartuTermQuiz() {
  const [sekarang, setSekarang] = useState(() => Date.now());
  const terbuka = termQuizTerbuka(sekarang);
  useEffect(() => {
    if (terbuka) return;
    const id = window.setInterval(() => setSekarang(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [terbuka]);

  const isi = (
    <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
      <span
        aria-hidden="true"
        style={{
          width: 56, height: 56, borderRadius: 999, flex: 'none',
          background: terbuka ? 'var(--brand)' : 'var(--line)', color: terbuka ? '#fff' : 'var(--muted-2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--display)', fontSize: 20,
        }}
      >
        TQ
      </span>
      <div style={{ flex: '1 1 260px', minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 4 }}>
          <h3 style={{ fontSize: 22, margin: 0, letterSpacing: '.01em' }}>{TERM_QUIZ.judul}</h3>
          <span className={terbuka ? 'pill pill--brand' : 'pill pill--quiet'}>
            {terbuka ? 'Dibuka' : 'Terkunci'}
          </span>
        </div>
        <p style={{ fontSize: 13.5, lineHeight: 1.55, color: 'var(--muted)', margin: 0 }}>
          {TERM_QUIZ.jumlahSoal} soal Unit 1–3 · {TERM_QUIZ.durasiMenit} menit sejak kamu mulai · tanpa kode sesi,
          cukup nama, kelas, dan NIS
        </p>
        {!terbuka && (
          <p style={{ fontSize: 13, color: 'var(--brand-deep)', margin: '6px 0 0' }}>
            Dibuka {TERM_QUIZ.labelBuka} · <b style={{ fontFamily: 'var(--mono)' }}>{sisaMenujuBuka(sekarang)}</b> lagi
          </p>
        )}
      </div>
      <span
        className={terbuka ? 'btn btn--primary' : 'btn btn--ghost'}
        aria-hidden="true"
        style={{ pointerEvents: 'none', opacity: terbuka ? 1 : 0.6 }}
      >
        {terbuka ? 'Mulai →' : 'Belum dibuka'}
      </span>
    </div>
  );

  const gaya: React.CSSProperties = {
    display: 'block', marginTop: 20, textDecoration: 'none', color: 'inherit',
    background: terbuka ? 'var(--brand-wash)' : 'var(--surface)',
    border: terbuka ? '2px solid var(--brand)' : '1px dashed var(--line-strong)',
    borderRadius: 'var(--r-xl)', padding: terbuka ? '21px 23px' : '22px 24px',
    boxShadow: terbuka ? 'var(--shadow-sm)' : undefined,
  };

  // Terkunci tetap berupa tautan: halaman masuk menjelaskan kapan dibuka dan
  // murid sudah bisa mengisi identitasnya lebih dulu.
  return (
    <Link to="/term-quiz" style={gaya} aria-label={`${TERM_QUIZ.judul}${terbuka ? '' : ', belum dibuka'}`}>
      {isi}
    </Link>
  );
}

function KartuUnit({ unit, selesai, sedang }: { unit: Unit; selesai: boolean; sedang: boolean }) {
  const halaman = halamanUnit(unit.id);
  const adaMateri = halaman.length > 0;
  const proyek = unit.kuis === null;

  const status = sedang ? 'Sedang dipelajari' : selesai ? 'Selesai' : proyek ? 'Proyek' : 'Belum dibuka';
  const warnaLingkaran = sedang ? 'var(--brand)' : selesai ? 'var(--brand-tint)' : 'var(--cream)';
  const warnaTeksLingkaran = sedang ? '#fff' : selesai ? 'var(--brand-deep)' : 'var(--muted-2)';

  const isi = (
    <>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, gap: 8 }}>
        <span
          aria-hidden="true"
          style={{
            width: 40, height: 40, borderRadius: 999, background: warnaLingkaran, color: warnaTeksLingkaran,
            fontFamily: 'var(--display)', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          {unit.id}
        </span>
        <span className={sedang ? 'pill pill--brand' : proyek || selesai ? 'pill pill--leaf' : 'pill pill--quiet'}>
          {status}
        </span>
      </div>
      <h3 style={{ fontSize: 19, margin: '0 0 6px' }}>{unit.judul}</h3>
      <p style={{ fontSize: 13, lineHeight: 1.5, color: 'var(--muted-2)', margin: '0 0 14px' }}>
        Pertemuan {unit.pertemuan[0]}–{unit.pertemuan[1]} · {unit.ringkas}
      </p>
      <div style={{ height: 6, borderRadius: 999, background: 'var(--line)', overflow: 'hidden' }}>
        <div
          style={{
            width: selesai ? '100%' : sedang ? '60%' : '0%',
            height: '100%',
            background: sedang ? 'var(--brand)' : 'var(--leaf-mid)',
          }}
        />
      </div>
      {!adaMateri && (
        <p style={{ fontSize: 12, color: 'var(--muted-3)', margin: '12px 0 0' }}>
          Halaman materi unit ini belum ditulis.
        </p>
      )}
    </>
  );

  const gaya: React.CSSProperties = {
    background: proyek ? 'var(--leaf-wash)' : 'var(--surface)',
    border: sedang ? '2px solid var(--brand)' : `1px solid ${proyek ? 'var(--leaf-line)' : 'var(--line)'}`,
    borderRadius: 'var(--r-xl)',
    padding: sedang ? '19px 19px 17px' : '20px 20px 18px',
    boxShadow: sedang ? 'var(--shadow-sm)' : undefined,
    display: 'block',
    textDecoration: 'none',
    color: 'inherit',
  };

  if (!adaMateri) return <div style={{ ...gaya, opacity: 0.72 }}>{isi}</div>;

  return (
    <Link to={`/materi/${halaman[0].slug}`} style={gaya}>
      {isi}
    </Link>
  );
}
