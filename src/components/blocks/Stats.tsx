import { Counter } from "@/components/ui/Counter";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { headingTag } from "@/lib/headings";
import type { Block } from "@/lib/types";

export function Stats({ block }: { block: Block }) {
  const light = block.background === "white" || block.background === "light";
  const stats: Block[] = block.stats || [];
  return (
    <section id={block.sectionId || undefined} className={`relative overflow-hidden ${light ? (block.background === "light" ? "bg-surface" : "bg-white") : "corrugated bg-navy-900"}`}>
      <div className="wrap py-16 lg:py-20">
        {(block.heading || block.eyebrow) && (
          <SectionHeading as={headingTag(block.headingTag)} eyebrow={block.eyebrow} heading={block.heading} intro={block.intro} dark={!light} align="center" className="mb-12" />
        )}
        <dl className={`grid grid-cols-2 ${stats.length === 3 ? "lg:grid-cols-3" : "lg:grid-cols-4"}`}>
          {stats.map((s, i) => (
            <div
              key={s._key}
              className={`px-4 py-6 text-center sm:px-8 ${i % 2 ? "border-l" : ""} ${i >= 2 ? "border-t lg:border-t-0" : ""} ${i > 0 ? "lg:border-l" : ""} ${
                light ? "border-line" : "border-white/10"
              }`}
            >
              <dd className={`font-display text-5xl font-extrabold tracking-tight sm:text-6xl ${light ? "text-ink" : "text-white"}`}>
                <Counter value={s.value} prefix={s.prefix} />
                <span className="text-accent">{s.suffix}</span>
              </dd>
              <dt className={`mt-3 text-sm font-medium uppercase tracking-[0.12em] ${light ? "text-steel-500" : "text-steel-300"}`}>{s.label}</dt>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
