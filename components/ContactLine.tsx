import { getSettings } from "@/lib/settings";
import { whatsappLink } from "@/lib/site";

/** "واتساب: … · إيميل: …" line used at the end of legal and info pages. */
export default async function ContactLine() {
  const s = await getSettings();
  return (
    <p>
      واتساب:{" "}
      <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" dir="ltr">
        {s.whatsappDisplay}
      </a>{" "}
      · إيميل:{" "}
      <a href={`mailto:${s.email}`} dir="ltr">
        {s.email}
      </a>
    </p>
  );
}
