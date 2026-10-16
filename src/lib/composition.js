/**
 * composition — logika kalkulator komposisi fungsi linear (murni, tanpa DOM).
 * Best practice: data + fungsi murni terpisah dari komponen.
 */

export const FORMS = {
  fog: ["f", "g"],
  gof: ["g", "f"],
  foh: ["f", "h"],
  hof: ["h", "f"],
  goh: ["g", "h"],
  hog: ["h", "g"],
  fogoh: ["f", "g", "h"],
  gofoh: ["g", "f", "h"],
  hofog: ["h", "f", "g"],
  hogof: ["h", "g", "f"],
};

export const FORM_LABELS = {
  fog: "(f∘g)(x)=f(g(x))",
  gof: "(g∘f)(x)=g(f(x))",
  foh: "(f∘h)(x)=f(h(x))",
  hof: "(h∘f)(x)=h(f(x))",
  goh: "(g∘h)(x)=g(h(x))",
  hog: "(h∘g)(x)=h(g(x))",
  fogoh: "(f∘g∘h)(x)=f(g(h(x)))",
  gofoh: "(g∘f∘h)(x)=g(f(h(x)))",
  hofog: "(h∘f∘g)(x)=h(f(g(x)))",
  hogof: "(h∘g∘f)(x)=h(g(f(x)))",
};

/** Format ax+b menjadi "4x+8", "-x", "3", dst. */
export function fmtLinear(a, b) {
  if (a === 0) return String(b);
  let s;
  if (a === 1) s = "x";
  else if (a === -1) s = "-x";
  else s = a + "x";
  if (b > 0) s += "+" + b;
  else if (b < 0) s += String(b);
  return s;
}

export function fmtFunc(name, f) {
  return `${name}(x) = ${fmtLinear(f.a, f.b)}`;
}

/**
 * Susun fungsi linear dari kanan ke kiri.
 * @param {{f:{a,b}, g:{a,b}, h:{a,b}}} funcs
 * @param {string[]} order mis. ["f","g","h"]
 * @returns {{ a:number, b:number, steps:string[] }}
 */
export function composeLinear(funcs, order) {
  const steps = [];
  let cur = {
    a: funcs[order[order.length - 1]].a,
    b: funcs[order[order.length - 1]].b,
  };
  let innerName = order[order.length - 1];
  steps.push(
    `Mulai dari fungsi paling dalam: ${innerName}(x) = ${fmtLinear(cur.a, cur.b)}`,
  );

  for (let i = order.length - 2; i >= 0; i--) {
    const outer = funcs[order[i]];
    const on = order[i];
    const na = outer.a * cur.a;
    const nb = outer.a * cur.b + outer.b;
    const curStr = `(${fmtLinear(cur.a, cur.b)})`;
    let sub;
    if (outer.a === 1) sub = outer.b === 0 ? curStr : `${curStr}+${outer.b}`;
    else if (outer.a === -1)
      sub = outer.b === 0 ? `-${curStr}` : `-${curStr}+${outer.b}`;
    else
      sub =
        `${outer.a}*${curStr}` +
        (outer.b !== 0 ? (outer.b > 0 ? `+${outer.b}` : String(outer.b)) : "");

    steps.push(`${on}(${innerName}(x)) = ${sub} = ${fmtLinear(na, nb)}`);
    cur = { a: na, b: nb };
    innerName = `${on}∘${innerName}`;
  }
  return { a: cur.a, b: cur.b, steps };
}
