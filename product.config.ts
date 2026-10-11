import { defineProduct } from "@factory/config";

// THE file a new product edits first. Everything that differs between products and
// isn't feature code lives here. Validated by packages/config on every build.
export default defineProduct({
  slug: "myna-health",
  name: "Myna Health",
  tagline: "Aplikasi gaya hidup sehat: panduan makan sehat dan pelacak kebugaran untuk gaya hidup yang lebih baik.",
  locale: { default: "id", supported: ["id", "en"] },
  domain: { app: null, site: null },
  brand: {
    tokens: {
      colors: {
        light: {
          // Lovable mynahealth design (archive/telehealth-v1): warm off-white, brand blue #113BFE.
          background: "#f7f5f3",
          foreground: "#1d212b",
          card: "#ffffff",
          cardForeground: "#1d212b",
          popover: "#ffffff",
          popoverForeground: "#1d212b",
          primary: "#113bfe",
          primaryForeground: "#ffffff",
          secondary: "#f0ece6",
          secondaryForeground: "#1d212b",
          muted: "#f2f0ed",
          mutedForeground: "#5f6676",
          accent: "#eff3ff",
          accentForeground: "#2b3fe0",
          destructive: "#ef4343",
          destructiveForeground: "#ffffff",
          border: "#e5e2dc",
          input: "#e1ddd6",
          ring: "#113bfe",
        },
        dark: {
          background: "#0c0e12",
          foreground: "#f7f5f3",
          card: "#101318",
          cardForeground: "#f7f5f3",
          popover: "#101318",
          popoverForeground: "#f7f5f3",
          primary: "#6b7cf0",
          primaryForeground: "#0c0e12",
          secondary: "#1d212b",
          secondaryForeground: "#f7f5f3",
          muted: "#1f242e",
          mutedForeground: "#9da3af",
          accent: "#1d2550",
          accentForeground: "#dae7fc",
          destructive: "#ef4343",
          destructiveForeground: "#ffffff",
          border: "#252b37",
          input: "#252b37",
          ring: "#6b7cf0",
        },
      },
      radius: "0.75rem",
      fontFamily: { sans: "Outfit, system-ui, sans-serif" },
    },
    logo: "/logo.png",
    favicon: "/favicon.svg",
  },
  // The site never mentions a trial (brand site only). Kept on: template API tests expect it.
  trial: { enabled: true, days: 7 },
  plans: [
    { id: "6m", label: "6 bulan", months: 6, priceIdr: 149000 },
    { id: "12m", label: "12 bulan", months: 12, priceIdr: 249000, highlight: true },
  ],
  payments: {
    provider: "duitku",
    methods: ["QRIS", "DANA", "SHOPEEPAY", "OVO", "VIRTUAL_ACCOUNT"],
  },
  legal: {
    companyName: "PT Myna Bio Teknologi",
    contactEmail: "erdi@mynahealth.id",
    sensitiveDataConsent: false,
    productDataDescription:
      "Data yang kamu catat sendiri di aplikasi Myna, misalnya riwayat latihan, catatan makanan, dan perkiraan kalori. Pesan yang kamu kirim lewat formulir kontak (nama, email, isi pesan) diteruskan ke email kami dan tidak disimpan di basis data situs.",
    refundPolicy:
      "Pengembalian dana dapat diajukan dalam 7 hari setelah pembayaran jika terjadi tagihan ganda, kesalahan nominal, atau layanan tidak dapat dipakai karena kesalahan kami. Rincian dan cara pengajuan ada di halaman Kebijakan Refund.",
  },
  admin: { emails: [] },
  // Unset until Myna Health gets its own OpenPanel project.
  analytics: { openpanelClientId: null },
  // Unset until Myna Health gets its own Sentry project.
  monitoring: {
    sentryDsn: null,
  },
});
