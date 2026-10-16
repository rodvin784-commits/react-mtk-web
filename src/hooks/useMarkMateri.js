import { useCallback, useEffect, useState } from "react";
import { useProgress } from "../context/ProgressContext.jsx";

/**
 * Mencatat "materi dibuka" sekali per mount halaman KB.
 * Best practice: side-effect di useEffect, bukan saat render.
 */
export function useMarkMateri(kb) {
  const { markMateri } = useProgress();
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!kb || done) return;
    markMateri(kb);
    setDone(true);
  }, [kb, done, markMateri]);

  const stableMark = useCallback(() => markMateri(kb), [markMateri, kb]);
  return stableMark;
}
