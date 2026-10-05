import "server-only";
import { createCipheriv, pbkdf2Sync, randomBytes } from "node:crypto";
import { copyFile, mkdir, open, readdir, readFile, rm, stat } from "node:fs/promises";
import path from "node:path";
import { uploadDir } from "./data-dir";
import { dbConfigured, describeError, query } from "./db";
import { writeJsonFile } from "./json-file";
import { mailConfigured, sendMail } from "./mail";
import { cairoToday } from "./offers";
import { SITE } from "./site";

// Backups, made on their own: the first visit of each day starts one (no cron job to set up).
// - Daily, on the server, in BACKUP_DIR (or "landovgold-backups" next to the data folder):
//   a folder per day with the admin panel's data files and the database tables (offers, leads),
//   and every photo once in a shared "images" folder. The last 14 days are kept.
// - Weekly, the same data (no photos) is emailed to ADMIN_EMAIL as one file locked with
//   BACKUP_PASSWORD. It uses the OpenSSL format, so it opens with the "فتح نسخة" page in the
//   panel, or anywhere with: openssl enc -d -aes-256-cbc -pbkdf2 -iter 100000 -md sha256 -in file.enc -out data.json

const KEEP_DAYS = 14;
const EMAIL_EVERY_DAYS = 7;
const DB_TABLES = ["offers", "leads"];

export function backupDir() {
  return process.env.BACKUP_DIR || path.resolve(uploadDir(), "..", "landovgold-backups");
}

const stateFile = () => path.join(backupDir(), "state.json");
type BackupState = { lastDay?: string; lastEmailDay?: string; lastEmailError?: string; lastError?: string };

async function readState(): Promise<BackupState> {
  try {
    return JSON.parse(await readFile(stateFile(), "utf8"));
  } catch {
    return {};
  }
}

/** Everything the panel saves, plus the database tables, as one object. */
async function collectData(options: { forEmail?: boolean } = {}) {
  const files: Record<string, unknown> = {};
  for (const name of await readdir(uploadDir()).catch(() => [] as string[])) {
    if (!name.endsWith(".json")) continue;
    // The admin password hash stays on the server, even locked inside the emailed file.
    if (options.forEmail && name === "admins.json") continue;
    try {
      files[name] = JSON.parse(await readFile(path.join(uploadDir(), name), "utf8"));
    } catch {}
  }
  const tables: Record<string, unknown[]> = {};
  if (dbConfigured()) {
    for (const table of DB_TABLES) {
      try {
        tables[table] = await query<unknown[]>(`SELECT * FROM ${table}`);
      } catch (err) {
        tables[table] = [];
        console.error(`[backup] pid ${process.pid}: reading ${table} failed: ${describeError(err)}`);
      }
    }
  }
  return { site: SITE.url, madeAt: new Date().toISOString(), files, tables };
}

/** OpenSSL-compatible AES-256-CBC with PBKDF2 (SHA-256, 100,000 rounds). */
export function encryptForEmail(data: Buffer, password: string) {
  const salt = randomBytes(8);
  const key = pbkdf2Sync(password, salt, 100_000, 48, "sha256");
  const cipher = createCipheriv("aes-256-cbc", key.subarray(0, 32), key.subarray(32, 48));
  return Buffer.concat([Buffer.from("Salted__"), salt, cipher.update(data), cipher.final()]);
}

/** Copies photos the shared images folder doesn't have yet (names never change). */
async function copyNewImages() {
  const target = path.join(backupDir(), "images");
  await mkdir(target, { recursive: true });
  const have = new Set(await readdir(target));
  let copied = 0;
  for (const name of await readdir(uploadDir()).catch(() => [] as string[])) {
    if (!name.endsWith(".webp") || have.has(name)) continue;
    await copyFile(path.join(uploadDir(), name), path.join(target, name));
    copied++;
  }
  return copied;
}

async function removeOldDays() {
  const names = await readdir(backupDir());
  const days = names.filter((n) => /^\d{4}-\d{2}-\d{2}$/.test(n)).sort();
  for (const day of days.slice(0, Math.max(0, days.length - KEEP_DAYS))) {
    await rm(path.join(backupDir(), day), { recursive: true, force: true });
  }
  // Day locks are only needed on their own day.
  const today = cairoToday();
  for (const lock of names.filter((n) => n.endsWith(".lock") && n !== `${today}.lock`)) {
    await rm(path.join(backupDir(), lock), { force: true });
  }
}

/** Makes today's backup (and the weekly email when it's due). Returns a short report. */
export async function runBackup(options: { forceEmail?: boolean } = {}) {
  const today = cairoToday();
  const state = await readState();
  const data = await collectData();
  const dayDir = path.join(backupDir(), today);
  await mkdir(dayDir, { recursive: true });
  await writeJsonFile(path.join(dayDir, "data.json"), data, { private: true });
  const images = await copyNewImages();
  await removeOldDays();

  const daysSinceEmail = state.lastEmailDay ? (Date.parse(today) - Date.parse(state.lastEmailDay)) / 86_400_000 : Infinity;
  let emailed = false;
  let emailError = "";
  if (options.forceEmail || daysSinceEmail >= EMAIL_EVERY_DAYS) {
    const to = process.env.ADMIN_EMAIL?.trim();
    const password = process.env.BACKUP_PASSWORD ?? "";
    if (!to || password.length < 8) emailError = "ADMIN_EMAIL أو BACKUP_PASSWORD مش متحطين في hPanel.";
    else if (!mailConfigured()) emailError = "الإيميل مش متظبط على السيرفر.";
    else {
      try {
        const file = encryptForEmail(Buffer.from(JSON.stringify(await collectData({ forEmail: true }))), password);
        await sendMail({
          to,
          subject: `${SITE.name}: النسخة الاحتياطية الأسبوعية (${today})`,
          text: `مرفق نسخة من بيانات الموقع (الطلبات والعروض والرحلات والمقالات والإعدادات). الملف مقفول بباسورد النسخ الاحتياطية. احتفظ بالإيميل ده.`,
          html: `<div dir="rtl" style="font-family:sans-serif"><p>مرفق نسخة من بيانات الموقع (الطلبات والعروض والرحلات والمقالات والإعدادات).</p><p>الملف مقفول بباسورد النسخ الاحتياطية. احتفظ بالإيميل ده.</p></div>`,
          attachments: [{ filename: `landovgold-backup-${today}.enc`, content: file }],
        });
        emailed = true;
      } catch (err) {
        emailError = "الإيميل ما اتبعتش.";
        console.error(`[backup] pid ${process.pid}: email failed:`, err);
      }
    }
  }

  await writeJsonFile(stateFile(), {
    ...state,
    lastDay: today,
    ...(emailed && { lastEmailDay: today }),
    lastEmailError: emailed ? "" : emailError || state.lastEmailError || "",
    lastError: "",
  });
  return { day: today, images, emailed, emailError };
}

/**
 * Starts today's backup if nobody has yet. Cheap to call on every visit: it returns at once,
 * and a lock file per day keeps Hostinger's several app processes from all doing it.
 */
export function backupIfDue() {
  const today = cairoToday();
  void (async () => {
    try {
      if ((await readState()).lastDay === today) return;
      await mkdir(backupDir(), { recursive: true });
      const lock = await open(path.join(backupDir(), `${today}.lock`), "wx").catch(() => null);
      if (!lock) return; // another process has it
      await lock.close();
      await runBackup();
    } catch (err) {
      console.error(`[backup] pid ${process.pid}: daily backup failed:`, err);
      await writeJsonFile(stateFile(), { ...(await readState()), lastError: String(err).slice(0, 300) }).catch(() => {});
    }
  })();
}

/** For the admin page: what's there and how it went. */
export async function backupStatus() {
  const state = await readState();
  const days = (await readdir(backupDir()).catch(() => [] as string[])).filter((n) => /^\d{4}-\d{2}-\d{2}$/.test(n)).sort().reverse();
  const sizes = await Promise.all(
    days.map(async (d) => (await stat(path.join(backupDir(), d, "data.json")).catch(() => null))?.size ?? 0),
  );
  const images = (await readdir(path.join(backupDir(), "images")).catch(() => [] as string[])).length;
  return {
    ...state,
    days: days.map((d, i) => ({ day: d, size: sizes[i] })),
    images,
    emailReady: !!process.env.ADMIN_EMAIL?.trim() && (process.env.BACKUP_PASSWORD ?? "").length >= 8,
  };
}
