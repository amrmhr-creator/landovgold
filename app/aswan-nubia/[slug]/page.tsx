import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import JsonLd from "@/components/JsonLd";
import LeadForm from "@/components/LeadForm";
import PageHead from "@/components/PageHead";
import TripTerms from "@/components/TripTerms";
import WhatsAppIcon from "@/components/WhatsAppIcon";
import { formatPrice } from "@/lib/offers";
import { tripLd } from "@/lib/seo";
import { whatsappLink } from "@/lib/site";
import { TRIPS, getTrip } from "@/lib/trips";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return TRIPS.map((t) => ({ slug: t.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const trip = getTrip((await params).slug);
  if (!trip) return {};
  const title = `${trip.title}: البرنامج يوم بيوم`;
  const description = `${trip.duration}. ${trip.summary} يبدأ من ${formatPrice(trip.price)} للفرد بالطيارة.`;
  return { title, description, openGraph: { title, description, images: [trip.image.src] } };
}

export default async function TripPage({ params }: Params) {
  const trip = getTrip((await params).slug);
  if (!trip) notFound();

  return (
    <>
      <JsonLd data={tripLd(trip)} />
      <PageHead section="aswan" title={trip.title} lead={trip.summary} back={{ href: "/aswan-nubia", label: "كل برامج أسوان والنوبة" }} />

      <section className="section container offer-layout">
        <div className="offer-main">
          <Image
            src={trip.image.src}
            alt={trip.image.alt}
            width={1400}
            height={933}
            sizes="(min-width: 900px) 700px, 100vw"
            className="trip-image rounded"
            priority
          />
          <p className="muted">{trip.duration}</p>
          <p className="trip-price">
            يبدأ من <strong>{formatPrice(trip.price)}</strong> للفرد بالطيارة
          </p>

          <h2>البرنامج يوم بيوم</h2>
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
        </div>

        <aside className="offer-cta">
          <a
            className="btn btn-wa btn-block btn-lg"
            href={whatsappLink(`أهلاً، عايز أحجز ${trip.title}. إيه المواعيد المتاحة؟`)}
            target="_blank"
            rel="noopener noreferrer"
          >
            <WhatsAppIcon size={22} /> احجز على واتساب
          </a>
          <LeadForm kind="trip" trip={trip.slug} title="أو سيب بياناتك ونرجعلك بالمواعيد والسعر النهائي" />
        </aside>
      </section>

      <section className="section section-sand">
        <div className="container">
          <TripTerms />
        </div>
      </section>
    </>
  );
}
