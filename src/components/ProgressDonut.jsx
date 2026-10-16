import { memo, useEffect, useState } from "react";

/**
 * ProgressDonut — lingkaran progres SVG.
 * @param {{ value?: number }} props nilai 0–100
 */
function ProgressDonut({ value = 0 }) {
  const C = 2 * Math.PI * 34;
  const [offset, setOffset] = useState(C);

  useEffect(() => {
    const t = setTimeout(
      () => setOffset(C * (1 - Math.min(100, Math.max(0, value)) / 100)),
      150,
    );
    return () => clearTimeout(t);
  }, [value, C]);

  return (
    <div className="donut" title="Skor rata-rata keseluruhan">
      <svg viewBox="0 0 84 84" aria-hidden="true">
        <defs>
          <linearGradient id="dgrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#6d7ef7" />
            <stop offset="1" stopColor="#9d8cff" />
          </linearGradient>
        </defs>
        <circle className="donut-bg" cx="42" cy="42" r="34" />
        <circle
          className="donut-fg"
          cx="42"
          cy="42"
          r="34"
          style={{ strokeDasharray: C, strokeDashoffset: offset }}
        />
      </svg>
      <b className="donut-val">{value}%</b>
    </div>
  );
}

export default memo(ProgressDonut);
