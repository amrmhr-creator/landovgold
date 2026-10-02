// Display helpers for the admin panel.

import { LEAD_SECTIONS, type LeadSection } from "./lead-options";

export const LEAD_KINDS = [
  { key: "offer", label: "عرض طيران" },
  { key: "flight", label: "طلب طيران" },
  { key: "trip", label: "رحلة أسوان" },
  { key: "contact", label: "تواصل" },
] as const;

export function leadKindLabel(kind: string | null) {
  return LEAD_KINDS.find((k) => k.key === kind)?.label ?? "طلب";
}

/** A section filter from the URL, if it's a real one. */
export function parseLeadSection(value: string | null | undefined): LeadSection | undefined {
  return LEAD_SECTIONS.find((s) => s === value);
}

/** Unix seconds → "29/9/2026 3:15 م" in Cairo time. */
export function formatCairoTime(unixSeconds: number) {
  return new Date(unixSeconds * 1000).toLocaleString("ar-EG", {
    timeZone: "Africa/Cairo",
    day: "numeric",
    month: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/** Phone as typed → international digits for wa.me (Egyptian 01… numbers get the 20 prefix). */
export function whatsappDigits(phone: string) {
  let d = phone.replace(/\D/g, "");
  if (d.startsWith("00")) d = d.slice(2);
  if (/^01\d{9}$/.test(d)) d = `2${d}`;
  return d;
}
