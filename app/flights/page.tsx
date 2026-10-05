import FaqList from "@/components/FaqList";
import JsonLd from "@/components/JsonLd";
import LeadForm from "@/components/LeadForm";
import OfferCard from "@/components/OfferCard";
import PageHead from "@/components/PageHead";
import WhatsAppIcon from "@/components/WhatsAppIcon";
import { sectionFaq } from "@/lib/faq";
import { bookableOffers } from "@/lib/offers-data";
import { SECTIONS } from "@/lib/sections";
import { offerTitle } from "@/lib/offers";
import { faqLd } from "@/lib/seo";
import { whatsappLink } from "@/lib/site";
import { sitePhotos } from "@/lib/uploads";

// Offers come from the database, so the page is rendered on each visit.
export const dynamic = "force-dynamic";

export const metadata = {
  title: "عروض الطيران",
  description:
    "عروض تذاكر طيران بأسعار تناسبك على رحلات محلية ودولية، بتتحدّث باستمرار. ابعت وجهتك ونرجعلك بأكتر من سعر خلال 24 ساعة.",
};

export default async function FlightsPage() {
  const [offers, photos] = await Promise.all([bookableOffers(), sitePhotos()]);
  const faq = sectionFaq("flights");

  return (
    <>
      <JsonLd data={faqLd(faq)} />
      <PageHead
        section="flights"
        title="عروض الطيران"
        lead="عروض على رحلات محلية ودولية، بتتحدّث باستمرار. الأسعار في الطيران بتتغير كل يوم، فالسعر المكتوب هو آخر سعر وصلنا، وبنأكدهولك قبل الحجز."
      />

      <section className="section container">
        {offers.length > 0 ? (
          <div className="grid-3">
            {offers.map((o) => (
              <OfferCard key={o.slug} offer={o} photo={photos.byName(o.image, offerTitle(o))} />
            ))}
          </div>
        ) : (
          <p className="center muted">
            مفيش عروض متاحة دلوقتي، بس ده مش معناه إننا مش هنلاقيلك سعر كويس. قولّنا رايح فين وإمتى، ونرجعلك
            بأكتر من اختيار.
          </p>
        )}
      </section>

      <section className="section section-sand" id="request">
        <div className="container narrow">
          <h2 className="section-title">مش لاقي وجهتك؟</h2>
          <p className="section-sub">ابعتلنا المكان والميعاد، وإحنا ندوّرلك.</p>
          <LeadForm kind="flight" />
        </div>
      </section>

      <section className="section container prose" id="faq">
        <h2 className="section-title">أسئلة عن تذاكر الطيران</h2>
        <FaqList groups={faq} plain />
        <div className="center more-link">
          <a className="btn btn-wa" href={whatsappLink(SECTIONS.flights.whatsapp)} target="_blank" rel="noopener noreferrer">
            <WhatsAppIcon size={20} /> اسألنا على واتساب
          </a>
        </div>
      </section>
    </>
  );
}
