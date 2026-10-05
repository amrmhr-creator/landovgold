import type { Metadata } from "next";
import { notFound } from "next/navigation";
import TripView from "@/components/views/TripView";
import { formatPrice } from "@/lib/offers";
import { clip, shareImageFor } from "@/lib/share";
import { findTrip, visibleTrips } from "@/lib/trips-data";

type Params = { params: Promise<{ slug: string }> };

// Trips are edited in the admin panel, so pages are rendered on each visit.
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const trip = await findTrip((await params).slug);
  if (!trip) return {};
  const title = trip.seoTitle || `${trip.title}: البرنامج يوم بيوم`;
  const description =
    trip.seoDescription ||
    clip(trip.price > 0 ? `${trip.duration}. ${trip.summary} يبدأ من ${formatPrice(trip.price)} للفرد بالطيارة.` : `${trip.duration}. ${trip.summary}`);
  const image = shareImageFor(trip.image.src);
  return { title, description, openGraph: { title, description, images: [{ url: image, width: 1200, height: 630 }] } };
}

export default async function TripPage({ params }: Params) {
  const trip = await findTrip((await params).slug);
  if (!trip) notFound();
  const trips = (await visibleTrips()).map((t) => ({ slug: t.slug, title: t.title }));
  return <TripView trip={trip} trips={trips} />;
}
