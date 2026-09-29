import Image from "next/image";
import Link from "next/link";
import { LEGAL, NAV, SITE, SOCIAL, whatsappLink } from "@/lib/site";
import NubianStrip from "./NubianStrip";

export default function Footer() {
  return (
    <footer className="site-footer">
      <NubianStrip />
      <div className="container footer-grid">
        <div className="footer-about">
          <Image src="/logo-white.png" alt={SITE.name} width={91} height={80} />
          <p>{SITE.tagline}.</p>
        </div>

        <div>
          <h2>الصفحات</h2>
          <ul>
            {NAV.map((item) => (
              <li key={item.href}>
                <Link href={item.href}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2>الشروط</h2>
          <ul>
            {LEGAL.map((item) => (
              <li key={item.href}>
                <Link href={item.href}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2>تواصل معانا</h2>
          <ul>
            <li>
              واتساب:{" "}
              <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" dir="ltr">
                {SITE.whatsappDisplay}
              </a>
            </li>
            <li>
              إيميل:{" "}
              <a href={`mailto:${SITE.email}`} dir="ltr">
                {SITE.email}
              </a>
            </li>
            {SOCIAL.map((s) => (
              <li key={s.href}>
                <a href={s.href} target="_blank" rel="noopener noreferrer">{s.label}</a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="container">© {new Date().getFullYear()} {SITE.name}. كل الحقوق محفوظة.</div>
      </div>
    </footer>
  );
}
