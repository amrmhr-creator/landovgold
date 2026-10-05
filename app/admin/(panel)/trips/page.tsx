import Link from "next/link";
import CopyButton from "@/components/CopyButton";
import DeleteButton from "@/components/DeleteButton";
import { requireAdmin } from "@/lib/admin-auth";
import { formatPrice } from "@/lib/offers";
import { SITE } from "@/lib/site";
import { ASK_TRIP_PRICE, tripHref } from "@/lib/trips";
import { allTrips } from "@/lib/trips-data";
import { toggleTripAction } from "../../actions";

export const metadata = { title: "الرحلات" };

export default async function Page({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  await requireAdmin();
  const [{ saved }, trips] = await Promise.all([searchParams, allTrips()]);
  const savedTrip = trips.find((t) => t.slug === saved);
  const savedLink = savedTrip ? `${SITE.url}${tripHref(savedTrip)}` : null;

  return (
    <>
      <div className="admin-title">
        <h1>الرحلات</h1>
        <Link className="btn btn-gold" href="/admin/trips/new">
          + رحلة جديدة
        </Link>
      </div>

      {savedTrip && savedLink && (
        <div className="admin-saved" role="status">
          <p>
            <strong>✓ الرحلة اتحفظت.</strong> ده اللينك بتاعها:
          </p>
          <p className="admin-link">
            <a href={tripHref(savedTrip)} target="_blank" dir="ltr">
              {savedLink}
            </a>{" "}
            <CopyButton text={savedLink} />
          </p>
        </div>
      )}

      <table className="admin-table">
        <thead>
          <tr>
            <th>الرحلة</th>
            <th>السعر</th>
            <th>الحالة</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {trips.map((t) => (
            <tr key={t.slug}>
              <td>
                <Link href={`/admin/trips/${t.slug}`}>{t.title}</Link>
                <br />
                <small className="muted">{t.duration}</small>
              </td>
              <td className="nowrap">{t.price > 0 ? formatPrice(t.price) : ASK_TRIP_PRICE}</td>
              <td>
                <span className={`admin-status ${t.hidden ? "is-hidden" : "is-live"}`}>{t.hidden ? "مخفية" : "ظاهرة"}</span>
              </td>
              <td className="admin-row-actions">
                <CopyButton text={`${SITE.url}${tripHref(t)}`} />
                <Link className="btn btn-outline btn-sm" href={`/admin/trips/${t.slug}`}>
                  تعديل
                </Link>
                <Link className="btn btn-outline btn-sm" href={`/admin/preview/trip/${t.slug}`}>
                  معاينة
                </Link>
                <form action={toggleTripAction}>
                  <input type="hidden" name="slug" value={t.slug} />
                  <input type="hidden" name="hide" value={t.hidden ? "0" : "1"} />
                  <button className="btn btn-outline btn-sm" type="submit">
                    {t.hidden ? "اظهرها" : "اخفيها"}
                  </button>
                </form>
                <DeleteButton kind="trip" itemKey={t.slug} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
