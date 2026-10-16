/**
 * mathParser — parser rumus fungsi satu variabel (murni, tanpa DOM).
 * Best practice: fungsi murni + error eksplisit ({ token }) agar mudah diuji.
 *
 * Contoh valid: "x+3", "2*x-6", "x^2-4", "4-x"
 */
export function parseMath(expr) {
  if (typeof expr !== "string") throw { token: "(kosong)" };
  let s = expr.trim();
  // buang prefix f(x)= / y=
  s = s.replace(/^\s*(f\s*\(\s*x\s*\)|y)\s*=\s*/i, "");
  if (!s) throw { token: "(kosong)" };

  const illegal = s.match(/[^0-9xX+\-*/^().\s]/);
  if (illegal) throw { token: illegal[0] };

  let t = s.replace(/X/g, "x").replace(/\s+/g, "");
  if (!/[x0-9)]/.test(t)) throw { token: t || "(kosong)" };

  // perkalian implisit: 2x -> 2*x, 2( -> 2*(, )x -> )*x
  t = t
    .replace(/(\d|\))(?=x|\()/g, "$1*")
    .replace(/x(?=x|\d|\()/g, "x*")
    .replace(/\)(?=\()/g, ")*");

  // ^n bulat -> **n (validasi dulu)
  const caret = t.match(/\^([^0-9+\-]|$)/);
  if (caret) throw { token: "^" + (caret[1] || "") };
  t = t.replace(/\^/g, "**");
  if (/\*\*\*/.test(t)) throw { token: "**" };

  let fn;
  try {
    fn = new Function("x", '"use strict"; return (' + t + ");");
  } catch {
    throw { token: "sintaks" };
  }
  try {
    fn(0); // uji evaluasi (boleh inf di titik lain)
  } catch {
    throw { token: "evaluasi" };
  }
  return { fn, normalized: t };
}

/** Gambar kurva ke <canvas>. Dipisah dari React agar bisa dipakai di mana saja. */
export function drawPlot(canvas, fn, opts = {}) {
  const xmin = opts.xmin ?? -10;
  const xmax = opts.xmax ?? 10;
  const ymin = opts.ymin ?? -10;
  const ymax = opts.ymax ?? 10;

  const dpr = window.devicePixelRatio || 1;
  const W = canvas.clientWidth || 600;
  const H = 320;
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  const ctx = canvas.getContext("2d");
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, W, H);

  const cs = window.getComputedStyle
    ? getComputedStyle(document.documentElement)
    : null;
  const cssVar = (n, fallback) => {
    const v = cs ? cs.getPropertyValue(n) : "";
    return (v && v.trim()) || fallback;
  };
  const GRID = cssVar("--line", "#e9edf7");
  const AXIS = cssVar("--muted", "#9aa5c4");
  const CURVE = cssVar("--primary", "#6d7ef7");

  const X = (x) => ((x - xmin) / (xmax - xmin)) * W;
  const Y = (y) => H - ((y - ymin) / (ymax - ymin)) * H;

  ctx.strokeStyle = GRID;
  ctx.lineWidth = 1;
  for (let gx = Math.ceil(xmin); gx <= xmax; gx++) {
    ctx.beginPath();
    ctx.moveTo(X(gx), 0);
    ctx.lineTo(X(gx), H);
    ctx.stroke();
  }
  for (let gy = Math.ceil(ymin); gy <= ymax; gy++) {
    ctx.beginPath();
    ctx.moveTo(0, Y(gy));
    ctx.lineTo(W, Y(gy));
    ctx.stroke();
  }

  ctx.strokeStyle = AXIS;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(0, Y(0));
  ctx.lineTo(W, Y(0));
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(X(0), 0);
  ctx.lineTo(X(0), H);
  ctx.stroke();

  ctx.fillStyle = AXIS;
  ctx.font = '11px "Plus Jakarta Sans",Segoe UI';
  for (let lx = Math.ceil(xmin); lx <= xmax; lx += 2) {
    if (lx !== 0) ctx.fillText(lx, X(lx) + 3, Y(0) - 4);
  }
  for (let ly = Math.ceil(ymin); ly <= ymax; ly += 2) {
    if (ly !== 0) ctx.fillText(ly, X(0) + 4, Y(ly) - 3);
  }

  ctx.strokeStyle = CURVE;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  let pen = false;
  for (let px = 0; px <= W; px += 1) {
    const x = xmin + (px / W) * (xmax - xmin);
    let y;
    try {
      y = fn(x);
    } catch {
      pen = false;
      continue;
    }
    if (typeof y !== "number" || !isFinite(y)) {
      pen = false;
      continue;
    }
    if (y < ymin - 50 || y > ymax + 50) {
      pen = false;
      continue;
    }
    const cy = Y(Math.max(ymin, Math.min(ymax, y)));
    if (!pen) {
      ctx.moveTo(px, cy);
      pen = true;
    } else ctx.lineTo(px, cy);
  }
  ctx.stroke();
}
