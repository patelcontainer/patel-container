import { CmsPage, cmsPageMetadata } from "@/components/CmsPage";
import { client } from "@/sanity/lib/client";
import { pageSlugsQuery } from "@/sanity/lib/queries";

type Props = { params: Promise<{ slug: string[] }> };

// Section index pages have their own route folders.
const OWN_ROUTES = new Set(["products", "industries", "projects", "blog", "news"]);

export async function generateStaticParams() {
  const slugs = await client.fetch<string[]>(pageSlugsQuery);
  return slugs.filter((s) => !OWN_ROUTES.has(s)).map((s) => ({ slug: s.split("/") }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  return cmsPageMetadata(slug.map(decodeURIComponent).join("/"));
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  return <CmsPage slug={slug.map(decodeURIComponent).join("/")} />;
}
