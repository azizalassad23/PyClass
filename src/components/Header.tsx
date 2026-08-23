import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';
import { MODE_DEMO } from '../lib/api';
import { usePython } from '../python/PythonProvider';

export function Logo({ ukuran = 34 }: { ukuran?: number }) {
  return (
    <span
      aria-hidden="true"
      style={{
        width: ukuran, height: ukuran, borderRadius: 999, background: 'var(--brand)',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        color: '#fff', fontFamily: 'var(--display)', fontSize: ukuran * 0.5, flex: 'none',
      }}
    >
      P
    </span>
  );
}

/** Ditampilkan di seluruh aplikasi bila VITE_API_URL belum diisi. */
export function LencanaDemo() {
  if (!MODE_DEMO) return null;
  return (
    <span
      className="pill pill--quiet"
      title="VITE_API_URL belum diisi — soal, penilaian, dan rekap berjalan di browser ini saja dan tidak dikirim ke Google Sheets."
    >
      Mode demo
    </span>
  );
}

export function StatusPython() {
  const { fase, pesanFase } = usePython();
  if (fase === 'siap') return <span className="pill pill--leaf">Python siap</span>;
  if (fase === 'gagal') return <span className="pill pill--brand">Python gagal dimuat</span>;
  if (fase === 'idle') return null;
  return (
    <span className="pill pill--brand" role="status">
      {pesanFase}
    </span>
  );
}

interface HeaderProps {
  /** Remah roti setelah nama aplikasi, mis. "U3 Percabangan". */
  jejak?: ReactNode;
  kanan?: ReactNode;
  ringkas?: boolean;
}

export function Header({ jejak, kanan, ringkas = false }: HeaderProps) {
  return (
    <header
      style={{
        display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
        padding: '0 clamp(16px, 3vw, 32px)', minHeight: ringkas ? 60 : 66,
        background: 'var(--surface)', borderBottom: '1px solid var(--line)',
      }}
    >
      <Link
        to="/"
        style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none', color: 'var(--ink)' }}
      >
        <Logo ukuran={ringkas ? 30 : 34} />
        {ringkas ? (
          <span style={{ fontFamily: 'var(--display)', fontSize: 17 }}>PyClass</span>
        ) : (
          <span style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15 }}>
            <span style={{ fontFamily: 'var(--display)', fontSize: 20 }}>PyClass</span>
            <span style={{ fontSize: 11, color: 'var(--muted-2)' }}>Kelas X · Informatika</span>
          </span>
        )}
      </Link>

      {jejak && (
        <>
          <span aria-hidden="true" style={{ color: 'var(--line-strong)' }}>/</span>
          <span style={{ fontSize: 13.5, color: 'var(--muted)', fontWeight: 600 }}>{jejak}</span>
        </>
      )}

      <span style={{ flex: 1 }} />
      <LencanaDemo />
      {kanan}
    </header>
  );
}

/** Tautan navigasi utama di beranda. */
export function NavBeranda() {
  return (
    <nav style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <Link to="/materi" style={tautanNav}>Materi</Link>
      <Link to="/ujian" style={tautanNav}>Ujian</Link>
      <Link
        to="/guru"
        style={{
          ...tautanNav, color: 'var(--brand-deep)', border: '1px solid var(--brand-line)',
          borderRadius: 'var(--r-pill)', background: 'var(--brand-wash)', padding: '8px 16px',
        }}
      >
        Halaman Guru
      </Link>
    </nav>
  );
}

const tautanNav: React.CSSProperties = {
  fontSize: 13.5, fontWeight: 600, color: 'var(--ink)',
  textDecoration: 'none', padding: '8px 14px', borderRadius: 'var(--r-pill)',
};
