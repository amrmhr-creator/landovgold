"use client";

import { usePathname } from "next/navigation";

/** The public site's header, footer and WhatsApp button; the admin panel has its own. */
export default function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return pathname.startsWith("/admin") ? null : <>{children}</>;
}
