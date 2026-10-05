import { Marked } from "marked";

// Article bodies are Markdown (written in lib/blog.ts or by the admin editor). Raw HTML inside
// them is shown as text, never run, so a pasted <script> or style can't reach visitors.

const escapeHtml = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

const safeUrl = (href: string) => /^(https?:\/\/|\/|#|mailto:)/i.test(href.trim());

const md = new Marked({
  renderer: {
    html({ text }) {
      return escapeHtml(text);
    },
    link({ href, title, tokens }) {
      const inner = this.parser.parseInline(tokens);
      if (!safeUrl(href)) return inner;
      const external = /^https?:\/\//i.test(href);
      return `<a href="${escapeHtml(href)}"${title ? ` title="${escapeHtml(title)}"` : ""}${external ? ' target="_blank" rel="noopener noreferrer"' : ""}>${inner}</a>`;
    },
    image({ href, title, text }) {
      if (!safeUrl(href)) return "";
      return `<img src="${escapeHtml(href)}" alt="${escapeHtml(text)}"${title ? ` title="${escapeHtml(title)}"` : ""} loading="lazy">`;
    },
  },
});

export function renderMarkdown(body: string) {
  return md.parse(body, { async: false }) as string;
}
