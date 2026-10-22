import type { Metadata } from "next";
import { cache } from "react";
import { sanityFetch } from "@/sanity/lib/client";
import { settingsQuery } from "@/sanity/lib/queries";
import { urlFor, hasImage, type SanityImage } from "@/sanity/lib/image";
import type { Seo, Settings } from "./types";
import { resolveTemplates } from "./templates";

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");

export const absoluteUrl = (path = "/") => (path.startsWith("http") ? path : `${SITE_URL}${path.startsWith("/") ? "" : "/"}${path}`);

/** Site settings, deduped per request. */
export const getSettings = cache(async (): Promise<Settings> => {
  const s = await sanityFetch<Settings | null>({ query: settingsQuery, tags: ["siteSettings"] });
  return s ?? { siteName: "Patel Container India" };
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

export function organizationSchema(s: Settings) {
  const addr = s.addresses?.[0];
  return {
    "@context": "https://schema.org",
    "@type": ["Organization", "Manufacturer"],
    "@id": `${SITE_URL}/#organization`,
    name: s.legalName || s.siteName,
    alternateName: s.siteName,
    url: SITE_URL,
    logo: hasImage(s.logo) ? urlFor(s.logo).width(600).url() : undefined,
    slogan: s.tagline,
    foundingDate: s.foundingYear,
    email: s.email,
    telephone: s.phones?.[0],
    sameAs: (s.socialLinks || []).map((l) => l.url).filter(Boolean),
    address: addr?.address
      ? {
          "@type": "PostalAddress",
          streetAddress: addr.address.split("\n")[0],
          addressLocality: "Bhavnagar",
          addressRegion: "Gujarat",
          postalCode: addr.address.match(/\b\d{6}\b/)?.[0],
          addressCountry: "IN",
        }
      : undefined,
    contactPoint: (s.phones || []).map((p) => ({
      "@type": "ContactPoint",
      telephone: p,
      contactType: "sales",
      areaServed: ["IN", "Worldwide"],
      availableLanguage: ["en", "hi", "gu"],
    })),
  };
}
