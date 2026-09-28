"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import AirportInput from "@/components/AirportInput";
import WhatsAppIcon from "@/components/WhatsAppIcon";
import { formatDate } from "@/lib/offers";
import { whatsappLink } from "@/lib/site";

type Props = {
  /** Offer slug: route and date come from the offer, so those fields are hidden. */
  offer?: string;
  /** Offer name for the WhatsApp message after sending, e.g. "القاهرة ← دبي". */
  offerLabel?: string;
  title?: string;
};

function localToday() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function LeadForm({ offer, offerLabel, title = "أو سيب بياناتك ونكلّمك" }: Props) {
  const pathname = usePathname();
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState("");
  const [waMessage, setWaMessage] = useState("");
  // Set after mount so the server-rendered HTML doesn't depend on the server's date.
  const [minDate, setMinDate] = useState<string>();
  useEffect(() => setMinDate(localToday()), []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    setError("");
    const data = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, offer, page: pathname }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "حصلت مشكلة، جرّب تاني.");
      const request = offer ? `عرض ${offerLabel ?? ""}` : `${data.from} ← ${data.to} يوم ${formatDate(data.date)}`;
      setWaMessage(`أهلاً بلاد الدهب، أنا ${data.name}، لسه باعت طلب على الموقع: ${request}`);
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
        <a className="btn btn-wa btn-block" href={whatsappLink(waMessage)} target="_blank" rel="noopener noreferrer">
          <WhatsAppIcon size={20} /> كلّمنا على واتساب
        </a>
        <Link href="/" className="btn btn-outline btn-block">
          الرجوع للرئيسية
        </Link>
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
        <>
          <div className="lead-row">
            <AirportInput name="from" label="من" placeholder="اكتب المدينة أو المطار" />
            <AirportInput name="to" label="إلى" placeholder="اكتب المدينة أو المطار" />
          </div>
          <label>
            تاريخ السفر
            <input
              name="date"
              type="date"
              required
              min={minDate}
              // Open the calendar on any click, not just on the small icon.
              onClick={(e) => {
                try {
                  e.currentTarget.showPicker();
                } catch {}
              }}
            />
          </label>
        </>
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
