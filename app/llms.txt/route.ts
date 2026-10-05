// /llms.txt: a plain summary of the business and its main pages for AI assistants (llmstxt.org).
import { ARTICLES } from "@/lib/blog";
import { formatPrice } from "@/lib/offers";
import { getSettings } from "@/lib/settings";
import { SITE } from "@/lib/site";
import { tripHref } from "@/lib/trips";
import { visibleTrips } from "@/lib/trips-data";

// Contact details come from /admin/settings.
export const dynamic = "force-dynamic";

export async function GET() {
  const [s, trips] = await Promise.all([getSettings(), visibleTrips()]);
  const u = (path: string) => `${SITE.url}${path}`;
  const text = `# ${SITE.name}

> ${SITE.name} شركة خدمات سياحية مصرية: تذاكر طيران بأسعار تناسبك (محلي ودولي) بنعرض فيها على العميل أكتر من سعر ويختار، وبرامج رحلات أسوان والنوبة في موسم الشتا.

- التواصل: واتساب +${s.whatsappNumber}، وإيميل ${s.email}. الرد خلال 24 ساعة، ومواعيد العمل ${s.hours}.
- الحجز: العميل يبعت طلبه على واتساب أو من فورم الموقع، ونرجعله بأكتر من اختيار خلال 24 ساعة، والسعر بيتأكد قبل الدفع.
- الدفع: إنستاباي، أو محفظة إلكترونية، أو لينك دفع بالكارت يقبل الكروت الأجنبية للمصريين برّه مصر.
- رحلات أسوان: الدفع كامل مقدماً أو 50% مقدماً والباقي عند الوصول. الإلغاء قبل الرحلة بـ 15 يوم أو أكتر بيرجّع المبلغ كامل.

## الصفحات الأساسية

- [عروض الطيران](${u("/flights")}): أحدث عروض التذاكر، وفورم لطلب سعر لأي وجهة، وأسئلة الطيران
- [رحلات أسوان والنوبة](${u("/aswan-nubia")}): البرامج والأسعار وطرق الدفع، وأسئلة الرحلات
- [إزاي بنشتغل](${u("/how-we-work")}): خطوات الحجز وطرق الدفع للمصريين في مصر وبرّه
- [الأسئلة الشائعة](${u("/faq")})
- [مين احنا](${u("/about")})
- [تواصل معانا](${u("/contact")})
- [سياسة الإلغاء والاسترجاع](${u("/cancellation-policy")})

## برامج أسوان والنوبة

${trips.map((t) => `- [${t.title}](${u(tripHref(t))}): ${t.duration}، ${t.price > 0 ? `يبدأ من ${formatPrice(t.price)} للفرد بالطيارة (والقطر أوفر)` : "السعر عند الطلب"}. ${t.summary}`).join("\n")}

## المدوّنة

${ARTICLES.map((a) => `- [${a.title}](${u(`/blog/${a.slug}`)}): ${a.summary}`).join("\n")}
`;
  return new Response(text, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
