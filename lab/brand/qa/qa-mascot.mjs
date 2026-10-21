// QA for lab/brand/myna-buddy.js: transformation frames, frame-0 = icon proof, sizes, console.
//   node lab/brand/qa/qa-mascot.mjs   (writes PNGs next to this file)

import { rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { chromium } from "/Users/erdipratama/reverse-brand/node_modules/playwright-core/index.mjs";
import sharp from "/Users/erdipratama/reverse-brand/node_modules/sharp/dist/index.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const brand = resolve(here, "..");
const JS = "../myna-buddy.js";
const MARK = "../logo-mark.svg";
const tmp = join(here, "_qa.html");
const load = async (p, html) => {
  writeFileSync(tmp, html);
  await p.goto(pathToFileURL(tmp).href, { waitUntil: "load" });
};
const FRAMES = [0, 160, 330, 450, 560, 680, 800, 950, 1150, 1600];
const S = 220;
const b = await chromium.launch({ channel: "chrome", headless: true, args: ["--disable-gpu"] });
const errors = [];
const page = await b.newPage({ viewport: { width: 900, height: 600 }, deviceScaleFactor: 1 });
page.on("pageerror", (e) => errors.push(e.message));
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
await load(
  page,
  `<!doctype html><html lang="id"><body style="margin:0;background:#fbf6f0">
  <div id="a" style="position:absolute;left:20px;top:20px;width:${S}px;height:${S}px"><myna-buddy id="m" intro nopoke size="${S}"></myna-buddy></div>
  <div id="c" style="position:absolute;left:${40 + S}px;top:20px;width:${S}px;height:${S}px;background:#fbf6f0"><img src="${MARK}" style="position:absolute;left:${(12.75 / 80) * S}px;top:${(24.75 / 80) * S}px;width:${(55.25 / 80) * S}px;height:${(37.5 / 80) * S}px"></div>
  <script src="${JS}"></script></body></html>`,
);
await page.waitForTimeout(100);
// Frame 0 of the transformation (transform() called, every animation seeked to 0 ms) vs the icon image.
const seek = (ms) =>
  page.evaluate((ms) => {
    const host = document.getElementById("m"),
      svg = host.shadowRoot.querySelector("svg");
    if (!host.shadowRoot.getElementById("qa-freeze")) {
      const st = document.createElement("style");
      st.id = "qa-freeze";
      st.textContent = "*{animation-play-state:paused!important}";
      host.shadowRoot.appendChild(st);
    }
    for (const a of host.shadowRoot.getAnimations()) {
      a.pause();
      a.currentTime = ms;
    }
    svg.pauseAnimations();
    svg.setCurrentTime(svg._t0 + ms / 1000);
  }, ms);
await page.evaluate(() => document.getElementById("m").transform());
await page.waitForTimeout(30);
await seek(0);
await page.waitForTimeout(40);
const shotA = await page.locator("#a").screenshot();
const shotC = await page.locator("#c").screenshot();
const ra = await sharp(shotA).raw().toBuffer({ resolveWithObject: true }),
  rc = await sharp(shotC).raw().toBuffer();
let diff = 0,
  big = 0;
for (let i = 0; i < ra.data.length; i += ra.info.channels) {
  const d = Math.max(...[0, 1, 2].map((k) => Math.abs(ra.data[i + k] - rc[i + k])));
  if (d > 8) diff++;
  if (d > 64) big++;
}
const total = ra.info.width * ra.info.height;
await sharp({ create: { width: S * 3 + 40, height: S, channels: 3, background: "#fff" } })
  .composite([
    { input: shotC, left: 0, top: 0 },
    { input: shotA, left: S + 20, top: 0 },
    {
      input: await sharp(shotA)
        .composite([{ input: shotC, blend: "difference" }])
        .png()
        .toBuffer(),
      left: 2 * S + 40,
      top: 0,
    },
  ])
  .png()
  .toFile(join(here, "frame0-vs-icon.png"));
console.log(`frame 0 vs icon: ${diff} px differ by >8 (${((diff / total) * 100).toFixed(2)}%), ${big} px by >64`);
// Transformation, seeked deterministically.
await page.evaluate(() => document.getElementById("c").remove());
const tiles = [];
for (const ms of FRAMES) {
  await seek(ms);
  await page.waitForTimeout(40);
  tiles.push({ ms, png: await page.locator("#a").screenshot() });
}
const W = S + 10;
const labels = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="${W * FRAMES.length}" height="26">${FRAMES.map((ms, i) => `<text x="${i * W + S / 2}" y="18" font-family="Arial" font-size="15" text-anchor="middle" fill="#11163a">${ms} ms</text>`).join("")}</svg>`,
);
await sharp({ create: { width: W * FRAMES.length, height: S + 30, channels: 3, background: "#ffffff" } })
  .composite([...tiles.map((t, i) => ({ input: t.png, left: i * W, top: 0 })), { input: labels, left: 0, top: S + 2 }])
  .png()
  .toFile(join(here, "transform-frames.png"));
console.log("frames written");
// Sizes on light and dark, all states.
await page.setViewportSize({ width: 2100, height: 700 });
await load(
  page,
  `<!doctype html><html lang="id"><body style="margin:0;font-family:Arial">${["#fbf6f0", "#11163a"].map((bg, k) => `<div style="display:flex;gap:18px;align-items:flex-end;padding:18px;background:${bg};${k ? "--myna-ink:#fff;--myna-face:#032b84" : ""}">${["idle", "mikir", "kerja", "sukses", "gagal", "semangat"].map((s) => [24, 44, 96].map((z) => `<myna-buddy state="${s}" size="${z}" nopoke></myna-buddy>`).join("")).join('<span style="width:10px"></span>')}<myna-buddy size="200" nopoke></myna-buddy></div>`).join("")}<script src="${JS}"></script></body></html>`,
);
await page.waitForTimeout(300);
await page.evaluate(() =>
  document.querySelectorAll("myna-buddy").forEach((h) => {
    const st = document.createElement("style");
    st.textContent = "*{animation-play-state:paused!important}";
    h.shadowRoot.appendChild(st);
    for (const a of h.shadowRoot.getAnimations()) a.currentTime = 0;
    h.shadowRoot.querySelector("svg").pauseAnimations();
  }),
);
await page.screenshot({ path: join(here, "sizes.png"), fullPage: true });
// The sheet itself at 1440 and 375, plus reduced motion.
for (const [w, rm, name] of [
  [1440, "no-preference", "sheet-1440.png"],
  [375, "no-preference", "sheet-375.png"],
  [1440, "reduce", "sheet-reduced.png"],
]) {
  const ctx = await b.newContext({ viewport: { width: w, height: 900 }, reducedMotion: rm });
  const p = await ctx.newPage();
  p.on("pageerror", (e) => errors.push(name + ": " + e.message));
  p.on(
    "console",
    (m) => m.type() === "error" && !/transform-frames\.png/.test(m.text()) && errors.push(name + ": " + m.text()),
  );
  await p.goto(pathToFileURL(resolve(here, "..", "..", "myna-mascot.html")).href + "?render=1");
  await p.waitForTimeout(2200);
  const sw = await p.evaluate(() => document.documentElement.scrollWidth);
  await p.screenshot({ path: join(here, name), fullPage: true });
  if (rm === "reduce")
    console.log(
      "reduced motion: hero still pending?",
      await p.evaluate(() => document.getElementById("hero").shadowRoot.querySelector("svg").classList.contains("go")),
    );
  console.log(name, "scrollWidth", sw);
  await ctx.close();
}
rmSync(tmp, { force: true });
console.log("console errors:", errors.length ? errors : "none");
await b.close();
