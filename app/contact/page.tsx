import LeadForm from "@/components/LeadForm";
import PageHead from "@/components/PageHead";
import WhatsAppIcon from "@/components/WhatsAppIcon";
import { getSettings } from "@/lib/settings";
import { whatsappLink } from "@/lib/site";

export const metadata = {
  title: "تواصل معانا",
  description: "كلّم بلاد الدهب على واتساب أو سيب بياناتك ونرجعلك خلال 24 ساعة.",
};

export default async function ContactPage() {
  const s = await getSettings();
  return (
    <>
      <PageHead
        title="تواصل معانا"
        lead="أسرع طريقة توصلنا بيها هي الواتساب. ولو مش حابب تفتح محادثة، سيب بياناتك في الفورم ونكلمك إحنا."
      />

      <section className="section container offer-layout">
        <div className="offer-main">
          <a className="btn btn-wa btn-lg" href={whatsappLink()} target="_blank" rel="noopener noreferrer">
            <WhatsAppIcon size={22} /> ابدأ المحادثة
          </a>
          <ul className="contact-list">
            <li>
              واتساب: <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" dir="ltr">{s.whatsappDisplay}</a>
            </li>
            <li>
              الإيميل: <a href={`mailto:${s.email}`} dir="ltr">{s.email}</a>
            </li>
            <li>مواعيد الرد: خلال 24 ساعة من أي رسالة.</li>
            <li>مواعيد العمل: {s.hours}.</li>
            {s.social.length > 0 && (
              <li>
                السوشيال:{" "}
                {s.social.map((link, i) => (
                  <span key={link.href}>
                    {i > 0 && " · "}
                    <a href={link.href} target="_blank" rel="noopener noreferrer">{link.label}</a>
                  </span>
                ))}
              </li>
            )}
          </ul>
        </div>
        <aside className="offer-cta">
          <LeadForm kind="contact" title="ابعتلنا طلبك" submitLabel="ابعت" />
        </aside>
      </section>
    </>
  );
}
