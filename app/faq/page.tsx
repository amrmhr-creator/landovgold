import JsonLd from "@/components/JsonLd";
import PageHead from "@/components/PageHead";
import WhatsAppIcon from "@/components/WhatsAppIcon";
import { FAQ } from "@/lib/faq";
import { faqLd } from "@/lib/seo";
import { whatsappLink } from "@/lib/site";

export const metadata = {
  title: "الأسئلة الشائعة",
  description: "إجابات عن حجز تذاكر الطيران، ورحلات أسوان والنوبة، والدفع من مصر ومن برّه، والإلغاء والاسترداد.",
};

export default function Page() {
  return (
    <>
      <JsonLd data={faqLd(FAQ)} />
      <PageHead title="الأسئلة الشائعة" lead="أسئلة وأجوبة عن الحجز والدفع والرحلات." />
      <section className="section container prose">
        {FAQ.map((group) => (
          <div key={group.title} className="faq-group">
            <h2>{group.title}</h2>
            {group.items.map((item) => (
              <details key={item.q} className="faq-item">
                <summary>{item.q}</summary>
                <p>{item.a}</p>
              </details>
            ))}
          </div>
        ))}

        <div className="center more-link">
          <p className="muted">سؤالك مش موجود؟</p>
          <a className="btn btn-wa" href={whatsappLink()} target="_blank" rel="noopener noreferrer">
            <WhatsAppIcon size={20} /> اسألنا على واتساب
          </a>
        </div>
      </section>
    </>
  );
}
