import Image from "next/image";
import Link from "next/link";
import PageHead from "@/components/PageHead";
import WhatsAppIcon from "@/components/WhatsAppIcon";
import { getSettings } from "@/lib/settings";
import { whatsappLink } from "@/lib/site";
import { sitePhotos } from "@/lib/uploads";

// Photos are picked in the admin panel, so the page is rendered on each visit.
export const dynamic = "force-dynamic";

export const metadata = {
  title: "مين احنا",
  description:
    "حكاية اسم بلاد الدهب، ومين ورا الشركة: ناس من الجنوب بتوفّر تذاكر طيران بأسعار تناسبك وبتنظّم رحلات أسوان والنوبة.",
};

export default async function Page() {
  const [photos, s] = await Promise.all([sitePhotos().then((p) => p.about), getSettings()]);
  const BUSINESS = s.business;
  const official = [
    BUSINESS.legalName,
    BUSINESS.commercialRegister && `سجل تجاري رقم ${BUSINESS.commercialRegister}`,
    BUSINESS.address && `العنوان: ${BUSINESS.address}`,
  ].filter(Boolean);

  return (
    <>
      <PageHead
        title="مين احنا"
        lead={s.get("about.lead")}
      />

      <section className="section container prose">
        <h2>حكايتنا</h2>
        {s.aboutStory.map((p) => (
          <p key={p}>{p}</p>
        ))}
      </section>

      {photos.length > 0 && (
        <section className="section container">
          <div className="about-photos">
            {photos.map((p) => (
              <Image key={p.src} src={p.src} alt={p.alt} width={p.width} height={p.height} sizes="(min-width: 720px) 33vw, 100vw" />
            ))}
          </div>
        </section>
      )}

      <section className="section section-sand">
        <div className="container">
          <h2 className="section-title">بنآمن بإيه</h2>
          <div className="why-grid">
            {s.aboutValues.map((v, i) => (
              <div key={i} className="why-item">
                <h3>{v.title}</h3>
                <p>{v.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section container prose">
        {official.length > 0 && (
          <>
            <h2>إحنا مين بالظبط</h2>
            <ul>
              {official.map((line) => (
                <li key={line as string}>{line}</li>
              ))}
            </ul>
          </>
        )}
        <div className="actions">
          <a className="btn btn-wa" href={whatsappLink()} target="_blank" rel="noopener noreferrer">
            <WhatsAppIcon size={20} /> كلّمنا على واتساب
          </a>
          <Link className="btn btn-outline" href="/how-we-work">
            إزاي بنشتغل
          </Link>
        </div>
      </section>
    </>
  );
}
