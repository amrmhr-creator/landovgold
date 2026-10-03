import Link from "next/link";
import { formatDate, offerPrice, offerTitle, type Offer } from "@/lib/offers";

export default function OfferCard({ offer }: { offer: Offer }) {
  return (
    <article className={`card offer-card ${offer.available ? "" : "is-expired"}`}>
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
