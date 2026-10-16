import { memo, useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * ScrollToHash — menggulir ke elemen #id setiap route/hash berubah.
 * Best practice: efek samping router terisolasi di satu component kecil.
 */
function ScrollToHash() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const el = document.getElementById(hash.replace("#", ""));
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
    }
    window.scrollTo({ top: 0 });
  }, [pathname, hash]);

  return null;
}

export default memo(ScrollToHash);
