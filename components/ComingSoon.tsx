import Link from "next/link";
import { whatsappLink } from "@/lib/site";
import NubianStrip from "./NubianStrip";
import WhatsAppIcon from "./WhatsAppIcon";

export default function ComingSoon({
  title,
  description,
  eyebrow = "قريباً",
}: {
  title: string;
  description: string;
  eyebrow?: string;
}) {
  return (
    <section className="coming-soon container">
      <span className="eyebrow">{eyebrow}</span>
      <h1>{title}</h1>
      <p>{description}</p>
      <NubianStrip className="strip-short" />
      <p className="muted">محتاج حاجة دلوقتي؟ كلّمنا على واتساب وهنرد عليك.</p>
      <div className="actions">
        <a className="btn btn-wa" href={whatsappLink()} target="_blank" rel="noopener noreferrer">
          <WhatsAppIcon size={20} /> كلّمنا على واتساب
        </a>
        <Link className="btn btn-outline" href="/">
          ارجع للرئيسية
        </Link>
      </div>
    </section>
  );
}
