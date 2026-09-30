import type { MetadataRoute } from "next";
import { ARTICLES } from "@/lib/blog";
import { bookableOffers } from "@/lib/offers-data";
import { LEGAL, NAV, SITE } from "@/lib/site";

// Offers come from the database, so the sitemap is built on each request.
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages = [...NAV, ...LEGAL].map((p) => ({ url: `${SITE.url}${p.href === "/" ? "" : p.href}` }));
  const offers = (await bookableOffers()).filter((o) => !o.sample).map((o) => ({ url: `${SITE.url}/offers/${o.slug}` }));
  const articles = ARTICLES.map((a) => ({ url: `${SITE.url}/blog/${a.slug}`, lastModified: a.updated }));
  return [...pages, ...offers, ...articles];
}
