import { requireAdmin } from "@/lib/admin-auth";
import { allFaq, type FaqItem, type StoredFaqGroup } from "@/lib/faq-data";
import { moveQuestionAction, saveQuestionAction } from "../../actions";

export const metadata = { title: "الأسئلة الشائعة" };

/** One question's form, or (without `item`) the form for a new question in `group`. */
function QuestionForm({ group, groups, item }: { group: StoredFaqGroup; groups: StoredFaqGroup[]; item?: FaqItem }) {
  return (
    <form action={saveQuestionAction} className="admin-faq-form">
      {item && <input type="hidden" name="id" value={item.id} />}
      <label>
        السؤال
        <input name="q" required maxLength={300} defaultValue={item?.q} />
      </label>
      <label>
        الإجابة
        <textarea name="a" required rows={4} maxLength={3000} defaultValue={item?.a} />
      </label>
      <div className="admin-row-actions">
        <label>
          المجموعة{" "}
          <select name="group" defaultValue={group.key}>
            {groups.map((g) => (
              <option key={g.key} value={g.key}>
                {g.title}
              </option>
            ))}
          </select>
        </label>
        <label className="check">
          <input type="checkbox" name="visible" defaultChecked={!item?.hidden} /> ظاهر على الموقع
        </label>
        <button className="btn btn-gold btn-sm" type="submit">
          {item ? "احفظ" : "أضف السؤال"}
        </button>
      </div>
    </form>
  );
}

export default async function Page({ searchParams }: { searchParams: Promise<{ saved?: string; error?: string }> }) {
  await requireAdmin();
  const [{ saved, error }, groups] = await Promise.all([searchParams, allFaq()]);

  return (
    <>
      <div className="admin-title">
        <h1>الأسئلة الشائعة</h1>
      </div>
      <p className="muted">
        أسئلة الطيران بتظهر كمان في صفحة الطيران، وأسئلة الرحلات في صفحة الرحلات. وكلها بتظهر في صفحة الأسئلة الشائعة.
      </p>
      {saved && (
        <p className="admin-saved" role="status">
          <strong>✓ اتحفظ.</strong>
        </p>
      )}
      {error && (
        <p className="form-error" role="alert">
          اكتب السؤال والإجابة.
        </p>
      )}

      {groups.map((group) => (
        <section key={group.key} id={group.key} className="admin-faq-group">
          <h2>{group.title}</h2>
          {group.items.map((item, i) => (
            <details key={item.id} className={`faq-item${item.hidden ? " is-hidden" : ""}`}>
              <summary>
                {item.q}
                {item.hidden && <span className="admin-status is-hidden"> مخفي</span>}
              </summary>
              <div className="admin-faq-body">
                <QuestionForm group={group} groups={groups} item={item} />
                <div className="admin-row-actions">
                  {i > 0 && (
                    <form action={moveQuestionAction}>
                      <input type="hidden" name="id" value={item.id} />
                      <input type="hidden" name="group" value={group.key} />
                      <input type="hidden" name="dir" value="up" />
                      <button className="btn btn-outline btn-sm" type="submit">
                        ↑ طلّعه فوق
                      </button>
                    </form>
                  )}
                  {i < group.items.length - 1 && (
                    <form action={moveQuestionAction}>
                      <input type="hidden" name="id" value={item.id} />
                      <input type="hidden" name="group" value={group.key} />
                      <input type="hidden" name="dir" value="down" />
                      <button className="btn btn-outline btn-sm" type="submit">
                        ↓ نزّله تحت
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </details>
          ))}
          <details className="faq-item admin-faq-new">
            <summary>+ سؤال جديد في &quot;{group.title}&quot;</summary>
            <div className="admin-faq-body">
              <QuestionForm group={group} groups={groups} />
            </div>
          </details>
        </section>
      ))}
    </>
  );
}
