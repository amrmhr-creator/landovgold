// Schema.org JSON-LD builders (GEO rules in CONTENT.md). Rendered with components/JsonLd.

import type { Article } from "./blog";
import { AUTHOR } from "./blog";
import type { FaqGroup } from "./faq";
import { offerTitle, type Offer } from "./offers";
import { BUSINESS, SITE, SOCIAL } from "./site";
import { tripHref, type Trip } from "./trips";

const ORG_ID = `${SITE.url}/#organization`;

export function organizationLd() {
  return {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    "@id": ORG_ID,
    name: SITE.name,
    ...(BUSINESS.legalName && { legalName: BUSINESS.legalName }),
    description: SITE.tagline,
    url: SITE.url,
    logo: `${SITE.url}/logo.png`,
    image: `${SITE.url}/images/hero-nile.webp`,
    telephone: `+${SITE.whatsappNumber}`,
    email: SITE.email,
    areaServed: "EG",
    ...(BUSINESS.address && {
      address: { "@type": "PostalAddress", streetAddress: BUSINESS.address, addressCountry: "EG" },
    }),
    ...(SOCIAL.length > 0 && { sameAs: SOCIAL.map((s) => s.href) }),
  };
}

export function faqLd(groups: FaqGroup[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: groups.flatMap((g) =>
      g.items.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a },
      })),
    ),
  };
}

export function articleLd(a: Article) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: a.title,
    description: a.summary,
    inLanguage: "ar",
    datePublished: a.published,
    dateModified: a.updated,
    author: { "@type": "Organization", name: AUTHOR, url: SITE.url },
    publisher: { "@id": ORG_ID },
    mainEntityOfPage: `${SITE.url}/blog/${a.slug}`,
  };
}

export function tripLd(t: Trip) {
  return {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    name: t.title,
    description: t.summary,
    image: `${SITE.url}${t.image.src}`,
    touristType: ["عائلات", "أصحاب", "مجموعات"],
    itinerary: {
      "@type": "ItemList",
      itemListElement: t.itinerary.map((day, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: day.title,
        description: day.items.join(" "),
      })),
    },
    // Offer markup needs a price, so it's left out until the trip has one.
    ...(t.price > 0 && {
      offers: {
        "@type": "Offer",
        price: t.price,
        priceCurrency: "EGP",
        url: `${SITE.url}${tripHref(t)}`,
        availability: "https://schema.org/InStock",
      },
    }),
    provider: { "@id": ORG_ID },
  };
}

export function offerLd(o: Offer) {
  return {
    "@context": "https://schema.org",
    "@type": "Offer",
    name: `تذكرة طيران ${offerTitle(o)} (${o.tripType})`,
    description: `${o.airline}، ${o.transit}، ${o.baggage}`,
    price: o.price,
    priceCurrency: "EGP",
    availability: "https://schema.org/InStock",
    validThrough: o.date,
    url: `${SITE.url}/flights/${o.slug}`,
    seller: { "@id": ORG_ID },
  };
}
