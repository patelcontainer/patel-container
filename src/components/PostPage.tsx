import { notFound } from "next/navigation";
import { cache } from "react";
import Link from "next/link";
import { ArrowRight, Calendar, ChevronDown, Clock } from "lucide-react";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { PostCard } from "@/components/blocks/ListingBlocks";
import { FaqList } from "@/components/blocks/MiscBlocks";
import { Newsletter } from "@/components/forms/Newsletter";
import { RichText, blockText } from "@/components/ui/RichText";
import { SocialIcon } from "@/components/ui/SocialIcons";
import { ShareButtons } from "@/components/post/ShareButtons";
import { AiSummary } from "@/components/post/AiSummary";
import { SanityImg } from "@/components/ui/SanityImg";
import { Heading } from "@/components/ui/Heading";
import { JsonLd, WebPageJsonLd } from "@/components/seo/JsonLd";
import { client, sanityFetch } from "@/sanity/lib/client";
import { postQuery, postSlugsQuery } from "@/sanity/lib/queries";
import { ORGANIZATION_REF, absoluteUrl, buildMetadata, getSettings, getTemplates } from "@/lib/seo";
import { urlFor, hasImage } from "@/sanity/lib/image";
import { formatDate, slugify } from "@/lib/utils";
import { templateTag } from "@/lib/templates";
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

type Author = { name: string; role?: string; photo?: Block; bio?: string; linkedin?: string };

function AuthorAvatar({ author, size }: { author: Author; size: "sm" | "lg" }) {
  const cls = size === "sm" ? "size-10 text-sm" : "size-20 text-2xl";
  if (hasImage(author.photo)) {
    return <SanityImg image={author.photo} aspect={1} sizes={size === "sm" ? "40px" : "80px"} className={`${cls} shrink-0 rounded-full object-cover`} />;
  }
  return <span className={`${cls} grid shrink-0 place-items-center rounded-full bg-navy-900 font-bold text-white`} aria-hidden>{author.name.charAt(0).toUpperCase()}</span>;
}

export async function PostPage({ slug, postType }: { slug: string; postType: PostType }) {
  const p = await getPost(slug, postType);
  if (!p) notFound();
  const settings = await getSettings();
  const related: Block[] = p.related || [];
  const t = await getTemplates();

  const url = absoluteUrl(`/${postType}/${slug}`);
  const author: Author = p.authorProfile?.name
    ? p.authorProfile
    : { name: p.author || settings.siteName, bio: settings.footerText };
  const readTime = p.readTime?.trim() || (p.wordCount ? `${Math.max(1, Math.ceil(p.wordCount / 200))} min read` : "");
  const toc = ((p.body || []) as Block[])
    .filter((b) => b._type === "block" && b.style === "h2")
    .map((b) => blockText(b).trim())
    .filter(Boolean)
    .map((text) => ({ text, id: slugify(text) }));
  const faqs: Block[] = (p.faqs || []).filter((f: Block) => f.question).map((f: Block) => ({ ...f, _id: f._key }));
  if (faqs.length) toc.push({ text: t.postFaqHeading, id: "faqs" });
  const aiPrompt = t.postAiPrompt.replaceAll("{site}", settings.siteName).replaceAll("{url}", url);

  const tocList = (
    <ol className="space-y-1 border-l border-line">
      {toc.map((h) => (
        <li key={h.id}>
          <a href={`#${h.id}`} className="-ml-px block border-l-2 border-transparent py-1.5 pl-4 text-[0.95rem] leading-snug text-steel-600 transition-colors hover:border-accent hover:text-accent">
            {h.text}
          </a>
        </li>
      ))}
    </ol>
  );

  return (
    <article>
      <header className="bg-surface">
        <div className="wrap max-w-6xl py-12 lg:py-16">
          <Breadcrumbs items={[{ label: LABEL[postType], href: `/${postType}` }, { label: p.title }]} />
          <div className={`mt-8 grid items-center gap-10 ${hasImage(p.mainImage) ? "lg:grid-cols-2 xl:gap-14" : "max-w-4xl"}`}>
            <div>
              {!!p.categories?.length && (
                <div className="mb-5 flex flex-wrap gap-2">
                  {p.categories.map((c: Block) => (
                    <span key={c.slug} className="rounded-sm bg-accent px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-white">{c.title}</span>
                  ))}
                </div>
              )}
              <h1 className="text-4xl font-extrabold leading-[1.1] text-ink sm:text-5xl lg:text-[2.75rem] xl:text-5xl">{p.title}</h1>
              {p.excerpt && <p className="mt-5 text-lg leading-relaxed text-steel-600 sm:text-xl">{p.excerpt}</p>}
              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-steel-500">
                <span className="flex items-center gap-3">
                  <AuthorAvatar author={author} size="sm" />
                  <span>
                    <span className="block font-semibold text-ink">{author.name}</span>
                    {author.role && <span className="block text-xs">{author.role}</span>}
                  </span>
                </span>
                <span className="flex items-center gap-1.5"><Calendar className="size-4" /> <time dateTime={p.publishedAt}>{formatDate(p.publishedAt)}</time></span>
                {readTime && <span className="flex items-center gap-1.5"><Clock className="size-4" /> {readTime}</span>}
              </div>
              <AiSummary heading={t.postAiHeading} prompt={aiPrompt} className="mt-7 border-t border-line pt-6" />
            </div>
            {hasImage(p.mainImage) && (
              <div className="overflow-hidden rounded-md shadow-lift">
                <SanityImg image={p.mainImage} aspect={16 / 10} priority sizes="(min-width:1280px) 560px, (min-width:1024px) 50vw, 100vw" className="w-full" />
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="wrap max-w-6xl py-14 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-[260px_minmax(0,1fr)] xl:gap-16">
          <aside className="hidden lg:block">
            <div className="sticky top-28 space-y-10">
              {!!toc.length && (
                <nav aria-label={t.postTocHeading}>
                  <Heading as={templateTag(t, "postTocTag")} className="mb-4 text-xs font-semibold uppercase tracking-wider text-steel-500">{t.postTocHeading}</Heading>
                  {tocList}
                </nav>
              )}
              <ShareButtons title={p.title} url={url} label={t.postShareLabel} />
            </div>
          </aside>

          <div className="min-w-0 max-w-3xl">
            {!!toc.length && (
              <details className="group mb-8 rounded-md ring-1 ring-line lg:hidden">
                <summary className="flex cursor-pointer list-none items-center justify-between p-5 font-semibold text-ink">
                  {t.postTocHeading}
                  <ChevronDown className="size-5 transition-transform group-open:rotate-180" />
                </summary>
                <nav aria-label={t.postTocHeading} className="px-5 pb-5">{tocList}</nav>
              </details>
            )}
            <RichText value={p.body} className="text-[1.1rem]" />

            {!!faqs.length && (
              <section id="faqs" className="mt-14" aria-label={t.postFaqHeading}>
                <Heading as={templateTag(t, "postFaqTag")} className="mb-6 text-[1.75rem] font-bold leading-tight text-ink">{t.postFaqHeading}</Heading>
                <FaqList faqs={faqs} />
              </section>
            )}

            <div className="mt-12 border-t border-line pt-8 lg:hidden">
              <ShareButtons title={p.title} url={url} label={t.postShareLabel} />
            </div>

            <section className="mt-12 rounded-md bg-surface p-6 ring-1 ring-line sm:p-8" aria-label={t.postAuthorHeading}>
              <p className="text-xs font-semibold uppercase tracking-wider text-steel-500">{t.postAuthorHeading}</p>
              <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-start">
                <AuthorAvatar author={author} size="lg" />
                <div>
                  <Heading as={templateTag(t, "postAuthorTag")} className="text-xl font-bold text-ink">{author.name}</Heading>
                  {author.role && <p className="mt-0.5 text-sm font-medium text-accent">{author.role}</p>}
                  {author.bio && <p className="mt-3 leading-relaxed text-steel-600">{author.bio}</p>}
                  {author.linkedin && (
                    <a href={author.linkedin} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-accent hover:underline">
                      <SocialIcon platform="linkedin" className="size-4" /> LinkedIn
                    </a>
                  )}
                </div>
              </div>
            </section>

            <div className="mt-12 flex flex-col gap-6 rounded-md bg-navy-900 p-8 sm:p-10">
              <div>
                <Heading as={templateTag(t, "postNewsletterTag")} className="text-2xl font-bold text-white">{settings.newsletterHeading || "Get new articles by email"}</Heading>
                {settings.newsletterText && <p className="mt-2 text-steel-300">{settings.newsletterText}</p>}
              </div>
              <Newsletter />
            </div>
          </div>
        </div>
      </div>

      {!!related.length && (
        <section className="section bg-surface">
          <div className="wrap">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <Heading as={templateTag(t, "postRelatedTag")} className="text-3xl font-bold text-ink">{t.postRelatedHeading}</Heading>
              <Link href={`/${postType}`} className="inline-flex items-center gap-1.5 font-semibold text-accent hover:underline">
                {t.postSeeAllLabel} <ArrowRight className="size-4" />
              </Link>
            </div>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((r, i) => <PostCard key={r._id} p={r} index={i} headingAs={templateTag(t, "postRelatedItemTag")} />)}
            </div>
          </div>
        </section>
      )}

      <WebPageJsonLd seo={p.seo} title={p.title} description={p.excerpt} image={p.mainImage} path={`/${postType}/${slug}`} type="article" createdAt={p.publishedAt || p._createdAt} updatedAt={p._updatedAt} />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": postType === "news" ? "NewsArticle" : "BlogPosting",
          headline: p.title,
          description: p.excerpt,
          image: hasImage(p.mainImage) ? urlFor(p.mainImage).width(1200).url() : undefined,
          url,
          author: !p.authorProfile?.name && !p.author ? ORGANIZATION_REF : {
            "@type": "Person",
            name: author.name,
            ...(author.linkedin ? { url: author.linkedin } : {}),
            ...(hasImage(author.photo) ? { image: urlFor(author.photo).width(400).height(400).url() } : {}),
            ...(author.role ? { jobTitle: author.role } : {}),
          },
          publisher: ORGANIZATION_REF,
          datePublished: p.publishedAt,
          dateModified: p._updatedAt,
          mainEntityOfPage: { "@type": "WebPage", "@id": url },
        }}
      />
    </article>
  );
}
