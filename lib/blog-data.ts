import "server-only";
import { randomBytes } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { ARTICLES, type Article } from "./blog";
import { writeJsonFile } from "./json-file";
import { cairoToday } from "./offers";
import { uploadDir } from "./uploads";

// Articles edited from /admin/articles, saved as articles.json next to the settings (outside the
// app folder). Until the first save the site shows the articles written in lib/blog.ts. The body
// stays Markdown either way: the admin editor turns what's typed into Markdown when saving.

export type StoredArticle = Article & { hidden?: boolean };

const articlesFile = () => path.join(uploadDir(), "articles.json");

async function readArticles(): Promise<StoredArticle[]> {
  try {
    const data = JSON.parse(await readFile(articlesFile(), "utf8"));
    if (Array.isArray(data)) return data;
  } catch {}
  return structuredClone(ARTICLES);
}

/** Every article, hidden ones too (admin panel), newest first. */
export async function allArticles() {
  return (await readArticles()).slice().reverse();
}

/** Articles shown on the site, in the order they were written. */
export async function visibleArticles() {
  return (await readArticles()).filter((a) => !a.hidden);
}

export async function findArticle(slug: string) {
  return (await visibleArticles()).find((a) => a.slug === slug);
}

export async function articleForAdmin(slug: string) {
  return (await readArticles()).find((a) => a.slug === slug);
}

/** "Best Time to Fly!" → "best-time-to-fly"; empty if nothing usable is left. */
export function cleanSlug(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export type ArticleInput = Pick<StoredArticle, "title" | "description" | "summary" | "topic" | "body" | "hidden">;

export class ArticleError extends Error {}

/** Adds (slug null, with an optional wanted link) or updates an article. Returns its slug. */
export async function saveArticle(slug: string | null, input: ArticleInput, wantedSlug = "") {
  const articles = await readArticles();
  const today = cairoToday();
  if (slug) {
    const article = articles.find((a) => a.slug === slug);
    if (!article) throw new ArticleError("المقال ده مش موجود.");
    Object.assign(article, input, { updated: today });
  } else {
    let newSlug = cleanSlug(wantedSlug) || `article-${randomBytes(3).toString("hex")}`;
    if (articles.some((a) => a.slug === newSlug)) {
      if (wantedSlug) throw new ArticleError("اللينك ده مستخدم في مقال تاني. اختار لينك تاني.");
      newSlug = `${newSlug}-${randomBytes(2).toString("hex")}`;
    }
    articles.push({ ...input, slug: newSlug, published: today, updated: today });
    slug = newSlug;
  }
  await writeJsonFile(articlesFile(), articles);
  return slug;
}

export async function setArticleHidden(slug: string, hidden: boolean) {
  const articles = await readArticles();
  const article = articles.find((a) => a.slug === slug);
  if (!article) return;
  article.hidden = hidden;
  await writeJsonFile(articlesFile(), articles);
}
