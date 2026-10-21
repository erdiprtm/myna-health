// Builds lab/myna-container-options.html: should the "lengkung m" sit in a container, so the lockup
// stops reading as "m. myna"? Current lockup vs filled circle vs filled squircle vs outline ring, at
// the real nav and footer sizes (P-019 follow-up). The wordmark is the site's own logo PNG.
//   node lab/build-container-options.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
// Embedded so the sheet is one self-contained file.
const png = (f) =>
  `data:image/png;base64,${readFileSync(join(here, "..", "apps", "site", "public", f)).toString("base64")}`;
const LOGO = { "logo.png": png("logo.png"), "logo-white.png": png("logo-white.png") };
const NAVY = "#032b84",
  CYAN = "#24dde2",
  WHITE = "#ffffff";
const M = "M9 50V30A9 9 0 0 1 27 30V50M27 30A9 9 0 0 1 45 30V50";
const BOX = { x: 4.75, y: 16.75, w: 55.25, h: 37.5 };
const CX = BOX.x + BOX.w / 2,
  CY = BOX.y + BOX.h / 2;
const mark = (ink, sw = 8.5) =>
  `<path d="${M}" fill="none" stroke="${ink}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"/><circle cx="54.5" cy="45.5" r="5.5" fill="${CYAN}"/>`;
const inside = (ink, scale) =>
  `<g transform="translate(32 32) scale(${scale}) translate(${-CX} ${-CY})">${mark(ink)}</g>`;

// Each option draws a 64-unit square container. `dark` is the footer (navy ground): a navy container
// would vanish there, so it flips to white with a navy m.
const options = [
  {
    id: "now",
    name: "Sekarang (tanpa wadah)",
    note: 'Yang live hari ini. Lengkungnya sama dengan huruf m di wordmark, jadi terbaca seperti huruf tambahan: "m. myna".',
    plain: true,
  },
  {
    id: "circle",
    name: "A. Lingkaran penuh",
    note: "Navy penuh, m putih, titik cyan. Batas paling tegas dan paling lembut; senada dengan titik dan kapsul brand.",
    draw: (dark) => `<circle cx="32" cy="32" r="32" fill="${dark ? WHITE : NAVY}"/>${inside(dark ? NAVY : WHITE, 0.6)}`,
  },
  {
    id: "squircle",
    name: "B. Squircle penuh",
    note: "Sama persis dengan favicon dan app icon. Satu keluarga aset, tapi terasa lebih seperti ikon aplikasi.",
    draw: (dark) =>
      `<rect width="64" height="64" rx="14.4" fill="${dark ? WHITE : NAVY}"/>${inside(dark ? NAVY : WHITE, 0.62)}`,
  },
  {
    id: "ring",
    name: "C. Garis lingkaran",
    note: "Ringan, tapi di ukuran navbar garisnya jadi noise dan batasnya tetap lemah.",
    draw: (dark) =>
      `<circle cx="32" cy="32" r="29.5" fill="none" stroke="${dark ? WHITE : NAVY}" stroke-width="5"/>${inside(dark ? WHITE : NAVY, 0.5)}`,
  },
];

// Wordmark PNG is 480x197 with ink rows 34-169 and ink columns from 32. At a rendered height h the ink
// is (135/197)h tall and starts (34/197)h from the top. The container is as tall as that ink, and
// sits a fixed gap before the ink's left edge.
const lockup = (o, h, dark) => {
  const k = h / 197;
  const inkTop = 34 * k,
    inkH = 136 * k,
    inkLeft = 32 * k;
  const logo = dark ? "logo-white.png" : "logo.png";
  const gap = o.plain ? 38 * k : 0.3 * inkH;
  const word = `<img src="${LOGO[logo]}" alt="" style="height:${h}px;width:auto;margin-left:${(gap - inkLeft).toFixed(2)}px">`;
  if (o.plain) {
    // The shipped nav: mark height = the wordmark's "m" (rows 34-118), gap of two stem widths.
    const mh = 84 * k;
    return `<span class="lock"><svg aria-hidden="true" viewBox="${BOX.x} ${BOX.y} ${BOX.w} ${BOX.h}" style="height:${mh.toFixed(2)}px;margin-top:${inkTop.toFixed(2)}px">${mark(dark ? WHITE : NAVY)}</svg>${word}</span>`;
  }
  return `<span class="lock"><svg aria-hidden="true" viewBox="0 0 64 64" style="height:${inkH.toFixed(2)}px;margin-top:${inkTop.toFixed(2)}px">${o.draw(dark)}</svg>${word}</span>`;
};
const icon = (o, px, dark) =>
  o.plain
    ? `<svg aria-hidden="true" viewBox="0 0 64 64" width="${px}" height="${px}"><rect width="64" height="64" rx="14.4" fill="${NAVY}"/>${inside(WHITE, 0.62)}</svg>`
    : `<svg aria-hidden="true" viewBox="0 0 64 64" width="${px}" height="${px}">${o.draw(dark)}</svg>`;

const navBar = (o, h) =>
  `<div class="nav"><div class="pill">${lockup(o, h, false)}<span class="links"><i></i><i></i><i></i><b>Hubungi kami</b></span></div></div>`;

const html = `<!doctype html>
<html lang="id">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Wadah ikon Myna</title>
<style>
  *{box-sizing:border-box}html,body{margin:0}
  body{font-family:Montserrat,system-ui,-apple-system,"Segoe UI",sans-serif;background:#eceef3;color:#11163a;padding:32px}
  .wrap{max-width:1280px;margin:0 auto}
  h1{margin:0;font-size:28px;letter-spacing:-.02em;color:${NAVY}}
  .lede{color:#555c67;max-width:90ch;line-height:1.55}
  .grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:20px;margin-top:20px}
  .o{background:#fff;border-radius:20px;overflow:hidden}
  .o h2{margin:0;padding:18px 22px 4px;font-size:20px;color:${NAVY}}
  .o p{margin:0;padding:0 22px 14px;font-size:14px;line-height:1.5;color:#555c67}
  .lab{font-size:11px;text-transform:uppercase;letter-spacing:.08em;opacity:.55;padding:10px 22px 0}
  .nav{background:#fbf6f0;padding:14px 16px}
  .pill{display:flex;align-items:center;justify-content:space-between;height:64px;background:#fff;border:1px solid rgb(3 43 132/.1);border-radius:999px;padding:0 10px 0 28px;box-shadow:0 1px 2px rgb(3 43 132/.05),0 8px 24px rgb(3 43 132/.08)}
  .pill.m{height:56px;padding-left:20px}
  .lock{display:inline-flex;align-items:flex-start;flex:none}
  .lock svg{display:block;flex:none;width:auto}
  .links{display:flex;gap:18px;align-items:center}
  .links i{display:block;width:44px;height:8px;border-radius:4px;background:#11163a;opacity:.12}
  .links b{font-size:13px;background:#113bfe;color:#fff;border-radius:999px;padding:12px 18px}
  .zoom{background:#fbf6f0;padding:22px;display:flex;justify-content:center}
  .zoom .lock{transform:scale(3);transform-origin:center;margin:40px 0}
  .foot{background:${NAVY};padding:22px 28px;display:flex;align-items:center;gap:24px}
  .fam{display:flex;gap:16px;align-items:flex-end;padding:14px 22px 20px;background:#fff}
  .fam figure{margin:0;display:grid;justify-items:center;gap:4px}
  .fam figcaption{font-size:11px;opacity:.55}
  .mina{background:#fff;border-radius:20px;padding:18px 24px;margin-top:20px;line-height:1.55}
  .mina h2{margin:0 0 6px;color:${NAVY};font-size:20px}
  @media (max-width:640px){.links i{display:none}}
  @media (max-width:980px){.grid{grid-template-columns:1fr}body{padding:16px}}
</style>
</head>
<body><div class="wrap">
<h1>Wadah untuk ikon m?</h1>
<p class="lede">Ukuran navbar asli (desktop, wordmark 40 px; mobile, 36 px), diperbesar 3×, footer navy, dan keluarga aset (favicon 16 dan 32, app icon). Pada pilihan berwadah, tinggi wadah sama dengan tinggi seluruh wordmark (myna + HEALTH), dan jarak ke wordmark 30% dari tinggi wadah. Di footer navy, wadah dibalik menjadi putih dengan m navy.</p>
<div class="grid">${options
  .map(
    (o) => `<section class="o" id="${o.id}"><h2>${o.name}</h2><p>${o.note}</p>
  <div class="lab">Navbar desktop</div>${navBar(o, 40)}
  <div class="lab">Navbar mobile</div><div class="nav"><div class="pill m">${lockup(o, 36, false)}<span class="links"><b>☰</b></span></div></div>
  <div class="lab">Diperbesar 3×</div><div class="zoom">${lockup(o, 40, false)}</div>
  <div class="lab">Footer</div><div class="foot">${lockup(o, 36, true)}</div>
  <div class="lab">Keluarga aset</div><div class="fam">${[16, 32, 64]
    .map((s) => `<figure>${icon(o, s, false)}<figcaption>${s}</figcaption></figure>`)
    .join("")}</div>
</section>`,
  )
  .join("")}</div>
<section class="mina"><h2>Mina dengan wadah</h2><p>Untuk A dan B: wadahnya tetap diam di navbar sebagai "rumah", lalu m melompat keluar dari wadah dan hidup (mata muncul, titik cyan terbang jadi paruh). Setelah selesai, Mina kembali masuk. Frame 0 tetap identik dengan ikon karena wadah ikut digambar di frame itu.</p></section>
</div></body></html>
`;
writeFileSync(join(here, "myna-container-options.html"), html);
console.log("lab/myna-container-options.html", Math.round(html.length / 1024), "KB");
