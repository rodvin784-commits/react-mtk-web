import { memo } from "react";

/**
 * Alert — notifikasi inline kecil.
 * @param {{ type?: "ok"|"warn"|"error", children: React.ReactNode }} props
 */
function Alert({ type = "warn", children }) {
  return <div className={`alert ${type}`}>{children}</div>;
}

export default memo(Alert);
