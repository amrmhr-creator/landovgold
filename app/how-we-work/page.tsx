import Link from "next/link";
import PageHead from "@/components/PageHead";
import WhatsAppIcon from "@/components/WhatsAppIcon";
import { BUSINESS, SITE, whatsappLink } from "@/lib/site";

export const metadata = {
  title: "إزاي بنشتغل",
  description:
    "3 خطوات: تبعت طلبك، نرجعلك بأكتر من سعر خلال 24 ساعة، تختار وتدفع. طرق الدفع بإنستاباي والمحفظة ولينك دفع بالكارت للمصريين في مصر وبرّه.",
};

const STEPS = [
  {
    title: "ابعتلنا طلبك.",
    text: "على واتساب أو من الفورم. قولّنا رايح فين، وإمتى، وكام فرد، ولو عندك شركة طيران أو ميعاد معين بتفضّله.",
  },
  {
    title: "نرجعلك بأكتر من اختيار خلال 24 ساعة.",
    text: "بنقارن بين الشركات والمواعيد، ونبعتلك الاختيارات بأسعارها وتفاصيلها.",
  },
  {
    title: "تختار اللي يناسبك، واحنا نكمّل.",
    text: "نخلّص الحجز ونبعتلك التأكيد على الواتساب والإيميل.",
  },
];

const ON_WHATSAPP = "بنبعتهولك على الواتساب بعد الاتفاق";

const PAYMENT = [
  { method: "إنستاباي", who: "اللي عنده حساب بنك مصري", details: BUSINESS.instapay || ON_WHATSAPP, ltr: !!BUSINESS.instapay },
  { method: "محفظة إلكترونية", who: "اللي في مصر", details: BUSINESS.wallet || ON_WHATSAPP, ltr: !!BUSINESS.wallet },
  { method: "لينك دفع (كارت أو محفظة)", who: "الكل، ومنهم المصريين برّه بكروت أجنبية", details: "بنبعتلك اللينك على الواتساب بعد الاتفاق", ltr: false },
];

export default function Page() {
  return (
    <>
      <PageHead title="إزاي بنشتغل" lead="من غير لف ودوران: 3 خطوات، وكل حاجة واضحة قبل ما تدفع جنيه." />

      <section className="section container">
        <ol className="steps steps-light">
          {STEPS.map((s, i) => (
            <li key={s.title}>
              <span className="step-num">{i + 1}</span>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="section section-sand">
        <div className="container prose">
          <h2>طرق الدفع</h2>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>الطريقة</th>
                  <th>تنفع لمين</th>
                  <th>التفاصيل</th>
                </tr>
              </thead>
              <tbody>
                {PAYMENT.map((p) => (
                  <tr key={p.method}>
                    <td>
                      <strong>{p.method}</strong>
                    </td>
                    <td>{p.who}</td>
                    <td dir={p.ltr ? "ltr" : undefined}>{p.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p>بعد ما تحوّل، ابعتلنا صورة التحويل على الواتساب عشان نأكد الحجز على طول.</p>
          <p className="muted small">
            رحلات أسوان والنوبة: تقدر تدفع المبلغ كامل مقدماً، أو 50% مقدماً والباقي أول ما توصل.{" "}
            <Link href="/cancellation-policy">سياسة الإلغاء والاسترجاع</Link>
          </p>
        </div>
      </section>

      <section className="section container prose">
        <h2>لو إنت مصري شغال برّه</h2>
        <ul>
          <li>
            <strong>فرق التوقيت:</strong> ابعت في أي وقت، وهنرد عليك خلال 24 ساعة.
          </li>
          <li>
            <strong>الدفع:</strong> إنستاباي محتاج حساب بنك مصري. لو معاك كارت من برّه، هنبعتلك لينك دفع يقبله.
          </li>
          <li>
            <strong>الإجازات والمواسم:</strong> لو ناوي تنزل في العيد أو الصيف، ابعتلنا بدري. الأسعار في المواسم
            بتعلى بسرعة.
          </li>
        </ul>

        <h2>مواعيد الرد</h2>
        <p>بنرد على كل الرسايل خلال 24 ساعة. ومواعيد العمل {SITE.hours}.</p>

        <div className="actions">
          <a className="btn btn-wa" href={whatsappLink()} target="_blank" rel="noopener noreferrer">
            <WhatsAppIcon size={20} /> ابعتلنا طلبك على واتساب
          </a>
          <Link className="btn btn-outline" href="/faq">
            الأسئلة الشائعة
          </Link>
        </div>
      </section>
    </>
  );
}
