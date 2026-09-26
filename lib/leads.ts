import "server-only";
import mysql from "mysql2/promise";
import nodemailer from "nodemailer";
import { SITE } from "./site";

export type Lead = {
  name: string;
  phone: string;
  destination: string;
  offerSlug: string | null;
  page: string | null;
};

// ---------- MySQL ----------
// Configure with DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME (set in hPanel, never in git).

let pool: mysql.Pool | null = null;
let tableReady = false;

function getPool() {
  if (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_NAME) return null;
  pool ??= mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    connectionLimit: 3,
    charset: "utf8mb4",
  });
  return pool;
}

async function saveLead(lead: Lead) {
  const db = getPool();
  if (!db) return false;
  if (!tableReady) {
    await db.query(`
      CREATE TABLE IF NOT EXISTS leads (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(120) NOT NULL,
        phone VARCHAR(40) NOT NULL,
        destination VARCHAR(200) NOT NULL,
        offer_slug VARCHAR(120) NULL,
        page VARCHAR(200) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
    `);
    tableReady = true;
  }
  await db.execute(
    "INSERT INTO leads (name, phone, destination, offer_slug, page) VALUES (?, ?, ?, ?, ?)",
    [lead.name, lead.phone, lead.destination, lead.offerSlug, lead.page],
  );
  return true;
}

// ---------- Email ----------
// Configure with SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD. Sent to LEADS_EMAIL (default book@landovgold.com).

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

async function emailLead(lead: Lead) {
  const { SMTP_HOST, SMTP_USER, SMTP_PASSWORD } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASSWORD) return false;
  const port = Number(process.env.SMTP_PORT || 465);
  const transport = nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    secure: port === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASSWORD },
  });
  const rows = [
    ["الاسم", lead.name],
    ["الرقم", lead.phone],
    ["الوجهة / العرض", lead.destination],
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
  for (const r of [saved, emailed]) if (r.status === "rejected") console.error("[leads]", r.reason);
  const ok = [saved, emailed].some((r) => r.status === "fulfilled" && r.value);
  if (!ok) console.error("[leads] not stored anywhere (DB/SMTP not configured or failing):", lead);
  return ok;
}
