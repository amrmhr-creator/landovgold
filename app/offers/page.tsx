import LeadForm from "@/components/LeadForm";
import NubianStrip from "@/components/NubianStrip";
import OfferCard from "@/components/OfferCard";
import { availableOffers } from "@/lib/offers";

export const metadata = {
  title: "عروض الطيران",
  description: "أحدث عروض تذاكر الطيران بأسعار مخفّضة، محلي ودولي. ابعت طلبك ونرجعلك بأكتر من سعر.",
};

export default function OffersPage() {
  const offers = availableOffers();

  return (
    <>
      <section className="page-head">
        <div className="container">
          <h1>عروض الطيران</h1>
          <p>أسعار مخفّضة محلي ودولي. الأسعار بتتغير بسرعة، فأكّد السعر معانا قبل الحجز.</p>
        </div>
      </section>
      <NubianStrip />

      <section className="section container">
        {offers.length > 0 ? (
          <div className="grid-3">
            {offers.map((o) => (
              <OfferCard key={o.slug} offer={o} />
            ))}
          </div>
        ) : (
          <p className="center muted">مفيش عروض متاحة دلوقتي. قولّنا وجهتك ونجيبلك أحسن سعر.</p>
        )}
      </section>

      <section className="section section-sand">
        <div className="container narrow">
          <h2 className="section-title">مش لاقي وجهتك؟</h2>
          <p className="section-sub">قولّنا رايح فين، ونرجعلك بأكتر من سعر تختار منهم.</p>
          <LeadForm title="اطلب سعر لوجهتك" />
        </div>
      </section>
    </>
  );
}
