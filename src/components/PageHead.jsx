import { memo } from "react";
import { Link } from "react-router-dom";

/**
 * PageHead — judul halaman + breadcrumb. Murni dari props.
 * @param {string|null} tag — bila null, pil tag disembunyikan.
 * @param {string} titleClass — default "grad-text", kosong untuk judul solid.
 */
function PageHead({ tag = null, tagClass = "", title, titleClass = "grad-text", crumb = null }) {
  return (
    <div className="page-head">
      {tag && <span className={`kb-tag ${tagClass}`.trim()}>{tag}</span>}
      <h1 className={titleClass}>{title}</h1>
      {crumb && (
        <p className="crumb">
          <Link to="/">Beranda</Link> / {crumb}
        </p>
      )}
    </div>
  );
}

export default memo(PageHead);
