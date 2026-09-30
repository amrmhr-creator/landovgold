"use client";

import { useState } from "react";

/** Copies `text` (e.g. an offer link for a social post) and says so for two seconds. */
export default function CopyButton({ text, label = "انسخ اللينك" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Older browsers or no permission: let the person copy it by hand.
      window.prompt("انسخ اللينك:", text);
      return;
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button type="button" className="btn btn-outline btn-sm" onClick={copy}>
      {copied ? "✓ اتنسخ" : label}
    </button>
  );
}
