import "server-only";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { BUSINESS, SITE } from "./site";
import { uploadDir } from "./uploads";

// Site settings edited from /admin/settings: contact details, company details, social links,
// and the main texts of the home, about and how-we-work pages. Saved as settings.json next to
// the uploaded photos (outside the app folder, so deploys keep it). An empty field means
// "use the default", which is what the site said before the setting existed.

type Field = {
  key: string;
  label: string;
  /** Default shown on the site while the field is empty. "" = hidden while empty. */
  fallback: string;
  multiline?: boolean;
  ltr?: boolean;
  hint?: string;
};

export type FieldGroup = { title: string; note?: string; fields: Field[] };

const pair = (prefix: string, n: number, title: string, text: string): Field[] => [
  { key: `${prefix}${n}.title`, label: `${n}. العنوان`, fallback: title },
  { key: `${prefix}${n}.text`, label: `${n}. الكلام`, fallback: text, multiline: true },
];

export const SETTINGS_GROUPS: FieldGroup[] = [
  {
    title: "التواصل",
    fields: [
      { key: "contact.whatsapp", label: "رقم الواتساب", fallback: SITE.whatsappDisplay, ltr: true, hint: "زي 01023643424، أو برقم الدولة زي +966…" },
      { key: "contact.email", label: "الإيميل اللي بيظهر على الموقع", fallback: SITE.email, ltr: true },
      { key: "contact.hours", label: "مواعيد العمل", fallback: SITE.hours },
      { key: "contact.tagline", label: "جملة تعريف الشركة (تحت اللوجو في آخر الصفحة، ولجوجل)", fallback: SITE.tagline },
    ],
  },
  {
    title: "بيانات الشركة",
    note: "أي خانة فاضية مش بتظهر على الموقع.",
    fields: [
      { key: "business.legalName", label: "الاسم الرسمي زي ما هو متسجّل", fallback: BUSINESS.legalName },
      { key: "business.commercialRegister", label: "رقم السجل التجاري", fallback: BUSINESS.commercialRegister, ltr: true },
      { key: "business.address", label: "العنوان", fallback: BUSINESS.address },
      { key: "business.instapay", label: "عنوان إنستاباي", fallback: BUSINESS.instapay, ltr: true },
      { key: "business.wallet", label: "رقم المحفظة الإلكترونية", fallback: BUSINESS.wallet, ltr: true },
    ],
  },
  {
    title: "السوشيال ميديا",
    note: "حط اللينك كامل (بيبدأ بـ https://). الفاضي مش بيظهر.",
    fields: [
      { key: "social.facebook", label: "فيسبوك", fallback: "", ltr: true },
      { key: "social.instagram", label: "إنستجرام", fallback: "", ltr: true },
      { key: "social.tiktok", label: "تيك توك", fallback: "", ltr: true },
      { key: "social.youtube", label: "يوتيوب", fallback: "", ltr: true },
    ],
  },
  {
    title: "الصفحة الرئيسية",
    fields: [
      { key: "home.heroTitle", label: "العنوان الكبير", fallback: "تذاكر طيران بأسعار تناسبك" },
      { key: "home.heroLead", label: "الجملة اللي تحته", fallback: "محلي ودولي. بندوّرلك على أكتر من سعر وأكتر من شركة، وإنت تختار." },
      ...pair("home.step", 1, "ابعتلنا طلبك", "على واتساب أو من الفورم: رايح فين، وإمتى، وكام فرد."),
      ...pair("home.step", 2, "نرجعلك بأكتر من اختيار", "خلال 24 ساعة، بأسعارها وتفاصيلها."),
      ...pair("home.step", 3, "تختار اللي يناسبك، واحنا نكمّل", "نخلّص الحجز ونبعتلك التأكيد على الواتساب."),
      ...pair("home.why", 1, "أكتر من اختيار", "مش سعر واحد وخلاص، بنوريك البدائل وإنت تقرر."),
      ...pair("home.why", 2, "بنفهم ظروفك", "سواء إنت في مصر أو شغال برّه، عندنا طرق دفع ومواعيد تواصل تناسبك."),
      ...pair("home.why", 3, "من الجنوب", "رحلات أسوان والنوبة عندنا مش برنامج سياحي وبس، دي بلدنا."),
      ...pair("home.why", 4, "واضحين من الأول", "السعر اللي نتفق عليه هو اللي تدفعه، وشروط الإلغاء مكتوبة قدامك."),
    ],
  },
  {
    title: "مين احنا",
    fields: [
      {
        key: "about.lead",
        label: "الجملة اللي تحت العنوان",
        fallback:
          "«بلاد الدهب» هو الاسم اللي اتقال على مصر وأرض النوبة من زمان. واخترناه لأنه بيعبّر عننا: ناس من الجنوب، بتحب البساطة، وبتعامل اللي بيتعامل معاها كأنه ضيف.",
        multiline: true,
      },
      {
        key: "about.story",
        label: "حكايتنا",
        hint: "سيب سطر فاضي بين كل فقرة والتانية.",
        fallback:
          "بلاد الدهب بدأت من حب للجنوب، ومن ملاحظة بسيطة: ناس كتير حوالينا كانت بتدوّر على تذكرة بسعر معقول وبتتوه بين المواقع والأسعار. وناس تانية نفسها تشوف أسوان والنوبة بجد، مش من ورا شباك أوتوبيس سياحي. فقررنا نجمع الاتنين: نوفّر على الناس وقت التدوير، ونوريهم الجنوب زي ما أهله يعرفوه.\n\nبدأنا بطلبات من المعارف والأصحاب، وكبرنا بالكلمة الحلوة. النهارده بنخدم المصريين في مصر وبرّها، وكل واحد بيرجعلنا تاني هو أحسن شهادة.",
        multiline: true,
      },
      ...pair("about.value", 1, "الأصالة", "بنقدّم أسوان والنوبة زي ما هي، مش نسخة سياحية."),
      ...pair("about.value", 2, "الوضوح", "السعر والشروط قدامك من الأول، ومفيش مفاجآت."),
      ...pair("about.value", 3, "البساطة", "طلبك بيتحل في رسالة، مش في عشر خطوات."),
      ...pair("about.value", 4, "الأمانة", "لو فيه اختيار أرخص أو أنسب ليك، هنقولك عليه."),
    ],
  },
  {
    title: "إزاي بنشتغل",
    fields: [
      { key: "how.lead", label: "الجملة اللي تحت العنوان", fallback: "من غير لف ودوران: 3 خطوات، وكل حاجة واضحة قبل ما تدفع جنيه." },
      ...pair(
        "how.step",
        1,
        "ابعتلنا طلبك.",
        "على واتساب أو من الفورم. قولّنا رايح فين، وإمتى، وكام فرد، ولو عندك شركة طيران أو ميعاد معين بتفضّله.",
      ),
      ...pair("how.step", 2, "نرجعلك بأكتر من اختيار خلال 24 ساعة.", "بنقارن بين الشركات والمواعيد، ونبعتلك الاختيارات بأسعارها وتفاصيلها."),
      ...pair("how.step", 3, "تختار اللي يناسبك، واحنا نكمّل.", "نخلّص الحجز ونبعتلك التأكيد على الواتساب والإيميل."),
    ],
  },
];

const FIELDS = new Map(SETTINGS_GROUPS.flatMap((g) => g.fields).map((f) => [f.key, f]));

const settingsFile = () => path.join(uploadDir(), "settings.json");

/** What's saved: only the fields the owner filled in. */
export async function savedSettings(): Promise<Record<string, string>> {
  try {
    const data = JSON.parse(await readFile(settingsFile(), "utf8"));
    return typeof data === "object" && data ? data : {};
  } catch {
    return {};
  }
}

/** "01023643424" → "201023643424"; "+966 50…" → "96650…". Digits only, with the country code. */
export function internationalNumber(input: string) {
  const digits = input.replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d))).replace(/\D/g, "");
  if (/^01\d{9}$/.test(digits)) return `2${digits}`; // Egyptian mobile without the country code
  if (digits.startsWith("00")) return digits.slice(2);
  return digits;
}

export type SiteSettings = Awaited<ReturnType<typeof getSettings>>;

/** Settings for the site pages: saved values, or the defaults for empty ones. */
export async function getSettings() {
  const saved = await savedSettings();
  const get = (key: string) => (saved[key]?.trim() ? saved[key].trim() : (FIELDS.get(key)?.fallback ?? ""));
  const pairs = (prefix: string, count: number) =>
    Array.from({ length: count }, (_, i) => ({ title: get(`${prefix}${i + 1}.title`), text: get(`${prefix}${i + 1}.text`) }));
  const whatsappDisplay = get("contact.whatsapp");

  return {
    get,
    whatsappNumber: internationalNumber(whatsappDisplay) || SITE.whatsappNumber,
    whatsappDisplay,
    email: get("contact.email"),
    hours: get("contact.hours"),
    tagline: get("contact.tagline"),
    business: {
      legalName: get("business.legalName"),
      commercialRegister: get("business.commercialRegister"),
      address: get("business.address"),
      instapay: get("business.instapay"),
      wallet: get("business.wallet"),
    },
    social: [
      { label: "فيسبوك", href: get("social.facebook") },
      { label: "إنستجرام", href: get("social.instagram") },
      { label: "تيك توك", href: get("social.tiktok") },
      { label: "يوتيوب", href: get("social.youtube") },
    ].filter((s) => s.href),
    homeSteps: pairs("home.step", 3),
    homeWhy: pairs("home.why", 4),
    aboutValues: pairs("about.value", 4),
    aboutStory: get("about.story")
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter(Boolean),
    howSteps: pairs("how.step", 3),
  };
}

export class SettingsError extends Error {}

/** Checks and saves the settings form. Throws SettingsError with the message to show. */
export async function saveSettings(input: Record<string, string>) {
  const out: Record<string, string> = {};
  for (const [key, field] of FIELDS) {
    const value = (input[key] ?? "").trim().slice(0, field.multiline ? 3000 : 300);
    if (value) out[key] = value;
  }

  const wa = out["contact.whatsapp"];
  if (wa && !/^\d{10,15}$/.test(internationalNumber(wa))) throw new SettingsError("رقم الواتساب مش مظبوط.");
  const email = out["contact.email"];
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new SettingsError("الإيميل مش مظبوط.");
  for (const key of ["social.facebook", "social.instagram", "social.tiktok", "social.youtube"]) {
    if (out[key] && !/^https:\/\/[^\s"<>]+$/.test(out[key])) {
      throw new SettingsError(`لينك ${FIELDS.get(key)!.label} لازم يبدأ بـ https://`);
    }
  }

  await mkdir(uploadDir(), { recursive: true });
  const tmp = `${settingsFile()}.${process.pid}.tmp`;
  await writeFile(tmp, JSON.stringify(out, null, 2));
  await rename(tmp, settingsFile());
}
