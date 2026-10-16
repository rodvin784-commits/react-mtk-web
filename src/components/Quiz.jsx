import { memo, useMemo, useRef, useState } from "react";
import { QUESTIONS } from "../data/questions.js";
import { checkAnswer, PASS_THRESHOLD } from "../lib/quizUtils.js";
import { useProgress } from "../context/ProgressContext.jsx";
import { toast } from "../lib/toast.js";
import Alert from "./Alert.jsx";

/**
 * Quiz — kuis bertingkat (mudah → sedang → sulit).
 * Best practice: state terangkat minimal, turunan via useMemo,
 * persistensi via Context (bukan akses localStorage langsung).
 *
 * @param {{ kbId: "kb1"|"kb2"|"kb3"|"kb4", id?: string, title?: string }} props
 */
function Quiz({ kbId, id = "kuis", title = "Soal Bertingkat" }) {
  const { LEVELS, best, attempts, recordQuiz, storageOK } = useProgress();
  const bank = QUESTIONS[kbId];

  const [level, setLevel] = useState("mudah");
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [sessionBest, setSessionBest] = useState({}); // fallback jika storage diblokir
  const resultRef = useRef(null);

  const bestOf = (lv) => best(kbId, lv) ?? sessionBest[`${kbId}_${lv}`] ?? null;

  const unlocked = (lv) => {
    if (lv === "mudah") return true;
    const prev = lv === "sedang" ? "mudah" : "sedang";
    return (bestOf(prev) ?? 0) >= PASS_THRESHOLD;
  };

  const questions = bank?.[level] ?? [];

  const answeredCount = useMemo(
    () =>
      questions.filter((_, i) => {
        const v = answers[`${level}_${i}`];
        return v !== undefined && String(v).trim() !== "";
      }).length,
    [questions, answers, level],
  );

  if (!bank) return <Alert type="error">Bank soal {kbId} belum ada.</Alert>;

  const setAnswer = (i, v) => {
    setAnswers((a) => ({ ...a, [`${level}_${i}`]: v }));
    setResult(null);
  };

  const grade = () => {
    let benar = 0;
    const detail = questions.map((it, i) => {
      const ok = checkAnswer(it, answers[`${level}_${i}`]);
      if (ok) benar++;
      return ok;
    });
    const pct = Math.round((benar / questions.length) * 100);
    const rec = recordQuiz(kbId, level, pct);
    const bestNow = rec ? rec.best : pct;
    // simpan juga di memori sesi (fallback mode privat)
    setSessionBest((s) => ({
      ...s,
      [`${kbId}_${level}`]: Math.max(s[`${kbId}_${level}`] ?? 0, pct),
    }));
    setResult({ benar, total: questions.length, pct, bestNow, detail, rec });
    requestAnimationFrame(() => {
      resultRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
  };

  const reset = () => {
    setAnswers((a) => {
      const next = { ...a };
      Object.keys(next).forEach((k) => {
        if (k.startsWith(`${level}_`)) delete next[k];
      });
      return next;
    });
    setResult(null);
  };

  const nextLevel =
    result && result.pct >= PASS_THRESHOLD && level !== "sulit"
      ? LEVELS[LEVELS.indexOf(level) + 1]
      : null;

  return (
    <div className="card section" id={id}>
      <h2>{title}</h2>
      {!storageOK && (
        <Alert type="warn">
          Penyimpanan perangkat diblokir (mode privat?) — koreksi tetap jalan,
          tapi skor tidak tersimpan permanen.
        </Alert>
      )}

      <div className="tabs">
        {LEVELS.map((lv) => {
          const b = bestOf(lv);
          const att = attempts(kbId, lv);
          const lock = !unlocked(lv);
          return (
            <button
              key={lv}
              type="button"
              className={`tab${level === lv ? " active" : ""}${lock ? " locked" : ""}`}
              onClick={() => {
                if (lock) {
                  toast(
                    "Buka kunci: nilai minimal 60% pada tingkat sebelumnya.",
                    "warn",
                  );
                  return;
                }
                setLevel(lv);
                setResult(null);
              }}
              title={lock ? "Nilai minimal 60% pada tingkat sebelumnya" : ""}
            >
              {lv.charAt(0).toUpperCase() + lv.slice(1)}
              {b != null ? ` • ${b}%` : ""}
              {att > 1 ? ` (${att}×)` : ""}
              {lock ? " [Terkunci]" : ""}
            </button>
          );
        })}
      </div>

      <div className="quiz-progress">
        <span>
          Level {level} • terjawab {answeredCount}/{questions.length} soal
        </span>
        <div className="bar">
          <i
            style={{
              width: `${Math.round((answeredCount / questions.length) * 100)}%`,
            }}
          />
        </div>
      </div>

      {questions.map((it, i) => {
        const key = `${level}_${i}`;
        const marked = result?.detail[i];
        return (
          <div
            key={key}
            className={`quiz-q${marked === true ? " correct" : marked === false ? " wrong" : ""}`}
          >
            <p>
              <b>{i + 1}.</b> {it.q}
            </p>
            {it.choices ? (
              it.choices.map((c, ci) => (
                <label key={ci}>
                  <input
                    type="radio"
                    name={`${kbId}_${key}`}
                    value={ci}
                    checked={String(answers[key]) === String(ci)}
                    onChange={() => setAnswer(i, ci)}
                  />{" "}
                  {c}
                </label>
              ))
            ) : (
              <input
                type="text"
                placeholder="Ketik jawaban, mis. 4x+8"
                value={answers[key] ?? ""}
                onChange={(e) => setAnswer(i, e.target.value)}
              />
            )}
            {result && (
              <div>
                <Alert type={marked ? "ok" : "error"}>
                  {!marked && (
                    <>
                      Kurang tepat. Kunci:{" "}
                      <b>{it.choices ? it.choices[it.answer] : it.answer}</b>
                      <br />
                    </>
                  )}
                  {marked ? "Benar! " : ""}Pembahasan: {it.discuss}
                </Alert>
              </div>
            )}
          </div>
        );
      })}

      {result && (
        <div ref={resultRef}>
        <Alert type={result.pct >= PASS_THRESHOLD ? "ok" : "warn"}>
          Skor <b>{level}</b>: {result.benar}/{result.total} ({result.pct}%)
          — terbaik: <b>{result.bestNow}%</b>
          {result.rec?.attempts > 1
            ? ` • percobaan ke-${result.rec.attempts}`
            : ""}
          {result.pct >= PASS_THRESHOLD && level !== "sulit"
            ? " — tingkat berikutnya terbuka!"
            : ""}
          {nextLevel && unlocked(nextLevel) && (
            <>
              <br />
              <button
                type="button"
                className="btn secondary btn-sm"
                style={{ marginTop: 8 }}
                onClick={() => {
                  setLevel(nextLevel);
                  setResult(null);
                }}
              >
                Lanjut: {nextLevel}
              </button>
            </>
          )}
        </Alert>
        </div>
      )}

      <div className="row mt10">
        <button className="btn" type="button" onClick={grade}>
          Periksa Jawaban
        </button>
        <button className="btn ghost" type="button" onClick={reset}>
          Ulangi
        </button>
      </div>
      <p className="muted">
        Syarat buka kunci: <b>minimal 60%</b> tingkat sebelumnya. Skor terbaik
        &amp; riwayat tersimpan otomatis di perangkat.
      </p>
    </div>
  );
}

export default memo(Quiz);
