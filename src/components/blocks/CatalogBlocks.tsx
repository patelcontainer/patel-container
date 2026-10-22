import Link from "next/link";
import { ArrowRight, BadgeCheck, Download } from "lucide-react";
import { Section } from "./Section";
import { CategoryCard, ProductCard } from "./ProductCards";
import { Reveal } from "@/components/ui/Reveal";
import { SanityImg } from "@/components/ui/SanityImg";
import { urlFor } from "@/sanity/lib/image";
import type { Block } from "@/lib/types";

export function ProductCategories({ block }: { block: Block }) {
  const cats: Block[] = block.categories || [];
  return (
    <Section block={block}>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {cats.map((c, i) => (
          <CategoryCard key={c._id} c={c} index={i} />
        ))}
      </div>
    </Section>
  );
}

export function Products({ block }: { block: Block }) {
  const products: Block[] = block.products || [];
  return (
    <Section block={block}>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((p, i) => (
          <ProductCard key={p._id} p={p} index={i} />
        ))}
      </div>
    </Section>
  );
}

export function ComparisonTable({ block }: { block: Block }) {
  const dark = block.background === "dark";
  const columns: string[] = block.columns || [];
  const rows: Block[] = block.rows || [];
  return (
    <Section block={block}>
      <Reveal className={`overflow-hidden rounded-md ring-1 ${dark ? "ring-white/10" : "ring-line shadow-card"}`}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-left">
            <thead>
              <tr className="bg-navy-900 text-white">
                {columns.map((c, i) => (
                  <th key={i} scope="col" className={`px-5 py-4 text-xs font-semibold uppercase tracking-[0.1em] ${i === 0 ? "sticky left-0 bg-navy-900" : ""}`}>
                    {c}
                  </th>
                ))}
                <th className="px-5 py-4" aria-label="Link" />
              </tr>
            </thead>
            <tbody className={dark ? "text-steel-300" : "text-steel-600"}>
              {rows.map((r, ri) => (
                <tr key={r._key} className={`border-t transition-colors ${dark ? "border-white/10 hover:bg-white/5" : "border-line hover:bg-accent-50/60"} ${ri % 2 && !dark ? "bg-surface/60" : dark ? "" : "bg-white"}`}>
                  {(r.cells || []).map((cell: string, ci: number) => (
                    <td key={ci} className={`px-5 py-4 ${ci === 0 ? `sticky left-0 font-semibold ${dark ? "bg-navy-900 text-white" : "bg-inherit text-ink"}` : "tabular-nums"}`}>
                      {cell}
                    </td>
                  ))}
                  <td className="px-5 py-4 text-right">
                    {r.href && r.href !== "/products/" && (
                      <Link href={r.href} className="inline-flex items-center gap-1 text-sm font-semibold text-accent hover:underline">
                        Details <ArrowRight className="size-3.5" />
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Reveal>
      {block.note && <p className={`mt-4 text-sm ${dark ? "text-steel-400" : "text-steel-500"}`}>{block.note}</p>}
    </Section>
  );
}

export function Certifications({ block }: { block: Block }) {
  const certs: Block[] = block.certificates || [];
  const dark = block.background === "dark";

  if (block.layout === "cards") {
    return (
      <Section block={block}>
        <div className={`grid gap-6 sm:grid-cols-2 ${certs.length % 4 === 0 ? "xl:grid-cols-4" : "lg:grid-cols-3"}`}>
          {certs.map((c, i) => (
            <Reveal key={c._id} delay={(i % 3) * 80} className="flex flex-col rounded-md bg-white p-7 shadow-card ring-1 ring-line">
              <div className="flex items-start justify-between gap-4">
                <div className="grid size-16 shrink-0 place-items-center overflow-hidden rounded-md bg-surface">
                  {c.logo?.asset ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={urlFor(c.logo).height(128).url()} alt="" className="max-h-12 w-auto" />
                  ) : (
                    <BadgeCheck className="size-8 text-accent" strokeWidth={1.5} />
                  )}
                </div>
                {c.validity && <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">{c.validity}</span>}
              </div>
              <h3 className="mt-6 text-lg font-bold text-ink">{c.title}</h3>
              {c.issuer && <p className="mt-1 text-sm font-medium text-steel-500">{c.issuer}</p>}
              {c.description && <p className="mt-3 flex-1 text-[0.95rem] leading-relaxed text-steel-600">{c.description}</p>}
              {c.fileUrl ? (
                <a href={`${c.fileUrl}?dl=`} className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-accent hover:underline">
                  <Download className="size-4" /> Download certificate (PDF)
                </a>
              ) : (
                <Link href="/contact" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-steel-500 hover:text-accent">
                  Request a copy <ArrowRight className="size-4" />
                </Link>
              )}
            </Reveal>
          ))}
        </div>
      </Section>
    );
  }

  return (
    <section id={block.sectionId || undefined} className={`${dark ? "bg-navy-900" : block.background === "light" ? "bg-surface" : "bg-white"} border-y ${dark ? "border-white/10" : "border-line"}`}>
      <div className="wrap grid items-center gap-8 py-12 lg:grid-cols-[260px_1fr] lg:gap-12">
        <div>
          {block.eyebrow && <p className="eyebrow">{block.eyebrow}</p>}
          {block.heading && <h2 className={`mt-2 text-2xl font-bold ${dark ? "text-white" : "text-ink"}`}>{block.heading}</h2>}
        </div>
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {certs.map((c) => (
            <li key={c._id} className={`flex items-center gap-3 rounded-md px-4 py-4 ring-1 ${dark ? "ring-white/10" : "bg-white ring-line"}`}>
              {c.logo?.asset ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={urlFor(c.logo).height(96).url()} alt="" className="h-10 w-auto" />
              ) : (
                <BadgeCheck className="size-8 shrink-0 text-accent" strokeWidth={1.5} />
              )}
              <span className={`text-sm font-semibold leading-tight ${dark ? "text-white" : "text-ink"}`}>{c.title}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function LogoCloud({ clients }: { clients: Block[] }) {
  if (!clients.length) return null;
  const logo = (c: Block) =>
    c.logo?.asset ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={urlFor(c.logo).height(120).url()} alt={c.name} className="max-h-12 w-auto object-contain opacity-70 grayscale transition hover:opacity-100 hover:grayscale-0" />
    ) : (
      <span className="text-center font-display text-lg font-bold text-steel-500">{c.name}</span>
    );
  if (clients.length < 5) {
    return (
      <ul className="flex flex-wrap justify-center gap-4 sm:justify-start">
        {clients.map((c) => (
          <li key={c._id} className="grid h-24 w-full place-items-center rounded-md bg-white px-6 ring-1 ring-line sm:w-56">
            {logo(c)}
          </li>
        ))}
      </ul>
    );
  }
  const loop = [...clients, ...clients];
  return (
    <div className="relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
      <ul className="flex w-max animate-marquee items-center gap-6 hover:[animation-play-state:paused]">
        {loop.map((c, i) => (
          <li key={`${c._id}-${i}`} className="grid h-24 w-52 place-items-center rounded-md bg-white px-6 ring-1 ring-line">
            {c.logo?.asset ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={urlFor(c.logo).height(120).url()} alt={c.name} className="max-h-12 w-auto object-contain opacity-70 grayscale transition hover:opacity-100 hover:grayscale-0" />
            ) : (
              <span className="font-display text-lg font-bold text-steel-500">{c.name}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ProjectCard({ p, index = 0 }: { p: Block; index?: number }) {
  const inner = (
    <>
      <div className="relative aspect-[4/3] overflow-hidden bg-navy-800">
        {p.mainImage?.asset && (
          <SanityImg image={p.mainImage} fill sizes="(min-width:1024px) 33vw, 100vw" className="object-cover transition duration-700 group-hover:scale-105" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/10 to-transparent" />
        {p.filter && <span className="absolute left-4 top-4 rounded-sm bg-accent px-2.5 py-1 text-[0.7rem] font-semibold uppercase tracking-wider text-white">{p.filter}</span>}
        <h3 className="absolute inset-x-5 bottom-4 text-xl font-bold leading-snug text-white">{p.title}</h3>
      </div>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-3 p-5 text-sm">
        {[
          ["Client", p.client],
          ["Product", p.productLabel],
          ["Quantity", p.quantity],
          ["Year", p.year],
        ]
          .filter(([, v]) => v)
          .map(([k, v]) => (
            <div key={k}>
              <dt className="text-[0.7rem] font-semibold uppercase tracking-wider text-steel-500">{k}</dt>
              <dd className="mt-0.5 font-semibold text-ink">{v}</dd>
            </div>
          ))}
      </dl>
    </>
  );
  const cls = "group block h-full overflow-hidden rounded-md bg-white shadow-card ring-1 ring-line transition-all duration-300 hover:-translate-y-1 hover:shadow-lift";
  return (
    <Reveal delay={(index % 3) * 80} className="h-full">
      {p.isCaseStudy ? (
        <Link href={`/projects/${p.slug}`} className={cls}>
          {inner}
        </Link>
      ) : (
        <div className={cls}>{inner}</div>
      )}
    </Reveal>
  );
}

export function Clients({ block }: { block: Block }) {
  const projects: Block[] = block.projects || [];
  return (
    <Section block={block}>
      <LogoCloud clients={block.clients || []} />
      {!!projects.length && (
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p, i) => (
            <ProjectCard key={p._id} p={p} index={i} />
          ))}
        </div>
      )}
    </Section>
  );
}
