import { useCallback, useEffect, useState } from "react";

const THEME_KEY = "mathlab_theme";

function readInitial() {
  try {
    const t = localStorage.getItem(THEME_KEY);
    if (t === "dark" || t === "light") return t;
    if (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    )
      return "dark";
  } catch {
    /* abaikan */
  }
  return "light";
}

/** Best practice: logika efek-samping (DOM + storage) dibungkus custom hook. */
export function useTheme() {
  const [theme, setTheme] = useState(readInitial);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      /* abaikan */
    }
    window.dispatchEvent(new Event("themechange"));
  }, [theme]);

  const toggle = useCallback(
    () => setTheme((t) => (t === "dark" ? "light" : "dark")),
    [],
  );

  return { theme, toggle };
}
