"use client";

import { useActionState, useState } from "react";
import AirportInput from "@/components/AirportInput";
import { saveOfferAction, type OfferFormState } from "../../actions";

type ImageChoice = { name: string; alt: string; small: string };

/**
 * Add or edit an offer. `initial` holds the field values (strings, as in the form);
 * `images` are the photos uploaded in /admin/images, for the optional offer photo.
 */
export default function OfferForm({ initial, images }: { initial: Record<string, string>; images: ImageChoice[] }) {
  const [state, action, pending] = useActionState<OfferFormState, FormData>(saveOfferAction, {
    error: "",
    values: initial,
    attempt: 0,
  });
  const v = state.values;
  const [image, setImage] = useState(v.image ?? "");
  const chosen = images.find((i) => i.name === image);

  return (
    // Remounted after a failed save so the fields show what was typed, not the originals.
    <form key={state.attempt} action={action} className="lead-form admin-form">
      {v.id && <input type="hidden" name="id" value={v.id} />}
      {v.slug && <input type="hidden" name="slug" value={v.slug} />}

      <div className="lead-row">
        <AirportInput name="from" label="من" placeholder="اكتب المدينة أو المطار" defaultValue={v.from} />
        <AirportInput name="to" label="إلى" placeholder="اكتب المدينة أو المطار" defaultValue={v.to} />
      </div>
      <div className="lead-row">
        <label>
          تاريخ السفر
          <input name="date" type="date" required defaultValue={v.date} />
        </label>
        <label>
          نوع الرحلة
          <select name="tripType" defaultValue={v.tripType || "ذهاب وعودة"}>
            <option>ذهاب وعودة</option>
            <option>ذهاب فقط</option>
          </select>
        </label>
      </div>
      <div className="lead-row">
        <label>
          السعر يبدأ من (جنيه للفرد، فاضي = &quot;اسأل عن سعر النهارده&quot;)
          <input name="price" type="number" min={0} step={1} inputMode="numeric" defaultValue={v.price} />
        </label>
        <label>
          شركة الطيران
          <input name="airline" required maxLength={100} defaultValue={v.airline} placeholder="مصر للطيران" />
        </label>
      </div>
      <div className="lead-row">
        <label>
          الترانزيت
          <input name="transit" required maxLength={100} defaultValue={v.transit || "طيران مباشر"} placeholder="طيران مباشر، أو ترانزيت في جدة" />
        </label>
        <label>
          الشنط
          <input name="baggage" required maxLength={100} defaultValue={v.baggage} placeholder="شنطة 23 كيلو" />
        </label>
      </div>
      <label>
        تفاصيل زيادة (اختياري، كل سطر لوحده)
        <textarea name="extras" rows={3} maxLength={2000} defaultValue={v.extras} />
      </label>
      <label>
        صورة العرض (اختياري)
        <select name="image" value={image} onChange={(e) => setImage(e.target.value)}>
          <option value="">من غير صورة</option>
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
      {images.length === 0 && <p className="muted small">عشان تحط صورة، ارفعها الأول من صفحة &quot;الصور&quot;.</p>}
      <label className="check">
        <input type="checkbox" name="available" defaultChecked={v.available !== "off"} />
        العرض ظاهر على الموقع
      </label>

      {state.error && (
        <p className="form-error" role="alert">
          {state.error}
        </p>
      )}
      <button className="btn btn-gold btn-block" type="submit" disabled={pending}>
        {pending ? "بيتحفظ..." : v.id ? "احفظ التعديل" : "أضف العرض"}
      </button>
    </form>
  );
}
