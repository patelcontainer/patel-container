import { notFound } from "next/navigation";
import { cache } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { ProductCard, CategoryCard } from "@/components/blocks/ProductCards";
import { RichText } from "@/components/ui/RichText";
import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { CtaBlock } from "@/components/blocks/MiscBlocks";
import { client, sanityFetch } from "@/sanity/lib/client";
import { categoryQuery, categorySlugsQuery } from "@/sanity/lib/queries";
import { buildMetadata, getTemplates } from "@/lib/seo";
import { fill, templateTag, type TemplateKey } from "@/lib/templates";
import type { Block } from "@/lib/types";

type Props = { params: Promise<{ slug: string }> };
const getCategory = cache((slug: string) => sanityFetch<Block | null>({ query: categoryQuery, params: { slug }, tags: [`category:${slug}`] }));

export async function generateStaticParams() {
  return (await client.fetch<string[]>(categorySlugsQuery)).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const c = await getCategory(slug);
  if (!c) return {};
  return buildMetadata({ seo: c.seo, title: c.title, description: c.shortDescription, image: c.image, path: `/products/category/${slug}` });
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const c = await getCategory(slug);
  if (!c) notFound();
  const products: Block[] = c.products || [];
  const highlights: Block[] = c.highlights || [];
  const others: Block[] = c.otherCategories || [];
  const t = await getTemplates();
  const tag = (key: TemplateKey) => templateTag(t, key);

  return (
    <>
      <PageHeader
        eyebrow="Product category"
        heading={c.title}
        intro={c.shortDescription}
        image={c.image}
        crumbs={[{ label: "Products", href: "/products" }, { label: c.title }]}
        buttons={[{ _key: "q", label: t.quoteLabel, url: "/get-a-quote", style: "primary" }, { _key: "w", label: t.whatsappLabel, url: "#whatsapp", style: "whatsapp" }]}
      />

      {(c.body?.length || highlights.length > 0) && (
        <section className="section">
          <div className={`wrap grid gap-12 ${highlights.length ? "lg:grid-cols-2 lg:gap-20" : ""}`}>
            {c.body?.length ? <Reveal><RichText value={c.body} /></Reveal> : <div />}
            {!!highlights.length && (
              <div className="grid gap-4 sm:grid-cols-2">
                {highlights.map((h, i) => (
                  <Reveal key={h._key} delay={i * 60} className="rounded-md bg-surface p-6 ring-1 ring-line">
                    <Icon name={h.icon} className="size-8 text-accent" />
                    <h3 className="mt-4 font-bold text-ink">{h.title}</h3>
                    {h.text && <p className="mt-1.5 text-sm text-steel-600">{h.text}</p>}
                  </Reveal>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {!!products.length && (
        <section className="section bg-surface">
          <div className="wrap">
            <SectionHeading as={tag("categoryRangeTag")} eyebrow="Range" heading={fill(t.categoryRangeHeading, c.title)} />
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((p, i) => <ProductCard key={p._id} p={p} index={i} headingAs={tag("categoryRangeItemTag")} />)}
            </div>
          </div>
        </section>
      )}

      <CtaBlock
        block={{
          _type: "ctaBlock",
          _key: "cta",
          eyebrow: products.length ? "Custom builds" : "Built to order",
          heading: fill(t.categoryCtaHeading, c.title),
          headingTag: tag("categoryCtaTag"),
          text: fill(t.categoryCtaText, c.title),
          buttons: [
            { _key: "a", label: t.quoteLabel, url: "/get-a-quote", style: "primary" },
            { _key: "b", label: "Contact Us", url: "/contact", style: "outlineLight" },
          ],
        }}
      />

      {!!others.length && (
        <section className="section">
          <div className="wrap">
            <SectionHeading as={tag("categoryOthersTag")} eyebrow="Explore more" heading={fill(t.categoryOthersHeading, c.title)} />
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {others.slice(0, 3).map((o, i) => <CategoryCard key={o._id} c={o} index={i} headingAs={tag("categoryOthersItemTag")} />)}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
