import { memo } from "react";
import { Link } from "react-router-dom";

/**
 * Topbar — bar atas: tombol kembali + ganti tema.
 */
function Topbar({
  showBack = false,
  themeLabel = "Gelap",
  onToggleTheme,
}) {
  return (
    <div className="topbar">
      {showBack && (
        <Link className="btn ghost" to="/" aria-label="Kembali ke beranda">
          ←
        </Link>
      )}
      {onToggleTheme && (
        <button
          type="button"
          className="btn ghost"
          aria-label="Ganti tema terang / gelap"
          onClick={onToggleTheme}
        >
          {themeLabel}
        </button>
      )}
    </div>
  );
}

export default memo(Topbar);
