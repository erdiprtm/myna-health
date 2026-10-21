// Builds the Myna Fit brand files into lab/brand/myna-fit/ (P-022, option C, chosen by Erdi): the
// Myna badge in electric blue with the navy vector "myna FIT" wordmark. Run after
// lab/wordmark/build-wordmark.mjs. The wordmark paths are reused as they are, only recoloured.
//   node lab/build-fit-brand.mjs
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "/Users/erdipratama/reverse-brand/node_modules/sharp/dist/index.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const out = join(here, "brand", "myna-fit");
mkdirSync(out, { recursive: true });
const NAVY = "#032b84",
  ELECTRIC = "#113bfe",
  CYAN = "#24dde2",
  WHITE = "#ffffff";
const M = "M9 50V30A9 9 0 0 1 27 30V50M27 30A9 9 0 0 1 45 30V50";
const CX = 4.75 + 55.25 / 2,
  CY = 16.75 + 37.5 / 2;
const mark = (ink, scale) =>
  `<g transform="translate(32 32) scale(${scale}) translate(${-CX} ${-CY})"><path d="${M}" fill="none" stroke="${ink}" stroke-width="8.5" stroke-linecap="round" stroke-linejoin="round"/><circle cx="54.5" cy="45.5" r="5.5" fill="${CYAN}"/></g>`;
const badge = (fill, ink) => `<circle cx="32" cy="32" r="32" fill="${fill}"/>${mark(ink, 0.6)}`;
const svg = (viewBox, body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" role="img" aria-label="Myna Fit"><title>Myna Fit</title>${body}</svg>\n`;
const WORD = readFileSync(join(here, "brand", "wordmark-fit.svg"), "utf8");
const [vx, vy, vw, vh] = WORD.match(/viewBox="([^"]+)"/)[1]
  .split(" ")
  .map(Number); // the wordmark's ink box
const word = (fill) =>
  WORD.slice(WORD.indexOf("<g fill="), WORD.lastIndexOf("</svg>")).replace(/<g fill="[^"]+"/, `<g fill="${fill}"`);
// Lockup on the wordmark's grid: the badge as tall as the wordmark's ink, a 30% gap.
const B = vh,
  GAP = +(B * 0.3).toFixed(3),
  LW = +(B + GAP + vw).toFixed(3);
const lockup = (circle, ink, wordFill) =>
  svg(
    `0 0 ${LW} ${B}`,
    `<g transform="scale(${B / 64})">${badge(circle, ink)}</g><g transform="translate(${(B + GAP - vx).toFixed(3)} ${-vy})">${word(wordFill)}</g>`,
  );
const files = {
  "logo-badge.svg": svg("0 0 64 64", badge(ELECTRIC, WHITE)),
  "logo-badge-white.svg": svg("0 0 64 64", badge(WHITE, ELECTRIC)), // on navy or dark grounds
  "lockup.svg": lockup(ELECTRIC, WHITE, NAVY),
  "lockup-white.svg": lockup(WHITE, ELECTRIC, WHITE), // on navy or dark grounds
  "wordmark.svg": svg(`${vx} ${vy} ${vw} ${vh}`, word(NAVY)),
  "wordmark-white.svg": svg(`${vx} ${vy} ${vw} ${vh}`, word(WHITE)),
  "app-icon.svg": svg("0 0 64 64", `<rect width="64" height="64" rx="14.4" fill="${ELECTRIC}"/>${mark(WHITE, 0.62)}`),
  // Full bleed, also safe as a maskable icon: the mark's farthest ink is 20.7 units from the centre,
  // inside the 25.6-unit circle (80%) that platforms keep.
  "app-icon-square.svg": svg("0 0 64 64", `<rect width="64" height="64" fill="${ELECTRIC}"/>${mark(WHITE, 0.62)}`),
  "favicon.svg": svg("0 0 64 64", `<rect width="64" height="64" rx="14.4" fill="${ELECTRIC}"/>${mark(WHITE, 0.62)}`),
};
for (const [n, s] of Object.entries(files)) writeFileSync(join(out, n), s);
const png = (name, file, w, h = w) =>
  sharp(Buffer.from(files[name]), { density: 600 })
    .resize(w, h, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(join(out, file));
await png("app-icon-square.svg", "app-icon-180.png", 180);
await png("app-icon-square.svg", "app-icon-192.png", 192);
await png("app-icon-square.svg", "app-icon-512.png", 512);
await png("app-icon-square.svg", "app-icon-1024.png", 1024); // Expo assets/icon.png
await png("favicon.svg", "favicon-32.png", 32);
await png("favicon.svg", "favicon-16.png", 16);
await png("lockup.svg", "lockup-1200.png", 1200, Math.round((1200 * B) / LW));
console.log(`lab/brand/myna-fit: ${Object.keys(files).length} SVG + 7 PNG`);
