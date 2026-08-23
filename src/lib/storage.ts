/** Pembungkus localStorage yang aman bila penyimpanan diblokir/penuh. */

const PREFIX = 'pyclass:';

export function baca<T>(kunci: string, bawaan: T): T {
  try {
    const raw = localStorage.getItem(PREFIX + kunci);
    return raw === null ? bawaan : (JSON.parse(raw) as T);
  } catch {
    return bawaan;
  }
}

export function tulis(kunci: string, nilai: unknown): void {
  try {
    localStorage.setItem(PREFIX + kunci, JSON.stringify(nilai));
  } catch {
    /* kuota penuh / mode privat — abaikan, pengerjaan tetap jalan di memori */
  }
}

export function hapus(kunci: string): void {
  try {
    localStorage.removeItem(PREFIX + kunci);
  } catch {
    /* abaikan */
  }
}

export function daftarKunci(awalan: string): string[] {
  const out: string[] = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(PREFIX + awalan)) out.push(k.slice(PREFIX.length));
    }
  } catch {
    /* abaikan */
  }
  return out;
}
