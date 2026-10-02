import Link from "next/link";
import { SECTIONS, type SectionKey } from "@/lib/sections";
import NubianStrip from "./NubianStrip";

/**
 * Navy title band at the top of inner pages, followed by the Nubian strip.
 * Pages inside a section pass `section`: the band then shows the section's name and sub-menu.
 */
export default function PageHead({
  title,
  lead,
  back,
  section,
}: {
  title: string;
  lead?: React.ReactNode;
  back?: { href: string; label: string };
  section?: SectionKey;
}) {
  const s = section ? SECTIONS[section] : undefined;
  return (
    <>
      <section className="page-head">
        <div className="container">
          {back && (
            <Link href={back.href} className="back-link">
              → {back.label}
            </Link>
          )}
          {s && !back && (
            <p className="section-eyebrow">
              <span aria-hidden="true">{s.icon}</span> {s.name}
            </p>
          )}
          <h1>{title}</h1>
          {lead && <p>{lead}</p>}
          {s && (
            <nav className="section-nav" aria-label={`قسم ${s.name}`}>
              {s.links.map((l) => (
                <Link key={l.href} href={l.href}>
                  {l.label}
                </Link>
              ))}
            </nav>
          )}
        </div>
      </section>
      <NubianStrip />
    </>
  );
}
