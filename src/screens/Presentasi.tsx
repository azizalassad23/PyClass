import { useEffect, useState } from 'react';
import { CodeEditor } from '../components/CodeEditor';
import { useRunner } from '../python/useRunner';
import { UNIT_BY_ID } from '../content/units';
import type { HalamanMateri } from '../content/loader';

interface Props {
  halaman: HalamanMateri;
  onKeluar: () => void;
  onPindah: (arah: 'maju' | 'mundur') => void;
  bisaMaju: boolean;
  bisaMundur: boolean;
  nomor: number;
  total: number;
}

/**
 * F-M02 — mode presentasi. Satu tombol mengubah halaman materi menjadi tampilan
 * layar penuh: teks ≥ 28px, navigasi ← / → dan swipe, kode tetap bisa dijalankan.
 */
export function Presentasi({ halaman, onKeluar, onPindah, bisaMaju, bisaMundur, nomor, total }: Props) {
  const contoh = halaman.contohKode[0];
  const [kode, setKode] = useState(contoh?.kode ?? '');
  const { keadaan, mulai, sedangJalan } = useRunner();

  useEffect(() => { setKode(halaman.contohKode[0]?.kode ?? ''); }, [halaman.slug, halaman.contohKode]);

  useEffect(() => {
    void document.documentElement.requestFullscreen?.().catch(() => undefined);
    return () => { if (document.fullscreenElement) void document.exitFullscreen().catch(() => undefined); };
  }, []);

  useEffect(() => {
    const onTombol = (e: KeyboardEvent) => {
      const diEditor = (e.target as HTMLElement | null)?.closest('.cm-editor');
      if (e.key === 'Escape') { onKeluar(); return; }
      if (diEditor) return;
      if (e.key === 'ArrowRight' || e.key === 'PageDown') onPindah('maju');
      if (e.key === 'ArrowLeft' || e.key === 'PageUp') onPindah('mundur');
    };
    window.addEventListener('keydown', onTombol);
    return () => window.removeEventListener('keydown', onTombol);
  }, [onKeluar, onPindah]);

  // Swipe untuk perangkat sentuh.
  useEffect(() => {
    let mulaiX = 0;
    const onMulai = (e: TouchEvent) => { mulaiX = e.changedTouches[0].clientX; };
    const onSelesai = (e: TouchEvent) => {
      const selisih = e.changedTouches[0].clientX - mulaiX;
      if (Math.abs(selisih) < 80) return;
      onPindah(selisih < 0 ? 'maju' : 'mundur');
    };
    window.addEventListener('touchstart', onMulai, { passive: true });
    window.addEventListener('touchend', onSelesai, { passive: true });
    return () => {
      window.removeEventListener('touchstart', onMulai);
      window.removeEventListener('touchend', onSelesai);
    };
  }, [onPindah]);

  const keluaranTerakhir = keadaan.transkrip
    .filter((b) => b.jenis === 'keluaran')
    .map((b) => b.teks)
    .join('')
    .trim()
    .split('\n')
    .slice(-1)[0];

  return (
    <div className="presentasi" role="region" aria-label="Mode presentasi">
      <div
        aria-hidden="true"
        style={{ position: 'absolute', left: -120, bottom: -140, width: 420, height: 420, borderRadius: 999, background: 'var(--brand-tint)' }}
      />

      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 14, padding: '26px clamp(24px, 4vw, 48px) 0', flexWrap: 'wrap' }}>
        <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--brand-hover)' }}>
          Unit {halaman.unit.replace(`U`, ``)} · {UNIT_BY_ID.get(halaman.unit)?.judul ?? ``}
        </span>
        <span style={{ flex: 1 }} />
        <span style={{ fontFamily: 'var(--mono)', fontSize: 13, color: 'var(--muted-2)' }}>
          {nomor} / {total}
        </span>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            type="button" onClick={() => onPindah('mundur')} disabled={!bisaMundur}
            aria-label="Halaman sebelumnya" style={{ ...tombolBulat, background: 'var(--surface)', border: '1px solid var(--line-strong)' }}
          >
            ←
          </button>
          <button
            type="button" onClick={() => onPindah('maju')} disabled={!bisaMaju}
            aria-label="Halaman berikutnya" style={{ ...tombolBulat, background: 'var(--ink)', color: 'var(--cream)', border: 0 }}
          >
            →
          </button>
        </div>
      </div>

      <div className="presentasi__badan">
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h1 className="presentasi__judul">{halaman.judul}</h1>
          {halaman.intisari && <p className="presentasi__intisari">{halaman.intisari}</p>}
          {halaman.poin.length > 0 && (
            <ul className="presentasi__poin">
              {halaman.poin.map((p) => <li key={p}>{p}</li>)}
            </ul>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          {contoh ? (
            <>
              <div style={{ background: 'var(--ink-code)', borderRadius: 'var(--r-xl)', overflow: 'hidden', boxShadow: 'var(--shadow-code)' }}>
                <CodeEditor
                  nilai={kode}
                  onChange={setKode}
                  onJalankan={() => void mulai(kode)}
                  fontSize={22}
                  minHeight={0}
                  ariaLabel="Kode contoh pada slide"
                />
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 22px', background: 'var(--ink-chrome)', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => void mulai(kode)}
                    disabled={sedangJalan}
                    className="btn btn--primary"
                    style={{ fontSize: 19, padding: '12px 28px' }}
                  >
                    <span aria-hidden="true">▶</span> {sedangJalan ? 'Menjalankan…' : 'Jalankan'}
                  </button>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 17, color: 'var(--leaf)' }} role="status">
                    {keadaan.menungguInput ? 'menunggu masukan…' : keluaranTerakhir}
                  </span>
                </div>
              </div>
              {keadaan.menungguInput && (
                <p style={{ marginTop: 14, fontSize: 16, color: 'var(--muted-2)' }}>
                  Contoh ini meminta masukan — keluar dari mode presentasi untuk mengetiknya di panel keluaran.
                </p>
              )}
            </>
          ) : (
            <p style={{ fontSize: 20, color: 'var(--muted-2)' }}>Halaman ini tidak memuat contoh kode.</p>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 20, fontSize: 17, color: 'var(--muted-2)', flexWrap: 'wrap' }}>
            <kbd style={{ background: 'var(--surface)', border: '1px solid var(--line-strong)', borderRadius: 8, padding: '3px 10px', fontFamily: 'var(--mono)', fontSize: 14 }}>
              Esc
            </kbd>
            keluar dari mode presentasi ·
            <kbd style={{ background: 'var(--surface)', border: '1px solid var(--line-strong)', borderRadius: 8, padding: '3px 10px', fontFamily: 'var(--mono)', fontSize: 14 }}>
              ← →
            </kbd>
            pindah halaman
          </div>
        </div>
      </div>
    </div>
  );
}

const tombolBulat: React.CSSProperties = {
  width: 44, height: 44, borderRadius: 999,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  fontSize: 16, cursor: 'pointer', color: 'inherit',
};
