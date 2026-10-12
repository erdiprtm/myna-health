import { env } from "cloudflare:workers";
import { capturedEmails } from "@factory/core/email";
import { afterEach, describe, expect, it, vi } from "vitest";
import { allowedSiteOrigin } from "../src/features/contact";
import { app } from "../src/index";

const SITE = "https://mynahealth.id";
const testEnv = { ...env, SITE_HOSTS: "mynahealth.id,*-myna-health-site-preview.example.workers.dev" };

const post = (fields: Record<string, string>, origin: string | null = SITE, e: object = testEnv) =>
  app.request(
    "http://localhost/api/contact",
    {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded", ...(origin ? { origin } : {}) },
      body: new URLSearchParams(fields).toString(),
      redirect: "manual",
    },
    e,
  );

const valid = { name: "Budi", email: "budi@example.com", message: "Halo, saya mau tanya soal paket 12 bulan." };

describe("POST /api/contact", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("emails the message to the contact address and redirects back to the site", async () => {
    const res = await post(valid);
    expect(res.status).toBe(303);
    expect(res.headers.get("location")).toBe(`${SITE}/kontak/terkirim/`);
    const mail = capturedEmails().last("erdi@mynahealth.id");
    expect(mail?.subject).toContain("Budi");
    expect(mail?.text).toContain("budi@example.com");
    expect(mail?.text).toContain("paket 12 bulan");
  });

  it("rejects posts from other origins, or without an origin", async () => {
    expect((await post(valid, "https://evil.example")).status).toBe(403);
    expect((await post(valid, null)).status).toBe(403);
    expect((await post(valid, "http://mynahealth.id")).status).toBe(403);
  });

  it("sends invalid input back to the failure page without emailing", async () => {
    const before = capturedEmails().sent.length;
    const res = await post({ ...valid, email: "bukan-email" });
    expect(res.headers.get("location")).toBe(`${SITE}/kontak/gagal/`);
    expect((await post({ ...valid, message: "pendek" })).headers.get("location")).toBe(`${SITE}/kontak/gagal/`);
    expect(capturedEmails().sent.length).toBe(before);
  });

  it("silently drops spam-trap submissions", async () => {
    const before = capturedEmails().sent.length;
    const res = await post({ ...valid, website: "http://spam.example" });
    expect(res.headers.get("location")).toBe(`${SITE}/kontak/terkirim/`);
    expect(capturedEmails().sent.length).toBe(before);
  });

  it("goes to the failure page when the email provider fails", async () => {
    vi.stubGlobal("fetch", async () => new Response("nope", { status: 500 }));
    const res = await post(valid, SITE, { ...testEnv, APP_ENV: "preview", RESEND_API_KEY: "re_test_stub" });
    expect(res.headers.get("location")).toBe(`${SITE}/kontak/gagal/`);
  });

  it("is rate limited per IP", async () => {
    const limited = { ...testEnv, CONTACT_LIMITER: { limit: async () => ({ success: false }) } };
    const res = await post(valid, SITE, limited);
    expect(res.headers.get("location")).toBe(`${SITE}/kontak/gagal/`);
  });
});

describe("allowedSiteOrigin", () => {
  const hosts = "mynahealth.id,*-myna-health-site-preview.example.workers.dev";
  it("allows configured https hosts and preview aliases", () => {
    expect(allowedSiteOrigin("https://mynahealth.id", hosts, "production")?.host).toBe("mynahealth.id");
    expect(
      allowedSiteOrigin("https://pr-3-myna-health-site-preview.example.workers.dev", hosts, "preview"),
    ).not.toBeNull();
  });
  it("rejects look-alikes, http and localhost when deployed", () => {
    expect(allowedSiteOrigin("https://mynahealth.id.evil.example", hosts, "production")).toBeNull();
    expect(allowedSiteOrigin("https://evilmynahealth.id", hosts, "production")).toBeNull();
    expect(allowedSiteOrigin("http://localhost:4321", hosts, "production")).toBeNull();
    expect(allowedSiteOrigin("http://localhost:4321", hosts, "development")?.port).toBe("4321");
    expect(allowedSiteOrigin("not a url", hosts, "production")).toBeNull();
  });
});
