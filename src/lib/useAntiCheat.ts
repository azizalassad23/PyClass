import { useCallback, useEffect, useRef, useState } from 'react';
import { baca, hapus, tulis } from './storage';

/**
 * §8.4 — anti-cheat, berlaku untuk SEMUA penilaian (ujian, kuis unit, Pra-Term
 * Quiz) karena ketiganya memakai layar pengerjaan yang sama.
 *
 * Aturan:
 * - Keluar dari halaman ujian pertama kali → peringatan.
 * - Kedua kali dan seterusnya → pengerjaan DIBLOKIR (kuis unit 10 menit, lainnya
 *   30 menit). Timer tetap berjalan selama diblokir.
 * - Keluar lagi SAAT diblokir memulai ulang hitungannya. Tanpa ini, masa blokir
 *   justru menjadi waktu luang untuk mencari jawaban sebelum mengerjakan ulang.
 * - Saat blokir berakhir — habis waktunya atau dibuka guru — seluruh jawaban
 *   dikosongkan dan murid mulai lagi dari soal 1.
 * - Klik kanan, salin, potong, tempel, dan seret-lepas diblokir.
 *
 * "Keluar" hanya dihitung bila halaman benar-benar tersembunyi (pindah tab, tab
 * baru, minimize), bukan sekadar kehilangan fokus: mengeklik bilah alamat atau
 * notifikasi sistem tidak boleh berujung blokir 30 menit.
 *
 * Batasan jujur (PRD): aplikasi berjalan sepenuhnya di browser murid, jadi ini
 * PENGHALANG, bukan pengaman. Murid yang paham DevTools — atau yang menghapus
 * data situs — bisa melewatinya. Pengawasan langsung di kelas tetap lapisan utamanya.
 */

/** Lama blokir per jenis penilaian. Kuis unit hanya 20 menit, jadi blokirnya lebih pendek. */
export function durasiBlokirMenit(jenis: string): number {
  return jenis === 'kuis' ? 10 : 30;
}

/**
 * Memuat ulang halaman juga membuat halaman sempat tersembunyi, padahal itu sah
 * (timer memang dirancang tahan refresh). Setiap kejadian keluar dicatat beserta
 * keadaan sebelumnya; bila halaman berikutnya ternyata hasil muat ulang dalam
 * jeda ini, kejadian itu dibatalkan. Catatan dihapus begitu murid kembali ke tab
 * ujian, jadi "lihat tab lain, kembali, lalu refresh" tetap terhitung.
 */
const JEDA_MUAT_ULANG_MS = 8_000;

interface KeluarTerakhir {
  ts: number;
  pindahSebelum: number;
  blokirSebelum: number | null;
}

function pulihkanBilaMuatUlang(kPindah: string, kBlokir: string, kKeluar: string): void {
  const keluar = baca<KeluarTerakhir | null>(kKeluar, null);
  if (!keluar) return;
  hapus(kKeluar);
  const navigasi = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
  if (navigasi?.type !== 'reload' || Date.now() - keluar.ts > JEDA_MUAT_ULANG_MS) return;
  tulis(kPindah, keluar.pindahSebelum);
  if (keluar.blokirSebelum === null) hapus(kBlokir);
  else tulis(kBlokir, keluar.blokirSebelum);
}

export interface AntiCheat {
  /** F-A02 — jumlah keluar dari halaman ujian, ikut dikirim ke Sheets. */
  pindahTab: number;
  peringatan: string | null;
  tutupPeringatan: () => void;
  /** Waktu (epoch ms) blokir berakhir; null bila tidak sedang diblokir. */
  diblokirSampai: number | null;
  sisaBlokirDetik: number;
  /** Diteruskan dari balasan denyut: nomor urut "buka blokir" terbaru dari guru. */
  terimaBukaBlokir: (ke: number) => void;
}

interface OpsiAntiCheat {
  /** `<kode sesi>:<NIS>` — keadaan disimpan per murid per sesi. */
  kunci: string;
  aktif: boolean;
  durasiBlokirMenit: number;
  /** Dipanggil saat blokir berakhir, baik karena habis waktunya maupun dibuka guru. */
  onBlokirSelesai: () => void;
}

export function useAntiCheat({ kunci, aktif, durasiBlokirMenit, onBlokirSelesai }: OpsiAntiCheat): AntiCheat {
  const kPindah = `pindahtab:${kunci}`;
  const kBlokir = `blokir:${kunci}`;
  const kKeluar = `keluar:${kunci}`;
  const kBuka = `bukablokir:${kunci}`;

  // Pemulihan dijalankan di initializer state pertama agar state berikutnya
  // membaca nilai yang sudah dikoreksi. Aman dijalankan dua kali (StrictMode):
  // panggilan kedua tidak menemukan catatan keluar lagi.
  const [pindahTab, setPindahTab] = useState(() => {
    pulihkanBilaMuatUlang(kPindah, kBlokir, kKeluar);
    return baca<number>(kPindah, 0);
  });
  const [diblokirSampai, setDiblokirSampai] = useState<number | null>(() => baca<number | null>(kBlokir, null));
  const [peringatan, setPeringatan] = useState<string | null>(null);
  const [sekarang, setSekarang] = useState(() => Date.now());

  const pindahRef = useRef(pindahTab);
  const blokirRef = useRef(diblokirSampai);
  const onSelesaiRef = useRef(onBlokirSelesai);
  pindahRef.current = pindahTab;
  blokirRef.current = diblokirSampai;
  onSelesaiRef.current = onBlokirSelesai;

  const akhiriBlokir = useCallback(() => {
    // Penjaga ganda: hitung mundur dan pembukaan oleh guru bisa datang bersamaan,
    // dan progres tidak boleh direset dua kali.
    if (blokirRef.current === null) return;
    blokirRef.current = null;
    hapus(kBlokir);
    setDiblokirSampai(null);
    onSelesaiRef.current();
  }, [kBlokir]);

  // Hitung mundur blokir. Juga menangani blokir yang sudah lewat waktunya ketika
  // halaman dibuka kembali setelah ditutup.
  useEffect(() => {
    if (diblokirSampai === null) return;
    const periksa = () => {
      const t = Date.now();
      setSekarang(t);
      if (t >= diblokirSampai) akhiriBlokir();
    };
    periksa();
    const id = window.setInterval(periksa, 1000);
    return () => window.clearInterval(id);
  }, [diblokirSampai, akhiriBlokir]);

  const catat = useCallback(() => {
    const sebelum = pindahRef.current;
    const baru = sebelum + 1;
    tulis(kKeluar, {
      ts: Date.now(),
      pindahSebelum: sebelum,
      blokirSebelum: blokirRef.current,
    } satisfies KeluarTerakhir);
    pindahRef.current = baru;
    tulis(kPindah, baru);
    setPindahTab(baru);

    if (baru === 1) {
      setPeringatan(
        `Kamu keluar dari halaman ujian. Ini peringatan terakhir: sekali lagi keluar, pengerjaanmu diblokir ${durasiBlokirMenit} menit dan seluruh jawabanmu dikosongkan.`,
      );
      return;
    }

    // Kedua kali dan seterusnya — termasuk keluar lagi saat sedang diblokir, yang
    // memulai ulang hitungan dari awal.
    const sampai = Date.now() + durasiBlokirMenit * 60_000;
    blokirRef.current = sampai;
    tulis(kBlokir, sampai);
    setDiblokirSampai(sampai);
    setSekarang(Date.now());
    setPeringatan(null);
  }, [kPindah, kBlokir, kKeluar, durasiBlokirMenit]);

  useEffect(() => {
    if (!aktif) return;
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') catat();
      // Kembali ke tab ujian: kejadian tadi sah dihitung, bukan akibat muat ulang.
      else hapus(kKeluar);
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [aktif, catat, kKeluar]);

  useEffect(() => {
    if (!aktif) return;

    // F-A01 — dipasang di fase CAPTURE pada window supaya berjalan sebelum handler
    // milik editor kode. CodeMirror mengisi clipboard sendiri saat Ctrl+C di dalam
    // editor, sehingga preventDefault di tingkat dokumen saja tidak menghentikannya.
    const blokir = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
    };
    const jenis = ['contextmenu', 'copy', 'cut', 'paste', 'dragstart', 'drop'];
    jenis.forEach((j) => window.addEventListener(j, blokir, true));

    const gaya = document.createElement('style');
    gaya.textContent =
      '[data-ujian] { -webkit-user-select: none; user-select: none; } ' +
      '[data-ujian] input, [data-ujian] textarea, [data-ujian] .cm-content { -webkit-user-select: text; user-select: text; }';
    document.head.appendChild(gaya);

    return () => {
      jenis.forEach((j) => window.removeEventListener(j, blokir, true));
      gaya.remove();
    };
  }, [aktif]);

  const terimaBukaBlokir = useCallback(
    (ke: number) => {
      if (!(ke > baca<number>(kBuka, 0))) return;
      tulis(kBuka, ke);
      akhiriBlokir();
    },
    [kBuka, akhiriBlokir],
  );

  return {
    pindahTab,
    peringatan,
    tutupPeringatan: () => setPeringatan(null),
    diblokirSampai,
    sisaBlokirDetik: diblokirSampai === null ? 0 : Math.max(0, Math.ceil((diblokirSampai - sekarang) / 1000)),
    terimaBukaBlokir,
  };
}

/** F-A03 — sinyal tambahan: lama pengerjaan dan berapa kali kode dijalankan. */
export function useJejakSoal(kunci: string) {
  const kunciPenuh = `jejak:${kunci}`;
  const [jejak, setJejak] = useState<Record<string, { detik: number; jalan: number }>>(
    () => baca(kunciPenuh, {}),
  );
  const aktifSejak = useRef<{ id: string; ts: number } | null>(null);

  const simpan = useCallback(
    (data: Record<string, { detik: number; jalan: number }>) => {
      setJejak(data);
      tulis(kunciPenuh, data);
    },
    [kunciPenuh],
  );

  const masukSoal = useCallback(
    (soalId: string) => {
      const sebelum = aktifSejak.current;
      if (sebelum && sebelum.id !== soalId) {
        const detik = Math.round((Date.now() - sebelum.ts) / 1000);
        const lama = jejak[sebelum.id] ?? { detik: 0, jalan: 0 };
        simpan({ ...jejak, [sebelum.id]: { ...lama, detik: lama.detik + detik } });
      }
      aktifSejak.current = { id: soalId, ts: Date.now() };
    },
    [jejak, simpan],
  );

  const catatJalan = useCallback(
    (soalId: string) => {
      const lama = jejak[soalId] ?? { detik: 0, jalan: 0 };
      simpan({ ...jejak, [soalId]: { ...lama, jalan: lama.jalan + 1 } });
    },
    [jejak, simpan],
  );

  return { jejak, masukSoal, catatJalan };
}
