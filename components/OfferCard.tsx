import Image from "next/image";
import Link from "next/link";
import { formatDate, offerPrice, offerTitle, type Offer } from "@/lib/offers";

/** An offer photo picked in the admin panel. */
export type OfferPhoto = { src: string; alt: string; width: number; height: number };

export default function OfferCard({ offer, photo }: { offer: Offer; photo?: OfferPhoto }) {
  return (
    <article className={`card offer-card ${offer.available ? "" : "is-expired"}`}>
      {photo && (
        <Image src={photo.src} alt={photo.alt} width={photo.width} height={photo.height} sizes="(min-width: 900px) 360px, 100vw" className="offer-thumb" />
      )}
      {!offer.available && <span className="badge badge-expired">انتهى</span>}
      <h3>{offerTitle(offer)}</h3>
      <dl>
        <div>
          <dt>{offer.price > 0 ? "يبدأ من" : "السعر"}</dt>
          <dd>{offerPrice(offer)}</dd>
        </div>
        <div>
          <dt>التاريخ</dt>
          <dd>{formatDate(offer.date)}</dd>
        </div>
        <div>
          <dt>الرحلة</dt>
          <dd>
            {offer.tripType} · {offer.transit}
          </dd>
        </div>
      </dl>
      <Link className="btn btn-gold btn-block" href={`/flights/${offer.slug}`}>
        تفاصيل العرض
      </Link>
    </article>
  );
}
