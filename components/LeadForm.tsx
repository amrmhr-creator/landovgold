"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";

type Props = {
  /** Offer slug: the destination is taken from the offer and the field is hidden. */
  offer?: string;
  title?: string;
};

export default function LeadForm({ offer, title = "أو سيب بياناتك ونكلّمك" }: Props) {
  const pathname = usePathname();
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    setError("");
    const data = Object.fromEntries(new FormData(e.currentTarget));
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, offer, page: pathname }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "حصلت مشكلة، جرّب تاني.");
      setStatus("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "حصلت مشكلة، جرّب تاني.");
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div className="lead-form lead-done" role="status">
        <span className="lead-check" aria-hidden="true">✓</span>
        <h3>طلبك وصل، هنرد عليك خلال 24 ساعة</h3>
        <p className="muted">لو مستعجل، كلّمنا على واتساب.</p>
      </div>
    );
  }

  return (
    <form className="lead-form" onSubmit={onSubmit} noValidate={false}>
      <h3>{title}</h3>
      <label>
        الاسم
        <input name="name" required minLength={2} maxLength={120} autoComplete="name" />
      </label>
      <label>
        رقم الموبايل (واتساب لو أمكن)
        <input name="phone" type="tel" required inputMode="tel" dir="ltr" maxLength={40} autoComplete="tel" placeholder="01xxxxxxxxx" />
      </label>
      {!offer && (
        <label>
          الوجهة
          <input name="destination" required maxLength={200} placeholder="مثلاً: القاهرة ← جدة، أو رحلة أسوان" />
        </label>
      )}
      {/* Honeypot: hidden from people, bots fill it. */}
      <input name="website" tabIndex={-1} autoComplete="off" className="hp" aria-hidden="true" />
      {status === "error" && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <button className="btn btn-gold btn-block" type="submit" disabled={status === "sending"}>
        {status === "sending" ? "بيتبعت..." : "ابعت طلبك"}
      </button>
    </form>
  );
}
