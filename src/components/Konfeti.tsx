import { useMemo } from 'react';

/** Hujan kertas warna-warni untuk jawaban benar. Induknya harus position: relative. */
export function Konfeti() {
  const potongan = useMemo(
    () => Array.from({ length: 36 }, (_, i) => ({
      kiri: Math.random() * 100,
      tunda: Math.random() * 0.4,
      lama: 1.4 + Math.random() * 1.2,
      warna: ['#c67139', '#aebf92', '#f6a06b', '#56633f', '#ffc6a5', '#201e1d'][i % 6],
      putar: Math.random() * 360,
    })),
    [],
  );
  return (
    <div aria-hidden="true" style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', borderRadius: 'var(--r-xl)' }}>
      {potongan.map((p, i) => (
        <span
          key={i}
          className="tantangan-konfeti"
          style={{
            left: `${p.kiri}%`, background: p.warna, animationDelay: `${p.tunda}s`,
            animationDuration: `${p.lama}s`, transform: `rotate(${p.putar}deg)`,
          }}
        />
      ))}
    </div>
  );
}

/** Animasi konfeti, munculnya hasil, dan denyut timer. Dipasang lewat <style>. */
export const GAYA_ANIMASI = `
.tantangan-konfeti { position: absolute; top: -14px; width: 9px; height: 14px; border-radius: 2px;
  animation-name: tantangan-jatuh; animation-timing-function: cubic-bezier(.3,.6,.5,1); animation-fill-mode: forwards; }
@keyframes tantangan-jatuh { to { transform: translateY(620px) rotate(540deg); opacity: 0; } }
.tantangan-muncul { animation: tantangan-muncul .35s cubic-bezier(.2,1.4,.4,1); }
@keyframes tantangan-muncul { from { transform: scale(.85); opacity: 0; } to { transform: scale(1); opacity: 1; } }
.tantangan-denyut { animation: tantangan-denyut 1s ease-in-out infinite; }
@keyframes tantangan-denyut { 50% { transform: scale(1.12); } }
@media (prefers-reduced-motion: reduce) {
  .tantangan-konfeti, .tantangan-muncul, .tantangan-denyut { animation: none !important; }
  .tantangan-konfeti { display: none; }
}
`;
