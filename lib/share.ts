// Link-preview images (WhatsApp, Facebook, Google): a page with its own uploaded photo shares
// that photo as a 1200×630 JPG; every other page shares the site's default image.

export const DEFAULT_SHARE_IMAGE = "/og-default.jpg";

/** "/uploads/<name>.webp" → its share JPG; anything else → the default share image. */
export function shareImageFor(src?: string) {
  const m = src && /^\/uploads\/([a-f0-9]{24})\.webp$/.exec(src);
  return m ? `/uploads/${m[1]}-og.jpg` : DEFAULT_SHARE_IMAGE;
}

/** The first uploaded photo in an article body (Markdown), if any. */
export function firstPhotoIn(markdown: string) {
  return /!\[[^\]]*\]\((\/uploads\/[a-f0-9]{24}\.webp)\)/.exec(markdown)?.[1];
}

/** Text cut to about `max` characters at a word, for descriptions. */
export function clip(text: string, max = 160) {
  const t = text.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  return `${t.slice(0, t.lastIndexOf(" ", max - 1) > 60 ? t.lastIndexOf(" ", max - 1) : max - 1)}…`;
}
