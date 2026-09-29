import Link from "next/link";
import PageHead from "@/components/PageHead";
import { ARTICLES } from "@/lib/blog";

export const metadata = {
  title: "المدوّنة",
  description:
    "نصايح سفر من ناس بتسافر وبتحجز كل يوم: إمتى أسعار الطيران بتنزل، والفيزا، وقايمة ما قبل السفر، وحكايات عن أسوان والنوبة من أهلها.",
};

export default function Page() {
  return (
    <>
      <PageHead
        title="المدوّنة"
        lead="نصايح سفر من ناس بتسافر وبتحجز كل يوم، وحكايات عن أسوان والنوبة من أهلها."
      />
      <section className="section container">
        <div className="grid-3">
          {ARTICLES.map((a) => (
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
