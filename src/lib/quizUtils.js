/**
 * quizUtils — normalisasi + pengecekan jawaban (murni, mudah diuji).
 */

export function normAnswer(s) {
  return String(s ?? "")
    .toLowerCase()
    .replace(/[\s*×·]/g, "")
    .replace(/,/g, ".");
}

/** @returns {boolean} benar / salah */
export function checkAnswer(item, userVal) {
  if (item.choices) return Number(userVal) === Number(item.answer);
  return normAnswer(userVal) === normAnswer(item.answer);
}

/** Syarat buka kunci: minimal 60% di level sebelumnya. */
export function isUnlocked(level, bestOfPrev) {
  if (level === "mudah") return true;
  return (bestOfPrev ?? 0) >= 60;
}

export const PASS_THRESHOLD = 60;
