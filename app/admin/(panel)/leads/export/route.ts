import { isAdmin } from "@/lib/admin-auth";
import { formatCairoTime, leadKindLabel, parseLeadSection, whatsappDigits } from "@/lib/admin-format";
import { dbConfigured } from "@/lib/db";
import { LEAD_SECTION_LABEL } from "@/lib/lead-options";
import { listLeads } from "@/lib/leads";
import { cairoToday } from "@/lib/offers";

export const dynamic = "force-dynamic";

/** CSV that opens in Excel with Arabic intact (UTF-8 with BOM). Same filters as the leads page. */
export async function GET(req: Request) {
  if (!(await isAdmin())) return new Response("Unauthorized", { status: 401 });
  if (!dbConfigured()) return new Response("قاعدة البيانات مش متوصلة", { status: 503 });

  const url = new URL(req.url);
  const section = parseLeadSection(url.searchParams.get("section"));
  const leads = await listLeads({ section, marketingOnly: url.searchParams.get("marketing") === "1" }, 5000);

  // Quote every cell, and defuse text Excel would run as a formula (phone numbers like +971… stay as they are).
  const cell = (v: unknown) => {
    let s = v == null ? "" : String(v);
    if (/^[=@]|^[+\-](?![\d\s]*$)/.test(s)) s = `'${s}`;
    return `"${s.replace(/"/g, '""')}"`;
  };
  const header = ["وصل إمتى", "القسم", "الاسم", "الرقم", "واتساب", "النوع", "الطلب", "تاريخ السفر", "عدد الأفراد", "التفاصيل", "موافق على العروض", "الصفحة"];
  const rows = leads.map((l) => [
    formatCairoTime(l.createdAt),
    LEAD_SECTION_LABEL[l.section],
    l.name,
    l.phone,
    `https://wa.me/${whatsappDigits(l.phone)}`,
    leadKindLabel(l.kind),
    l.destination,
    l.travelDate ?? "",
    l.travelers ?? "",
    l.details ?? "",
    l.marketingOk ? "أيوه" : "لأ",
    l.page ?? "",
  ]);
  const csv = "﻿" + [header, ...rows].map((r) => r.map(cell).join(",")).join("\r\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="leads-${cairoToday()}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
