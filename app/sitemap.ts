import type { MetadataRoute } from "next";
import { ARTICLES } from "@/lib/blog";
import { bookableOffers } from "@/lib/offers-data";
import { SECTION_LIST } from "@/lib/sections";
import { COMPANY_NAV, CONTACT_NAV, LEGAL, SITE } from "@/lib/site";
import { TRIPS, tripHref } from "@/lib/trips";

// Offers come from the database, so the sitemap is built on each request.
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const url = (path: string) => ({ url: `${SITE.url}${path}` });
  const pages = ["/", ...SECTION_LIST.map((s) => s.href), ...[...COMPANY_NAV, CONTACT_NAV, ...LEGAL].map((p) => p.href)];
  const offers = (await bookableOffers()).map((o) => url(`/flights/${o.slug}`));
  const trips = TRIPS.map((t) => url(tripHref(t)));
  const articles = ARTICLES.map((a) => ({ ...url(`/blog/${a.slug}`), lastModified: a.updated }));
  return [...pages.map((p) => url(p === "/" ? "" : p)), ...offers, ...trips, ...articles];
}
