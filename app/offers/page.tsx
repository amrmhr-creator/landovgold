import LeadForm from "@/components/LeadForm";
import OfferCard from "@/components/OfferCard";
import PageHead from "@/components/PageHead";
import { availableOffers } from "@/lib/offers";

export const metadata = {
  title: "عروض الطيران",
  description:
    "عروض تذاكر طيران بأسعار مخفّضة على رحلات محلية ودولية، بتتحدّث باستمرار. ابعت وجهتك ونرجعلك بأكتر من سعر خلال 24 ساعة.",
};

export default function OffersPage() {
  const offers = availableOffers();

  return (
    <>
      <PageHead
        title="عروض الطيران"
        lead="عروض على رحلات محلية ودولية، بتتحدّث باستمرار. الأسعار في الطيران بتتغير كل يوم، فالسعر المكتوب هو آخر سعر وصلنا، وبنأكدهولك قبل الحجز."
      />

      <section className="section container">
        {offers.length > 0 ? (
          <div className="grid-3">
            {offers.map((o) => (
              <OfferCard key={o.slug} offer={o} />
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
    </>
  );
}
