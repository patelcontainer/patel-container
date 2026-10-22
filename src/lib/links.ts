export type InternalRef = { _type?: string; slug?: string; postType?: string; title?: string } | null;
export type LinkLike = { label?: string; internal?: InternalRef; url?: string; newTab?: boolean } | null | undefined;

/** Public URL path for a document. Keep in sync with the routes in src/app/(site). */
export function docHref(d: InternalRef): string {
  if (!d?.slug) return "/";
  switch (d._type) {
    case "page":
      return d.slug === "home" ? "/" : `/${d.slug}`;
    case "product":
      return `/products/${d.slug}`;
    case "productCategory":
      return `/products/category/${d.slug}`;
    case "industry":
      return `/industries/${d.slug}`;
    case "project":
      return `/projects/${d.slug}`;
    case "post":
      return `/${d.postType === "news" ? "news" : "blog"}/${d.slug}`;
    default:
      return `/${d.slug}`;
  }
}

export function linkHref(l: LinkLike): string {
  if (!l) return "#";
  if (l.internal?.slug) return docHref(l.internal);
  return l.url || "#";
}

export function isExternal(href: string) {
  return /^(https?:)?\/\//.test(href) || href.startsWith("mailto:") || href.startsWith("tel:");
}

export function whatsappHref(number?: string, message?: string) {
  if (!number) return undefined;
  const digits = number.replace(/\D/g, "");
  return `https://wa.me/${digits}${message ? `?text=${encodeURIComponent(message)}` : ""}`;
}

export function telHref(phone: string) {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}
