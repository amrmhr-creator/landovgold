"use client";

import { useActionState, useState } from "react";
import { saveTripAction, type TripFormState } from "../../actions";

type ImageChoice = { name: string; alt: string; small: string };
export type TripDayDraft = { title: string; items: string };

/**
 * Add or edit a trip. `initial` holds the plain fields; the program is a list of days,
 * each with a title and its activities (one per line).
 */
export default function TripForm({
  initial,
  days: initialDays,
  images,
}: {
  initial: Record<string, string>;
  days: TripDayDraft[];
  images: ImageChoice[];
}) {
  const [state, action, pending] = useActionState<TripFormState, FormData>(saveTripAction, {
    error: "",
    values: initial,
    days: initialDays,
    attempt: 0,
  });
  const v = state.values;
  const [days, setDays] = useState<TripDayDraft[]>(state.days.length ? state.days : [{ title: "", items: "" }]);
  const [photo, setPhoto] = useState(v.photo ?? "");
  const chosen = images.find((i) => i.name === photo);

  const setDay = (i: number, patch: Partial<TripDayDraft>) => setDays((d) => d.map((day, j) => (j === i ? { ...day, ...patch } : day)));

  return (
    <form key={state.attempt} action={action} className="lead-form admin-form">
      {v.slug && <input type="hidden" name="slug" value={v.slug} />}
      <label>
        اسم الرحلة
        <input name="title" required maxLength={120} defaultValue={v.title} placeholder="أسوان في 3 أيام" />
      </label>
      <div className="lead-row">
        <label>
          المدة (زي ما هتظهر)
          <input name="duration" required maxLength={60} defaultValue={v.duration} placeholder="3 أيام (ليلتين)" />
        </label>
        <label>
          السعر يبدأ من (جنيه للفرد، فاضي = &quot;اسأل عن السعر&quot;)
          <input name="price" type="number" min={0} step={1} inputMode="numeric" defaultValue={v.price} />
        </label>
      </div>
      <label>
        المواعيد (اختياري، زي: كل خميس من نوفمبر لفبراير)
        <input name="dates" maxLength={150} defaultValue={v.dates} />
      </label>
      <label>
        ملخص قصير (بيظهر في الكارت وفي جوجل)
        <textarea name="summary" required rows={3} maxLength={400} defaultValue={v.summary} />
      </label>

      <fieldset className="admin-days">
        <legend>البرنامج يوم بيوم</legend>
        {days.map((day, i) => (
          <div key={i} className="admin-day">
            <label>
              عنوان اليوم {i + 1}
              <input
                name="dayTitle"
                required
                maxLength={120}
                value={day.title}
                onChange={(e) => setDay(i, { title: e.target.value })}
                placeholder={`اليوم ${i + 1}: ...`}
              />
            </label>
            <label>
              اللي هيحصل في اليوم (كل حاجة في سطر)
              <textarea name="dayItems" required rows={3} maxLength={1500} value={day.items} onChange={(e) => setDay(i, { items: e.target.value })} />
            </label>
            {days.length > 1 && (
              <button type="button" className="btn btn-outline btn-sm" onClick={() => setDays((d) => d.filter((_, j) => j !== i))}>
                شيل اليوم ده
              </button>
            )}
          </div>
        ))}
        <button type="button" className="btn btn-outline btn-sm" onClick={() => setDays((d) => [...d, { title: "", items: "" }])}>
          + أضف يوم
        </button>
      </fieldset>

      <label>
        صورة الرحلة
        <select name="photo" value={photo} onChange={(e) => setPhoto(e.target.value)}>
          <option value="">الصورة الأصلية</option>
          {images.map((i) => (
            <option key={i.name} value={i.name}>
              {i.alt || i.name.slice(0, 8)}
            </option>
          ))}
        </select>
      </label>
      {chosen && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={chosen.small} alt="" width={240} height={160} className="admin-offer-preview" />
      )}
      {images.length === 0 && <p className="muted small">عشان تختار صورة، ارفعها الأول من صفحة &quot;الصور&quot;.</p>}

      <label className="check">
        <input type="checkbox" name="visible" defaultChecked={v.visible !== "off"} />
        الرحلة ظاهرة على الموقع
      </label>

      {state.error && (
        <p className="form-error" role="alert">
          {state.error}
        </p>
      )}
      <button className="btn btn-gold btn-block" type="submit" disabled={pending}>
        {pending ? "بيتحفظ..." : v.slug ? "احفظ التعديل" : "أضف الرحلة"}
      </button>
    </form>
  );
}
