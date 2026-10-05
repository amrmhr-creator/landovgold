import { notFound } from "next/navigation";
import PreviewBar from "@/components/PreviewBar";
import ArticleView from "@/components/views/ArticleView";
import { requireAdmin } from "@/lib/admin-auth";
import { articleForAdmin, visibleArticles } from "@/lib/blog-data";

export const metadata = { title: "معاينة مقال" };
export const dynamic = "force-dynamic";

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  await requireAdmin();
  const article = await articleForAdmin(decodeURIComponent((await params).slug));
  if (!article) notFound();
  const more = (await visibleArticles()).filter((a) => a.topic === article.topic && a.slug !== article.slug).slice(0, 3);
  return (
    <>
      <PreviewBar hidden={!!article.hidden} editHref={`/admin/articles/${article.slug}`} publicHref={`/blog/${article.slug}`} />
      <ArticleView article={article} more={more} />
    </>
  );
}
