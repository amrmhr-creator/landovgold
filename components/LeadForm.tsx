"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import AirportInput from "@/components/AirportInput";
import WhatsAppIcon from "@/components/WhatsAppIcon";
import { SERVICES, TRANSPORT } from "@/lib/lead-options";
import { formatDate } from "@/lib/offers";
import { whatsappLink } from "@/lib/site";

/**
 * offer:   a flight offer page; route and date come from the offer.
 * flight:  "مش لاقي وجهتك؟" — from, to, date, travelers.
 * trip:    Aswan & Nubia booking — program, transport, date, travelers.
 * contact: contact page — service and free-text details.
 */
export type LeadKind = "offer" | "flight" | "trip" | "contact";

type Props = {
  kind: LeadKind;
  /** Offer slug (kind "offer"). */
  offer?: string;
  /** Offer name for the WhatsApp message after sending, e.g. "القاهرة إلى دبي يوم …". */
  offerLabel?: string;
  /** Preselected program (kind "trip"). */
  trip?: string;
  /** The programs to choose from (kind "trip"). */
  trips?: { slug: string; title: string }[];
  title?: string;
  submitLabel?: string;
  /**
   * Kind "flight" only: start with from, to and date; the rest of the form opens
   * after the first click (home page), so the first step looks short.
   */
  quick?: boolean;
};

function localToday() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** What the visitor asked for, in words, for the WhatsApp follow-up message. */
function describeRequest(kind: LeadKind, data: Record<string, string>, offerLabel: string | undefined, trips: { slug: string; title: string }[]) {
  switch (kind) {
    case "offer":
      return `عرض ${offerLabel ?? ""}`;
    case "flight":
      return `${data.from} ← ${data.to} يوم ${formatDate(data.date)}، ${data.travelers} فرد`;
    case "trip": {
      const trip = trips.find((t) => t.slug === data.trip);
      return `${trip?.title ?? "رحلة أسوان"} يوم ${formatDate(data.date)}، ${data.travelers} فرد`;
    }
    case "contact":
      return data.service;
  }
}

export default function LeadForm({ kind, offer, offerLabel, trip, trips = [], title, submitLabel = "ابعت الطلب", quick = false }: Props) {
  const pathname = usePathname();
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState("");
  const [waMessage, setWaMessage] = useState("");
  // Set after mount so the server-rendered HTML doesn't depend on the server's date.
  const [minDate, setMinDate] = useState<string>();
  useEffect(() => setMinDate(localToday()), []);
  const [expanded, setExpanded] = useState(!quick);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!expanded) {
      // First step done (the browser already checked from, to and date): open the rest.
      setExpanded(true);
      return;
    }
    setStatus("sending");
    setError("");
    const data = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, kind, offer, page: pathname }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "حصلت مشكلة، جرّب تاني.");
      setWaMessage(`أهلاً بلاد الدهب، أنا ${data.name}، لسه باعت طلب على الموقع: ${describeRequest(kind, data, offerLabel, trips)}`);
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

  const dateInput = (label: string) => (
    <label>
      {label}
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
  );

  const travelersInput = (
    <label>
      عدد المسافرين
      <input name="travelers" type="number" required min={1} max={50} defaultValue={1} inputMode="numeric" />
    </label>
  );

  const contactInputs = (
    <>
      <label>
        الاسم
        <input name="name" required minLength={2} maxLength={120} autoComplete="name" autoFocus={quick} />
      </label>
      <label>
        رقم الموبايل أو الواتساب
        <input name="phone" type="tel" required inputMode="tel" dir="ltr" maxLength={40} autoComplete="tel" placeholder="01xxxxxxxxx" />
      </label>
    </>
  );

  if (kind === "flight" && quick) {
    return (
      <form className="lead-form" onSubmit={onSubmit}>
        {title && <h3>{title}</h3>}
        <div className="lead-row">
          <AirportInput name="from" label="مسافر منين؟" placeholder="اكتب المدينة أو المطار" />
          <AirportInput name="to" label="رايح فين؟" placeholder="اكتب المدينة أو المطار" />
        </div>
        {dateInput("تاريخ السفر التقريبي")}
        {expanded && (
          <>
            {travelersInput}
            {contactInputs}
            <label className="check">
              <input type="checkbox" name="marketing" value="yes" />
              ابعتولي عروض جديدة على واتساب
            </label>
          </>
        )}
        <input name="website" tabIndex={-1} autoComplete="off" className="hp" aria-hidden="true" />
        {status === "error" && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <button className="btn btn-gold btn-block" type="submit" disabled={status === "sending"}>
          {!expanded ? "اطلب السعر" : status === "sending" ? "بيتبعت..." : submitLabel}
        </button>
      </form>
    );
  }

  return (
    <form className="lead-form" onSubmit={onSubmit}>
      {title && <h3>{title}</h3>}
      {contactInputs}

      {kind === "flight" && (
        <>
          <div className="lead-row">
            <AirportInput name="from" label="مسافر منين؟" placeholder="اكتب المدينة أو المطار" />
            <AirportInput name="to" label="رايح فين؟" placeholder="اكتب المدينة أو المطار" />
          </div>
          <div className="lead-row">
            {dateInput("تاريخ السفر التقريبي")}
            {travelersInput}
          </div>
        </>
      )}

      {kind === "trip" && (
        <>
          <label>
            البرنامج
            <select name="trip" required defaultValue={trip ?? trips[0]?.slug}>
              {trips.map((t) => (
                <option key={t.slug} value={t.slug}>
                  {t.title}
                </option>
              ))}
            </select>
          </label>
          <label>
            هتسافر أسوان إزاي؟
            <select name="transport" required defaultValue={TRANSPORT[0]}>
              {TRANSPORT.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </label>
          <div className="lead-row">
            {dateInput("تاريخ السفر التقريبي")}
            {travelersInput}
          </div>
        </>
      )}

      {kind === "contact" && (
        <>
          <label>
            الخدمة
            <select name="service" required defaultValue={SERVICES[0]}>
              {SERVICES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
          <label>
            تفاصيل طلبك
            <textarea name="details" required minLength={3} maxLength={1000} rows={4} />
          </label>
        </>
      )}

      <label className="check">
        <input type="checkbox" name="marketing" value="yes" />
        ابعتولي عروض جديدة على واتساب
      </label>

      {/* Honeypot: hidden from people, bots fill it. */}
      <input name="website" tabIndex={-1} autoComplete="off" className="hp" aria-hidden="true" />
      {status === "error" && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <button className="btn btn-gold btn-block" type="submit" disabled={status === "sending"}>
        {status === "sending" ? "بيتبعت..." : submitLabel}
      </button>
    </form>
  );
}
