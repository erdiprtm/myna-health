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

/** NIB (Nomor Induk Berusaha). Placeholder until Erdi confirms the number. */
export const nib = "xxx";

/** Myna Fit runs on its own domain (Lovable) for now. */
export const mynaFitUrl = "https://fit.mynahealth.id";

/** Where the contact form posts (API Worker; it emails erdi@… and redirects back here). */
export const contactEndpoint = `${appUrl}/api/contact`;

/** "Yang kami pegang": shown on the home page and Tentang Kami. */
export const values = [
  {
    icon: "lock",
    title: "Privasi itu hak kamu",
    body: "Data kamu nggak kami jual. Mau minta salinan atau hapus? Tinggal bilang.",
  },
  {
    icon: "sparkles",
    title: "Nggak ada body shaming",
    body: "Kami nggak akan bikin kamu malu sama badan sendiri, apalagi sama isi piring.",
  },
  {
    icon: "clock",
    title: "Kecil, tapi rutin",
    body: "Lima belas menit hari ini lebih berguna daripada rencana sempurna buat minggu depan.",
  },
  {
    icon: "info",
    title: "Jujur soal batas",
    body: "Kami kasih info gaya hidup, bukan nasihat medis. Untuk kondisi khusus, tanya ahlinya.",
  },
] as const;

export const faqs = [
  {
    q: "Siapa yang mengelola Myna Health?",
    a: "PT Myna Bio Teknologi, perusahaan teknologi yang berkantor di Kota Depok, Jawa Barat. Detail lengkapnya ada di bagian Identitas perusahaan.",
  },
  {
    q: "Myna Health itu layanan medis?",
    a: `Bukan. ${disclaimer}`,
  },
  {
    q: "Myna Fit bisa dipakai di mana?",
    a: "Langsung dari browser HP atau laptop di fit.mynahealth.id. Nggak perlu unduh aplikasi.",
  },
  {
    q: "Kapan Myna Food rilis?",
    a: "Lagi kami siapin. Kirim pesan lewat halaman Kontak kalau mau dikabari duluan.",
  },
  {
    q: "Mau tanya atau ajak kerja sama, ke mana?",
    a: "Isi formulir di halaman Kontak atau email ke erdi@mynahealth.id. Kami balas di hari kerja.",
  },
];
