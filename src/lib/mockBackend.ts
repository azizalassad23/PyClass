/**
 * MODE DEMO — pengganti Apps Script saat VITE_API_URL kosong.
 *
 * Semua yang di sini seharusnya berjalan di server (PRD §10): pemilihan varian
 * soal, penyimpanan sesi, dan terutama PENILAIAN. Di mode demo semuanya
 * dikerjakan di browser dan disimpan di localStorage, jadi kunci jawaban ikut
 * ada di perangkat murid. Itu sebabnya mode ini hanya untuk mencoba aplikasi,
 * bukan untuk ujian sungguhan — UI menandainya dengan lencana "Mode demo".
 */
import { BANK_BY_ID, grupSoal, type SoalBank } from './bankSoal';
import { PAKET_BY_ID, type DefinisiPaket } from './paket';
import { normalisasiKeluaran } from './format';
import { hashSeed, kodeKonfirmasi, mulberry32, pilihAcak } from './rng';
import { baca, daftarKunci, tulis } from './storage';
import type {
  BarisRekap, HasilPenilaian, Kelas, PaketUjian, SesiInfo, Soal, SubmitPayload,
} from './types';

const K_SESI = 'demo:sesi';
const K_KIRIM = 'demo:kirim:';

interface BarisTersimpan extends SubmitPayload {
  ts: number;
  nilai: number;
  testLulus: number;
  testTotal: number;
  konfirmasi: string;
  perSoal: HasilPenilaian['perSoal'];
}

// ── Sesi ─────────────────────────────────────────────────────────────────────

function semuaSesi(): SesiInfo[] {
  return baca<SesiInfo[]>(K_SESI, []);
}

function simpanSesi(daftar: SesiInfo[]): void {
  tulis(K_SESI, daftar);
}

export function cariSesi(kode: string): SesiInfo | null {
  const cocok = semuaSesi().filter((s) => s.kode === kode);
  if (cocok.length === 0) return null;
  // Bila ada lebih dari satu (riwayat lama), yang berjalan selalu menang —
  // jangan sampai murid ditolak karena baris tutup yang kebetulan lebih dulu.
  return cocok.find((s) => s.status === 'berjalan') ?? cocok[0];
}

/** Dipakai layar masuk ujian sebelum soal diambil. */
export function cekSesi(kode: string): SesiInfo {
  const s = cariSesi(kode);
  if (!s) throw new Error(pesanKodeTakDikenal(kode));
  if (s.status !== 'berjalan') {
    throw new Error(`Sesi ${kode} sudah ditutup guru. Mintalah kode sesi yang baru.`);
  }
  return s;
}

export function sesiAktifKelas(kelas: Kelas): SesiInfo | null {
  return semuaSesi().find((s) => s.kelas === kelas && s.status === 'berjalan') ?? null;
}

export function bukaSesi(kelas: Kelas, paket: string, durasiMenit: number): SesiInfo {
  const def = PAKET_BY_ID.get(paket);
  if (!def) throw new Error(`Paket ${paket} tidak dikenal`);
  const daftar = semuaSesi().map((s) =>
    s.kelas === kelas && s.status === 'berjalan' ? { ...s, status: 'ditutup' as const } : s,
  );
  // Seed ikut memakai penghitung agar dua klik dalam milidetik yang sama tidak
  // menghasilkan kode kembar; lalu dipastikan belum pernah dipakai sesi mana pun.
  const terpakai = new Set(daftar.map((s) => s.kode));
  let kode = '';
  for (let putaran = 0; putaran < 50; putaran++) {
    const rand = mulberry32(hashSeed(kelas, paket, String(Date.now()), String(putaran)));
    kode = String(100000 + Math.floor(rand() * 900000));
    if (!terpakai.has(kode)) break;
  }
  const sesi: SesiInfo = {
    kode, kelas, paket, jenis: def.jenis, judul: def.judul,
    durasiMenit, dibukaPada: Date.now(), ditutupPada: null, status: 'berjalan',
  };
  daftar.unshift(sesi);
  simpanSesi(daftar);
  return sesi;
}

export function tutupSesi(kode: string): void {
  simpanSesi(
    semuaSesi().map((s) =>
      s.kode === kode ? { ...s, status: 'ditutup' as const, ditutupPada: Date.now() } : s,
    ),
  );
}

export function riwayatSesi(): SesiInfo[] {
  return semuaSesi();
}

/** Seluruh sesi yang sedang berjalan — dipakai penolong mode demo di layar masuk. */
export function sesiBerjalan(): SesiInfo[] {
  return semuaSesi().filter((s) => s.status === 'berjalan');
}

/**
 * Pesan untuk kode yang tidak dikenal. Dibedakan tegas dari "sudah ditutup":
 * salah ketik satu angka dan sesi yang benar-benar ditutup butuh tindakan yang
 * sangat berbeda dari murid.
 */
function pesanKodeTakDikenal(kode: string): string {
  const aktif = sesiBerjalan();
  if (aktif.length === 0) {
    return `Kode sesi ${kode} tidak dikenal, dan saat ini belum ada sesi yang dibuka di peramban ini. Guru perlu membuka sesi lebih dulu di Halaman Guru.`;
  }
  return `Kode sesi ${kode} tidak dikenal. Periksa kembali keenam angkanya — sesi yang sedang berjalan: ${aktif
    .map((s) => `${s.kode} (${s.kelas})`)
    .join(', ')}.`;
}

// ── Penyusunan soal ──────────────────────────────────────────────────────────

/** Buang kunci sebelum soal menyentuh UI — meniru batas server/klien PRD §10. */
function tanpaKunci(s: SoalBank): Soal {
  const { id, judul, unit, bobot, deskripsi, contoh, inputTersembunyi, kodeAwal } = s;
  return { id, judul, unit, bobot, deskripsi, contoh, inputTersembunyi, kodeAwal };
}

function susunSoal(def: DefinisiPaket, nis: string, kodeSesi: string): SoalBank[] {
  const grup = grupSoal();
  return def.posisi.map((namaGrup, i) => {
    const kandidat = grup.get(namaGrup) ?? [];
    if (kandidat.length === 0) throw new Error(`Grup soal ${namaGrup} kosong`);
    // Seed dari NIS + sesi + posisi: konsisten saat refresh, berbeda antar murid.
    const rand = mulberry32(hashSeed(nis, kodeSesi, namaGrup, String(i)));
    return pilihAcak(kandidat, rand);
  });
}

export function ambilPaket(kodeSesi: string, nis: string): PaketUjian {
  const sesi = cariSesi(kodeSesi);
  if (!sesi) throw new Error(pesanKodeTakDikenal(kodeSesi));
  if (sesi.status !== 'berjalan') {
    throw new Error(`Sesi ${kodeSesi} sudah ditutup guru. Mintalah kode sesi yang baru.`);
  }
  const def = PAKET_BY_ID.get(sesi.paket);
  if (!def) throw new Error('Paket ujian tidak dikenal');
  return {
    paket: def.paket,
    judul: def.judul,
    subjudul: def.subjudul,
    jenis: def.jenis,
    durasiMenit: sesi.durasiMenit,
    soal: susunSoal(def, nis, kodeSesi).map(tanpaKunci),
  };
}

// ── Penilaian ────────────────────────────────────────────────────────────────

export function nilaiSubmisi(p: SubmitPayload): HasilPenilaian {
  const perSoal: HasilPenilaian['perSoal'] = [];
  let lulusTotal = 0;
  let testTotal = 0;
  let bobotTotal = 0;
  let nilaiBerbobot = 0;

  for (const jawaban of p.jawaban) {
    const soal = BANK_BY_ID.get(jawaban.soalId);
    if (!soal) continue;
    const kunci = soal.outputKunci;
    let lulus = 0;
    kunci.forEach((benar, i) => {
      const keluaran = jawaban.output[i] ?? '';
      if (normalisasiKeluaran(keluaran) === normalisasiKeluaran(benar)) lulus++;
    });
    const total = kunci.length;
    const nilai = total === 0 ? 0 : Math.round((lulus / total) * 100);
    perSoal.push({ soalId: soal.id, judul: soal.judul, lulus, total, nilai });
    lulusTotal += lulus;
    testTotal += total;
    bobotTotal += soal.bobot;
    nilaiBerbobot += nilai * soal.bobot;
  }

  const nilai = bobotTotal === 0 ? 0 : Math.round(nilaiBerbobot / bobotTotal);
  const rand = mulberry32(hashSeed(p.nis, p.sesi, p.paket));
  const konfirmasi = kodeKonfirmasi(rand);

  // Unit dengan soal di bawah 60 dianggap perlu diulang.
  const perluDiulang = [
    ...new Set(
      perSoal
        .filter((s) => s.nilai < 60)
        .map((s) => BANK_BY_ID.get(s.soalId)?.unit)
        .filter((u): u is string => Boolean(u)),
    ),
  ];

  const hasil: HasilPenilaian = {
    ok: true, nilai, testLulus: lulusTotal, testTotal, perSoal, konfirmasi, perluDiulang,
  };

  // Baris duplikat (NIS + paket + sesi sama) menimpa, tidak menambah (PRD §11).
  const kunciBaris = `${K_KIRIM}${p.kelas}:${p.jenis}:${p.sesi}:${p.nis}`;
  const baris: BarisTersimpan = {
    ...p, ts: Date.now(), nilai, testLulus: lulusTotal, testTotal, konfirmasi, perSoal,
  };
  tulis(kunciBaris, baris);
  return hasil;
}

// ── Rekap ────────────────────────────────────────────────────────────────────

export function rekap(kelas: Kelas, jenis: string, kodeSesi: string): BarisRekap[] {
  const awalan = `${K_KIRIM}${kelas}:${jenis}:${kodeSesi}:`;
  return daftarKunci(awalan)
    .map((k) => baca<BarisTersimpan | null>(k, null))
    .filter((b): b is BarisTersimpan => b !== null)
    .sort((a, b) => a.nama.localeCompare(b.nama, 'id'))
    .map((b) => ({
      nama: b.nama,
      nis: b.nis,
      nilai: b.nilai,
      testLulus: `${b.testLulus}/${b.testTotal}`,
      durasiMenit: b.durasiMenit,
      pindahTab: b.pindahTab,
      status: b.status,
      konfirmasi: b.konfirmasi,
    }));
}

// ── Pemeriksa bank soal (F-G05 / mitigasi §15) ───────────────────────────────

export interface PeriksaItem {
  id: string;
  judul: string;
  jumlahContoh: number;
  jumlahTersembunyi: number;
  /** Diisi pemeriksa setelah menjalankan kodeReferensi. */
  masalah: string[];
}

/** Pemeriksaan struktural — tanpa menjalankan Python. */
export function periksaStruktur(): PeriksaItem[] {
  const out: PeriksaItem[] = [];
  for (const s of BANK_BY_ID.values()) {
    const masalah: string[] = [];
    if (s.inputTersembunyi.length !== s.outputKunci.length) {
      masalah.push(
        `jumlah input tersembunyi (${s.inputTersembunyi.length}) tidak sama dengan jumlah kunci (${s.outputKunci.length})`,
      );
    }
    if (s.contoh.length < 1) masalah.push('tidak punya test contoh');
    if (!s.deskripsi.trim()) masalah.push('deskripsi kosong');
    if (!s.kodeReferensi.trim()) masalah.push('kodeReferensi kosong');
    out.push({
      id: s.id, judul: s.judul,
      jumlahContoh: s.contoh.length,
      jumlahTersembunyi: s.inputTersembunyi.length,
      masalah,
    });
  }
  return out.sort((a, b) => a.id.localeCompare(b.id));
}

/** Seluruh test (contoh + tersembunyi) beserta kunci — untuk pemeriksa. */
export function semuaTestUntukPeriksa(): {
  id: string; judul: string; kodeReferensi: string; kasus: { input: string; harap: string }[];
}[] {
  return [...BANK_BY_ID.values()].map((s) => ({
    id: s.id,
    judul: s.judul,
    kodeReferensi: s.kodeReferensi,
    kasus: [
      ...s.contoh.map((k) => ({ input: k.input, harap: k.output })),
      ...s.inputTersembunyi.map((inp, i) => ({ input: inp, harap: s.outputKunci[i] ?? '' })),
    ],
  }));
}
