import { NextResponse } from "next/server";
import { describeError } from "@/lib/db";
import { SERVICES, SERVICE_SECTION, TRANSPORT } from "@/lib/lead-options";
import { submitLead, type Lead } from "@/lib/leads";
import { offerTitle } from "@/lib/offers";
import { getOffer } from "@/lib/offers-data";
import { getTrip } from "@/lib/trips";

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

/** Western digits for Arabic-Indic ones (٠-٩). */
const westernDigits = (s: string) => s.replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)));

/** YYYY-MM-DD from today (a day of slack for time zones) up to two years out, else null. */
function validTravelDate(v: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return null;
  const t = Date.parse(`${v}T00:00:00Z`);
  if (Number.isNaN(t) || new Date(t).toISOString().slice(0, 10) !== v) return null;
  const day = 86_400_000;
  if (t < Date.now() - 2 * day || t > Date.now() + 730 * day) return null;
  return v;
}

/** Whole number of travelers from 1 to 50, else null. */
function validTravelers(v: unknown) {
  const n = Number(westernDigits(clean(v, 5)));
  return Number.isInteger(n) && n >= 1 && n <= 50 ? n : null;
}

const oneOf = <T extends string>(options: readonly T[], v: string): T | null =>
  (options as readonly string[]).includes(v) ? (v as T) : null;

class InvalidLead extends Error {}

/** The request part of the lead, per form kind. Throws InvalidLead with the message to show. */
async function parseRequest(body: Record<string, unknown>): Promise<Omit<Lead, "name" | "phone" | "marketingOk" | "page">> {
  const kind = clean(body.kind, 20);
  const needDate = () => {
    const date = validTravelDate(clean(body.date, 10));
    if (!date) throw new InvalidLead("اختار تاريخ سفر صحيح.");
    return date;
  };
  const needTravelers = () => {
    const n = validTravelers(body.travelers);
    if (!n) throw new InvalidLead("اكتب عدد المسافرين من 1 لـ 50.");
    return n;
  };

  if (kind === "offer") {
    const slug = clean(body.offer, 120);
    let offer;
    try {
      offer = await getOffer(slug);
    } catch (err) {
      // The database is down, but the email can still carry the lead.
      console.error(`[leads] pid ${process.pid}: offer lookup failed: ${describeError(err)}`);
      return { kind, section: "flights", destination: `عرض ${slug}`, travelDate: null, travelers: null, details: null, offerSlug: slug };
    }
    if (!offer) throw new InvalidLead("العرض ده مش موجود.");
    return { kind, section: "flights", destination: offerTitle(offer), travelDate: offer.date, travelers: null, details: null, offerSlug: offer.slug };
  }
  if (kind === "flight") {
    const from = clean(body.from, 100);
    const to = clean(body.to, 100);
    if (!from || !to) throw new InvalidLead("اختار مسافر منين ورايح فين.");
    if (from === to) throw new InvalidLead("مطار السفر ومطار الوصول لازم يكونوا مختلفين.");
    return { kind, section: "flights", destination: `${from} ← ${to}`, travelDate: needDate(), travelers: needTravelers(), details: null, offerSlug: null };
  }
  if (kind === "trip") {
    const trip = getTrip(clean(body.trip, 120));
    const transport = oneOf(TRANSPORT, clean(body.transport, 20));
    if (!trip || !transport) throw new InvalidLead("اختار البرنامج وطريقة السفر.");
    return { kind, section: "aswan", destination: `${trip.title} (${transport})`, travelDate: needDate(), travelers: needTravelers(), details: null, offerSlug: trip.slug };
  }
  if (kind === "contact") {
    const service = oneOf(SERVICES, clean(body.service, 40));
    const details = clean(body.details, 1000);
    if (!service) throw new InvalidLead("اختار الخدمة.");
    if (details.length < 3) throw new InvalidLead("اكتب تفاصيل طلبك.");
    return { kind, section: SERVICE_SECTION[service], destination: service, travelDate: null, travelers: null, details, offerSlug: null };
  }
  throw new InvalidLead("طلب غير صالح");
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
  const phone = westernDigits(clean(body.phone, 40));
  const digits = phone.replace(/[^\d]/g, "");
  if (name.length < 2 || digits.length < 8 || digits.length > 15) {
    return NextResponse.json({ error: "اكتب اسمك ورقم موبايل صحيح." }, { status: 400 });
  }

  let request;
  try {
    request = await parseRequest(body);
  } catch (err) {
    if (err instanceof InvalidLead) return NextResponse.json({ error: err.message }, { status: 400 });
    throw err;
  }

  const ip = clientIp(req);
  if (!ip) console.warn(`[leads] pid ${process.pid}: no x-forwarded-for / x-real-ip header, not throttling`);
  if (ip && recentHits(ip).length >= LIMIT) {
    console.warn(`[leads] pid ${process.pid}: throttled, ${LIMIT} leads from one IP in 10 minutes`);
    return NextResponse.json({ error: "طلبات كتير في وقت قصير، جرّب بعد شوية أو كلّمنا على واتساب." }, { status: 429 });
  }

  const lead: Lead = {
    name,
    phone,
    ...request,
    marketingOk: body.marketing === "yes",
    page: clean(body.page, 200) || null,
  };
  const ok = await submitLead(lead);

  if (!ok) {
    return NextResponse.json({ error: "حصلت مشكلة وطلبك ما وصلش. كلّمنا على واتساب لو سمحت." }, { status: 500 });
  }
  if (ip) recentHits(ip).push(Date.now());
  return NextResponse.json({ ok: true });
}
