"use client";

import Link from "next/link";
import { ArrowUpRight, Calendar } from "lucide-react";
import { FilterGrid } from "./FilterGrid";
import { ProjectCard } from "./CatalogBlocks";
import { SanityImg } from "@/components/ui/SanityImg";
import { Reveal } from "@/components/ui/Reveal";
import { formatDate } from "@/lib/utils";
import type { Block } from "@/lib/types";

const projectGroups = (p: Block) => [p.filter].filter(Boolean);
const postGroups = (p: Block) => (p.categories || []).map((c: Block) => c.title);

export function ProjectsList({ projects, showFilters }: { projects: Block[]; showFilters?: boolean }) {
  return (
    <FilterGrid
      items={projects}
      getGroups={showFilters === false ? () => [] : projectGroups}
      order={["Containers", "Rail", "EV", "Engineering"]}
      render={(p, i) => <ProjectCard key={p._id} p={p} index={i} />}
      empty="Projects will be published here soon."
    />
  );
}

export function PostCard({ p, index = 0, large }: { p: Block; index?: number; large?: boolean }) {
  const href = `/${p.postType === "news" ? "news" : "blog"}/${p.slug}`;
  return (
    <Reveal delay={(index % 3) * 80} className="h-full">
      <Link href={href} className={`group flex h-full flex-col overflow-hidden rounded-md bg-white shadow-card ring-1 ring-line transition-all duration-300 hover:-translate-y-1 hover:shadow-lift ${large ? "lg:grid lg:grid-cols-2" : ""}`}>
        <div className={`relative overflow-hidden bg-navy-800 ${large ? "aspect-[16/10] lg:aspect-auto lg:min-h-[360px]" : "aspect-[16/10]"}`}>
          {p.mainImage?.asset ? (
            <SanityImg image={p.mainImage} fill sizes={large ? "(min-width:1024px) 50vw, 100vw" : "(min-width:1024px) 33vw, 100vw"} className="object-cover transition duration-700 group-hover:scale-105" />
          ) : (
            <div className="corrugated size-full" />
          )}
          <span className={`absolute left-4 top-4 rounded-sm px-2.5 py-1 text-[0.7rem] font-semibold uppercase tracking-wider ${p.postType === "news" ? "bg-accent text-white" : "bg-white text-ink"}`}>
            {p.postType === "news" ? "News" : "Blog"}
          </span>
        </div>
        <div className={`flex flex-1 flex-col p-6 ${large ? "lg:justify-center lg:p-10" : ""}`}>
          <p className="flex items-center gap-2 text-xs font-medium text-steel-500">
            <Calendar className="size-3.5" />
            {formatDate(p.publishedAt)}
            {p.categories?.[0] && <span className="before:mr-2 before:content-['·']">{p.categories[0].title}</span>}
          </p>
          <h3 className={`mt-3 font-bold leading-snug text-ink transition-colors group-hover:text-accent ${large ? "text-2xl lg:text-3xl" : "text-lg"}`}>{p.title}</h3>
          {p.excerpt && <p className={`mt-3 text-[0.95rem] leading-relaxed text-steel-600 ${large ? "" : "line-clamp-2"}`}>{p.excerpt}</p>}
          <span className="mt-auto inline-flex items-center gap-1.5 pt-5 text-sm font-semibold text-accent">
            Read more <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </span>
        </div>
      </Link>
    </Reveal>
  );
}

export function PostsList({ posts, full }: { posts: Block[]; full?: boolean }) {
  if (!posts.length) return <p className="text-steel-500">Articles will be published here soon.</p>;
  if (!full) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts.slice(0, 3).map((p, i) => (
          <PostCard key={p._id} p={p} index={i} />
        ))}
      </div>
    );
  }
  const featured = posts.find((p) => p.featured) || posts[0];
  const rest = posts.filter((p) => p !== featured);
  return (
    <>
      <div className="mb-12">
        <PostCard p={featured} large />
      </div>
      {!!rest.length && <FilterGrid items={rest} getGroups={postGroups} render={(p, i) => <PostCard key={p._id} p={p} index={i} />} />}
    </>
  );
}
