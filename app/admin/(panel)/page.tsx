import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { dbConfigured, describeError } from "@/lib/db";
import { leadStats } from "@/lib/leads";
import { bookableOffers } from "@/lib/offers-data";

export default async function Page() {
  await requireAdmin();

  let stats: Awaited<ReturnType<typeof leadStats>> | null = null;
  let error = false;
  if (dbConfigured()) {
    try {
      stats = await leadStats();
    } catch (err) {
      console.error(`[admin] pid ${process.pid}: stats failed: ${describeError(err)}`);
      error = true;
    }
  }
  const offers = await bookableOffers();

  return (
    <>
      <h1>أهلاً بيك</h1>
      {error && <p className="notice">مش قادرين نقرا الطلبات من قاعدة البيانات دلوقتي. جرّب تاني بعد شوية.</p>}
      <div className="admin-stats">
        <Link href="/admin/leads" className="card">
          <b>{stats?.week ?? "–"}</b>
          <span>طلب في آخر 7 أيام</span>
        </Link>
        <Link href="/admin/leads" className="card">
          <b>{stats?.total ?? "–"}</b>
          <span>كل الطلبات</span>
        </Link>
        <Link href="/admin/leads?marketing=1" className="card">
          <b>{stats?.marketing ?? "–"}</b>
          <span>موافقين على العروض</span>
        </Link>
        <Link href="/admin/offers" className="card">
          <b>{offers.length}</b>
          <span>عرض معروض على الموقع</span>
        </Link>
      </div>
      <div className="actions">
        <Link className="btn btn-gold" href="/admin/offers/new">
          + عرض جديد
        </Link>
        <Link className="btn btn-outline" href="/admin/leads">
          شوف الطلبات
        </Link>
        <Link className="btn btn-outline" href="/admin/guide">
          دليل الاستخدام
        </Link>
      </div>
    </>
  );
}
