import Image from "next/image";
import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import LeadForm from "@/components/LeadForm";
import PageHead from "@/components/PageHead";
import WhatsAppIcon from "@/components/WhatsAppIcon";
import { ASK_PRICE, formatDate, formatPrice, offerTitle, type Offer } from "@/lib/offers";
import { offerLd } from "@/lib/seo";
import { whatsappLink } from "@/lib/site";

type Photo = { src: string; alt: string; width: number; height: number };

/** An offer's page. Used by the site and by the admin preview. */
export default function OfferView({ offer, photo, bookable }: { offer: Offer; photo?: Photo; bookable: boolean }) {
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
          {photo && (
            <Image src={photo.src} alt={photo.alt} width={photo.width} height={photo.height} sizes="(min-width: 900px) 700px, 100vw" className="offer-image" priority />
          )}
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
