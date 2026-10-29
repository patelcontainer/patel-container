import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { sanityFetch } from "@/sanity/lib/client";
import { sitemapQuery } from "@/sanity/lib/queries";
import { buildMetadata } from "@/lib/seo";

export const generateMetadata = () => buildMetadata({ title: "Sitemap", description: "A list of every page on the VAHANA website.", path: "/site-map" });

type Item = { title: string; slug: string; postType?: string; parent?: string };
type Data = Record<"pages" | "products" | "categories" | "industries" | "projects" | "posts", Item[]>;

export default async function HtmlSitemap() {
  const d = await sanityFetch<Data>({ query: sitemapQuery });
  const pages = d.pages.filter((p) => p.slug !== "home");
  const top = pages.filter((p) => !p.slug.includes("/"));
  const groups: { title: string; links: { label: string; href: string }[] }[] = [
    { title: "Main pages", links: [{ label: "Home", href: "/" }, ...top.map((p) => ({ label: p.title, href: `/${p.slug}` }))] },
    ...["about-us", "capabilities", "media"].map((root) => ({
      title: top.find((t) => t.slug === root)?.title || root,
      links: pages.filter((p) => p.slug.startsWith(root + "/")).map((p) => ({ label: p.title, href: `/${p.slug}` })),
    })),
    { title: "Product categories", links: d.categories.map((c) => ({ label: c.title, href: `/products/category/${c.slug}` })) },
    { title: "Products", links: d.products.map((p) => ({ label: p.title, href: `/products/${p.slug}` })) },
    { title: "Industries", links: d.industries.map((p) => ({ label: p.title, href: `/industries/${p.slug}` })) },
    { title: "Case studies", links: d.projects.map((p) => ({ label: p.title, href: `/projects/${p.slug}` })) },
    { title: "News and articles", links: d.posts.map((p) => ({ label: p.title, href: `/${p.postType === "news" ? "news" : "blog"}/${p.slug}` })) },
  ].filter((g) => g.links.length);

  return (
    <>
      <PageHeader heading="Sitemap" intro="Every page on our website, grouped by section." crumbs={[{ label: "Sitemap" }]} />
      <section className="section">
        <div className="wrap columns-1 gap-12 sm:columns-2 lg:columns-3">
          {groups.map((g) => (
            <div key={g.title} className="mb-10 break-inside-avoid">
              <h2 className="border-b-2 border-accent pb-2 text-lg font-bold text-ink">{g.title}</h2>
              <ul className="mt-4 space-y-2.5">
                {g.links.map((l) => (
                  <li key={l.href}><Link href={l.href} className="text-steel-600 hover:text-accent hover:underline">{l.label}</Link></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
