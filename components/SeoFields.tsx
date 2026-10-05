/**
 * The optional "Google and sharing" fields in the trip and article forms. Empty fields are
 * filled in automatically; the placeholders show what will be used.
 */
export default function SeoFields({ title, description, autoTitle, autoDescription }: { title?: string; description?: string; autoTitle: string; autoDescription: string }) {
  return (
    <details className="admin-seo">
      <summary>جوجل والمشاركة على الواتساب (اختياري)</summary>
      <p className="muted small">
        ده العنوان والوصف اللي بيظهروا في جوجل ولما حد يبعت اللينك على الواتساب أو فيسبوك. لو سبتهم فاضيين، بيتعملوا لوحدهم
        من الكلام اللي فوق (زي اللي مكتوب باهت جوه الخانة). والصورة هي صورة الصفحة نفسها.
      </p>
      <label>
        العنوان
        <input name="seoTitle" maxLength={70} defaultValue={title} placeholder={autoTitle} />
      </label>
      <label>
        الوصف (حوالي 150 حرف)
        <textarea name="seoDescription" rows={2} maxLength={200} defaultValue={description} placeholder={autoDescription} />
      </label>
    </details>
  );
}
