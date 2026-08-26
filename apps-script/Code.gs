/**
 * PyClass — Google Apps Script Web App (PRD §10, §11, §12).
 *
 * Satu-satunya komponen server. Tugasnya tiga:
 *   1. Menyajikan soal TANPA kunci jawaban ke browser murid.
 *   2. Menilai keluaran yang dikirim balik browser dengan kunci di sheet _Bank.
 *   3. Menulis hasilnya ke sheet nilai kelas yang sesuai.
 *
 * Pemasangan:
 *   1. Buka spreadsheet guru → Extensions → Apps Script, tempel berkas ini.
 *   2. Jalankan `siapkanSpreadsheet()` sekali untuk membuat seluruh sheet.
 *   3. Project Settings → Script Properties → tambahkan `PIN_GURU`.
 *   4. Deploy → New deployment → Web app
 *        Execute as: Me    Who has access: Anyone
 *   5. Salin URL /exec ke VITE_API_URL pada aplikasi front-end.
 */

var PIN_PROPERTY = 'PIN_GURU';
var KELAS = ['XA', 'XB', 'XC', 'XD'];

var KOLOM_NILAI = [
  'Timestamp', 'NIS', 'Nama', 'Paket', 'Kode Sesi', 'Nilai Akhir', 'Test Lulus / Total',
  'Nilai Soal 1', 'Nilai Soal 2', 'Nilai Soal 3', 'Nilai Soal 4', 'Nilai Soal 5',
  'Nilai Soal 6', 'Nilai Soal 7', 'Nilai Soal 8', 'Nilai Soal 9', 'Nilai Soal 10',
  'Durasi (menit)', 'Pindah Tab', 'Status', 'Kode Konfirmasi',
  'Kode Soal 1', 'Kode Soal 2', 'Kode Soal 3', 'Kode Soal 4', 'Kode Soal 5',
  'Kode Soal 6', 'Kode Soal 7', 'Kode Soal 8', 'Kode Soal 9', 'Kode Soal 10'
];

var KOLOM_BANK = [
  'id', 'unit', 'jenis', 'grup', 'tingkat', 'bobot', 'judul', 'deskripsi',
  'contohInput', 'contohOutput', 'inputTersembunyi', 'outputKunci', 'kodeReferensi', 'kodeAwal'
];

var KOLOM_SESI = ['Kode Sesi', 'Kelas', 'Paket', 'Jenis', 'Judul', 'Durasi', 'Dibuka', 'Ditutup', 'Status'];
var KOLOM_LOG = ['Waktu', 'Jenis', 'Keterangan'];

/**
 * Papan pantau ujian yang sedang berjalan. Isinya sementara dan boleh dihapus
 * kapan saja — nilai yang sah tetap ada di sheet kelas.
 * Kolom N (Tambahan Menit) HANYA ditulis guru; denyut murid tidak menyentuhnya.
 */
var KOLOM_PROGRES = [
  'Kode Sesi', 'Kelas', 'NIS', 'Nama', 'Soal Aktif', 'Total Soal', 'Diisi',
  'Lulus Contoh', 'Jalan di Soal Ini', 'Detik di Soal Ini', 'Pindah Tab',
  'Sisa Detik', 'Status', 'Tambahan Menit', 'Diperbarui'
];
var KOL_TAMBAHAN = 14; // kolom N, 1-based

// ─────────────────────────────── Router ───────────────────────────────

function doGet(e) {
  var aksi = (e.parameter.action || '').toString();
  try {
    switch (aksi) {
      case 'soal':     return json(aksiSoal(e.parameter));
      case 'sesi':     return json(aksiSesi(e.parameter));
      case 'sesiKelas':return json(aksiSesiKelas(e.parameter));
      case 'rekap':    return json(aksiRekap(e.parameter));
      case 'pantau':   return json(aksiPantau(e.parameter));
      case 'cekPin':   return json(aksiCekPin(e.parameter));
      default:         return json({ ok: false, pesan: 'Aksi tidak dikenal: ' + aksi });
    }
  } catch (err) {
    catatLog('error', aksi + ' — ' + err);
    return json({ ok: false, pesan: String(err.message || err) });
  }
}

function doPost(e) {
  var aksi = (e.parameter.action || '').toString();
  var badan = {};
  try {
    badan = JSON.parse(e.postData.contents);
  } catch (err) {
    return json({ ok: false, pesan: 'Isi permintaan bukan JSON yang sah' });
  }
  try {
    switch (aksi) {
      case 'nilai':       return json(aksiNilai(badan));
      case 'denyut':      return json(aksiDenyut(badan));
      case 'bukaSesi':    return json(aksiBukaSesi(badan));
      case 'tutupSesi':   return json(aksiTutupSesi(badan));
      case 'tambahWaktu': return json(aksiTambahWaktu(badan));
      default:          return json({ ok: false, pesan: 'Aksi tidak dikenal: ' + aksi });
    }
  } catch (err) {
    catatLog('error', aksi + ' — ' + err);
    return json({ ok: false, pesan: String(err.message || err) });
  }
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// ─────────────────────────────── Aksi murid ───────────────────────────────

/**
 * GET ?action=soal&sesi=482913&nis=12345
 * Mengembalikan deskripsi soal, test contoh, dan HANYA INPUT test tersembunyi.
 * outputKunci dan kodeReferensi tidak pernah ikut (PRD §10).
 */
function aksiSoal(p) {
  var sesi = cariSesi(p.sesi);
  if (!sesi || sesi.status !== 'berjalan') {
    return { ok: false, pesan: 'Sesi tidak ditemukan atau sudah ditutup' };
  }
  var soal = susunSoal(sesi, String(p.nis || ''));
  return {
    ok: true,
    paket: sesi.paket,
    judul: sesi.judul,
    subjudul: '',
    jenis: sesi.jenis,
    durasiMenit: sesi.durasiMenit,
    soal: soal.map(function (s) {
      return {
        id: s.id,
        judul: s.judul,
        unit: s.unit,
        bobot: s.bobot,
        deskripsi: s.deskripsi,
        contoh: s.contoh,
        inputTersembunyi: s.inputTersembunyi,
        kodeAwal: s.kodeAwal
      };
    })
  };
}

function aksiSesi(p) {
  var sesi = cariSesi(p.kode);
  if (!sesi) return { ok: false, pesan: 'Sesi tidak ditemukan atau sudah ditutup' };
  return objekSesi(sesi);
}

/**
 * POST ?action=nilai
 * Menerima keluaran hasil eksekusi kode murid, mencocokkannya dengan kunci di
 * _Bank, lalu menulis satu baris ke sheet nilai kelas.
 */
function aksiNilai(b) {
  var sesi = cariSesi(b.sesi);
  if (!sesi || sesi.status !== 'berjalan') {
    catatLog('tolak', 'Submisi NIS ' + b.nis + ' — sesi ' + b.sesi + ' tidak aktif');
    return { ok: false, pesan: 'Sesi tidak ditemukan atau sudah ditutup' };
  }
  if (KELAS.indexOf(b.kelas) === -1) {
    return { ok: false, pesan: 'Kelas tidak dikenal: ' + b.kelas };
  }

  var bank = petaBank();
  var perSoal = [];
  var lulusTotal = 0;
  var testTotal = 0;
  var bobotTotal = 0;
  var nilaiBerbobot = 0;

  for (var i = 0; i < b.jawaban.length; i++) {
    var jw = b.jawaban[i];
    var soal = bank[jw.soalId];
    if (!soal) {
      catatLog('tolak', 'Soal tak dikenal pada submisi: ' + jw.soalId);
      continue;
    }
    var kunci = soal.outputKunci;
    var lulus = 0;
    for (var k = 0; k < kunci.length; k++) {
      var keluaran = (jw.output && jw.output[k]) || '';
      if (normalisasi(keluaran) === normalisasi(kunci[k])) lulus++;
    }
    var nilaiSoal = kunci.length === 0 ? 0 : Math.round((lulus / kunci.length) * 100);
    perSoal.push({ soalId: soal.id, judul: soal.judul, lulus: lulus, total: kunci.length, nilai: nilaiSoal });
    lulusTotal += lulus;
    testTotal += kunci.length;
    bobotTotal += soal.bobot;
    nilaiBerbobot += nilaiSoal * soal.bobot;
  }

  var nilai = bobotTotal === 0 ? 0 : Math.round(nilaiBerbobot / bobotTotal);
  var konfirmasi = kodeKonfirmasi(b.nis + '|' + b.sesi + '|' + b.paket);

  tulisBarisNilai(b, nilai, lulusTotal, testTotal, perSoal, konfirmasi);

  var perluDiulang = [];
  for (var j = 0; j < perSoal.length; j++) {
    if (perSoal[j].nilai < 60) {
      var unit = bank[perSoal[j].soalId].unit;
      if (perluDiulang.indexOf(unit) === -1) perluDiulang.push(unit);
    }
  }

  return {
    ok: true,
    nilai: nilai,
    testLulus: lulusTotal,
    testTotal: testTotal,
    perSoal: perSoal,
    konfirmasi: konfirmasi,
    perluDiulang: perluDiulang
  };
}

/**
 * POST ?action=denyut
 * Kabar berkala dari murid yang sedang mengerjakan, supaya guru bisa memantau
 * kelas tanpa menunggu submisi. Balasannya membawa `tambahanMenit` — satu
 * perjalanan bolak-balik dipakai untuk dua keperluan sekaligus.
 *
 * Sengaja memakai tryLock, bukan waitLock: kalau 36 murid berdenyut hampir
 * bersamaan, lebih baik satu kabar dilewati daripada permintaan menumpuk.
 * Data ini hanya informatif — denyut berikutnya akan menyusul 45 detik lagi.
 */
function aksiDenyut(b) {
  var sesi = cariSesi(b.sesi);
  if (!sesi) return { ok: false, pesan: 'Sesi tidak ditemukan' };

  var kunci = LockService.getScriptLock();
  if (!kunci.tryLock(5000)) {
    return { ok: true, dilewati: true, tambahanMenit: 0 };
  }
  try {
    var sheet = sheetProgres();
    var data = sheet.getDataRange().getValues();
    var baris = [
      String(b.sesi), b.kelas, String(b.nis), b.nama,
      Number(b.soalAktif) || 0, Number(b.totalSoal) || 0, Number(b.diisi) || 0,
      Number(b.lulusContoh) || 0, Number(b.jalanSoalAktif) || 0,
      Number(b.detikSoalAktif) || 0, Number(b.pindahTab) || 0,
      Number(b.sisaDetik) || 0, b.status || 'mengerjakan'
    ];

    for (var r = 1; r < data.length; r++) {
      if (String(data[r][0]) === String(b.sesi) && String(data[r][2]) === String(b.nis)) {
        // Kolom A–M diperbarui; N (Tambahan Menit) milik guru, jangan disentuh.
        sheet.getRange(r + 1, 1, 1, baris.length).setValues([baris]);
        sheet.getRange(r + 1, KOL_TAMBAHAN + 1).setValue(new Date());
        return { ok: true, tambahanMenit: Number(data[r][KOL_TAMBAHAN - 1]) || 0 };
      }
    }
    sheet.appendRow(baris.concat([0, new Date()]));
    return { ok: true, tambahanMenit: 0 };
  } finally {
    kunci.releaseLock();
  }
}

// ─────────────────────────────── Aksi guru ───────────────────────────────

function pastikanPin(pin) {
  var benar = PropertiesService.getScriptProperties().getProperty(PIN_PROPERTY);
  if (!benar) throw new Error('PIN_GURU belum diatur di Script Properties');
  if (String(pin) !== String(benar)) throw new Error('PIN tidak cocok');
}

function aksiCekPin(p) {
  pastikanPin(p.pin);
  return { ok: true };
}

function aksiBukaSesi(b) {
  pastikanPin(b.pin);
  if (KELAS.indexOf(b.kelas) === -1) return { ok: false, pesan: 'Kelas tidak dikenal' };

  var sheet = sheetSesi();
  var data = sheet.getDataRange().getValues();
  // Tutup sesi lain yang masih berjalan di kelas yang sama.
  for (var r = 1; r < data.length; r++) {
    if (data[r][1] === b.kelas && data[r][8] === 'berjalan') {
      sheet.getRange(r + 1, 8).setValue(new Date());
      sheet.getRange(r + 1, 9).setValue('ditutup');
    }
  }

  var jenis = b.paket.indexOf('kuis') === 0 ? 'kuis' : 'ujian';
  var kode = String(Math.floor(100000 + Math.random() * 900000));
  sheet.appendRow([
    kode, b.kelas, b.paket, jenis, judulPaket(b.paket),
    b.durasiMenit, new Date(), '', 'berjalan'
  ]);

  return {
    ok: true, kode: kode, kelas: b.kelas, paket: b.paket, jenis: jenis,
    judul: judulPaket(b.paket), durasiMenit: b.durasiMenit,
    dibukaPada: Date.now(), ditutupPada: null, status: 'berjalan'
  };
}

function aksiTutupSesi(b) {
  pastikanPin(b.pin);
  var sheet = sheetSesi();
  var data = sheet.getDataRange().getValues();
  for (var r = 1; r < data.length; r++) {
    if (String(data[r][0]) === String(b.kode)) {
      sheet.getRange(r + 1, 8).setValue(new Date());
      sheet.getRange(r + 1, 9).setValue('ditutup');
      return { ok: true };
    }
  }
  return { ok: false, pesan: 'Sesi tidak ditemukan' };
}

function aksiSesiKelas(p) {
  pastikanPin(p.pin);
  var data = sheetSesi().getDataRange().getValues();
  for (var r = data.length - 1; r >= 1; r--) {
    if (data[r][1] === p.kelas && data[r][8] === 'berjalan') {
      return objekSesi(barisKeSesi(data[r]));
    }
  }
  return { ok: false, pesan: 'Belum ada sesi berjalan untuk kelas ini' };
}

/**
 * GET ?action=pantau&sesi=...&pin=...
 * Papan pantau kelas saat ujian berlangsung.
 */
function aksiPantau(p) {
  pastikanPin(p.pin);
  var data = sheetProgres().getDataRange().getValues();
  var baris = [];
  for (var r = 1; r < data.length; r++) {
    if (String(data[r][0]) !== String(p.sesi)) continue;
    baris.push({
      nis: String(data[r][2]),
      nama: data[r][3],
      soalAktif: Number(data[r][4]) || 0,
      totalSoal: Number(data[r][5]) || 0,
      diisi: Number(data[r][6]) || 0,
      lulusContoh: Number(data[r][7]) || 0,
      jalanSoalAktif: Number(data[r][8]) || 0,
      detikSoalAktif: Number(data[r][9]) || 0,
      pindahTab: Number(data[r][10]) || 0,
      sisaDetik: Number(data[r][11]) || 0,
      status: data[r][12],
      tambahanMenit: Number(data[r][13]) || 0,
      diperbaruiPada: data[r][14] ? new Date(data[r][14]).getTime() : null
    });
  }
  baris.sort(function (a, b) { return a.nama < b.nama ? -1 : 1; });
  return { ok: true, baris: baris };
}

/**
 * POST ?action=tambahWaktu
 * Menambah menit untuk satu murid, atau seluruh kelas bila nis = "SEMUA".
 * Murid menerimanya pada denyut berikutnya (paling lama 45 detik).
 */
function aksiTambahWaktu(b) {
  pastikanPin(b.pin);
  var menit = Number(b.menit) || 0;
  if (menit === 0) return { ok: false, pesan: 'Jumlah menit tidak boleh nol' };

  var sheet = sheetProgres();
  var data = sheet.getDataRange().getValues();
  var kena = 0;
  for (var r = 1; r < data.length; r++) {
    if (String(data[r][0]) !== String(b.sesi)) continue;
    if (String(b.nis) !== 'SEMUA' && String(data[r][2]) !== String(b.nis)) continue;
    var sekarang = Number(data[r][KOL_TAMBAHAN - 1]) || 0;
    sheet.getRange(r + 1, KOL_TAMBAHAN).setValue(sekarang + menit);
    kena++;
  }
  if (kena === 0) {
    return { ok: false, pesan: 'Murid itu belum terpantau di sesi ini — ia baru muncul setelah denyut pertama.' };
  }
  catatLog('waktu', 'Sesi ' + b.sesi + ' — ' + b.nis + ' ditambah ' + menit + ' menit (' + kena + ' baris)');
  return { ok: true, kena: kena };
}

function aksiRekap(p) {
  pastikanPin(p.pin);
  var sheet = sheetNilai(p.kelas, p.jenis);
  var data = sheet.getDataRange().getValues();
  var baris = [];
  for (var r = 1; r < data.length; r++) {
    if (String(data[r][4]) !== String(p.sesi)) continue;
    baris.push({
      nama: data[r][2],
      nis: String(data[r][1]),
      nilai: data[r][5],
      testLulus: data[r][6],
      durasiMenit: data[r][17],
      pindahTab: data[r][18],
      status: data[r][19],
      konfirmasi: data[r][20]
    });
  }
  baris.sort(function (a, b) { return a.nama < b.nama ? -1 : 1; });
  return { ok: true, baris: baris };
}

// ─────────────────────────────── Bank soal ───────────────────────────────

function petaBank() {
  var data = sheetBank().getDataRange().getValues();
  var kepala = data[0];
  var idx = {};
  for (var c = 0; c < kepala.length; c++) idx[kepala[c]] = c;

  var peta = {};
  for (var r = 1; r < data.length; r++) {
    var baris = data[r];
    var id = String(baris[idx.id] || '').trim();
    if (!id) continue;

    var contohInput = pisah(baris[idx.contohInput]);
    var contohOutput = pisah(baris[idx.contohOutput]);
    var inputTersembunyi = pisah(baris[idx.inputTersembunyi]);
    var outputKunci = pisah(baris[idx.outputKunci]);

    // Baris cacat ditolak dan dicatat (mitigasi PRD §15) agar satu baris rusak
    // tidak menggagalkan seluruh ujian.
    if (inputTersembunyi.length !== outputKunci.length) {
      catatLog('bank', 'Baris ' + id + ' dilewati: jumlah inputTersembunyi dan outputKunci tidak sama');
      continue;
    }
    if (contohInput.length !== contohOutput.length) {
      catatLog('bank', 'Baris ' + id + ' dilewati: jumlah contohInput dan contohOutput tidak sama');
      continue;
    }

    var contoh = [];
    for (var i = 0; i < contohInput.length; i++) {
      contoh.push({ input: contohInput[i], output: contohOutput[i] });
    }

    peta[id] = {
      id: id,
      unit: String(baris[idx.unit] || ''),
      jenis: String(baris[idx.jenis] || 'keduanya'),
      grup: String(baris[idx.grup] || id),
      bobot: Number(baris[idx.bobot]) || 10,
      judul: String(baris[idx.judul] || ''),
      deskripsi: String(baris[idx.deskripsi] || ''),
      contoh: contoh,
      inputTersembunyi: inputTersembunyi,
      outputKunci: outputKunci,
      kodeAwal: String(baris[idx.kodeAwal] || '')
    };
  }
  return peta;
}

/** Beberapa test dalam satu sel dipisah tanda | (PRD §17). */
function pisah(sel) {
  var teks = sel === null || sel === undefined ? '' : String(sel);
  if (teks === '') return [];
  return teks.split('|');
}

/**
 * Susunan soal untuk seorang murid: satu soal per grup pada paket, dipilih
 * dengan seed dari NIS agar hasilnya konsisten bila murid me-refresh (F-U04).
 */
function susunSoal(sesi, nis) {
  var bank = petaBank();
  var posisi = posisiPaket(sesi.paket);
  var hasil = [];
  for (var i = 0; i < posisi.length; i++) {
    var grup = posisi[i];
    var kandidat = [];
    for (var id in bank) {
      if (bank[id].grup === grup) kandidat.push(bank[id]);
    }
    if (kandidat.length === 0) {
      catatLog('bank', 'Grup ' + grup + ' kosong untuk paket ' + sesi.paket);
      continue;
    }
    kandidat.sort(function (a, b) { return a.id < b.id ? -1 : 1; });
    var pilih = seedAngka(nis + '|' + sesi.kode + '|' + grup) % kandidat.length;
    hasil.push(kandidat[pilih]);
  }
  return hasil;
}

/**
 * Daftar grup per posisi soal. Disimpan di sini (bukan di sheet) karena jarang
 * berubah; menambah VARIAN soal cukup lewat kolom `grup` di _Bank.
 */
function posisiPaket(paket) {
  var peta = {
    'uts-ganjil': ['u1-p1', 'u1-p4', 'u2-p1', 'u2-p2', 'u1-p2', 'u2-p5', 'u3-p1', 'u3-p5', 'u3-p2', 'u3-p3'],
    'uas-genap':  ['u1-p3', 'u2-p3', 'u3-p2', 'u4-p2', 'u4-p5', 'u5-p1', 'u6-p1', 'u6-p3', 'u7-p2', 'u7-p4']
  };
  if (peta[paket]) return peta[paket];
  var cocok = /^kuis-(u\d)$/.exec(paket);
  if (cocok) {
    var u = cocok[1];
    return [u + '-p1', u + '-p2', u + '-p3', u + '-p4', u + '-p5'];
  }
  throw new Error('Paket tidak dikenal: ' + paket);
}

function judulPaket(paket) {
  if (paket === 'uts-ganjil') return 'Ujian Tengah Semester';
  if (paket === 'uas-genap') return 'Ujian Akhir Semester';
  var cocok = /^kuis-u(\d)$/.exec(paket);
  return cocok ? 'Kuis Unit ' + cocok[1] : paket;
}

// ─────────────────────────────── Sheets ───────────────────────────────

function ss() { return SpreadsheetApp.getActiveSpreadsheet(); }

function ambilAtauBuat(nama, kepala) {
  var s = ss().getSheetByName(nama);
  if (!s) {
    s = ss().insertSheet(nama);
    s.appendRow(kepala);
    s.getRange(1, 1, 1, kepala.length).setFontWeight('bold');
    s.setFrozenRows(1);
    s.getRange(1, 1, 1, kepala.length).createFilter();
  }
  return s;
}

function sheetNilai(kelas, jenis) {
  var nama = kelas + ' — ' + (jenis === 'kuis' ? 'Kuis' : 'Ujian');
  var s = ambilAtauBuat(nama, KOLOM_NILAI);
  // NIS dan kode berformat teks agar angka 0 di depan tidak hilang.
  s.getRange('B:B').setNumberFormat('@');
  s.getRange('E:E').setNumberFormat('@');
  s.getRange('U:U').setNumberFormat('@');
  return s;
}

function sheetBank() {
  var s = ss().getSheetByName('_Bank');
  if (!s) throw new Error('Sheet _Bank belum ada. Jalankan siapkanSpreadsheet() lebih dulu.');
  return s;
}

function sheetSesi()    { return ambilAtauBuat('_Sesi', KOLOM_SESI); }
function sheetProgres() { return ambilAtauBuat('_Progres', KOLOM_PROGRES); }
function sheetLog()  { return ambilAtauBuat('_Log', KOLOM_LOG); }

function catatLog(jenis, keterangan) {
  try {
    sheetLog().appendRow([new Date(), jenis, keterangan]);
  } catch (e) {
    // Log tidak boleh menggagalkan permintaan utama.
  }
}

/**
 * Menulis satu baris nilai. LockService dipakai agar 40 murid yang mengirim
 * dalam 1 menit tidak saling menimpa baris (PRD §13 — beban serentak).
 */
function tulisBarisNilai(b, nilai, lulusTotal, testTotal, perSoal, konfirmasi) {
  var kunci = LockService.getScriptLock();
  kunci.waitLock(30000);
  try {
    var sheet = sheetNilai(b.kelas, b.jenis);
    var baris = [
      new Date(), String(b.nis), b.nama, b.paket, String(b.sesi),
      nilai, lulusTotal + '/' + testTotal
    ];
    for (var i = 0; i < 10; i++) baris.push(perSoal[i] ? perSoal[i].nilai : '');
    baris.push(b.durasiMenit, b.pindahTab, b.status, konfirmasi);
    for (var k = 0; k < 10; k++) baris.push(b.jawaban[k] ? b.jawaban[k].kode : '');

    // Submisi ulang (NIS + paket + sesi sama) MENIMPA baris lama (PRD §11).
    var data = sheet.getDataRange().getValues();
    for (var r = 1; r < data.length; r++) {
      if (String(data[r][1]) === String(b.nis) &&
          String(data[r][3]) === String(b.paket) &&
          String(data[r][4]) === String(b.sesi)) {
        sheet.getRange(r + 1, 1, 1, baris.length).setValues([baris]);
        return;
      }
    }
    sheet.appendRow(baris);
  } finally {
    kunci.releaseLock();
  }
}

function cariSesi(kode) {
  if (!kode) return null;
  var data = sheetSesi().getDataRange().getValues();
  for (var r = 1; r < data.length; r++) {
    if (String(data[r][0]) === String(kode)) return barisKeSesi(data[r]);
  }
  return null;
}

function barisKeSesi(baris) {
  return {
    kode: String(baris[0]), kelas: baris[1], paket: baris[2], jenis: baris[3],
    judul: baris[4], durasiMenit: Number(baris[5]),
    dibuka: baris[6], ditutup: baris[7], status: baris[8]
  };
}

function objekSesi(s) {
  return {
    ok: true, kode: s.kode, kelas: s.kelas, paket: s.paket, jenis: s.jenis,
    judul: s.judul, durasiMenit: s.durasiMenit,
    dibukaPada: s.dibuka ? new Date(s.dibuka).getTime() : null,
    ditutupPada: s.ditutup ? new Date(s.ditutup).getTime() : null,
    status: s.status
  };
}

// ─────────────────────────────── Utilitas ───────────────────────────────

/** Spasi di akhir baris & baris kosong di akhir diabaikan (F-U05). */
function normalisasi(teks) {
  return String(teks === null || teks === undefined ? '' : teks)
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map(function (b) { return b.replace(/[ \t]+$/, ''); })
    .join('\n')
    .replace(/\n+$/, '');
}

function seedAngka(teks) {
  var h = 2166136261;
  for (var i = 0; i < teks.length; i++) {
    h ^= teks.charCodeAt(i);
    h = (h * 16777619) >>> 0;
  }
  return h >>> 0;
}

function kodeKonfirmasi(benih) {
  var abjad = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  var h = seedAngka(benih);
  var s = '';
  for (var i = 0; i < 6; i++) {
    h = (h * 1664525 + 1013904223) >>> 0;
    s += abjad.charAt(h % abjad.length);
  }
  return s;
}

// ─────────────────────────── Pemasangan sekali jalan ───────────────────────────

/** Jalankan sekali dari editor Apps Script untuk membuat seluruh sheet. */
function siapkanSpreadsheet() {
  for (var i = 0; i < KELAS.length; i++) {
    sheetNilai(KELAS[i], 'ujian');
    sheetNilai(KELAS[i], 'kuis');
  }
  ambilAtauBuat('_Bank', KOLOM_BANK);
  sheetSesi();
  sheetProgres();
  sheetLog();
  ambilAtauBuat('_Rekap', ['NIS', 'Nama', 'Kelas', 'Rata Kuis', 'UTS', 'UAS', 'Nilai Akhir']);
  SpreadsheetApp.getUi().alert('Seluruh sheet PyClass siap. Isi _Bank lalu deploy sebagai Web App.');
}

/**
 * Padanan tombol "Periksa Bank Soal" di sisi server: memeriksa struktur tiap
 * baris _Bank dan melaporkan yang cacat. (Menjalankan kodeReferensi tidak bisa
 * dilakukan di Apps Script — itu dikerjakan halaman guru memakai Pyodide.)
 */
function periksaBankSoal() {
  var data = sheetBank().getDataRange().getValues();
  var kepala = data[0];
  var idx = {};
  for (var c = 0; c < kepala.length; c++) idx[kepala[c]] = c;

  var masalah = [];
  var terlihat = {};
  for (var r = 1; r < data.length; r++) {
    var id = String(data[r][idx.id] || '').trim();
    if (!id) continue;
    if (terlihat[id]) masalah.push('Baris ' + (r + 1) + ': id ganda "' + id + '"');
    terlihat[id] = true;
    if (pisah(data[r][idx.inputTersembunyi]).length !== pisah(data[r][idx.outputKunci]).length) {
      masalah.push('Baris ' + (r + 1) + ' (' + id + '): jumlah inputTersembunyi ≠ outputKunci');
    }
    if (pisah(data[r][idx.contohInput]).length !== pisah(data[r][idx.contohOutput]).length) {
      masalah.push('Baris ' + (r + 1) + ' (' + id + '): jumlah contohInput ≠ contohOutput');
    }
    if (!String(data[r][idx.deskripsi] || '').trim()) {
      masalah.push('Baris ' + (r + 1) + ' (' + id + '): deskripsi kosong');
    }
  }

  SpreadsheetApp.getUi().alert(
    masalah.length === 0
      ? 'Bank soal bersih: ' + (Object.keys(terlihat).length) + ' soal siap dipakai.'
      : masalah.length + ' masalah ditemukan:\n\n' + masalah.join('\n')
  );
}
