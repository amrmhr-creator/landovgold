"use client";

import { useActionState } from "react";
import SeoFields from "@/components/SeoFields";
import { saveArticleAction, type ArticleFormState } from "../../actions";
import ArticleEditor from "./ArticleEditor";

type ImageChoice = { name: string; alt: string; src: string; small: string };

/** Add or edit an article. `initial` holds the field values; the body is Markdown. */
export default function ArticleForm({ initial, images }: { initial: Record<string, string>; images: ImageChoice[] }) {
  const [state, action, pending] = useActionState<ArticleFormState, FormData>(saveArticleAction, {
    error: "",
    values: initial,
    attempt: 0,
  });
  const v = state.values;

  return (
    <form key={state.attempt} action={action} className="lead-form admin-form admin-article-form">
      {v.slug && <input type="hidden" name="slug" value={v.slug} />}
      <label>
        عنوان المقال
        <input name="title" required maxLength={150} defaultValue={v.title} />
      </label>
      {!v.slug && (
        <label>
          اللينك بالإنجليزي (اختياري، زي best-time-to-fly). لو سبته فاضي هنعمله إحنا. مش بيتغيّر بعد الحفظ.
          <input name="wantedSlug" maxLength={80} defaultValue={v.wantedSlug} dir="ltr" placeholder="best-time-to-fly" />
        </label>
      )}
      <div className="lead-row">
        <label>
          القسم
          <select name="topic" defaultValue={v.topic || "flights"}>
            <option value="flights">نصايح سفر (طيران)</option>
            <option value="aswan">أسوان والنوبة</option>
          </select>
        </label>
      </div>
      <label>
        وصف قصير (بيظهر في قايمة المقالات)
        <input name="description" required maxLength={200} defaultValue={v.description} />
      </label>
      <label>
        الإجابة باختصار (جملة أو اتنين بيجاوبوا على سؤال المقال. دي أهم حاجة لجوجل والذكاء الاصطناعي)
        <textarea name="summary" required rows={3} maxLength={500} defaultValue={v.summary} />
      </label>

      <div>
        <p className="admin-editor-label">المقال</p>
        <ArticleEditor initial={v.body ?? ""} images={images} />
      </div>

      <SeoFields
        title={v.seoTitle}
        description={v.seoDescription}
        autoTitle={v.title || "بيتعمل من عنوان المقال"}
        autoDescription={v.summary || "بيتعمل من الإجابة باختصار"}
      />
      <label className="check">
        <input type="checkbox" name="visible" defaultChecked={v.visible !== "off"} />
        المقال ظاهر على الموقع
      </label>

      {state.error && (
        <p className="form-error" role="alert">
          {state.error}
        </p>
      )}
      <button className="btn btn-gold btn-block" type="submit" disabled={pending}>
        {pending ? "بيتحفظ..." : v.slug ? "احفظ التعديل" : "انشر المقال"}
      </button>
    </form>
  );
}
