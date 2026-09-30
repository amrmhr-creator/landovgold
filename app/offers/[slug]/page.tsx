import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import JsonLd from "@/components/JsonLd";
import LeadForm from "@/components/LeadForm";
import PageHead from "@/components/PageHead";
import WhatsAppIcon from "@/components/WhatsAppIcon";
import { formatDate, formatPrice, isBookable, offerTitle } from "@/lib/offers";
import { getOffer } from "@/lib/offers-data";
import { offerLd } from "@/lib/seo";
import { whatsappLink } from "@/lib/site";

type Params = { params: Promise<{ slug: string }> };

// Offers are added from the admin panel at any time, so each page is rendered on request.
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const offer = await getOffer(decodeURIComponent((await params).slug));
  if (!offer) return {};
  const title = `عرض طيران ${offerTitle(offer)} يبدأ من ${formatPrice(offer.price)}`;
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
      {/* Sample offers aren't real, so they don't get offer markup. */}
      {!offer.sample && bookable && <JsonLd data={offerLd(offer)} />}
      <PageHead title={title} back={{ href: "/offers", label: "كل العروض" }} />

      <section className="section container offer-layout">
        <div className="offer-main">
          {offer.sample && <p className="badge badge-inline">مثال — مش عرض حقيقي</p>}
          {!bookable && <p className="notice">العرض ده انتهى. كلّمنا ونجيبلك أقرب سعر ليه.</p>}
          <dl className="offer-facts">
            <div>
              <dt>السعر يبدأ من</dt>
              <dd className="price">
                {formatPrice(offer.price)} <small>للفرد، {offer.tripType}</small>
              </dd>
            </div>
            {facts.map(([k, v]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
          <p className="muted small">
            السعر حسب آخر تحديث، وممكن يتغير حسب المقاعد المتاحة. ابعتلنا ونأكدهولك.
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
