import { notFound } from "next/navigation";
import { Check, Download, FileText } from "lucide-react";
import { cache } from "react";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { SanityImg } from "@/components/ui/SanityImg";
import { RichText } from "@/components/ui/RichText";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ProductCard } from "@/components/blocks/ProductCards";
import { ImageGrid } from "@/components/blocks/Gallery";
import { FaqList } from "@/components/blocks/MiscBlocks";
import { IndustryTile } from "@/components/blocks/InfoBlocks";
import { LeadForm } from "@/components/forms/LeadForm";
import { JsonLd } from "@/components/seo/JsonLd";
import { client, sanityFetch } from "@/sanity/lib/client";
import { productQuery, productSlugsQuery } from "@/sanity/lib/queries";
import { urlFor, hasImage } from "@/sanity/lib/image";
import { absoluteUrl, buildMetadata, getSettings, getTemplates } from "@/lib/seo";
import { fill } from "@/lib/templates";
import type { Block } from "@/lib/types";

type Props = { params: Promise<{ slug: string }> };

const getProduct = cache((slug: string) => sanityFetch<Block | null>({ query: productQuery, params: { slug }, tags: [`product:${slug}`] }));

export async function generateStaticParams() {
  const slugs = await client.fetch<string[]>(productSlugsQuery);
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const p = await getProduct(slug);
  if (!p) return {};
  return buildMetadata({ seo: p.seo, title: p.title, description: p.shortDescription, image: p.mainImage, path: `/products/${slug}` });
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const p = await getProduct(slug);
  if (!p) notFound();
  const settings = await getSettings();
  const t = await getTemplates();
  const f = (text: string) => fill(text, p.title);

  const keySpecs: Block[] = p.keySpecs || [];
  const specGroups: Block[] = p.specGroups || [];
  const features: Block[] = p.features || [];
  const materials: string[] = p.materials || [];
  const applications: string[] = p.applications || [];
  const gallery: Block[] = p.gallery || [];
  const drawings: Block[] = p.drawings || [];
  const related: Block[] = p.relatedProducts || [];
  const faqs: Block[] = p.faqs || [];
  const industries: Block[] = p.industries || [];

  const nav = [
    { id: "overview", label: "Overview", show: true },
    { id: "specifications", label: "Specifications", show: specGroups.length > 0 },
    { id: "features", label: "Features", show: features.length > 0 || materials.length > 0 },
    { id: "applications", label: "Applications", show: applications.length > 0 || industries.length > 0 },
    { id: "gallery", label: "Gallery", show: gallery.length + drawings.length > 0 },
    { id: "datasheet", label: "Datasheet", show: true },
    { id: "faq", label: "FAQ", show: faqs.length > 0 },
    { id: "quote", label: t.quoteLabel, show: true },
  ].filter((n) => n.show);

  return (
    <>
      {/* Header */}
      <section className="relative overflow-hidden bg-surface">
        <div className="corrugated-dark absolute inset-y-0 right-0 hidden w-1/2 lg:block" />
        <div className="wrap relative grid items-center gap-10 py-10 lg:grid-cols-2 lg:gap-16 lg:py-16">
          <div>
            <Breadcrumbs
              items={[
                { label: "Products", href: "/products" },
                ...(p.category ? [{ label: p.category.title, href: `/products/category/${p.category.slug}` }] : []),
                { label: p.title },
              ]}
            />
            {p.category && <p className="eyebrow mt-8">{p.category.title}</p>}
            <h1 className="mt-3 text-4xl font-extrabold leading-[1.05] text-ink sm:text-5xl lg:text-[3.5rem]">{p.title}</h1>
            {p.shortDescription && <p className="mt-6 max-w-xl text-lg leading-relaxed text-steel-600">{p.shortDescription}</p>}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Button href="#quote" size="lg" className="w-full sm:w-auto">{t.quoteLabel}</Button>
              {p.datasheetUrl ? (
                <Button href={`${p.datasheetUrl}?dl=`} style="outline" size="lg" icon="download" className="w-full sm:w-auto">Download Datasheet</Button>
              ) : (
                <Button href="#whatsapp" style="whatsapp" size="lg" className="w-full sm:w-auto">{t.whatsappLabel}</Button>
              )}
            </div>
          </div>
          <div className="relative">
            <div className="absolute -bottom-3 -right-3 size-40 bg-accent sm:size-52" />
            <div className="relative aspect-[4/3] overflow-hidden rounded-md bg-white shadow-lift">
              <SanityImg image={p.mainImage} fill priority sizes="(min-width:1024px) 50vw, 100vw" className="object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* Data plate: key specs */}
      {!!keySpecs.length && (
        <section aria-label="Key specifications" className="corrugated bg-navy-900">
          <div className="wrap">
            <dl className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
              {keySpecs.map((s, i) => (
                <div key={s._key} className={`border-white/10 px-2 py-7 sm:px-6 ${i > 0 ? "lg:border-l" : ""} ${i % 2 ? "border-l sm:border-l-0" : ""} ${i >= 2 ? "border-t sm:border-t-0" : ""}`}>
                  <dt className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-steel-400">{s.label}</dt>
                  <dd className="mt-2 font-display text-2xl font-bold text-white sm:text-[1.65rem]">{s.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      )}

      {/* Sticky section nav */}
      <nav aria-label="Product sections" className="sticky top-[72px] z-30 border-b border-line bg-white/95 backdrop-blur lg:top-[84px]">
        <div className="wrap no-scrollbar flex gap-1 overflow-x-auto">
          {nav.map((n) => (
            <a key={n.id} href={`#${n.id}`} className="shrink-0 border-b-2 border-transparent px-4 py-4 text-sm font-semibold text-steel-600 transition hover:border-accent hover:text-ink">
              {n.label}
            </a>
          ))}
        </div>
      </nav>

      {/* Overview + specification */}
      <section id="overview" className="section">
        <div className="wrap grid gap-14 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20">
          <div>
            <SectionHeading eyebrow="Overview" heading={f(t.productOverviewHeading)} />
            <Reveal>
              {p.body?.length ? <RichText value={p.body} className="mt-6" /> : <p className="mt-6 text-lg leading-relaxed text-steel-600">{p.shortDescription}</p>}
            </Reveal>
          </div>
          <aside className="lg:pt-4">
            <div className="rounded-md bg-surface p-7 ring-1 ring-line lg:sticky lg:top-40">
              <h2 className="font-display text-lg font-bold text-ink">{f(t.productSidebarHeading)}</h2>
              <p className="mt-2 text-steel-600">{f(t.productSidebarText)}</p>
              <ul className="mt-5 space-y-2.5 text-sm font-medium text-ink">
                {t.productSidebarPoints.split("\n").filter(Boolean).map((pt) => (
                  <li key={pt} className="flex gap-2.5"><Check className="size-4 shrink-0 text-accent" strokeWidth={3} /> {pt}</li>
                ))}
              </ul>
              <div className="mt-6 flex flex-col gap-3">
                <Button href="#quote">{f(t.productSidebarButton)}</Button>
                {p.datasheetUrl && (
                  <a href={`${p.datasheetUrl}?dl=`} className="flex items-center gap-3 rounded-md bg-white p-3 text-sm font-semibold text-ink ring-1 ring-line transition hover:ring-accent">
                    <FileText className="size-8 text-accent" />
                    <span className="flex-1">Product datasheet<span className="block text-xs font-normal text-steel-500">PDF download</span></span>
                    <Download className="size-4 text-steel-500" />
                  </a>
                )}
              </div>
            </div>
          </aside>
        </div>
      </section>

      {!!specGroups.length && (
        <section id="specifications" className="section bg-surface">
          <div className="wrap">
            <SectionHeading eyebrow="Technical data" heading={f(t.productSpecsHeading)} />
            <div className="mt-10 grid gap-6 lg:grid-cols-2">
              {specGroups.map((g) => (
                <Reveal key={g._key} className="overflow-hidden rounded-md bg-white ring-1 ring-line">
                  {g.title && <h3 className="bg-navy-900 px-5 py-3.5 text-sm font-semibold uppercase tracking-[0.1em] text-white">{g.title}</h3>}
                  <table className="w-full text-left text-[0.95rem]">
                    <tbody>
                      {(g.rows || []).map((r: Block) => (
                        <tr key={r._key} className="border-b border-line last:border-0 even:bg-surface/60">
                          <th scope="row" className="w-1/2 px-5 py-3.5 font-medium text-steel-600">{r.label}</th>
                          <td className="px-5 py-3.5 font-semibold tabular-nums text-ink">{r.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Reveal>
              ))}
            </div>
            <p className="mt-4 text-sm text-steel-500">{f(t.productSpecsNote)}</p>
          </div>
        </section>
      )}

      {(!!features.length || !!materials.length) && (
        <section id="features" className="section">
          <div className="wrap">
            <SectionHeading eyebrow="Built to last" heading={f(t.productFeaturesHeading)} />
            {!!features.length && (
              <div className="mt-10 grid gap-px overflow-hidden rounded-md bg-line ring-1 ring-line sm:grid-cols-2 lg:grid-cols-3">
                {features.map((f, i) => (
                  <Reveal key={f._key} delay={(i % 3) * 70} className="bg-white p-7">
                    <span className="grid size-12 place-items-center rounded-md bg-accent-50 text-accent"><Icon name={f.icon} className="size-6" /></span>
                    <h3 className="mt-5 text-lg font-bold text-ink">{f.title}</h3>
                    {f.text && <p className="mt-2 leading-relaxed text-steel-600">{f.text}</p>}
                  </Reveal>
                ))}
              </div>
            )}
            {!!materials.length && (
              <div className="mt-10 rounded-md bg-surface p-7 ring-1 ring-line">
                <h3 className="font-display text-lg font-bold text-ink">Materials and construction</h3>
                <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                  {materials.map((m) => (
                    <li key={m} className="flex gap-2.5 text-steel-600"><Check className="mt-0.5 size-4 shrink-0 text-accent" strokeWidth={3} /> {m}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>
      )}

      {(!!applications.length || !!industries.length) && (
        <section id="applications" className="section corrugated bg-navy-900">
          <div className="wrap">
            <SectionHeading eyebrow="Where it's used" heading={f(t.productApplicationsHeading)} dark />
            {!!applications.length && (
              <ul className="mt-10 flex flex-wrap gap-3">
                {applications.map((a) => (
                  <li key={a} className="rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-medium text-white">{a}</li>
                ))}
              </ul>
            )}
            {!!industries.length && (
              <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {industries.map((ind, i) => <IndustryTile key={ind._id} ind={ind} index={i} />)}
              </div>
            )}
          </div>
        </section>
      )}

      {(!!gallery.length || !!drawings.length) && (
        <section id="gallery" className="section">
          <div className="wrap">
            <SectionHeading eyebrow="Gallery" heading={f(t.productGalleryHeading)} />
            <div className="mt-10"><ImageGrid images={[...gallery, ...drawings]} /></div>
          </div>
        </section>
      )}

      <section id="datasheet" className="border-y border-line bg-white">
        <div className="wrap flex flex-col gap-6 py-10 md:flex-row md:items-center md:justify-between lg:py-12">
          <div className="flex items-start gap-5">
            <span className="grid size-14 shrink-0 place-items-center rounded-md bg-accent-50 text-accent">
              <FileText className="size-7" />
            </span>
            <div>
              <h2 className="text-xl font-bold text-ink sm:text-2xl">{f(t.productDatasheetHeading)}</h2>
              <p className="mt-1.5 max-w-xl text-steel-600">{f(t.productDatasheetText)}</p>
            </div>
          </div>
          {p.datasheetUrl ? (
            <Button href={`${p.datasheetUrl}?dl=`} icon="download" className="w-full shrink-0 md:w-auto">Download PDF</Button>
          ) : (
            <Button href="#quote" style="outline" className="w-full shrink-0 md:w-auto">Request datasheet</Button>
          )}
        </div>
      </section>

      {!!related.length && (
        <section className="section bg-surface">
          <div className="wrap">
            <SectionHeading eyebrow="You may also need" heading={f(t.productRelatedHeading)} />
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((r, i) => <ProductCard key={r._id} p={r} index={i} />)}
            </div>
          </div>
        </section>
      )}

      {!!faqs.length && (
        <section id="faq" className="section">
          <div className="wrap grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
            <SectionHeading eyebrow="FAQ" heading={f(t.productFaqHeading)} />
            <FaqList faqs={faqs} />
          </div>
        </section>
      )}

      <section id="quote" className="section corrugated bg-navy-900">
        <div className="wrap grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          <SectionHeading
            eyebrow={t.quoteLabel}
            heading={f(t.productQuoteHeading)}
            intro={f(t.productQuoteText)}
            dark
          />
          <div className="relative min-w-0 rounded-lg bg-white p-6 shadow-lift sm:p-10">
            <div className="hazard absolute inset-x-0 top-0 h-1.5 rounded-t-lg" />
            <LeadForm type="quote" defaultProduct={p.title} />
          </div>
        </div>
      </section>

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: p.title,
          description: p.shortDescription,
          image: hasImage(p.mainImage) ? [urlFor(p.mainImage).width(1200).url()] : undefined,
          category: p.category?.title,
          url: absoluteUrl(`/products/${slug}`),
          brand: { "@type": "Brand", name: settings.siteName },
          manufacturer: { "@id": `${absoluteUrl("/")}#organization` },
          additionalProperty: keySpecs.map((s) => ({ "@type": "PropertyValue", name: s.label, value: s.value })),
        }}
      />
    </>
  );
}
