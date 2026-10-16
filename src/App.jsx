import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ProgressProvider } from "./context/ProgressContext.jsx";
import AppLayout from "./components/AppLayout.jsx";
import ScrollToHash from "./components/ScrollToHash.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import KBPage from "./pages/KBPage.jsx";
import Developer from "./pages/Developer.jsx";

/**
 * App — root router.
 * Best practice:
 *  - BrowserRouter agar hash anchor (#grafik/#kuis/#komposisi) tetap berfungsi.
 *  - Satu layout + nested routes; KB memakai halaman generik ber-parameter.
 */
export default function App() {
  return (
    <ProgressProvider>
      <BrowserRouter>
        <ScrollToHash />
        <Routes>
          <Route element={<AppLayout topSubtitle="Dashboard" />}>
            <Route index element={<Dashboard />} />
            <Route path="dev" element={<Developer />} />
          </Route>

          {/* Halaman KB memakai layout dengan tombol kembali + subtitle sendiri */}
          <Route element={<AppLayout topSubtitle="Materi" showBack />}>
            <Route path="kb1" element={<KBPage kbId="kb1" />} />
            <Route path="kb2" element={<KBPage kbId="kb2" />} />
            <Route path="kb3" element={<KBPage kbId="kb3" />} />
            <Route path="kb4" element={<KBPage kbId="kb4" />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ProgressProvider>
  );
}
