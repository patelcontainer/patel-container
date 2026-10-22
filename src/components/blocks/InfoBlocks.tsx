import Link from "next/link";
import { ArrowUpRight, Briefcase, Clock, Download, FileText, Globe, Mail, MapPin, Phone, Plus } from "lucide-react";
import { Section } from "./Section";
import { ImageGrid, AlbumsGallery } from "./Gallery";
import { RichText, blockText } from "@/components/ui/RichText";
import { Reveal } from "@/components/ui/Reveal";
import { Icon } from "@/components/ui/Icon";
import { SanityImg } from "@/components/ui/SanityImg";
import { WhatsAppIcon } from "@/components/ui/SocialIcons";
import { getSettings } from "@/lib/seo";
import { formatBytes, slugify } from "@/lib/utils";
import { telHref, whatsappHref } from "@/lib/links";
import type { Block } from "@/lib/types";
import type { PortableTextBlock } from "@portabletext/types";

export function GalleryBlock({ block }: { block: Block }) {
  return (
    <Section block={block}>
      {block.source === "albums" ? <AlbumsGallery albums={block.albums || []} /> : <ImageGrid images={block.images || []} />}
    </Section>
  );
}

export function RichTextBlock({ block }: { block: Block }) {
  const content: PortableTextBlock[] = block.content || [];
  const toc = block.showToc ? content.filter((b) => b.style === "h2").map((b) => blockText(b)) : [];
  return (
    <Section block={block}>
      <div className={toc.length ? "grid gap-12 lg:grid-cols-[260px_1fr] lg:gap-16" : "mx-auto max-w-3xl"}>
        {!!toc.length && (
          <nav aria-label="On this page" className="lg:sticky lg:top-32 lg:self-start">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-steel-500">On this page</p>
            <ol className="mt-4 space-y-1 border-l border-line">
              {toc.map((t, i) => (
                <li key={i}>
                  <a href={`#${slugify(t)}`} className="-ml-px block border-l-2 border-transparent py-1.5 pl-4 text-sm text-steel-600 transition hover:border-accent hover:text-ink">
                    {t}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        )}
        <RichText value={content} dark={block.background === "dark"} className={toc.length ? "max-w-3xl" : ""} />
      </div>
    </Section>
  );
}

const GROUP_LABELS: Record<string, string> = {
  brochure: "Company Brochure",
  datasheet: "Product Datasheets",
  certificate: "Certificates",
  other: "Other Documents",
};

export function DownloadsBlock({ block }: { block: Block }) {
  const downloads: Block[] = block.downloads || [];
  const groups = Object.keys(GROUP_LABELS).filter((g) => downloads.some((d) => d.group === g));
  return (
    <Section block={block}>
      {!downloads.length && <p className="text-steel-500">Downloads will be available here soon. Need a document now? <Link href="/contact" className="font-semibold text-accent">Contact us</Link>.</p>}
      <div className="space-y-12">
        {groups.map((g) => (
          <div key={g}>
            <h3 className="mb-4 text-xl font-bold text-ink">{GROUP_LABELS[g]}</h3>
            <ul className="divide-y divide-line overflow-hidden rounded-md bg-white ring-1 ring-line">
              {downloads.filter((d) => d.group === g).map((d) => (
                <li key={d._id} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <span className="grid size-12 shrink-0 place-items-center rounded bg-accent-50 text-accent">
                      <FileText className="size-6" />
                    </span>
                    <div>
                      <p className="font-semibold text-ink">{d.title}</p>
                      <p className="text-sm text-steel-500">
                        {[d.ext?.toUpperCase(), formatBytes(d.size), d.description].filter(Boolean).join(" · ")}
                      </p>
                    </div>
                  </div>
                  {d.fileUrl && (
                    <a href={`${d.fileUrl}?dl=`} className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-ink/15 px-4 text-sm font-semibold text-ink transition hover:border-accent hover:bg-accent hover:text-white">
                      <Download className="size-4" /> Download
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Section>
  );
}

export function JobsBlock({ block }: { block: Block }) {
  const jobs: Block[] = block.jobs || [];
  return (
    <Section block={block}>
      {jobs.length ? (
        <div className="space-y-4">
          {jobs.map((j) => (
            <details key={j._id} className="group rounded-md bg-white ring-1 ring-line open:shadow-card">
              <summary className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-lg font-bold text-ink group-hover:text-accent">{j.title}</h3>
                  <p className="mt-1.5 flex flex-wrap gap-x-5 gap-y-1 text-sm text-steel-500">
                    {j.department && <span className="flex items-center gap-1.5"><Briefcase className="size-3.5" /> {j.department}</span>}
                    {j.location && <span className="flex items-center gap-1.5"><MapPin className="size-3.5" /> {j.location}</span>}
                    {j.experience && <span className="flex items-center gap-1.5"><Clock className="size-3.5" /> {j.experience}</span>}
                    {j.employmentType && <span>{j.employmentType}</span>}
                  </p>
                </div>
                <span className="acc-icon grid size-9 shrink-0 place-items-center rounded-full bg-surface text-accent transition-transform"><Plus className="size-4" /></span>
              </summary>
              <div className="border-t border-line px-6 pb-6 pt-5">
                <RichText value={j.description} />
                <a href="#apply" className="mt-6 inline-flex h-11 items-center gap-2 rounded-md bg-accent px-5 text-sm font-semibold text-white hover:bg-accent-600">
                  Apply for this role <ArrowUpRight className="size-4" />
                </a>
              </div>
            </details>
          ))}
        </div>
      ) : (
        <div className="rounded-md border border-dashed border-steel-300 bg-surface p-8 text-center">
          <Briefcase className="mx-auto size-8 text-steel-400" />
          <p className="mt-3 text-steel-600">{block.emptyText || "There are no open positions right now, but we're always happy to hear from skilled people. Send us your CV using the form below."}</p>
        </div>
      )}
    </Section>
  );
}

export function IndustryTile({ ind, index }: { ind: Block; index: number }) {
  return (
    <Reveal delay={(index % 3) * 80} className="h-full">
      <Link href={`/industries/${ind.slug}`} className="group relative flex h-full min-h-[340px] flex-col justify-end overflow-hidden rounded-md bg-navy-900 p-7 text-white">
        {ind.image?.asset && (
          <SanityImg image={ind.image} fill sizes="(min-width:1024px) 33vw, 100vw" className="object-cover opacity-45 transition duration-700 group-hover:scale-105 group-hover:opacity-35" />
        )}
        <div className="corrugated absolute inset-0" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/50 to-transparent" />
        <span className="absolute left-7 top-7 grid size-14 place-items-center rounded-md bg-accent text-white transition group-hover:scale-110">
          <Icon name={ind.icon} className="size-7" />
        </span>
        <div className="relative">
          <h3 className="text-2xl font-bold">{ind.title}</h3>
          {ind.shortDescription && <p className="mt-2 text-steel-300">{ind.shortDescription}</p>}
          <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-accent">
            Explore solutions <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </span>
        </div>
      </Link>
    </Reveal>
  );
}

export function IndustriesBlock({ block }: { block: Block }) {
  const industries: Block[] = block.industries || [];
  return (
    <Section block={block}>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {industries.map((ind, i) => (
          <IndustryTile key={ind._id} ind={ind} index={i} />
        ))}
      </div>
    </Section>
  );
}

export async function ContactInfoBlock({ block }: { block: Block }) {
  const s = await getSettings();
  const wa = whatsappHref(s.whatsappNumber, s.whatsappMessage);
  const addresses = s.addresses || [];
  const map = addresses.find((a) => a.mapEmbedUrl);

  const card = "flex flex-col rounded-md bg-white p-6 ring-1 ring-line";
  return (
    <Section block={block}>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className={card}>
          <Phone className="size-6 text-accent" />
          <h3 className="mt-4 font-bold text-ink">Call us</h3>
          {(s.phones || []).map((p) => (
            <a key={p} href={telHref(p)} className="mt-1 text-steel-600 hover:text-accent">{p}</a>
          ))}
        </div>
        <div className={card}>
          <Mail className="size-6 text-accent" />
          <h3 className="mt-4 font-bold text-ink">Email</h3>
          {[s.email, s.salesEmail].filter(Boolean).map((e) => (
            <a key={e} href={`mailto:${e}`} className="mt-1 break-all text-steel-600 hover:text-accent">{e}</a>
          ))}
        </div>
        <div className={card}>
          <WhatsAppIcon className="size-6 text-whatsapp" />
          <h3 className="mt-4 font-bold text-ink">WhatsApp</h3>
          <p className="mt-1 text-steel-600">Quick answers from our sales team.</p>
          {wa && <a href={wa} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-accent">Start chat <ArrowUpRight className="size-4" /></a>}
        </div>
        <div className={card}>
          <Clock className="size-6 text-accent" />
          <h3 className="mt-4 font-bold text-ink">Business hours</h3>
          <p className="mt-1 text-steel-600">{s.businessHours || "Mon–Sat"}</p>
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-5">
          {addresses.map((a) => (
            <div key={a._key} className="flex gap-4 rounded-md bg-white p-6 ring-1 ring-line">
              <MapPin className="mt-0.5 size-6 shrink-0 text-accent" />
              <div>
                <h3 className="font-bold text-ink">{a.label || "Address"}</h3>
                <p className="mt-1 whitespace-pre-line text-steel-600">{a.address}</p>
                {a.directionsUrl && (
                  <a href={a.directionsUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-accent">
                    Get directions <ArrowUpRight className="size-4" />
                  </a>
                )}
              </div>
            </div>
          ))}
          {block.exportNote && (
            <div className="relative overflow-hidden rounded-md bg-navy-900 p-6 text-white">
              <div className="corrugated absolute inset-0" />
              <div className="relative flex gap-4">
                <Globe className="mt-0.5 size-6 shrink-0 text-accent" />
                <div>
                  <h3 className="font-bold">Export enquiries</h3>
                  <p className="mt-1 text-steel-300">{block.exportNote}</p>
                </div>
              </div>
            </div>
          )}
        </div>
        {block.showMap !== false && map?.mapEmbedUrl && (
          <div className="min-h-[360px] overflow-hidden rounded-md ring-1 ring-line">
            <iframe src={map.mapEmbedUrl} title={`Map: ${map.label || s.siteName}`} loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="size-full min-h-[360px] border-0 grayscale-[30%]" allowFullScreen />
          </div>
        )}
      </div>
    </Section>
  );
}
