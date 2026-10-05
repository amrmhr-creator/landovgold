import { notFound } from "next/navigation";
import PreviewBar from "@/components/PreviewBar";
import TripView from "@/components/views/TripView";
import { requireAdmin } from "@/lib/admin-auth";
import { tripHref } from "@/lib/trips";
import { previewTrip, visibleTrips } from "@/lib/trips-data";

export const metadata = { title: "معاينة رحلة" };
export const dynamic = "force-dynamic";

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  await requireAdmin();
  const trip = await previewTrip(decodeURIComponent((await params).slug));
  if (!trip) notFound();
  const trips = (await visibleTrips()).map((t) => ({ slug: t.slug, title: t.title }));
  if (!trips.some((t) => t.slug === trip.slug)) trips.unshift({ slug: trip.slug, title: trip.title });
  return (
    <>
      <PreviewBar hidden={!!trip.hidden} editHref={`/admin/trips/${trip.slug}`} publicHref={tripHref(trip)} />
      <TripView trip={trip} trips={trips} />
    </>
  );
}
