import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ArticleView from "@/components/views/ArticleView";
import { findArticle, visibleArticles } from "@/lib/blog-data";

type Params = { params: Promise<{ slug: string }> };

// Articles are edited in the admin panel, so pages are rendered on each visit.
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const a = await findArticle(decodeURIComponent((await params).slug));
  if (!a) return {};
  return {
    title: a.title,
    description: a.summary,
    openGraph: { type: "article", title: a.title, description: a.summary, modifiedTime: a.updated },
  };
}

export default async function Page({ params }: Params) {
  const article = await findArticle(decodeURIComponent((await params).slug));
  if (!article) notFound();
  const more = (await visibleArticles()).filter((a) => a.topic === article.topic && a.slug !== article.slug).slice(0, 3);
  return <ArticleView article={article} more={more} />;
}
