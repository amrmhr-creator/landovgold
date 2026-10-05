import "server-only";
import { randomBytes } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { FAQ, type FaqGroup } from "./faq";
import { writeJsonFile } from "./json-file";
import type { SectionKey } from "./sections";
import { addToTrash } from "./trash";
import { uploadDir } from "./uploads";

// Questions edited from /admin/faq, saved as faq.json next to the settings (outside the app
// folder). Until the first save the site shows the questions written in lib/faq.ts.
// The three groups are fixed: flights and trips questions also show on their section's page.

export type FaqItem = { id: string; q: string; a: string; hidden?: boolean };
export type StoredFaqGroup = { key: "flights" | "aswan" | "general"; title: string; section?: SectionKey; items: FaqItem[] };

const GROUP_KEYS: StoredFaqGroup["key"][] = ["flights", "aswan", "general"];

const faqFile = () => path.join(uploadDir(), "faq.json");
const newId = () => randomBytes(4).toString("hex");

function defaults(): StoredFaqGroup[] {
  return FAQ.map((g, i) => ({
    key: GROUP_KEYS[i] ?? "general",
    title: g.title,
    section: g.section,
    // Fixed ids, so the admin page and the save agree before anything is saved.
    items: g.items.map((item, j) => ({ id: `d${i}-${j}`, ...item })),
  }));
}

async function readFaq(): Promise<StoredFaqGroup[]> {
  try {
    const data = JSON.parse(await readFile(faqFile(), "utf8"));
    if (Array.isArray(data)) return data;
  } catch {}
  return defaults();
}

/** Every group and question, hidden ones too (admin panel). */
export async function allFaq() {
  return readFaq();
}

/** Groups with their shown questions, for the site and the FAQPage structured data. */
export async function visibleFaq(): Promise<FaqGroup[]> {
  return (await readFaq())
    .map((g) => ({ title: g.title, section: g.section, items: g.items.filter((i) => !i.hidden).map(({ q, a }) => ({ q, a })) }))
    .filter((g) => g.items.length > 0);
}

export async function sectionFaq(section: SectionKey) {
  return (await visibleFaq()).filter((g) => g.section === section);
}

export const isGroupKey = (k: string): k is StoredFaqGroup["key"] => (GROUP_KEYS as string[]).includes(k);

/** Adds (id null) or updates a question; changing its group moves it to the end of the new group. */
export async function saveQuestion(id: string | null, input: { group: StoredFaqGroup["key"]; q: string; a: string; hidden: boolean }) {
  const groups = await readFaq();
  const target = groups.find((g) => g.key === input.group);
  if (!target) throw new Error("unknown group");
  const current = id ? groups.flatMap((g) => g.items.map((item) => ({ g, item }))).find((x) => x.item.id === id) : undefined;
  if (current) {
    Object.assign(current.item, { q: input.q, a: input.a, hidden: input.hidden || undefined });
    if (current.g !== target) {
      current.g.items = current.g.items.filter((i) => i !== current.item);
      target.items.push(current.item);
    }
  } else {
    target.items.push({ id: newId(), q: input.q, a: input.a, hidden: input.hidden || undefined });
  }
  await writeJsonFile(faqFile(), groups);
}

/** Moves a question one place up or down inside its group. */
export async function moveQuestion(id: string, direction: -1 | 1) {
  const groups = await readFaq();
  for (const g of groups) {
    const i = g.items.findIndex((item) => item.id === id);
    const j = i + direction;
    if (i < 0) continue;
    if (j >= 0 && j < g.items.length) [g.items[i], g.items[j]] = [g.items[j], g.items[i]];
    break;
  }
  await writeJsonFile(faqFile(), groups);
}

export async function deleteQuestion(id: string) {
  const groups = await readFaq();
  for (const g of groups) {
    const index = g.items.findIndex((i) => i.id === id);
    if (index < 0) continue;
    const [item] = g.items.splice(index, 1);
    await writeJsonFile(faqFile(), groups);
    await addToTrash("question", item.q, { group: g.key, index, item });
    return;
  }
}

export async function restoreQuestion(data: { group: StoredFaqGroup["key"]; index: number; item: FaqItem }) {
  const groups = await readFaq();
  const group = groups.find((g) => g.key === data.group) ?? groups[groups.length - 1];
  if (!groups.some((g) => g.items.some((i) => i.id === data.item.id))) {
    group.items.splice(Math.min(data.index, group.items.length), 0, data.item);
  }
  await writeJsonFile(faqFile(), groups);
}
