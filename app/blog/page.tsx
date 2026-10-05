import Link from "next/link";
import PageHead from "@/components/PageHead";
import { visibleArticles } from "@/lib/blog-data";

export const metadata = {
  title: "المدوّنة",
  description:
    "نصايح سفر من ناس بتسافر وبتحجز كل يوم: إمتى أسعار الطيران بتنزل، والفيزا، وقايمة ما قبل السفر، وحكايات عن أسوان والنوبة من أهلها.",
};

// Articles are edited in the admin panel, so the list is rendered on each visit.
export const dynamic = "force-dynamic";

export default async function Page() {
  const articles = await visibleArticles();
  return (
    <>
      <PageHead
        title="المدوّنة"
        lead="نصايح سفر من ناس بتسافر وبتحجز كل يوم، وحكايات عن أسوان والنوبة من أهلها."
      />
      <section className="section container">
        <div className="grid-3">
          {articles.map((a) => (
            <article key={a.slug} className="card post-card">
              <span className="post-topic">{a.topic === "aswan" ? "أسوان والنوبة" : "نصايح سفر"}</span>
              <h2>
                <Link href={`/blog/${a.slug}`}>{a.title}</Link>
              </h2>
              <p className="muted">{a.description}</p>
              <Link href={`/blog/${a.slug}`} className="text-link">
                اقرا المقال ←
              </Link>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
