import { company, faqs, product } from "./site";

export function organizationLd(site: URL) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: product.legal.companyName,
    url: site.href,
    email: product.legal.contactEmail,
    brand: { "@type": "Brand", name: product.name },
    address: {
      "@type": "PostalAddress",
      streetAddress: company.addressLines[0],
      addressLocality: "Kota Depok",
      addressRegion: "Jawa Barat",
      postalCode: "16417",
      addressCountry: "ID",
    },
  };
}

export function productLd(site: URL) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.tagline,
    brand: { "@type": "Brand", name: product.name },
    offers: product.plans.map((p) => ({
      "@type": "Offer",
      name: p.label,
      price: String(p.priceIdr),
      priceCurrency: "IDR",
      availability: "https://schema.org/InStock",
      url: new URL("/harga/", site).href,
    })),
  };
}

export function faqLd(items: { q: string; a: string }[] = faqs) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}
