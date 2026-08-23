/**
 * Klien Apps Script (PRD §12).
 *
 * Permintaan POST dikirim sebagai `text/plain` supaya termasuk *simple request*
 * dan tidak memicu preflight CORS — Apps Script tidak menjawab OPTIONS.
 * Bila VITE_API_URL kosong, seluruh panggilan dialihkan ke mockBackend.
 */
import * as demo from './mockBackend';
import type {
  BarisRekap, HasilPenilaian, Kelas, PaketUjian, SesiInfo, SubmitPayload,
} from './types';

const BASE = (import.meta.env.VITE_API_URL ?? '').trim();
export const MODE_DEMO = BASE === '';

class ApiError extends Error {}

async function get<T>(params: Record<string, string>): Promise<T> {
  const url = `${BASE}?${new URLSearchParams(params).toString()}`;
  const res = await fetch(url, { method: 'GET', redirect: 'follow' });
  if (!res.ok) throw new ApiError(`Server menjawab ${res.status}`);
  const data = (await res.json()) as { ok: boolean; pesan?: string } & T;
  if (!data.ok) throw new ApiError(data.pesan ?? 'Permintaan ditolak server');
  return data;
}

async function post<T>(action: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}?action=${encodeURIComponent(action)}`, {
    method: 'POST',
    // Sengaja text/plain — lihat catatan CORS di atas.
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(body),
    redirect: 'follow',
  });
  if (!res.ok) throw new ApiError(`Server menjawab ${res.status}`);
  const data = (await res.json()) as { ok: boolean; pesan?: string } & T;
  if (!data.ok) throw new ApiError(data.pesan ?? 'Permintaan ditolak server');
  return data;
}

// ── Murid ────────────────────────────────────────────────────────────────────

export async function ambilPaket(sesi: string, nis: string): Promise<PaketUjian> {
  if (MODE_DEMO) return demo.ambilPaket(sesi, nis);
  return get<PaketUjian>({ action: 'soal', sesi, nis });
}

export async function kirimJawaban(p: SubmitPayload): Promise<HasilPenilaian> {
  if (MODE_DEMO) return demo.nilaiSubmisi(p);
  return post<HasilPenilaian>('nilai', p);
}

export async function cekSesi(kode: string): Promise<SesiInfo> {
  if (MODE_DEMO) {
    // Pesan galatnya dibentuk mockBackend agar sebab yang berbeda (salah ketik
    // vs sesi ditutup) tidak tertukar di mata murid.
    return demo.cekSesi(kode);
  }
  return get<SesiInfo>({ action: 'sesi', kode });
}

// ── Guru ─────────────────────────────────────────────────────────────────────

export async function bukaSesi(
  pin: string, kelas: Kelas, paket: string, durasiMenit: number,
): Promise<SesiInfo> {
  if (MODE_DEMO) return demo.bukaSesi(kelas, paket, durasiMenit);
  return post<SesiInfo>('bukaSesi', { pin, kelas, paket, durasiMenit });
}

export async function tutupSesi(pin: string, kode: string): Promise<void> {
  if (MODE_DEMO) return demo.tutupSesi(kode);
  await post('tutupSesi', { pin, kode });
}

export async function ambilRekap(
  pin: string, kelas: Kelas, jenis: string, sesi: string,
): Promise<BarisRekap[]> {
  if (MODE_DEMO) return demo.rekap(kelas, jenis, sesi);
  const data = await get<{ baris: BarisRekap[] }>({ action: 'rekap', kelas, jenis, sesi, pin });
  return data.baris;
}

export async function sesiKelas(pin: string, kelas: Kelas): Promise<SesiInfo | null> {
  if (MODE_DEMO) return demo.sesiAktifKelas(kelas);
  try {
    return await get<SesiInfo>({ action: 'sesiKelas', kelas, pin });
  } catch {
    return null;
  }
}

/**
 * Sesi yang sedang berjalan di peramban ini. HANYA untuk penolong mode demo di
 * layar masuk ujian; pada mode terhubung selalu kosong, karena murid memang
 * tidak boleh bisa mendaftar sesi kelas lain.
 */
export function daftarSesiDemo(): SesiInfo[] {
  return MODE_DEMO ? demo.sesiBerjalan() : [];
}

/** PIN diverifikasi Apps Script (F-G01) — front-end tidak pernah menyimpannya. */
export async function verifikasiPin(pin: string): Promise<boolean> {
  if (MODE_DEMO) return pin.trim().length >= 4;
  try {
    await get({ action: 'cekPin', pin });
    return true;
  } catch {
    return false;
  }
}

// ── F-U09: antre ulang 3× lalu tawarkan unduhan bukti ────────────────────────

export interface HasilPengiriman {
  hasil: HasilPenilaian | null;
  percobaan: number;
  galat: string | null;
}

const tunggu = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function kirimDenganUlangan(
  p: SubmitPayload,
  onPercobaan?: (ke: number) => void,
): Promise<HasilPengiriman> {
  let galat: string | null = null;
  for (let ke = 1; ke <= 3; ke++) {
    onPercobaan?.(ke);
    try {
      const hasil = await kirimJawaban(p);
      return { hasil, percobaan: ke, galat: null };
    } catch (e) {
      galat = (e as Error).message;
      if (ke < 3) await tunggu(ke * 1500);
    }
  }
  return { hasil: null, percobaan: 3, galat };
}

/** Kode cadangan yang diserahkan ke guru bila pengiriman gagal total. */
export function kodeCadangan(p: SubmitPayload): string {
  let h = 0;
  const s = `${p.nis}|${p.sesi}|${p.paket}`;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  const a = h.toString(36).toUpperCase().padStart(6, '0');
  return `${a.slice(0, 3)}-${a.slice(3, 6)}`;
}
