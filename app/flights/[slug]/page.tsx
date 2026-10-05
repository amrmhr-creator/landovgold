import type { Metadata } from "next";
import { notFound } from "next/navigation";
import OfferView from "@/components/views/OfferView";
import { formatDate, formatPrice, isBookable, offerTitle } from "@/lib/offers";
import { getOffer } from "@/lib/offers-data";
import { sitePhotos } from "@/lib/uploads";

type Params = { params: Promise<{ slug: string }> };

// Offers are added from the admin panel at any time, so each page is rendered on request.
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const offer = await getOffer(decodeURIComponent((await params).slug));
  if (!offer) return {};
  const title =
    offer.price > 0 ? `عرض طيران ${offerTitle(offer)} يبدأ من ${formatPrice(offer.price)}` : `عرض طيران ${offerTitle(offer)}`;
  const description = `${offer.tripType} على ${offer.airline}، ${formatDate(offer.date)}. ${offer.transit}، ${offer.baggage}. احجز على واتساب أو سيب بياناتك.`;
  const photo = (await sitePhotos()).byName(offer.image);
  return { title, description, openGraph: { title, description, ...(photo && { images: [photo.src] }) } };
}

export default async function OfferPage({ params }: Params) {
  const offer = await getOffer(decodeURIComponent((await params).slug));
  if (!offer) notFound();
  const photo = (await sitePhotos()).byName(offer.image, offerTitle(offer));
  return <OfferView offer={offer} photo={photo} bookable={isBookable(offer)} />;
}
