import Image from "next/image";
import Link from "next/link";
import LeadForm from "@/components/LeadForm";
import NubianStrip from "@/components/NubianStrip";
import OfferCard from "@/components/OfferCard";
import WhatsAppIcon from "@/components/WhatsAppIcon";
import { formatPrice } from "@/lib/offers";
import { bookableOffers } from "@/lib/offers-data";
import { SECTIONS } from "@/lib/sections";
import { SITE, whatsappLink } from "@/lib/site";
import { TRIPS, tripHref } from "@/lib/trips";

// Offers come from the database, so the page is rendered on each visit.
export const dynamic = "force-dynamic";

const STEPS = [
  { title: "ابعتلنا طلبك", text: "على واتساب أو من الفورم: رايح فين، وإمتى، وكام فرد." },
  { title: "نرجعلك بأكتر من اختيار", text: "خلال 24 ساعة، بأسعارها وتفاصيلها." },
  { title: "تختار اللي يناسبك، واحنا نكمّل", text: "نخلّص الحجز ونبعتلك التأكيد على الواتساب." },
];

const WHY = [
  { title: "أكتر من اختيار", text: "مش سعر واحد وخلاص، بنوريك البدائل وإنت تقرر." },
  { title: "بنفهم ظروفك", text: "سواء إنت في مصر أو شغال برّه، عندنا طرق دفع ومواعيد تواصل تناسبك." },
  { title: "من الجنوب", text: "رحلات أسوان والنوبة عندنا مش برنامج سياحي وبس، دي بلدنا." },
  { title: "واضحين من الأول", text: "السعر اللي نتفق عليه هو اللي تدفعه، وشروط الإلغاء مكتوبة قدامك." },
];

export default async function HomePage() {
  const latestOffers = (await bookableOffers()).slice(0, 3);
  const { flights, aswan } = SECTIONS;

  return (
    <>
      {/* Flights come first: the headline, then the price request right under it. */}
      <section className="hero">
        <div className="container hero-inner">
          <p className="hero-brand">{SITE.name}</p>
          <h1>تذاكر طيران بأسعار تناسبك</h1>
          <p className="hero-lead">محلي ودولي. بندوّرلك على أكتر من سعر وأكتر من شركة، وإنت تختار.</p>
        </div>
      </section>

      <section className="container hero-form" aria-label="اطلب سعر تذكرتك">
        <LeadForm kind="flight" quick title="قولّنا رايح فين، ونرجعلك بالأسعار" />
      </section>

      <section className="section container">
        <div className="center">
          <span className="eyebrow">
            <span aria-hidden="true">{flights.icon}</span> {flights.name}
          </span>
        </div>
        <h2 className="section-title">{flights.title}</h2>
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
          <Link className="btn btn-outline" href={flights.href}>كل عروض الطيران</Link>
        </div>
      </section>

      <NubianStrip className="strip-short" />

      <section className="section container">
        <div className="center">
          <span className="eyebrow">
            <span aria-hidden="true">{aswan.icon}</span> {aswan.name}
          </span>
        </div>
        <h2 className="section-title">{aswan.title}</h2>
        <p className="section-sub">أسوان والنوبة: برامج جاهزة في موسم الشتا، وكل حاجة مترتبة.</p>
        <div className="grid-2">
          {TRIPS.map((t) => (
            <Link key={t.slug} href={tripHref(t)} className="card mini-trip">
              <Image src={t.image.src} alt="" width={1400} height={933} sizes="(min-width: 720px) 45vw, 100vw" />
              <div>
                <h3>{t.title}</h3>
                <p className="muted">
                  {t.duration} · يبدأ من {formatPrice(t.price)} للفرد
                </p>
              </div>
            </Link>
          ))}
        </div>
        <div className="center more-link">
          <Link className="btn btn-outline" href={aswan.href}>كل تفاصيل الرحلات</Link>
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
