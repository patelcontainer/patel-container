import { notFound } from "next/navigation";
import { cache } from "react";
import { Quote } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { ProjectCard, } from "@/components/blocks/CatalogBlocks";
import { ImageGrid } from "@/components/blocks/Gallery";
import { CtaBlock } from "@/components/blocks/MiscBlocks";
import { RichText } from "@/components/ui/RichText";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SanityImg } from "@/components/ui/SanityImg";
import { client, sanityFetch } from "@/sanity/lib/client";
import { projectQuery, projectSlugsQuery } from "@/sanity/lib/queries";
import { buildMetadata, getTemplates } from "@/lib/seo";
import type { Block } from "@/lib/types";

type Props = { params: Promise<{ slug: string }> };
const getProject = cache((slug: string) => sanityFetch<Block | null>({ query: projectQuery, params: { slug }, tags: [`project:${slug}`] }));

export async function generateStaticParams() {
  return (await client.fetch<string[]>(projectSlugsQuery)).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const p = await getProject(slug);
  if (!p) return {};
  return buildMetadata({ seo: p.seo, title: p.title, description: p.summary, image: p.mainImage, path: `/projects/${slug}`, type: "article" });
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const p = await getProject(slug);
  if (!p) notFound();
  const facts = [["Client", p.client], ["Product", p.productLabel], ["Quantity", p.quantity], ["Year", p.year], ["Location", p.location], ["Industry", p.industry?.title]].filter(([, v]) => v);
  const sections = [
    ["The requirement", p.requirement],
    ["Our solution", p.solution],
    ["The result", p.result],
  ].filter(([, v]) => (v as unknown[])?.length);
  const stats: Block[] = p.resultStats || [];
  const more: Block[] = p.more || [];
  const t = await getTemplates();

  return (
    <>
      <PageHeader eyebrow="Case study" heading={p.title} intro={p.summary} image={p.mainImage} crumbs={[{ label: "Projects", href: "/projects" }, { label: p.title }]} buttons={[{ _key: "q", label: t.quoteLabel, url: "/get-a-quote", style: "primary" }]} />

      {!!facts.length && (
        <div className="border-b border-line bg-surface">
          <dl className="wrap grid grid-cols-2 gap-6 py-8 sm:grid-cols-3 lg:grid-cols-6">
            {facts.map(([k, v]) => (
              <div key={k}>
                <dt className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-steel-500">{k}</dt>
                <dd className="mt-1 font-semibold text-ink">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      <section className="section">
        <div className="wrap grid gap-14 lg:grid-cols-[1.2fr_0.8fr] lg:gap-20">
          <div className="space-y-12">
            {sections.map(([title, body], i) => (
              <Reveal key={title as string}>
                <p className="font-display text-sm font-bold text-accent">{String(i + 1).padStart(2, "0")}</p>
                <h2 className="mt-1 text-2xl font-bold text-ink lg:text-3xl">{title as string}</h2>
                <RichText value={body as Block[]} className="mt-4" />
              </Reveal>
            ))}
          </div>
          <aside className="space-y-6">
            {p.mainImage?.asset && (
              <div className="overflow-hidden rounded-md shadow-card">
                <SanityImg image={p.mainImage} sizes="(min-width:1024px) 35vw, 100vw" className="w-full" />
              </div>
            )}
            {!!stats.length && (
              <dl className="corrugated grid grid-cols-2 gap-px overflow-hidden rounded-md bg-navy-900">
                {stats.map((s) => (
                  <div key={s._key} className="p-6">
                    <dd className="font-display text-3xl font-extrabold text-accent">{s.value}</dd>
                    <dt className="mt-1 text-sm text-steel-300">{s.label}</dt>
                  </div>
                ))}
              </dl>
            )}
            {p.testimonial?.quote && (
              <figure className="rounded-md bg-accent-50 p-7">
                <Quote className="size-8 fill-accent text-accent" />
                <blockquote className="mt-4 text-lg font-medium leading-relaxed text-ink">{p.testimonial.quote}</blockquote>
                <figcaption className="mt-4 text-sm text-steel-600">
                  <span className="font-semibold text-ink">{p.testimonial.name}</span>
                  {p.testimonial.role && `, ${p.testimonial.role}`}
                </figcaption>
              </figure>
            )}
          </aside>
        </div>
      </section>

      {!!p.gallery?.length && (
        <section className="section bg-surface">
          <div className="wrap">
            <SectionHeading eyebrow="Photos" heading="Project gallery" />
            <div className="mt-10"><ImageGrid images={p.gallery} /></div>
          </div>
        </section>
      )}

      <CtaBlock block={{ _type: "ctaBlock", _key: "cta", eyebrow: "Similar requirement?", heading: t.projectCtaHeading, buttons: [{ _key: "a", label: t.quoteLabel, url: "/get-a-quote", style: "primary" }, { _key: "b", label: "Contact Us", url: "/contact", style: "outlineLight" }] }} />

      {!!more.length && (
        <section className="section">
          <div className="wrap">
            <SectionHeading eyebrow="More work" heading="Other projects" />
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {more.map((m, i) => <ProjectCard key={m._id} p={m} index={i} />)}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
