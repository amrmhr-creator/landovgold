import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import JsonLd from "@/components/JsonLd";
import LeadForm from "@/components/LeadForm";
import PageHead from "@/components/PageHead";
import WhatsAppIcon from "@/components/WhatsAppIcon";
import { ASK_PRICE, formatDate, formatPrice, isBookable, offerTitle } from "@/lib/offers";
import { getOffer } from "@/lib/offers-data";
import { offerLd } from "@/lib/seo";
import { whatsappLink } from "@/lib/site";

type Params = { params: Promise<{ slug: string }> };

// Offers are added from the admin panel at any time, so each page is rendered on request.
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const offer = await getOffer(decodeURIComponent((await params).slug));
  if (!offer) return {};
  const title =
    offer.price > 0 ? `عرض طيران ${offerTitle(offer)} يبدأ من ${formatPrice(offer.price)}` : `عرض طيران ${offerTitle(offer)}`;
  const description = `${offer.tripType} على ${offer.airline}، ${formatDate(offer.date)}. ${offer.transit}، ${offer.baggage}. احجز على واتساب أو سيب بياناتك.`;
  return { title, description, openGraph: { title, description } };
}

export default async function OfferPage({ params }: Params) {
  const offer = await getOffer(decodeURIComponent((await params).slug));
  if (!offer) notFound();
  const bookable = isBookable(offer);

  const title = offerTitle(offer);
  const label = `${offer.from} إلى ${offer.to} يوم ${formatDate(offer.date)}`;
  const waMessage = `أهلاً، أنا مهتم بعرض ${label} اللي على موقعكم. ممكن التفاصيل؟`;

  const facts = [
    ["الوجهة", title],
    ["التاريخ", formatDate(offer.date)],
    ["شركة الطيران", offer.airline],
    ["الرحلة", `${offer.tripType} · ${offer.transit}`],
    ["الشنط", offer.baggage],
  ];

  return (
    <>
      {/* Offer markup needs a price, so offers without one don't get it. */}
      {offer.price > 0 && bookable && <JsonLd data={offerLd(offer)} />}
      <PageHead section="flights" title={title} back={{ href: "/flights", label: "كل عروض الطيران" }} />

      <section className="section container offer-layout">
        <div className="offer-main">
          {!bookable && <p className="notice">العرض ده انتهى. كلّمنا ونجيبلك أقرب سعر ليه.</p>}
          <dl className="offer-facts">
            {offer.price > 0 ? (
              <div>
                <dt>السعر يبدأ من</dt>
                <dd className="price">
                  {formatPrice(offer.price)} <small>للفرد، {offer.tripType}</small>
                </dd>
              </div>
            ) : (
              <div>
                <dt>السعر</dt>
                <dd className="price">{ASK_PRICE}</dd>
              </div>
            )}
            {facts.map(([k, v]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
          <p className="muted small">
            {offer.price > 0
              ? "السعر حسب آخر تحديث، وممكن يتغير حسب المقاعد المتاحة. ابعتلنا ونأكدهولك."
              : "أسعار الطيران بتتغير كل يوم، فابعتلنا ونقولّك سعر النهارده."}
          </p>
          {offer.extras && offer.extras.length > 0 && (
            <ul className="offer-details">
              {offer.extras.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>
          )}
          <p className="muted small">
            الإلغاء والتغيير حسب قواعد شركة الطيران. شوف <Link href="/cancellation-policy">سياسة الإلغاء</Link>.
          </p>
        </div>

        <aside className="offer-cta">
          <a className="btn btn-wa btn-block btn-lg" href={whatsappLink(waMessage)} target="_blank" rel="noopener noreferrer">
            <WhatsAppIcon size={22} /> احجز على واتساب
          </a>
          <LeadForm kind="offer" offer={offer.slug} offerLabel={label} title="مش حابب تفتح محادثة؟ سيب اسمك ورقمك ونكلمك إحنا." />
        </aside>
      </section>
    </>
  );
}
