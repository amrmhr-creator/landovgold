import type { Metadata } from "next";
import { notFound } from "next/navigation";
import OfferView from "@/components/views/OfferView";
import { formatDate, formatPrice, isBookable, offerTitle } from "@/lib/offers";
import { getOffer } from "@/lib/offers-data";
import { shareImageFor } from "@/lib/share";
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
  const image = shareImageFor(photo?.src);
  return { title, description, openGraph: { title, description, images: [{ url: image, width: 1200, height: 630 }] } };
}

export default async function OfferPage({ params }: Params) {
  const offer = await getOffer(decodeURIComponent((await params).slug));
  if (!offer) notFound();
  const photo = (await sitePhotos()).byName(offer.image, offerTitle(offer));
  return <OfferView offer={offer} photo={photo} bookable={isBookable(offer)} />;
}
