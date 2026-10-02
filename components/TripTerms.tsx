import Link from "next/link";
import { formatPrice } from "@/lib/offers";
import { TRAIN_DISCOUNT, TRIP_EXCLUDES, TRIP_INCLUDES } from "@/lib/trips";

/** What every Aswan program includes, travel choice and payment options. Shared by the section and program pages. */
export default function TripTerms() {
  return (
    <div className="grid-2">
      <div className="card">
        <h2>البرنامج يشمل</h2>
        <ul className="check-list">
          {TRIP_INCLUDES.map((i) => (
            <li key={i}>{i}</li>
          ))}
        </ul>
        <h2>البرنامج ما يشملش</h2>
        <ul className="x-list">
          {TRIP_EXCLUDES.map((i) => (
            <li key={i}>{i}</li>
          ))}
        </ul>
      </div>

      <div className="card">
        <h2>تختار تسافر إزاي</h2>
        <ul>
          <li>
            <strong>بالطيارة:</strong> أسرع وبتوفّر يوم سفر، والسعر المكتوب بيها.
          </li>
          <li>
            <strong>بالقطر:</strong> أوفر، وبيقل السعر حوالي {formatPrice(TRAIN_DISCOUNT)} للفرد.
          </li>
        </ul>
        <h2>خيارات الدفع</h2>
        <ul>
          <li>تدفع المبلغ كامل مقدماً.</li>
          <li>أو تدفع 50% مقدماً، والـ 50% الباقية أول ما توصل.</li>
        </ul>
        <p className="muted small">
          السعر النهائي بيتحدد حسب اختيارك، وبنأكدهولك على الواتساب قبل الدفع. تقدر تلغي وترجعلك فلوسك كاملة
          لو قبل الرحلة بـ 15 يوم أو أكتر. <Link href="/cancellation-policy">اقرأ سياسة الإلغاء</Link>
        </p>
      </div>
    </div>
  );
}
