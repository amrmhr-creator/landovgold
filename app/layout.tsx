import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import JsonLd from "@/components/JsonLd";
import SiteChrome from "@/components/SiteChrome";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import { organizationLd } from "@/lib/seo";
import { getSettings } from "@/lib/settings";
import { DEFAULT_SHARE_IMAGE } from "@/lib/share";
import { SITE } from "@/lib/site";
import "./globals.css";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["400", "600", "700", "800"],
  display: "swap",
  variable: "--font-cairo",
});

// Contact details and texts come from /admin/settings, so every page is rendered on request.
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { tagline } = await getSettings();
  return {
    metadataBase: new URL(SITE.url),
    title: { default: `${SITE.name} | طيران ورحلات أسوان والنوبة`, template: `%s | ${SITE.name}` },
    description: `${tagline}. ابعت طلبك ونرجعلك بأكتر من سعر تختار منهم.`,
    openGraph: { siteName: SITE.name, locale: "ar_EG", type: "website", images: [{ url: DEFAULT_SHARE_IMAGE, width: 1200, height: 630 }] },
    twitter: { card: "summary_large_image" },
    // Pre-launch noindex; the switch is ALLOW_INDEXING in next.config.mjs.
    robots: process.env.ALLOW_INDEXING === "true" ? undefined : { index: false, follow: false },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();
  return (
    <html lang="ar" dir="rtl" className={cairo.variable}>
      <body>
        <JsonLd data={organizationLd(settings)} />
        <SiteChrome>
          <Header />
        </SiteChrome>
        <main>{children}</main>
        <SiteChrome>
          <Footer />
          <WhatsAppFloat />
        </SiteChrome>
      </body>
    </html>
  );
}
