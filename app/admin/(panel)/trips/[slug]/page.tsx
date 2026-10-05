import Link from "next/link";
import { notFound } from "next/navigation";
import CopyButton from "@/components/CopyButton";
import { requireAdmin } from "@/lib/admin-auth";
import { SITE } from "@/lib/site";
import { tripHref } from "@/lib/trips";
import { tripForAdmin } from "@/lib/trips-data";
import { getPicks, listImages, smallUrl } from "@/lib/uploads";
import TripForm from "../TripForm";

export const metadata = { title: "تعديل رحلة" };

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  await requireAdmin();
  const slug = decodeURIComponent((await params).slug);
  const [trip, images, picks] = await Promise.all([tripForAdmin(slug), listImages(), getPicks()]);
  if (!trip) notFound();
  const link = `${SITE.url}${tripHref(trip)}`;

  return (
    <>
      <Link href="/admin/trips" className="admin-back">
        → الرحلات
      </Link>
      <h1>تعديل رحلة</h1>
      <p className="admin-link">
        <a href={tripHref(trip)} target="_blank" dir="ltr">
          {link}
        </a>{" "}
        <CopyButton text={link} />
      </p>
      <p className="muted small">اللينك ثابت ومش بيتغير مع التعديل.</p>
      <TripForm
        initial={{
          slug: trip.slug,
          title: trip.title,
          duration: trip.duration,
          price: trip.price > 0 ? String(trip.price) : "",
          dates: trip.dates ?? "",
          summary: trip.summary,
          photo: picks.trips[trip.slug] ?? "",
          visible: trip.hidden ? "off" : "on",
        }}
        days={trip.itinerary.map((d) => ({ title: d.title, items: d.items.join("\n") }))}
        images={images.map((i) => ({ name: i.name, alt: i.alt, small: smallUrl(i.name) }))}
      />
    </>
  );
}
