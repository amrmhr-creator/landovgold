import { NextResponse } from "next/server";
import { getOffer, offerTitle } from "@/lib/offers";
import { submitLead } from "@/lib/leads";

// Basic per-IP throttle: 5 submissions per 10 minutes (per server process).
const hits = new Map<string, number[]>();
function throttled(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 10 * 60_000);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > 5;
}

const clean = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "طلب غير صالح" }, { status: 400 });
  }

  // Honeypot field: real visitors never fill it.
  if (clean(body.website, 200)) return NextResponse.json({ ok: true });

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
  if (throttled(ip)) {
    return NextResponse.json({ error: "طلبات كتير في وقت قصير، جرّب بعد شوية أو كلّمنا على واتساب." }, { status: 429 });
  }

  const name = clean(body.name, 120);
  // Accept Arabic-Indic digits (٠-٩) too.
  const phone = clean(body.phone, 40).replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)));
  const offer = getOffer(clean(body.offer, 120));
  const destination = offer ? offerTitle(offer) : clean(body.destination, 200);

  const digits = phone.replace(/[^\d]/g, "");
  if (name.length < 2 || digits.length < 8 || digits.length > 15 || !destination) {
    return NextResponse.json({ error: "اكتب اسمك ورقم صحيح والوجهة." }, { status: 400 });
  }

  const ok = await submitLead({
    name,
    phone,
    destination,
    offerSlug: offer?.slug ?? null,
    page: clean(body.page, 200) || null,
  });

  if (!ok) {
    return NextResponse.json({ error: "حصلت مشكلة وطلبك ما وصلش. كلّمنا على واتساب لو سمحت." }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
