import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { listImages, smallUrl } from "@/lib/uploads";
import TripForm from "../TripForm";

export const metadata = { title: "رحلة جديدة" };

export default async function Page() {
  await requireAdmin();
  const images = (await listImages()).map((i) => ({ name: i.name, alt: i.alt, small: smallUrl(i.name) }));
  return (
    <>
      <Link href="/admin/trips" className="admin-back">
        → الرحلات
      </Link>
      <h1>رحلة جديدة</h1>
      <p className="muted">بعد ما تحفظ، هيظهرلك لينك الرحلة تنسخه وتبعته.</p>
      <TripForm initial={{ visible: "on" }} days={[{ title: "", items: "" }]} images={images} />
    </>
  );
}
