import Link from "next/link";
import NubianStrip from "@/components/NubianStrip";
import OfferCard from "@/components/OfferCard";
import WhatsAppIcon from "@/components/WhatsAppIcon";
import { availableOffers } from "@/lib/offers";
import { SITE, whatsappLink } from "@/lib/site";

const STEPS = [
  { title: "تبعت طلبك", text: "على واتساب أو من الفورم: الوجهة والتاريخ وعدد المسافرين." },
  { title: "نرجعلك بأكتر من سعر", text: "بندوّر لك ونبعتلك كذا اختيار في خلال 24 ساعة." },
  { title: "تختار وتدفع", text: "إنستاباي أو المحفظة أو لينك دفع بالكارت، حتى لو انت برّه مصر." },
];

export default function HomePage() {
  const latestOffers = availableOffers().slice(0, 3);

  return (
    <>
      <section className="hero">
        <div className="container hero-inner">
          <h1>{SITE.name}</h1>
          <p className="hero-lead">{SITE.tagline}</p>
          <div className="actions">
            <a className="btn btn-wa" href={whatsappLink()} target="_blank" rel="noopener noreferrer">
              <WhatsAppIcon size={20} /> كلّمنا على واتساب
            </a>
            <Link className="btn btn-gold" href="/offers">
              شوف العروض
            </Link>
          </div>
        </div>
      </section>

      <NubianStrip />

      <section className="section container">
        <h2 className="section-title">خدماتنا</h2>
        <div className="grid-2">
          <article className="card service-card">
            <span className="service-icon" aria-hidden="true">✈</span>
            <h3>تذاكر طيران بأسعار مخفّضة</h3>
            <p>محلي ودولي. بنعرض عليك أكتر من سعر وانت تختار اللي يناسبك.</p>
            <Link href="/offers" className="text-link">عروض الطيران ←</Link>
          </article>
          <article className="card service-card">
            <span className="service-icon" aria-hidden="true">☀</span>
            <h3>رحلات أسوان والنوبة</h3>
            <p>برامج ثابتة يوم بيوم في موسم الشتا، بروح الجنوب وبساطته.</p>
            <Link href="/aswan-nubia" className="text-link">برامج الرحلات ←</Link>
          </article>
        </div>
      </section>

      <NubianStrip className="strip-short" />

      <section className="section container">
        <h2 className="section-title">أحدث العروض</h2>
        {latestOffers.length > 0 ? (
          <div className="grid-3">
            {latestOffers.map((o) => (
              <OfferCard key={o.slug} offer={o} />
            ))}
          </div>
        ) : (
          <p className="section-sub">مفيش عروض متاحة دلوقتي، كلّمنا ونجيبلك أحسن سعر.</p>
        )}
        <div className="center more-link">
          <Link className="btn btn-outline" href="/offers">كل العروض</Link>
        </div>
      </section>

      <section className="section section-navy">
        <div className="container">
          <h2 className="section-title">إزاي بنشتغل</h2>
          <ol className="steps">
            {STEPS.map((s, i) => (
              <li key={s.title}>
                <span className="step-num">{i + 1}</span>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </li>
            ))}
          </ol>
          <div className="center">
            <Link className="btn btn-gold" href="/how-we-work">اعرف التفاصيل وطرق الدفع</Link>
          </div>
        </div>
      </section>
    </>
  );
}
