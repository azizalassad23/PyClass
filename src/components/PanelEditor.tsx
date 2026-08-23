import { useState, type ReactNode } from 'react';
import { CodeEditor } from './CodeEditor';

interface Props {
  namaBerkas: string;
  kode: string;
  onKode: (k: string) => void;
  onJalankan: () => void;
  sedangJalan?: boolean;
  labelJalankan?: string;
  onAturUlang?: () => void;
  /** F-A01 — dipasang selama ujian & kuis. */
  blokirTempel?: boolean;
  /** Ditampilkan di kanan bar judul, mis. "Tempel dinonaktifkan". */
  catatanJudul?: ReactNode;
  /** Tombol tambahan di bar bawah editor. */
  aksiTambahan?: ReactNode;
  /** Blok apa pun di antara bar aksi dan konsol (mis. hasil test contoh). */
  sisipan?: ReactNode;
  konsol?: ReactNode;
  minHeight?: number;
  sticky?: boolean;
}

const UKURAN = [13, 14, 16, 18, 22];

export function PanelEditor({
  namaBerkas, kode, onKode, onJalankan, sedangJalan = false,
  labelJalankan = 'Jalankan', onAturUlang, blokirTempel = false,
  catatanJudul, aksiTambahan, sisipan, konsol, minHeight = 190, sticky = false,
}: Props) {
  const [iUkuran, setIUkuran] = useState(1);

  return (
    <div
      style={{
        position: sticky ? 'sticky' : undefined,
        top: sticky ? 24 : undefined,
        background: 'var(--ink-code)',
        borderRadius: 'var(--r-lg)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-code)',
      }}
    >
      <div
        style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '12px 14px', borderBottom: '1px solid var(--ink-chrome)',
        }}
      >
        <span aria-hidden="true" style={{ display: 'flex', gap: 6 }}>
          <span style={{ width: 10, height: 10, borderRadius: 999, background: 'var(--brand-lit)' }} />
          <span style={{ width: 10, height: 10, borderRadius: 999, background: 'var(--leaf)' }} />
        </span>
        <span style={{ fontFamily: 'var(--mono)', fontSize: 11.5, color: 'var(--muted-3)' }}>{namaBerkas}</span>
        <span style={{ flex: 1 }} />
        {catatanJudul}
        <span style={{ display: 'flex', gap: 4 }}>
          <button
            type="button"
            onClick={() => setIUkuran((i) => Math.min(UKURAN.length - 1, i + 1))}
            aria-label="Perbesar ukuran huruf editor"
            style={tombolUkuran}
          >
            A+
          </button>
          <button
            type="button"
            onClick={() => setIUkuran((i) => Math.max(0, i - 1))}
            aria-label="Perkecil ukuran huruf editor"
            style={tombolUkuran}
          >
            A−
          </button>
        </span>
      </div>

      <CodeEditor
        nilai={kode}
        onChange={onKode}
        onJalankan={onJalankan}
        blokirTempel={blokirTempel}
        fontSize={UKURAN[iUkuran]}
        minHeight={minHeight}
        ariaLabel={`Editor kode Python — ${namaBerkas}`}
      />

      <div
        style={{
          display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap',
          padding: '12px 14px', background: 'var(--ink-chrome)',
        }}
      >
        <button type="button" className="btn btn--primary btn--sm" onClick={onJalankan} disabled={sedangJalan}>
          <span aria-hidden="true">▶</span> {sedangJalan ? 'Menjalankan…' : labelJalankan}
        </button>
        {onAturUlang && (
          <button type="button" className="btn btn--onDark btn--sm" onClick={onAturUlang}>
            Atur ulang
          </button>
        )}
        {aksiTambahan}
        <span style={{ flex: 1 }} />
        <span style={{ fontFamily: 'var(--mono)', fontSize: 10.5, color: 'var(--muted-3)' }}>Ctrl + Enter</span>
      </div>

      {sisipan}
      {konsol}
    </div>
  );
}

const tombolUkuran: React.CSSProperties = {
  background: 'transparent',
  border: 0,
  color: 'var(--muted-2)',
  fontFamily: 'var(--mono)',
  fontSize: 11,
  cursor: 'pointer',
  padding: '4px 6px',
  minWidth: 28,
  minHeight: 28,
};
