import type { MetadataRoute } from "next";
import { ARTICLES } from "@/lib/blog";
import { OFFERS } from "@/lib/offers";
import { LEGAL, NAV, SITE } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = [...NAV, ...LEGAL].map((p) => ({ url: `${SITE.url}${p.href === "/" ? "" : p.href}` }));
  const offers = OFFERS.filter((o) => o.available && !o.sample).map((o) => ({ url: `${SITE.url}/offers/${o.slug}` }));
  const articles = ARTICLES.map((a) => ({ url: `${SITE.url}/blog/${a.slug}`, lastModified: a.updated }));
  return [...pages, ...offers, ...articles];
}
