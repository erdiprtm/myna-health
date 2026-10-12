# mynahealth.id DNS

**Current state (2026-10-12):** DNS on Cloudflare (`fay.ns.cloudflare.com`, `harlan.ns.cloudflare.com`), registrar still IDCloudHost.
- `mynahealth.id` and `www` are **Worker** records for `myna-health-site` (custom domains from `apps/site/wrangler.jsonc`, proxied).
- Redirect rule "Redirect from WWW to root": `https://www.mynahealth.id/*` → `https://mynahealth.id/${1}`, 301, query string kept. SSL/TLS "Always Use HTTPS" is on.
- `_lovable` and `_lovable.www` deleted; root and www disconnected from the old Lovable project. Everything else below is unchanged and DNS only.

---


Snapshot of the zone at IDCloudHost (nameservers `bromo.cloudhost.id`, `rinjani.cloudhost.id`), taken 2026-10-12 from Erdi's DNS panel and checked record by record with public `dig`. No DNSSEC (no DS record). Registrar: IDCloudHost, expires 2027-04-04.

This is the list to reproduce **exactly** when the zone moves to Cloudflare. Every record is **DNS only** (grey cloud) unless the cutover step below says otherwise.

| Name | Type | TTL | Value | Purpose | After the move |
|---|---|---|---|---|---|
| `@` | A | 14400 | `185.158.133.1` | Old site (Lovable) | Removed at cutover; the Worker custom domain replaces it |
| `www` | A | 14400 | `185.158.133.1` | Old site (Lovable) | Removed at cutover; the Worker custom domain replaces it |
| `_lovable` | TXT | 14400 | `lovable_verify=bc4a2a92f57de03f74c2b0c14de45fd8542415e454a322c774ab11a46c2e50fd` | Lovable root verification | Keep until the root is removed from Lovable |
| `_lovable.www` | TXT | 14400 | `lovable_verify=f3280af4d45442b4ac1cc4744914f6246735fc97c005933f4257f8f56e47019a` | Lovable www verification | Keep until www is removed from Lovable |
| `fit` | A | 300 | `185.158.133.1` | **Myna Fit on Lovable** | **Keep, DNS only** |
| `_lovable.fit` | TXT | 300 | `lovable_verify=4dd4ba897eba5dc4676e56cc67584fa4883eb542ea3343b718d39cdcf05a3634` | **Lovable fit verification** | **Keep** |
| `_lovable-email` | TXT | 14400 | `lovable_email_verify=57852c863c2a4b9faf94a4c22c8c1cf9ced878a181ac2e401896d4e8aaa98d68` | Lovable email verification | Keep |
| `auth` | NS | 86400 | `ns3.lovable.cloud`, `ns4.lovable.cloud` | Subdomain delegated to Lovable | Keep (two NS records) |
| `@` | MX | 14400 | `1 SMTP.GOOGLE.COM` | **Google Workspace mail** | **Keep exactly** |
| `@` | TXT | 14400 | `v=spf1 include:_spf.google.com ~all` | **SPF** | **Keep exactly** |
| `@` | TXT | 14400 | `google-site-verification=xSYnYR4TIJEMvq5kR1gFDifJ-eXpZG8sMKQi5zpNYGY` | **Google verification** | **Keep exactly** |
| `google._domainkey` | TXT | 14400 | `v=DKIM1;k=rsa;p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA8FMQsSWAyAWju5jH9O78Py8TfHOD34aov0y7ZX4DFY6kkQmZ3YqwFge72J8+t3YtMaG2kCWjIWjy4ySGpTy5ANYJoyM5GRkidKhFCRShWSR8Ba+QK83/GqKXSgbELAtfuZYrO1JEyNolBUETXZYGUcNIjBs9N0T+9jj5jb30YF7fiNY48fJVB3OESgrNGnV6NgKg4UYEDzBeeI9g0UfJvWy9agxtWfeNhPS8BnLw+hEqd2IUzUGZ1/6fgKs4lAd8Qsa6XlRHKSrPRZlz3SqSAbr3rBhuYXXoAlcahSQxQLLoMxrVsaJkM/Cv15euBjGDNvznoCu6HQR1u4qpeuI4kQIDAQAB` | **Google DKIM** | **Keep exactly** (one value; IDCloudHost shows it as two 255-char strings) |
| `_dmarc` | TXT | 14400 | `v=DMARC1; p=none;` | **DMARC** | **Keep exactly** |
| `resend._domainkey.hello` | TXT | 14400 | `p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDezGDSkH5PVqzl9oQiFyABHCa1brP3J3D2tt1LGI5iKD/6zYO4zI8jbBEiSnhRFivW4NyeZ6nQqXnqunRuBtSWMfDRvMUhkzF0RpsFzedPRteZT4MylAjy21gRwWb6jb5jgE2MjN5K5L0/QU2yFrJ51xQxZ1C9GT/7FaW1c10ozQIDAQAB` | Resend sending domain `hello.mynahealth.id` | Keep (usable for the contact form) |
| `send.hello` | TXT | 14400 | `v=spf1 include:amazonses.com ~all` | Resend SPF | Keep |
| `send.hello` | MX | 14400 | `10 feedback-smtp.ap-northeast-1.amazonses.com` | Resend bounce | Keep |
| `erp-agent` | A | 14400 | `43.156.125.82` | Another service of Erdi's | Keep, DNS only |
| `mail` | CNAME | 14400 | `mynahealth.id` | Old hosting default | Keep (harmless) |
| `ftp` | CNAME | 14400 | `mynahealth.id` | Old hosting default | Keep (harmless) |

## Cutover (only after Cloudflare is the active nameserver)

1. Delete `@` A and `www` A (Lovable) in Cloudflare.
2. CI deploys the site Worker with custom domains `mynahealth.id` and `www.mynahealth.id`, which creates their records.
3. Check the site, `fit.mynahealth.id`, and mail send/receive.
4. Remove the root and `www` (not `fit`) from the Lovable project, then delete `_lovable` and `_lovable.www`.
