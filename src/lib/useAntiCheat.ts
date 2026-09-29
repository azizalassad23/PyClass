import { useCallback, useEffect, useRef, useState } from 'react';
import { matikanSirene, nyalakanSirene } from './alarm';
import { baca, hapus, tulis } from './storage';

/**
 * §8.4 — anti-cheat, berlaku untuk SEMUA penilaian (ujian, kuis unit, Pra-Term
 * Quiz, TERM QUIZ) karena semuanya memakai layar pengerjaan yang sama.
 *
 * PELANGGARAN adalah setiap kali murid meninggalkan ujian, dengan cara apa pun:
 * - pindah tab atau aplikasi (halaman tersembunyi);
 * - membuka menu dari atas layar — panel notifikasi atau pengaturan cepat — atau
 *   berpindah ke jendela lain (halaman kehilangan fokus);
 * - keluar dari layar penuh.
 *
 * Satu kejadian dihitung sekali. Tanda-tanda itu sering datang bersamaan
 * (pindah tab di komputer otomatis juga keluar layar penuh), jadi yang dihitung
 * adalah EPISODE: dimulai saat tanda pertama muncul, berakhir saat murid kembali
 * bersih — halaman terlihat, punya fokus, dan dalam layar penuh. Episode baru
 * yang dimulai kurang dari 3 detik setelah episode sebelumnya berakhir dianggap
 * lanjutan kejadian yang sama.
 *
 * Aturan:
 * - Pelanggaran ke-1 dan ke-2 → peringatan.
 * - Pelanggaran ke-3 dan seterusnya → pengerjaan DIBLOKIR (kuis unit 10 menit,
 *   lainnya 30 menit). Timer tetap berjalan. Pelanggaran saat diblokir memulai
 *   ulang hitungan blokir, supaya masa blokir tidak jadi waktu mencari jawaban.
 * - Saat blokir berakhir — habis waktunya atau dibuka guru — seluruh jawaban
 *   dikosongkan dan murid mulai lagi dari soal 1.
 * - Sirene berbunyi selama episode berlangsung.
 * - Klik kanan, salin, potong, tempel, dan seret-lepas diblokir; percobaan
 *   salin-tempel dicatat tetapi tidak dihitung sebagai pelanggaran.
 *
 * Batasan jujur (PRD): aplikasi berjalan sepenuhnya di browser murid, jadi ini
 * PENGHALANG, bukan pengaman. Murid yang paham DevTools — atau yang menghapus
 * data situs — bisa melewatinya. Pengawasan langsung di kelas tetap lapisan utamanya.
 */

/** Lama blokir per jenis penilaian. Kuis unit hanya 20 menit, jadi blokirnya lebih pendek. */
export function durasiBlokirMenit(jenis: string): number {
  return jenis === 'kuis' ? 10 : 30;
}

/** Pelanggaran yang masih berupa peringatan; yang berikutnya memblokir. */
export const BATAS_PERINGATAN = 2;

/** Episode yang dimulai sesingkat ini setelah episode sebelumnya berakhir = kejadian yang sama. */
const JEDA_GABUNG_MS = 3_000;

/**
 * Hilang fokus sesingkat ini tidak dihitung: peramban kadang memindahkan fokus
 * sesaat, misalnya ketika masuk layar penuh. Menarik panel notifikasi selalu
 * lebih lama dari ini.
 */
const JEDA_HILANG_FOKUS_MS = 800;

/**
 * Memuat ulang halaman juga membuat halaman sempat tersembunyi, padahal itu sah
 * (timer memang dirancang tahan refresh). Setiap pelanggaran dicatat beserta
 * keadaan sebelumnya; bila halaman berikutnya ternyata hasil muat ulang dalam
 * jeda ini, pelanggaran itu dibatalkan. Catatan dihapus begitu murid kembali
 * bersih, jadi "keluar, kembali, lalu refresh" tetap terhitung.
 */
const JEDA_MUAT_ULANG_MS = 8_000;

interface KeluarTerakhir {
  ts: number;
  pindahSebelum: number;
  blokirSebelum: number | null;
}

/** Mengembalikan hitungan yang dibatalkan karena ternyata muat ulang, atau null. */
function pulihkanBilaMuatUlang(kPindah: string, kBlokir: string, kKeluar: string): number | null {
  const keluar = baca<KeluarTerakhir | null>(kKeluar, null);
  if (!keluar) return null;
  hapus(kKeluar);
  const navigasi = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
  if (navigasi?.type !== 'reload' || Date.now() - keluar.ts > JEDA_MUAT_ULANG_MS) return null;
  tulis(kPindah, keluar.pindahSebelum);
  if (keluar.blokirSebelum === null) hapus(kBlokir);
  else tulis(kBlokir, keluar.blokirSebelum);
  return keluar.pindahSebelum + 1;
}

type Sumber = 'pindah-tab' | 'menu-atas' | 'keluar-layar-penuh';

const KETERANGAN: Record<Sumber, string> = {
  'pindah-tab': 'pindah tab atau aplikasi lain',
  'menu-atas': 'membuka menu dari atas layar, panel notifikasi, atau jendela lain',
  'keluar-layar-penuh': 'keluar dari layar penuh',
};

export interface AntiCheat {
  /**
   * F-A02 — jumlah pelanggaran. Namanya tetap `pindahTab` karena kolom sheet
   * dan papan pantau sudah memakainya; isinya mencakup ketiga jenis pelanggaran.
   */
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
  /**
   * Benar bila halaman dalam layar penuh, atau perangkat tidak mendukung layar
   * penuh sama sekali (iPhone). Perubahan dari benar ke salah = pelanggaran.
   */
  layarPenuhOk: boolean;
  /** Dipanggil saat blokir berakhir, baik karena habis waktunya maupun dibuka guru. */
  onBlokirSelesai: () => void;
  /** Setiap kejadian yang perlu dicatat di sheet _Kecurangan. */
  onKejadian?: (jenis: string, keterangan: string, ke?: number) => void;
}

/** Percobaan salin-tempel yang sama dicatat paling sering sekali per jeda ini. */
const JEDA_CATAT_SALIN_MS = 15_000;

export function useAntiCheat({
  kunci, aktif, durasiBlokirMenit, layarPenuhOk, onBlokirSelesai, onKejadian,
}: OpsiAntiCheat): AntiCheat {
  const kPindah = `pindahtab:${kunci}`;
  const kBlokir = `blokir:${kunci}`;
  const kKeluar = `keluar:${kunci}`;
  const kBuka = `bukablokir:${kunci}`;

  // Pemulihan dijalankan di initializer state pertama agar state berikutnya
  // membaca nilai yang sudah dikoreksi. Aman dijalankan dua kali (StrictMode):
  // panggilan kedua tidak menemukan catatan keluar lagi.
  const batalMuatUlang = useRef<number | null>(null);
  const [pindahTab, setPindahTab] = useState(() => {
    const batal = pulihkanBilaMuatUlang(kPindah, kBlokir, kKeluar);
    if (batal !== null) batalMuatUlang.current = batal;
    return baca<number>(kPindah, 0);
  });
  const [diblokirSampai, setDiblokirSampai] = useState<number | null>(() => baca<number | null>(kBlokir, null));
  const [peringatan, setPeringatan] = useState<string | null>(null);
  const [sekarang, setSekarang] = useState(() => Date.now());

  const pindahRef = useRef(pindahTab);
  const blokirRef = useRef(diblokirSampai);
  const onSelesaiRef = useRef(onBlokirSelesai);
  const onKejadianRef = useRef(onKejadian);
  const aktifRef = useRef(aktif);
  const layarOkRef = useRef(layarPenuhOk);
  pindahRef.current = pindahTab;
  blokirRef.current = diblokirSampai;
  onSelesaiRef.current = onBlokirSelesai;
  onKejadianRef.current = onKejadian;
  aktifRef.current = aktif;

  // Keadaan episode (satu kejadian meninggalkan ujian).
  const episode = useRef<{ mulai: number } | null>(null);
  const episodeSelesai = useRef(0);
  // Layar penuh yang belum pernah aktif — misalnya halaman baru dimuat ulang —
  // bukan pelanggaran; tirai sudah cukup. Pelanggaran baru dihitung setelah
  // murid pernah masuk layar penuh di halaman ini.
  const layarPernahOk = useRef(layarPenuhOk);

  const lapor = useCallback((jenis: string, keterangan: string, ke = 0) => {
    onKejadianRef.current?.(jenis, keterangan, ke);
  }, []);

  // Kejadian yang ternyata muat ulang sudah telanjur tercatat; catat juga
  // pembatalannya supaya guru tidak salah baca.
  useEffect(() => {
    if (batalMuatUlang.current === null) return;
    lapor('muat-ulang', `pelanggaran ke-${batalMuatUlang.current} dibatalkan: halaman hanya dimuat ulang`);
    batalMuatUlang.current = null;
  }, [lapor]);

  const akhiriBlokir = useCallback(() => {
    // Penjaga ganda: hitung mundur dan pembukaan oleh guru bisa datang bersamaan,
    // dan progres tidak boleh direset dua kali.
    if (blokirRef.current === null) return;
    blokirRef.current = null;
    hapus(kBlokir);
    setDiblokirSampai(null);
    lapor('blokir-berakhir', 'blokir selesai, seluruh jawaban dikosongkan');
    onSelesaiRef.current();
  }, [kBlokir, lapor]);

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

  /** Menghitung satu pelanggaran dan menerapkan aturannya. */
  const hitungPelanggaran = useCallback((sumber: Sumber) => {
    const sebelum = pindahRef.current;
    const baru = sebelum + 1;
    tulis(kKeluar, { ts: Date.now(), pindahSebelum: sebelum, blokirSebelum: blokirRef.current } satisfies KeluarTerakhir);
    pindahRef.current = baru;
    tulis(kPindah, baru);
    setPindahTab(baru);

    if (baru <= BATAS_PERINGATAN) {
      lapor(sumber, `${KETERANGAN[sumber]} (pelanggaran ke-${baru}, peringatan)`, baru);
      setPeringatan(
        baru < BATAS_PERINGATAN
          ? `Pelanggaran ke-${baru}: kamu meninggalkan ujian (${KETERANGAN[sumber]}). Pelanggaran ke-${BATAS_PERINGATAN + 1} memblokir pengerjaanmu ${durasiBlokirMenit} menit dan mengosongkan seluruh jawabanmu.`
          : `Pelanggaran ke-${baru}: kamu meninggalkan ujian (${KETERANGAN[sumber]}). Ini peringatan terakhir — sekali lagi, pengerjaanmu diblokir ${durasiBlokirMenit} menit dan seluruh jawabanmu dikosongkan.`,
      );
      return;
    }

    // Ke-3 dan seterusnya — termasuk saat sedang diblokir, yang memulai ulang hitungannya.
    const sampai = Date.now() + durasiBlokirMenit * 60_000;
    lapor(sumber, `${KETERANGAN[sumber]} (pelanggaran ke-${baru})`, baru);
    lapor('diblokir', `pelanggaran ke-${baru}, diblokir ${durasiBlokirMenit} menit`, baru);
    blokirRef.current = sampai;
    tulis(kBlokir, sampai);
    setDiblokirSampai(sampai);
    setSekarang(Date.now());
    setPeringatan(null);
  }, [kPindah, kBlokir, kKeluar, durasiBlokirMenit, lapor]);

  const mulaiEpisode = useCallback((sumber: Sumber) => {
    if (!aktifRef.current || episode.current) return;
    episode.current = { mulai: Date.now() };
    nyalakanSirene();
    // Lanjutan kejadian yang baru saja berakhir: sirene tetap, hitungan tidak.
    if (Date.now() - episodeSelesai.current < JEDA_GABUNG_MS) return;
    hitungPelanggaran(sumber);
  }, [hitungPelanggaran]);

  /** Episode berakhir bila halaman terlihat, punya fokus, dan dalam layar penuh. */
  const periksaKembali = useCallback(() => {
    if (!episode.current) return;
    const bersih = document.visibilityState === 'visible' && document.hasFocus() && layarOkRef.current;
    if (!bersih) return;
    const detik = Math.round((Date.now() - episode.current.mulai) / 1000);
    episode.current = null;
    episodeSelesai.current = Date.now();
    matikanSirene();
    // Kembali bersih: kejadian tadi sah dihitung, bukan akibat muat ulang.
    hapus(kKeluar);
    lapor('kembali', `kembali ke ujian setelah ${detik} detik`);
  }, [kKeluar, lapor]);

  // Layar penuh: dari aktif ke tidak aktif = pelanggaran.
  useEffect(() => {
    const sebelumnya = layarOkRef.current;
    layarOkRef.current = layarPenuhOk;
    if (layarPenuhOk) {
      layarPernahOk.current = true;
      periksaKembali();
      return;
    }
    if (sebelumnya && layarPernahOk.current && aktifRef.current) mulaiEpisode('keluar-layar-penuh');
  }, [layarPenuhOk, mulaiEpisode, periksaKembali]);

  // Pindah tab dan hilang fokus.
  useEffect(() => {
    if (!aktif) return;
    let tundaFokus: number | undefined;

    const onVisibility = () => {
      if (document.visibilityState === 'hidden') mulaiEpisode('pindah-tab');
      else periksaKembali();
    };
    const onBlur = () => {
      window.clearTimeout(tundaFokus);
      tundaFokus = window.setTimeout(() => {
        // Halaman tersembunyi sudah ditangani visibilitychange sebagai pindah tab.
        if (document.visibilityState === 'visible' && !document.hasFocus()) mulaiEpisode('menu-atas');
      }, JEDA_HILANG_FOKUS_MS);
    };
    const onFocus = () => {
      window.clearTimeout(tundaFokus);
      periksaKembali();
    };

    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('blur', onBlur);
    window.addEventListener('focus', onFocus);
    return () => {
      window.clearTimeout(tundaFokus);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('blur', onBlur);
      window.removeEventListener('focus', onFocus);
    };
  }, [aktif, mulaiEpisode, periksaKembali]);

  // Setelah mengirim, sirene tidak boleh tertinggal.
  useEffect(() => {
    if (aktif) return;
    episode.current = null;
    matikanSirene();
  }, [aktif]);
  useEffect(() => () => matikanSirene(), []);

  useEffect(() => {
    if (!aktif) return;

    // F-A01 — dipasang di fase CAPTURE pada window supaya berjalan sebelum handler
    // milik editor kode. CodeMirror mengisi clipboard sendiri saat Ctrl+C di dalam
    // editor, sehingga preventDefault di tingkat dokumen saja tidak menghentikannya.
    const terakhirDicatat: Record<string, number> = {};
    const hitungan: Record<string, number> = {};
    const blokir = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      // Klik kanan dan seret tidak dicatat: terlalu sering terjadi tanpa sengaja.
      if (e.type !== 'copy' && e.type !== 'cut' && e.type !== 'paste') return;
      hitungan[e.type] = (hitungan[e.type] ?? 0) + 1;
      const t = Date.now();
      if (t - (terakhirDicatat[e.type] ?? 0) < JEDA_CATAT_SALIN_MS) return;
      terakhirDicatat[e.type] = t;
      const nama = e.type === 'paste' ? 'menempel' : e.type === 'copy' ? 'menyalin' : 'memotong';
      lapor('salin-tempel', `mencoba ${nama} (ditolak, tidak dihitung pelanggaran)`, hitungan[e.type]);
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
  }, [aktif, lapor]);

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
