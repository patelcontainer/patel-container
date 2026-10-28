"use client";

import { useEffect, useState } from "react";
import { SanityImg } from "@/components/ui/SanityImg";
import { CmsButtons } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import type { Block } from "@/lib/types";

export function Hero({ block }: { block: Block }) {
  const images = block.images || [];
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (images.length < 2) return;
    const t = setInterval(() => setActive((i) => (i + 1) % images.length), 7000);
    return () => clearInterval(t);
  }, [images.length]);

  return (
    <section className="relative isolate flex min-h-[640px] flex-col overflow-hidden bg-navy-950 lg:min-h-[min(calc(100svh-124px),920px)]">
      {/* Background */}
      <div className="absolute inset-0 -z-20">
        {images.map((img: Block, i: number) => (
          <div key={img._key || i} className={`absolute inset-0 transition-opacity duration-[1500ms] ${i === active ? "opacity-100" : "opacity-0"}`}>
            <div key={i === active ? `on-${active}` : "off"} className="absolute inset-0 animate-kenburns">
              <SanityImg image={img} fill priority={i === 0} eager sizes="100vw" className="object-cover" />
            </div>
          </div>
        ))}
        {block.videoUrl && (
          <video className="absolute inset-0 size-full object-cover" src={block.videoUrl} autoPlay muted loop playsInline aria-hidden />
        )}
      </div>
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-navy-950/95 via-navy-950/75 to-navy-950/20" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-navy-950/90 via-transparent to-transparent" />
      <div className="grid-lines absolute inset-0 -z-10 opacity-40 [mask-image:linear-gradient(to_right,black,transparent_70%)]" />

      <div className="wrap flex flex-1 flex-col justify-center py-16 sm:py-20 lg:py-20 2xl:py-24">
        <div className="max-w-3xl">
          {block.eyebrow && (
            <p className="eyebrow">
              {block.eyebrow}
            </p>
          )}
          <h1 className="mt-5 text-[2.5rem] font-extrabold leading-[1.05] tracking-[-0.02em] text-white sm:text-6xl lg:text-[4rem] 2xl:text-[4.75rem] min-[1700px]:text-[5.25rem] [@media(max-height:820px)_and_(min-width:1024px)]:text-[3.6rem]">
            {block.heading}
          </h1>
          {block.subheading && <p className="mt-6 max-w-xl text-lg leading-relaxed text-steel-300 2xl:text-xl">{block.subheading}</p>}
          <CmsButtons buttons={block.buttons} dark size="lg" className="mt-8 2xl:mt-10" />
        </div>

        {images.length > 1 && (
          <div className="mt-10 flex gap-2 2xl:mt-12" role="tablist" aria-label="Hero slides">
            {images.map((_: unknown, i: number) => (
              <button
                key={i}
                type="button"
                onClick={() => setActive(i)}
                aria-label={`Show slide ${i + 1}`}
                aria-selected={i === active}
                role="tab"
                className={`h-1 rounded-full transition-all ${i === active ? "w-10 bg-accent" : "w-5 bg-white/30 hover:bg-white/60"}`}
              />
            ))}
          </div>
        )}
      </div>

      {!!block.highlights?.length && (
        <div className="relative border-t border-white/10 bg-navy-950/70 backdrop-blur-md">
          <div className="wrap grid grid-cols-2 lg:grid-cols-4">
            {block.highlights.map((h: Block, i: number) => (
              <div
                key={h._key}
                className={`flex items-center gap-4 py-5 lg:py-7 ${i % 2 ? "pl-4 sm:pl-6" : "pr-4"} ${i > 0 ? "lg:border-l lg:border-white/10 lg:pl-8" : ""} ${
                  i >= 2 ? "border-t border-white/10 lg:border-t-0" : ""
                }`}
              >
                <Icon name={h.icon} className="size-8 shrink-0 text-accent" />
                <div>
                  <p className="text-sm font-semibold leading-snug text-white sm:text-base">{h.title}</p>
                  {h.text && <p className="mt-0.5 hidden text-[0.8rem] text-steel-400 sm:block">{h.text}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
