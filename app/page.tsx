import Link from "next/link";
import NubianStrip from "@/components/NubianStrip";
import OfferCard from "@/components/OfferCard";
import WhatsAppIcon from "@/components/WhatsAppIcon";
import { bookableOffers } from "@/lib/offers-data";
import { SITE, whatsappLink } from "@/lib/site";

// Offers come from the database, so the page is rendered on each visit.
export const dynamic = "force-dynamic";

const STEPS = [
  { title: "ابعتلنا طلبك", text: "على واتساب أو من الفورم: رايح فين، وإمتى، وكام فرد." },
  { title: "نرجعلك بأكتر من سعر", text: "خلال 24 ساعة، وتختار اللي يريحك." },
  { title: "تدفع وتستلم", text: "تذكرتك أو تأكيد رحلتك، بالطريقة اللي تناسبك." },
];

const WHY = [
  { title: "أكتر من اختيار", text: "مش سعر واحد وخلاص، بنوريك البدائل وإنت تقرر." },
  { title: "بنفهم ظروفك", text: "سواء إنت في مصر أو شغال برّه، عندنا طرق دفع ومواعيد تواصل تناسبك." },
  { title: "من الجنوب", text: "رحلات أسوان والنوبة عندنا مش برنامج سياحي وبس، دي بلدنا." },
  { title: "واضحين من الأول", text: "السعر اللي نتفق عليه هو اللي تدفعه، وشروط الإلغاء مكتوبة قدامك." },
];

export default async function HomePage() {
  const latestOffers = (await bookableOffers()).slice(0, 3);

  return (
    <>
      <section className="hero">
        <div className="container hero-inner">
          <h1>{SITE.name}</h1>
          <p className="hero-lead">{SITE.tagline}.</p>
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
            <p>
              محلي ودولي. بندوّرلك على أكتر من سعر وأكتر من شركة، ونعرضهم عليك وإنت تختار اللي يناسبك في السعر
              والمواعيد.
            </p>
            <Link href="/offers" className="text-link">شوف عروض الطيران ←</Link>
          </article>
          <article className="card service-card">
            <span className="service-icon" aria-hidden="true">☀</span>
            <h3>رحلات أسوان والنوبة</h3>
            <p>
              برامج جاهزة في موسم الشتا، من المركب في النيل لحد البيوت النوبية الملوّنة. كل حاجة مترتبة، وإنت
              عليك تستمتع بس.
            </p>
            <Link href="/aswan-nubia" className="text-link">شوف الرحلات ←</Link>
          </article>
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
            <Link className="btn btn-gold" href="/how-we-work">اعرف التفاصيل</Link>
          </div>
        </div>
      </section>

      <section className="section container">
        <h2 className="section-title">ليه بلاد الدهب</h2>
        <div className="why-grid">
          {WHY.map((w) => (
            <div key={w.title} className="why-item">
              <h3>{w.title}</h3>
              <p>{w.text}</p>
            </div>
          ))}
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

      <section className="section section-sand">
        <div className="container center">
          <h2 className="section-title">عندك سفرية في بالك؟</h2>
          <p className="section-sub">ابعتلنا ونرتّبهالك.</p>
          <a className="btn btn-wa btn-lg" href={whatsappLink()} target="_blank" rel="noopener noreferrer">
            <WhatsAppIcon size={22} /> كلّمنا على واتساب
          </a>
        </div>
      </section>
    </>
  );
}
