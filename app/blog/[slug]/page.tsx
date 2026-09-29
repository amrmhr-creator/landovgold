import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { marked } from "marked";
import JsonLd from "@/components/JsonLd";
import PageHead from "@/components/PageHead";
import WhatsAppIcon from "@/components/WhatsAppIcon";
import { ARTICLES, AUTHOR, getArticle } from "@/lib/blog";
import { articleLd } from "@/lib/seo";
import { whatsappLink } from "@/lib/site";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return ARTICLES.map((a) => ({ slug: a.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const a = getArticle((await params).slug);
  if (!a) return {};
  return {
    title: a.title,
    description: a.summary,
    openGraph: { type: "article", title: a.title, description: a.summary, modifiedTime: a.updated },
  };
}

function formatDay(iso: string) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("ar-EG", { day: "numeric", month: "long", year: "numeric" });
}

const CTA = {
  flights: { text: "عايز أحسن سعر لتذكرتك؟", button: "ابعتلنا وجهتك", href: "/offers#request" },
  aswan: { text: "عايز تشوف أسوان والنوبة بنفسك؟", button: "شوف برامج الرحلات", href: "/aswan-nubia" },
};

export default async function Page({ params }: Params) {
  const article = getArticle((await params).slug);
  if (!article) notFound();

  // Our own Markdown from lib/blog.ts, so rendering it as HTML is safe.
  const html = await marked.parse(article.body);
  const cta = CTA[article.topic];
  const more = ARTICLES.filter((a) => a.topic === article.topic && a.slug !== article.slug).slice(0, 3);

  return (
    <>
      <JsonLd data={articleLd(article)} />
      <PageHead title={article.title} back={{ href: "/blog", label: "المدوّنة" }} />

      <article className="section container prose">
        <p className="post-meta muted small">
          آخر تحديث: {formatDay(article.updated)} · {AUTHOR}
        </p>
        <div className="summary-box">
          <strong>الإجابة باختصار:</strong> {article.summary}
        </div>
        <div className="post-body" dangerouslySetInnerHTML={{ __html: html }} />

        <div className="cta-box">
          <p>{cta.text}</p>
          <div className="actions">
            <Link className="btn btn-gold" href={cta.href}>
              {cta.button}
            </Link>
            <a className="btn btn-wa" href={whatsappLink()} target="_blank" rel="noopener noreferrer">
              <WhatsAppIcon size={20} /> واتساب
            </a>
          </div>
        </div>

        {more.length > 0 && (
          <>
            <h2>اقرا كمان</h2>
            <ul>
              {more.map((a) => (
                <li key={a.slug}>
                  <Link href={`/blog/${a.slug}`}>{a.title}</Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </article>
    </>
  );
}
