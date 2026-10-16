import { memo, useCallback, useEffect, useRef, useState } from "react";
import { drawPlot, parseMath } from "../lib/mathParser.js";
import { toast } from "../lib/toast.js";
import Alert from "./Alert.jsx";

/**
 * GraphPlot — grafik fungsi canvas (offline).
 * Best practice: state lokal per instance + controlled input,
 * logika gambar di lib (testable), DOM canvas via ref.
 *
 * @param {{ initial?: string, examples?: string[], exampleLabels?: string[],
 *   title?: string, note?: string, id?: string, externalFormula?: string }} props
 *   `externalFormula` = cara KB3 mengirim hasil komposisi ke grafik (lifting state up).
 */
function GraphPlot({
  initial = "x+3",
  examples = [],
  exampleLabels = [],
  title = "Grafik Fungsi (offline)",
  note = "",
  id = "grafik",
  externalFormula = "",
}) {
  const [formula, setFormula] = useState(initial);
  const [xmin, setXmin] = useState(-10);
  const [xmax, setXmax] = useState(10);
  const [error, setError] = useState("");
  const [table, setTable] = useState(null);
  const canvasRef = useRef(null);

  const copyResult = useCallback(() => {
    if (!table) return;
    const xs = [-2, -1, 0, 1, 2];
    const parts = xs.map((x, i) => `f(${x})=${table.cells[i]}`);
    const s = `f(x) = ${table.raw} | ${parts.join(", ")}`;
    const done = (ok) => toast(ok ? "Hasil disalin." : "Gagal menyalin.", ok ? "ok" : "error");
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(s).then(
        () => done(true),
        () => done(false),
      );
    } else {
      done(false);
    }
  }, [table]);

  // Terima rumus dari luar (hasil kalkulator komposisi) — sync via effect.
  useEffect(() => {
    if (externalFormula) setFormula(externalFormula);
  }, [externalFormula]);

  const render = useCallback(
    (raw = formula) => {
      setError("");
      setTable(null);
      if (!(xmin < xmax)) {
        setError(
          'Rentang tidak valid: angka "Dari (kiri)" harus lebih kecil dari "Sampai (kanan)".',
        );
        return;
      }
      let parsed;
      try {
        parsed = parseMath(raw);
      } catch (err) {
        setError(
          `Tidak bisa digambar pada: ${err.token || "?"}. Gunakan x, angka, + - * / ^ dan kurung. Contoh: x+3, x^2+5`,
        );
        return;
      }
      if (canvasRef.current)
        drawPlot(canvasRef.current, parsed.fn, {
          xmin,
          xmax,
          ymin: -10,
          ymax: 10,
        });
      const fmt = (v) =>
        typeof v === "number" && isFinite(v)
          ? Math.round(v * 1000) / 1000
          : "—";
      let f0 = NaN;
      let f2 = NaN;
      try {
        f0 = parsed.fn(0);
        f2 = parsed.fn(2);
      } catch {
        /* abaikan */
      }
      const xs = [-2, -1, 0, 1, 2];
      const cells = xs.map((x) => {
        try {
          return fmt(parsed.fn(x));
        } catch {
          return "—";
        }
      });
      setTable({ raw: raw.trim(), f0: fmt(f0), f2: fmt(f2), cells });
    },
    [formula, xmin, xmax],
  );

  // Gambar awal + gambar ulang saat tema berubah (warna canvas ikut tema).
  useEffect(() => {
    render(formula);
    const onTheme = () => render(formula);
    window.addEventListener("themechange", onTheme);
    return () => window.removeEventListener("themechange", onTheme);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const zoom = (f) => {
    const mid = (xmin + xmax) / 2;
    let half = ((xmax - xmin) / 2) * f;
    half = Math.min(50, Math.max(2, half));
    const nxmin = Math.round((mid - half) * 100) / 100;
    const nxmax = Math.round((mid + half) * 100) / 100;
    setXmin(nxmin);
    setXmax(nxmax);
  };

  // Terapkan zoom dengan nilai terbaru.
  useEffect(() => {
    if (canvasRef.current && !error && table) render(formula);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [xmin, xmax]);

  return (
    <div className="card section" id={id}>
      <h2>{title}</h2>
      {note && <p className="note">{note}</p>}
      <div className="row">
        <div className="grow2">
          <label htmlFor={`${id}-input`}>Rumus fungsi</label>
          <input
            id={`${id}-input`}
            type="text"
            value={formula}
            placeholder="mis. x+3"
            onChange={(e) => setFormula(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") render();
            }}
          />
        </div>
      </div>
      <details className="adv">
        <summary>Atur rentang sumbu-X (tidak wajib)</summary>
        <div className="row">
          <div>
            <label>Dari (kiri)</label>
            <input
              type="number"
              value={xmin}
              onChange={(e) => setXmin(Number(e.target.value))}
            />
          </div>
          <div>
            <label>Sampai (kanan)</label>
            <input
              type="number"
              value={xmax}
              onChange={(e) => setXmax(Number(e.target.value))}
            />
          </div>
        </div>
      </details>
      <div className="row mt10">
        <button className="btn" type="button" onClick={() => render()}>
          Gambar
        </button>
        {examples.map((ex, i) => (
          <button
            key={ex}
            className="btn secondary"
            type="button"
            onClick={() => {
              setFormula(ex);
              render(ex);
            }}
          >
            {exampleLabels[i] || ex}
          </button>
        ))}
        <button
          className="btn ghost"
          type="button"
          onClick={() => {
            setFormula("x+3");
            render("x+3");
          }}
        >
          Reset
        </button>
        <button
          className="btn ghost btn-sm"
          type="button"
          title="Melihat rentang x yang lebih lebar"
          onClick={() => zoom(0.6)}
        >
          Lihat lebih jauh
        </button>
        <button
          className="btn ghost btn-sm"
          type="button"
          title="Melihat rentang x yang lebih sempit"
          onClick={() => zoom(1.6)}
        >
          Lihat lebih dekat
        </button>
      </div>
      {error && <Alert type="error">{error}</Alert>}
      <p>
        <canvas className="plot" ref={canvasRef} />
      </p>
      {table && (
        <div>
          <Alert type="ok">
            Hasil: f(x) = {table.raw} ⇒ f(0) = <b>{table.f0}</b>, f(2) ={" "}
            <b>{table.f2}</b>
          </Alert>
          <p className="muted tight">
            Tabel nilai (tinggal baca, tidak perlu dihitung):
          </p>
          <div className="val-wrap">
            <table className="val-table" aria-label="Tabel nilai fungsi">
              <tbody>
                <tr>
                  <th>x</th>
                  <th>-2</th>
                  <th>-1</th>
                  <th>0</th>
                  <th>1</th>
                  <th>2</th>
                </tr>
                <tr>
                  <th>f(x)</th>
                  {table.cells.map((c, i) => (
                    <td key={i}>{c}</td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
          <button
            type="button"
            className="btn secondary btn-sm"
            style={{ marginTop: 8 }}
            onClick={copyResult}
          >
            Salin hasil
          </button>
        </div>
      )}
    </div>
  );
}

export default memo(GraphPlot);
