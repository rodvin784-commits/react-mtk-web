import { memo, useMemo, useState } from "react";
import {
  FORMS,
  FORM_LABELS,
  composeLinear,
  fmtFunc,
  fmtLinear,
} from "../lib/composition.js";
import Alert from "./Alert.jsx";

const PRESET = { a: 1, b: 3, c: 4, d: 5, e: 3, f: -9 };

/**
 * CompositionCalculator — kalkulator 10 bentuk komposisi linear.
 * @param {{ onUseResult?: (expr: string) => void }} props
 *   `onUseResult` = callback ke parent (KB3) agar hasil bisa digambar di grafik.
 */
function CompositionCalculator({ onUseResult }) {
  const [coef, setCoef] = useState(PRESET);
  const [form, setForm] = useState("");
  const [xVal, setXVal] = useState("");
  const [output, setOutput] = useState(null);
  const [touched, setTouched] = useState(false);

  const preview = useMemo(
    () =>
      `f(x) = ${coef.a}x + (${coef.b}) • g(x) = ${coef.c}x + (${coef.d}) • h(x) = ${coef.e}x + (${coef.f})`,
    [coef],
  );

  const valid = useMemo(() => {
    const nums = [coef.a, coef.b, coef.c, coef.d, coef.e, coef.f];
    return (
      nums.every((n) => n !== "" && !isNaN(Number(n))) && Boolean(form)
    );
  }, [coef, form]);

  const invalid = touched && !valid;

  const set = (k) => (e) =>
    setCoef((c) => ({ ...c, [k]: e.target.value === "" ? "" : Number(e.target.value) }));

  const compute = () => {
    setTouched(true);
    if (!valid) {
      setOutput({ error: "Lengkapi koefisien numerik dan pilih bentuk komposisi." });
      return;
    }
    const funcs = {
      f: { a: Number(coef.a), b: Number(coef.b) },
      g: { a: Number(coef.c), b: Number(coef.d) },
      h: { a: Number(coef.e), b: Number(coef.f) },
    };
    const order = FORMS[form];
    const r = composeLinear(funcs, order);
    let evalX = null;
    if (String(xVal).trim() !== "") {
      const xn = Number(xVal);
      evalX = isNaN(xn) ? { invalid: true } : { x: xn, y: r.a * xn + r.b };
    }
    setOutput({ funcs, key: form, result: r, evalX });
  };

  return (
    <div className="card section" id="komposisi">
      <h2>2. Kalkulator Komposisi (10 bentuk)</h2>
      <p className="legend">
        Tiga fungsi linear: <code>f(x) = ax + b</code> •{" "}
        <code>g(x) = cx + d</code> • <code>h(x) = ex + f</code>
      </p>

      <div className="grid-comp">
        {[
          ["a", "f: a"],
          ["b", "f: b"],
          ["c", "g: c"],
          ["d", "g: d"],
          ["e", "h: e"],
          ["f", "h: f"],
        ].map(([k, label]) => (
          <div key={k}>
            <label>{label}</label>
            <input
              type="number"
              value={coef[k]}
              onChange={set(k)}
              aria-invalid={
                invalid && (coef[k] === "" || isNaN(Number(coef[k])))
              }
              style={
                invalid && (coef[k] === "" || isNaN(Number(coef[k])))
                  ? { borderColor: "#ee7d9d" }
                  : undefined
              }
            />
          </div>
        ))}
      </div>

      <div className="row">
        <div>
          <label>Bentuk</label>
          <select
            value={form}
            onChange={(e) => setForm(e.target.value)}
            aria-invalid={invalid && !form}
            style={
              invalid && !form ? { borderColor: "#ee7d9d" } : undefined
            }
          >
            <option value="">— pilih bentuk —</option>
            {Object.keys(FORMS).map((k) => (
              <option key={k} value={k}>
                {FORM_LABELS[k]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Nilai x (opsional)</label>
          <input
            type="number"
            placeholder="mis. 2"
            value={xVal}
            onChange={(e) => setXVal(e.target.value)}
          />
        </div>
      </div>

      <p className="muted tight">{preview}</p>

      <div className="row mt10">
        <button className="btn" type="button" onClick={compute}>
          Hitung
        </button>
        <button
          className="btn secondary"
          type="button"
          onClick={() => {
            setCoef(PRESET);
            setTouched(false);
            setOutput(null);
          }}
        >
          Isi contoh papan tulis
        </button>
      </div>

      <div className="mt10">
        {output?.error && <Alert type="error">{output.error}</Alert>}
        {output?.result && (
          <>
            <Alert type="ok">
              <b>
                {output.key}(x) = {fmtLinear(output.result.a, output.result.b)}
              </b>
              <br />
              <small>{FORM_LABELS[output.key]}</small>
            </Alert>
            <div className="mono steps">
              {output.result.steps.map((s, i) => `${i + 1}. ${s}`).join("\n")}
            </div>
            <p>
              Diketahui: {fmtFunc("f", output.funcs.f)},{" "}
              {fmtFunc("g", output.funcs.g)}, {fmtFunc("h", output.funcs.h)}
            </p>
            {output.evalX?.invalid && (
              <Alert type="error">Nilai x tidak numerik.</Alert>
            )}
            {output.evalX && !output.evalX.invalid && (
              <Alert type="warn">
                {output.key}({output.evalX.x}) = {output.result.a}×
                {output.evalX.x}+{output.result.b} ={" "}
                <b>{output.evalX.y}</b>
              </Alert>
            )}
            <p className="muted">Format hasil sesuai papan tulis.</p>
            {onUseResult && (
              <button
                type="button"
                className="btn secondary btn-sm"
                style={{ marginTop: 8 }}
                onClick={() =>
                  onUseResult(fmtLinear(output.result.a, output.result.b))
                }
              >
                Gambar hasil di grafik bawah
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default memo(CompositionCalculator);
