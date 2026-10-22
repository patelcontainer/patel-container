import type { MetadataRoute } from "next";
import { sanityFetch } from "@/sanity/lib/client";
import { sitemapQuery } from "@/sanity/lib/queries";
import { absoluteUrl } from "@/lib/seo";

type Item = { slug: string; _updatedAt: string; postType?: string };
type Data = Record<"pages" | "products" | "categories" | "industries" | "projects" | "posts", Item[]>;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const d = await sanityFetch<Data>({ query: sitemapQuery });
  const entry = (path: string, updated: string, priority: number, changeFrequency: "weekly" | "monthly" = "monthly") => ({
    url: absoluteUrl(path),
    lastModified: new Date(updated),
    changeFrequency,
    priority,
  });
  return [
    ...d.pages.map((p) => entry(p.slug === "home" ? "/" : `/${p.slug}`, p._updatedAt, p.slug === "home" ? 1 : p.slug.includes("/") ? 0.6 : 0.8, "weekly")),
    ...d.categories.map((c) => entry(`/products/category/${c.slug}`, c._updatedAt, 0.8)),
    ...d.products.map((p) => entry(`/products/${p.slug}`, p._updatedAt, 0.9)),
    ...d.industries.map((p) => entry(`/industries/${p.slug}`, p._updatedAt, 0.7)),
    ...d.projects.map((p) => entry(`/projects/${p.slug}`, p._updatedAt, 0.6)),
    ...d.posts.map((p) => entry(`/${p.postType === "news" ? "news" : "blog"}/${p.slug}`, p._updatedAt, 0.6)),
    entry("/site-map", new Date().toISOString(), 0.3),
  ];
}
