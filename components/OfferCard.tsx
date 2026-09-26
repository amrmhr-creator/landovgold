import Link from "next/link";
import { formatDate, formatPrice, offerTitle, type Offer } from "@/lib/offers";

export default function OfferCard({ offer }: { offer: Offer }) {
  return (
    <article className={`card offer-card ${offer.available ? "" : "is-expired"}`}>
      {offer.sample && <span className="badge">مثال</span>}
      {!offer.available && <span className="badge badge-expired">انتهى</span>}
      <h3>{offerTitle(offer)}</h3>
      <dl>
        <div>
          <dt>السعر</dt>
          <dd>{formatPrice(offer.price)}</dd>
        </div>
        <div>
          <dt>التاريخ</dt>
          <dd>{formatDate(offer.date)}</dd>
        </div>
      </dl>
      <Link className="btn btn-gold btn-block" href={`/offers/${offer.slug}`}>
        تفاصيل العرض
      </Link>
    </article>
  );
}
