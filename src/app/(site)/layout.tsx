import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Archivo, Inter } from "next/font/google";
import "../globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { StickyActions } from "@/components/layout/StickyActions";
import { SiteProvider } from "@/components/layout/SiteContext";
import { JsonLd } from "@/components/seo/JsonLd";
import { SITE_URL, getSettings, organizationSchema } from "@/lib/seo";
import { whatsappHref } from "@/lib/links";
import { resolveTemplates } from "@/lib/templates";

const archivo = Archivo({ subsets: ["latin"], variable: "--font-archivo", display: "swap", weight: ["500", "600", "700", "800"] });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export const viewport: Viewport = {
  themeColor: "#0b1b30",
  width: "device-width",
  initialScale: 1,
};

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  const d = s.defaultSeo || {};
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: d.metaTitle || s.siteName, template: s.titleTemplate || `%s | ${s.siteName}` },
    description: d.metaDescription,
    applicationName: s.siteName,
    verification: s.googleSiteVerification ? { google: s.googleSiteVerification } : undefined,
    openGraph: { siteName: s.siteName, locale: "en_IN", type: "website", images: d.ogImageUrl ? [d.ogImageUrl] : undefined },
    formatDetection: { telephone: true },
  };
}

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const s = await getSettings();
  const site = {
    siteName: s.siteName,
    brochureUrl: s.brochureUrl,
    whatsappUrl: whatsappHref(s.whatsappNumber, s.whatsappMessage),
    phones: s.phones || [],
    email: s.email,
    responseTime: s.responseTime,
    productOptions: s.productOptions || [],
    templates: resolveTemplates(s.templates, s.responseTime),
  };

  return (
    <html lang="en-IN" className={`${archivo.variable} ${inter.variable}`} data-scroll-behavior="smooth" suppressHydrationWarning>
      <body className="min-h-screen bg-white" suppressHydrationWarning>
        {s.gtmId && (
          <Script id="gtm" strategy="afterInteractive">
            {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${s.gtmId}');`}
          </Script>
        )}
        {s.gaId && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${s.gaId}`} strategy="afterInteractive" />
            <Script id="ga" strategy="afterInteractive">
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${s.gaId}');`}
            </Script>
          </>
        )}
        <a href="#main" className="sr-only z-[100] rounded bg-accent px-4 py-2 font-semibold text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
          Skip to content
        </a>
        <SiteProvider value={site}>
          <Header settings={s} />
          <main id="main">{children}</main>
          <Footer settings={s} />
          <StickyActions />
        </SiteProvider>
        <JsonLd data={organizationSchema(s)} />
      </body>
    </html>
  );
}
