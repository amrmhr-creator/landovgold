"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { SECTION_LIST, sectionForPath } from "@/lib/sections";
import { COMPANY_NAV, CONTACT_NAV, SITE } from "@/lib/site";

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [companyOpen, setCompanyOpen] = useState(false);
  const companyRef = useRef<HTMLLIElement>(null);
  const currentSection = sectionForPath(pathname);
  const inCompany = COMPANY_NAV.some((item) => pathname === item.href || pathname.startsWith(`${item.href}/`));

  useEffect(() => {
    setOpen(false);
    setCompanyOpen(false);
  }, [pathname]);

  // Close the "عن بلاد الدهب" list on Escape or a click anywhere else.
  useEffect(() => {
    if (!companyOpen) return;
    const onDown = (e: MouseEvent) => {
      if (!companyRef.current?.contains(e.target as Node)) setCompanyOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setCompanyOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [companyOpen]);

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link href="/" className="brand" aria-label={`${SITE.name}، الرئيسية`}>
          <Image src="/logo.png" alt={SITE.name} width={73} height={64} priority />
        </Link>

        <button
          type="button"
          className="menu-toggle"
          aria-expanded={open}
          aria-controls="main-nav"
          aria-label={open ? "اقفل القائمة" : "افتح القائمة"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "✕" : "☰"}
        </button>

        <nav id="main-nav" className={`main-nav ${open ? "is-open" : ""}`} aria-label="القائمة الرئيسية">
          <ul>
            {SECTION_LIST.map((s) => (
              <li key={s.key}>
                <Link
                  href={s.href}
                  className="nav-section"
                  aria-current={currentSection?.key === s.key ? "page" : undefined}
                >
                  <span aria-hidden="true">{s.icon}</span> {s.name}
                </Link>
              </li>
            ))}
            <li className="nav-divider" aria-hidden="true" />
            <li ref={companyRef} className="nav-group">
              <button
                type="button"
                aria-expanded={companyOpen}
                aria-controls="company-nav"
                className={inCompany ? "is-current" : undefined}
                onClick={() => setCompanyOpen((v) => !v)}
              >
                عن بلاد الدهب <span aria-hidden="true">▾</span>
              </button>
              <ul id="company-nav" className={`submenu ${companyOpen ? "is-open" : ""}`}>
                {COMPANY_NAV.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} aria-current={pathname === item.href ? "page" : undefined}>
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
            <li>
              <Link href={CONTACT_NAV.href} aria-current={pathname === CONTACT_NAV.href ? "page" : undefined}>
                {CONTACT_NAV.label}
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
