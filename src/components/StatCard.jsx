import { memo, useEffect, useState } from "react";

/** Animasi angka 750ms easeOutCubic (parity dengan MTKShell.countUp). */
function useCountUp(target) {
  const num = Number(target);
  const [val, setVal] = useState(Number.isFinite(num) ? num : target);
  useEffect(() => {
    if (!Number.isFinite(num)) {
      setVal(target);
      return;
    }
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      setVal(num);
      return;
    }
    let raf = 0;
    const t0 = performance.now();
    const tick = (t) => {
      const p = Math.min(1, (t - t0) / 750);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(num * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [num, target]);
  return val;
}

/** StatCard — satu kartu statistik dashboard. */
function StatCard({ label, value, suffix = "", sub = "", progress = null }) {
  const shown = useCountUp(value);
  return (
    <div className="stat">
      <div>
        <small>{label}</small>
        <b className="big">
          {shown}
          {suffix}
        </b>
        {sub && <div className="trend">{sub}</div>}
        {progress != null && (
          <div className="bar">
            <i style={{ width: `${progress}%` }} />
          </div>
        )}
      </div>
    </div>
  );
}

export default memo(StatCard);
