import "server-only";
import { randomBytes } from "node:crypto";
import { readFile, unlink } from "node:fs/promises";
import path from "node:path";
import { uploadDir } from "./data-dir";
import { writeJsonFile } from "./json-file";

// The trash: anything deleted in the admin panel (offers, trips, questions, articles, photos)
// waits here 30 days and can be restored; after that it's removed for good (photo files too).
// Each data module puts its own item in and knows how to put it back (see app/admin/actions.ts).

export const TRASH_DAYS = 30;

export type TrashKind = "offer" | "trip" | "question" | "article" | "image";

export type TrashEntry = {
  id: string;
  kind: TrashKind;
  title: string;
  deletedAt: number;
  data: unknown;
};

export const TRASH_KIND_LABEL: Record<TrashKind, string> = {
  offer: "عرض طيران",
  trip: "رحلة",
  question: "سؤال",
  article: "مقال",
  image: "صورة",
};

const trashFile = () => path.join(uploadDir(), "trash.json");
const expired = (e: TrashEntry) => Date.now() - e.deletedAt > TRASH_DAYS * 86_400_000;

async function readTrash(): Promise<TrashEntry[]> {
  try {
    const data = JSON.parse(await readFile(trashFile(), "utf8"));
    if (Array.isArray(data)) return data;
  } catch {}
  return [];
}

/** Removes what a deleted photo leaves on disk. */
async function removeFiles(entry: TrashEntry) {
  if (entry.kind !== "image") return;
  const name = (entry.data as { image?: { name?: string } }).image?.name ?? "";
  if (!/^[a-f0-9]{24}\.webp$/.test(name)) return;
  for (const file of [name, name.replace(/\.webp$/, "-sm.webp")]) {
    await unlink(path.join(uploadDir(), file)).catch(() => {});
  }
}

/** Everything in the trash, newest first, after clearing out what's older than 30 days. */
export async function listTrash() {
  const entries = await readTrash();
  const old = entries.filter(expired);
  if (old.length) {
    for (const e of old) await removeFiles(e);
    await writeJsonFile(
      trashFile(),
      entries.filter((e) => !expired(e)),
    );
  }
  return entries.filter((e) => !expired(e)).sort((a, b) => b.deletedAt - a.deletedAt);
}

export async function addToTrash(kind: TrashKind, title: string, data: unknown) {
  const entries = await readTrash();
  entries.push({ id: randomBytes(6).toString("hex"), kind, title, deletedAt: Date.now(), data });
  await writeJsonFile(trashFile(), entries);
}

/** Takes an entry out of the trash (to restore it). */
export async function takeFromTrash(id: string) {
  const entries = await readTrash();
  const entry = entries.find((e) => e.id === id);
  if (!entry) return undefined;
  await writeJsonFile(
    trashFile(),
    entries.filter((e) => e.id !== id),
  );
  return entry;
}

/** Deletes an entry for good, right now. */
export async function purgeFromTrash(id: string) {
  const entry = await takeFromTrash(id);
  if (entry) await removeFiles(entry);
}

export function daysLeft(entry: TrashEntry) {
  return Math.max(0, Math.ceil((entry.deletedAt + TRASH_DAYS * 86_400_000 - Date.now()) / 86_400_000));
}
