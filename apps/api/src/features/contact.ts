import { config } from "@factory/config/product";
import { emailProvider } from "@factory/core/email";
import { Hono } from "hono";
import { z } from "zod";
import type { RateLimiter } from "../core/rate-limit";
import { clientIp } from "../core/rate-limit";
import type { SessionVariables } from "../core/session";
import type { Bindings } from "../index";

// PRODUCT-OWNED: the contact form on the brand site (apps/site /kontak/).
// A plain HTML form POST (no JS, no CORS): the message is emailed to legal.contactEmail and the
// browser is sent back to the site with 303. Nothing is stored. Only the site's own origins may post.

export type ContactEnv = {
  /** Site hosts allowed to post the form, comma-separated; "*-" prefix wildcards like AUTH_HOSTS. */
  SITE_HOSTS?: string;
  /** Contact form posts per client IP (5 per 60 s). */
  CONTACT_LIMITER?: RateLimiter;
};

const form = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.email().max(200),
  message: z.string().trim().min(10).max(5000),
  // Spam trap: the field is hidden from people, so any value means a bot.
  website: z.string().max(500).optional(),
});

/** True when `origin` is https on one of the allowed hosts (or localhost while developing). */
export function allowedSiteOrigin(origin: string | undefined, hosts: string, appEnv: string): URL | null {
  if (!origin) return null;
  let url: URL;
  try {
    url = new URL(origin);
  } catch {
    return null;
  }
  const local = appEnv === "development" || appEnv === "test";
  if (local && url.protocol === "http:" && (url.hostname === "localhost" || url.hostname === "127.0.0.1")) return url;
  if (url.protocol !== "https:") return null;
  const ok = hosts
    .split(",")
    .map((h) => h.trim().toLowerCase())
    .filter(Boolean)
    .some((h) => (h.startsWith("*") ? url.hostname.endsWith(h.slice(1)) : url.hostname === h));
  return ok ? url : null;
}

export const contactFeature = new Hono<{ Bindings: Bindings & ContactEnv; Variables: SessionVariables }>().post(
  "/",
  async (c) => {
    const site = allowedSiteOrigin(c.req.header("origin"), c.env.SITE_HOSTS ?? "", c.env.APP_ENV);
    if (!site) return c.json({ error: "forbidden_origin" as const }, 403);
    const back = (page: "terkirim" | "gagal") => c.redirect(new URL(`/kontak/${page}/`, site).href, 303);

    const limiter = c.env.CONTACT_LIMITER;
    if (limiter) {
      const { success } = await limiter.limit({ key: `${config.slug}:CONTACT_LIMITER:${clientIp(c)}` });
      if (!success) return back("gagal");
    }

    const parsed = form.safeParse(await c.req.parseBody());
    if (!parsed.success) return back("gagal");
    const { name, email, message, website } = parsed.data;
    // Bots get the success page, so they learn nothing; no email is sent.
    if (website) return back("terkirim");

    const safeName = name.replace(/[\r\n]+/g, " ");
    try {
      await emailProvider(c.env).send({
        to: config.legal.contactEmail,
        subject: `[Kontak ${config.name}] Pesan dari ${safeName}`,
        text: `Pesan baru dari formulir kontak ${site.host}.\n\nNama: ${safeName}\nEmail: ${email}\n\n${message}\n\n(Balas langsung ke ${email}.)`,
      });
    } catch (err) {
      // Never log the sender or the message (PII).
      console.error("contact email failed", err instanceof Error ? err.message : err);
      return back("gagal");
    }
    return back("terkirim");
  },
);
