import Link from "next/link";
import PageHead from "@/components/PageHead";
import WhatsAppIcon from "@/components/WhatsAppIcon";
import { getSettings } from "@/lib/settings";
import { whatsappLink } from "@/lib/site";

export const metadata = {
  title: "إزاي بنشتغل",
  description:
    "3 خطوات: تبعت طلبك، نرجعلك بأكتر من اختيار خلال 24 ساعة، وتختار اللي يناسبك. طرق الدفع بإنستاباي والمحفظة ولينك دفع بالكارت للمصريين في مصر وبرّه.",
};

const ON_WHATSAPP = "بنبعتهولك على الواتساب بعد الاتفاق";

export default async function Page() {
  const s = await getSettings();
  const { instapay, wallet } = s.business;
  const payment = [
    { method: "إنستاباي", who: "اللي عنده حساب بنك مصري", details: instapay || ON_WHATSAPP, ltr: !!instapay },
    { method: "محفظة إلكترونية", who: "اللي في مصر", details: wallet || ON_WHATSAPP, ltr: !!wallet },
    { method: "لينك دفع (كارت أو محفظة)", who: "الكل، ومنهم المصريين برّه بكروت أجنبية", details: "بنبعتلك اللينك على الواتساب بعد الاتفاق", ltr: false },
  ];

  return (
    <>
      <PageHead title="إزاي بنشتغل" lead={s.get("how.lead")} />

      <section className="section container">
        <ol className="steps steps-light">
          {s.howSteps.map((step, i) => (
            <li key={i}>
              <span className="step-num">{i + 1}</span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
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
                {payment.map((p) => (
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
        <p>بنرد على كل الرسايل خلال 24 ساعة. ومواعيد العمل {s.hours}.</p>

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
