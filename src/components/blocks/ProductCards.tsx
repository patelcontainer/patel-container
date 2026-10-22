import Link from "next/link";
import { ArrowUpRight, Boxes } from "lucide-react";
import { SanityImg } from "@/components/ui/SanityImg";
import { Reveal } from "@/components/ui/Reveal";
import { Icon } from "@/components/ui/Icon";
import type { Block } from "@/lib/types";

export function CategoryCard({ c, index }: { c: Block; index: number }) {
  return (
    <Reveal delay={(index % 3) * 80}>
      <Link
        href={`/products/category/${c.slug}`}
        className="group relative flex h-full flex-col overflow-hidden rounded-md bg-white shadow-card ring-1 ring-line transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
      >
        <div className="relative aspect-[16/11] overflow-hidden bg-navy-800">
          {c.image?.asset ? (
            <SanityImg image={c.image} fill sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw" className="object-cover transition duration-700 group-hover:scale-105" />
          ) : (
            <div className="corrugated grid size-full place-items-center bg-gradient-to-br from-navy-800 to-navy-950">
              <span className="grid size-24 place-items-center rounded-full border border-white/10 bg-white/5 text-accent transition duration-500 group-hover:scale-110">
                <Icon name={c.icon || "boxes"} className="size-11" strokeWidth={1.3} />
              </span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent" />
          <span className="absolute left-5 top-5 font-display text-sm font-bold tracking-wider text-white/90">{String(index + 1).padStart(2, "0")}</span>
          <span className="absolute bottom-0 right-0 grid size-14 place-items-center bg-accent text-white transition-all duration-300 group-hover:size-16">
            <ArrowUpRight className="size-5 transition-transform duration-300 group-hover:rotate-45" />
          </span>
        </div>
        <div className="flex flex-1 flex-col p-6">
          <h3 className="text-xl font-bold text-ink transition-colors group-hover:text-accent">{c.title}</h3>
          {c.shortDescription && <p className="mt-2 flex-1 leading-relaxed text-steel-600">{c.shortDescription}</p>}
          {c.productCount > 0 && (
            <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-steel-500">
              {c.productCount} product{c.productCount > 1 ? "s" : ""}
            </p>
          )}
        </div>
      </Link>
    </Reveal>
  );
}

export function ProductCard({ p, index = 0 }: { p: Block; index?: number }) {
  const specs: Block[] = (p.keySpecs || []).slice(0, 3);
  return (
    <Reveal delay={(index % 3) * 80}>
      <Link
        href={`/products/${p.slug}`}
        className="group flex h-full flex-col overflow-hidden rounded-md bg-white shadow-card ring-1 ring-line transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
      >
        <div className="relative aspect-[4/3] overflow-hidden bg-surface">
          {p.mainImage?.asset ? (
            <SanityImg image={p.mainImage} fill sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw" className="object-cover transition duration-700 group-hover:scale-105" />
          ) : (
            <div className="corrugated-dark grid size-full place-items-center">
              <Boxes className="size-16 text-steel-300" strokeWidth={1} />
            </div>
          )}
          {p.category && (
            <span className="absolute left-4 top-4 rounded-sm bg-white/95 px-2.5 py-1 text-[0.7rem] font-semibold uppercase tracking-wider text-ink">
              {p.category}
            </span>
          )}
        </div>
        <div className="flex flex-1 flex-col p-6">
          <h3 className="text-xl font-bold text-ink transition-colors group-hover:text-accent">{p.title}</h3>
          {p.shortDescription && <p className="mt-2 line-clamp-2 text-[0.95rem] leading-relaxed text-steel-600">{p.shortDescription}</p>}
          {!!specs.length && (
            <dl className="mt-5 grid grid-cols-3 divide-x divide-line rounded-sm border border-line bg-surface text-center">
              {specs.map((s) => (
                <div key={s._key} className="px-2 py-2.5">
                  <dt className="text-[0.65rem] font-semibold uppercase tracking-wider text-steel-500">{s.label}</dt>
                  <dd className="mt-0.5 text-sm font-bold text-ink">{s.value}</dd>
                </div>
              ))}
            </dl>
          )}
          <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-accent">
            View specifications <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </span>
        </div>
      </Link>
    </Reveal>
  );
}
