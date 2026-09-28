import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import LeadForm from "@/components/LeadForm";
import NubianStrip from "@/components/NubianStrip";
import WhatsAppIcon from "@/components/WhatsAppIcon";
import { OFFERS, formatDate, formatPrice, getOffer, offerTitle } from "@/lib/offers";
import { whatsappLink } from "@/lib/site";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return OFFERS.map((o) => ({ slug: o.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const offer = getOffer((await params).slug);
  if (!offer) return {};
  const title = `عرض ${offerTitle(offer)} بـ ${formatPrice(offer.price)}`;
  const description = `${formatDate(offer.date)}. ${offer.details.join("، ")}. احجز على واتساب أو سيب بياناتك.`;
  return { title, description, openGraph: { title, description } };
}

export default async function OfferPage({ params }: Params) {
  const offer = getOffer((await params).slug);
  if (!offer) notFound();

  const title = offerTitle(offer);
  const waMessage = `أهلاً بلاد الدهب، عايز أحجز عرض ${offer.from} إلى ${offer.to} يوم ${formatDate(offer.date)}`;

  return (
    <>
      <section className="page-head">
        <div className="container">
          <Link href="/offers" className="back-link">→ كل العروض</Link>
          <h1>{title}</h1>
          {offer.sample && <span className="badge badge-inline">مثال — مش عرض حقيقي</span>}
        </div>
      </section>
      <NubianStrip />

      <section className="section container offer-layout">
        <div className="offer-main">
          {!offer.available && (
            <p className="notice">العرض ده انتهى. كلّمنا ونجيبلك أقرب سعر ليه.</p>
          )}
          <dl className="offer-facts">
            <div>
              <dt>الوجهة</dt>
              <dd>{title}</dd>
            </div>
            <div>
              <dt>السعر</dt>
              <dd className="price">{formatPrice(offer.price)}</dd>
            </div>
            <div>
              <dt>التاريخ</dt>
              <dd>{formatDate(offer.date)}</dd>
            </div>
          </dl>
          {offer.details.length > 0 && (
            <ul className="offer-details">
              {offer.details.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>
          )}
          <p className="muted small">
            أسعار الطيران بتتغير باستمرار، والسعر بيتأكد معاك قبل الدفع. شوف{" "}
            <Link href="/cancellation-policy">سياسة الإلغاء</Link>.
          </p>
        </div>

        <aside className="offer-cta">
          <a className="btn btn-wa btn-block btn-lg" href={whatsappLink(waMessage)} target="_blank" rel="noopener noreferrer">
            <WhatsAppIcon size={22} /> احجز على واتساب
          </a>
          <LeadForm offer={offer.slug} offerLabel={`${title} يوم ${formatDate(offer.date)}`} />
        </aside>
      </section>
    </>
  );
}
