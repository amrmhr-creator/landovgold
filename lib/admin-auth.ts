import "server-only";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

// Admin panel login. The password is ADMIN_PASSWORD in hPanel (never in git); without it
// the panel stays locked. The session is a signed cookie; changing the password logs everyone out.

const COOKIE = "admin_session";
const SESSION_DAYS = 7;

export function adminEnabled() {
  return (process.env.ADMIN_PASSWORD ?? "").length >= 8;
}

function signingKey() {
  return createHash("sha256").update(`admin-session:${process.env.ADMIN_PASSWORD}`).digest();
}

function sign(expires: number) {
  return createHmac("sha256", signingKey()).update(String(expires)).digest("base64url");
}

function safeEqual(a: string, b: string) {
  // Hash both sides so the comparison takes the same time whatever the lengths.
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

export async function isAdmin() {
  if (!adminEnabled()) return false;
  const value = (await cookies()).get(COOKIE)?.value;
  if (!value) return false;
  const [exp, sig] = value.split(".");
  const expires = Number(exp);
  if (!Number.isFinite(expires) || expires < Date.now() || !sig) return false;
  return safeEqual(sig, sign(expires));
}

/** For admin pages and actions: sends anyone not logged in to the login page. */
export async function requireAdmin() {
  if (!(await isAdmin())) redirect("/admin/login");
}

// Brake on password guessing: 5 wrong tries per IP per 15 minutes (per app process).
const FAIL_LIMIT = 5;
const FAIL_WINDOW_MS = 15 * 60_000;
const failures = new Map<string, number[]>();

async function clientIp() {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0].trim() || h.get("x-real-ip")?.trim() || "unknown";
}

/** Checks the password and starts a session. Returns an error message, or null on success. */
export async function logIn(password: string): Promise<string | null> {
  if (!adminEnabled()) return "لوحة التحكم مقفولة: لازم ADMIN_PASSWORD يتحط في hPanel الأول.";
  const ip = await clientIp();
  const now = Date.now();
  const recent = (failures.get(ip) ?? []).filter((t) => now - t < FAIL_WINDOW_MS);
  if (recent.length >= FAIL_LIMIT) return "محاولات كتير غلط. استنى ربع ساعة وجرّب تاني.";

  if (!safeEqual(password, process.env.ADMIN_PASSWORD!)) {
    failures.set(ip, [...recent, now]);
    console.warn(`[admin] pid ${process.pid}: wrong password from ${ip}`);
    return "الباسورد غلط.";
  }
  failures.delete(ip);

  const expires = now + SESSION_DAYS * 86_400_000;
  (await cookies()).set(COOKIE, `${expires}.${sign(expires)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/admin",
    expires: new Date(expires),
  });
  return null;
}

export async function logOut() {
  (await cookies()).delete({ name: COOKIE, path: "/admin" });
}
