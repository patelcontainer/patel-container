import type { SanityImage } from "@/sanity/lib/image";
import type { InternalRef, LinkLike } from "./links";
import type { CmsButton } from "@/components/ui/Button";

export type NavChild = { _key: string; label: string; description?: string; internal?: InternalRef; url?: string };
export type NavItem = { _key: string; label: string; internal?: InternalRef; url?: string; children?: NavChild[] };

export type Seo = {
  metaTitle?: string;
  metaDescription?: string;
  ogImageUrl?: string;
  keywords?: string[];
  canonicalUrl?: string;
  noIndex?: boolean;
};

export type Settings = {
  siteName: string;
  legalName?: string;
  tagline?: string;
  logo?: SanityImage;
  logoLight?: SanityImage;
  logoMark?: SanityImage;
  logoText?: string;
  logoSubtext?: string;
  brochureUrl?: string;
  foundingYear?: string;
  phones?: string[];
  email?: string;
  salesEmail?: string;
  whatsappNumber?: string;
  whatsappMessage?: string;
  addresses?: { _key: string; label?: string; address?: string; mapEmbedUrl?: string; directionsUrl?: string }[];
  businessHours?: string;
  responseTime?: string;
  socialLinks?: { _key: string; platform?: string; url?: string }[];
  announcement?: string;
  mainNav?: NavItem[];
  headerCta?: CmsButton;
  footerText?: string;
  footerColumns?: { _key: string; title?: string; links?: (LinkLike & { _key: string })[] }[];
  legalLinks?: (LinkLike & { _key: string })[];
  newsletterHeading?: string;
  newsletterText?: string;
  copyright?: string;
  titleTemplate?: string;
  defaultSeo?: Seo;
  googleSiteVerification?: string;
  gaId?: string;
  gtmId?: string;
  topProducts?: { title: string; slug: string }[];
  productOptions?: string[];
  templates?: Partial<Record<string, string>>;
};

/** Loose shape for page-builder blocks; each block component narrows what it needs. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Block = { _type: string; _key: string; [k: string]: any };
