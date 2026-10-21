// Builds lab/myna-fit-logo-options.html: the new Myna Fit lockup (P-020 badge + the vector "myna FIT"
// wordmark from lab/wordmark/build-wordmark.mjs) in three colourings, in a Myna Fit header, a dark
// ground and as the app icon, next to the old Myna Fit logo.
//   node lab/build-fit-logo-options.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const brand = (f) => readFileSync(join(here, "brand", f), "utf8");
const NAVY = "#032b84",
  ELECTRIC = "#113bfe",
  CYAN = "#24dde2",
  WHITE = "#ffffff";
const M = "M9 50V30A9 9 0 0 1 27 30V50M27 30A9 9 0 0 1 45 30V50";
const CX = 4.75 + 55.25 / 2,
  CY = 16.75 + 37.5 / 2;
const badge = (fill, ink) =>
  `<circle cx="32" cy="32" r="32" fill="${fill}"/><g transform="translate(32 32) scale(.6) translate(${-CX} ${-CY})"><path d="${M}" fill="none" stroke="${ink}" stroke-width="8.5" stroke-linecap="round" stroke-linejoin="round"/><circle cx="54.5" cy="45.5" r="5.5" fill="${CYAN}"/></g>`;
const tile = (fill) =>
  `<svg aria-hidden="true" viewBox="0 0 64 64" width="64" height="64"><rect width="64" height="64" rx="14.4" fill="${fill}"/><g transform="translate(32 32) scale(.62) translate(${-CX} ${-CY})"><path d="${M}" fill="none" stroke="#fff" stroke-width="8.5" stroke-linecap="round" stroke-linejoin="round"/><circle cx="54.5" cy="45.5" r="5.5" fill="${CYAN}"/></g></svg>`;
const wm = (file, fill) => {
  const s = brand(file);
  return s.slice(s.indexOf("<g fill="), s.lastIndexOf("</svg>")).replace(/<g fill="[^"]+"/, `<g fill="${fill}"`);
};
// Lockup on the wordmark's own grid (ink 32..458 × 34..170): badge as tall as the ink, 30% gap.
const lockup = (file, word, circle, ink, h) => {
  const B = 136,
    gap = Math.round(B * 0.3),
    w = B + gap + 426;
  return `<svg aria-hidden="true" viewBox="0 0 ${w} ${B}" style="height:${h}px;width:auto;display:block"><g transform="scale(${B / 64})">${badge(circle, ink)}</g><g transform="translate(${B + gap - 32} -34)">${wm(file, word)}</g></svg>`;
};
const options = [
  {
    name: "A. Navy, satu keluarga dengan Myna Health",
    note: "Lingkaran dan wordmark navy, sama persis dengan mynahealth.id. Biru elektrik tetap khusus tombol, jadi logo tidak berebut perhatian dengan CTA.",
    word: NAVY,
    circle: NAVY,
    tile: NAVY,
  },
  {
    name: "B. Biru elektrik semua",
    note: "Paling dekat dengan logo Myna Fit lama dan warna tombol Fit. Tapi logo jadi sewarna tombol, dan beda dari Myna Health.",
    word: ELECTRIC,
    circle: ELECTRIC,
    tile: ELECTRIC,
  },
  {
    name: "C. Wordmark navy, lingkaran biru elektrik",
    note: "Kompromi: namanya keluarga Myna Health, lingkarannya menandai produk Fit. Ikon aplikasi jadi biru elektrik.",
    word: NAVY,
    circle: ELECTRIC,
    tile: ELECTRIC,
  },
];
const old = `data:image/png;base64,${readFileSync("/Users/erdipratama/myna-fit/apps/app/public/brand/myna-fit-logo.png").toString("base64")}`;
const html = `<!doctype html>
<html lang="id">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Logo Myna Fit</title>
<style>
  *{box-sizing:border-box}html,body{margin:0}
  body{font-family:"Plus Jakarta Sans",Montserrat,system-ui,sans-serif;background:#eceef3;color:#11163a;padding:32px}
  .wrap{max-width:1200px;margin:0 auto}
  h1{margin:0;font-size:28px;color:${NAVY}}
  .lede{color:#555c67;max-width:90ch;line-height:1.55}
  .o{background:#fff;border-radius:20px;overflow:hidden;margin-top:20px}
  .o h2{margin:0;padding:18px 22px 4px;font-size:20px;color:${NAVY}}
  .o p{margin:0;padding:0 22px 14px;font-size:14px;line-height:1.5;color:#555c67}
  .row{display:grid;grid-template-columns:1.4fr 1fr 1fr auto;gap:0}
  .cell{padding:22px;display:flex;align-items:center;justify-content:center;min-height:120px}
  .fit{background:#F7F5F3}.dark{background:${NAVY}}.card{background:#fff}
  .hdr{display:flex;align-items:center;justify-content:space-between;width:100%;background:#fff;border-radius:999px;padding:12px 12px 12px 20px;box-shadow:0 8px 24px rgb(3 43 132/.08)}
  .btn{background:${ELECTRIC};color:#fff;font-weight:700;font-size:14px;border-radius:16px;padding:12px 18px}
  .old{background:#fff;border-radius:20px;padding:18px 22px;margin-top:20px;display:flex;gap:24px;align-items:center}
  @media (max-width:900px){.row{grid-template-columns:1fr}body{padding:16px}}
</style>
</head>
<body><div class="wrap">
<h1>Logo baru Myna Fit</h1>
<p class="lede">Wordmark Myna Health dijadikan vektor (trace dari satu-satunya sumber, PNG 480 px, selisih 0,02% piksel), lalu HEALTH diganti FIT yang dirakit dari huruf HEALTH sendiri: F dari E tanpa lengan bawah, I dari batang L, T apa adanya. Lingkaran dan m sama dengan mynahealth.id (P-020). Kolom: header Myna Fit dengan tombol, di atas navy, ukuran kecil, dan ikon aplikasi.</p>
<div class="old"><b>Logo lama</b><img src="${old}" alt="" style="height:40px"><span style="color:#555c67">Ini yang diganti.</span></div>
${options
  .map(
    (o) => `<section class="o"><h2>${o.name}</h2><p>${o.note}</p>
  <div class="row">
    <div class="cell fit"><div class="hdr">${lockup("wordmark-fit.svg", o.word, o.circle, WHITE, 34)}<span class="btn">Mulai latihan</span></div></div>
    <div class="cell dark">${lockup("wordmark-fit-white.svg", WHITE, WHITE, o.circle === NAVY ? NAVY : o.circle, 34)}</div>
    <div class="cell card">${lockup("wordmark-fit.svg", o.word, o.circle, WHITE, 22)}</div>
    <div class="cell fit">${tile(o.tile)}</div>
  </div></section>`,
  )
  .join("")}
<section class="o"><h2>Myna Health dengan wordmark vektor</h2><p>Sekaligus menutup catatan lama: wordmark Myna Health tidak lagi hitam, tapi navy dan vektor.</p>
  <div class="row"><div class="cell fit"><div class="hdr">${lockup("wordmark-health.svg", NAVY, NAVY, WHITE, 34)}<span class="btn">Hubungi kami</span></div></div>
  <div class="cell dark">${lockup("wordmark-health-white.svg", WHITE, WHITE, NAVY, 34)}</div><div class="cell card">${lockup("wordmark-health.svg", NAVY, NAVY, WHITE, 22)}</div><div class="cell fit">${tile(NAVY)}</div></div></section>
</div></body></html>
`;
writeFileSync(join(here, "myna-fit-logo-options.html"), html);
console.log("lab/myna-fit-logo-options.html", Math.round(html.length / 1024), "KB");
