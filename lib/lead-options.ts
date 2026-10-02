// Choices in the lead forms. Shared by the form and the API, which only accepts these values.

import type { SectionKey } from "./sections";

export const SERVICES = ["تذكرة طيران", "رحلة أسوان والنوبة", "سؤال تاني"] as const;

export const TRANSPORT = ["بالطيارة", "بالقطر"] as const;

/** Which section a lead belongs to; "general" for questions that aren't about one service. */
export type LeadSection = SectionKey | "general";

/** The contact form's service choice → its section. */
export const SERVICE_SECTION: Record<(typeof SERVICES)[number], LeadSection> = {
  "تذكرة طيران": "flights",
  "رحلة أسوان والنوبة": "aswan",
  "سؤال تاني": "general",
};

/** Section names as the admin panel, the Excel file and the lead email show them. */
export const LEAD_SECTION_LABEL: Record<LeadSection, string> = {
  flights: "طيران",
  aswan: "أسوان والنوبة",
  general: "عام",
};

export const LEAD_SECTIONS = Object.keys(LEAD_SECTION_LABEL) as LeadSection[];
