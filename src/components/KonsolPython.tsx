import { useEffect, useRef, useState } from 'react';
import type { KeadaanJalan } from '../python/useRunner';

interface Props {
  keadaan: KeadaanJalan;
  sedangJalan: boolean;
  onKirimInput: (baris: string) => void;
  /** Sembunyikan panel sebelum program pernah dijalankan. */
  kosongPesan?: string;
}

export function KonsolPython({ keadaan, sedangJalan, onKirimInput, kosongPesan }: Props) {
  const [baris, setBaris] = useState('');
  const isian = useRef<HTMLInputElement>(null);
  const bawah = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (keadaan.menungguInput) isian.current?.focus();
  }, [keadaan.menungguInput]);

  useEffect(() => {
    bawah.current?.scrollIntoView({ block: 'nearest' });
  }, [keadaan.transkrip.length, keadaan.menungguInput]);

  const kirim = () => {
    onKirimInput(baris);
    setBaris('');
  };

  const belumPernahJalan = keadaan.transkrip.length === 0 && !keadaan.galatMentah && !sedangJalan;

  // Ajakan dari worker berisi seluruh baris stdout terakhir, yang bisa memuat
  // ajakan-ajakan sebelumnya (input() tidak menulis baris baru). Yang relevan
  // hanyalah potongan yang muncul setelah masukan terakhir.
  const potonganTerakhir = [...keadaan.transkrip].reverse().find((b) => b.jenis === 'keluaran');
  const ajakanBersih = (potonganTerakhir?.teks.split('\n').pop() ?? keadaan.ajakan).trim();

  return (
    <div
      style={{
        background: 'var(--ink)', padding: '16px 18px 18px',
        fontFamily: 'var(--mono)', fontSize: 13.5, lineHeight: 1.75,
      }}
    >
      <div className="eyebrow" style={{ fontFamily: 'var(--sans)', color: 'var(--muted-2)', marginBottom: 8 }}>
        Keluaran
      </div>

      <div
        role="log"
        aria-live="polite"
        aria-label="Keluaran program Python"
        style={{ maxHeight: 260, overflowY: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
      >
        {belumPernahJalan && (
          <div style={{ color: 'var(--muted)' }}>{kosongPesan ?? 'Tekan Jalankan untuk melihat hasilnya.'}</div>
        )}

        {keadaan.transkrip.map((b, i) =>
          b.jenis === 'keluaran' ? (
            <span key={i} style={{ color: '#f9f4ed' }}>{b.teks}</span>
          ) : (
            <span key={i} style={{ color: 'var(--brand-lit)' }}>{b.teks}{'\n'}</span>
          ),
        )}

        {sedangJalan && <div style={{ color: 'var(--muted-3)' }}>menjalankan…</div>}

        {keadaan.galatRamah && (
          <div
            style={{
              marginTop: 10, background: '#3a2419', border: '1px solid #6b3d1f',
              borderRadius: 14, padding: '12px 14px', fontFamily: 'var(--sans)', fontSize: 13.5, lineHeight: 1.55,
            }}
          >
            <div style={{ color: 'var(--brand-lit)', fontWeight: 700, marginBottom: 4 }}>
              {keadaan.galatRamah.judul}
              {keadaan.galatRamah.baris ? ` · baris ${keadaan.galatRamah.baris}` : ''}
            </div>
            <div style={{ color: '#e8ddd0' }}>{keadaan.galatRamah.saran}</div>
          </div>
        )}

        {keadaan.galatMentah && (
          <details style={{ marginTop: 8 }}>
            <summary
              style={{
                color: 'var(--muted-3)', cursor: 'pointer',
                fontFamily: 'var(--sans)', fontSize: 12.5,
              }}
            >
              Pesan asli dari Python
            </summary>
            <pre style={{ margin: '6px 0 0', color: '#e08c6a', fontSize: 12.5, whiteSpace: 'pre-wrap' }}>
              {keadaan.galatMentah}
            </pre>
          </details>
        )}

        {keadaan.selesai && !keadaan.galatMentah && !keadaan.timeout && keadaan.transkrip.length > 0 && (
          <div style={{ color: 'var(--muted)' }}>
            — selesai dalam {(keadaan.durasiMs / 1000).toFixed(2)} detik —
          </div>
        )}
        <div ref={bawah} />
      </div>

      {keadaan.menungguInput && (
        <form
          onSubmit={(e) => { e.preventDefault(); kirim(); }}
          style={{
            marginTop: 10, display: 'flex', alignItems: 'center', gap: 8,
            background: 'var(--ink-code)', border: '1px solid var(--ink-chrome)',
            borderRadius: 'var(--r-pill)', padding: '6px 8px 6px 14px',
          }}
        >
          <span style={{ color: 'var(--brand-lit)' }} aria-hidden="true">›</span>
          <input
            ref={isian}
            value={baris}
            onChange={(e) => setBaris(e.target.value)}
            aria-label={ajakanBersih || 'Masukan untuk program'}
            placeholder="ketik masukan lalu tekan Enter…"
            style={{
              flex: 1, background: 'transparent', border: 0, outline: 'none',
              color: '#f9f4ed', fontFamily: 'var(--mono)', fontSize: 13.5, padding: '6px 0',
            }}
          />
          <button type="submit" className="btn btn--primary btn--sm" style={{ minHeight: 34, padding: '8px 16px' }}>
            Kirim
          </button>
        </form>
      )}
    </div>
  );
}
