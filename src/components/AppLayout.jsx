import { memo, useEffect, useMemo, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar.jsx";
import Topbar from "./Topbar.jsx";
import ToastHost from "./ToastHost.jsx";
import { useProgress } from "../context/ProgressContext.jsx";
import { useTheme } from "../hooks/useTheme.js";

/**
 * AppLayout — kerangka sidebar + topbar + <Outlet/>.
 * Juga menangani UI state lokal: sidebar mobile + tombol kembali ke atas.
 * @param {{ topSubtitle?: string, showBack?: boolean }} props
 */
function AppLayout({ topSubtitle = "Dashboard", showBack = false }) {
  const { summary, QUIZ_KBS, LEVELS } = useProgress();
  const { theme, toggle } = useTheme();
  const [sideOpen, setSideOpen] = useState(false);
  const [sideHidden, setSideHidden] = useState(
    () => localStorage.getItem("mathlab_side") === "hidden",
  );
  const [showTop, setShowTop] = useState(false);
  const { pathname } = useLocation();

  // Tutup sidebar mobile setiap pindah halaman.
  useEffect(() => {
    setSideOpen(false);
  }, [pathname]);

  // Persist mode desktop collapsed (parity dengan shell.js).
  useEffect(() => {
    try {
      localStorage.setItem("mathlab_side", sideHidden ? "hidden" : "");
    } catch {
      /* abaikan mode privat */
    }
  }, [sideHidden]);

  const handleCloseSidebar = () => {
    // Mobile (≤820px): tutup overlay; desktop: collapse via .side-hidden.
    if (window.matchMedia("(max-width: 820px)").matches) {
      setSideOpen(false);
    } else {
      setSideHidden(true);
    }
  };

  // Dot status sidebar diturunkan dari summary (single source of truth).
  const statusByKb = useMemo(() => {
    const map = {};
    for (const kb of Object.keys(summary.perKB || {})) {
      const info = summary.perKB[kb];
      const isQuiz = QUIZ_KBS.includes(kb);
      const done = isQuiz
        ? info.done >= LEVELS.length
        : !!info.visited;
      const prog = isQuiz
        ? (info.done > 0 || info.avg > 0) && !done
        : false;
      map[kb] = done ? "done" : prog ? "prog" : "todo";
    }
    return map;
  }, [summary, QUIZ_KBS, LEVELS]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setSideOpen(false);
    };
    const onScroll = () => setShowTop(window.scrollY > 320);
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <div
      className={`app${sideOpen ? " side-open" : ""}${sideHidden ? " side-hidden" : ""}`}
    >
      <Sidebar statusByKb={statusByKb} onClose={handleCloseSidebar} />
      {/* backdrop + tombol buka menu (visibilitas diatur CSS) */}
      <div className="backdrop" onClick={() => setSideOpen(false)} />
      <button
        type="button"
        className="side-open-btn"
        aria-label="Buka menu navigasi"
        aria-expanded={sideOpen || !sideHidden}
        onClick={() => {
          if (sideHidden) setSideHidden(false);
          else setSideOpen(true);
        }}
      >
        <span aria-hidden="true">☰</span> Menu
      </button>
      <div className="main">
        <Topbar
          showBack={showBack}
          themeLabel={theme === "dark" ? "Mode terang" : "Mode gelap"}
          onToggleTheme={toggle}
        />
        <div className="content anim-in">
          <Outlet />
        </div>
        <footer className="site">
          MathLab SMA — belajar matematika jadi seru
        </footer>
      </div>
      <button
        type="button"
        className={`to-top${showTop ? " show" : ""}`}
        aria-label="Kembali ke atas"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      >
        ↑
      </button>
      <ToastHost />
    </div>
  );
}

export default memo(AppLayout);
