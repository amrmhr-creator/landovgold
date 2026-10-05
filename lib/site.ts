// Defaults. The owner can change the contact details, company details, social links and main
// texts from /admin/settings (lib/settings.ts); these are used while a setting is empty.
export const SITE = {
  name: "بلاد الدهب",
  url: "https://landovgold.com",
  tagline: "تذاكر طيران بأسعار تناسبك، ورحلات أسوان والنوبة بروح الجنوب",
  email: "book@landovgold.com",
  whatsappNumber: "201023643424",
  whatsappDisplay: "01023643424",
  hours: "يومياً من 10 الصبح لـ 10 بالليل بتوقيت مصر",
};

// Company details, filled in from /admin/settings. Empty values are hidden on the site, never shown as blanks.
export const BUSINESS = {
  legalName: "", // الاسم الرسمي زي ما هو متسجّل
  commercialRegister: "", // رقم السجل التجاري
  address: "", // عنوان الشركة
  instapay: "", // عنوان الدفع على إنستاباي
  wallet: "", // رقم المحفظة الإلكترونية
};

// The menu: the service sections (lib/sections.ts) first, then these company pages
// grouped under "عن بلاد الدهب", then the contact page.
export const COMPANY_NAV = [
  { href: "/how-we-work", label: "إزاي بنشتغل" },
  { href: "/about", label: "مين احنا" },
  { href: "/blog", label: "المدوّنة" },
  { href: "/faq", label: "الأسئلة الشائعة" },
];

export const CONTACT_NAV = { href: "/contact", label: "تواصل معانا" };

export const LEGAL = [
  { href: "/terms", label: "الشروط والأحكام" },
  { href: "/cancellation-policy", label: "سياسة الإلغاء والاسترجاع" },
  { href: "/privacy", label: "سياسة الخصوصية" },
];

/** A WhatsApp chat link. It goes through /wa, which sends it to the number set in the admin panel. */
export function whatsappLink(message = "أهلاً بلاد الدهب، عايز أستفسر عن") {
  return `/wa?text=${encodeURIComponent(message)}`;
}
