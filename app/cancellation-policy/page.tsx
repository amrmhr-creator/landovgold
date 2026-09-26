export const metadata = { title: "سياسة الإلغاء والاسترجاع" };

const ROWS = [
  ["رحلات: قبل الرحلة بـ 15 يوم أو أكتر", "المبلغ كامل"],
  ["رحلات: من 7 لـ 14 يوم قبل الرحلة", "50 بالمية"],
  ["رحلات: أقل من 7 أيام", "مفيش استرداد"],
  ["تذاكر الطيران", "حسب قواعد شركة الطيران"],
];

export default function Page() {
  return (
    <section className="section container prose">
      <h1>سياسة الإلغاء والاسترجاع</h1>
      <table className="table">
        <thead>
          <tr><th>حالة الإلغاء</th><th>الاسترداد</th></tr>
        </thead>
        <tbody>
          {ROWS.map(([when, refund]) => (
            <tr key={when}><td>{when}</td><td>{refund}</td></tr>
          ))}
        </tbody>
      </table>
      <p>الاسترداد بيتحسب على المبلغ اللي العميل دفعه فعلاً.</p>

      <h2>خيارات الدفع لرحلات أسوان والنوبة</h2>
      <p>بتختار الطريقة اللي تناسبك:</p>
      <ul>
        <li>تدفع المبلغ كامل مقدماً.</li>
        <li>تدفع 50 بالمية مقدماً، والـ 50 بالمية الباقية أول ما توصل.</li>
      </ul>
    </section>
  );
}
