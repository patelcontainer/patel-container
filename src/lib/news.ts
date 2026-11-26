import { linkHref, type LinkLike } from "./links";
import type { Settings } from "./types";

/**
 * The News section can be switched off in Site settings → Header & menu → "Show News section".
 * While it is off, /news redirects to /blog and News links, posts and cards are left out everywhere.
 */
export const isNewsHref = (href?: string) => !!href && /^(https?:\/\/[^/]+)?\/news(\/|$|\?|#)/.test(href);

export const isNewsLink = (l: LinkLike) => isNewsHref(linkHref(l));

export const isNewsPost = (p: { _type?: string; postType?: string; slug?: string }) =>
  (p._type === undefined || p._type === "post") && p.postType === "news";

/**
 * Settings with every menu, footer and legal link to News removed.
 * A dropdown left with a single item (Media → Blog) becomes that item, so Blog shows as a top-level link.
 */
export function withoutNewsLinks(s: Settings): Settings {
  return {
    ...s,
    mainNav: s.mainNav
      ?.filter((i) => !isNewsLink(i))
      .map((i) => {
        if (!i.children?.some(isNewsLink)) return i;
        const children = i.children.filter((c) => !isNewsLink(c));
        if (children.length !== 1) return { ...i, children };
        const only = children[0];
        return { _key: i._key, label: only.label, internal: only.internal, url: only.url };
      }),
    footerColumns: s.footerColumns?.map((c) => ({ ...c, links: c.links?.filter((l) => !isNewsLink(l)) })),
    legalLinks: s.legalLinks?.filter((l) => !isNewsLink(l)),
  };
}
