import { memo, useMemo, useState } from "react";
import { Link } from "react-router-dom";

/**
 * Mini grafik linear interaktif f(x) = m·x + b (seperti referensi).
 * SVG murni tanpa dependensi: grid, sumbu, garis biru + titik kuning.
 */
function LinearPreview() {
  const [m, setM] = useState(1);
  const [b, setB] = useState(1);

  const { d, dot } = useMemo(() => {
    // viewport matematika x,y ∈ [-6, 6] → piksel 0..300 x 0..190
    const W = 300;
    const H = 190;
    const X = (x) => ((x + 6) / 12) * W;
    const Y = (y) => H - ((y + 6) / 12) * H;
    const pts = [];
    for (let x = -6; x <= 6; x += 0.2) pts.push([X(x), Y(m * x + b)]);
    const path = pts
      .map(([px, py], i) => `${i === 0 ? "M" : "L"}${px.toFixed(1)},${py.toFixed(1)}`)
      .join(" ");
    // titik kuning di perpotongan sumbu-y (x=0 → y=b, dijepit ke viewport)
    const by = Math.min(H - 4, Math.max(4, Y(b)));
    return { d: path, dot: { x: X(0), y: by } };
  }, [m, b]);

  const fmt = (v) => (v === 1 ? "" : v === -1 ? "−" : String(v).replace("-", "−"));

  return (
    <div className="hero-graph" aria-hidden="true">
      <svg viewBox="0 0 300 190" role="img">
        <line x1="150" y1="0" x2="150" y2="190" stroke="#9aa5c7" strokeWidth="1.2" />
        <line x1="0" y1="95" x2="300" y2="95" stroke="#9aa5c7" strokeWidth="1.2" />
        <path d={d} fill="none" stroke="#2f6bff" strokeWidth="3" strokeLinecap="round" />
        <circle cx={dot.x} cy={dot.y} r="6" fill="#ffc42e" stroke="#16213f" strokeWidth="1.5" />
      </svg>
      <div className="hero-sliders">
        <label>
          m
          <input
            type="range"
            min="-3"
            max="3"
            step="0.5"
            value={m}
            onChange={(e) => setM(Number(e.target.value))}
            aria-label="Gradien m"
          />
        </label>
        <label>
          b
          <input
            type="range"
            min="-4"
            max="4"
            step="1"
            value={b}
            onChange={(e) => setB(Number(e.target.value))}
            aria-label="Potongan b"
          />
        </label>
      </div>
      <p className="hero-formula">
        f(x) = {m === 0 ? "" : `${fmt(m)}x`}{m !== 0 && b !== 0 ? (b > 0 ? " + " : " − ") : ""}
        {b !== 0 ? Math.abs(b) : m === 0 ? b : ""}
      </p>
    </div>
  );
}

/**
 * WelcomeBanner — hero putih + grafik interaktif (sesuai referensi).
 */
function WelcomeBanner({ title, subtitle, primaryTo, primaryLabel, secondaryTo = "/kb3#kuis", secondaryLabel = "Ikuti kuis" }) {
  return (
    <div className="welcome">
      <div>
        <h1>{title}</h1>
        <p>{subtitle}</p>
        <div className="welcome-actions">
          <Link className="btn accent" to={primaryTo}>
            {primaryLabel}
          </Link>
          <Link className="btn outline" to={secondaryTo}>
            {secondaryLabel}
          </Link>
        </div>
      </div>
      <LinearPreview />
    </div>
  );
}

export default memo(WelcomeBanner);
