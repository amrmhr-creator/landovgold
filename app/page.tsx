import Image from "next/image";
import Link from "next/link";
import LeadForm from "@/components/LeadForm";
import NubianStrip from "@/components/NubianStrip";
import OfferCard from "@/components/OfferCard";
import WhatsAppIcon from "@/components/WhatsAppIcon";
import { formatPrice, offerTitle } from "@/lib/offers";
import { bookableOffers } from "@/lib/offers-data";
import { SECTIONS } from "@/lib/sections";
import { SITE, whatsappLink } from "@/lib/site";
import { ASK_TRIP_PRICE, tripHref } from "@/lib/trips";
import { visibleTrips } from "@/lib/trips-data";
import { backupIfDue } from "@/lib/backup";
import { getSettings } from "@/lib/settings";
import { sitePhotos } from "@/lib/uploads";

// Offers come from the database, so the page is rendered on each visit.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  // The first visit of the day starts the daily backup (it runs in the background).
  backupIfDue();
  const latestOffers = (await bookableOffers()).slice(0, 3);
  const { flights, aswan } = SECTIONS;
  const [photos, s] = await Promise.all([sitePhotos(), getSettings()]);
  const trips = await visibleTrips();

  return (
    <>
      {/* Flights come first: the headline, then the price request right under it. */}
      <section className="hero">
        <div className="container hero-inner">
          <p className="hero-brand">{SITE.name}</p>
          <h1>{s.get("home.heroTitle")}</h1>
          <p className="hero-lead">{s.get("home.heroLead")}</p>
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
              <OfferCard key={o.slug} offer={o} photo={photos.byName(o.image, offerTitle(o))} />
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
          {trips.map((t) => (
            <Link key={t.slug} href={tripHref(t)} className="card mini-trip">
              <Image src={t.image.src} alt="" width={1400} height={933} sizes="(min-width: 720px) 45vw, 100vw" />
              <div>
                <h3>{t.title}</h3>
                <p className="muted">
                  {t.duration} · {t.price > 0 ? `يبدأ من ${formatPrice(t.price)} للفرد` : ASK_TRIP_PRICE}
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
            {s.homeSteps.map((step, i) => (
              <li key={i}>
                <span className="step-num">{i + 1}</span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
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
          {s.homeWhy.map((w, i) => (
            <div key={i} className="why-item">
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
