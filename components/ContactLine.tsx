import { SITE, whatsappLink } from "@/lib/site";

/** "واتساب: … · إيميل: …" line used at the end of legal and info pages. */
export default function ContactLine() {
  return (
    <p>
      واتساب:{" "}
      <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" dir="ltr">
        {SITE.whatsappDisplay}
      </a>{" "}
      · إيميل:{" "}
      <a href={`mailto:${SITE.email}`} dir="ltr">
        {SITE.email}
      </a>
    </p>
  );
}
