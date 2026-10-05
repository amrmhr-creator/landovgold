import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { imageUrl, listImages, smallUrl } from "@/lib/uploads";
import ArticleForm from "../ArticleForm";

export const metadata = { title: "مقال جديد" };

export default async function Page() {
  await requireAdmin();
  const images = (await listImages()).map((i) => ({ name: i.name, alt: i.alt, src: imageUrl(i.name), small: smallUrl(i.name) }));
  return (
    <>
      <Link href="/admin/articles" className="admin-back">
        → المقالات
      </Link>
      <h1>مقال جديد</h1>
      <ArticleForm initial={{ visible: "on", topic: "flights", body: "" }} images={images} />
    </>
  );
}
