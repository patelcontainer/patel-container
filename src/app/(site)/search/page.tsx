import Link from "next/link";
import type { Metadata } from "next";
import { ArrowUpRight, Search } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { client } from "@/sanity/lib/client";
import { searchQuery } from "@/sanity/lib/queries";
import { docHref } from "@/lib/links";

export const metadata: Metadata = { title: "Search", robots: { index: false } };

type Result = { _type: string; title: string; slug: string; postType?: string; text?: string };
const TYPE_LABEL: Record<string, string> = { page: "Page", product: "Product", productCategory: "Category", industry: "Industry", project: "Project", post: "Article" };

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const q = ((await searchParams).q || "").trim().slice(0, 80);
  const results = q ? await client.fetch<Result[]>(searchQuery, { q: `${q}*` }) : [];

  return (
    <>
      <PageHeader heading="Search" crumbs={[{ label: "Search" }]}>
        <form action="/search" className="mt-8 flex max-w-xl rounded-md bg-white p-1.5">
          <label htmlFor="q" className="sr-only">Search the site</label>
          <input id="q" name="q" defaultValue={q} placeholder="Search products, pages, articles…" className="min-w-0 flex-1 px-3 text-ink outline-none" />
          <button className="inline-flex h-11 items-center gap-2 rounded bg-accent px-5 text-sm font-semibold text-white"><Search className="size-4" /> Search</button>
        </form>
      </PageHeader>
      <section className="section">
        <div className="wrap max-w-3xl">
          {q && <p className="mb-6 text-steel-500">{results.length} result{results.length === 1 ? "" : "s"} for “{q}”</p>}
          <ul className="divide-y divide-line">
            {results.map((r) => (
              <li key={`${r._type}-${r.slug}`}>
                <Link href={docHref(r)} className="group flex items-start justify-between gap-6 py-5">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-accent">{TYPE_LABEL[r._type]}</span>
                    <h2 className="mt-1 text-lg font-bold text-ink group-hover:text-accent">{r.title}</h2>
                    {r.text && <p className="mt-1 line-clamp-2 text-steel-600">{r.text}</p>}
                  </div>
                  <ArrowUpRight className="mt-6 size-5 shrink-0 text-steel-400 group-hover:text-accent" />
                </Link>
              </li>
            ))}
          </ul>
          {q && !results.length && (
            <p className="text-steel-600">
              Nothing matched. Try a broader term, browse <Link href="/products" className="font-semibold text-accent">our products</Link> or <Link href="/contact" className="font-semibold text-accent">contact us</Link>.
            </p>
          )}
        </div>
      </section>
    </>
  );
}
