import { Fragment } from 'react';
import { BlokKode } from './BlokKode';
import type { HalamanMateri } from '../content/loader';

/**
 * Menyisipkan komponen BlokKode (editor + tombol Jalankan) pada posisi
 * penanda <div data-contoh="N"> yang ditinggalkan loader Markdown.
 */
export function RenderMateri({
  halaman,
  onKirimKeEditor,
}: {
  halaman: HalamanMateri;
  onKirimKeEditor?: (kode: string) => void;
}) {
  const potongan = halaman.html.split(/<div data-contoh="(\d+)"><\/div>/);

  return (
    <div className="prose">
      {potongan.map((bagian, i) => {
        // Indeks ganjil = hasil tangkapan grup regex, yaitu nomor contoh.
        if (i % 2 === 1) {
          const contoh = halaman.contohKode[Number(bagian)];
          if (!contoh) return null;
          return (
            <BlokKode
              key={`kode-${bagian}`}
              judul={contoh.judul}
              kode={contoh.kode}
              onKirimKeEditor={onKirimKeEditor}
            />
          );
        }
        return <Fragment key={`teks-${i}`}><span dangerouslySetInnerHTML={{ __html: bagian }} /></Fragment>;
      })}
    </div>
  );
}
