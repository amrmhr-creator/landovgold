"use server";

import { redirect } from "next/navigation";
import { logIn, logOut, requireAdmin } from "@/lib/admin-auth";
import { AIRPORTS } from "@/lib/airports";
import { describeError } from "@/lib/db";
import { createOffer, setOfferAvailable, updateOffer, type OfferInput } from "@/lib/offers-data";

export async function loginAction(formData: FormData) {
  const error = await logIn(String(formData.get("password") ?? ""));
  redirect(error ? `/admin/login?error=${encodeURIComponent(error)}` : "/admin");
}

export async function logoutAction() {
  await logOut();
  redirect("/admin/login");
}

export type OfferFormState = { error: string; values: Record<string, string>; attempt: number };

const text = (f: FormData, key: string, max: number) => String(f.get(key) ?? "").trim().slice(0, max);

/** "دبي (DXB)" → the airport, if it's one from the list. */
function airportFromLabel(label: string) {
  const code = label.match(/\(([A-Z]{3})\)\s*$/)?.[1];
  return code ? AIRPORTS.find((a) => a.code === code) : undefined;
}

/** "دبي (DXB)" → "دبي"; free text stays as typed. */
function cityName(label: string) {
  return airportFromLabel(label)?.city ?? label.replace(/\s*\([A-Z]{3}\)\s*$/, "");
}

/** English, link-friendly part for the offer URL, e.g. "cairo", or "" if unknown. */
function slugPart(label: string) {
  const en = airportFromLabel(label)?.en.split(" ")[0] ?? "";
  return en.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export async function saveOfferAction(prev: OfferFormState, formData: FormData): Promise<OfferFormState> {
  await requireAdmin();
  const values = Object.fromEntries([...formData.entries()].map(([k, v]) => [k, String(v)]));
  values.available = formData.get("available") === "on" ? "on" : "off"; // unchecked boxes aren't sent
  const fail = (error: string) => ({ error, values, attempt: prev.attempt + 1 });

  const id = Number(formData.get("id")) || null;
  const from = text(formData, "from", 100);
  const to = text(formData, "to", 100);
  const date = text(formData, "date", 10);
  // Empty price = 0, shown on the site as "اسأل عن سعر النهارده".
  const price = Number(text(formData, "price", 9).replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d))));
  const tripType = text(formData, "tripType", 20);

  if (!from || !to) return fail("اكتب مسافر منين ورايح فين.");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return fail("اختار تاريخ السفر.");
  if (!Number.isInteger(price) || price < 0) return fail("اكتب السعر بالجنيه، رقم صحيح، أو سيبه فاضي.");
  if (tripType !== "ذهاب فقط" && tripType !== "ذهاب وعودة") return fail("اختار ذهاب فقط أو ذهاب وعودة.");

  const offer: OfferInput = {
    from: cityName(from),
    to: cityName(to),
    date,
    price,
    tripType,
    airline: text(formData, "airline", 100),
    transit: text(formData, "transit", 100),
    baggage: text(formData, "baggage", 100),
    extras: text(formData, "extras", 2000)
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean),
    available: formData.get("available") === "on",
  };
  if (!offer.airline || !offer.transit || !offer.baggage) return fail("اكتب شركة الطيران والترانزيت والشنط.");

  let slug: string;
  try {
    if (id) {
      await updateOffer(id, offer);
      slug = text(formData, "slug", 100);
    } else {
      const route = [slugPart(from), slugPart(to)].filter(Boolean).join("-") || "offer";
      slug = await createOffer(offer, `${route}-${date}`);
    }
  } catch (err) {
    console.error(`[admin] pid ${process.pid}: saving offer failed: ${describeError(err)}`);
    return fail("العرض ما اتحفظش بسبب مشكلة في قاعدة البيانات. جرّب تاني بعد شوية.");
  }
  redirect(`/admin/offers?saved=${encodeURIComponent(slug)}`);
}

export async function toggleOfferAction(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  if (id) await setOfferAvailable(id, formData.get("available") === "1");
  redirect("/admin/offers");
}
