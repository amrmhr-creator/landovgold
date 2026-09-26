import LeadForm from "@/components/LeadForm";
import NubianStrip from "@/components/NubianStrip";
import WhatsAppIcon from "@/components/WhatsAppIcon";
import { SITE, whatsappLink } from "@/lib/site";

export const metadata = {
  title: "تواصل معانا",
  description: "كلّم بلاد الدهب على واتساب أو سيب بياناتك ونرجعلك خلال 24 ساعة.",
};

export default function ContactPage() {
  return (
    <>
      <section className="page-head">
        <div className="container">
          <h1>تواصل معانا</h1>
          <p>أسرع طريقة هي واتساب. ولو مش حابب تفتح محادثة، سيب بياناتك ونكلّمك.</p>
        </div>
      </section>
      <NubianStrip />

      <section className="section container offer-layout">
        <div className="offer-main">
          <a className="btn btn-wa btn-lg" href={whatsappLink()} target="_blank" rel="noopener noreferrer">
            <WhatsAppIcon size={22} /> كلّمنا على واتساب
          </a>
          <ul className="contact-list">
            <li>
              واتساب: <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" dir="ltr">{SITE.whatsappDisplay}</a>
            </li>
            <li>
              إيميل: <a href={`mailto:${SITE.email}`} dir="ltr">{SITE.email}</a>
            </li>
          </ul>
        </div>
        <aside className="offer-cta">
          <LeadForm title="سيب بياناتك" />
        </aside>
      </section>
    </>
  );
}
