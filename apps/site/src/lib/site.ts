import product from "../../../../product.config";

export { product };

const idr = (n: number) => `Rp${n.toLocaleString("id-ID")}`;

/** Where "Masuk" / "Mulai" buttons go. CI sets PUBLIC_APP_URL; falls back to the configured domain. */
export const appUrl: string =
  import.meta.env.PUBLIC_APP_URL ??
  (product.domain.app ? `https://${product.domain.app}` : "https://myna-health.erdiprtm.workers.dev");

/** "production" only on the production build; previews and local show the legal TEMPLATE banner. */
export const isProduction = import.meta.env.PUBLIC_APP_ENV === "production";

/** OpenPanel client ID, only on production builds: previews and dev send nothing. */
export const analyticsClientId = (isProduction && product.analytics.openpanelClientId) || undefined;

/** Legal pages show the TEMPLATE banner until a lawyer reviewed them AND it's a production build. */
export const showLegalBanner = !(isProduction && product.legal.reviewed);

/** Company identity shown in the footer of every page and on /kontak/ (Duitku merchant KYC). */
export const company = {
  name: product.legal.companyName,
  addressLines: [
    "Jl. Merdeka Raya No.7 Blok 6, RT.1/RW.7",
    "Abadijaya, Kec. Sukmajaya",
    "Kota Depok, Jawa Barat 16417",
  ],
  email: product.legal.contactEmail,
};
export const companyAddress = company.addressLines.join(", ");

/** Fills {{placeholders}} in legal/SEO content from product.config.ts. */
export function fillPlaceholders(text: string): string {
  const values: Record<string, string> = {
    name: product.name,
    companyName: product.legal.companyName,
    companyAddress,
    contactEmail: product.legal.contactEmail,
    trialDays: String(product.trial.days),
    planList: product.plans.map((p) => `${p.label} (${idr(p.priceIdr)})`).join(", "),
    refundPolicy: product.legal.refundPolicy,
    productDataDescription: product.legal.productDataDescription,
  };
  return text.replace(/\{\{(\w+)\}\}/g, (match, key: string) => values[key] ?? match);
}

export const disclaimer =
  "Myna Health menyediakan informasi gaya hidup sehat dan bukan pengganti layanan medis atau tenaga kesehatan profesional.";

/** Myna Fit runs on its own domain (Lovable) for now. */
export const mynaFitUrl = "https://fit.mynahealth.id";

/** Where the contact form posts (API Worker; it emails erdi@… and redirects back here). */
export const contactEndpoint = `${appUrl}/api/contact`;

export const faqs = [
  {
    q: "Apa itu Myna Health?",
    a: "Myna Health adalah perusahaan teknologi gaya hidup sehat yang mengembangkan beberapa produk digital. Saat ini tersedia Myna Fit (pelacak latihan gym dan catatan kalori). Myna Food (panduan makan sesuai tujuan) segera hadir.",
  },
  {
    q: "Siapa yang mengelola Myna Health?",
    a: "Myna Health adalah merek milik PT Myna Bio Teknologi, yang berkantor di Jl. Merdeka Raya No.7 Blok 6, Abadijaya, Sukmajaya, Kota Depok, Jawa Barat 16417. Email resmi: erdi@mynahealth.id.",
  },
  {
    q: "Di mana saya bisa memakai Myna Fit?",
    a: "Myna Fit bisa langsung dibuka di browser HP atau laptop, di fit.mynahealth.id.",
  },
  {
    q: "Kapan Myna Food tersedia?",
    a: "Myna Food sedang kami siapkan. Kirim pesan lewat halaman Kontak jika ingin dikabari saat sudah rilis.",
  },
  {
    q: "Apakah Myna Health layanan medis?",
    a: `Bukan. ${disclaimer}`,
  },
];
