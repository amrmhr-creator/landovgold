// The site's business lines. Each one is a self-contained section: its own pages under `href`,
// its own form, FAQ group, and WhatsApp opening message. Leads are tagged with their section.
// Umrah joins here as a third section once the partner's licence details are confirmed.

export type SectionKey = "flights" | "aswan";

export type Section = {
  key: SectionKey;
  /** Short name for menus and labels. */
  name: string;
  href: string;
  icon: string;
  /** Title and text of the section's door on the home page. */
  title: string;
  pitch: string;
  /** Where the section's main call to action goes, and what it says. */
  cta: { href: string; label: string };
  /** Sub-menu shown at the top of the section's pages. */
  links: { href: string; label: string }[];
  /** Opening line of a WhatsApp chat started from this section. */
  whatsapp: string;
};

export const SECTIONS: Record<SectionKey, Section> = {
  flights: {
    key: "flights",
    name: "طيران",
    href: "/flights",
    icon: "✈",
    title: "تذاكر طيران بأسعار مخفّضة",
    pitch: "محلي ودولي. بندوّرلك على أكتر من سعر وأكتر من شركة، ونعرضهم عليك وإنت تختار اللي يناسبك في السعر والمواعيد.",
    cta: { href: "/flights", label: "شوف عروض الطيران" },
    links: [
      { href: "/flights", label: "العروض" },
      { href: "/flights#request", label: "اطلب سعر لوجهتك" },
      { href: "/flights#faq", label: "أسئلة الطيران" },
    ],
    whatsapp: "أهلاً بلاد الدهب، عايز أسعار تذاكر طيران لـ",
  },
  aswan: {
    key: "aswan",
    name: "أسوان والنوبة",
    href: "/aswan-nubia",
    icon: "☀",
    title: "رحلات أسوان والنوبة",
    pitch: "برامج جاهزة في موسم الشتا، من المركب في النيل لحد البيوت النوبية الملوّنة. كل حاجة مترتبة، وإنت عليك تستمتع بس.",
    cta: { href: "/aswan-nubia", label: "شوف برامج الرحلات" },
    links: [
      { href: "/aswan-nubia", label: "البرامج" },
      { href: "/aswan-nubia#book", label: "احجز رحلتك" },
      { href: "/aswan-nubia#faq", label: "أسئلة الرحلات" },
    ],
    whatsapp: "أهلاً بلاد الدهب، عايز أستفسر عن رحلات أسوان والنوبة",
  },
};

export const SECTION_LIST = Object.values(SECTIONS);

/** The section a path belongs to, if any (e.g. "/flights/cairo-dubai" → flights). */
export function sectionForPath(pathname: string): Section | undefined {
  return SECTION_LIST.find((s) => pathname === s.href || pathname.startsWith(`${s.href}/`));
}
