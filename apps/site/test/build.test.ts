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

  it("home and Tentang Kami show the company identity block (entity KYC)", () => {
    for (const path of ["index.html", "tentang/index.html"]) {
      const html = page(path);
      expect(html, path).toContain('data-testid="company-identity"');
      expect(html, path).toContain("Nama badan usaha");
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
});
