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

/** Social accounts: logos only until Erdi shares the handles (url null = icon without a link). */
export const socials = [
  { name: "Instagram", url: null },
  { name: "TikTok", url: null },
  { name: "YouTube", url: null },
] as const satisfies readonly { name: string; url: string | null }[];

/** Year PT Myna Bio Teknologi was founded. */
export const foundedYear = 2026;

/** NIB (Nomor Induk Berusaha) of PT Myna Bio Teknologi. */
export const nib = "2605260050475";

/** Myna Fit runs on its own domain (Lovable) for now. */
export const mynaFitUrl = "https://fit.mynahealth.id";

/** Promises to the user ("Janji kami untuk Anda", P-017): concrete and user-centric. Home and Tentang Kami. */
export const values = [
  {
    icon: "sparkles",
    title: "Mulai dari hidup Anda, bukan dari program kami.",
    body: "Produk kami menyesuaikan jadwal, tujuan, dan kebiasaan Anda.",
  },
  {
    icon: "arrow-right",
    title: "Selalu tahu langkah berikutnya.",
    body: "Setiap kali membuka aplikasi, ada satu hal yang jelas untuk dilakukan, bukan dasbor yang membingungkan.",
  },
  {
    icon: "info",
    title: "Angka yang bisa Anda pegang.",
    body: "Data dari sumber yang kami kurasi, bukan tebakan. Kalau sesuatu hanya perkiraan, kami bilang perkiraan.",
  },
  {
    icon: "check",
    title: "Terlewat sehari bukan berarti gagal.",
    body: "Tanpa omelan soal makan atau tubuh Anda. Besok, mulai lagi dari langkah kecil.",
  },
  {
    icon: "lock",
    title: "Data Anda, kendali Anda.",
    body: "Kami hanya menyimpan yang perlu, tidak menjualnya, dan Anda bisa meminta salinan atau penghapusan kapan saja.",
  },
] as const;

export const faqs = [
  {
    q: "Siapa yang mengelola Myna Health?",
    a: "Myna Health adalah merek milik PT Myna Bio Teknologi, perusahaan teknologi gaya hidup sehat yang didirikan pada 2026. Data lengkap badan usaha ada di bagian Informasi perusahaan.",
  },
  {
    q: "Apakah Myna Health layanan medis?",
    a: `Bukan. ${disclaimer}`,
  },
  {
    q: "Di mana Myna Fit dapat digunakan?",
    a: "Myna Fit dapat diakses langsung melalui browser di fit.mynahealth.id, tanpa perlu mengunduh aplikasi.",
  },
  {
    q: "Kapan Myna Food tersedia?",
    a: "Myna Food sedang dalam pengembangan. Silakan hubungi kami untuk mendapatkan informasi peluncurannya.",
  },
];
