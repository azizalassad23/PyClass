import { HashRouter, Route, Routes } from 'react-router-dom';
import { PythonProvider } from './python/PythonProvider';
import { Beranda } from './screens/Beranda';
import { Materi } from './screens/Materi';
import { UjianMasuk } from './screens/UjianMasuk';
import { Ujian } from './screens/Ujian';
import { Hasil } from './screens/Hasil';
import { Guru } from './screens/Guru';

/**
 * HashRouter dipilih dengan sengaja: GitHub Pages menyajikan berkas statis dan
 * tidak bisa mengarahkan /ujian/kerjakan ke index.html, sehingga refresh di
 * tengah ujian akan menghasilkan 404 bila memakai BrowserRouter.
 */
export default function App() {
  return (
    <PythonProvider>
      <HashRouter>
        <a className="skip-link" href="#isi">Lompat ke isi</a>
        <Routes>
          <Route path="/" element={<Beranda />} />
          <Route path="/materi" element={<Materi />} />
          <Route path="/materi/:slug" element={<Materi />} />
          <Route path="/ujian" element={<UjianMasuk />} />
          <Route path="/ujian/kerjakan" element={<Ujian />} />
          <Route path="/ujian/hasil" element={<Hasil />} />
          <Route path="/guru" element={<Guru />} />
          <Route path="*" element={<Beranda />} />
        </Routes>
      </HashRouter>
    </PythonProvider>
  );
}
