/**
 * Sirene peringatan di perangkat murid, dibuat dengan WebAudio sehingga tidak
 * butuh berkas suara.
 *
 * Peramban hanya mengizinkan audio setelah ada interaksi pengguna. Karena itu
 * `siapkanAudio()` dipanggil di dalam klik tombol Mulai dan tombol "Kembali ke
 * layar penuh"; setelahnya sirene bisa dibunyikan kapan saja, termasuk saat
 * tab ujian sedang tidak terlihat.
 *
 * Batasnya: halaman web tidak bisa menaikkan volume perangkat. Bila HP dalam
 * mode senyap atau volumenya nol, sirene tidak terdengar — pengawasan di kelas
 * tetap perlu, dan setiap kejadian tetap tercatat di sheet.
 */
let konteks: AudioContext | null = null;
let berbunyi: { nada: OscillatorNode; ayun: OscillatorNode } | null = null;

export function siapkanAudio(): void {
  try {
    if (!konteks) {
      const Konteks = window.AudioContext
        ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Konteks) return;
      konteks = new Konteks();
    }
    void konteks.resume();
  } catch {
    /* peramban menolak audio — peringatan visual tetap tampil */
  }
}

/** Sirene naik-turun yang terus berbunyi sampai `matikanSirene()` dipanggil. */
export function nyalakanSirene(): void {
  if (!konteks || berbunyi) return;
  try {
    void konteks.resume();
    const nada = konteks.createOscillator();
    nada.type = 'square';
    nada.frequency.value = 900;
    // Frekuensi diayun ±350 Hz dua kali per detik: bunyi sirene, sulit diabaikan.
    const ayun = konteks.createOscillator();
    ayun.frequency.value = 2;
    const lebarAyun = konteks.createGain();
    lebarAyun.gain.value = 350;
    ayun.connect(lebarAyun).connect(nada.frequency);
    const keras = konteks.createGain();
    keras.gain.value = 0.35;
    nada.connect(keras).connect(konteks.destination);
    nada.start();
    ayun.start();
    berbunyi = { nada, ayun };
  } catch {
    berbunyi = null;
  }
}

export function matikanSirene(): void {
  if (!berbunyi) return;
  try {
    berbunyi.nada.stop();
    berbunyi.ayun.stop();
  } catch {
    /* sudah berhenti */
  }
  berbunyi = null;
}
