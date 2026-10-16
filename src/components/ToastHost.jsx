import { memo, useEffect, useState } from "react";

/**
 * ToastHost — wadah #toastWrap + .toast (parity dengan shell.js).
 * Mendengar event `mathlab:toast`, tampil 2600ms lalu hilang.
 */
function ToastHost() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    let id = 0;
    const onToast = (e) => {
      const { message, type } = e.detail || {};
      if (!message) return;
      id += 1;
      const key = id;
      setItems((list) => [...list, { key, message, type }]);
      setTimeout(() => {
        setItems((list) => list.filter((t) => t.key !== key));
      }, 2600);
    };
    window.addEventListener("mathlab:toast", onToast);
    return () => window.removeEventListener("mathlab:toast", onToast);
  }, []);

  return (
    <div id="toastWrap" role="status" aria-live="polite">
      {items.map((t) => (
        <div key={t.key} className={`toast show${t.type ? ` ${t.type}` : ""}`}>
          {t.message}
        </div>
      ))}
    </div>
  );
}

export default memo(ToastHost);
