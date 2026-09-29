import Image from "next/image";
import Link from "next/link";
import LeadForm from "@/components/LeadForm";
import PageHead from "@/components/PageHead";
import WhatsAppIcon from "@/components/WhatsAppIcon";
import { formatPrice } from "@/lib/offers";
import { whatsappLink } from "@/lib/site";
import { TRAIN_DISCOUNT, TRIPS, TRIP_EXCLUDES, TRIP_INCLUDES } from "@/lib/trips";

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
  return (
    <>
      <PageHead
        title="رحلات أسوان والنوبة"
        lead="أسوان في الشتا حاجة تانية: شمس دافية، ونيل هادي، وناس بتستقبلك كأنك من أهل البيت. برامجنا مترتبة من أول ما توصل لحد ما ترجع، وبتوريك أسوان زي ما أهلها يعرفوها."
      />

      <section className="section container">
        <div className="trips">
          {TRIPS.map((trip) => (
            <article key={trip.slug} id={trip.slug} className="card trip-card">
              <Image
                src={trip.image.src}
                alt={trip.image.alt}
                width={1400}
                height={933}
                sizes="(min-width: 900px) 540px, 100vw"
                className="trip-image"
              />
              <div className="trip-body">
                <h2>{trip.title}</h2>
                <p className="muted">{trip.duration}</p>
                <p>{trip.summary}</p>
                <p className="trip-price">
                  يبدأ من <strong>{formatPrice(trip.price)}</strong> للفرد بالطيارة
                </p>

                {trip.itinerary.map((day) => (
                  <div key={day.title} className="trip-day">
                    <h3>{day.title}</h3>
                    <ul>
                      {day.items.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ))}

                <a
                  className="btn btn-wa btn-block"
                  href={whatsappLink(`أهلاً، عايز أحجز ${trip.title}. إيه المواعيد المتاحة؟`)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <WhatsAppIcon size={20} /> احجز مكانك على واتساب
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section section-sand">
        <div className="container grid-2">
          <div className="card">
            <h2>البرنامج يشمل</h2>
            <ul className="check-list">
              {TRIP_INCLUDES.map((i) => (
                <li key={i}>{i}</li>
              ))}
            </ul>
            <h2>البرنامج ما يشملش</h2>
            <ul className="x-list">
              {TRIP_EXCLUDES.map((i) => (
                <li key={i}>{i}</li>
              ))}
            </ul>
          </div>

          <div className="card">
            <h2>تختار تسافر إزاي</h2>
            <ul>
              <li>
                <strong>بالطيارة:</strong> أسرع وبتوفّر يوم سفر، والسعر المكتوب فوق بيها.
              </li>
              <li>
                <strong>بالقطر:</strong> أوفر، وبيقل السعر حوالي {formatPrice(TRAIN_DISCOUNT)} للفرد.
              </li>
            </ul>
            <h2>خيارات الدفع</h2>
            <ul>
              <li>تدفع المبلغ كامل مقدماً.</li>
              <li>أو تدفع 50% مقدماً، والـ 50% الباقية أول ما توصل.</li>
            </ul>
            <p className="muted small">
              السعر النهائي بيتحدد حسب اختيارك، وبنأكدهولك على الواتساب قبل الدفع. تقدر تلغي وترجعلك فلوسك
              كاملة لو قبل الرحلة بـ 15 يوم أو أكتر. <Link href="/cancellation-policy">اقرأ سياسة الإلغاء</Link>
            </p>
          </div>
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
    </>
  );
}
