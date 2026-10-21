// Builds lab/myna-icon-finalists.html: the two finalist SVG icon concepts (B, D) for Myna Health (Phase 1 of
// lab/myna-mascot-prompt.md). Self-contained page: the existing wordmark PNGs are embedded as-is
// (never redrawn). Colours are the site's own tokens (apps/site/src/styles/global.css, P-011).
//   node lab/build-icon-finalists.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const pub = join(here, "..", "apps", "site", "public");
const png = (f) => `data:image/png;base64,${readFileSync(join(pub, f)).toString("base64")}`;
const WORD = png("logo.png"); // #000000 on transparent, 480×197
const WORD_WHITE = png("logo-white.png"); // #ffffff

// Brand tokens, read from apps/site/src/styles/global.css (@theme) and product.config.ts.
const C = {
  navy: "#032b84",
  electric: "#113bfe",
  soft: "#dae7fc",
  cyan: "#24dde2",
  sky: "#5a9bff",
  beige: "#fbf6f0",
  ink2: "#11163a",
};

// Each mark is drawn on a 64×64 grid with CSS custom properties, so one drawing serves light and
// dark grounds: --ink (main shape), --a1 (cyan accent), --a2 (second accent), --a3 (third accent).
const concepts = [
  {
    id: "B",
    name: "Kapsul burung",
    idea: "Two shapes straight from the capsule supergraphic: a capsule body and a round head set on the diagonal, with a small cyan pill for a beak. A bird by suggestion, not by drawing.",
    alive:
      "Eyes open on the round head; the pill beak is the signature part. Signature motion: a little hop, the head bobbing forward like a myna on the ground, and the beak opening to talk.",
    risk: "Risk: at 16 px the head and body read as two separate dots.",
    svg: `<rect x="12" y="26" width="20" height="32" rx="10" fill="var(--ink)"/>
      <circle cx="41" cy="17.5" r="10" fill="var(--ink)"/>
      <rect x="46" y="14" width="13" height="7" rx="3.5" fill="var(--a1)"/>`,
  },
  {
    id: "D",
    name: "Lengkung m",
    idea: "The first letter as a monoline 'm' with round ends, in the spirit of the wordmark's strokes (a new monogram, not a copy of the wordmark), plus the cyan dot from today's favicon.",
    alive:
      "The two arches are already the shape of happy eyes: pupils appear under them, and the dot becomes a beak. Signature motion: 'Kedip', the arches squeeze and stretch like a slow, happy blink.",
    svg: `<path d="M9 50 V30 A9 9 0 0 1 27 30 V50 M27 30 A9 9 0 0 1 45 30 V50" fill="none" stroke="var(--ink)" stroke-width="8.5" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="54.5" cy="45.5" r="5.5" fill="var(--a1)"/>`,
  },
];

const light = `--ink:${C.navy};--a1:${C.cyan};--a2:${C.electric};--a3:${C.sky}`;
const dark = `--ink:#ffffff;--a1:${C.cyan};--a2:${C.sky};--a3:${C.sky}`;
// App icon tile: navy ground, white mark (the dark palette), mark at 62% of the tile.
const tile = (c, size, rx = 0.225) =>
  `<svg width="${size}" height="${size}" viewBox="0 0 64 64" style="${dark}" aria-label="${c.name}, ${size} px"><rect width="64" height="64" rx="${64 * rx}" fill="${C.navy}"/><g transform="translate(12.16 12.16) scale(.62)">${c.svg}</g></svg>`;
const mark = (c, size, palette) =>
  `<svg width="${size}" height="${size}" viewBox="0 0 64 64" style="${palette}" aria-label="${c.name}">${c.svg}</svg>`;

const card = (c) => `
<section class="concept" id="concept-${c.id}">
  <header><span class="letter">${c.id}</span><div><h2>${c.name}</h2><p>${c.idea}</p></div></header>
  <div class="panels">
    ${["light", "dark"]
      .map(
        (g) => `<div class="panel panel--${g}">
      <div class="lbl">${g === "light" ? "Light ground" : "Dark ground"}</div>
      <div class="row sizes">
        <figure>${g === "light" ? tile(c, 16) : tile(c, 16)}<figcaption>16</figcaption></figure>
        <figure>${tile(c, 32)}<figcaption>32</figcaption></figure>
        <figure>${tile(c, 64)}<figcaption>64</figcaption></figure>
        <figure>${tile(c, 180)}<figcaption>180 app</figcaption></figure>
        <figure class="big">${tile(c, 512).replace('width="512" height="512"', 'width="256" height="256"')}<figcaption>512 (preview scaled)</figcaption></figure>
      </div>
      <div class="row">
        <figure>${mark(c, 64, g === "light" ? light : dark)}<figcaption>mark, no tile</figcaption></figure>
        <figure class="px"><canvas data-px="${c.id}" data-ground="${g}" width="16" height="16"></canvas><figcaption>16 px favicon, real pixels ×4</figcaption></figure>
        <figure class="lockup">${mark(c, 46, g === "light" ? light : dark)}<img src="${g === "light" ? WORD : WORD_WHITE}" alt="Myna Health wordmark" height="46"><figcaption>lockup with the existing wordmark</figcaption></figure>
      </div>
    </div>`,
      )
      .join("")}
  </div>
  <p class="alive"><b>How it comes alive:</b> ${c.alive}${c.risk ? ` <em>${c.risk}</em>` : ""}</p>
</section>`;

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Myna icon finalists</title>
<style>
  *{box-sizing:border-box}
  html,body{margin:0}
  body{font-family:Montserrat,system-ui,-apple-system,"Segoe UI",sans-serif;background:#eceef3;color:#11163a;padding:40px}
  .top{max-width:1520px;margin:0 auto 28px}
  .top h1{margin:0;font-size:30px;letter-spacing:-.02em;color:${C.navy}}
  .top p{margin:8px 0 0;color:#555c67;max-width:90ch;line-height:1.55}
  .tokens{display:flex;flex-wrap:wrap;gap:8px;margin-top:14px}
  .tokens span{display:inline-flex;align-items:center;gap:6px;font:500 12px/1 ui-monospace,Menlo,monospace;background:#fff;border-radius:999px;padding:6px 10px}
  .tokens i{width:14px;height:14px;border-radius:50%;display:inline-block;box-shadow:inset 0 0 0 1px rgba(0,0,0,.12)}
  .grid{max-width:1520px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:24px}
  .concept{background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 1px 2px rgba(0,0,0,.06)}
  .concept header{display:flex;gap:14px;padding:22px 24px 6px;align-items:flex-start}
  .letter{flex:none;width:34px;height:34px;border-radius:50%;background:${C.navy};color:#fff;font-weight:700;display:grid;place-items:center}
  h2{margin:2px 0 4px;font-size:20px;letter-spacing:-.015em;color:${C.navy}}
  header p{margin:0;color:#555c67;font-size:14px;line-height:1.5}
  .panels{display:grid;grid-template-columns:1fr 1fr}
  .panel{padding:18px 20px 22px;display:grid;gap:18px;align-content:start}
  .panel--light{background:${C.beige}}
  .panel--dark{background:${C.ink2};color:#fff}
  .lbl{font:600 11px/1 Montserrat,system-ui,sans-serif;letter-spacing:.08em;text-transform:uppercase;opacity:.6}
  .row{display:flex;flex-wrap:wrap;align-items:flex-end;gap:14px}
  figure{margin:0;display:grid;justify-items:center;gap:6px}
  figcaption{font-size:10.5px;opacity:.6;white-space:nowrap}
  .sizes .big svg{width:128px;height:128px}
  .px canvas{width:64px;height:64px;image-rendering:pixelated;border-radius:6px;box-shadow:inset 0 0 0 1px rgba(0,0,0,.1)}
  .lockup{grid-template-columns:auto auto;align-items:center;column-gap:12px}
  .lockup figcaption{grid-column:1/-1}
  .alive{margin:0;padding:16px 24px 22px;font-size:14px;line-height:1.55;color:#333}
  .alive b{color:${C.navy}}
  .alive em{display:block;margin-top:6px;color:#9a3412;font-style:normal}
  @media (max-width:1100px){.grid{grid-template-columns:1fr}}
  @media (max-width:640px){body{padding:16px}.panels{grid-template-columns:1fr}}
</style>
</head>
<body>
<div class="top">
  <h1>Myna Health: icon finalists B and D</h1>
  <p>Two hand-made SVG marks, each built to become the mascot later: the still icon already holds the place for the eyes and one signature part. Shown as app tiles (16, 32, 64, 180, 512), as the bare mark, as real 16 px pixels, and next to the existing wordmark (the PNG file itself, not redrawn). No medical cross, heartbeat or leaf-in-a-heart.</p>
  <div class="tokens">${Object.entries({
    navy: C.navy,
    electric: C.electric,
    cyan: C.cyan,
    sky: C.sky,
    soft: C.soft,
    beige: C.beige,
    wordmark: "#000000",
  })
    .map(([k, v]) => `<span><i style="background:${v}"></i>${k} ${v}</span>`)
    .join("")}</div>
</div>
<div class="grid">${concepts.map(card).join("")}</div>
<script>
// Rasterise each tile at a true 16x16 to judge the favicon, then show it ×4 with nearest-neighbour.
document.querySelectorAll("canvas[data-px]").forEach(function (cv) {
  var sec = document.getElementById("concept-" + cv.dataset.px);
  var svg = sec.querySelector(".sizes figure svg").cloneNode(true);
  svg.setAttribute("width", "16"); svg.setAttribute("height", "16");
  svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  var img = new Image();
  img.onload = function () { var x = cv.getContext("2d"); x.clearRect(0, 0, 16, 16); x.drawImage(img, 0, 0, 16, 16); };
  img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg.outerHTML.replace(/var\\(--ink\\)/g, "#ffffff").replace(/var\\(--a1\\)/g, "${C.cyan}").replace(/var\\(--a2\\)/g, "${C.sky}").replace(/var\\(--a3\\)/g, "${C.sky}"));
});
</script>
</body>
</html>
`;
writeFileSync(join(here, "myna-icon-finalists.html"), html);
console.log(
  `lab/myna-icon-finalists.html: ${Math.round(Buffer.byteLength(html) / 1024)} KB, ${concepts.length} concepts`,
);
