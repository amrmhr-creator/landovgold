import Link from "next/link";
import { notFound } from "next/navigation";
import CopyButton from "@/components/CopyButton";
import { requireAdmin } from "@/lib/admin-auth";
import { AIRPORTS, airportLabel } from "@/lib/airports";
import { dbConfigured } from "@/lib/db";
import { getOfferById } from "@/lib/offers-data";
import { SITE } from "@/lib/site";
import { listImages, smallUrl } from "@/lib/uploads";
import OfferForm from "../OfferForm";

export const metadata = { title: "تعديل عرض" };

/** "دبي" → "دبي (DXB)" when the city is in the airport list, so the picker shows it the usual way. */
function asLabel(city: string) {
  const a = AIRPORTS.find((x) => x.city === city);
  return a ? airportLabel(a) : city;
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id < 1 || !dbConfigured()) notFound();
  const offer = await getOfferById(id);
  if (!offer) notFound();
  const link = `${SITE.url}/flights/${offer.slug}`;
  const images = (await listImages()).map((i) => ({ name: i.name, alt: i.alt, small: smallUrl(i.name) }));

  return (
    <>
      <Link href="/admin/offers" className="admin-back">
        → العروض
      </Link>
      <h1>تعديل عرض</h1>
      <p className="admin-link">
        <a href={`/flights/${offer.slug}`} target="_blank" dir="ltr">
          {link}
        </a>{" "}
        <CopyButton text={link} />
      </p>
      <p className="muted small">
        اللينك ثابت ومش بيتغير مع التعديل، فالبوستات القديمة هتفضل شغالة.{" "}
        <Link href={`/admin/preview/offer/${offer.slug}`}>معاينة العرض</Link>.
      </p>
      <OfferForm
        initial={{
          id: String(offer.id),
          slug: offer.slug,
          from: asLabel(offer.from),
          to: asLabel(offer.to),
          date: offer.date,
          tripType: offer.tripType,
          price: offer.price > 0 ? String(offer.price) : "",
          airline: offer.airline,
          transit: offer.transit,
          baggage: offer.baggage,
          extras: (offer.extras ?? []).join("\n"),
          available: offer.available ? "on" : "off",
          image: offer.image ?? "",
        }}
        images={images}
      />
    </>
  );
}
