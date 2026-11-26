import type { Metadata } from "next";
import { cache } from "react";
import { sanityFetch } from "@/sanity/lib/client";
import { settingsQuery } from "@/sanity/lib/queries";
import { urlFor, hasImage, type SanityImage } from "@/sanity/lib/image";
import type { Seo, Settings } from "./types";
import { resolveTemplates } from "./templates";
import { withoutNewsLinks } from "./news";

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");

export const absoluteUrl = (path = "/") => (path.startsWith("http") ? path : `${SITE_URL}${path.startsWith("/") ? "" : "/"}${path}`);

/** Site settings, deduped per request. */
export const getSettings = cache(async (): Promise<Settings> => {
  const s = await sanityFetch<Settings | null>({ query: settingsQuery, tags: ["siteSettings"] });
  if (!s) return { siteName: "VAHANA" };
  return s.showNews ? s : withoutNewsLinks(s);
});

type MetaInput = {
  seo?: Seo | null;
  title?: string;
  description?: string;
  image?: SanityImage | null;
  path: string;
  type?: "website" | "article";
  publishedTime?: string;
};

/** Builds page metadata from the page's SEO fields, falling back to content and then site defaults. */
/** Template wording for fixed page templates (Site settings → Page templates). */
export async function getTemplates() {
  const s = await getSettings();
  return resolveTemplates(s.templates, s.responseTime);
}

export async function buildMetadata({ seo, title, description, image, path, type = "website", publishedTime }: MetaInput): Promise<Metadata> {
  const settings = await getSettings();
  const defaults = settings.defaultSeo || {};
  const metaTitle = seo?.metaTitle || title || defaults.metaTitle || settings.siteName;
  // Titles set explicitly in "Meta title" are used verbatim; others get the site template.
  const useTemplate = !seo?.metaTitle && path !== "/";
  const template = settings.titleTemplate || `%s | ${settings.siteName}`;
  const fullTitle = useTemplate ? template.replace("%s", metaTitle) : metaTitle;
  const desc = seo?.metaDescription || description || defaults.metaDescription;
  const ogImage =
    seo?.ogImageUrl ||
    (hasImage(image) ? urlFor(image).width(1200).height(630).fit("crop").url() : undefined) ||
    defaults.ogImageUrl;
  const canonical = seo?.canonicalUrl || absoluteUrl(path);

  return {
    title: { absolute: fullTitle },
    description: desc,
    keywords: seo?.keywords || defaults.keywords,
    alternates: { canonical },
    robots: seo?.noIndex ? { index: false, follow: true } : undefined,
    openGraph: {
      type,
      url: canonical,
      title: fullTitle,
      description: desc,
      siteName: settings.siteName,
      locale: "en_IN",
      images: ogImage ? [{ url: ogImage, width: 1200, height: 630, alt: metaTitle }] : undefined,
      ...(publishedTime ? { publishedTime } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: desc,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

/* ── Structured data (JSON-LD), as specified in the client's schema document ── */

const ORG_ID = `${SITE_URL}/#organization`;
const WEBSITE_ID = `${SITE_URL}/#website`;
const LOGO = `${SITE_URL}/brand/vahana-logo.png`;
const BRAND_NAME = "Vahana";
const BRAND_DESCRIPTION =
  "Explore ISO shipping containers, specialized enclosures, railway products and electric LCVs, engineered in Bhavnagar, Gujarat, for export and industry.";
const SCHEMA_LANGUAGE = "en-IN";

/** "+91 70464 68484" → "+91 7046468484" */
const schemaPhone = (p?: string) => p?.replace(/[^\d+]/g, "").replace(/^\+91/, "+91 ");

/** Sitewide. */
export function organizationSchema(s: Settings) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": ORG_ID,
    name: BRAND_NAME,
    url: `${SITE_URL}/`,
    logo: { "@type": "ImageObject", url: LOGO },
    description: BRAND_DESCRIPTION,
    telephone: schemaPhone(s.phones?.[0]) || "+91 7046468484",
    email: s.email || "info@vahanacontainers.com",
    areaServed: { "@type": "Place", name: "Worldwide" },
    ...(s.socialLinks?.length ? { sameAs: s.socialLinks.map((l) => l.url).filter(Boolean) } : {}),
  };
}

/** Home page only: the Ahmedabad headquarters. */
export function localBusinessSchema(s: Settings) {
  const org = organizationSchema(s);
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${SITE_URL}/#localbusiness`,
    name: BRAND_NAME,
    url: `${SITE_URL}/`,
    description: BRAND_DESCRIPTION,
    image: LOGO,
    telephone: org.telephone,
    email: org.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: "407, Sun orbit complex, Nr pandit Dindiyal Auditorium, Raj path Rangoli Road, Bodakdev",
      addressLocality: "Ahmedabad",
      addressRegion: "Gujarat",
      postalCode: "380054",
      addressCountry: "India",
    },
    geo: { "@type": "GeoCoordinates", latitude: "23.03550599772161", longitude: "72.50341255092339" },
  };
}

/** Home page only. */
export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: `${SITE_URL}/`,
    name: BRAND_NAME,
    description: BRAND_DESCRIPTION,
    inLanguage: SCHEMA_LANGUAGE,
    publisher: { "@id": ORG_ID },
  };
}

/** Every page: name and description match the page's meta title and description. */
export async function webPageSchema(meta: MetaInput & { createdAt?: string; updatedAt?: string }) {
  const m = await buildMetadata(meta);
  const url = typeof m.alternates?.canonical === "string" ? m.alternates.canonical : absoluteUrl(meta.path);
  const title = m.title && typeof m.title === "object" && "absolute" in m.title ? m.title.absolute : undefined;
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${url.replace(/\/$/, "")}/#webpage`,
    url,
    name: title,
    description: m.description || undefined,
    inLanguage: SCHEMA_LANGUAGE,
    isPartOf: { "@id": WEBSITE_ID },
    publisher: { "@id": ORG_ID },
    ...(meta.createdAt ? { datePublished: meta.createdAt } : {}),
    ...(meta.updatedAt ? { dateModified: meta.updatedAt } : {}),
  };
}

export const ORGANIZATION_REF = { "@id": ORG_ID };
