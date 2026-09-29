// /llms.txt: a plain summary of the business and its main pages for AI assistants (llmstxt.org).
import { ARTICLES } from "@/lib/blog";
import { formatPrice } from "@/lib/offers";
import { SITE } from "@/lib/site";
import { TRAIN_DISCOUNT, TRIPS } from "@/lib/trips";

export const dynamic = "force-static";

export function GET() {
  const u = (path: string) => `${SITE.url}${path}`;
  const text = `# ${SITE.name}

> ${SITE.name} شركة خدمات سياحية مصرية: تذاكر طيران بأسعار مخفّضة (محلي ودولي) بنعرض فيها على العميل أكتر من سعر ويختار، وبرامج رحلات أسوان والنوبة في موسم الشتا.

- التواصل: واتساب +${SITE.whatsappNumber}، وإيميل ${SITE.email}. الرد خلال 24 ساعة، ومواعيد العمل ${SITE.hours}.
- الحجز: العميل يبعت طلبه على واتساب أو من فورم الموقع، ونرجعله بأكتر من اختيار خلال 24 ساعة، والسعر بيتأكد قبل الدفع.
- الدفع: إنستاباي، أو محفظة إلكترونية، أو لينك دفع بالكارت يقبل الكروت الأجنبية للمصريين برّه مصر.
- رحلات أسوان: الدفع كامل مقدماً أو 50% مقدماً والباقي عند الوصول. الإلغاء قبل الرحلة بـ 15 يوم أو أكتر بيرجّع المبلغ كامل.

## الصفحات الأساسية

- [عروض الطيران](${u("/offers")}): أحدث عروض التذاكر، وفورم لطلب سعر لأي وجهة
- [رحلات أسوان والنوبة](${u("/aswan-nubia")}): البرامج يوم بيوم والأسعار
- [إزاي بنشتغل](${u("/how-we-work")}): خطوات الحجز وطرق الدفع للمصريين في مصر وبرّه
- [الأسئلة الشائعة](${u("/faq")})
- [مين احنا](${u("/about")})
- [تواصل معانا](${u("/contact")})
- [سياسة الإلغاء والاسترجاع](${u("/cancellation-policy")})

## برامج أسوان والنوبة

${TRIPS.map((t) => `- [${t.title}](${u(`/aswan-nubia#${t.slug}`)}): ${t.duration}، يبدأ من ${formatPrice(t.price)} للفرد بالطيارة (بالقطر أقل بحوالي ${formatPrice(TRAIN_DISCOUNT)}). ${t.summary}`).join("\n")}

## المدوّنة

${ARTICLES.map((a) => `- [${a.title}](${u(`/blog/${a.slug}`)}): ${a.summary}`).join("\n")}
`;
  return new Response(text, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
