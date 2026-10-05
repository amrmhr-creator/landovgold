"use client";

import { useEffect, useRef, useState } from "react";
import { renderMarkdown } from "@/lib/markdown";

// A small Word-like editor for article bodies: headings, bold, italic, lists, links and photos.
// What's typed is turned back into Markdown (the hidden "body" field), the format the site
// already renders, so old and new articles look the same.

type ImageChoice = { name: string; alt: string; src: string; small: string };

const escapeText = (s: string) => s.replace(/([\\*_[\]<>`])/g, "\\$1");
const okUrl = (href: string) => /^(https?:\/\/|\/|#|mailto:)/i.test(href.trim());

function inline(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) return escapeText((node.textContent ?? "").replace(/\s+/g, " "));
  if (!(node instanceof HTMLElement)) return "";
  const inner = () => Array.from(node.childNodes).map(inline).join("");
  switch (node.tagName) {
    case "STRONG":
    case "B": {
      const t = inner().trim();
      return t ? `**${t}**` : "";
    }
    case "EM":
    case "I": {
      const t = inner().trim();
      return t ? `*${t}*` : "";
    }
    case "A": {
      const href = node.getAttribute("href") ?? "";
      const t = inner().trim();
      return okUrl(href) && t ? `[${t}](${href.trim()})` : t;
    }
    case "IMG": {
      const src = node.getAttribute("src") ?? "";
      return okUrl(src) ? `![${escapeText(node.getAttribute("alt") ?? "")}](${src})` : "";
    }
    case "BR":
      return "\n";
    default:
      return inner();
  }
}

/** A table as a Markdown table (first row is the header). */
function table(node: HTMLElement) {
  const rows = Array.from(node.querySelectorAll("tr")).map((tr) =>
    Array.from(tr.children).map((cell) => inline(cell).replace(/\n+/g, " ").replace(/\|/g, "\\|").trim()),
  );
  if (rows.length === 0) return "";
  const width = Math.max(...rows.map((r) => r.length));
  const line = (cells: string[]) => `| ${Array.from({ length: width }, (_, i) => cells[i] ?? "").join(" | ")} |`;
  return [line(rows[0]), line(Array(width).fill("---")), ...rows.slice(1).map(line)].join("\n");
}

/** The editor's HTML as Markdown, block by block. */
export function toMarkdown(root: HTMLElement): string {
  const blocks: string[] = [];
  const paragraph = (text: string) => {
    const t = text.replace(/\n{2,}/g, "\n").trim();
    if (t) blocks.push(t);
  };
  let loose = "";
  const flush = () => {
    paragraph(loose);
    loose = "";
  };
  for (const node of Array.from(root.childNodes)) {
    if (node instanceof HTMLElement && /^(H[1-6]|P|DIV|UL|OL|BLOCKQUOTE|TABLE)$/.test(node.tagName)) {
      flush();
      const tag = node.tagName;
      if (tag === "TABLE") paragraph(table(node));
      else if (tag === "H1" || tag === "H2") paragraph(`## ${inline(node).trim()}`);
      else if (/^H[3-6]$/.test(tag)) paragraph(`### ${inline(node).trim()}`);
      else if (tag === "UL" || tag === "OL") {
        const items = Array.from(node.children)
          .filter((li) => li.tagName === "LI")
          .map((li, i) => `${tag === "OL" ? `${i + 1}.` : "-"} ${inline(li).replace(/\n+/g, " ").trim()}`)
          .filter((line) => !/^(-|\d+\.)\s*$/.test(line));
        if (items.length) blocks.push(items.join("\n"));
      } else paragraph(inline(node));
    } else {
      loose += inline(node);
    }
  }
  flush();
  return blocks.filter((b) => !/^#{2,3}\s*$/.test(b)).join("\n\n");
}

export default function ArticleEditor({ initial, images }: { initial: string; images: ImageChoice[] }) {
  const box = useRef<HTMLDivElement>(null);
  const [body, setBody] = useState(initial);
  const [picking, setPicking] = useState(false);

  useEffect(() => {
    if (box.current) box.current.innerHTML = renderMarkdown(initial);
    // Paragraphs, not divs, when pressing Enter.
    document.execCommand("defaultParagraphSeparator", false, "p");
  }, [initial]);

  const sync = () => box.current && setBody(toMarkdown(box.current));
  const run = (command: string, value?: string) => {
    box.current?.focus();
    document.execCommand(command, false, value);
    sync();
  };
  const addLink = () => {
    const href = window.prompt("حط اللينك (بيبدأ بـ https:// أو /):", "https://");
    if (href && okUrl(href)) run("createLink", href.trim());
  };
  const addImage = (image: ImageChoice) => {
    setPicking(false);
    box.current?.focus();
    document.execCommand("insertHTML", false, `<p><img src="${image.src}" alt="${image.alt.replace(/"/g, "&quot;")}"></p>`);
    sync();
  };

  const tool = (label: string, title: string, action: () => void) => (
    <button
      type="button"
      title={title}
      className="btn btn-outline btn-sm"
      // Keep the text selection: act on mouse down, before the button takes the focus.
      onMouseDown={(e) => {
        e.preventDefault();
        action();
      }}
    >
      {label}
    </button>
  );

  return (
    <div className="admin-editor">
      <div className="admin-editor-tools" role="toolbar" aria-label="تنسيق المقال">
        {tool("عنوان كبير", "عنوان", () => run("formatBlock", "<h2>"))}
        {tool("عنوان صغير", "عنوان فرعي", () => run("formatBlock", "<h3>"))}
        {tool("كلام عادي", "فقرة", () => run("formatBlock", "<p>"))}
        {tool("B", "خط عريض", () => run("bold"))}
        {tool("I", "خط مايل", () => run("italic"))}
        {tool("• نقط", "قايمة بنقط", () => run("insertUnorderedList"))}
        {tool("1. أرقام", "قايمة بأرقام", () => run("insertOrderedList"))}
        {tool("لينك", "حط لينك على الكلام المتعلّم", addLink)}
        {tool("شيل اللينك", "شيل اللينك", () => run("unlink"))}
        {tool("صورة", "حط صورة من الصور المرفوعة", () => setPicking((p) => !p))}
        {tool("↶ تراجع", "تراجع", () => run("undo"))}
      </div>
      {picking && (
        <div className="admin-image-grid admin-editor-images">
          {images.length === 0 && <p className="muted small">ارفع صور الأول من صفحة &quot;الصور&quot;.</p>}
          {images.map((i) => (
            <button key={i.name} type="button" className="admin-image-pick" onClick={() => addImage(i)} title={i.alt}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={i.small} alt={i.alt} />
            </button>
          ))}
        </div>
      )}
      <div ref={box} className="admin-editor-box prose post-body" contentEditable suppressContentEditableWarning onInput={sync} onBlur={sync} />
      <input type="hidden" name="body" value={body} />
    </div>
  );
}
