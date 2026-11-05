/** Satu kotak contoh masukan atau keluaran pada soal. */
export function KotakContoh({ label, isi }: { label: string; isi: string }) {
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--r-sm)', padding: '10px 14px' }}>
      <div className="eyebrow" style={{ fontSize: 10, marginBottom: 4 }}>{label}</div>
      <pre style={{ margin: 0, fontSize: 13.5, whiteSpace: 'pre-wrap', color: 'var(--ink)' }}>
        {isi === '' ? '(kosong)' : isi}
      </pre>
    </div>
  );
}
