import "server-only";
import { dbConfigured, describeError, query } from "./db";
import { SAMPLE_OFFERS, isBookable, type Offer } from "./offers";

// Offers in MySQL, managed from /admin/offers. Without a database (local development)
// the site shows SAMPLE_OFFERS instead. An empty table gets SAMPLE_OFFERS once, so the
// owner starts with offers he can edit or hide (there's no delete, so they never come back).

let tableReady = false;

async function ensureOffersTable() {
  if (tableReady) return;
  await query(`
    CREATE TABLE IF NOT EXISTS offers (
      id INT AUTO_INCREMENT PRIMARY KEY,
      slug VARCHAR(100) NOT NULL UNIQUE,
      from_city VARCHAR(100) NOT NULL,
      to_city VARCHAR(100) NOT NULL,
      price INT NOT NULL,
      trip_type VARCHAR(20) NOT NULL,
      travel_date DATE NOT NULL,
      airline VARCHAR(100) NOT NULL,
      transit VARCHAR(100) NOT NULL,
      baggage VARCHAR(100) NOT NULL,
      extras TEXT NULL,
      available TINYINT(1) NOT NULL DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
  `);
  const [{ n }] = await query<{ n: number }[]>("SELECT COUNT(*) AS n FROM offers");
  if (Number(n) === 0) {
    // INSERT IGNORE: several app processes may get here at once; the unique slug keeps one copy.
    for (const o of SAMPLE_OFFERS) {
      await query(
        `INSERT IGNORE INTO offers (slug, from_city, to_city, price, trip_type, travel_date, airline, transit, baggage, extras, available)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [o.slug, ...columns(o)],
      );
    }
  }
  tableReady = true;
}

function toOffer(r: Record<string, unknown>): Offer {
  const extras = String(r.extras ?? "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
  return {
    id: Number(r.id),
    slug: String(r.slug),
    from: String(r.from_city),
    to: String(r.to_city),
    price: Number(r.price),
    tripType: r.trip_type === "ذهاب فقط" ? "ذهاب فقط" : "ذهاب وعودة",
    date: String(r.travel_date),
    airline: String(r.airline),
    transit: String(r.transit),
    baggage: String(r.baggage),
    extras: extras.length ? extras : undefined,
    available: Number(r.available) === 1,
  };
}

/** Every offer, soonest travel date first (admin panel, sitemap). */
export async function allOffers(): Promise<Offer[]> {
  if (!dbConfigured()) return SAMPLE_OFFERS;
  await ensureOffersTable();
  const rows = await query<Record<string, unknown>[]>("SELECT * FROM offers ORDER BY travel_date, id");
  return rows.map(toOffer);
}

/**
 * Offers listed on the site: not hidden, travel date not passed.
 * A database hiccup shows "no offers right now" instead of breaking the page.
 */
export async function bookableOffers() {
  try {
    return (await allOffers()).filter(isBookable);
  } catch (err) {
    console.error(`[offers] pid ${process.pid}: listing failed: ${describeError(err)}`);
    return [];
  }
}

export async function getOffer(slug: string) {
  if (!dbConfigured()) return SAMPLE_OFFERS.find((o) => o.slug === slug);
  await ensureOffersTable();
  const rows = await query<Record<string, unknown>[]>("SELECT * FROM offers WHERE slug = ?", [slug]);
  return rows[0] ? toOffer(rows[0]) : undefined;
}

export async function getOfferById(id: number) {
  await ensureOffersTable();
  const rows = await query<Record<string, unknown>[]>("SELECT * FROM offers WHERE id = ?", [id]);
  return rows[0] ? toOffer(rows[0]) : undefined;
}

export type OfferInput = Omit<Offer, "id" | "slug">;

function columns(o: OfferInput) {
  return [o.from, o.to, o.price, o.tripType, o.date, o.airline, o.transit, o.baggage, (o.extras ?? []).join("\n"), o.available ? 1 : 0];
}

/** Adds an offer under `slug`, or `slug-2`, `slug-3`… if that's taken. Returns the slug used. */
export async function createOffer(o: OfferInput, slug: string) {
  await ensureOffersTable();
  for (let n = 1; n < 50; n++) {
    const candidate = n === 1 ? slug : `${slug}-${n}`;
    try {
      await query(
        `INSERT INTO offers (slug, from_city, to_city, price, trip_type, travel_date, airline, transit, baggage, extras, available)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [candidate, ...columns(o)],
      );
      return candidate;
    } catch (err) {
      if ((err as { code?: string }).code !== "ER_DUP_ENTRY") throw err;
    }
  }
  throw new Error("no free slug");
}

/** Updates an offer. Its slug never changes, so links already posted keep working. */
export async function updateOffer(id: number, o: OfferInput) {
  await ensureOffersTable();
  await query(
    `UPDATE offers SET from_city = ?, to_city = ?, price = ?, trip_type = ?, travel_date = ?, airline = ?,
       transit = ?, baggage = ?, extras = ?, available = ? WHERE id = ?`,
    [...columns(o), id],
  );
}

export async function setOfferAvailable(id: number, available: boolean) {
  await ensureOffersTable();
  await query("UPDATE offers SET available = ? WHERE id = ?", [available ? 1 : 0, id]);
}
