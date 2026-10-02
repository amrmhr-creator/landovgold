import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { formatCairoTime, leadKindLabel, parseLeadSection, whatsappDigits } from "@/lib/admin-format";
import { dbConfigured, describeError } from "@/lib/db";
import { LEAD_SECTIONS, LEAD_SECTION_LABEL } from "@/lib/lead-options";
import { listLeads, type LeadRow } from "@/lib/leads";
import { formatDate } from "@/lib/offers";

export const metadata = { title: "الطلبات" };

type Search = { section?: string; marketing?: string };

function href(s: Search) {
  const q = new URLSearchParams();
  if (s.section) q.set("section", s.section);
  if (s.marketing) q.set("marketing", "1");
  const str = q.toString();
  return str ? `?${str}` : "?";
}

export default async function Page({ searchParams }: { searchParams: Promise<Search> }) {
  await requireAdmin();
  const search = await searchParams;
  const section = parseLeadSection(search.section);
  const marketingOnly = search.marketing === "1";

  let leads: LeadRow[] = [];
  let error = false;
  if (dbConfigured()) {
    try {
      leads = await listLeads({ section, marketingOnly });
    } catch (err) {
      console.error(`[admin] pid ${process.pid}: listing leads failed: ${describeError(err)}`);
      error = true;
    }
  }

  const exportQuery = href({ section, marketing: marketingOnly ? "1" : undefined });

  return (
    <>
      <div className="admin-title">
        <h1>الطلبات</h1>
        <a className="btn btn-outline" href={`/admin/leads/export${exportQuery === "?" ? "" : exportQuery}`}>
          تنزيل Excel
        </a>
      </div>

      <div className="admin-filters">
        <Link href={href({ marketing: search.marketing })} aria-current={!section ? "true" : undefined}>
          الكل
        </Link>
        {LEAD_SECTIONS.map((s) => (
          <Link key={s} href={href({ section: s, marketing: search.marketing })} aria-current={section === s ? "true" : undefined}>
            {LEAD_SECTION_LABEL[s]}
          </Link>
        ))}
        <Link href={href({ section, marketing: marketingOnly ? undefined : "1" })} aria-current={marketingOnly ? "true" : undefined}>
          {marketingOnly ? "✓ " : ""}الموافقين على العروض بس
        </Link>
      </div>

      {error && <p className="notice">مش قادرين نقرا الطلبات من قاعدة البيانات دلوقتي. جرّب تاني بعد شوية.</p>}
      {!error && leads.length === 0 && <p className="muted">مفيش طلبات هنا لسه.</p>}

      {leads.length > 0 && (
        <div className="table-wrap">
          <table className="table admin-table">
            <thead>
              <tr>
                <th>وصل إمتى</th>
                <th>الاسم</th>
                <th>الرقم</th>
                <th>الطلب</th>
                <th>السفر</th>
                <th>عروض؟</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((l) => (
                <tr key={l.id}>
                  <td className="nowrap">{formatCairoTime(l.createdAt)}</td>
                  <td>{l.name}</td>
                  <td className="nowrap">
                    <a href={`https://wa.me/${whatsappDigits(l.phone)}`} target="_blank" rel="noopener noreferrer" dir="ltr">
                      {l.phone}
                    </a>
                  </td>
                  <td>
                    <small className="muted">
                      {LEAD_SECTION_LABEL[l.section]} · {leadKindLabel(l.kind)}
                    </small>
                    <br />
                    {l.offerSlug && l.kind === "offer" ? (
                      <a href={`/flights/${l.offerSlug}`} target="_blank">
                        {l.destination}
                      </a>
                    ) : (
                      l.destination
                    )}
                    {l.details && <p className="lead-details">{l.details}</p>}
                  </td>
                  <td className="nowrap">
                    {l.travelDate ? formatDate(l.travelDate) : "–"}
                    {l.travelers ? <small className="muted"> · {l.travelers} فرد</small> : null}
                  </td>
                  <td className="center">{l.marketingOk ? "✓" : ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {leads.length >= 500 && <p className="muted small">ظاهر آخر 500 طلب. ملف Excel فيه أول 5000.</p>}
    </>
  );
}
