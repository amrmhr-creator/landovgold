import "server-only";
import { randomBytes } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { writeJsonFile } from "./json-file";
import { addToTrash } from "./trash";
import { TRIPS, type Trip } from "./trips";
import { getPicks, setTripPhoto, sitePhotos, uploadDir } from "./uploads";

// Trips edited from /admin/trips, saved as trips.json next to the settings (outside the app
// folder). Until the first save the site shows the programs written in lib/trips.ts. A trip's
// link (slug) never changes after it's made, so links already shared keep working.

export type StoredTrip = Trip & {
  hidden?: boolean;
  /** Free text, e.g. "كل خميس من نوفمبر لفبراير". Empty = not shown. */
  dates?: string;
};

const tripsFile = () => path.join(uploadDir(), "trips.json");

async function readTrips(): Promise<StoredTrip[]> {
  try {
    const data = JSON.parse(await readFile(tripsFile(), "utf8"));
    if (Array.isArray(data)) return data;
  } catch {}
  return structuredClone(TRIPS);
}

/** Every trip, hidden ones too (admin panel). */
export async function allTrips() {
  return readTrips();
}

/** Trips shown on the site, with the photo picked in the admin panel. */
export async function visibleTrips(): Promise<StoredTrip[]> {
  const [trips, photos] = await Promise.all([readTrips(), sitePhotos()]);
  return trips.filter((t) => !t.hidden).map((t) => ({ ...t, image: photos.trip(t.slug, t.image.alt) ?? t.image }));
}

/** A shown trip by its link, with its picked photo. */
export async function findTrip(slug: string) {
  return (await visibleTrips()).find((t) => t.slug === slug);
}

export async function tripForAdmin(slug: string) {
  return (await readTrips()).find((t) => t.slug === slug);
}

export type TripInput = Omit<StoredTrip, "slug" | "image"> & { photo: string };

/** Adds (slug null) or updates a trip. Returns its slug. */
export async function saveTrip(slug: string | null, input: TripInput) {
  const trips = await readTrips();
  const { photo, ...fields } = input;
  let trip = slug ? trips.find((t) => t.slug === slug) : undefined;
  if (slug && !trip) throw new Error("trip not found");
  if (!trip) {
    trip = {
      ...fields,
      slug: `trip-${randomBytes(3).toString("hex")}`,
      // New trips start with a built-in photo until one is picked.
      image: { src: "/images/trips/nile.webp", alt: fields.title },
    };
    trips.push(trip);
  } else {
    Object.assign(trip, fields);
  }
  await writeJsonFile(tripsFile(), trips);
  await setTripPhoto(trip.slug, photo);
  return trip.slug;
}

export async function setTripHidden(slug: string, hidden: boolean) {
  const trips = await readTrips();
  const trip = trips.find((t) => t.slug === slug);
  if (!trip) return;
  trip.hidden = hidden;
  await writeJsonFile(tripsFile(), trips);
}

/** Moves a trip to the trash (with its picked photo, so a restore brings both back). */
export async function deleteTrip(slug: string) {
  const trips = await readTrips();
  const trip = trips.find((t) => t.slug === slug);
  if (!trip) return;
  const photo = (await getPicks()).trips[slug] ?? "";
  await writeJsonFile(
    tripsFile(),
    trips.filter((t) => t !== trip),
  );
  await setTripPhoto(slug, "");
  await addToTrash("trip", trip.title, { trip, photo });
}

export async function restoreTrip(data: { trip: StoredTrip; photo: string }) {
  const trips = await readTrips();
  if (!trips.some((t) => t.slug === data.trip.slug)) trips.push(data.trip);
  await writeJsonFile(tripsFile(), trips);
  if (data.photo) await setTripPhoto(data.trip.slug, data.photo);
}
