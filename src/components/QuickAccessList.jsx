import { memo } from "react";
import { Link } from "react-router-dom";

/**
 * QuickAccessList — daftar akses cepat (composition over props).
 * @param {{ items: Array<{ to: string, title: string, desc: string }> }} props
 */
function QuickAccessList({ items = [] }) {
  return (
    <div>
      {items.map((it) => (
        <Link key={it.title} className="qa" to={it.to}>
          <div>
            <b>{it.title}</b>
            <small>{it.desc}</small>
          </div>
        </Link>
      ))}
    </div>
  );
}

export default memo(QuickAccessList);
