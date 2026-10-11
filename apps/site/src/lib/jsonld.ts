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
