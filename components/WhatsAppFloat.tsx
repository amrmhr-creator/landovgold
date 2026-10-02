"use client";

import { usePathname } from "next/navigation";
import { sectionForPath } from "@/lib/sections";
import { whatsappLink } from "@/lib/site";
import WhatsAppIcon from "./WhatsAppIcon";

export default function WhatsAppFloat() {
  // Inside a section, the chat opens with that section's message.
  const section = sectionForPath(usePathname());
  return (
    <a
      className="wa-float"
      href={whatsappLink(section?.whatsapp)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="كلّمنا على واتساب"
    >
      <WhatsAppIcon size={30} />
    </a>
  );
}
