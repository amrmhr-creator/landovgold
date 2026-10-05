"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { RESET_LINK_MINUTES, createResetToken, passwordProblem, resetPassword, setOwnerPassword } from "@/lib/admin-accounts";
import { checkPassword, logIn, logOut, requireAdmin, startSession } from "@/lib/admin-auth";
import { runBackup } from "@/lib/backup";
import { AIRPORTS } from "@/lib/airports";
import { ArticleError, deleteArticle, restoreArticle, saveArticle, setArticleHidden } from "@/lib/blog-data";
import { describeError } from "@/lib/db";
import { deleteQuestion, isGroupKey, moveQuestion, restoreQuestion, saveQuestion } from "@/lib/faq-data";
import { escapeHtml, mailConfigured, sendMail } from "@/lib/mail";
import { createOffer, deleteOffer, restoreOffer, setOfferAvailable, updateOffer, type OfferInput } from "@/lib/offers-data";
import { SettingsError, saveSettings } from "@/lib/settings";
import { SITE } from "@/lib/site";
import { purgeFromTrash, takeFromTrash, type TrashKind } from "@/lib/trash";
import { deleteTrip, restoreTrip, saveTrip, setTripHidden } from "@/lib/trips-data";
import { deleteImage, isImageName, restoreImage, savePicks, updateAlt } from "@/lib/uploads";

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
    image: isImageName(text(formData, "image", 40)) ? text(formData, "image", 40) : undefined,
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

/** Where uploaded photos are used: one per trip, the trips gallery, and "مين احنا". */
export async function saveImagePicksAction(formData: FormData) {
  await requireAdmin();
  const trips: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (key.startsWith("trip:") && value) trips[key.slice(5)] = String(value);
  }
  await savePicks({
    trips,
    gallery: formData.getAll("gallery").map(String),
    about: formData.getAll("about").map(String),
  });
  revalidatePath("/", "layout");
  redirect("/admin/images?saved=1");
}

export async function saveImageAltAction(formData: FormData) {
  await requireAdmin();
  const name = String(formData.get("name") ?? "");
  if (isImageName(name)) await updateAlt(name, String(formData.get("alt") ?? ""));
  revalidatePath("/", "layout");
  redirect("/admin/images");
}

export type SettingsFormState = { error: string; saved: boolean; values: Record<string, string>; attempt: number };

export async function saveSettingsAction(prev: SettingsFormState, formData: FormData): Promise<SettingsFormState> {
  await requireAdmin();
  const values = Object.fromEntries([...formData.entries()].map(([k, v]) => [k, String(v)]));
  try {
    await saveSettings(values);
  } catch (err) {
    if (err instanceof SettingsError) return { error: err.message, saved: false, values, attempt: prev.attempt + 1 };
    throw err;
  }
  revalidatePath("/", "layout");
  return { error: "", saved: true, values, attempt: prev.attempt + 1 };
}

export type PasswordFormState = { error: string; done: boolean };

/** Changing the password from "حسابي": needs the current one. */
export async function changePasswordAction(_prev: PasswordFormState, formData: FormData): Promise<PasswordFormState> {
  await requireAdmin();
  const current = String(formData.get("current") ?? "");
  const password = String(formData.get("password") ?? "");
  if (!(await checkPassword(current))) return { error: "الباسورد الحالي غلط.", done: false };
  const problem = passwordProblem(password, String(formData.get("confirm") ?? ""));
  if (problem) return { error: problem, done: false };
  await setOwnerPassword(password);
  // The session key follows the password, so this browser needs a new session; others are logged out.
  await startSession();
  return { error: "", done: true };
}

/** "نسيت الباسورد": emails a one-time link to ADMIN_EMAIL (the owner's personal email). */
export async function requestResetAction(_prev: PasswordFormState, _formData: FormData): Promise<PasswordFormState> {
  const to = process.env.ADMIN_EMAIL?.trim();
  if (!to) return { error: "استرجاع الباسورد مش متفعّل لسه: لازم ADMIN_EMAIL يتحط في hPanel.", done: false };
  const devNoMail = process.env.NODE_ENV !== "production" && !mailConfigured();
  if (!devNoMail && !mailConfigured()) return { error: "الإيميل مش متظبط على السيرفر، فمش هنقدر نبعت اللينك.", done: false };

  const token = await createResetToken();
  if (!token) return { error: "اتبعتلك لينك من شوية. استنى 5 دقايق قبل ما تطلب واحد تاني.", done: false };
  // The live site always links to its own address, never to the Host header a request claims.
  const base = process.env.NODE_ENV === "production" ? SITE.url : `http://localhost:${process.env.PORT || 3000}`;
  const link = `${base}/admin/reset?token=${token}`;

  if (devNoMail) {
    console.log(`[admin] reset link (local test, no SMTP): ${link}`);
    return { error: "", done: true };
  }
  try {
    await sendMail({
      to,
      subject: `${SITE.name}: لينك تغيير باسورد لوحة التحكم`,
      text: `حد طلب تغيير باسورد لوحة التحكم. لو ده إنت، افتح اللينك ده خلال ${RESET_LINK_MINUTES} دقيقة:\n${link}\n\nلو مش إنت، تجاهل الرسالة دي، والباسورد مش هيتغيّر.`,
      html: `<div dir="rtl" style="font-family:sans-serif"><p>حد طلب تغيير باسورد لوحة التحكم. لو ده إنت، افتح اللينك ده خلال ${RESET_LINK_MINUTES} دقيقة:</p><p><a href="${escapeHtml(link)}">غيّر الباسورد</a></p><p>لو مش إنت، تجاهل الرسالة دي، والباسورد مش هيتغيّر.</p></div>`,
    });
  } catch (err) {
    console.error(`[admin] pid ${process.pid}: reset email failed:`, err);
    return { error: "حصلت مشكلة في إرسال الإيميل. جرّب تاني بعد 5 دقايق.", done: false };
  }
  return { error: "", done: true };
}

/** The page the emailed link opens: sets the new password and logs in. */
export async function resetPasswordAction(_prev: PasswordFormState, formData: FormData): Promise<PasswordFormState> {
  const token = String(formData.get("token") ?? "");
  const password = String(formData.get("password") ?? "");
  const problem = passwordProblem(password, String(formData.get("confirm") ?? ""));
  if (problem) return { error: problem, done: false };
  if (!(await resetPassword(token, password))) {
    return { error: "اللينك ده انتهى أو اتستخدم قبل كده. اطلب لينك جديد.", done: false };
  }
  await startSession();
  redirect("/admin?password=changed");
}

export type TripFormState = {
  error: string;
  values: Record<string, string>;
  days: { title: string; items: string }[];
  attempt: number;
};

export async function saveTripAction(prev: TripFormState, formData: FormData): Promise<TripFormState> {
  await requireAdmin();
  const values = Object.fromEntries(
    [...formData.entries()].filter(([k]) => k !== "dayTitle" && k !== "dayItems").map(([k, v]) => [k, String(v)]),
  );
  values.visible = formData.get("visible") === "on" ? "on" : "off";
  const titles = formData.getAll("dayTitle").map((t) => String(t).trim().slice(0, 120));
  const items = formData.getAll("dayItems").map((t) => String(t).slice(0, 1500));
  const days = titles.map((title, i) => ({ title, items: items[i] ?? "" }));
  const fail = (error: string) => ({ error, values, days, attempt: prev.attempt + 1 });

  const title = text(formData, "title", 120);
  const duration = text(formData, "duration", 60);
  const summary = text(formData, "summary", 400);
  const price = Number(text(formData, "price", 9).replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d))));
  const itinerary = days
    .map((d) => ({
      title: d.title,
      items: d.items
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
    }))
    .filter((d) => d.title || d.items.length);

  if (!title || !duration || !summary) return fail("اكتب اسم الرحلة والمدة والملخص.");
  if (!Number.isInteger(price) || price < 0) return fail("اكتب السعر بالجنيه، رقم صحيح، أو سيبه فاضي.");
  if (itinerary.length === 0 || itinerary.some((d) => !d.title || d.items.length === 0)) {
    return fail("كل يوم في البرنامج محتاج عنوان وحاجة واحدة على الأقل.");
  }

  const photo = text(formData, "photo", 40);
  const slug = await saveTrip(text(formData, "slug", 40) || null, {
    title,
    duration,
    days: itinerary.length,
    price,
    summary,
    dates: text(formData, "dates", 150) || undefined,
    seoTitle: text(formData, "seoTitle", 70) || undefined,
    seoDescription: text(formData, "seoDescription", 200) || undefined,
    itinerary,
    hidden: values.visible !== "on",
    photo: isImageName(photo) ? photo : "",
  });
  revalidatePath("/", "layout");
  redirect(`/admin/trips?saved=${slug}`);
}

export async function toggleTripAction(formData: FormData) {
  await requireAdmin();
  await setTripHidden(String(formData.get("slug") ?? ""), formData.get("hide") === "1");
  revalidatePath("/", "layout");
  redirect("/admin/trips");
}

export async function saveQuestionAction(formData: FormData) {
  await requireAdmin();
  const id = text(formData, "id", 20) || null;
  const group = text(formData, "group", 20);
  const q = text(formData, "q", 300);
  const a = text(formData, "a", 3000);
  if (!isGroupKey(group) || !q || !a) redirect("/admin/faq?error=1");
  await saveQuestion(id, { group, q, a, hidden: formData.get("visible") !== "on" });
  revalidatePath("/", "layout");
  redirect(`/admin/faq?saved=1#${group}`);
}

export async function moveQuestionAction(formData: FormData) {
  await requireAdmin();
  await moveQuestion(text(formData, "id", 20), formData.get("dir") === "up" ? -1 : 1);
  revalidatePath("/", "layout");
  redirect(`/admin/faq#${text(formData, "group", 20)}`);
}

export type ArticleFormState = { error: string; values: Record<string, string>; attempt: number };

export async function saveArticleAction(prev: ArticleFormState, formData: FormData): Promise<ArticleFormState> {
  await requireAdmin();
  const values = Object.fromEntries([...formData.entries()].map(([k, v]) => [k, String(v)]));
  values.visible = formData.get("visible") === "on" ? "on" : "off";
  const fail = (error: string) => ({ error, values, attempt: prev.attempt + 1 });

  const title = text(formData, "title", 150);
  const description = text(formData, "description", 200);
  const summary = text(formData, "summary", 500);
  const body = String(formData.get("body") ?? "").trim().slice(0, 60_000);
  const topic = text(formData, "topic", 10) === "aswan" ? "aswan" : "flights";
  if (!title || !description || !summary) return fail("اكتب العنوان والوصف والإجابة باختصار.");
  if (body.length < 20) return fail("المقال فاضي. اكتب الكلام في المكان المخصص للمقال.");

  let slug: string;
  try {
    slug = await saveArticle(
      text(formData, "slug", 80) || null,
      {
        title,
        description,
        summary,
        topic,
        body,
        hidden: values.visible !== "on",
        seoTitle: text(formData, "seoTitle", 70) || undefined,
        seoDescription: text(formData, "seoDescription", 200) || undefined,
      },
      text(formData, "wantedSlug", 80),
    );
  } catch (err) {
    if (err instanceof ArticleError) return fail(err.message);
    throw err;
  }
  revalidatePath("/", "layout");
  redirect(`/admin/articles?saved=${slug}`);
}

export async function toggleArticleAction(formData: FormData) {
  await requireAdmin();
  await setArticleHidden(String(formData.get("slug") ?? ""), formData.get("hide") === "1");
  revalidatePath("/", "layout");
  redirect("/admin/articles");
}

// ---------- Trash ----------

const BACK_TO: Record<TrashKind, string> = {
  offer: "/admin/offers",
  trip: "/admin/trips",
  question: "/admin/faq",
  article: "/admin/articles",
  image: "/admin/images",
};

/** Moves an item to the trash. The form sends its kind and key (id, slug or file name). */
export async function deleteItemAction(formData: FormData) {
  await requireAdmin();
  const kind = text(formData, "kind", 20) as TrashKind;
  const key = text(formData, "key", 120);
  if (kind === "offer") await deleteOffer(Number(key));
  else if (kind === "trip") await deleteTrip(key);
  else if (kind === "question") await deleteQuestion(key);
  else if (kind === "article") await deleteArticle(key);
  else if (kind === "image" && isImageName(key)) await deleteImage(key);
  revalidatePath("/", "layout");
  redirect(`${BACK_TO[kind] ?? "/admin"}?deleted=1`);
}

export async function restoreItemAction(formData: FormData) {
  await requireAdmin();
  const entry = await takeFromTrash(text(formData, "id", 20));
  if (entry) {
    const data = entry.data as never;
    if (entry.kind === "offer") await restoreOffer(data);
    else if (entry.kind === "trip") await restoreTrip(data);
    else if (entry.kind === "question") await restoreQuestion(data);
    else if (entry.kind === "article") await restoreArticle(data);
    else if (entry.kind === "image") await restoreImage(data);
  }
  revalidatePath("/", "layout");
  redirect("/admin/trash?restored=1");
}

export async function purgeItemAction(formData: FormData) {
  await requireAdmin();
  await purgeFromTrash(text(formData, "id", 20));
  redirect("/admin/trash");
}

export async function backupNowAction(formData: FormData) {
  await requireAdmin();
  const result = await runBackup({ forceEmail: formData.get("email") === "1" });
  const note = result.emailed ? "emailed" : result.emailError ? `email-error:${result.emailError}` : "done";
  redirect(`/admin/backups?result=${encodeURIComponent(note)}`);
}
