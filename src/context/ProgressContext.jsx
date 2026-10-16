import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { createStore, initials, safeStorage } from "../lib/store.js";

/**
 * ProgressContext — satu-satunya sumber kebenaran untuk profil & skor.
 * Best practice: Context + custom hook, bukan prop drilling bertingkat.
 */
const ProgressContext = createContext(null);

export function ProgressProvider({ children }) {
  // Store dibuat sekali (lazy init) — bukan di setiap render.
  const [store] = useState(() => createStore(safeStorage()));
  // `tick` memaksa subscriber re-render setiap ada mutasi store.
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((t) => t + 1), []);

  const recordQuiz = useCallback(
    (kb, level, pct) => {
      const res = store.recordQuiz(kb, level, pct);
      refresh();
      return res;
    },
    [store, refresh],
  );

  const markMateri = useCallback(
    (kb) => {
      const res = store.markMateri(kb);
      refresh();
      return res;
    },
    [store, refresh],
  );

  const value = useMemo(
    () => ({
      profile: store.profile(),
      summary: store.summary(),
      best: (kb, lv) => store.best(kb, lv),
      attempts: (kb, lv) => store.attempts(kb, lv),
      recordQuiz,
      markMateri,
      initials,
      storageOK: store.storageOK(),
      LEVELS: store.LEVELS,
      QUIZ_KBS: store.QUIZ_KBS,
      ALL_KBS: store.ALL_KBS,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [store, tick, recordQuiz, markMateri],
  );

  return (
    <ProgressContext.Provider value={value}>
      {children}
    </ProgressContext.Provider>
  );
}

/** Hook konsumsi — gagal cepat jika lupa pasang Provider. */
export function useProgress() {
  const ctx = useContext(ProgressContext);
  if (!ctx)
    throw new Error("useProgress harus dipakai di dalam <ProgressProvider>");
  return ctx;
}
