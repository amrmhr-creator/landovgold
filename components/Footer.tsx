import Image from "next/image";
import Link from "next/link";
import { SECTION_LIST } from "@/lib/sections";
import { getSettings } from "@/lib/settings";
import { COMPANY_NAV, CONTACT_NAV, LEGAL, SITE, whatsappLink } from "@/lib/site";
import NubianStrip from "./NubianStrip";

export default async function Footer() {
  const settings = await getSettings();
  return (
    <footer className="site-footer">
      <NubianStrip />
      <div className="container footer-grid">
        <div className="footer-about">
          <Image src="/logo-white.png" alt={SITE.name} width={91} height={80} />
          <p>{settings.tagline}.</p>
        </div>

        <div>
          <h2>خدماتنا</h2>
          <ul>
            {SECTION_LIST.map((s) => (
              <li key={s.key}>
                <Link href={s.href}>{s.name}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2>عن بلاد الدهب</h2>
          <ul>
            {[...COMPANY_NAV, CONTACT_NAV].map((item) => (
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
                {settings.whatsappDisplay}
              </a>
            </li>
            <li>
              إيميل:{" "}
              <a href={`mailto:${settings.email}`} dir="ltr">
                {settings.email}
              </a>
            </li>
            {settings.social.map((s) => (
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
