// Builds the Myna Health icon deliverables (concept D, "lengkung m") into lab/brand/.
//   node lab/build-brand.mjs
// The wordmark is the existing PNG (apps/site/public/logo.png / logo-white.png), embedded as-is,
// never redrawn. Colours are the site's tokens (P-011): navy #032b84, cyan #24dde2.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "/Users/erdipratama/reverse-brand/node_modules/sharp/dist/index.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const out = join(here, "brand");
const pub = join(here, "..", "apps", "site", "public");
mkdirSync(out, { recursive: true });

const NAVY = "#032b84";
const CYAN = "#24dde2";
const WHITE = "#ffffff";

// The mark on its 64-unit grid. Stroke 8.5 on a 37.5-unit arch height = 0.227, the same weight as
// the wordmark's own "m" (19 px stems on an 84 px x-height = 0.226).
const M = "M9 50V30A9 9 0 0 1 27 30V50M27 30A9 9 0 0 1 45 30V50";
const DOT = { cx: 54.5, cy: 45.5, r: 5.5 };
// Ink bounds: x 4.75 (stroke edge) to 60 (dot edge), y 16.75 (arch top) to 54.25 (stem ends).
const BOX = { x: 4.75, y: 16.75, w: 55.25, h: 37.5 };
const CENTER = { x: BOX.x + BOX.w / 2, y: BOX.y + BOX.h / 2 };

const markG = (ink) =>
  `<path d="${M}" fill="none" stroke="${ink}" stroke-width="8.5" stroke-linecap="round" stroke-linejoin="round"/><circle cx="${DOT.cx}" cy="${DOT.cy}" r="${DOT.r}" fill="${CYAN}"/>`;
const svg = (viewBox, body, title, w, h) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}"${w ? ` width="${w}" height="${h}"` : ""} role="img" aria-label="${title}"><title>${title}</title>${body}</svg>\n`;

// Mark centred in a 64 tile at 62% (same proportion as the concept sheets).
const inTile = (ink) =>
  `<g transform="translate(32 32) scale(.62) translate(${-CENTER.x} ${-CENTER.y})">${markG(ink)}</g>`;

const files = {
  "logo-mark.svg": svg(`${BOX.x} ${BOX.y} ${BOX.w} ${BOX.h}`, markG(NAVY), "Myna Health"),
  "logo-mark-white.svg": svg(`${BOX.x} ${BOX.y} ${BOX.w} ${BOX.h}`, markG(WHITE), "Myna Health"),
  // Rounded tile for display (web, docs). Platforms that mask icons get the square version.
  "app-icon.svg": svg(
    "0 0 64 64",
    `<rect width="64" height="64" rx="14.4" fill="${NAVY}"/>${inTile(WHITE)}`,
    "Myna Health",
  ),
  "app-icon-square.svg": svg(
    "0 0 64 64",
    `<rect width="64" height="64" fill="${NAVY}"/>${inTile(WHITE)}`,
    "Myna Health",
  ),
  "favicon.svg": svg(
    "0 0 64 64",
    `<rect width="64" height="64" rx="14.4" fill="${NAVY}"/>${inTile(WHITE)}`,
    "Myna Health",
  ),
};

// Horizontal lockup: the mark's arches match the wordmark's "m" (rows 34 to 118 of the 480x197
// PNG, so 84 px), its left edge at 0, a gap of two stem widths (38 px), then the wordmark.
const S = 84 / BOX.h; // px per mark unit
const markW = BOX.w * S;
const GAP = 38;
const WORD_INK = { x0: 32, x1: 457, y0: 34, y1: 169 }; // measured ink bounds of logo.png
const wordX = markW + GAP - WORD_INK.x0;
const lockW = +(markW + GAP + (WORD_INK.x1 - WORD_INK.x0 + 1)).toFixed(1);
const lockH = WORD_INK.y1 - WORD_INK.y0 + 1;
const lockup = (ink, png) => {
  const data = readFileSync(join(pub, png)).toString("base64");
  return svg(
    `0 ${WORD_INK.y0} ${lockW} ${lockH}`,
    `<g transform="translate(${(-BOX.x * S).toFixed(2)} ${(WORD_INK.y0 - BOX.y * S).toFixed(2)}) scale(${S.toFixed(4)})">${markG(ink)}</g><image href="data:image/png;base64,${data}" x="${wordX.toFixed(2)}" y="0" width="480" height="197"/>`,
    "Myna Health",
  );
};
files["lockup-horizontal.svg"] = lockup(NAVY, "logo.png");
files["lockup-horizontal-white.svg"] = lockup(WHITE, "logo-white.png");

for (const [name, text] of Object.entries(files)) writeFileSync(join(out, name), text);

// PNG exports.
const png = async (svgName, file, w, h, bg) => {
  const img = sharp(Buffer.from(files[svgName]), { density: 600 }).resize(w, h, {
    fit: "contain",
    background: bg ?? { r: 0, g: 0, b: 0, alpha: 0 },
  });
  await img.png().toFile(join(out, file));
};
await png("app-icon-square.svg", "app-icon-180.png", 180, 180); // apple-touch-icon: full bleed, iOS rounds it
await png("app-icon-square.svg", "app-icon-512.png", 512, 512); // PWA / store: platforms mask it
await png("app-icon.svg", "app-icon-rounded-512.png", 512, 512); // for decks and docs
await png("favicon.svg", "favicon-32.png", 32, 32);
await png("favicon.svg", "favicon-16.png", 16, 16);
await png("logo-mark.svg", "logo-mark-512.png", 512, Math.round((512 * BOX.h) / BOX.w));
await png("lockup-horizontal.svg", "lockup-horizontal-1200.png", 1200, Math.round((1200 * lockH) / lockW));
await png("lockup-horizontal-white.svg", "lockup-horizontal-white-1200.png", 1200, Math.round((1200 * lockH) / lockW));

// Site copies (apps/site/public). lab/brand stays the source of truth; never edit the copies.
const site = join(pub, "brand");
mkdirSync(site, { recursive: true });
for (const f of ["logo-mark.svg", "logo-mark-white.svg", "app-icon-180.png", "app-icon-512.png", "myna-buddy.js"])
  writeFileSync(join(site, f), readFileSync(join(out, f)));
writeFileSync(join(pub, "favicon.svg"), files["favicon.svg"]);

console.log(
  Object.keys(files)
    .concat([
      "app-icon-180.png",
      "app-icon-512.png",
      "app-icon-rounded-512.png",
      "favicon-32.png",
      "favicon-16.png",
      "logo-mark-512.png",
      "lockup-horizontal-1200.png",
      "lockup-horizontal-white-1200.png",
    ])
    .join("\n"),
);
