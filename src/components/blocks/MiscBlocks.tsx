import Link from "next/link";
import { ArrowUpRight, Check, Mail, Phone, Plus, Quote, ShieldCheck } from "lucide-react";
import { Section } from "./Section";
import { ProjectsList, PostsList } from "./ListingBlocks";
import { SanityImg } from "@/components/ui/SanityImg";
import { RichText, blockText } from "@/components/ui/RichText";
import { Reveal } from "@/components/ui/Reveal";
import { Icon } from "@/components/ui/Icon";
import { CmsButtons } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Heading } from "@/components/ui/Heading";
import { headingTag } from "@/lib/headings";
import { LeadForm, type LeadFormType } from "@/components/forms/LeadForm";
import { Newsletter } from "@/components/forms/Newsletter";
import { JsonLd } from "@/components/seo/JsonLd";
import { WhatsAppIcon, SocialIcon } from "@/components/ui/SocialIcons";
import { getSettings } from "@/lib/seo";
import { telHref, whatsappHref, linkHref } from "@/lib/links";
import { bgClass } from "@/lib/utils";
import type { Block } from "@/lib/types";
import type { PortableTextBlock } from "@portabletext/types";

export function ProjectsBlock({ block }: { block: Block }) {
  return (
    <Section block={block}>
      <ProjectsList projects={block.projects || []} showFilters={block.showFilters} headingAs={headingTag(block.itemHeadingTag, "h3")} />
    </Section>
  );
}

export function PostsBlock({ block }: { block: Block }) {
  const full = block.mode === "full";
  const href = block.postType === "news" ? "/news" : "/blog";
  return (
    <Section
      block={block}
      headingAside={
        !full && !block.buttons?.length ? (
          <Link href={href} className="inline-flex shrink-0 items-center gap-1.5 font-semibold text-accent hover:underline">
            View all <ArrowUpRight className="size-4" />
          </Link>
        ) : undefined
      }
    >
      <PostsList posts={block.posts || []} full={full} headingAs={headingTag(block.itemHeadingTag, "h3")} featuredHeadingAs={headingTag(block.featuredHeadingTag, "h3")} />
    </Section>
  );
}

const TOPIC_ORDER = ["Products", "Ordering", "Shipping and export", "Quality"];

export function FaqList({ faqs, grouped }: { faqs: Block[]; grouped?: boolean }) {
  const item = (f: Block) => (
    <details key={f._id} className="group border-b border-line">
      <summary className="flex items-start justify-between gap-6 py-5 text-left">
        <span className="text-[1.05rem] font-semibold text-ink transition group-hover:text-accent">{f.question}</span>
        <span className="acc-icon mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-surface text-accent transition-transform duration-300">
          <Plus className="size-4" />
        </span>
      </summary>
      <RichText value={f.answer} className="pb-6 pr-10 text-[0.98rem]" />
    </details>
  );

  const schema = (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqs.map((f) => ({
          "@type": "Question",
          name: f.question,
          acceptedAnswer: { "@type": "Answer", text: (f.answer || []).map((b: PortableTextBlock) => blockText(b)).join(" ") },
        })),
      }}
    />
  );

  if (!grouped) return <div className="border-t border-line">{faqs.map(item)}{schema}</div>;

  const topics = TOPIC_ORDER.filter((t) => faqs.some((f) => f.topic === t)).concat(
    [...new Set(faqs.map((f) => f.topic))].filter((t) => t && !TOPIC_ORDER.includes(t)),
  );
  return (
    <div className="grid gap-12 lg:grid-cols-[240px_1fr]">
      <nav className="hidden lg:block" aria-label="FAQ topics">
        <ul className="sticky top-32 space-y-1 border-l border-line">
          {topics.map((t) => (
            <li key={t}>
              <a href={`#faq-${t.toLowerCase().replace(/\W+/g, "-")}`} className="-ml-px block border-l-2 border-transparent py-2 pl-4 text-sm font-medium text-steel-600 transition hover:border-accent hover:text-ink">
                {t}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <div className="space-y-14">
        {topics.map((t) => (
          <div key={t} id={`faq-${t.toLowerCase().replace(/\W+/g, "-")}`}>
            <h2 className="mb-4 text-2xl font-bold text-ink">{t}</h2>
            <div className="border-t border-line">{faqs.filter((f) => f.topic === t).map(item)}</div>
          </div>
        ))}
      </div>
      {schema}
    </div>
  );
}

export function FaqBlock({ block }: { block: Block }) {
  const faqs: Block[] = block.faqs || [];
  if (block.grouped) {
    return (
      <Section block={block}>
        <FaqList faqs={faqs} grouped />
      </Section>
    );
  }
  return (
    <section id={block.sectionId || undefined} className={`section ${bgClass(block.background)}`}>
      <div className="wrap grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
        <div>
          <SectionHeading as={headingTag(block.headingTag)} eyebrow={block.eyebrow} heading={block.heading} intro={block.intro} />
          <CmsButtons buttons={block.buttons} className="mt-8" />
        </div>
        <Reveal>
          <FaqList faqs={faqs} />
        </Reveal>
      </div>
    </section>
  );
}

export async function FormBlock({ block }: { block: Block }) {
  const settings = await getSettings();
  const dark = block.background === "dark";
  const wa = whatsappHref(settings.whatsappNumber, settings.whatsappMessage);
  const points: Block[] = block.points || [];

  return (
    <section id={block.sectionId || "enquiry"} className={`section relative overflow-hidden ${bgClass(block.background)} ${dark ? "corrugated" : ""}`}>
      <div className="wrap grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
        <div>
          <SectionHeading as={headingTag(block.headingTag)} eyebrow={block.eyebrow} heading={block.heading} intro={block.intro} dark={dark} />
          {!!points.length && (
            <ul className="mt-10 space-y-5">
              {points.map((p) => (
                <li key={p._key} className="flex gap-4">
                  <span className={`grid size-11 shrink-0 place-items-center rounded-md ${dark ? "bg-white/5 text-accent" : "bg-accent-50 text-accent"}`}>
                    <Icon name={p.icon} className="size-5" />
                  </span>
                  <div>
                    <p className={`font-semibold ${dark ? "text-white" : "text-ink"}`}>{p.title}</p>
                    {p.text && <p className={`mt-0.5 text-sm ${dark ? "text-steel-400" : "text-steel-600"}`}>{p.text}</p>}
                  </div>
                </li>
              ))}
            </ul>
          )}
          {block.showContactDetails !== false && (
            <div className={`mt-10 space-y-3 border-t pt-8 ${dark ? "border-white/10" : "border-line"}`}>
              {(settings.phones || []).slice(0, 2).map((p) => (
                <a key={p} href={telHref(p)} className={`flex items-center gap-3 font-semibold ${dark ? "text-white" : "text-ink"} hover:text-accent`}>
                  <Phone className="size-4 text-accent" /> {p}
                </a>
              ))}
              {settings.email && (
                <a href={`mailto:${settings.email}`} className={`flex items-center gap-3 font-semibold ${dark ? "text-white" : "text-ink"} hover:text-accent`}>
                  <Mail className="size-4 text-accent" /> {settings.email}
                </a>
              )}
              {wa && (
                <a href={wa} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex h-12 items-center gap-2 rounded-md bg-whatsapp-700 px-5 text-sm font-semibold text-white transition hover:bg-[#116b36]">
                  <WhatsAppIcon className="size-5" /> Chat on WhatsApp
                </a>
              )}
            </div>
          )}
        </div>
        <Reveal delay={100} className="min-w-0">
          <div className="relative min-w-0 rounded-lg bg-white p-6 shadow-lift ring-1 ring-line sm:p-10">
            <div className="hazard absolute inset-x-0 top-0 h-1.5 rounded-t-lg" />
            <LeadForm
              type={(block.formType || "enquiry") as LeadFormType}
              submitLabel={block.submitLabel}
              productOptions={block.productOptions}
              jobOptions={block.jobOptions}
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function CtaBlock({ block }: { block: Block }) {
  return (
    <section id={block.sectionId || undefined} className="relative isolate overflow-hidden bg-navy-900">
      {block.image?.asset && (
        <div className="absolute inset-0 -z-10">
          <SanityImg image={block.image} fill sizes="100vw" className="object-cover opacity-25" />
        </div>
      )}
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-navy-950 via-navy-900/95 to-navy-900/60" />
      <div className="corrugated absolute inset-0 -z-10" />
      <div className="absolute left-0 top-0 h-full w-1.5 bg-accent" />
      <div className="wrap flex flex-col gap-8 py-16 lg:flex-row lg:items-center lg:justify-between lg:py-20">
        <Reveal className="max-w-2xl">
          {block.eyebrow && <p className="eyebrow">{block.eyebrow}</p>}
          <Heading as={headingTag(block.headingTag)} className="mt-3 text-3xl font-bold leading-tight text-white sm:text-4xl">{block.heading}</Heading>
          {block.text && <p className="mt-4 text-lg text-steel-300">{block.text}</p>}
        </Reveal>
        <CmsButtons buttons={block.buttons} dark size="lg" className="shrink-0" />
      </div>
    </section>
  );
}

export function TimelineBlock({ block }: { block: Block }) {
  const dark = block.background === "dark";
  const items: Block[] = block.items || [];
  return (
    <Section block={block} align="center">
      <ol className="relative mx-auto max-w-5xl">
        <span className={`absolute bottom-0 left-[19px] top-0 w-px md:left-1/2 ${dark ? "bg-white/15" : "bg-line"}`} aria-hidden />
        {items.map((it, i) => {
          const right = i % 2 === 1;
          return (
            <li key={it._key} className="relative grid gap-4 pb-12 pl-14 last:pb-0 md:grid-cols-2 md:gap-16 md:pl-0">
              <span className="absolute left-2.5 top-1.5 grid size-5 place-items-center rounded-full bg-accent ring-[6px] ring-accent/15 md:left-1/2 md:-translate-x-1/2" aria-hidden>
                <span className="size-1.5 rounded-full bg-white" />
              </span>
              <Reveal className={`${right ? "md:col-start-2" : "md:text-right"}`}>
                <span className="font-display text-4xl font-extrabold text-accent">{it.year}</span>
                <Heading as={headingTag(block.itemHeadingTag, "h3")} className={`mt-2 text-xl font-bold ${dark ? "text-white" : "text-ink"}`}>{it.title}</Heading>
                {it.text && <p className={`mt-2 leading-relaxed ${dark ? "text-steel-400" : "text-steel-600"}`}>{it.text}</p>}
                {it.image?.asset && (
                  <div className="mt-4 overflow-hidden rounded-md">
                    <SanityImg image={it.image} aspect={16 / 9} sizes="(min-width:768px) 40vw, 100vw" className="w-full" />
                  </div>
                )}
              </Reveal>
            </li>
          );
        })}
      </ol>
    </Section>
  );
}

export function TeamBlock({ block }: { block: Block }) {
  const members: Block[] = block.members || [];
  // Hidden until team profiles are added in the CMS.
  if (!members.length) return null;
  return (
    <Section block={block}>
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {members.map((m, i) => (
          <Reveal key={m._id} delay={(i % 4) * 70} className="group overflow-hidden rounded-md bg-white shadow-card ring-1 ring-line">
            <div className="relative aspect-[4/5] overflow-hidden bg-surface-2">
              {m.photo?.asset ? (
                <SanityImg image={m.photo} fill sizes="(min-width:1024px) 25vw, 50vw" className="object-cover grayscale transition duration-500 group-hover:grayscale-0" />
              ) : (
                <div className="corrugated-dark grid size-full place-items-center font-display text-6xl font-extrabold text-steel-300">
                  {m.name?.split(" ").map((w: string) => w[0]).slice(0, 2).join("")}
                </div>
              )}
              {m.linkedin && (
                <a href={m.linkedin} target="_blank" rel="noopener noreferrer" aria-label={`${m.name} on LinkedIn`} className="absolute bottom-3 right-3 grid size-9 place-items-center rounded bg-white text-ink transition hover:bg-accent hover:text-white">
                  <SocialIcon platform="linkedin" className="size-4" />
                </a>
              )}
            </div>
            <div className="p-5">
              <Heading as={headingTag(block.itemHeadingTag, "h3")} className="text-lg font-bold text-ink">{m.name}</Heading>
              {m.role && <p className="text-sm font-semibold text-accent">{m.role}</p>}
              {m.bio && <p className="mt-2 text-sm leading-relaxed text-steel-600">{m.bio}</p>}
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

export function MessageBlock({ block }: { block: Block }) {
  const dark = block.background === "dark";
  return (
    <section id={block.sectionId || undefined} className={`section ${bgClass(block.background)} ${dark ? "corrugated" : ""}`}>
      <div className="wrap grid items-center gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
        <Reveal className="relative mx-auto w-full max-w-md">
          <div className="absolute -bottom-4 -left-4 size-40 bg-accent" />
          <div className="relative aspect-[4/5] overflow-hidden rounded-md bg-surface-2 shadow-lift">
            {block.photo?.asset ? (
              <SanityImg image={block.photo} fill sizes="(min-width:1024px) 35vw, 100vw" className="object-cover" />
            ) : (
              <div className="corrugated-dark grid size-full place-items-center">
                <Quote className="size-20 text-steel-300" />
              </div>
            )}
          </div>
        </Reveal>
        <div>
          <SectionHeading as={headingTag(block.headingTag)} eyebrow={block.eyebrow} heading={block.heading} dark={dark} />
          <Reveal delay={100}>
            <Quote className="mt-8 size-12 fill-accent text-accent" />
            <RichText value={block.message} dark={dark} className="mt-4 text-lg" />
            {block.name && (
              <div className={`mt-8 border-l-2 border-accent pl-5`}>
                <p className={`font-display text-xl font-bold ${dark ? "text-white" : "text-ink"}`}>{block.name}</p>
                {block.role && <p className={dark ? "text-steel-400" : "text-steel-500"}>{block.role}</p>}
              </div>
            )}
          </Reveal>
        </div>
      </div>
    </section>
  );
}

export function ProcessBlock({ block }: { block: Block }) {
  const dark = block.background === "dark";
  const steps: Block[] = block.steps || [];
  return (
    <Section block={block}>
      <ol className="grid gap-px overflow-hidden rounded-md sm:grid-cols-2 xl:grid-cols-4">
        {steps.map((s, i) => (
          <Reveal
            as="li"
            key={s._key}
            delay={(i % 4) * 70}
            className={`group relative flex flex-col p-7 ring-1 ${dark ? "bg-navy-800/60 ring-white/10" : "bg-white ring-line"}`}
          >
            <div className="flex items-center justify-between">
              <span className="font-display text-5xl font-extrabold text-accent">{String(i + 1).padStart(2, "0")}</span>
              {i < steps.length - 1 && <span className={`hidden h-px flex-1 ml-4 lg:block ${dark ? "bg-white/15" : "bg-line"}`} />}
            </div>
            {s.image?.asset && (
              <div className="mt-5 overflow-hidden rounded">
                <SanityImg image={s.image} aspect={16 / 10} sizes="(min-width:1024px) 25vw, 50vw" className="w-full" />
              </div>
            )}
            <Heading as={headingTag(block.itemHeadingTag, "h3")} className={`mt-5 text-lg font-bold ${dark ? "text-white" : "text-ink"}`}>{s.title}</Heading>
            {s.text && <p className={`mt-2 flex-1 text-[0.95rem] leading-relaxed ${dark ? "text-steel-400" : "text-steel-600"}`}>{s.text}</p>}
            {s.qualityCheck && (
              <p className={`mt-5 flex items-start gap-2 rounded px-3 py-2 text-xs font-semibold ${dark ? "bg-white/5 text-steel-300" : "bg-green-50 text-green-800"}`}>
                <ShieldCheck className="size-4 shrink-0" /> QC: {s.qualityCheck}
              </p>
            )}
          </Reveal>
        ))}
      </ol>
      {block.note && (
        <p className={`mt-8 flex items-center gap-2 text-sm font-medium ${dark ? "text-steel-300" : "text-steel-600"}`}>
          <Check className="size-4 text-accent" /> {block.note}
        </p>
      )}
    </Section>
  );
}

export function NewsletterBlock({ block }: { block: Block }) {
  const dark = block.background === "dark";
  return (
    <section id={block.sectionId || undefined} className={`newsletter-block ${bgClass(block.background)} ${dark ? "corrugated" : ""}`}>
      <div className="wrap py-14 lg:py-16">
        <div className={`grid items-center gap-8 rounded-lg p-6 sm:p-10 lg:grid-cols-[1fr_auto] lg:gap-12 [&>*]:min-w-0 ${dark ? "bg-white/5 ring-1 ring-white/10" : "bg-white shadow-card ring-1 ring-line"}`}>
          <SectionHeading as={headingTag(block.headingTag)} eyebrow={block.eyebrow} heading={block.heading} intro={block.intro} dark={dark} />
          <Newsletter light={!dark} />
        </div>
      </div>
    </section>
  );
}

export function LinkCardsBlock({ block }: { block: Block }) {
  const cards: Block[] = block.cards || [];
  return (
    <Section block={block}>
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((c, i) => (
          <Reveal key={c._key} delay={(i % 4) * 70}>
            <Link href={linkHref(c.link)} className="group relative flex h-full min-h-[300px] flex-col justify-end overflow-hidden rounded-md bg-navy-900 p-6 text-white">
              {c.image?.asset && <SanityImg image={c.image} fill sizes="(min-width:1024px) 25vw, 50vw" className="object-cover opacity-50 transition duration-700 group-hover:scale-105 group-hover:opacity-40" />}
              <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/40 to-transparent" />
              <div className="relative">
                <Heading as={headingTag(block.itemHeadingTag, "h3")} className="text-xl font-bold">{c.title}</Heading>
                {c.text && <p className="mt-2 text-sm text-steel-300">{c.text}</p>}
                <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-accent">
                  {c.link?.label || "Explore"} <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </span>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

export function BadgesBlock({ block }: { block: Block }) {
  const dark = block.background === "dark";
  const items: Block[] = block.items || [];
  return (
    <Section block={block} align="center">
      <ul className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {items.map((it) => (
          <li key={it._key} className={`flex flex-col items-center gap-3 rounded-md px-4 py-7 text-center ring-1 ${dark ? "ring-white/10" : "bg-white ring-line"}`}>
            <Icon name={it.icon} className="size-9 text-accent" />
            <span className={`text-sm font-semibold leading-snug ${dark ? "text-white" : "text-ink"}`}>{it.title}</span>
          </li>
        ))}
      </ul>
    </Section>
  );
}
