import { memo } from "react";
import { Link } from "react-router-dom";

/** Pager — navigasi antar halaman KB. */
function Pager({ prevTo, prevLabel, nextTo, nextLabel }) {
  return (
    <div className="pager">
      <Link to={prevTo}>{prevLabel}</Link>
      <Link to={nextTo}>{nextLabel}</Link>
    </div>
  );
}

export default memo(Pager);
