import "server-only";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { dbConfigured, describeError, query } from "./db";

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

// Brake on password guessing: 5 wrong tries per IP per 15 minutes, and 30 in total from
// everyone (so faked or missing IPs can't get around it). Wrong tries are kept in MySQL so
// all of Hostinger's app processes share one count; without a database (or if it fails)
// each process falls back to counting in its own memory.
const FAIL_LIMIT = 5;
const FAIL_LIMIT_ALL = 30;
const FAIL_WINDOW_MS = 15 * 60_000;
const memFailures: { ip: string; at: number }[] = [];
let failTableReady = false;

async function failTable() {
  if (failTableReady) return;
  await query(`
    CREATE TABLE IF NOT EXISTS admin_login_failures (
      id INT AUTO_INCREMENT PRIMARY KEY,
      ip VARCHAR(64) NOT NULL,
      at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      INDEX (at)
    )
  `);
  failTableReady = true;
}

/** Wrong tries in the window: from this IP, and from everyone. */
async function recentFailures(ip: string) {
  const since = Date.now() - FAIL_WINDOW_MS;
  if (dbConfigured()) {
    try {
      await failTable();
      const rows = await query<{ mine: number; total: number }[]>(
        "SELECT COALESCE(SUM(ip = ?), 0) AS mine, COUNT(*) AS total FROM admin_login_failures WHERE at > ?",
        [ip, new Date(since)],
      );
      return { mine: Number(rows[0].mine), total: Number(rows[0].total) };
    } catch (err) {
      console.error(`[admin] pid ${process.pid}: failure count from db failed: ${describeError(err)}`);
    }
  }
  const recent = memFailures.filter((f) => f.at > since);
  memFailures.splice(0, memFailures.length, ...recent);
  return { mine: recent.filter((f) => f.ip === ip).length, total: recent.length };
}

async function recordFailure(ip: string) {
  memFailures.push({ ip, at: Date.now() });
  if (!dbConfigured()) return;
  try {
    await failTable();
    await query("INSERT INTO admin_login_failures (ip) VALUES (?)", [ip.slice(0, 64)]);
    // Old rows aren't needed once they're out of the window.
    await query("DELETE FROM admin_login_failures WHERE at < ?", [new Date(Date.now() - 86_400_000)]);
  } catch (err) {
    console.error(`[admin] pid ${process.pid}: recording a failure failed: ${describeError(err)}`);
  }
}

async function clearFailures(ip: string) {
  memFailures.splice(0, memFailures.length, ...memFailures.filter((f) => f.ip !== ip));
  if (!dbConfigured()) return;
  try {
    await failTable();
    await query("DELETE FROM admin_login_failures WHERE ip = ?", [ip.slice(0, 64)]);
  } catch (err) {
    console.error(`[admin] pid ${process.pid}: clearing failures failed: ${describeError(err)}`);
  }
}

async function clientIp() {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0].trim() || h.get("x-real-ip")?.trim() || "unknown";
}

/** Checks the password and starts a session. Returns an error message, or null on success. */
export async function logIn(password: string): Promise<string | null> {
  if (!adminEnabled()) return "لوحة التحكم مقفولة: لازم ADMIN_PASSWORD يتحط في hPanel الأول.";
  const ip = await clientIp();
  const { mine, total } = await recentFailures(ip);
  if (mine >= FAIL_LIMIT || total >= FAIL_LIMIT_ALL) return "محاولات كتير غلط. استنى ربع ساعة وجرّب تاني.";

  if (!safeEqual(password, process.env.ADMIN_PASSWORD!)) {
    await recordFailure(ip);
    console.warn(`[admin] pid ${process.pid}: wrong password from ${ip}`);
    return "الباسورد غلط.";
  }
  await clearFailures(ip);

  const now = Date.now();

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
