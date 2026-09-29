import Link from "next/link";
import NubianStrip from "./NubianStrip";

/** Navy title band at the top of inner pages, followed by the Nubian strip. */
export default function PageHead({
  title,
  lead,
  back,
}: {
  title: string;
  lead?: React.ReactNode;
  back?: { href: string; label: string };
}) {
  return (
    <>
      <section className="page-head">
        <div className="container">
          {back && (
            <Link href={back.href} className="back-link">
              → {back.label}
            </Link>
          )}
          <h1>{title}</h1>
          {lead && <p>{lead}</p>}
        </div>
      </section>
      <NubianStrip />
    </>
  );
}
