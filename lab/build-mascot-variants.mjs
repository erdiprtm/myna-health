// Builds lab/myna-mascot-variants.html: three character variants built from the chosen icon
// (concept D, "lengkung m"), Phase 2 step 1 of lab/myna-mascot-prompt.md. Static poses only;
// the web component is built after Erdi picks a variant.
//   node lab/build-mascot-variants.mjs
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const NAVY = "#032b84", CYAN = "#24dde2";
const M = "M9 50V30A9 9 0 0 1 27 30V50M27 30A9 9 0 0 1 45 30V50";
const stroke = (ink) => `<path d="${M}" fill="none" stroke="${ink}" stroke-width="8.5" stroke-linecap="round" stroke-linejoin="round"/>`;
const dot = `<circle cx="54.5" cy="45.5" r="5.5" fill="${CYAN}"/>`;

// Eyes on the arch tops (the stroke is 8.5 thick there, room for a 3.4 × 5.4 eye). Slightly right of
// centre, so the character faces the way the dot points.
const eyesTop = (c, pose) => {
  if (pose === "sukses") return `<path d="M16.4 22.4 Q18.6 18.6 20.8 22.4 M34.4 22.4 Q36.6 18.6 38.8 22.4" stroke="${c}" stroke-width="1.9" fill="none" stroke-linecap="round"/>`;
  if (pose === "gagal") return `<rect x="16.9" y="20.6" width="3.4" height="3" rx="1.5" fill="${c}"/><rect x="34.9" y="20.6" width="3.4" height="3" rx="1.5" fill="${c}"/>`;
  return `<rect x="16.9" y="18.3" width="3.4" height="5.4" rx="1.7" fill="${c}"/><rect x="34.9" y="18.3" width="3.4" height="5.4" rx="1.7" fill="${c}"/>`;
};
// Pupils inside the two arch windows (the background shows through there).
const eyesIn = (c, pose) => {
  if (pose === "sukses") return `<path d="M16.2 33.4 Q18.6 29.6 21 33.4 M34.2 33.4 Q36.6 29.6 39 33.4" stroke="${c}" stroke-width="2" fill="none" stroke-linecap="round"/>`;
  if (pose === "gagal") return `<rect x="17" y="33.2" width="3.4" height="3" rx="1.5" fill="${c}"/><rect x="35" y="33.2" width="3.4" height="3" rx="1.5" fill="${c}"/>`;
  return `<rect x="17" y="29.4" width="3.6" height="6" rx="1.8" fill="${c}"/><rect x="35" y="29.4" width="3.6" height="6" rx="1.8" fill="${c}"/>`;
};
const crest = `<path d="M13.6 18.2 C12.4 12.6 15.4 8.6 20.6 8.8 C18.2 10.8 17.9 13.8 19.2 17 Z" fill="${CYAN}"/>`;
const beak = (open) =>
  open
    ? `<rect x="47.4" y="19.4" width="8.6" height="3.6" rx="1.8" fill="${CYAN}"/><rect x="47.4" y="24.2" width="7" height="3.2" rx="1.6" fill="${CYAN}"/>`
    : `<rect x="47.2" y="20.4" width="9.2" height="5.4" rx="2.7" fill="${CYAN}"/>`;
const sparkles = `<g fill="${CYAN}"><path d="M52 6 L53 9 L56 10 L53 11 L52 14 L51 11 L48 10 L51 9Z"/><path d="M6 10 L6.7 12 L8.7 12.7 L6.7 13.4 L6 15.4 L5.3 13.4 L3.3 12.7 L5.3 12Z"/></g>`;

const variants = [
  {
    id: "intip",
    name: "Intip",
    note: "Only pupils are added, in the two windows under the arches: the m peeks out at you. The dot stays where the logo has it and hops in sukses. Signature motion: the arches squash in a slow blink.",
    draw: (pose, dark) => `${stroke(dark ? "#fff" : NAVY)}${eyesIn(dark ? "#fff" : NAVY, pose)}${dot}${pose === "sukses" ? sparkles : ""}`,
  },
  {
    id: "jambul",
    name: "Jambul",
    note: "White eyes on the arch tops (like Padi's eyes on the sun) and one cyan crest feather, the myna's tuft, sprouting from the first arch. Signature motion: a crest flick with a little head tilt.",
    draw: (pose, dark) => `${crest}${stroke(dark ? "#fff" : NAVY)}${eyesTop(dark ? NAVY : "#fff", pose)}${dot}${pose === "sukses" ? sparkles : ""}`,
  },
  {
    id: "paruh",
    name: "Paruh",
    note: "Eyes on the arch tops, and the logo's cyan dot flies up to become a small pill beak: the dot's leap is the WOW moment of the transformation. Signature motion: the beak opens to talk.",
    draw: (pose, dark) => `${stroke(dark ? "#fff" : NAVY)}${eyesTop(dark ? NAVY : "#fff", pose)}${beak(pose === "sukses")}${pose === "sukses" ? sparkles : ""}`,
  },
];
const poses = [
  ["idle", "idle"],
  ["sukses", "sukses"],
  ["gagal", "gagal (gentle)"],
];
const pic = (v, pose, dark, size) => `<svg width="${size}" height="${size}" viewBox="0 2 64 56" role="img" aria-label="${v.name}, ${pose}">${v.draw(pose, dark)}</svg>`;

const names = [
  ["Mina", "From myna: short, warm, easy to say in Indonesian and English. Risk: it is also a common given name."],
  ["Kedip", "Indonesian for 'blink', after the signature motion. Playful, clearly a character, not a person's name."],
  ["Jali", "From jalak, the Indonesian name for the myna family. Friendly, a little cheeky, rare as a real name."],
];

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Myna mascot variants</title>
<style>
  *{box-sizing:border-box}html,body{margin:0}
  body{font-family:Montserrat,system-ui,-apple-system,"Segoe UI",sans-serif;background:#eceef3;color:#11163a;padding:40px}
  .wrap{max-width:1400px;margin:0 auto}
  h1{margin:0;font-size:30px;letter-spacing:-.02em;color:${NAVY}}
  .lede{color:#555c67;max-width:90ch;line-height:1.55}
  .grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:20px;margin-top:24px}
  .v{background:#fff;border-radius:20px;overflow:hidden}
  .v h2{margin:0;padding:20px 22px 4px;font-size:22px;color:${NAVY}}
  .v p{margin:0;padding:0 22px 16px;font-size:14px;line-height:1.5;color:#555c67}
  .stage{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;padding:16px;background:#fbf6f0}
  .stage.dark{background:#11163a;color:#fff}
  figure{margin:0;display:grid;justify-items:center;gap:4px}
  figcaption{font-size:11px;opacity:.6}
  .hero{display:flex;justify-content:center;padding:18px 0 4px;background:#fbf6f0}
  .sizes{display:flex;gap:14px;align-items:flex-end;justify-content:center;padding:10px 0 16px;background:#fbf6f0}
  .names{background:#fff;border-radius:20px;padding:20px 24px;margin-top:20px}
  .names h2{margin:0 0 10px;color:${NAVY}}
  .names li{margin:6px 0;line-height:1.5}
  @media (max-width:1000px){.grid{grid-template-columns:1fr}}
</style>
</head>
<body><div class="wrap">
<h1>Myna mascot: character variants</h1>
<p class="lede">Each variant is the chosen icon (lengkung m) plus the fewest parts: eyes and one signature part. No arms, legs or clothes. The still logo has no face; these faces only exist on the live mascot. Shown large, at 96, 44 and 24 px, and in three poses on light and dark. Pick one; then the web component, the transformation and the full expression set get built.</p>
<div class="grid">${variants
  .map(
    (v) => `<section class="v"><h2>${v.name}</h2><p>${v.note}</p>
  <div class="hero">${pic(v, "idle", false, 200)}</div>
  <div class="sizes">${[96, 44, 24].map((s) => `<figure>${pic(v, "idle", false, s)}<figcaption>${s}</figcaption></figure>`).join("")}</div>
  <div class="stage">${poses.map(([p, l]) => `<figure>${pic(v, p, false, 96)}<figcaption>${l}</figcaption></figure>`).join("")}</div>
  <div class="stage dark">${poses.map(([p, l]) => `<figure>${pic(v, p, true, 96)}<figcaption>${l}</figcaption></figure>`).join("")}</div>
</section>`,
  )
  .join("")}</div>
<section class="names"><h2>Name ideas</h2><ol>${names.map(([n, why]) => `<li><b>${n}</b>: ${why}</li>`).join("")}</ol></section>
</div></body></html>
`;
writeFileSync(join(here, "myna-mascot-variants.html"), html);
console.log("lab/myna-mascot-variants.html", Math.round(html.length / 1024), "KB");
