// @ts-check
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

// SITE_URL is set by CI per environment (production / preview). Canonical URLs, the sitemap and
// OG image URLs are built from it. product.config.ts `domain.site` replaces it once a domain exists.
// Production canonicals use the brand domain; the CI smoke test still reaches the Worker through
// SITE_URL (workers.dev), which does not depend on DNS caches during the cutover.
const site =
  process.env.PUBLIC_APP_ENV === "production"
    ? "https://mynahealth.id"
    : (process.env.SITE_URL ?? "https://myna-health-site.erdiprtm.workers.dev");

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
        "form-action 'self'",
      ],
    },
  },
  // No pricing on the brand site (showcase only). The template smoke test still checks /harga/.
  redirects: { "/harga/": "/" },
  integrations: [sitemap({ filter: (page) => !page.includes("/og/") && !/\/harga\//.test(page) })],
  // Never inline scripts into HTML: the CSP allows script files from self only.
  vite: { plugins: [tailwindcss()], build: { assetsInlineLimit: 0 } },
});
