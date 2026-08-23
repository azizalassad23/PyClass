/**
 * F-M05 — halaman materi ditulis sebagai Markdown di repo. Menambah halaman
 * cukup dengan menaruh berkas .md baru di folder ini; tidak ada kode yang perlu
 * diubah. Front matter menentukan unit, urutan, dan judulnya.
 */
import { marked } from 'marked';

export interface HalamanMateri {
  slug: string;
  unit: string;
  urut: number;
  judul: string;
  pertemuan: string;
  /** Ringkasan satu kalimat untuk mode presentasi. */
  intisari: string;
  /** Butir-butir besar untuk slide presentasi. */
  poin: string[];
  html: string;
  /** Blok kode yang bisa dijalankan, diurutkan sesuai kemunculannya. */
  contohKode: { judul: string; kode: string }[];
  latihan: { instruksi: string; kodeAwal: string; petunjuk: string } | null;
}

interface FrontMatter {
  [k: string]: string | string[];
}

function pisahFrontMatter(teks: string): { fm: FrontMatter; isi: string } {
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(teks);
  if (!m) return { fm: {}, isi: teks };
  const fm: FrontMatter = {};
  let kunciDaftar: string | null = null;
  for (const baris of m[1].split(/\r?\n/)) {
    const item = /^\s*-\s+(.*)$/.exec(baris);
    if (item && kunciDaftar) {
      (fm[kunciDaftar] as string[]).push(bersih(item[1]));
      continue;
    }
    const pasangan = /^([A-Za-z0-9_]+):\s*(.*)$/.exec(baris);
    if (!pasangan) continue;
    const [, kunci, nilai] = pasangan;
    if (nilai.trim() === '') {
      kunciDaftar = kunci;
      fm[kunci] = [];
    } else {
      kunciDaftar = null;
      fm[kunci] = bersih(nilai);
    }
  }
  return { fm, isi: teks.slice(m[0].length) };
}

const bersih = (s: string) => s.trim().replace(/^["']|["']$/g, '');

/**
 * Blok ```python jalankan dan blok :::latihan diangkat keluar dari Markdown
 * supaya bisa dirender sebagai komponen React (editor + tombol Jalankan),
 * bukan sebagai <pre> mati.
 */
function angkatBlokKhusus(isi: string) {
  const contohKode: HalamanMateri['contohKode'] = [];
  let latihan: HalamanMateri['latihan'] = null;

  let sisa = isi.replace(
    /:::latihan\s*\r?\n([\s\S]*?):::/g,
    (_all, badan: string) => {
      const kode = /```python\r?\n([\s\S]*?)```/.exec(badan);
      const petunjuk = /petunjuk:\s*(.*)/.exec(badan);
      latihan = {
        instruksi: badan
          .replace(/```python\r?\n[\s\S]*?```/g, '')
          .replace(/petunjuk:.*/g, '')
          .trim(),
        kodeAwal: kode ? kode[1] : '',
        petunjuk: petunjuk ? petunjuk[1].trim() : '',
      };
      return '';
    },
  );

  sisa = sisa.replace(
    /```python jalankan(?:\s+judul="([^"]*)")?\r?\n([\s\S]*?)```/g,
    (_all, judul: string | undefined, kode: string) => {
      const indeks = contohKode.length;
      contohKode.push({ judul: judul ?? `Contoh ${indeks + 1}`, kode: kode.replace(/\s+$/, '') });
      return `\n<div data-contoh="${indeks}"></div>\n`;
    },
  );

  return { sisa, contohKode, latihan };
}

marked.setOptions({ gfm: true, breaks: false });

const berkas = import.meta.glob('./materi/*.md', { query: '?raw', import: 'default', eager: true }) as Record<
  string,
  string
>;

export const HALAMAN: HalamanMateri[] = Object.entries(berkas)
  .map(([jalur, teks]) => {
    const slug = jalur.replace(/^.*\//, '').replace(/\.md$/, '');
    const { fm, isi } = pisahFrontMatter(teks);
    const { sisa, contohKode, latihan } = angkatBlokKhusus(isi);
    return {
      slug,
      unit: String(fm.unit ?? 'U1'),
      urut: Number(fm.urut ?? 0),
      judul: String(fm.judul ?? slug),
      pertemuan: String(fm.pertemuan ?? ''),
      intisari: String(fm.intisari ?? ''),
      poin: Array.isArray(fm.poin) ? fm.poin : [],
      html: marked.parse(sisa) as string,
      contohKode,
      latihan,
    };
  })
  .sort((a, b) => (a.unit === b.unit ? a.urut - b.urut : a.unit.localeCompare(b.unit)));

export function halamanUnit(unit: string): HalamanMateri[] {
  return HALAMAN.filter((h) => h.unit === unit);
}

export function cariHalaman(slug: string): HalamanMateri | undefined {
  return HALAMAN.find((h) => h.slug === slug);
}
