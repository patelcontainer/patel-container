import { Check } from "lucide-react";
import { Section } from "./Section";
import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/Reveal";
import { SanityImg } from "@/components/ui/SanityImg";
import type { Block } from "@/lib/types";

const cols: Record<number, string> = {
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-2 lg:grid-cols-3",
  4: "sm:grid-cols-2 xl:grid-cols-4",
};

export function FeatureGrid({ block }: { block: Block }) {
  const dark = block.background === "dark";
  const items: Block[] = block.items || [];
  const variant = block.variant || "cards";
  const grid = cols[block.columns || 3] || cols[3];

  if (variant === "list") {
    return (
      <Section block={block}>
        <ul className={`grid gap-x-8 gap-y-4 ${grid}`}>
          {items.map((it, i) => (
            <Reveal as="li" key={it._key} delay={(i % 4) * 60} className={`flex gap-3 border-b pb-4 ${dark ? "border-white/10" : "border-line"}`}>
              <Check className="mt-0.5 size-5 shrink-0 text-accent" strokeWidth={2.5} />
              <div>
                <p className={`font-semibold ${dark ? "text-white" : "text-ink"}`}>{it.title}</p>
                {it.text && <p className={`mt-1 text-sm ${dark ? "text-steel-400" : "text-steel-500"}`}>{it.text}</p>}
              </div>
            </Reveal>
          ))}
        </ul>
      </Section>
    );
  }

  if (variant === "images") {
    return (
      <Section block={block}>
        <div className={`grid gap-6 ${grid}`}>
          {items.map((it, i) => (
            <Reveal key={it._key} delay={(i % 4) * 80} className="group overflow-hidden rounded-md bg-white shadow-card ring-1 ring-line">
              <div className="relative aspect-[4/3] overflow-hidden bg-navy-800">
                {it.image?.asset ? (
                  <SanityImg image={it.image} fill sizes="(min-width:1024px) 33vw, 100vw" className="object-cover transition duration-700 group-hover:scale-105" />
                ) : (
                  <div className="corrugated grid size-full place-items-center">
                    <Icon name={it.icon} className="size-14 text-accent" />
                  </div>
                )}
              </div>
              <div className="p-6">
                <h3 className="text-lg font-bold text-ink">{it.title}</h3>
                {it.text && <p className="mt-2 text-[0.95rem] leading-relaxed text-steel-600">{it.text}</p>}
              </div>
            </Reveal>
          ))}
        </div>
      </Section>
    );
  }

  return (
    <Section block={block}>
      <div className={`grid gap-px overflow-hidden rounded-md ${dark ? "bg-white/10" : "bg-line ring-1 ring-line"} ${grid}`}>
        {items.map((it, i) => (
          <Reveal
            key={it._key}
            delay={(i % 4) * 70}
            className={`group relative p-8 transition-colors duration-300 lg:p-10 ${dark ? "bg-navy-900 hover:bg-navy-800" : "bg-white hover:bg-surface"}`}
          >
            <span className="absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 bg-accent transition-transform duration-500 group-hover:scale-x-100" />
            {variant === "numbered" ? (
              <span className="font-display text-5xl font-extrabold text-accent">{String(i + 1).padStart(2, "0")}</span>
            ) : (
              <span
                className={`grid size-14 place-items-center rounded-md transition-colors duration-300 group-hover:bg-accent group-hover:text-white ${
                  dark ? "bg-white/5 text-accent" : "bg-accent-50 text-accent"
                }`}
              >
                <Icon name={it.icon} className="size-7" />
              </span>
            )}
            <h3 className={`mt-6 text-xl font-bold leading-snug ${dark ? "text-white" : "text-ink"}`}>{it.title}</h3>
            {it.text && <p className={`mt-3 leading-relaxed ${dark ? "text-steel-400" : "text-steel-600"}`}>{it.text}</p>}
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
