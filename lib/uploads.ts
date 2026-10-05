import "server-only";
import { randomBytes } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";

// Photos uploaded from the admin panel. They live outside the app folder (UPLOAD_DIR, or a
// "landovgold-uploads" folder next to it) so a new deploy never wipes them, and are served
// by app/uploads/[file]/route.ts. Each upload is saved twice as WebP: a large copy for the
// site and a small one for the admin grid. library.json lists them and says where each is used.

const LARGE_WIDTH = 1600;
const SMALL_WIDTH = 480;
export const MAX_UPLOAD_BYTES = 15 * 1024 * 1024;

export type UploadedImage = {
  name: string; // e.g. "3f9a…c2.webp"
  width: number;
  height: number;
  alt: string;
  uploadedAt: string;
};

/** Where each picture is used on the site. Empty means "use the built-in photos". */
export type ImagePicks = {
  trips: Record<string, string>; // trip slug → image name
  gallery: string[]; // trips page gallery
  about: string[]; // "مين احنا" photos
};

type Library = { images: UploadedImage[]; picks: ImagePicks };

const EMPTY: Library = { images: [], picks: { trips: {}, gallery: [], about: [] } };

export function uploadDir() {
  return process.env.UPLOAD_DIR || path.resolve(process.cwd(), "..", "landovgold-uploads");
}

const libraryFile = () => path.join(uploadDir(), "library.json");

/** Only names we generated ourselves, so a request can never reach another file. */
export function isImageName(name: string) {
  return /^[a-f0-9]{24}(-sm)?\.webp$/.test(name);
}

export const imageUrl = (name: string) => `/uploads/${name}`;
export const smallUrl = (name: string) => `/uploads/${name.replace(/\.webp$/, "-sm.webp")}`;

async function readLibrary(): Promise<Library> {
  try {
    const data = JSON.parse(await readFile(libraryFile(), "utf8")) as Partial<Library>;
    return {
      images: data.images ?? [],
      picks: { ...EMPTY.picks, ...data.picks },
    };
  } catch {
    return structuredClone(EMPTY);
  }
}

async function writeLibrary(lib: Library) {
  await mkdir(uploadDir(), { recursive: true });
  // Write to a temp file and rename it, so a reader never sees a half-written file.
  const tmp = `${libraryFile()}.${process.pid}.tmp`;
  await writeFile(tmp, JSON.stringify(lib, null, 2));
  await rename(tmp, libraryFile());
}

/** Newest first. */
export async function listImages() {
  return (await readLibrary()).images.slice().reverse();
}

export async function getPicks() {
  return (await readLibrary()).picks;
}

/** Whether the server can resize images (sharp may not load on an old server). */
export async function canResize() {
  try {
    const sharp = (await import("sharp")).default;
    await sharp({ create: { width: 2, height: 2, channels: 3, background: "#fff" } }).webp().toBuffer();
    return true;
  } catch (err) {
    console.error(`[uploads] pid ${process.pid}: sharp unavailable: ${err instanceof Error ? err.message : err}`);
    return false;
  }
}

export class UploadError extends Error {}

/** Resizes, compresses and stores one photo. Throws UploadError with a message to show. */
export async function saveImage(input: Buffer, alt: string): Promise<UploadedImage> {
  let sharp: typeof import("sharp").default;
  try {
    sharp = (await import("sharp")).default;
  } catch {
    throw new UploadError("ضغط الصور مش شغال على السيرفر ده. كلّم المبرمج.");
  }
  const meta = await sharp(input)
    .metadata()
    .catch(() => null);
  if (!meta || !meta.width || !meta.height || !["jpeg", "png", "webp", "gif", "avif", "tiff"].includes(meta.format ?? "")) {
    throw new UploadError("الملف ده مش صورة (ارفع JPG أو PNG أو WebP).");
  }

  const name = `${randomBytes(12).toString("hex")}.webp`;
  await mkdir(uploadDir(), { recursive: true });
  // rotate() applies the phone's orientation; metadata (like the GPS location) is dropped.
  const large = sharp(input).rotate().resize({ width: LARGE_WIDTH, withoutEnlargement: true }).webp({ quality: 78 });
  const { width, height } = await large.toFile(path.join(uploadDir(), name));
  await sharp(input)
    .rotate()
    .resize({ width: SMALL_WIDTH, withoutEnlargement: true })
    .webp({ quality: 70 })
    .toFile(path.join(uploadDir(), name.replace(/\.webp$/, "-sm.webp")));

  const image: UploadedImage = { name, width, height, alt: alt.trim().slice(0, 150), uploadedAt: new Date().toISOString() };
  const lib = await readLibrary();
  lib.images.push(image);
  await writeLibrary(lib);
  return image;
}

export async function updateAlt(name: string, alt: string) {
  const lib = await readLibrary();
  const image = lib.images.find((i) => i.name === name);
  if (!image) return;
  image.alt = alt.trim().slice(0, 150);
  await writeLibrary(lib);
}

/** Saves where pictures are used, keeping only names that exist. */
export async function savePicks(picks: ImagePicks) {
  const lib = await readLibrary();
  const known = new Set(lib.images.map((i) => i.name));
  lib.picks = {
    trips: Object.fromEntries(Object.entries(picks.trips).filter(([, n]) => known.has(n))),
    gallery: picks.gallery.filter((n) => known.has(n)),
    about: picks.about.filter((n) => known.has(n)),
  };
  await writeLibrary(lib);
}


export type SiteImage = { src: string; alt: string; width: number; height: number };

const asSiteImage = (i: UploadedImage, fallbackAlt = ""): SiteImage => ({
  src: imageUrl(i.name),
  alt: i.alt || fallbackAlt,
  width: i.width,
  height: i.height,
});

/** The photos the site shows, as picked in /admin/images. Missing picks mean "use the built-in photos". */
export async function sitePhotos() {
  const lib = await readLibrary();
  const byName = new Map(lib.images.map((i) => [i.name, i]));
  const pick = (names: string[]) => names.map((n) => byName.get(n)).filter((i): i is UploadedImage => !!i);
  return {
    /** The picked photo for a trip, or undefined to keep the trip's own. */
    trip(slug: string, fallbackAlt: string): SiteImage | undefined {
      const i = byName.get(lib.picks.trips[slug] ?? "");
      return i && asSiteImage(i, fallbackAlt);
    },
    gallery: pick(lib.picks.gallery).map((i) => asSiteImage(i)),
    about: pick(lib.picks.about).map((i) => asSiteImage(i)),
    /** Any uploaded photo by name (offer photos). */
    byName(name: string | undefined, fallbackAlt = ""): SiteImage | undefined {
      const i = name ? byName.get(name) : undefined;
      return i && asSiteImage(i, fallbackAlt);
    },
  };
}
