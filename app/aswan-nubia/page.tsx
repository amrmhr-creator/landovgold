import Image from "next/image";
import Link from "next/link";
import FaqList from "@/components/FaqList";
import JsonLd from "@/components/JsonLd";
import LeadForm from "@/components/LeadForm";
import PageHead from "@/components/PageHead";
import TripTerms from "@/components/TripTerms";
import WhatsAppIcon from "@/components/WhatsAppIcon";
import { sectionFaq } from "@/lib/faq";
import { formatPrice } from "@/lib/offers";
import { SECTIONS } from "@/lib/sections";
import { faqLd, tripLd } from "@/lib/seo";
import { whatsappLink } from "@/lib/site";
import { TRIPS, tripHref } from "@/lib/trips";

export const metadata = {
  title: "رحلات أسوان والنوبة",
  description:
    "برامج رحلات أسوان والنوبة يوم بيوم: فلوكة في النيل، ومعبد فيلة، وأبو سمبل، وغدا في بيت نوبي في غرب سهيل. بالطيارة أو بالقطر، والدفع كامل أو 50% مقدماً.",
};

const GALLERY = [
  { src: "/images/gallery/nile.webp", alt: "النيل" },
  { src: "/images/gallery/temple.webp", alt: "معبد مصري قديم" },
  { src: "/images/gallery/houses-1.webp", alt: "بيوت ملوّنة" },
  { src: "/images/gallery/houses-2.webp", alt: "بيوت ملوّنة" },
];

export default function Page() {
  const faq = sectionFaq("aswan");

  return (
    <>
      {TRIPS.map((t) => (
        <JsonLd key={t.slug} data={tripLd(t)} />
      ))}
      <JsonLd data={faqLd(faq)} />
      <PageHead
        section="aswan"
        title="رحلات أسوان والنوبة"
        lead="أسوان في الشتا حاجة تانية: شمس دافية، ونيل هادي، وناس بتستقبلك كأنك من أهل البيت. برامجنا مترتبة من أول ما توصل لحد ما ترجع، وبتوريك أسوان زي ما أهلها يعرفوها."
      />

      <section className="section container">
        <div className="trips">
          {TRIPS.map((trip) => (
            <article key={trip.slug} id={trip.slug} className="card trip-card">
              <Link href={tripHref(trip)} tabIndex={-1} aria-hidden="true">
                <Image
                  src={trip.image.src}
                  alt=""
                  width={1400}
                  height={933}
                  sizes="(min-width: 900px) 540px, 100vw"
                  className="trip-image"
                />
              </Link>
              <div className="trip-body">
                <h2>
                  <Link href={tripHref(trip)} className="plain-link">
                    {trip.title}
                  </Link>
                </h2>
                <p className="muted">{trip.duration}</p>
                <p>{trip.summary}</p>
                <p className="trip-price">
                  يبدأ من <strong>{formatPrice(trip.price)}</strong> للفرد بالطيارة
                </p>
                <div className="actions">
                  <Link className="btn btn-gold" href={tripHref(trip)}>
                    البرنامج يوم بيوم
                  </Link>
                  <a
                    className="btn btn-wa"
                    href={whatsappLink(`أهلاً، عايز أحجز ${trip.title}. إيه المواعيد المتاحة؟`)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <WhatsAppIcon size={20} /> احجز على واتساب
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section section-sand">
        <div className="container">
          <TripTerms />
        </div>
      </section>

      <section className="section container">
        <h2 className="section-title">برامج خاصة للمجموعات</h2>
        <p className="section-sub narrow center-block">
          لو إنتوا عيلة أو شلة أصحاب أو شركة، نقدر نعملكم برنامج على مقاسكم في المواعيد والأماكن والمدة. كلمنا
          على الواتساب وقولنا عددكم وإمتى عايزين تسافروا.
        </p>
        <div className="center">
          <a
            className="btn btn-wa"
            href={whatsappLink("أهلاً، عايزين برنامج خاص لمجموعتنا في أسوان. عددنا … وعايزين نسافر …")}
            target="_blank"
            rel="noopener noreferrer"
          >
            <WhatsAppIcon size={20} /> اطلب برنامج لمجموعتك
          </a>
        </div>

        <div className="gallery">
          {GALLERY.map((g) => (
            <Image key={g.src} src={g.src} alt={g.alt} width={1400} height={933} sizes="(min-width: 720px) 25vw, 50vw" />
          ))}
        </div>
      </section>

      <section className="section section-sand" id="book">
        <div className="container narrow">
          <h2 className="section-title">احجز رحلتك</h2>
          <p className="section-sub">سيب بياناتك والبرنامج اللي عايزه، ونرجعلك بالمواعيد والسعر النهائي خلال 24 ساعة.</p>
          <LeadForm kind="trip" />
        </div>
      </section>

      <section className="section container prose" id="faq">
        <h2 className="section-title">أسئلة عن رحلات أسوان والنوبة</h2>
        <FaqList groups={faq} plain />
        <div className="center more-link">
          <a className="btn btn-wa" href={whatsappLink(SECTIONS.aswan.whatsapp)} target="_blank" rel="noopener noreferrer">
            <WhatsAppIcon size={20} /> اسألنا على واتساب
          </a>
        </div>
      </section>
    </>
  );
}
