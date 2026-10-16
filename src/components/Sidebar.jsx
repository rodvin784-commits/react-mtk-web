import { memo } from "react";
import { NavLink } from "react-router-dom";

const KB_LINKS = [
  { to: "/kb1", kb: "kb1", label: "Fungsi Linear" },
  { to: "/kb2", kb: "kb2", label: "Fungsi Kuadrat" },
  { to: "/kb3", kb: "kb3", label: "Komposisi & Invers" },
  { to: "/kb4", kb: "kb4", label: "Program Linear" },
];

/**
 * Sidebar — navigasi. Status dot dihitung dari props `statusByKb`
 * agar komponen tetap murni (tidak membaca store langsung).
 * @param {{ statusByKb: Record<string,"done"|"prog"|"todo"> }} props
 */
function Sidebar({ statusByKb = {}, onClose }) {
  return (
    <aside className="sidebar">
      {onClose && (
        <button
          type="button"
          className="side-close"
          aria-label="Tutup menu"
          onClick={onClose}
        >
          ✕
        </button>
      )}
      <div className="logo">
        <div className="logo-mark">∑</div>
        <div>
          <b>MathLab SMA</b>
          <small>PLATFORM BELAJAR MATEMATIKA</small>
        </div>
      </div>

      <div className="side-label">MENU</div>
      <NavLink
        to="/"
        end
        className={({ isActive }) =>
          `side-link${isActive ? " active" : ""}`
        }
      >
        <span className="side-link-label">Beranda</span>
      </NavLink>

      <div className="side-label">Materi KB 1–4</div>
      {KB_LINKS.map((l) => (
        <NavLink
          key={l.kb}
          to={l.to}
          className={({ isActive }) =>
            `side-link${isActive ? " active" : ""}`
          }
        >
          <span className="side-link-label">{l.label}</span>
          <span
            className={`side-dot${statusByKb[l.kb] ? ` ${statusByKb[l.kb]}` : ""}`}
            aria-hidden="true"
          />
        </NavLink>
      ))}
      <p className="side-legend">Kosong: belum · Kuning: sedang · Hijau: selesai</p>

      <div className="side-label">Alat bantu</div>
      <NavLink className="side-link" to="/kb3#komposisi">
        <span className="side-link-label">Kalkulator Komposisi</span>
      </NavLink>
      <NavLink className="side-link" to="/kb1#grafik">
        <span className="side-link-label">Grafik Fungsi</span>
      </NavLink>
      <NavLink className="side-link" to="/kb3#kuis">
        <span className="side-link-label">Kuis Bertingkat</span> <span className="pill">Baru</span>
      </NavLink>

      <div className="side-label">Lainnya</div>
      <NavLink
        to="/dev"
        className={({ isActive }) => `side-link${isActive ? " active" : ""}`}
      >
        <span className="side-link-label">Profil pengembang</span>
      </NavLink>
    </aside>
  );
}

export default memo(Sidebar);
