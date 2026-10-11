import { existsSync, readdirSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import product from "../../../product.config";

// Checks the built site (dist/), produced by `astro build` before this runs (turbo test → build).
const dist = new URL("../dist/", import.meta.url);
const page = (path: string) => readFileSync(new URL(path, dist), "utf8");
const idr = (n: number) => `Rp${n.toLocaleString("id-ID")}`;
const PAGES = [
  "index.html",
  "harga/index.html",
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
  it("prices come from product.config.ts (no code edits needed)", () => {
    const html = page("harga/index.html");
    for (const plan of product.plans) {
      expect(html).toContain(plan.label);
      expect(html).toContain(idr(plan.priceIdr));
    }
  });

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
    expect(page("index.html")).toContain('"@type":"FAQPage"');
    expect(page("index.html")).toContain('"priceCurrency":"IDR"');
    expect(existsSync(new URL("sitemap-index.xml", dist))).toBe(true);
    expect(page("robots.txt")).toMatch(/User-agent: \*/);
    expect(readFileSync(new URL("og/home.png", dist)).subarray(1, 4).toString()).toBe("PNG");
  });

  it("CSP meta forbids inline scripts, none are needed, and _headers ships", () => {
    for (const path of ["index.html", "harga/index.html", "privasi/index.html", "404.html"]) {
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
      '<meta name="description" content="Panduan makan sehat dan pelacak kebugaran untuk gaya hidup yang lebih baik. Langganan mulai Rp149.000 untuk 6 bulan.">',
    );
  });

  it("every page shows the company identity, contact email and disclaimer (Duitku KYC)", () => {
    for (const path of [...PAGES, "kontak/terkirim/index.html", "kontak/gagal/index.html", "404.html"]) {
      const html = page(path);
      expect(html, path).toContain("PT Myna Bio Teknologi");
      expect(html, path).toContain("Jl. Merdeka Raya No.7 Blok 6, RT.1/RW.7");
      expect(html, path).toContain("Kota Depok, Jawa Barat 16417");
      expect(html, path).toContain("erdi@mynahealth.id");
      expect(html, path).toContain(
        "Myna Health menyediakan informasi gaya hidup sehat dan bukan pengganti layanan medis atau tenaga kesehatan profesional.",
      );
      for (const link of ["/tentang/", "/kontak/", "/syarat/", "/privasi/", "/refund/", "/harga/"])
        expect(html, `${path} → ${link}`).toContain(`href="${link}"`);
    }
  });

  it("shows both products, Myna Fit linking out and Myna Food as coming soon", () => {
    const html = page("index.html");
    expect(html).toContain('href="https://fit.mynahealth.id"');
    expect(html).toContain("Myna Food");
    expect(html).toContain("Segera hadir");
    for (const plan of product.plans) expect(html).toContain(idr(plan.priceIdr));
  });

  it("contact page has the address, email and a form to the API, and no phone number", () => {
    const html = page("kontak/index.html");
    expect(html).toMatch(/<form method="post" action="https?:\/\/[^"]+\/api\/contact"/);
    for (const name of ["name", "email", "message"]) expect(html).toContain(`name="${name}"`);
    for (const { path, text } of allText()) {
      expect(text, path).not.toContain("tel:");
      expect(text, path).not.toMatch(/(\+62|\b08)\d[\d\s-]{6,}/);
      expect(text, path).not.toMatch(/whatsapp|wa\.me/i);
    }
  });

  it("form result pages stay out of the sitemap and search", () => {
    const sitemap = allText()
      .filter((f) => f.path.includes("sitemap"))
      .map((f) => f.text)
      .join("");
    expect(sitemap).toContain("/refund/");
    expect(sitemap).not.toContain("/kontak/terkirim/");
    expect(page("kontak/terkirim/index.html")).toContain('<meta name="robots" content="noindex">');
  });
});
