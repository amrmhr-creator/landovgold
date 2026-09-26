export const SITE = {
  name: "بلاد الدهب",
  url: "https://landovgold.com",
  tagline: "تذاكر طيران بأسعار مخفّضة، ورحلات أسوان والنوبة بروح الجنوب",
  email: "book@landovgold.com",
  whatsappNumber: "201023643424",
  whatsappDisplay: "01023643424",
};

export const NAV = [
  { href: "/", label: "الرئيسية" },
  { href: "/offers", label: "عروض الطيران" },
  { href: "/aswan-nubia", label: "رحلات أسوان والنوبة" },
  { href: "/how-we-work", label: "إزاي بنشتغل" },
  { href: "/about", label: "مين احنا" },
  { href: "/blog", label: "المدوّنة" },
  { href: "/faq", label: "الأسئلة الشائعة" },
  { href: "/contact", label: "تواصل معانا" },
];

export const LEGAL = [
  { href: "/terms", label: "الشروط والأحكام" },
  { href: "/cancellation-policy", label: "سياسة الإلغاء والاسترجاع" },
  { href: "/privacy", label: "سياسة الخصوصية" },
];

export function whatsappLink(message = "أهلاً بلاد الدهب، عايز أستفسر عن") {
  return `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent(message)}`;
}
