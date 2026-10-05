import Link from "next/link";
import CopyButton from "@/components/CopyButton";
import DeleteButton from "@/components/DeleteButton";
import { requireAdmin } from "@/lib/admin-auth";
import { dbConfigured, describeError } from "@/lib/db";
import { cairoToday, formatDate, offerPrice, offerTitle, type Offer } from "@/lib/offers";
import { allOffers } from "@/lib/offers-data";
import { SITE } from "@/lib/site";
import { toggleOfferAction } from "../../actions";

export const metadata = { title: "العروض" };

function status(o: Offer) {
  if (o.date < cairoToday()) return { label: "تاريخه عدّى", className: "is-past" };
  if (!o.available) return { label: "مخفي", className: "is-hidden" };
  return { label: "ظاهر", className: "is-live" };
}

export default async function Page({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  await requireAdmin();
  const { saved } = await searchParams;

  let offers: Offer[] = [];
  let error = false;
  if (dbConfigured()) {
    try {
      // Upcoming first, then past ones (newest first).
      const all = await allOffers();
      const today = cairoToday();
      offers = [...all.filter((o) => o.date >= today), ...all.filter((o) => o.date < today).reverse()];
    } catch (err) {
      console.error(`[admin] pid ${process.pid}: listing offers failed: ${describeError(err)}`);
      error = true;
    }
  }

  const savedLink = saved ? `${SITE.url}/flights/${saved}` : null;

  return (
    <>
      <div className="admin-title">
        <h1>العروض</h1>
        <Link className="btn btn-gold" href="/admin/offers/new">
          + عرض جديد
        </Link>
      </div>

      {savedLink && (
        <div className="admin-saved" role="status">
          <p>
            <strong>✓ العرض اتحفظ.</strong> ده اللينك اللي تحطه في البوست:
          </p>
          <p className="admin-link">
            <a href={`/flights/${saved}`} target="_blank" dir="ltr">
              {savedLink}
            </a>{" "}
            <CopyButton text={savedLink} />
          </p>
        </div>
      )}

      {error && <p className="notice">مش قادرين نقرا العروض من قاعدة البيانات دلوقتي. جرّب تاني بعد شوية.</p>}
      {!error && offers.length === 0 && <p className="muted">مفيش عروض لسه. اضغط &quot;عرض جديد&quot; عشان تضيف أول عرض.</p>}

      {offers.length > 0 && (
        <div className="table-wrap">
          <table className="table admin-table">
            <thead>
              <tr>
                <th>العرض</th>
                <th>التاريخ</th>
                <th>السعر</th>
                <th>الحالة</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {offers.map((o) => {
                const s = status(o);
                return (
                  <tr key={o.id}>
                    <td>
                      <Link href={`/admin/offers/${o.id}`}>{offerTitle(o)}</Link>
                      <br />
                      <small className="muted">
                        {o.tripType} · {o.airline}
                      </small>
                    </td>
                    <td className="nowrap">{formatDate(o.date)}</td>
                    <td className="nowrap">{offerPrice(o)}</td>
                    <td>
                      <span className={`admin-status ${s.className}`}>{s.label}</span>
                    </td>
                    <td className="admin-row-actions">
                      <CopyButton text={`${SITE.url}/flights/${o.slug}`} />
                      <Link className="btn btn-outline btn-sm" href={`/admin/offers/${o.id}`}>
                        تعديل
                      </Link>
                      <form action={toggleOfferAction}>
                        <input type="hidden" name="id" value={o.id} />
                        <input type="hidden" name="available" value={o.available ? "0" : "1"} />
                        <button type="submit" className="btn btn-outline btn-sm">
                          {o.available ? "إخفاء" : "إظهار"}
                        </button>
                      </form>
                      <DeleteButton kind="offer" itemKey={String(o.id)} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <p className="muted small">العرض بيختفي من الموقع لوحده بعد تاريخ السفر، بس اللينك بتاعه بيفضل شغال ويقول إن العرض انتهى.</p>
    </>
  );
}
