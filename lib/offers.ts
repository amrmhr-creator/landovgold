// Flight offers: the type and display helpers (safe in the browser too).
// Offers themselves live in MySQL and are managed from /admin/offers; lib/offers-data.ts reads them.
// Each offer gets its own page at /flights/<slug>: that's the link that goes in the social post.

export type Offer = {
  id?: number; // set for offers stored in the database
  slug: string;
  from: string;
  to: string;
  price: number; // starting price per person, in EGP
  tripType: "ذهاب فقط" | "ذهاب وعودة";
  date: string; // ISO date of travel, e.g. "2026-11-15"
  airline: string;
  transit: string; // "طيران مباشر" or e.g. "ترانزيت في جدة"
  baggage: string; // e.g. "شنطة 23 كيلو"
  extras?: string[]; // anything else worth saying
  available: boolean;
  sample?: boolean; // placeholder offer, shown with an "مثال" badge
};

/** Shown only when no database is configured (local development). */
export const SAMPLE_OFFERS: Offer[] = [
  {
    slug: "cairo-riyadh",
    from: "القاهرة",
    to: "الرياض",
    price: 9500,
    tripType: "ذهاب فقط",
    date: "2026-11-12",
    airline: "مصر للطيران",
    transit: "طيران مباشر",
    baggage: "شنطة 23 كيلو",
    available: true,
    sample: true,
  },
  {
    slug: "cairo-dubai",
    from: "القاهرة",
    to: "دبي",
    price: 11200,
    tripType: "ذهاب وعودة",
    date: "2026-11-20",
    airline: "طيران الإمارات",
    transit: "طيران مباشر",
    baggage: "شنطة 30 كيلو",
    available: true,
    sample: true,
  },
  {
    slug: "cairo-aswan",
    from: "القاهرة",
    to: "أسوان",
    price: 3400,
    tripType: "ذهاب وعودة",
    date: "2026-12-05",
    airline: "مصر للطيران",
    transit: "طيران مباشر",
    baggage: "شنطة 20 كيلو",
    available: true,
    sample: true,
  },
];

export function offerTitle(o: Offer) {
  return `${o.from} ← ${o.to}`;
}

export function formatPrice(price: number) {
  return `${price.toLocaleString("ar-EG")} ج.م`;
}

export function formatDate(iso: string) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("ar-EG", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** Today in Cairo as YYYY-MM-DD. */
export function cairoToday() {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Africa/Cairo" });
}

/** Listed on the site: not hidden, and the travel date hasn't passed. */
export function isBookable(o: Offer) {
  return o.available && o.date >= cairoToday();
}
