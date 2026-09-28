import { NextResponse } from "next/server";
import { getOffer, offerTitle } from "@/lib/offers";
import { submitLead } from "@/lib/leads";

// Spam brake: 10 stored leads per IP per 10 minutes. Only successes count, so a visitor
// retrying after one of our failures isn't locked out.
// The counter lives in this process's memory, and Hostinger runs several app processes,
// so each keeps its own count: the real limit is looser than 10, never stricter.
const LIMIT = 10;
const WINDOW_MS = 10 * 60_000;
const hits = new Map<string, number[]>();
function recentHits(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  hits.set(ip, recent);
  return recent;
}

/** Visitor IP from the proxy headers, or null (then we don't throttle rather than lump everyone together). */
function clientIp(req: Request) {
  const forwarded = req.headers.get("x-forwarded-for")?.split(",")[0].trim();
  return forwarded || req.headers.get("x-real-ip")?.trim() || null;
}

const clean = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

/** YYYY-MM-DD from today (a day of slack for time zones) up to two years out, else null. */
function validTravelDate(v: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return null;
  const t = Date.parse(`${v}T00:00:00Z`);
  if (Number.isNaN(t) || new Date(t).toISOString().slice(0, 10) !== v) return null;
  const day = 86_400_000;
  if (t < Date.now() - 2 * day || t > Date.now() + 730 * day) return null;
  return v;
}

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "طلب غير صالح" }, { status: 400 });
  }

  // Honeypot field: real visitors never fill it.
  if (clean(body.website, 200)) return NextResponse.json({ ok: true });

  const name = clean(body.name, 120);
  // Accept Arabic-Indic digits (٠-٩) too.
  const phone = clean(body.phone, 40).replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)));
  const offer = getOffer(clean(body.offer, 120));

  const digits = phone.replace(/[^\d]/g, "");
  if (name.length < 2 || digits.length < 8 || digits.length > 15) {
    return NextResponse.json({ error: "اكتب اسمك ورقم موبايل صحيح." }, { status: 400 });
  }

  let destination: string;
  let travelDate: string | null;
  if (offer) {
    destination = offerTitle(offer);
    travelDate = offer.date;
  } else {
    const from = clean(body.from, 100);
    const to = clean(body.to, 100);
    if (!from || !to) return NextResponse.json({ error: "اختار مسافر منين ورايح فين." }, { status: 400 });
    if (from === to) return NextResponse.json({ error: "مطار السفر ومطار الوصول لازم يكونوا مختلفين." }, { status: 400 });
    travelDate = validTravelDate(clean(body.date, 10));
    if (!travelDate) return NextResponse.json({ error: "اختار تاريخ سفر صحيح." }, { status: 400 });
    destination = `${from} ← ${to}`;
  }

  const ip = clientIp(req);
  if (!ip) console.warn(`[leads] pid ${process.pid}: no x-forwarded-for / x-real-ip header, not throttling`);
  if (ip && recentHits(ip).length >= LIMIT) {
    console.warn(`[leads] pid ${process.pid}: throttled, ${LIMIT} leads from one IP in 10 minutes`);
    return NextResponse.json({ error: "طلبات كتير في وقت قصير، جرّب بعد شوية أو كلّمنا على واتساب." }, { status: 429 });
  }

  const ok = await submitLead({
    name,
    phone,
    destination,
    travelDate,
    offerSlug: offer?.slug ?? null,
    page: clean(body.page, 200) || null,
  });

  if (!ok) {
    return NextResponse.json({ error: "حصلت مشكلة وطلبك ما وصلش. كلّمنا على واتساب لو سمحت." }, { status: 500 });
  }
  if (ip) recentHits(ip).push(Date.now());
  return NextResponse.json({ ok: true });
}
