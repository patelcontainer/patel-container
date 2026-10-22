import { notFound } from "next/navigation";
import { cache } from "react";
import Link from "next/link";
import { ArrowLeft, Calendar, User } from "lucide-react";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { PostCard } from "@/components/blocks/ListingBlocks";
import { CtaBlock } from "@/components/blocks/MiscBlocks";
import { Newsletter } from "@/components/forms/Newsletter";
import { RichText } from "@/components/ui/RichText";
import { SanityImg } from "@/components/ui/SanityImg";
import { JsonLd } from "@/components/seo/JsonLd";
import { client, sanityFetch } from "@/sanity/lib/client";
import { postQuery, postSlugsQuery } from "@/sanity/lib/queries";
import { absoluteUrl, buildMetadata, getSettings, getTemplates } from "@/lib/seo";
import { urlFor, hasImage } from "@/sanity/lib/image";
import { formatDate } from "@/lib/utils";
import type { Block } from "@/lib/types";

export type PostType = "news" | "blog";
const LABEL = { news: "News", blog: "Blog" };

const getPost = cache((slug: string, postType: PostType) =>
  sanityFetch<Block | null>({ query: postQuery, params: { slug, postType }, tags: [`post:${slug}`] }),
);

export async function postStaticParams(postType: PostType) {
  return (await client.fetch<string[]>(postSlugsQuery, { postType })).map((slug) => ({ slug }));
}

export async function postMetadata(slug: string, postType: PostType) {
  const p = await getPost(slug, postType);
  if (!p) return {};
  return buildMetadata({ seo: p.seo, title: p.title, description: p.excerpt, image: p.mainImage, path: `/${postType}/${slug}`, type: "article", publishedTime: p.publishedAt });
}

export async function PostPage({ slug, postType }: { slug: string; postType: PostType }) {
  const p = await getPost(slug, postType);
  if (!p) notFound();
  const settings = await getSettings();
  const related: Block[] = p.related || [];
  const t = await getTemplates();

  return (
    <article>
      <header className="bg-surface">
        <div className="wrap max-w-4xl py-12 lg:py-16">
          <Breadcrumbs items={[{ label: LABEL[postType], href: `/${postType}` }, { label: p.title }]} />
          <div className="mt-8 flex flex-wrap items-center gap-3 text-sm text-steel-500">
            {(p.categories || []).map((c: Block) => (
              <span key={c.slug} className="rounded-sm bg-accent px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-white">{c.title}</span>
            ))}
            <span className="flex items-center gap-1.5"><Calendar className="size-4" /> {formatDate(p.publishedAt)}</span>
            {p.author && <span className="flex items-center gap-1.5"><User className="size-4" /> {p.author}</span>}
          </div>
          <h1 className="mt-5 text-4xl font-extrabold leading-[1.1] text-ink sm:text-5xl">{p.title}</h1>
          {p.excerpt && <p className="mt-5 text-xl leading-relaxed text-steel-600">{p.excerpt}</p>}
        </div>
      </header>
      {p.mainImage?.asset && (
        <div className="wrap max-w-5xl">
          <div className="-mt-0 overflow-hidden rounded-md shadow-lift lg:mt-10">
            <SanityImg image={p.mainImage} aspect={16 / 8} priority sizes="(min-width:1024px) 1024px, 100vw" className="w-full" />
          </div>
        </div>
      )}
      <div className="wrap max-w-3xl py-14 lg:py-20">
        <RichText value={p.body} className="text-[1.1rem]" />
        <div className="mt-14 flex flex-col gap-6 rounded-md bg-navy-900 p-8 sm:p-10">
          <div>
            <h2 className="text-2xl font-bold text-white">{settings.newsletterHeading || "Get new articles by email"}</h2>
            {settings.newsletterText && <p className="mt-2 text-steel-300">{settings.newsletterText}</p>}
          </div>
          <Newsletter />
        </div>
        <Link href={`/${postType}`} className="mt-10 inline-flex items-center gap-2 font-semibold text-accent hover:underline">
          <ArrowLeft className="size-4" /> Back to {LABEL[postType].toLowerCase()}
        </Link>
      </div>

      {!!related.length && (
        <section className="section bg-surface">
          <div className="wrap">
            <h2 className="text-3xl font-bold text-ink">More from {LABEL[postType].toLowerCase()}</h2>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((r, i) => <PostCard key={r._id} p={r} index={i} />)}
            </div>
          </div>
        </section>
      )}
      <CtaBlock block={{ _type: "ctaBlock", _key: "cta", heading: t.postCtaHeading, buttons: [{ _key: "a", label: t.quoteLabel, url: "/get-a-quote", style: "primary" }, { _key: "b", label: "Browse Products", url: "/products", style: "outlineLight" }] }} />

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": postType === "news" ? "NewsArticle" : "BlogPosting",
          headline: p.title,
          description: p.excerpt,
          image: hasImage(p.mainImage) ? [urlFor(p.mainImage).width(1200).url()] : undefined,
          datePublished: p.publishedAt,
          dateModified: p._updatedAt,
          author: p.author ? { "@type": "Person", name: p.author } : { "@id": `${absoluteUrl("/")}#organization` },
          publisher: { "@id": `${absoluteUrl("/")}#organization` },
          mainEntityOfPage: absoluteUrl(`/${postType}/${slug}`),
        }}
      />
    </article>
  );
}
