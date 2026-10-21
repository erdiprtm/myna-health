import { existsSync, readdirSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import product from "../../../product.config";

// Checks the built site (dist/), produced by `astro build` before this runs (turbo test → build).
const dist = new URL("../dist/", import.meta.url);
const page = (path: string) => readFileSync(new URL(path, dist), "utf8");
const PAGES = [
  "index.html",
  "tentang/index.html",
  "kontak/index.html",
  "syarat/index.html",
  "privasi/index.html",
  "refund/index.html",
];
/** Every built text file (HTML, sitemap, robots), for site-wide content rules. */
const allText = (dir = dist): { path: string; text: string }[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const url = new URL(e.isDirectory() ? `${e.name}/` : e.name, dir);
    if (e.isDirectory()) return allText(url);
    return /\.(html|xml|txt)$/.test(e.name) ? [{ path: url.pathname, text: readFileSync(url, "utf8") }] : [];
  });

describe("built site", () => {
  it("every page has a title, description, canonical, OG image and lang", () => {
    for (const path of PAGES) {
      const html = page(path);
      expect(html, path).toMatch(new RegExp(`<html lang="${product.locale.default}"`));
      expect(html, path).toMatch(/<title>[^<]{5,}<\/title>/);
      expect(html, path).toMatch(/<meta name="description" content="[^"]{50,}"/);
      expect(html, path).toMatch(/<link rel="canonical" href="https?:\/\/[^"]+\/"/);
      expect(html, path).toMatch(/<meta property="og:image" content="https?:\/\/[^"]+\.png"/);
    }
  });

  it("legal pages have no unfilled placeholders and show the TEMPLATE banner outside reviewed production", () => {
    for (const path of ["privasi/index.html", "syarat/index.html", "refund/index.html"]) {
      const html = page(path);
      expect(html).not.toContain("{{");
      expect(html).toContain(product.legal.companyName);
      expect(html).toContain("TEMPLATE — perlu review hukum sebelum launch");
    }
  });

  it("ships structured data, sitemap, robots and OG images", () => {
    expect(page("kontak/index.html")).toContain('"@type":"FAQPage"');
    expect(page("index.html")).toContain('"@type":"Organization"');
    expect(existsSync(new URL("sitemap-index.xml", dist))).toBe(true);
    expect(page("robots.txt")).toMatch(/User-agent: \*/);
    expect(readFileSync(new URL("og/home.png", dist)).subarray(1, 4).toString()).toBe("PNG");
  });

  it("CSP meta forbids inline scripts, none are needed, and _headers ships", () => {
    for (const path of ["index.html", "tentang/index.html", "privasi/index.html", "404.html"]) {
      const html = page(path);
      const csp = html.match(/<meta http-equiv="content-security-policy" content="([^"]+)"/)?.[1];
      expect(csp, path).toContain("default-src 'self'");
      expect(csp, path).not.toContain("unsafe-inline");
      // No inline executable scripts at all (JSON-LD data blocks are fine): nothing to hash.
      const inline = [...html.matchAll(/<script(?![^>]*\bsrc=)(?![^>]*application\/ld\+json)[^>]*>/g)];
      expect(inline, path).toEqual([]);
    }
    const headers = page("_headers");
    expect(headers).toContain("frame-ancestors 'none'");
    expect(headers).toContain("X-Content-Type-Options: nosniff");
  });

  it("non-production builds never send analytics (no OpenPanel client ID in the HTML)", () => {
    expect(page("index.html")).not.toContain("data-op-client");
  });

  // specs/myna-health.md: strictly no medical content anywhere (pages, meta, keywords, alt text).
  it("contains no medical terms anywhere", () => {
    const banned =
      /glp-?1|semaglutid|ozempic|wegovy|tadalafil|sildenafil|performa pria|men'?s performance|ereksi|disfungsi|\bdokter\b|konsultasi|\bresep\b|\bobat\b|klinik|telemedi|suntik|injeksi|\bterapi\b|weight[- ]loss|berat badan|apotek|pasien|diagnos/i;
    const files = allText();
    expect(files.length).toBeGreaterThan(8);
    for (const { path, text } of files) expect(text, path).not.toMatch(banned);
  });

  it("home page has the agreed meta title and description", () => {
    const html = page("index.html");
    expect(html).toContain("<title>Myna Health — Aplikasi Gaya Hidup Sehat</title>");
    expect(html).toContain(
      '<meta name="description" content="Myna Health (PT Myna Bio Teknologi) membangun aplikasi wellness dan lifestyle: Myna Fit untuk pelacak kebugaran dan Myna Food untuk panduan makan sehat.">',
    );
  });

  it("every page shows the company identity, contact email and disclaimer (Duitku KYC)", () => {
    for (const path of [...PAGES, "404.html"]) {
      const html = page(path);
      expect(html, path).toContain("PT Myna Bio Teknologi");
      expect(html, path).toContain("Jl. Merdeka Raya No.7 Blok 6, RT.1/RW.7");
      expect(html, path).toContain("Kota Depok, Jawa Barat 16417");
      expect(html, path).toContain("halo@mynahealth.id");
      expect(html, path).toContain(
        "Myna Health menyediakan informasi gaya hidup sehat dan bukan pengganti layanan medis atau tenaga kesehatan profesional.",
      );
      for (const link of ["/tentang/", "/kontak/", "/syarat/", "/privasi/", "/refund/"])
        expect(html, `${path} → ${link}`).toContain(`href="${link}"`);
    }
  });

  it("shows both products, Myna Fit linking out and Myna Food as coming soon", () => {
    const html = page("index.html");
    expect(html).toContain('href="https://fit.mynahealth.id"');
    expect(html).toContain("Myna Food");
    expect(html).toContain("Segera hadir");
  });

  // Erdi, 2026-10-11: Myna Health is a showcase for the products; nothing is sold here.
  it("shows no prices and no pricing page", () => {
    for (const { path, text } of allText()) {
      expect(text, path).not.toMatch(/Rp\s?\d/);
      if (path.endsWith(".html")) expect(text, path).not.toContain('href="/harga/"');
    }
  });

  // P-009: the redesign drops the generic AI-landing look. Keep it from creeping back in.
  it("ships none of the banned decorative patterns (P-009)", () => {
    const assets = new URL("_astro/", dist);
    const css = readdirSync(assets)
      .filter((f) => f.endsWith(".css"))
      .map((f) => readFileSync(new URL(f, assets), "utf8"))
      .join("");
    expect(css).not.toMatch(/(linear|radial)-gradient|backdrop-filter|filter:\s*blur|background-clip:\s*text/);
    expect(css).not.toMatch(/transition(-property)?:\s*all/);
    for (const { path, text } of allText()) {
      if (!path.endsWith(".html")) continue;
      // Visible copy only: the agreed home <title> and the template's legal banner keep their dash.
      const copy = text
        .replace(/<(script|style|title)[\s\S]*?<\/\1>/g, "")
        .replace(/<[^>]+>/g, " ")
        .replace("TEMPLATE — perlu review hukum sebelum launch", "");
      expect(copy, path).not.toMatch(/[—–→]/);
    }
  });

  // P-017 (Erdi, 2026-10-21): the home is the company story; the full identity table lives on
  // Tentang Kami, and every page's footer carries the name, NIB, address and email.
  it("Tentang Kami shows the company identity block; every footer has name, NIB, address and email (entity KYC)", () => {
    const tentang = page("tentang/index.html");
    expect(tentang).toContain('data-testid="company-identity"');
    expect(tentang).toContain("Nama badan usaha");
    for (const path of [...PAGES, "404.html"]) {
      const footer = page(path).match(/<footer[\s\S]*?<\/footer>/)?.[0] ?? "";
      for (const fact of [
        "PT Myna Bio Teknologi",
        "2605260050475",
        "Kota Depok, Jawa Barat 16417",
        "halo@mynahealth.id",
      ])
        expect(footer, `${path}: ${fact}`).toContain(fact);
    }
  });

  it("refund policy says there are no refunds", () => {
    expect(page("refund/index.html")).toContain("tidak dapat dikembalikan");
    expect(page("syarat/index.html")).toContain("tidak ada refund");
  });

  // Erdi, 2026-10-12: contact is by email only; no form anywhere.
  it("contact page has the address and email, no form and no phone number", () => {
    const html = page("kontak/index.html");
    expect(html).toContain('href="mailto:halo@mynahealth.id"');
    for (const { path, text } of allText()) if (path.endsWith(".html")) expect(text, path).not.toMatch(/<form\b/);
    for (const { path, text } of allText()) {
      expect(text, path).not.toContain("tel:");
      expect(text, path).not.toMatch(/(\+62|\b08)\d[\d\s-]{6,}/);
      expect(text, path).not.toMatch(/whatsapp|wa\.me/i);
    }
  });

  it("the sitemap lists the legal pages and skips the pricing redirect", () => {
    const sitemap = allText()
      .filter((f) => f.path.includes("sitemap"))
      .map((f) => f.text)
      .join("");
    expect(sitemap).toContain("/refund/");
    expect(sitemap).not.toContain("/harga/");
  });

  // P-017: the promise illustrations loop only while on screen and never under reduced motion.
  it("promise illustrations: five cards, loops gated by [data-play] and no-preference", () => {
    expect(page("index.html").match(/data-machine/g)?.length).toBe(5);
    const assets = new URL("_astro/", dist);
    const css = readdirSync(assets)
      .filter((f) => f.endsWith(".css"))
      .map((f) => readFileSync(new URL(f, assets), "utf8"))
      .join("");
    const loops = [...css.matchAll(/animation:\s*m[1-5]-[\w-]+[^;}]*infinite/g)];
    expect(loops.length).toBeGreaterThanOrEqual(5);
    for (const m of css.matchAll(/@media\s*\(prefers-reduced-motion:\s*no-preference\)\s*\{([\s\S]*?)\}\s*\}/g)) {
      if (/m[1-5]-/.test(m[1] as string)) expect(m[1]).toContain("[data-play]");
    }
    expect(css).not.toMatch(/(^|[},])\s*\.m[1-5]-[\w-]+[^{]*\{[^}]*animation:\s*m[1-5]-/);
  });

  // P-019 (Erdi, 2026-10-21): the "lengkung m" icon and Mina, the live mascot.
  it("every page carries the new icon (favicon, apple-touch-icon, nav and footer) and Mina wakes the nav icon", async () => {
    const { gzipSync } = await import("node:zlib");
    const M = "M9 50V30A9 9 0 0 1 27 30V50M27 30A9 9 0 0 1 45 30V50";
    expect(page("favicon.svg")).toContain(M);
    expect(page("brand/logo-mark.svg")).toContain(M);
    expect(page("brand/logo-mark-white.svg")).toContain(M);
    expect(readFileSync(new URL("brand/app-icon-180.png", dist)).subarray(1, 4).toString()).toBe("PNG");
    for (const path of [...PAGES, "404.html"]) {
      const html = page(path);
      expect(html, path).toContain('<link rel="apple-touch-icon" href="/brand/app-icon-180.png">');
      // P-020: the nav m sits in a navy circle (Mina's home), the footer m in a white one.
      expect(html, path).toMatch(
        /<span data-myna-home class="nav-home [^"]*rounded-full bg-navy[^"]*">\s*<img src="\/brand\/logo-mark-white\.svg" alt="" [^>]*class="nav-mark /,
      );
      expect(html, path).toMatch(/rounded-full bg-white">\s*<img src="\/brand\/logo-mark\.svg"/);
      expect(html, path).toContain('<script src="/brand/myna-buddy.js" data-awaken=".nav-mark" data-after="5" defer>');
    }
    const js = readFileSync(new URL("brand/myna-buddy.js", dist));
    expect(gzipSync(js).length).toBeLessThan(10 * 1024);
    const src = js.toString();
    expect(src).toContain("prefers-reduced-motion");
    expect(src).toContain('customElements.define("myna-buddy"');
    expect(src).toContain('"Mina, "');
    expect(src).toContain("[data-myna-home]"); // grows out of the circle and goes back in
    expect(page("brand/logo-badge.svg")).toContain(M);
    // The site CSP has no 'unsafe-inline' for styles: the component must style itself through a
    // constructed stylesheet and CSSOM, never a <style> it depends on or a style attribute.
    expect(src).toContain("adoptedStyleSheets");
    expect(src).not.toMatch(/\bstyle:\s*"/);
    // Bubbles stay kind: no body, weight or medical words, no guilt.
    expect(src).not.toMatch(/berat|gemuk|kurus|diet|sakit|dokter|obat|gagal total|malas/i);
  });

  // Erdi, 2026-10-12: the NIB is public, and marketing copy never mentions the city.
  it("shows the NIB and keeps the city to the address only", () => {
    for (const path of ["index.html", "tentang/index.html"]) expect(page(path)).toContain("2605260050475");
    for (const path of PAGES) {
      const copy = page(path)
        .replace(/<script type="application\/ld\+json">.*?<\/script>/gs, "")
        .replaceAll("Kota Depok, Jawa Barat 16417", "")
        .replaceAll("Kec. Sukmajaya", "");
      expect(copy, path).not.toMatch(/Depok/);
    }
  });

  // P-015: Motion ships only where it is used, stays small, and always checks reduced motion.
  it("loads Motion only on the home and contact pages, within budget", async () => {
    const { gzipSync } = await import("node:zlib");
    const astroDir = new URL("_astro/", dist);
    const chunks = readdirSync(astroDir).filter((f) => f.endsWith(".js"));
    const motion = chunks.find((f) => f.startsWith("motion."));
    expect(motion, "motion chunk").toBeTruthy();
    const motionJs = readFileSync(new URL(motion as string, astroDir));
    expect(gzipSync(motionJs).length).toBeLessThan(4500);
    expect(motionJs.toString()).toContain("prefers-reduced-motion");
    const scriptsOf = (path: string) =>
      [...page(path).matchAll(/<script type="module" src="\/_astro\/([^"]+)"/g)].map((m) => m[1] as string);
    const importsMotion = (file: string) => readFileSync(new URL(file, astroDir), "utf8").includes(motion as string);
    for (const path of ["index.html", "kontak/index.html"])
      expect(scriptsOf(path).some(importsMotion), path).toBe(true);
    for (const path of [
      "tentang/index.html",
      "syarat/index.html",
      "privasi/index.html",
      "refund/index.html",
      "404.html",
    ])
      expect(scriptsOf(path).some(importsMotion), path).toBe(false);
  });

  // P-016/P-017: the home stays light (extra JS under ~6 KB gzip) and the identity block on
  // Tentang Kami never animates.
  it("home page JS stays within budget and the identity block never animates", async () => {
    const { gzipSync } = await import("node:zlib");
    const astroDir = new URL("_astro/", dist);
    const html = page("index.html");
    const seen = new Set<string>();
    const walk = (file: string) => {
      if (seen.has(file)) return;
      seen.add(file);
      const js = readFileSync(new URL(file, astroDir), "utf8");
      for (const m of js.matchAll(/from\s*"\.\/([^"]+\.js)"/g)) walk(m[1] as string);
    };
    for (const m of html.matchAll(/<script type="module" src="\/_astro\/([^"]+)"/g)) {
      const file = m[1] as string;
      if (!file.startsWith("Base.astro")) walk(file); // Base = analytics, shipped on every page
    }
    const bytes = [...seen].reduce((n, f) => n + gzipSync(readFileSync(new URL(f, astroDir))).length, 0);
    expect(bytes).toBeLessThan(6144);

    const identity = page("tentang/index.html").match(/<section id="perusahaan"[\s\S]*?<\/section>/)?.[0] ?? "";
    expect(identity).toContain('data-testid="company-identity"');
    expect(identity).toContain("2605260050475");
    expect(identity).not.toMatch(/data-(moment|cta|fit)|hero-(open|rise)|style="/);
  });

  // Erdi, 2026-10-21: the brand is not framed by country, and the home leads with the company
  // (mission, vision, promises) before the products.
  it("home leads with mission and vision, and its marketing copy never says Indonesia", () => {
    const html = page("index.html");
    const copy = html
      .replace(/<(script|style|title)[\s\S]*?<\/\1>/g, "")
      .replace(/<footer[\s\S]*?<\/footer>/, "")
      .replace(/<[^>]+>/g, " ");
    expect(copy).not.toMatch(/Indonesia/);
    const order = ["mission-title", "vision-title", "promises-title", "products-title"].map((id) =>
      html.indexOf(`id="${id}"`),
    );
    expect(order.every((n) => n > 0)).toBe(true);
    expect([...order].sort((x, y) => x - y)).toEqual(order);
    for (const t of ["Visi", "Misi kami", "Janji kami untuk Anda", "Produk kami"]) expect(copy).toContain(t);
  });

  // The CSP has no 'unsafe-inline' for styles, so a style="" attribute is blocked in the browser
  // (console errors, and lost animation delays). Use classes instead.
  it("no built page carries an inline style attribute", () => {
    const pages = allText().filter((f) => f.path.endsWith(".html"));
    expect(pages.length).toBeGreaterThan(0);
    for (const { path, text } of pages) expect(text, path).not.toMatch(/\sstyle=/);
  });

  it("Myna Food asks for launch news by email, with a preset subject", () => {
    expect(page("index.html")).toContain('href="mailto:halo@mynahealth.id?subject=Kabari%20saya%3A%20Myna%20Food"');
  });

  it("the Myna Fit call to action reads Jadi Sehat Bareng", () => {
    for (const path of ["index.html", "tentang/index.html"]) {
      expect(page(path), path).toContain("Jadi Sehat Bareng");
      expect(page(path), path).not.toContain("Buka Myna Fit");
    }
  });
});
