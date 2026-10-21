// Builds the vector wordmarks from the existing PNG (apps/site/public/logo.png, 480x197, the only
// source there is): "myna HEALTH" traced as it is, and "myna FIT" made from the same letters
// (F is HEALTH's E without its bottom arm, I is the L's stem, T is the T), so nothing is redrawn.
// Each glyph is traced on its own with potrace at 8x (`brew install potrace`, local tooling).
//   node lab/wordmark/build-wordmark.mjs
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "/Users/erdipratama/reverse-brand/node_modules/sharp/dist/index.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const src = join(here, "..", "..", "apps", "site", "public", "logo.png");
const tmp = join(here, "_tmp");
mkdirSync(tmp, { recursive: true });
const K = 8;
const W = 480 * K,
  H = 197 * K;
const { data } = await sharp(src)
  .flatten({ background: "#ffffff" })
  .greyscale()
  .resize(W, H, { kernel: "lanczos3" })
  .blur(K * 0.6)
  .raw()
  .toBuffer({ resolveWithObject: true });
const ink = new Uint8Array(W * H);
for (let i = 0; i < W * H; i++) ink[i] = data[i] < 128 ? 1 : 0;

// Connected components (4-neighbour), each with its own mask.
const label = new Int32Array(W * H);
const comps = [];
for (let s = 0; s < W * H; s++) {
  if (!ink[s] || label[s]) continue;
  const id = comps.length + 1;
  const stack = [s];
  label[s] = id;
  let x0 = W,
    y0 = H,
    x1 = 0,
    y1 = 0,
    n = 0;
  while (stack.length) {
    const p = stack.pop();
    const x = p % W,
      y = (p / W) | 0;
    n++;
    if (x < x0) x0 = x;
    if (x > x1) x1 = x;
    if (y < y0) y0 = y;
    if (y > y1) y1 = y;
    for (const q of [p - 1, p + 1, p - W, p + W])
      if (q >= 0 && q < W * H && ink[q] && !label[q] && Math.abs((q % W) - x) <= 1) {
        label[q] = id;
        stack.push(q);
      }
  }
  if (n > 200) comps.push({ id, x0, y0, x1, y1, n });
}
comps.sort((a, b) => a.y0 - b.y0 || a.x0 - b.x0);
const top = comps.filter((c) => c.y0 < 100 * K).sort((a, b) => a.x0 - b.x0); // m y n a
const low = comps.filter((c) => c.y0 >= 100 * K).sort((a, b) => a.x0 - b.x0); // H E A L T H
if (top.length !== 4 || low.length !== 6) throw new Error(`expected 4 + 6 glyphs, got ${top.length} + ${low.length}`);

// Trace one glyph: by default its own component; `inside(x, y)` (glyph-local px at 8x) can build a new
// letter from parts of others.
const trace = (c, name, inside = (x, y) => label[(c.y0 + y) * W + c.x0 + x] === c.id) => {
  const w = c.x1 - c.x0 + 1,
    h = c.y1 - c.y0 + 1,
    pad = 8;
  const pw = w + pad * 2,
    ph = h + pad * 2,
    rb = Math.ceil(pw / 8);
  const bits = Buffer.alloc(rb * ph);
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) if (inside(x, y)) bits[(y + pad) * rb + ((x + pad) >> 3)] |= 0x80 >> ((x + pad) & 7);
  const pbm = join(tmp, `${name}.pbm`),
    out = join(tmp, `${name}.svg`);
  writeFileSync(pbm, Buffer.concat([Buffer.from(`P4\n${pw} ${ph}\n`), bits]));
  execFileSync("potrace", [pbm, "-s", "-a", "1.2", "-O", "1.0", "-t", "20", "-u", "10", "--flat", "-o", out]);
  const svg = readFileSync(out, "utf8");
  const d = [...svg.matchAll(/ d="([^"]+)"/g)].map((m) => m[1].replace(/\s+/g, " ")).join(" ");
  // potrace draws in 0.1 units with y flipped inside a (pw × ph) box; map it to logo px.
  return { d, tx: (c.x0 - pad) / K, ty: (c.y0 - pad + ph) / K, s: 0.1 / K, w: w / K, x0: c.x0 / K, x1: (c.x1 + 1) / K };
};
const glyph = (g, dx = 0) =>
  `<path transform="translate(${(g.tx + dx).toFixed(3)} ${g.ty.toFixed(3)}) scale(${g.s.toFixed(5)} ${(-g.s).toFixed(5)})" d="${g.d}"/>`;

const myna = top.map((c, i) => trace(c, `myna-${i}`));
const [h1, e, a, l, t, h2] = low;
const HEALTH = [h1, e, a, l, t, h2].map((c, i) => trace(c, `health-${i}`));

// Measure stems: the ink run from a glyph's left edge on a row between its arms.
const run = (c, y) => {
  let x = 0;
  while (x < c.x1 - c.x0 && label[(c.y0 + y) * W + c.x0 + x] !== c.id) x++;
  while (label[(c.y0 + y) * W + c.x0 + x] === c.id) x++;
  return x; // where the first ink run ends, from the glyph's left edge
};
const own = (c) => (x, y) => label[(c.y0 + y) * W + c.x0 + x] === c.id;
const eh = e.y1 - e.y0 + 1,
  stemE = run(e, Math.round(eh * 0.3));
// The E's middle arm ends and its bottom arm starts somewhere below the middle; cut halfway between,
// where the E is only its stem, and finish the F with the H's stem end (rounded on both sides).
let mid = eh >> 1;
while (mid < eh && run(e, mid) > stemE * 1.5) mid++;
let bot = mid;
while (bot < eh && run(e, bot) <= stemE * 1.5) bot++;
const cut = (mid + bot) >> 1;
const hh = h1.y1 - h1.y0 + 1,
  stemH = run(h1, Math.round(hh * 0.2));
const F = trace(e, "F", (x, y) =>
  y < cut ? own(e)(x, y) : x < stemH && own(h1)(x, Math.round(((y + 0.5) * hh) / eh - 0.5)),
);
// The I is the H's left stem: both ends rounded, cut flush where the bar joins.
const I = trace(h1, "I", (x, y) => x < stemH && own(h1)(x, y));
const T = trace(t, "T");

// FIT keeps HEALTH's letter spacing (the E→A gap as the tracking) and ends where HEALTH ends.
const gap = (a.x0 - e.x1 - 1) / K;
const right = HEALTH[5].x1;
const widths = [F.w, stemH / K, T.w];
const total = widths[0] + widths[1] + widths[2] + gap * 2;
let x = right - total;
const fit = [F, I, T].map((g, i) => {
  const out = glyph(g, x - g.x0);
  x += widths[i] + gap;
  return out;
});

// The viewBox is the glyphs' own ink bounds (at 8x, so a hair wider than the 1x measurement).
const all = [...top, ...low];
const bx0 = Math.min(...all.map((c) => c.x0)) / K,
  by0 = Math.min(...all.map((c) => c.y0)) / K;
const bx1 = (Math.max(...all.map((c) => c.x1)) + 1) / K,
  by1 = (Math.max(...all.map((c) => c.y1)) + 1) / K;
const VB = [bx0, by0, bx1 - bx0, by1 - by0].map((v) => +v.toFixed(3)).join(" ");
const wordmark = (glyphs, fill, title) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${VB}" role="img" aria-label="${title}"><title>${title}</title><g fill="${fill}">${glyphs.join("")}</g></svg>\n`;
const out = join(here, "..", "brand");
const NAVY = "#032b84";
const files = {
  "wordmark-health.svg": wordmark(
    [...myna, ...HEALTH].map((g) => glyph(g)),
    NAVY,
    "Myna Health",
  ),
  "wordmark-health-black.svg": wordmark(
    [...myna, ...HEALTH].map((g) => glyph(g)),
    "#000000",
    "Myna Health",
  ),
  "wordmark-health-white.svg": wordmark(
    [...myna, ...HEALTH].map((g) => glyph(g)),
    "#ffffff",
    "Myna Health",
  ),
  "wordmark-fit.svg": wordmark([...myna.map((g) => glyph(g)), ...fit], NAVY, "Myna Fit"),
  "wordmark-fit-white.svg": wordmark([...myna.map((g) => glyph(g)), ...fit], "#ffffff", "Myna Fit"),
};
for (const [n, s] of Object.entries(files)) writeFileSync(join(out, n), s);
rmSync(tmp, { recursive: true });
console.log(Object.keys(files).join("\n"), { VB, stemE: stemE / K, stemH: stemH / K, cut: cut / K, gap });
