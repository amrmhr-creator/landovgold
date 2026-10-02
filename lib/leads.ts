import "server-only";
import nodemailer from "nodemailer";
import { dbConfigured, describeError, query } from "./db";
import { LEAD_SECTION_LABEL, type LeadSection } from "./lead-options";
import { formatDate } from "./offers";
import { SITE } from "./site";

export type Lead = {
  kind: "offer" | "flight" | "trip" | "contact";
  section: LeadSection;
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

// Hostinger runs several app processes at once, so every log line carries the pid.
function logFailure(channel: "db" | "email", err: unknown) {
  console.error(`[leads] pid ${process.pid}: ${channel} failed: ${describeError(err)}`);
}

// ---------- MySQL ----------

let tableReady = false;

// Columns added after the first launch; older tables get them on first use.
const LATER_COLUMNS: [string, string][] = [
  ["travel_date", "DATE NULL AFTER destination"],
  ["kind", "VARCHAR(20) NULL AFTER id"],
  ["travelers", "SMALLINT NULL AFTER travel_date"],
  ["details", "TEXT NULL AFTER travelers"],
  ["marketing_ok", "TINYINT(1) NOT NULL DEFAULT 0 AFTER offer_slug"],
  ["section", "VARCHAR(20) NULL AFTER kind"],
];

// Leads saved before sections existed get theirs from the form they came through.
// Leads from before form kinds existed all came from the flights pages.
const BACKFILL_SECTION = `
  UPDATE leads SET section = CASE
    WHEN kind IS NULL OR kind IN ('offer', 'flight') THEN 'flights'
    WHEN kind = 'trip' THEN 'aswan'
    WHEN destination = 'تذكرة طيران' THEN 'flights'
    WHEN destination = 'رحلة أسوان والنوبة' THEN 'aswan'
    ELSE 'general'
  END
  WHERE section IS NULL`;

/** Creates the leads table, or adds columns an older table is missing. Once per process. */
export async function ensureLeadsTable() {
  if (tableReady) return;
  await query(`
        CREATE TABLE IF NOT EXISTS leads (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(120) NOT NULL,
          phone VARCHAR(40) NOT NULL,
          kind VARCHAR(20) NULL,
          section VARCHAR(20) NULL,
          destination VARCHAR(200) NOT NULL,
          travel_date DATE NULL,
          travelers SMALLINT NULL,
          details TEXT NULL,
          offer_slug VARCHAR(120) NULL,
          marketing_ok TINYINT(1) NOT NULL DEFAULT 0,
          page VARCHAR(200) NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
      `);
  // Tables created before these columns existed.
  const rows = await query<{ Field: string }[]>("SHOW COLUMNS FROM leads");
  const existing = new Set(rows.map((r) => r.Field));
  for (const [column, definition] of LATER_COLUMNS) {
    if (!existing.has(column)) await query(`ALTER TABLE leads ADD COLUMN ${column} ${definition}`);
  }
  await query(BACKFILL_SECTION);
  tableReady = true;
}

async function saveLead(lead: Lead) {
  if (!dbConfigured()) {
    console.error(`[leads] pid ${process.pid}: db skipped: DB_HOST, DB_USER or DB_NAME is not set`);
    return false;
  }
  await ensureLeadsTable();
  await query(
    `INSERT INTO leads (kind, section, name, phone, destination, travel_date, travelers, details, offer_slug, marketing_ok, page)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      lead.kind,
      lead.section,
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
  );
  return true;
}

export type LeadRow = Omit<Lead, "kind"> & {
  id: number;
  kind: Lead["kind"] | null; // null for leads saved before kinds existed
  createdAt: number; // unix seconds
};

/** Counts for the admin home page. */
export async function leadStats() {
  await ensureLeadsTable();
  const [row] = await query<Record<string, unknown>[]>(
    `SELECT COUNT(*) AS total,
            COALESCE(SUM(created_at >= NOW() - INTERVAL 7 DAY), 0) AS week,
            COALESCE(SUM(marketing_ok = 1), 0) AS marketing
     FROM leads`,
  );
  return { total: Number(row.total), week: Number(row.week), marketing: Number(row.marketing) };
}

/** Latest leads first, for the admin panel. */
export async function listLeads(filter: { section?: LeadSection; marketingOnly?: boolean }, limit = 500) {
  await ensureLeadsTable();
  const where: string[] = [];
  const params: unknown[] = [];
  if (filter.section) {
    where.push("section = ?");
    params.push(filter.section);
  }
  if (filter.marketingOnly) where.push("marketing_ok = 1");
  const rows = await query<Record<string, unknown>[]>(
    `SELECT id, kind, section, name, phone, destination, travel_date, travelers, details, offer_slug, marketing_ok, page,
            UNIX_TIMESTAMP(created_at) AS created
     FROM leads ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
     ORDER BY id DESC LIMIT ${Number(limit)}`,
    params,
  );
  return rows.map(
    (r): LeadRow => ({
      id: Number(r.id),
      kind: (r.kind as Lead["kind"] | null) ?? null,
      section: (r.section as LeadSection | null) ?? "general",
      name: String(r.name),
      phone: String(r.phone),
      destination: String(r.destination),
      travelDate: (r.travel_date as string | null) ?? null,
      travelers: r.travelers == null ? null : Number(r.travelers),
      details: (r.details as string | null) ?? null,
      offerSlug: (r.offer_slug as string | null) ?? null,
      marketingOk: Number(r.marketing_ok) === 1,
      page: (r.page as string | null) ?? null,
      createdAt: Number(r.created),
    }),
  );
}

// ---------- Email ----------
// Configure with SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD. Sent to LEADS_EMAIL (default book@landovgold.com).

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

export const KIND_LABEL: Record<Lead["kind"], string> = {
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
    ["القسم", LEAD_SECTION_LABEL[lead.section]],
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
    // The section leads the subject, so the inbox can be sorted or filtered by it.
    subject: `[${LEAD_SECTION_LABEL[lead.section]}] طلب جديد: ${lead.destination} - ${lead.name}`,
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
