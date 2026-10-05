import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { listImages, smallUrl } from "@/lib/uploads";
import OfferForm from "../OfferForm";

export const metadata = { title: "عرض جديد" };

export default async function Page() {
  await requireAdmin();
  const images = (await listImages()).map((i) => ({ name: i.name, alt: i.alt, small: smallUrl(i.name) }));
  return (
    <>
      <Link href="/admin/offers" className="admin-back">
        → العروض
      </Link>
      <h1>عرض جديد</h1>
      <p className="muted">بعد ما تحفظ، هيظهرلك لينك العرض تنسخه وتحطه في البوست.</p>
      <OfferForm initial={{ available: "on" }} images={images} />
    </>
  );
}
