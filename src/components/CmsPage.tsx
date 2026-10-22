import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { cache } from "react";
import { PageBuilder } from "@/components/blocks/PageBuilder";
import { PageHeader } from "@/components/layout/PageHeader";
import type { Crumb } from "@/components/layout/Breadcrumbs";
import { sanityFetch } from "@/sanity/lib/client";
import { pageQuery } from "@/sanity/lib/queries";
import { buildMetadata } from "@/lib/seo";
import type { Block, Seo } from "@/lib/types";
import type { SanityImage } from "@/sanity/lib/image";

type ParentRef = { title: string; slug: string; parent?: ParentRef | null } | null;

export type CmsPageData = {
  _id: string;
  title: string;
  slug: string;
  header?: { eyebrow?: string; heading?: string; intro?: string; image?: SanityImage; buttons?: Block[] };
  parent?: ParentRef;
  seo?: Seo;
  pageBuilder?: Block[];
};

export const getPage = cache((slug: string) =>
  sanityFetch<CmsPageData | null>({ query: pageQuery, params: { slug }, tags: [`page:${slug}`] }),
);

export const pagePath = (slug: string) => (slug === "home" ? "/" : `/${slug}`);

export async function cmsPageMetadata(slug: string): Promise<Metadata> {
  const page = await getPage(slug);
  if (!page) return {};
  const firstHero = page.pageBuilder?.[0]?._type === "heroBlock" ? page.pageBuilder[0] : null;
  return buildMetadata({
    seo: page.seo,
    title: page.title,
    description: page.header?.intro || firstHero?.subheading,
    image: page.header?.image || firstHero?.images?.[0],
    path: pagePath(slug),
  });
}

function crumbsFor(page: CmsPageData): Crumb[] {
  const chain: Crumb[] = [];
  let p = page.parent;
  while (p) {
    chain.unshift({ label: p.title, href: pagePath(p.slug) });
    p = p.parent ?? null;
  }
  return [...chain, { label: page.title }];
}

export async function CmsPage({ slug }: { slug: string }) {
  const page = await getPage(slug);
  if (!page) notFound();
  const startsWithHero = page.pageBuilder?.[0]?._type === "heroBlock";

  return (
    <>
      {!startsWithHero && (
        <PageHeader
          eyebrow={page.header?.eyebrow}
          heading={page.header?.heading || page.title}
          intro={page.header?.intro}
          image={page.header?.image}
          buttons={page.header?.buttons}
          crumbs={crumbsFor(page)}
        />
      )}
      <PageBuilder blocks={page.pageBuilder} />
    </>
  );
}
