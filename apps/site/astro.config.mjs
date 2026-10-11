// @ts-check
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

// SITE_URL is set by CI per environment (production / preview). Canonical URLs, the sitemap and
// OG image URLs are built from it. product.config.ts `domain.site` replaces it once a domain exists.
const site = process.env.SITE_URL ?? "https://myna-health-site.erdiprtm.workers.dev";
// The contact form posts to the API Worker (apps/api/src/features/contact.ts): allow its origin.
const apiOrigin = new URL(process.env.PUBLIC_APP_URL ?? "https://myna-health.erdiprtm.workers.dev").origin;

export default defineConfig({
  site,
  output: "static",
  trailingSlash: "always",
  build: { format: "directory" },
  compressHTML: true,
  // Hash-based CSP <meta> on every page (inline scripts allowed by hash only). Headers that a
  // <meta> can't carry (frame-ancestors…) live in public/_headers.
  security: {
    csp: {
      directives: [
        "default-src 'self'",
        "img-src 'self' data: https:",
        "connect-src 'self' https:",
        "font-src 'self'",
        `form-action 'self' ${apiOrigin}`,
      ],
    },
  },
  integrations: [sitemap({ filter: (page) => !page.includes("/og/") && !/\/kontak\/(terkirim|gagal)\//.test(page) })],
  // Never inline scripts into HTML: the CSP allows script files from self only.
  vite: { plugins: [tailwindcss()], build: { assetsInlineLimit: 0 } },
});
