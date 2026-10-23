/**
 * Efek suara Tantangan Kilat, dibuat dengan WebAudio — tidak ada berkas suara
 * yang perlu diunduh, jadi tetap jalan di jaringan sekolah yang lambat.
 *
 * Peramban hanya mengizinkan audio setelah ada klik. `siapkanSuara()` dipanggil
 * saat kartu dibuka (sebuah klik), sehingga suara benar/salah/waktu habis yang
 * datang beberapa detik kemudian tetap boleh berbunyi.
 */
let konteks: AudioContext | null = null;

export function siapkanSuara(): void {
  try {
    if (!konteks) {
      const Konteks = window.AudioContext
        ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Konteks) return;
      konteks = new Konteks();
    }
    void konteks.resume();
  } catch {
    /* tanpa suara pun permainan tetap jalan */
  }
}

function nada(ctx: AudioContext, frekuensi: number, mulai: number, lama: number, jenis: OscillatorType, keras: number) {
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = jenis;
  osc.frequency.value = frekuensi;
  g.gain.setValueAtTime(0.0001, mulai);
  g.gain.exponentialRampToValueAtTime(keras, mulai + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, mulai + lama);
  osc.connect(g).connect(ctx.destination);
  osc.start(mulai);
  osc.stop(mulai + lama + 0.05);
}

/**
 * Sorakan: fanfare naik (do-mi-sol-do) disusul tepuk tangan. Tepuk tangan
 * dibuat dari ratusan "tepukan" derau pendek yang waktunya acak, lalu disaring
 * ke rentang frekuensi tepukan tangan.
 */
export function bunyiBenar(): void {
  const ctx = konteks;
  if (!ctx) return;
  const t = ctx.currentTime;
  [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => nada(ctx, f, t + i * 0.11, 0.35, 'triangle', 0.28));
  nada(ctx, 1318.5, t + 0.44, 0.6, 'triangle', 0.22);

  const lama = 2.4;
  const laju = ctx.sampleRate;
  const buffer = ctx.createBuffer(1, Math.floor(laju * lama), laju);
  const data = buffer.getChannelData(0);
  for (let k = 0; k < 420; k++) {
    // Tepukan paling rapat di awal, lalu mereda.
    const awal = Math.floor(Math.pow(Math.random(), 1.6) * (lama - 0.1) * laju);
    const kuat = 0.5 + Math.random() * 0.5;
    const peluruhan = laju * (0.008 + Math.random() * 0.01);
    for (let i = 0; i < peluruhan * 5 && awal + i < data.length; i++) {
      data[awal + i] += (Math.random() * 2 - 1) * kuat * Math.exp(-i / peluruhan);
    }
  }
  const sumber = ctx.createBufferSource();
  sumber.buffer = buffer;
  const saring = ctx.createBiquadFilter();
  saring.type = 'bandpass';
  saring.frequency.value = 1800;
  saring.Q.value = 0.6;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t + 0.3);
  g.gain.exponentialRampToValueAtTime(0.5, t + 0.45);
  g.gain.setValueAtTime(0.5, t + 1.4);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.3 + lama);
  sumber.connect(saring).connect(g).connect(ctx.destination);
  sumber.start(t + 0.3);
}

/** Buzzer jawaban salah ala acara kuis: dua dengung turun, "teng-tong". */
export function bunyiSalah(): void {
  const ctx = konteks;
  if (!ctx) return;
  const t = ctx.currentTime;
  const dengung = (f: number, mulai: number, lama: number) => {
    const saring = ctx.createBiquadFilter();
    saring.type = 'lowpass';
    saring.frequency.value = 1200;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, mulai);
    g.gain.exponentialRampToValueAtTime(0.32, mulai + 0.02);
    g.gain.setValueAtTime(0.32, mulai + lama - 0.06);
    g.gain.exponentialRampToValueAtTime(0.0001, mulai + lama);
    saring.connect(g).connect(ctx.destination);
    // Dua gelombang gergaji yang sedikit sumbang: bunyi buzzer yang kasar.
    [f, f * 1.03].forEach((frek) => {
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.value = frek;
      osc.connect(saring);
      osc.start(mulai);
      osc.stop(mulai + lama + 0.05);
    });
  };
  dengung(185, t, 0.32);
  dengung(139, t + 0.38, 0.62);
}

/** Detak di detik-detik terakhir. */
export function bunyiDetak(akhir = false): void {
  const ctx = konteks;
  if (!ctx) return;
  nada(ctx, akhir ? 1320 : 990, ctx.currentTime, 0.07, 'square', 0.12);
}
