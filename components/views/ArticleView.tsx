import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import PageHead from "@/components/PageHead";
import WhatsAppIcon from "@/components/WhatsAppIcon";
import { AUTHOR, type Article } from "@/lib/blog";
import { renderMarkdown } from "@/lib/markdown";
import { articleLd } from "@/lib/seo";
import { whatsappLink } from "@/lib/site";

function formatDay(iso: string) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("ar-EG", { day: "numeric", month: "long", year: "numeric" });
}

const CTA = {
  flights: { text: "عايز أحسن سعر لتذكرتك؟", button: "ابعتلنا وجهتك", href: "/flights#request" },
  aswan: { text: "عايز تشوف أسوان والنوبة بنفسك؟", button: "شوف برامج الرحلات", href: "/aswan-nubia" },
};

/** An article's page. Used by the site and by the admin preview. */
export default function ArticleView({ article, more }: { article: Article; more: { slug: string; title: string }[] }) {
  const html = renderMarkdown(article.body);
  const cta = CTA[article.topic];

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
