import { Check } from "lucide-react";
import { SanityImg } from "@/components/ui/SanityImg";
import { RichText } from "@/components/ui/RichText";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { CmsButtons } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { VideoButton } from "./VideoButton";
import { bgClass } from "@/lib/utils";
import type { Block } from "@/lib/types";

export function SplitContent({ block }: { block: Block }) {
  const dark = block.background === "dark";
  const imageLeft = block.imagePosition === "left";
  const hasImage = Boolean(block.image?.asset);

  return (
    <section id={block.sectionId || undefined} className={`section ${bgClass(block.background)} ${dark ? "corrugated" : ""}`}>
      <div className={`wrap grid items-center gap-12 lg:gap-20 ${hasImage ? "lg:grid-cols-2" : ""}`}>
        <div className={imageLeft ? "lg:order-2" : ""}>
          <SectionHeading eyebrow={block.eyebrow} heading={block.heading} intro={block.intro} dark={dark} />
          <Reveal delay={100}>
            <RichText value={block.body} dark={dark} className="mt-6" />
            {!!block.bullets?.length && (
              <ul className="mt-8 grid gap-x-6 gap-y-3.5 sm:grid-cols-2">
                {block.bullets.map((b: string, i: number) => (
                  <li key={i} className={`flex gap-3 text-[0.95rem] font-medium ${dark ? "text-white" : "text-ink"}`}>
                    <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-sm bg-accent text-white">
                      <Check className="size-3.5" strokeWidth={3} />
                    </span>
                    {b}
                  </li>
                ))}
              </ul>
            )}
            <CmsButtons buttons={block.buttons} dark={dark} className="mt-10" />
          </Reveal>
        </div>

        {hasImage && (
          <Reveal className={`relative ${imageLeft ? "lg:order-1" : ""}`} delay={150}>
            <div className={`absolute -bottom-4 size-40 bg-accent sm:-bottom-5 sm:size-56 ${imageLeft ? "-left-4 sm:-left-5" : "-right-4 sm:-right-5"}`} />
            <div className={`absolute -top-4 size-32 corrugated-dark sm:-top-5 ${imageLeft ? "-right-4 sm:-right-5" : "-left-4 sm:-left-5"} ${dark ? "opacity-30" : ""}`} />
            <div className="relative aspect-[4/3.4] overflow-hidden rounded-md shadow-lift">
              <SanityImg image={block.image} fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
              {block.videoUrl && (
                <div className="absolute inset-0 grid place-items-center bg-ink/25">
                  <VideoButton url={block.videoUrl} label={block.heading} className="relative" />
                </div>
              )}
            </div>
            {block.secondaryImage?.asset && (
              <div className={`absolute -bottom-10 hidden w-[42%] overflow-hidden rounded-md border-[6px] border-white shadow-lift sm:block ${imageLeft ? "-right-6" : "-left-6"}`}>
                <SanityImg image={block.secondaryImage} aspect={1} sizes="300px" className="w-full" />
              </div>
            )}
            {block.badge?.value && (
              <div className={`absolute top-8 rounded-md bg-navy-900 px-6 py-5 text-white shadow-lift ${imageLeft ? "-right-3 sm:-right-8" : "-left-3 sm:-left-8"}`}>
                <p className="font-display text-4xl font-extrabold leading-none text-accent">{block.badge.value}</p>
                <p className="mt-2 max-w-[9rem] text-sm leading-snug text-steel-300">{block.badge.label}</p>
              </div>
            )}
          </Reveal>
        )}
      </div>
    </section>
  );
}
