import Link from "next/link";
import CopyButton from "@/components/CopyButton";
import { requireAdmin } from "@/lib/admin-auth";
import { allArticles } from "@/lib/blog-data";
import { formatDate } from "@/lib/offers";
import { SITE } from "@/lib/site";
import { toggleArticleAction } from "../../actions";

export const metadata = { title: "المقالات" };

export default async function Page({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  await requireAdmin();
  const [{ saved }, articles] = await Promise.all([searchParams, allArticles()]);
  const savedArticle = articles.find((a) => a.slug === saved);
  const savedLink = savedArticle ? `${SITE.url}/blog/${savedArticle.slug}` : null;

  return (
    <>
      <div className="admin-title">
        <h1>المقالات</h1>
        <Link className="btn btn-gold" href="/admin/articles/new">
          + مقال جديد
        </Link>
      </div>

      {savedArticle && savedLink && (
        <div className="admin-saved" role="status">
          <p>
            <strong>✓ المقال اتحفظ.</strong> ده اللينك بتاعه:
          </p>
          <p className="admin-link">
            <a href={`/blog/${savedArticle.slug}`} target="_blank" dir="ltr">
              {savedLink}
            </a>{" "}
            <CopyButton text={savedLink} />
          </p>
        </div>
      )}

      <table className="admin-table">
        <thead>
          <tr>
            <th>المقال</th>
            <th>آخر تعديل</th>
            <th>الحالة</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {articles.map((a) => (
            <tr key={a.slug}>
              <td>
                <Link href={`/admin/articles/${a.slug}`}>{a.title}</Link>
                <br />
                <small className="muted">{a.topic === "aswan" ? "أسوان والنوبة" : "نصايح سفر"}</small>
              </td>
              <td className="nowrap">{formatDate(a.updated)}</td>
              <td>
                <span className={`admin-status ${a.hidden ? "is-hidden" : "is-live"}`}>{a.hidden ? "مخفي" : "ظاهر"}</span>
              </td>
              <td className="admin-row-actions">
                <CopyButton text={`${SITE.url}/blog/${a.slug}`} />
                <Link className="btn btn-outline btn-sm" href={`/admin/articles/${a.slug}`}>
                  تعديل
                </Link>
                <form action={toggleArticleAction}>
                  <input type="hidden" name="slug" value={a.slug} />
                  <input type="hidden" name="hide" value={a.hidden ? "0" : "1"} />
                  <button className="btn btn-outline btn-sm" type="submit">
                    {a.hidden ? "اظهره" : "اخفيه"}
                  </button>
                </form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
