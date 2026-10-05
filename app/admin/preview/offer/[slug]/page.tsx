import { notFound } from "next/navigation";
import PreviewBar from "@/components/PreviewBar";
import OfferView from "@/components/views/OfferView";
import { requireAdmin } from "@/lib/admin-auth";
import { isBookable, offerTitle } from "@/lib/offers";
import { getOffer } from "@/lib/offers-data";
import { sitePhotos } from "@/lib/uploads";

export const metadata = { title: "معاينة عرض" };
export const dynamic = "force-dynamic";

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  await requireAdmin();
  const offer = await getOffer(decodeURIComponent((await params).slug));
  if (!offer) notFound();
  const photo = (await sitePhotos()).byName(offer.image, offerTitle(offer));
  return (
    <>
      <PreviewBar hidden={!isBookable(offer)} editHref={offer.id ? `/admin/offers/${offer.id}` : "/admin/offers"} publicHref={`/flights/${offer.slug}`} />
      {/* Shown as it will look once it's live, even while hidden. */}
      <OfferView offer={offer} photo={photo} bookable />
    </>
  );
}
