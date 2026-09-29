import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import JsonLd from "@/components/JsonLd";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import { organizationLd } from "@/lib/seo";
import { SITE } from "@/lib/site";
import "./globals.css";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["400", "600", "700", "800"],
  display: "swap",
  variable: "--font-cairo",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: `${SITE.name} | طيران ورحلات أسوان والنوبة`, template: `%s | ${SITE.name}` },
  description: `${SITE.tagline}. ابعت طلبك ونرجعلك بأكتر من سعر تختار منهم.`,
  openGraph: { siteName: SITE.name, locale: "ar_EG", type: "website" },
  // Pre-launch noindex; the switch is ALLOW_INDEXING in next.config.mjs.
  robots: process.env.ALLOW_INDEXING === "true" ? undefined : { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className={cairo.variable}>
      <body>
        <JsonLd data={organizationLd()} />
        <Header />
        <main>{children}</main>
        <Footer />
        <WhatsAppFloat />
      </body>
    </html>
  );
}
