import "server-only";
import mysql from "mysql2/promise";
import nodemailer from "nodemailer";
import { formatDate } from "./offers";
import { SITE } from "./site";

export type Lead = {
  kind: "offer" | "flight" | "trip" | "contact";
  name: string;
  phone: string;
  destination: string; // route, program or service, in words
  travelDate: string | null; // YYYY-MM-DD
  travelers: number | null;
  details: string | null; // free text from the contact form
  offerSlug: string | null; // offer or Aswan program slug
  marketingOk: boolean; // agreed to receive offers on WhatsApp
  page: string | null;
};

// ---------- Logging ----------
// Hostinger runs several app processes at once, so every line carries the pid.
// Only error codes, server replies and messages are logged: never the config or credentials.

function describeError(err: unknown) {
  if (!(err instanceof Error)) return String(err);
  const e = err as Error & Record<string, unknown>;
  const fields = ["code", "errno", "sqlState", "responseCode", "command", "response"]
    .filter((k) => e[k] !== undefined && e[k] !== "")
    .map((k) => `${k}=${JSON.stringify(e[k])}`);
  return [...fields, `message=${JSON.stringify(e.message)}`].join(" ");
}

function logFailure(channel: "db" | "email", err: unknown) {
  console.error(`[leads] pid ${process.pid}: ${channel} failed: ${describeError(err)}`);
}

// ---------- MySQL ----------
// Configure with DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME (set in hPanel, never in git).

let pool: mysql.Pool | null = null;
let tableReady = false;

// Columns added after the first launch; older tables get them on first use.
const LATER_COLUMNS: [string, string][] = [
  ["travel_date", "DATE NULL AFTER destination"],
  ["kind", "VARCHAR(20) NULL AFTER id"],
  ["travelers", "SMALLINT NULL AFTER travel_date"],
  ["details", "TEXT NULL AFTER travelers"],
  ["marketing_ok", "TINYINT(1) NOT NULL DEFAULT 0 AFTER offer_slug"],
];

function getPool() {
  if (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_NAME) return null;
  pool ??= mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    charset: "utf8mb4",
    // Several app processes each hold their own pool; keep each one small, and drop idle
    // connections before shared-hosting MySQL times them out on its side.
    connectionLimit: 2,
    maxIdle: 1,
    idleTimeout: 20_000,
    enableKeepAlive: true,
    connectTimeout: 10_000,
  });
  return pool;
}

// A pooled connection the server already closed fails once; a fresh one then works.
const STALE_CONNECTION = new Set(["PROTOCOL_CONNECTION_LOST", "ECONNRESET", "EPIPE", "ETIMEDOUT"]);

async function withRetry<T>(run: () => Promise<T>): Promise<T> {
  try {
    return await run();
  } catch (err) {
    const code = (err as { code?: string }).code;
    if (!code || !STALE_CONNECTION.has(code)) throw err;
    console.warn(`[leads] pid ${process.pid}: db connection dropped (${code}), retrying once`);
    return run();
  }
}

async function saveLead(lead: Lead) {
  const db = getPool();
  if (!db) {
    console.error(`[leads] pid ${process.pid}: db skipped: DB_HOST, DB_USER or DB_NAME is not set`);
    return false;
  }
  if (!tableReady) {
    await withRetry(() =>
      db.query(`
        CREATE TABLE IF NOT EXISTS leads (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(120) NOT NULL,
          phone VARCHAR(40) NOT NULL,
          kind VARCHAR(20) NULL,
          destination VARCHAR(200) NOT NULL,
          travel_date DATE NULL,
          travelers SMALLINT NULL,
          details TEXT NULL,
          offer_slug VARCHAR(120) NULL,
          marketing_ok TINYINT(1) NOT NULL DEFAULT 0,
          page VARCHAR(200) NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
      `),
    );
    // Tables created before these columns existed.
    const [rows] = await withRetry(() => db.query("SHOW COLUMNS FROM leads"));
    const existing = new Set((rows as { Field: string }[]).map((r) => r.Field));
    for (const [column, definition] of LATER_COLUMNS) {
      if (!existing.has(column)) {
        await withRetry(() => db.query(`ALTER TABLE leads ADD COLUMN ${column} ${definition}`));
      }
    }
    tableReady = true;
  }
  await withRetry(() =>
    db.execute(
      `INSERT INTO leads (kind, name, phone, destination, travel_date, travelers, details, offer_slug, marketing_ok, page)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        lead.kind,
        lead.name,
        lead.phone,
        lead.destination,
        lead.travelDate,
        lead.travelers,
        lead.details,
        lead.offerSlug,
        lead.marketingOk ? 1 : 0,
        lead.page,
      ],
    ),
  );
  return true;
}

// ---------- Email ----------
// Configure with SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD. Sent to LEADS_EMAIL (default book@landovgold.com).

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

const KIND_LABEL: Record<Lead["kind"], string> = {
  offer: "العرض",
  flight: "الوجهة",
  trip: "البرنامج",
  contact: "الخدمة",
};

async function emailLead(lead: Lead) {
  const { SMTP_HOST, SMTP_USER, SMTP_PASSWORD } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASSWORD) {
    console.error(`[leads] pid ${process.pid}: email skipped: SMTP_HOST, SMTP_USER or SMTP_PASSWORD is not set`);
    return false;
  }
  const port = Number(process.env.SMTP_PORT || 465);
  const transport = nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    secure: port === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASSWORD },
    // Fail within seconds (and get it logged) instead of hanging the request for minutes.
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 20_000,
  });
  const rows = [
    ["الاسم", lead.name],
    ["الرقم", lead.phone],
    [KIND_LABEL[lead.kind], lead.destination],
    ["تاريخ السفر", lead.travelDate ? formatDate(lead.travelDate) : "-"],
    ["عدد المسافرين", lead.travelers ? String(lead.travelers) : "-"],
    ["التفاصيل", lead.details ?? "-"],
    ["موافق على العروض", lead.marketingOk ? "أيوه" : "لأ"],
    ["الصفحة", lead.page ?? "-"],
  ];
  await transport.sendMail({
    from: `"${SITE.name} - الموقع" <${SMTP_USER}>`,
    to: process.env.LEADS_EMAIL || SITE.email,
    subject: `طلب جديد: ${lead.destination} - ${lead.name}`,
    text: rows.map(([k, v]) => `${k}: ${v}`).join("\n"),
    html: `<div dir="rtl" style="font-family:sans-serif">${rows
      .map(([k, v]) => `<p><b>${k}:</b> ${escapeHtml(v)}</p>`)
      .join("")}</div>`,
  });
  return true;
}

/** Saves and emails the lead. Succeeds if at least one channel stored it. */
export async function submitLead(lead: Lead) {
  const [saved, emailed] = await Promise.allSettled([saveLead(lead), emailLead(lead)]);
  if (saved.status === "rejected") logFailure("db", saved.reason);
  if (emailed.status === "rejected") logFailure("email", emailed.reason);
  const ok = [saved, emailed].some((r) => r.status === "fulfilled" && r.value);
  // Last resort so the customer can still be called back: the lead goes to the server log.
  if (!ok) console.error(`[leads] pid ${process.pid}: lead not stored anywhere:`, JSON.stringify(lead));
  return ok;
}
