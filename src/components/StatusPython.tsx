import { usePython } from '../python/PythonProvider';

/** Spanduk selama Python belum siap; hilang sendiri begitu siap. */
export function StatusPython({ akhiran }: { akhiran: string }) {
  const { fase, pesanFase } = usePython();
  if (fase === 'siap') return null;
  return (
    <p
      role="status"
      style={{
        margin: '0 0 18px', padding: '12px 16px', borderRadius: 'var(--r-sm)', fontSize: 13.5,
        background: fase === 'gagal' ? 'var(--brand-wash)' : 'var(--surface)', color: 'var(--muted)',
        border: '1px solid var(--line)',
      }}
    >
      {fase === 'gagal' ? pesanFase : `${pesanFase || 'Menyiapkan Python…'} ${akhiran}`}
    </p>
  );
}
