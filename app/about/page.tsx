import Image from "next/image";
import Link from "next/link";
import PageHead from "@/components/PageHead";
import WhatsAppIcon from "@/components/WhatsAppIcon";
import { BUSINESS, whatsappLink } from "@/lib/site";
import { sitePhotos } from "@/lib/uploads";

// Photos are picked in the admin panel, so the page is rendered on each visit.
export const dynamic = "force-dynamic";

export const metadata = {
  title: "مين احنا",
  description:
    "حكاية اسم بلاد الدهب، ومين ورا الشركة: ناس من الجنوب بتوفّر تذاكر طيران بأسعار تناسبك وبتنظّم رحلات أسوان والنوبة.",
};

const VALUES = [
  { title: "الأصالة", text: "بنقدّم أسوان والنوبة زي ما هي، مش نسخة سياحية." },
  { title: "الوضوح", text: "السعر والشروط قدامك من الأول، ومفيش مفاجآت." },
  { title: "البساطة", text: "طلبك بيتحل في رسالة، مش في عشر خطوات." },
  { title: "الأمانة", text: "لو فيه اختيار أرخص أو أنسب ليك، هنقولك عليه." },
];

export default async function Page() {
  const photos = (await sitePhotos()).about;
  const official = [
    BUSINESS.legalName,
    BUSINESS.commercialRegister && `سجل تجاري رقم ${BUSINESS.commercialRegister}`,
    BUSINESS.address && `العنوان: ${BUSINESS.address}`,
  ].filter(Boolean);

  return (
    <>
      <PageHead
        title="مين احنا"
        lead="«بلاد الدهب» هو الاسم اللي اتقال على مصر وأرض النوبة من زمان. واخترناه لأنه بيعبّر عننا: ناس من الجنوب، بتحب البساطة، وبتعامل اللي بيتعامل معاها كأنه ضيف."
      />

      <section className="section container prose">
        <h2>حكايتنا</h2>
        <p>
          بلاد الدهب بدأت من حب للجنوب، ومن ملاحظة بسيطة: ناس كتير حوالينا كانت بتدوّر على تذكرة بسعر معقول
          وبتتوه بين المواقع والأسعار. وناس تانية نفسها تشوف أسوان والنوبة بجد، مش من ورا شباك أوتوبيس سياحي.
          فقررنا نجمع الاتنين: نوفّر على الناس وقت التدوير، ونوريهم الجنوب زي ما أهله يعرفوه.
        </p>
        <p>
          بدأنا بطلبات من المعارف والأصحاب، وكبرنا بالكلمة الحلوة. النهارده بنخدم المصريين في مصر وبرّها، وكل
          واحد بيرجعلنا تاني هو أحسن شهادة.
        </p>
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
            {VALUES.map((v) => (
              <div key={v.title} className="why-item">
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
