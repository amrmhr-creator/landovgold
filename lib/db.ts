import "server-only";
import mysql from "mysql2/promise";

// MySQL on the Hostinger server. Configure with DB_HOST (127.0.0.1), DB_PORT, DB_USER, DB_PASSWORD,
// DB_NAME in hPanel, never in git. Without them the site falls back to what's in the code.

let pool: mysql.Pool | null = null;

export function dbConfigured() {
  return !!(process.env.DB_HOST && process.env.DB_USER && process.env.DB_NAME);
}

export function getPool() {
  if (!dbConfigured()) return null;
  pool ??= mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    charset: "utf8mb4",
    // DATE columns come back as "YYYY-MM-DD" strings, never shifted by time zones.
    dateStrings: true,
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

export async function withRetry<T>(run: () => Promise<T>): Promise<T> {
  try {
    return await run();
  } catch (err) {
    const code = (err as { code?: string }).code;
    if (!code || !STALE_CONNECTION.has(code)) throw err;
    console.warn(`[db] pid ${process.pid}: connection dropped (${code}), retrying once`);
    return run();
  }
}

/** Runs a query with one retry on a dropped connection. Throws if the database isn't configured. */
export async function query<T = unknown>(sql: string, params: unknown[] = []): Promise<T> {
  const db = getPool();
  if (!db) throw new Error("database not configured");
  const [rows] = await withRetry(() => db.query(sql, params));
  return rows as T;
}

/** Error code, server reply and message for the logs: never the config or credentials. */
export function describeError(err: unknown) {
  if (!(err instanceof Error)) return String(err);
  const e = err as Error & Record<string, unknown>;
  const fields = ["code", "errno", "sqlState", "responseCode", "command", "response"]
    .filter((k) => e[k] !== undefined && e[k] !== "")
    .map((k) => `${k}=${JSON.stringify(e[k])}`);
  return [...fields, `message=${JSON.stringify(e.message)}`].join(" ");
}
