export const SITE = {
  name: "بلاد الدهب",
  url: "https://landovgold.com",
  tagline: "تذاكر طيران بأسعار مخفّضة، ورحلات أسوان والنوبة بروح الجنوب",
  email: "book@landovgold.com",
  whatsappNumber: "201023643424",
  whatsappDisplay: "01023643424",
  hours: "يومياً من 10 الصبح لـ 10 بالليل بتوقيت مصر",
};

// Still missing from the owner. Empty values are hidden on the site, never shown as blanks.
export const BUSINESS = {
  legalName: "", // الاسم الرسمي زي ما هو متسجّل
  commercialRegister: "", // رقم السجل التجاري
  address: "", // عنوان الشركة
  instapay: "", // عنوان الدفع على إنستاباي
  wallet: "", // رقم المحفظة الإلكترونية
};

export const SOCIAL: { label: string; href: string }[] = [
  // { label: "فيسبوك", href: "https://facebook.com/..." },
  // { label: "إنستجرام", href: "https://instagram.com/..." },
  // { label: "تيك توك", href: "https://tiktok.com/@..." },
];

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
