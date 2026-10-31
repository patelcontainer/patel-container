import { notFound } from "next/navigation";
import { cache } from "react";
import Link from "next/link";
import { ArrowUpRight, Check, Target, Lightbulb } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { ProductCard, CategoryCard } from "@/components/blocks/ProductCards";
import { ProjectCard } from "@/components/blocks/CatalogBlocks";
import { IndustryTile } from "@/components/blocks/InfoBlocks";
import { RichText } from "@/components/ui/RichText";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Heading } from "@/components/ui/Heading";
import { LeadForm } from "@/components/forms/LeadForm";
import { client, sanityFetch } from "@/sanity/lib/client";
import { industryQuery, industrySlugsQuery } from "@/sanity/lib/queries";
import { buildMetadata, getTemplates } from "@/lib/seo";
import { fill, templateTag, type TemplateKey } from "@/lib/templates";
import type { Block } from "@/lib/types";

type Props = { params: Promise<{ slug: string }> };
const getIndustry = cache((slug: string) => sanityFetch<Block | null>({ query: industryQuery, params: { slug }, tags: [`industry:${slug}`] }));

export async function generateStaticParams() {
  return (await client.fetch<string[]>(industrySlugsQuery)).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const i = await getIndustry(slug);
  if (!i) return {};
  return buildMetadata({ seo: i.seo, title: i.title, description: i.shortDescription, image: i.image, path: `/industries/${slug}` });
}

export default async function IndustryPage({ params }: Props) {
  const { slug } = await params;
  const ind = await getIndustry(slug);
  if (!ind) notFound();
  const recs: Block[] = ind.recommendedProducts || [];
  const others: Block[] = ind.otherIndustries || [];
  const points: string[] = ind.solutionPoints || [];
  const t = await getTemplates();
  const f = (text: string) => fill(text, ind.title);
  const tag = (key: TemplateKey) => templateTag(t, key);

  return (
    <>
      <PageHeader eyebrow="Industry solutions" heading={ind.title} intro={ind.shortDescription} image={ind.image} crumbs={[{ label: "Industries", href: "/industries" }, { label: ind.title }]} buttons={[{ _key: "q", label: t.quoteLabel, url: "#quote", style: "primary" }, { _key: "w", label: t.whatsappLabel, url: "#whatsapp", style: "whatsapp" }]} />

      <section className="section">
        <div className="wrap grid gap-6 lg:grid-cols-2">
          <Reveal className="rounded-md bg-surface p-8 ring-1 ring-line lg:p-12">
            <span className="grid size-12 place-items-center rounded-md bg-white text-accent ring-1 ring-line"><Target className="size-6" /></span>
            <Heading as={tag("industryChallengeTag")} className="mt-6 text-2xl font-bold text-ink lg:text-3xl">{f(t.industryChallengeHeading)}</Heading>
            <RichText value={ind.challenge} className="mt-4" />
          </Reveal>
          <Reveal delay={100} className="corrugated rounded-md bg-navy-900 p-8 lg:p-12">
            <span className="grid size-12 place-items-center rounded-md bg-accent text-white"><Lightbulb className="size-6" /></span>
            <Heading as={tag("industrySolutionTag")} className="mt-6 text-2xl font-bold text-white lg:text-3xl">{f(t.industrySolutionHeading)}</Heading>
            <RichText value={ind.solution} dark className="mt-4" />
            {!!points.length && (
              <ul className="mt-6 space-y-3">
                {points.map((p) => (
                  <li key={p} className="flex gap-3 font-medium text-white"><Check className="mt-0.5 size-5 shrink-0 text-accent" strokeWidth={3} /> {p}</li>
                ))}
              </ul>
            )}
          </Reveal>
        </div>
      </section>

      {!!recs.length && (
        <section className="section bg-surface">
          <div className="wrap">
            <SectionHeading as={tag("industryProductsTag")} eyebrow="Recommended" heading={f(t.industryProductsHeading)} />
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {recs.map((r, i) => (r._type === "productCategory" ? <CategoryCard key={r._id} c={r} index={i} headingAs={tag("industryProductsItemTag")} /> : <ProductCard key={r._id} p={r} index={i} headingAs={tag("industryProductsItemTag")} />))}
            </div>
          </div>
        </section>
      )}

      {ind.caseStudy && (
        <section className="section">
          <div className="wrap grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <SectionHeading eyebrow="Case study" heading={ind.caseStudy.title} intro={ind.caseStudy.summary} />
              {ind.caseStudy.isCaseStudy && (
                <Link href={`/projects/${ind.caseStudy.slug}`} className="mt-6 inline-flex items-center gap-1.5 font-semibold text-accent hover:underline">
                  Read the case study <ArrowUpRight className="size-4" />
                </Link>
              )}
            </div>
            <ProjectCard p={ind.caseStudy} />
          </div>
        </section>
      )}

      <section id="quote" className="section corrugated bg-navy-900">
        <div className="wrap grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          <SectionHeading as={tag("industryQuoteTag")} eyebrow="Talk to an engineer" heading={f(t.industryQuoteHeading)} intro={f(t.industryQuoteText)} dark />
          <div className="relative min-w-0 rounded-lg bg-white p-6 shadow-lift sm:p-10">
            <div className="hazard absolute inset-x-0 top-0 h-1.5 rounded-t-lg" />
            <LeadForm type="enquiry" />
          </div>
        </div>
      </section>

      {!!others.length && (
        <section className="section">
          <div className="wrap">
            <SectionHeading as={tag("industryOthersTag")} eyebrow="Explore" heading={f(t.industryOthersHeading)} />
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {others.slice(0, 3).map((o, i) => <IndustryTile key={o._id} ind={o} index={i} headingAs={tag("industryOthersItemTag")} />)}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
