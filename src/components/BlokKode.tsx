import { useEffect, useState } from 'react';
import { CodeEditor } from './CodeEditor';
import { KonsolPython } from './KonsolPython';
import { useRunner } from '../python/useRunner';

interface Props {
  judul: string;
  kode: string;
  /** F-M03 — "Ubah di editor" memindahkan kode ini ke editor utama halaman. */
  onKirimKeEditor?: (kode: string) => void;
}

/** F-M03 — setiap blok kode contoh punya tombol Jalankan dan Ubah di editor. */
export function BlokKode({ judul, kode, onKirimKeEditor }: Props) {
  const [isi, setIsi] = useState(kode);
  const { keadaan, mulai, balasInput, sedangJalan } = useRunner();
  const [pernahJalan, setPernahJalan] = useState(false);

  useEffect(() => { setIsi(kode); }, [kode]);

  const jalankan = () => { setPernahJalan(true); void mulai(isi); };

  return (
    <div
      style={{
        borderRadius: 'var(--r-lg)', overflow: 'hidden',
        border: '1px solid var(--line-strong)', margin: '26px 0',
      }}
    >
      <div
        style={{
          display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap',
          padding: '11px 16px', background: 'var(--cream)', borderBottom: '1px solid var(--line)',
        }}
      >
        <span className="eyebrow" style={{ color: 'var(--muted-2)' }}>{judul}</span>
        <span style={{ flex: 1 }} />
        <button type="button" className="btn btn--primary btn--sm" onClick={jalankan} disabled={sedangJalan}>
          <span aria-hidden="true">▶</span> {sedangJalan ? 'Menjalankan…' : 'Jalankan'}
        </button>
        {onKirimKeEditor && (
          <button type="button" className="btn btn--ghost btn--sm" onClick={() => onKirimKeEditor(isi)}>
            Ubah di editor
          </button>
        )}
      </div>

      <div style={{ background: 'var(--ink-code)' }}>
        <CodeEditor
          nilai={isi}
          onChange={setIsi}
          onJalankan={jalankan}
          fontSize={15}
          minHeight={0}
          ariaLabel={`Contoh kode: ${judul}`}
        />
      </div>

      {(pernahJalan || sedangJalan) && (
        <KonsolPython
          keadaan={keadaan}
          sedangJalan={sedangJalan}
          onKirimInput={(baris) => void balasInput(isi, baris)}
        />
      )}
    </div>
  );
}
