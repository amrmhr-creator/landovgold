import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { dbConfigured } from "@/lib/db";
import { logoutAction } from "../actions";

export const dynamic = "force-dynamic";

const NAV = [
  { href: "/admin", label: "الرئيسية" },
  { href: "/admin/leads", label: "الطلبات" },
  { href: "/admin/offers", label: "العروض" },
  { href: "/admin/images", label: "الصور" },
];

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <>
      <header className="admin-bar">
        <div className="container admin-bar-inner">
          <strong>لوحة التحكم</strong>
          <nav>
            {NAV.map((n) => (
              <Link key={n.href} href={n.href}>
                {n.label}
              </Link>
            ))}
            <Link href="/" target="_blank">
              الموقع ↗
            </Link>
          </nav>
          <form action={logoutAction}>
            <button type="submit" className="admin-logout">
              خروج
            </button>
          </form>
        </div>
      </header>
      <div className="container admin-body">
        {!dbConfigured() && (
          <p className="notice">
            قاعدة البيانات مش متوصلة هنا (DB_HOST و DB_USER و DB_NAME مش موجودين)، فالطلبات والعروض مش بتتحفظ ولا بتتعرض. الصور بتشتغل عادي.
          </p>
        )}
        {children}
      </div>
    </>
  );
}
