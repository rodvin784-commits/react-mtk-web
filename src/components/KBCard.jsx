import { memo } from "react";
import { Link } from "react-router-dom";

/**
 * KBCard — kartu modul di dashboard.
 * @param {{ tag: string, tagClass?: string, title: string, desc: string,
 *   progress?: number, statusText?: string, to: string, linkLabel: string }} props
 */
function KBCard({
  tag,
  tagClass = "",
  title,
  desc,
  progress = 0,
  statusText = "Belum dibuka",
  to,
  linkLabel,
}) {
  return (
    <div className="card kb-card">
      <span className={`kb-tag ${tagClass}`.trim()}>{tag}</span>
      <h3>{title}</h3>
      <p>{desc}</p>
      <div className="bar">
        <i style={{ width: `${progress}%` }} />
      </div>
      <p className="muted tight">{statusText}</p>
      <Link className="btn secondary" to={to}>
        {linkLabel}
      </Link>
    </div>
  );
}

export default memo(KBCard);
