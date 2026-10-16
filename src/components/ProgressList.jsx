import { memo } from "react";

/**
 * ProgressList — daftar progres per KB (dashboard).
 * @param {{ items: Array<{ kb: string, label: string, extra: string, pct: number, display: string, status: "done"|"prog"|"todo" }> }} props
 */
function ProgressList({ items = [] }) {
  return (
    <div>
      {items.map((it) => (
        <div key={it.kb} className={`prog-row st-${it.status}`}>
          <div className="prog-top">
            <span>
              {it.label}
              <small className="muted">{it.extra}</small>
            </span>
            <span className="pct">{it.display}</span>
          </div>
          <div className="bar">
            <i style={{ width: `${it.pct}%` }} />
          </div>
        </div>
      ))}
      <p className="prog-note">
        Skor = nilai terbaik per tingkat kuis; tersimpan otomatis di perangkatmu.
      </p>
    </div>
  );
}

export default memo(ProgressList);
