import Link from "next/link";
import { notFound } from "next/navigation";
import CopyButton from "@/components/CopyButton";
import { requireAdmin } from "@/lib/admin-auth";
import { articleForAdmin } from "@/lib/blog-data";
import { SITE } from "@/lib/site";
import { imageUrl, listImages, smallUrl } from "@/lib/uploads";
import ArticleForm from "../ArticleForm";

export const metadata = { title: "تعديل مقال" };

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  await requireAdmin();
  const slug = decodeURIComponent((await params).slug);
  const [article, images] = await Promise.all([articleForAdmin(slug), listImages()]);
  if (!article) notFound();
  const link = `${SITE.url}/blog/${article.slug}`;

  return (
    <>
      <Link href="/admin/articles" className="admin-back">
        → المقالات
      </Link>
      <h1>تعديل مقال</h1>
      <p className="admin-link">
        <a href={`/blog/${article.slug}`} target="_blank" dir="ltr">
          {link}
        </a>{" "}
        <CopyButton text={link} />
      </p>
      <p className="muted small">
        تاريخ &quot;آخر تحديث&quot; بيتغيّر لوحده لما تحفظ. عايز تشوف شكله قبل ما الناس تشوفه؟ شيل علامة &quot;ظاهر&quot;، واحفظ،
        وبعدين <Link href={`/admin/preview/article/${article.slug}`}>دوس معاينة</Link>.
      </p>
      <ArticleForm
        initial={{
          slug: article.slug,
          title: article.title,
          topic: article.topic,
          description: article.description,
          summary: article.summary,
          body: article.body,
          visible: article.hidden ? "off" : "on",
        }}
        images={images.map((i) => ({ name: i.name, alt: i.alt, src: imageUrl(i.name), small: smallUrl(i.name) }))}
      />
    </>
  );
}
