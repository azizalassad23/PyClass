export function mmss(detik: number): string {
  const d = Math.max(0, Math.floor(detik));
  const m = Math.floor(d / 60);
  const s = d % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function tanggalPanjang(ts: number): string {
  return new Date(ts).toLocaleDateString('id-ID', {
    weekday: 'long', day: 'numeric', month: 'short', year: 'numeric',
  });
}

export function jam(ts: number): string {
  return new Date(ts).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

export function sejakDetik(ts: number | null): string {
  if (!ts) return 'belum';
  const d = Math.round((Date.now() - ts) / 1000);
  if (d < 5) return 'baru saja';
  if (d < 60) return `${d} detik lalu`;
  return `${Math.round(d / 60)} menit lalu`;
}

export function angkaId(n: number, desimal = 1): string {
  return n.toLocaleString('id-ID', { minimumFractionDigits: desimal, maximumFractionDigits: desimal });
}

/**
 * Normalisasi keluaran sebelum dibandingkan (F-U05): spasi di akhir baris dan
 * baris kosong di akhir diabaikan. Dipakai di sisi murid hanya untuk test
 * *contoh*; penilaian sungguhan tetap terjadi di Apps Script.
 */
export function normalisasiKeluaran(s: string): string {
  return s
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((b) => b.replace(/[ \t]+$/, ''))
    .join('\n')
    .replace(/\n+$/, '');
}
